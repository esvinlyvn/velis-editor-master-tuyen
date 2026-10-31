// 5 mẫu cảnh bản đồ → "kế hoạch" chung (plan) cho runtime.js. Mỗi mẫu chỉ sinh camera + các lớp; mọi trường có thể
// ghi đè hoặc thêm bằng tay trong file cảnh (camera, labels, pins, places, areas, routes). Xem MAP.md mục 2.
import fs from "node:fs";
import path from "node:path";
import { circle, cumulative, bboxOf, allCoords, fit, pxDist, areaFromMap, dist } from "./geo.mjs";
import { roadPath } from "./route.mjs";
import { makeTimer } from "./timing.mjs";
import { accentFor, STYLES } from "./styles.mjs";
import { THEMES, PRESET } from "../../text-presets/presets.mjs";
import { khong } from "../../text-presets/duyet.mjs";

export const TEMPLATES = ["fly", "route", "area", "tour", "compare", "free"];
export const W = 1080, H = 1920;
// vùng an toàn chữ (DAC-TA-CHU 5.1): x 60–1020, y 200–1320 → tâm điểm nhìn đặt ở y 760 thay vì giữa khung
export const SAFE = { x0: 60, x1: 1020, y0: 200, y1: 1320 };
const FOCUS_Y = 760;
const FIT_H = SAFE.y1 - SAFE.y0; // fit vùng vào dải 1120 px quanh tâm điểm nhìn
// Repo có danh sách preset người dùng đã duyệt (lib/presets-duyet.json, như bds-editor) thì nhãn chỉ dùng preset được duyệt;
// mặc định e-label bị duyệt "không dùng" thì đổi sang b-location. Repo không có file này: giữ nguyên như cũ.
export const LABEL_PRESET = ["e-label", "b-location"].find((p) => !khong("chung", p));

const r3 = (n) => +(+n).toFixed(3);

/** Đọc file cảnh → plan. file: đường dẫn JSON; root: thư mục repo. */
export function buildPlan(file, root) {
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  const dir = path.dirname(path.resolve(file));
  const resolveFile = (p) => [path.resolve(dir, p), path.resolve(root, p)].find((f) => fs.existsSync(f)) ?? (() => { throw new Error(`Không thấy file "${p}" (tìm cạnh file cảnh và từ gốc repo)`); })();
  if (!TEMPLATES.includes(cfg.template)) throw new Error(`template phải là: ${TEMPLATES.join(", ")}`);
  const style = cfg.style ?? "dark";
  if (!STYLES.includes(style)) throw new Error(`style phải là: ${STYLES.join(", ")}`);
  const theme = cfg.theme ?? "neon";
  if (!THEMES[theme]) throw new Error(`theme phải là: ${Object.keys(THEMES).join(", ")}`);
  if (!cfg.region) throw new Error(`Thiếu "region" (tên file work/map/<region>.pmtiles)`);
  const at = makeTimer(cfg.transcript ? resolveFile(cfg.transcript) : null, cfg.start ?? 0);
  const pts = cfg.points ?? {};
  const pt = (ref) => {
    if (Array.isArray(ref)) return ref;
    const v = pts[ref];
    if (!v) throw new Error(`Điểm "${ref}" chưa khai báo trong "points"`);
    return Array.isArray(v) ? v : v.ll;
  };
  const ctx = { cfg, at, pt, resolveFile, region: cfg.region, style, theme, accent: { ...accentFor(style, theme), ...(cfg.skin?.accent ?? {}) }, warn: [] };
  const plan = {
    name: cfg.name ?? path.basename(file, ".json"),
    fps: cfg.fps ?? 30, style, theme, region: cfg.region, accent: ctx.accent, size: [W, H],
    scaleBar: !!cfg.scaleBar, crisp: !!cfg.crisp, skin: cfg.skin ?? null, ...(cfg.skin?.crispBg ? { crispBg: cfg.skin.crispBg } : {}), start: at.start, movers: [], views: [], pins: [], labels: [], places: [], tags: [], dividers: [], sfx: [], warn: ctx.warn,
  };
  const tpl = { fly, route, area, tour, compare, free }[cfg.template](ctx, plan);
  plan.duration = r3(cfg.duration !== undefined ? at(cfg.duration) : tpl.duration);
  if (!(plan.duration > 0)) throw new Error("duration không hợp lệ");
  extras(ctx, plan);
  // camera do người dựng khai báo thay hẳn camera của mẫu (view đầu tiên)
  if (cfg.camera) plan.views[0].camera = cfg.camera.map((k) => ({ ...k, t: at(k.t), center: pt(k.center) }));
  for (const v of plan.views) addDips(v);
  for (const l of plan.labels) if (!PRESET[l.preset]) throw new Error(`Không có text preset "${l.preset}"`);
  for (const l of plan.labels) if (khong("chung", l.preset)) throw new Error(`Nhãn dùng preset "${l.preset}" mà người dùng đã duyệt "không dùng" (lib/presets-duyet.json)`);
  plan.views.forEach((v) => v.camera.sort((a, b) => a.t - b.t));
  return plan;
}

// ---------- phần dùng chung ----------
function newView(plan, rect = [0, 0, W, H], focusY = FOCUS_Y) {
  const v = { id: `v${plan.views.length}`, rect, focusY, camera: [], lines: [], fills: [], dim: null, scaleBar: !!plan.scaleBar };
  plan.views.push(v);
  return v;
}
// bay xa: zoom "vồng" ra giữa chừng (kiểu flyTo) để người xem thấy đường đi
function addDips(v) {
  for (let i = 1; i < v.camera.length; i++) {
    const a = v.camera[i - 1], b = v.camera[i];
    if (b.dip !== undefined) continue;
    const z = Math.min(a.zoom, b.zoom), d = pxDist(a.center, b.center, z);
    b.dip = d > v.rect[2] * 0.9 ? r3(Math.min(2.5, Math.log2(d / (v.rect[2] * 0.9)) + 0.3)) : 0;
  }
}
function line(view, id, coords, t0, t1, o = {}) {
  view.lines.push({ id, coords, cum: cumulative(coords).map((x) => Math.round(x)), t0: r3(t0), t1: r3(t1), width: o.width ?? 9, planned: !!o.planned, head: o.head ?? true, kind: o.kind ?? "route",
    color: o.color ?? null, glow: o.glow ?? o.color ?? null, out: o.out ?? null, pulse: o.pulse ?? [], fade: o.fade ?? [], wall: o.wall ?? null });
}
function outline(view, id, geom, t0, t1) {
  const ring = geom.type === "Polygon" ? geom.coordinates[0] : geom.coordinates[0][0];
  line(view, id, ring, t0, t1, { width: 5, head: false, kind: "outline" });
}
function fillArea(view, id, geom, t0, t1, opacity = 0.2) { view.fills.push({ id, geometry: geom, t0: r3(t0), t1: r3(t1), opacity }); }
function dimAround(view, center, km, t0, t1, amount = 0.8) {
  const steps = 20, r0 = km, r1 = km * 1.9;
  const world = [[center[0] - 40, center[1] - 40], [center[0] + 40, center[1] - 40], [center[0] + 40, center[1] + 40], [center[0] - 40, center[1] + 40], [center[0] - 40, center[1] - 40]];
  view.dim = { t0: r3(t0), t1: r3(t1), amount, steps, features: Array.from({ length: steps }, (_, k) => ({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [world, circle(center, r0 + ((r1 - r0) * k) / (steps - 1), 96).coordinates[0].reverse()] } })) };
}
// km ứng với một phần bề rộng khung ở zoom z
const kmAcross = (lat, z, frac = 1) => (((40075.017 * Math.cos((lat * Math.PI) / 180)) / (512 * 2 ** z)) * W * frac);

function pin(plan, view, ll, t, o = {}) {
  plan.pins.push({ id: `p${plan.pins.length}`, view: view.id, ll, at: r3(t), ping: o.ping ?? true });
  plan.sfx.push({ at: r3(t), name: "pin-drop", vol: 0.55, why: "ghim" });
}
function label(ctx, plan, view, spec, t, dflt = {}) {
  if (!spec) return;
  const s = typeof spec === "string" || Array.isArray(spec) ? { texts: [].concat(spec) } : spec;
  if (!s.texts?.length) throw new Error(`Nhãn thiếu "texts": ${JSON.stringify(spec)}`);
  const ll = s.point ? ctx.pt(s.point) : dflt.ll;
  plan.labels.push({
    id: `l${plan.labels.length}`, view: view.id, ll: s.pos ? null : ll, pos: s.pos ?? null,
    at: r3(ctx.at(s.at, t)), hold: s.hold !== undefined ? s.hold : dflt.hold != null ? r3(dflt.hold) : null,
    preset: s.preset ?? ctx.cfg.labelPreset ?? LABEL_PRESET, texts: s.texts, scale: s.scale ?? ctx.cfg.labelScale ?? 0.74,
    place: s.place ?? dflt.place ?? "above", gap: s.gap ?? dflt.gap ?? 100, stem: s.stem ?? dflt.stem ?? true,
  });
}
function place(ctx, plan, view, p, t0, t1) {
  plan.places.push({ id: `n${plan.places.length}`, view: view.id, ll: ctx.pt(p.point), text: p.text, at: r3(ctx.at(p.at, t0)), out: p.out !== undefined ? r3(ctx.at(p.out)) : t1 !== undefined ? r3(t1) : null });
}
function geomOf(ctx, a) {
  if (a.geojson) {
    const g = JSON.parse(fs.readFileSync(ctx.resolveFile(a.geojson), "utf8"));
    const f = g.type === "FeatureCollection" ? g.features[0] : g;
    return f.type === "Feature" ? f.geometry : f;
  }
  if (a.circle) return circle(ctx.pt(a.circle.center), a.circle.km);
  if (a.fromMap) return areaFromMap(ctx.region, { ...a.fromMap, near: ctx.pt(a.fromMap.near) });
  if (a.bbox) { const [w, s, e, n] = a.bbox; return { type: "Polygon", coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] }; }
  throw new Error(`Vùng cần một trong: geojson, circle, fromMap, bbox — ${JSON.stringify(a)}`);
}
const centroid = (g) => { const c = allCoords(g); const b = bboxOf(c); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; };
const fitCam = (b, pad = 130, h = FIT_H) => fit(b, W, h, pad);

/** Tuyến: geojson > via > auto (MAP.md mục 3). */
function resolveRoute(ctx, r) {
  if (r.geojson) {
    const [file, fid] = r.geojson.split("#");
    const g = JSON.parse(fs.readFileSync(ctx.resolveFile(file), "utf8"));
    const f = g.type === "FeatureCollection" ? (fid ? g.features.find((x) => x.properties?.id === fid) : g.features[0]) : g;
    if (!f) throw new Error(`Không có feature id "${fid}" trong ${file}`);
    const geom = f.type === "Feature" ? f.geometry : f;
    const coords = geom.type === "MultiLineString" ? geom.coordinates.flat() : geom.coordinates;
    return { coords, planned: r.planned ?? f.properties?.planned ?? true };
  }
  if (r.via) {
    const via = r.via.map(ctx.pt);
    if (via.length < 2) throw new Error("via cần ít nhất 2 điểm");
    if ((r.follow ?? "line") === "line") return { coords: via, planned: !!r.planned };
    const coords = [];
    for (let i = 1; i < via.length; i++) {
      const leg = roadPath(ctx.region, via[i - 1], via[i]);
      if (leg.snapEnd > 300 || leg.snapStart > 300) ctx.warn.push(`đoạn ${i}: điểm via cách đường gần nhất ${Math.round(Math.max(leg.snapStart, leg.snapEnd))} m`);
      coords.push(...(i > 1 ? leg.coords.slice(1) : leg.coords));
    }
    return { coords, planned: !!r.planned };
  }
  if (r.auto) {
    const a = ctx.pt(r.auto.from), b = ctx.pt(r.auto.to);
    const leg = roadPath(ctx.region, a, b);
    ctx.warn.push(`tuyến tự tìm (dự phòng): ${(cumulative(leg.coords).at(-1) / 1000).toFixed(1)} km, dừng cách đích ${Math.round(leg.snapEnd)} m — nên thay bằng "via" do người dựng chỉ định`);
    return { coords: leg.coords, planned: !!r.planned };
  }
  throw new Error(`route cần một trong: geojson, via, auto`);
}

// ---------- 1. fly: bay tới điểm ----------
function fly(ctx, plan) {
  const { cfg, at, pt } = ctx;
  const v = newView(plan);
  const target = pt(cfg.target);
  const z1 = cfg.zoom ?? 13;
  const wide = { center: cfg.wide?.center ? pt(cfg.wide.center) : target, zoom: cfg.wide?.zoom ?? z1 - 4 };
  const flyAt = at(cfg.flyAt, 0.8), flyDur = cfg.flyDur ?? 3.2, arrive = flyAt + flyDur;
  const D = cfg.duration !== undefined ? at(cfg.duration) : arrive + 2.6;
  const b = cfg.bearing ?? 0, p = cfg.pitch ?? 0;
  v.camera = [
    { t: 0, center: wide.center, zoom: wide.zoom, bearing: 0, pitch: 0 },
    { t: flyAt, center: wide.center, zoom: wide.zoom + 0.12, bearing: 0, pitch: 0 },
    { t: arrive, center: target, zoom: z1, bearing: b, pitch: p },
    { t: D, center: target, zoom: z1 + 0.18, bearing: b - 3, pitch: p },
  ];
  plan.sfx.push({ at: r3(flyAt), name: "whoosh-soft", vol: 0.5, why: "camera bay" });
  if (cfg.dim !== false) dimAround(v, target, cfg.dim?.km ?? kmAcross(target[1], z1, 0.3), arrive - 1.3, arrive + 0.3, cfg.dim?.amount);
  let t = arrive;
  if (cfg.area) {
    const g = geomOf(ctx, cfg.area), a0 = at(cfg.area.at, arrive - 0.2);
    outline(v, "fly-area", g, a0, a0 + 0.9);
    fillArea(v, "fly-area", g, a0 + 0.4, a0 + 1.0, cfg.area.opacity);
    plan.sfx.push({ at: r3(a0), name: "line-draw", vol: 0.45, why: "viền vùng" });
    t = a0 + 0.6;
  }
  if (cfg.pin !== false) pin(plan, v, target, at(cfg.pinAt, arrive - 0.25));
  label(ctx, plan, v, cfg.label, t, { ll: target });
  for (const p2 of cfg.places ?? []) place(ctx, plan, v, p2, 0.3, flyAt + flyDur * 0.45);
  return { duration: D };
}

// ---------- 2. route: vẽ tuyến ----------
function route(ctx, plan) {
  const { cfg, at, pt } = ctx;
  const v = newView(plan);
  const R = resolveRoute(ctx, cfg.route ?? {});
  const coords = R.coords, from = cfg.from ? pt(cfg.from) : coords[0], to = cfg.to ? pt(cfg.to) : coords.at(-1);
  const rb = bboxOf(coords.concat([from, to]));
  const f = fitCam(rb, 150);
  // drawEnd (vd. "@2:Long Thành"): tuyến chạy tới đích đúng lúc người nói nhắc tên điểm cuối
  const drawAt = at(cfg.drawAt, 1.2), drawEnd = cfg.drawEnd !== undefined ? at(cfg.drawEnd) : drawAt + (cfg.drawDur ?? 3.6), drawDur = drawEnd - drawAt;
  if (!(drawDur > 0)) throw new Error("drawEnd phải sau drawAt");
  const end = cfg.end ?? "to";
  const endZoom = cfg.endZoom ?? Math.max(f.zoom + 1.6, 12);
  const D = cfg.duration !== undefined ? at(cfg.duration) : end === "to" ? drawEnd + 3.4 : drawEnd + 2.2;
  const b = cfg.bearing ?? 0;
  v.camera = [
    { t: 0, center: f.center, zoom: f.zoom - 0.9, bearing: 0 },
    { t: drawAt, center: f.center, zoom: f.zoom - 0.25, bearing: 0 },
    { t: drawEnd, center: f.center, zoom: f.zoom, bearing: b * 0.5 },
  ];
  if (end === "to") v.camera.push({ t: drawEnd + 2.2, center: to, zoom: endZoom, bearing: b }, { t: D, center: to, zoom: endZoom + 0.12, bearing: b - 2 });
  else v.camera.push({ t: D, center: f.center, zoom: f.zoom + 0.15, bearing: b * 0.6 });
  line(v, "route", coords, drawAt, drawEnd, { planned: R.planned, width: cfg.route?.width });
  plan.sfx.push({ at: r3(drawAt), name: "line-draw", vol: 0.45, why: "tuyến bắt đầu chạy" });
  pin(plan, v, from, at(cfg.fromPinAt, drawAt - 0.3), { ping: false });
  pin(plan, v, to, at(cfg.toPinAt, drawEnd - 0.1));
  // nhãn điểm đầu ra trước khi nhãn điểm cuối vào (không 2 lockup cùng lúc)
  const toAt = end === "to" ? drawEnd + 1.4 : drawEnd;
  label(ctx, plan, v, cfg.fromLabel, drawAt - 0.3, { ll: from, hold: Math.max(1.6, drawDur * 0.6) });
  label(ctx, plan, v, cfg.toLabel, toAt, { ll: to });
  if (R.planned) {
    const mid = coords[Math.floor(coords.length / 2)];
    plan.tags.push({ id: `g${plan.tags.length}`, view: v.id, ll: cfg.route?.tagAt ? pt(cfg.route.tagAt) : mid, text: cfg.route?.tag ?? "DỰ KIẾN", at: r3(drawAt + drawDur * 0.55) });
  }
  if (end === "to" && cfg.dim !== false) dimAround(v, to, cfg.dim?.km ?? kmAcross(to[1], endZoom, 0.32), drawEnd + 0.3, drawEnd + 2.0, cfg.dim?.amount);
  for (const p2 of cfg.places ?? []) place(ctx, plan, v, p2, 0.3, drawEnd);
  if (cfg.area) {
    const g = geomOf(ctx, cfg.area), a0 = at(cfg.area.at, drawEnd + 0.8);
    outline(v, "route-area", g, a0, a0 + 0.9);
    fillArea(v, "route-area", g, a0 + 0.4, a0 + 1.0, cfg.area.opacity ?? 0.16);
  }
  plan.routeKm = r3(cumulative(coords).at(-1) / 1000); // chỉ in ra console để tham khảo, không tự hiện lên hình
  return { duration: D };
}

// ---------- 3. area: tô vùng / vòng bán kính ----------
function area(ctx, plan) {
  const { cfg, at, pt } = ctx;
  const v = newView(plan);
  const areas = (cfg.areas ?? []).map((a) => ({ ...a, geom: geomOf(ctx, a) }));
  if (!areas.length) throw new Error(`area cần "areas": [...]`);
  const all = areas.flatMap((a) => allCoords(a.geom));
  const f = cfg.zoom ? { center: pt(cfg.center), zoom: cfg.zoom } : fitCam(bboxOf(all), 140);
  const step = cfg.step ?? 1.5;
  areas.forEach((a, i) => (a.t = at(a.at, 0.9 + i * step)));
  const last = areas.at(-1).t;
  const D = cfg.duration !== undefined ? at(cfg.duration) : last + 2.8;
  v.camera = [
    { t: 0, center: f.center, zoom: f.zoom - 0.6, bearing: 0 },
    { t: Math.max(0.8, areas[0].t), center: f.center, zoom: f.zoom, bearing: 0 },
    { t: D, center: f.center, zoom: f.zoom + 0.2, bearing: cfg.bearing ?? -3 },
  ];
  areas.forEach((a, i) => {
    // nhãn: vòng tròn / có ghim → trên ghim ở tâm; vùng → ngay trên mép trên của vùng (không che vùng đang nói)
    const bb = bboxOf(allCoords(a.geom));
    const c = a.circle ? pt(a.circle.center) : a.pin ? pt(a.pin) : a.labelAt ? pt(a.labelAt) : [(bb[0] + bb[2]) / 2, bb[3]];
    const id = `area${i}`;
    outline(v, id, a.geom, a.t, a.t + (a.circle ? 1.1 : 0.9));
    fillArea(v, id, a.geom, a.t + 0.5, a.t + 1.1, a.opacity ?? (a.circle ? 0.12 : 0.22));
    plan.sfx.push({ at: r3(a.t), name: "line-draw", vol: 0.45, why: "viền vùng" });
    if (a.circle || a.pin) pin(plan, v, a.circle ? pt(a.circle.center) : pt(a.pin), at(a.pinAt, a.t - 0.25), { ping: false });
    const next = areas[i + 1];
    const pinned = !!(a.circle || a.pin);
    label(ctx, plan, v, a.label, a.t + 0.8, { ll: c, place: "above", gap: pinned ? 100 : 26, stem: pinned, hold: next ? next.t + 0.8 - (a.t + 0.8) : null });
  });
  if (cfg.dim && areas.length === 1) { const b = bboxOf(allCoords(areas[0].geom)); dimAround(v, centroid(areas[0].geom), Math.max(dist([b[0], b[1]], [b[2], b[3]]) / 2000, 0.3) * 1.15, areas[0].t, areas[0].t + 1.2, cfg.dim.amount); }
  for (const p2 of cfg.places ?? []) place(ctx, plan, v, p2, 0.3, D);
  return { duration: D };
}

// ---------- 4. tour: nối nhiều điểm, camera đi lần lượt ----------
function tour(ctx, plan) {
  const { cfg, at, pt } = ctx;
  const v = newView(plan);
  const stops = (cfg.stops ?? []).map((s) => ({ ...s, ll: pt(s.point) }));
  if (stops.length < 2) throw new Error("tour cần ít nhất 2 điểm dừng (stops)");
  const ov = fitCam(bboxOf(stops.map((s) => s.ll)), 170);
  const intro = cfg.intro ?? 1.2, travel = cfg.travel ?? 1.6, dwell = cfg.dwell ?? 1.9, z = cfg.zoom ?? Math.min(15, ov.zoom + 2.2);
  v.camera = [{ t: 0, center: ov.center, zoom: ov.zoom - 0.3, bearing: 0 }, { t: intro, center: ov.center, zoom: ov.zoom, bearing: 0 }];
  let t = intro;
  stops.forEach((s, k) => {
    // mốc đến từng điểm: theo lời thoại (s.at) nếu có, nếu không cách đều
    const arrive = s.at !== undefined ? at(s.at) : t + travel;
    const leave = arrive + (s.dwell ?? dwell);
    const zz = s.zoom ?? z;
    v.camera.push({ t: arrive, center: s.ll, zoom: zz, bearing: s.bearing ?? cfg.bearing ?? 0 }, { t: leave, center: s.ll, zoom: zz + 0.1, bearing: (s.bearing ?? cfg.bearing ?? 0) - 1.5 });
    if (k > 0 && cfg.connect !== false) {
      const prev = stops[k - 1].ll;
      const coords = cfg.follow === "roads" ? roadPath(ctx.region, prev, s.ll).coords : [prev, s.ll];
      line(v, `leg${k}`, coords, t, arrive - 0.15, { width: 7 });
    }
    plan.sfx.push({ at: r3(t), name: "whoosh-soft", vol: 0.42, why: `sang điểm ${k + 1}` });
    pin(plan, v, s.ll, arrive - 0.2);
    label(ctx, plan, v, s.label, arrive, { ll: s.ll, hold: s.dwell ?? dwell });
    s.arrive = arrive;
    t = leave;
  });
  let D;
  if (cfg.end !== "last") {
    v.camera.push({ t: t + travel, center: ov.center, zoom: ov.zoom, bearing: 0 });
    D = t + travel + 1.4;
    v.camera.push({ t: D, center: ov.center, zoom: ov.zoom + 0.1, bearing: 0 });
  } else D = t;
  for (const p2 of cfg.places ?? []) place(ctx, plan, v, p2, 0.2, intro + travel * 0.5);
  return { duration: cfg.duration !== undefined ? at(cfg.duration) : D };
}

// ---------- 5. compare: chia đôi khung trên / dưới ----------
// Mặc định hai nửa cùng tỷ lệ (cùng zoom, có thước km) để so được độ lớn thật; "sameScale": false cho mỗi nửa tự khớp khung.
function compare(ctx, plan) {
  const { cfg, at, pt } = ctx;
  const half = (H - 4) / 2;
  const D = cfg.duration !== undefined ? at(cfg.duration) : 7;
  const sides = ["a", "b"].map((k, i) => {
    const s = cfg[k];
    if (!s) throw new Error(`compare cần "a" và "b"`);
    const g = s.area ? geomOf(ctx, s.area) : null;
    const c = s.point ? pt(s.point) : centroid(g);
    const f = s.zoom ? { center: c, zoom: s.zoom } : g ? { ...fit(bboxOf(allCoords(g)), W, half * 0.62, 90), center: c } : { center: c, zoom: 13 };
    return { k, i, s, g, c, f };
  });
  if (cfg.sameScale !== false) { const z = Math.min(...sides.map((x) => x.f.zoom)); for (const x of sides) x.f.zoom = z; }
  for (const { k, i, s, g, c, f } of sides) {
    const rect = i === 0 ? [0, 0, W, half] : [0, half + 4, W, half];
    // tâm khu đặt hơi thấp trong khung con, chừa chỗ cho tên khu phía trên
    const v = newView(plan, rect, half * 0.6);
    if (cfg.sameScale !== false) v.scaleBar = true;
    const t0 = at(s.at, 0.5 + i * 0.7);
    const drift = cfg.sameScale !== false ? 0 : 0.1; // cùng tỷ lệ: không đẩy zoom, chỉ xoay nhẹ
    v.camera = [{ t: 0, center: f.center, zoom: f.zoom - (cfg.sameScale !== false ? 0 : 0.45), bearing: i ? 2 : -2 }, { t: D, center: f.center, zoom: f.zoom + drift, bearing: i ? -2 : 2 }];
    if (g) {
      outline(v, `cmp${k}`, g, t0, t0 + 0.9);
      fillArea(v, `cmp${k}`, g, t0 + 0.4, t0 + 1.0, s.area.opacity ?? 0.22);
      plan.sfx.push({ at: r3(t0), name: "line-draw", vol: 0.45, why: `viền khu ${k.toUpperCase()}` });
    }
    if (s.pin || !g) pin(plan, v, s.pin ? pt(s.pin) : c, t0 - 0.2, { ping: false });
    // tên khu: vị trí cố định trên khung con (trong vùng an toàn y 200–1320)
    label(ctx, plan, v, s.label, t0 + 0.3, { place: "pos", stem: false });
    const L = plan.labels.at(-1);
    if (L && L.view === v.id && !L.pos && !s.label?.point) { L.pos = [W / 2, i === 0 ? 236 : half + 4 + 46]; L.ll = null; }
  }
  plan.dividers.push({ y: half, at: 0.2 });
  return { duration: D };
}

// ---------- 6. free: tự khai báo camera + từng lớp (cảnh dài, bản đồ làm nền xuyên suốt) ----------
// "camera": [{t, center, zoom, bearing, pitch, ease}] bắt buộc. "lines": tuyến/đoạn có màu, nhấp nháy, mờ đi theo mốc lời thoại.
// "geojson": "file.geojson#id" chọn feature theo properties.id. "focusY": tâm điểm nhìn (mặc định 760).
function free(ctx, plan) {
  const { cfg, at, pt } = ctx;
  if (!cfg.camera?.length) throw new Error(`template "free" cần "camera": [...]`);
  const v = newView(plan, [0, 0, W, H], cfg.focusY ?? FOCUS_Y);
  v.camera = cfg.camera.map((k) => ({ ...k, t: at(k.t), center: pt(k.center) }));
  for (const [i, l] of (cfg.lines ?? []).entries()) {
    const R = resolveRoute(ctx, l);
    const t0 = at(l.at, 0), t1 = l.end !== undefined ? at(l.end) : t0 + (l.dur ?? 1.5);
    const span = (w) => ({ from: r3(at(w.from)), to: r3(at(w.to)) });
    line(v, l.id ?? `f${i}`, l.reverse ? [...R.coords].reverse() : R.coords, t0, t1, {
      planned: R.planned, width: l.width, head: l.head ?? false, color: l.color, glow: l.glow, out: l.out !== undefined ? r3(at(l.out)) : null,
      pulse: (l.pulse ?? []).map(span), fade: (l.fade ?? []).map((f) => ({ t: r3(at(f.at)), v: f.to, d: f.dur ?? 0.5 })),
      wall: l.wall ? { ...l.wall, riseAt: l.wall.riseAt !== undefined ? r3(at(l.wall.riseAt)) : null } : null,
    });
    // vật chạy theo đầu tuyến (xe tải, máy bay…): icon HTML, đặt theo toạ độ đầu tuyến từng khung
    if (l.mover) plan.movers.push({ id: `mv${plan.movers.length}`, view: v.id, line: l.id ?? `f${i}`, icon: l.mover.icon ?? "truck", color: l.mover.color ?? l.color ?? null });
    if (l.sfx) plan.sfx.push({ at: r3(t0), name: l.sfx, vol: 0.45, why: `vẽ ${l.id ?? i}` });
  }
  for (const g of cfg.tags ?? []) plan.tags.push({ id: `g${plan.tags.length}`, view: v.id, ll: pt(g.point), text: g.text, at: r3(at(g.at)), out: g.out !== undefined ? r3(at(g.out)) : null, color: g.color ?? null });
  for (const p2 of cfg.places ?? []) place(ctx, plan, v, p2, 0, undefined);
  if (cfg.dim) dimAround(v, pt(cfg.dim.center), cfg.dim.km, at(cfg.dim.at), at(cfg.dim.at) + (cfg.dim.dur ?? 1), cfg.dim.amount);
  return { duration: at(cfg.duration ?? 10) };
}

// ---------- phần thêm tay (mọi mẫu) ----------
function extras(ctx, plan) {
  const { cfg, at, pt } = ctx;
  const v = (k) => plan.views[k ?? 0];
  for (const p2 of cfg.pins ?? []) pin(plan, v(p2.view), pt(p2.point), at(p2.at, 0), { ping: p2.ping });
  for (const l of cfg.labels ?? []) label(ctx, plan, v(l.view), l, at(l.at, 0), { ll: l.point ? pt(l.point) : null });
  for (const p2 of cfg.extraPlaces ?? []) place(ctx, plan, v(p2.view), p2, 0.3, p2.out);
  for (const [i, a] of (cfg.extraAreas ?? []).entries()) {
    const g = geomOf(ctx, a), t0 = at(a.at, 0.5);
    outline(v(a.view), `x${i}`, g, t0, t0 + 0.9);
    fillArea(v(a.view), `x${i}`, g, t0 + 0.4, t0 + 1.0, a.opacity);
  }
  for (const [i, r] of (cfg.extraRoutes ?? []).entries()) {
    const R = resolveRoute(ctx, r), t0 = at(r.at, 0.5);
    line(v(r.view), `xr${i}`, R.coords, t0, t0 + (r.dur ?? 2), { planned: R.planned, width: r.width });
    if (R.planned) plan.tags.push({ id: `g${plan.tags.length}`, view: v(r.view).id, ll: R.coords[Math.floor(R.coords.length / 2)], text: r.tag ?? "DỰ KIẾN", at: r3(t0 + (r.dur ?? 2) * 0.6) });
  }
}
