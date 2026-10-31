// Chạy trong trang cảnh bản đồ (build/map/<cảnh>/index.html). Không chạy theo đồng hồ thật:
// render.mjs gọi window.renderFrame(t) cho từng khung → đặt camera, lớp bản đồ, tua timeline GSAP `tl` (nhãn preset,
// ghim…) → chờ mọi bản đồ vẽ xong (idle + đọc 1 pixel vì SwiftShader vẽ bất đồng bộ) → chụp.
(function () {
  const P = window.__PLAN;
  const tl = window.tl;
  const A = P.accent;
  const [FW, FH] = P.size;
  const SAFE = { x0: 60, x1: 1020, y0: 200, y1: 1320 };

  // ---------- tiện ích ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
  const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  const outE = (x) => 1 - (1 - x) ** 3;
  const lerp = (a, b, x) => a + (b - a) * x;
  const mx = (lon) => (lon + 180) / 360;
  const my = (lat) => { const s = Math.sin((lat * Math.PI) / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
  const unMy = (y) => (360 / Math.PI) * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - 90;
  const EASE = { inOut, linear: (x) => x, out: outE };

  function camera(keys, t) {
    let i = keys.findIndex((k) => k.t > t);
    if (i < 0) i = keys.length - 1;
    if (i === 0) return keys[0];
    const a = keys[i - 1], b = keys[i];
    const x = (EASE[b.ease] ?? inOut)(seg(t, a.t, b.t));
    return {
      center: [lerp(mx(a.center[0]), mx(b.center[0]), x) * 360 - 180, unMy(lerp(my(a.center[1]), my(b.center[1]), x))],
      zoom: lerp(a.zoom, b.zoom, x) - (b.dip || 0) * Math.sin(Math.PI * x),
      bearing: lerp(a.bearing || 0, b.bearing || 0, x), pitch: lerp(a.pitch || 0, b.pitch || 0, x),
    };
  }
  // cắt đường tới tiến độ p (theo chiều dài thật)
  function slice(L, p) {
    const total = L.cum[L.cum.length - 1], d = p * total;
    if (p >= 1) return { coords: L.coords, head: L.coords[L.coords.length - 1] };
    let i = 1;
    while (i < L.cum.length && L.cum[i] < d) i++;
    const k = (d - L.cum[i - 1]) / ((L.cum[i] - L.cum[i - 1]) || 1);
    const a = L.coords[i - 1], b = L.coords[i];
    const h = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    return { coords: L.coords.slice(0, i).concat([h]), head: h };
  }
  // dải tường: mỗi đoạn thẳng thành một tứ giác rộng w mét (đủ cho fill-extrusion, không cần thư viện buffer)
  function wallFC(coords, wm) {
    const feats = [];
    for (let i = 1; i < coords.length; i++) {
      const [a, b] = [coords[i - 1], coords[i]];
      const k = Math.cos((a[1] * Math.PI) / 180);
      const dx = (b[0] - a[0]) * k, dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (len < 1e-9) continue;
      const off = wm / 2 / 111320, nx = (-dy / len) * off / k, ny = (dx / len) * off;
      feats.push({ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny], [a[0] + nx, a[1] + ny]]] } });
    }
    return { type: "FeatureCollection", features: feats };
  }
  // crisp: màu đặc (không trong suốt, không glow mờ) → chỗ tuyến tự chồng lên nhau không cộng sáng thành đốm;
  // mờ đi / nhấp nháy = pha màu với nền
  const CRISP = !!P.crisp, CBG = P.crispBg ?? "#1c2029";
  const hx = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const mix = (a, b, k) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k)).toString(16).padStart(2, "0")).join(""); };
  const lineFC = (coords) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords.length > 1 ? coords : [coords[0], coords[0]] } });
  const ptFC = (c) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: c } });

  // ---------- bản đồ cho từng khung con ----------
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  const views = P.views.map((v) => {
    const el = document.createElement("div");
    el.className = "mview";
    Object.assign(el.style, { left: v.rect[0] + "px", top: v.rect[1] + "px", width: v.rect[2] + "px", height: v.rect[3] + "px" });
    document.getElementById("maps").appendChild(el);
    const sources = { protomaps: { type: "vector", url: `pmtiles:///tiles/${P.region}.pmtiles` } };
    const layers = [...window.__BASE];
    if (v.dim) {
      sources.dim = { type: "geojson", data: { type: "FeatureCollection", features: v.dim.features } };
      layers.push({ id: "dim", type: "fill", source: "dim", paint: { "fill-color": "#000", "fill-opacity": 0, "fill-antialias": false } });
    }
    for (const f of v.fills) {
      sources[`f-${f.id}`] = { type: "geojson", data: { type: "Feature", properties: {}, geometry: f.geometry } };
      layers.push({ id: `f-${f.id}`, type: "fill", source: `f-${f.id}`, paint: { "fill-color": A.fill, "fill-opacity": 0 } });
    }
    for (const L of v.lines) {
      const w = L.width;
      sources[`l-${L.id}`] = { type: "geojson", data: lineFC([L.coords[0]]), tolerance: 0.2 };
      const lay = { "line-cap": "round", "line-join": "round" };
      if (P.style === "light") layers.push({ id: `l-${L.id}-case`, type: "line", source: `l-${L.id}`, layout: lay, paint: { "line-color": A.casing, "line-width": w + 6, "line-opacity": 0.9 } });
      if (CRISP) layers.push({ id: `l-${L.id}-glow`, type: "line", source: `l-${L.id}`, layout: lay, paint: { "line-color": (P.skin && P.skin.outline) || "#07090d", "line-width": w + 5, "line-opacity": 0 } }); // viền tối mảnh, đặc
      else layers.push({ id: `l-${L.id}-glow`, type: "line", source: `l-${L.id}`, layout: lay, paint: { "line-color": L.glow ?? A.glow, "line-width": w * 3, "line-blur": w * 2, "line-opacity": P.style === "light" ? 0.35 : 0.6 } });
      const core = { "line-color": L.color ?? A.line, "line-width": w };
      if (L.planned) core["line-dasharray"] = [1.6, 1.3];
      layers.push({ id: `l-${L.id}`, type: "line", source: `l-${L.id}`, layout: L.planned ? { "line-join": "round" } : lay, paint: core });
      // tường 3D: dải đa giác 2 bên tuyến, nâng lên bằng fill-extrusion (nhìn rõ khi camera nghiêng)
      if (L.wall) {
        sources[`w-${L.id}`] = { type: "geojson", data: { type: "FeatureCollection", features: [] } };
        layers.push({ id: `w-${L.id}`, type: "fill-extrusion", source: `w-${L.id}`, paint: { "fill-extrusion-color": L.wall.color ?? L.color ?? A.line, "fill-extrusion-height": 0, "fill-extrusion-base": 0, "fill-extrusion-opacity": L.wall.opacity ?? 0.85, "fill-extrusion-vertical-gradient": true } });
      }
      if (L.head) {
        sources[`h-${L.id}`] = { type: "geojson", data: ptFC(L.coords[0]) };
        layers.push({ id: `h-${L.id}-glow`, type: "circle", source: `h-${L.id}`, paint: { "circle-radius": w * 3, "circle-color": A.glow, "circle-blur": 1, "circle-opacity": 0 } });
        layers.push({ id: `h-${L.id}`, type: "circle", source: `h-${L.id}`, paint: { "circle-radius": w, "circle-color": A.head, "circle-opacity": 0 } });
      }
    }
    const map = new maplibregl.Map({
      container: el, style: { version: 8, sources, layers }, interactive: false, attributionControl: false, fadeDuration: 0,
      maxTileCacheSize: 4000, pixelRatio: 1, canvasContextAttributes: { antialias: false, preserveDrawingBuffer: true },
      center: v.camera[0].center, zoom: v.camera[0].zoom, maxPitch: 75,
    });
    return { v, el, map, state: {} };
  });

  // ---------- HTML gắn toạ độ: ghim, nhãn, tên địa danh, thẻ "dự kiến" ----------
  const viewOf = (id) => views.find((x) => x.v.id === id);
  function project(id, ll) {
    const V = viewOf(id);
    const p = V.map.project(ll);
    return { x: p.x + V.v.rect[0], y: p.y + V.v.rect[1] };
  }
  const labelBox = {};
  function measureLabels() {
    for (const l of P.labels) {
      const pos = document.querySelector(`#w-${l.id} .tp-pos`);
      const r = pos.getBoundingClientRect(), w0 = document.getElementById(`w-${l.id}`).getBoundingClientRect();
      labelBox[l.id] = { w: r.width, h: r.height, dx: r.left - w0.left };
    }
  }
  function placeHtml() {
    for (const p of P.pins) {
      const q = project(p.view, p.ll);
      document.getElementById(`w-${p.id}`).style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
    }
    for (const m of P.movers || []) {
      const V = viewOf(m.view), h = V.heads?.[m.line];
      const el = document.getElementById(`w-${m.id}`);
      if (!h) { el.style.opacity = 0; continue; }
      const q = project(m.view, h);
      el.style.opacity = V.vis?.[m.line] ?? 0;
      el.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
    }
    for (const n of [...P.places, ...P.tags]) {
      const q = project(n.view, n.ll);
      document.getElementById(`w-${n.id}`).style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
    }
    for (const l of P.labels) {
      const B = labelBox[l.id];
      const wrap = document.getElementById(`w-${l.id}`);
      let ax, ay, x, y;
      if (l.pos) { [x, y] = l.pos; ax = null; }
      else {
        const q = project(l.view, l.ll);
        ax = q.x; ay = q.y;
        x = q.x;
        y = l.place === "below" ? q.y + l.gap : l.place === "center" ? q.y - B.h / 2 : q.y - l.gap - B.h;
      }
      // giữ khối chữ trong vùng an toàn (DAC-TA-CHU 5.1)
      const left = x + B.dx;
      x += Math.max(0, SAFE.x0 - left) - Math.max(0, left + B.w - SAFE.x1);
      y = clamp(y, SAFE.y0, SAFE.y1 - B.h);
      wrap.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      const stem = document.getElementById(`s-${l.id}`);
      if (stem && ax !== null) {
        const yEnd = l.place === "below" ? y : y + B.h;
        stem.setAttribute("x1", ax.toFixed(1)); stem.setAttribute("y1", (ay + (l.place === "below" ? 14 : -14)).toFixed(1));
        stem.setAttribute("x2", clamp(ax, x + B.dx + 20, x + B.dx + B.w - 20).toFixed(1)); stem.setAttribute("y2", (yEnd + (l.place === "below" ? -4 : 4)).toFixed(1));
      }
    }
  }

  // ---------- thước tỷ lệ (so sánh độ lớn thật) ----------
  const NICE = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  for (const V of views) {
    if (!V.v.scaleBar) continue;
    const el = document.createElement("div");
    el.className = "mscale";
    el.innerHTML = "<i></i><span></span>";
    el.style.left = V.v.rect[0] + 60 + "px";
    el.style.top = V.v.rect[1] + V.v.rect[3] - 78 + "px";
    document.getElementById("over").appendChild(el);
    V.scaleEl = el;
  }
  function scaleBar(V) {
    if (!V.scaleEl) return;
    const c = V.map.getCenter(), z = V.map.getZoom();
    const mpp = (40075016.7 * Math.cos((c.lat * Math.PI) / 180)) / (512 * 2 ** z);
    const m = NICE.filter((n) => n / mpp <= 260).pop() ?? 50;
    V.scaleEl.querySelector("i").style.width = (m / mpp).toFixed(1) + "px";
    V.scaleEl.querySelector("span").textContent = m >= 1000 ? `${m / 1000} km` : `${m} m`;
  }

  // ---------- lớp bản đồ theo thời gian ----------
  function applyMap(V, t) {
    const { v, map, state } = V;
    const c = camera(v.camera, t);
    map.jumpTo({ center: c.center, zoom: c.zoom, bearing: c.bearing, pitch: c.pitch, padding: { top: Math.max(0, 2 * v.focusY - v.rect[3]), bottom: Math.max(0, v.rect[3] - 2 * v.focusY), left: 0, right: 0 } });
    scaleBar(V);
    for (const L of v.lines) {
      const p = inOut(seg(t, L.t0, L.t1));
      const key = p.toFixed(4);
      if (state[L.id] !== key) {
        state[L.id] = key;
        const s = slice(L, Math.max(p, 1e-4));
        map.getSource(`l-${L.id}`).setData(lineFC(s.coords));
        V.heads = V.heads || {};
        V.heads[L.id] = s.head;
        if (L.head) map.getSource(`h-${L.id}`).setData(ptFC(s.head));
      }
      // độ hiện: có tiến độ → hiện; fade: đổi độ mờ theo mốc (làm nền cho đoạn đang nói); out: tắt; pulse: nhấp nháy
      let vis = p > 0 ? 1 : 0;
      for (const f of L.fade || []) vis = lerp(vis, f.v, seg(t, f.t, f.t + f.d));
      if (L.out !== null && L.out !== undefined) vis *= 1 - seg(t, L.out, L.out + 0.4);
      for (const q of L.pulse || []) if (t >= q.from && t <= q.to) { const k = Math.min(seg(t, q.from, q.from + 0.2), 1 - seg(t, q.to - 0.2, q.to)); vis *= 1 - k * 0.55 * (0.5 + 0.5 * Math.cos(((t - q.from) * 2 * Math.PI) / 0.7)); }
      if (L.wall) {
        // chiều cao: mọc theo "rise" (từ lúc vẽ), nhấp nháy/mờ theo vis
        const rise = L.wall.riseAt != null ? outE(seg(t, L.wall.riseAt, L.wall.riseAt + (L.wall.riseDur ?? 1))) : outE(seg(t, L.t0, L.t1 + 0.4));
        // wall.px: chiều cao nhìn thấy (px) — quy ra mét theo zoom hiện tại để tường không cao vọt khi camera zoom vào
        const mpp = (40075016.7 * Math.cos((c.center[1] * Math.PI) / 180)) / (512 * 2 ** c.zoom);
        // bề dày tường cũng theo px (wpx), dựng lại khi tiến độ hoặc zoom đổi
        const wkey = `${p.toFixed(4)}|${c.zoom.toFixed(2)}`;
        if (p > 0 && state[`w${L.id}`] !== wkey) { state[`w${L.id}`] = wkey; map.getSource(`w-${L.id}`).setData(wallFC(slice(L, Math.max(p, 1e-4)).coords, (L.wall.wpx ?? 5) * mpp)); }
        map.setPaintProperty(`w-${L.id}`, "fill-extrusion-height", Math.max(0.1, (L.wall.px ?? 60) * mpp * rise * (p > 0 ? 1 : 0)));
        map.setPaintProperty(`w-${L.id}`, "fill-extrusion-opacity", clamp((L.wall.opacity ?? 0.85) * vis));
      }
      V.vis = V.vis || {};
      V.vis[L.id] = vis * (p > 0 && p < 1.0001 ? 1 : 0);
      if (CRISP) {
        const on = vis > 0.02 ? 1 : 0;
        map.setPaintProperty(`l-${L.id}`, "line-opacity", on);
        map.setPaintProperty(`l-${L.id}-glow`, "line-opacity", on);
        map.setPaintProperty(`l-${L.id}`, "line-color", mix(CBG, L.color ?? A.line, vis));
        if (L.wall) { map.setPaintProperty(`w-${L.id}`, "fill-extrusion-opacity", on); map.setPaintProperty(`w-${L.id}`, "fill-extrusion-color", mix(CBG, L.wall.color ?? L.color ?? A.line, vis * (L.wall.shade ?? 0.85))); }
      } else for (const sfx of ["-glow", "", ...(P.style === "light" ? ["-case"] : [])]) map.setPaintProperty(`l-${L.id}${sfx}`, "line-opacity", vis * (sfx === "-glow" ? (P.style === "light" ? 0.35 : 0.6) : sfx === "-case" ? 0.9 : 1));
      if (L.head) {
        const h = p > 0 && p < 1 ? 1 : p >= 1 ? 1 - seg(t, L.t1, L.t1 + 0.4) : 0;
        map.setPaintProperty(`h-${L.id}`, "circle-opacity", h);
        map.setPaintProperty(`h-${L.id}-glow`, "circle-opacity", h * 0.9);
      }
    }
    for (const f of v.fills) map.setPaintProperty(`f-${f.id}`, "fill-opacity", f.opacity * outE(seg(t, f.t0, f.t1)));
    if (v.dim) {
      const d = outE(seg(t, v.dim.t0, v.dim.t1));
      map.setLayoutProperty("dim", "visibility", d > 0 ? "visible" : "none");
      map.setPaintProperty("dim", "fill-opacity", 1 - (1 - v.dim.amount * d) ** (1 / v.dim.steps));
    }
  }

  const idle = (map) => new Promise((r) => { map.once("idle", r); map.triggerRepaint(); });
  window.renderFrame = async (t) => {
    for (const V of views) applyMap(V, t);
    tl.seek(t, true);
    placeHtml();
    await Promise.all(views.map((V) => idle(V.map)));
    for (const V of views) { const g = V.map.painter.context.gl; g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, new Uint8Array(4)); }
    placeHtml();
    await new Promise((r) => requestAnimationFrame(() => r()));
  };
  window.ready = Promise.all(views.map((V) => new Promise((r) => (V.map.loaded() ? r() : V.map.once("load", r)))))
    .then(() => document.fonts.ready)
    .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    .then(() => { measureLabels(); return true; });
})();
