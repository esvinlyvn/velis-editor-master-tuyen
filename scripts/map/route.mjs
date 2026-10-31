// Tuyến đường cho cảnh bản đồ. Thứ tự ưu tiên (MAP.md mục 3):
//   1. geojson: file GeoJSON có sẵn (tuyến chưa xây → planned, vẽ nét đứt + nhãn "dự kiến")
//   2. via: danh sách điểm đi qua do người dựng chỉ định — nối thẳng (follow "line") hoặc bám đường giữa 2 điểm liền nhau (follow "roads")
//   3. auto: chỉ có điểm đầu/cuối → tự tìm đường ngắn nhất theo thời gian (dự phòng, có cảnh báo)
// Tìm đường: đồ thị dựng từ lớp `roads` của ô z14 trong PMTiles, Dijkstra; không xét đường một chiều.
import { openRegion, lon2x, lat2y } from "./tiles.mjs";

const Z = 14, EXT = 4096, TOL = 3;
// km/h theo loại đường
const SPEED = { motorway: 90, trunk: 70, primary: 50, secondary: 40, tertiary: 30, motorway_link: 45, trunk_link: 40, primary_link: 35, secondary_link: 30, tertiary_link: 25 };
const speedOf = (p) => SPEED[p.kind_detail] ?? (p.kind === "highway" ? 80 : p.kind === "major_road" ? 35 : p.kind === "minor_road" ? 15 : 0);

// cắt đoạn thẳng vào ô [0, EXT]² (Liang–Barsky) để 2 ô kề nhau sinh cùng điểm biên
function clip(a, b) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const [p, q] of [[-dx, a.x], [dx, EXT - a.x], [-dy, a.y], [dy, EXT - a.y]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [{ x: a.x + t0 * dx, y: a.y + t0 * dy }, { x: a.x + t1 * dx, y: a.y + t1 * dy }];
}

/** Đồ thị đường trong bbox [tây, nam, đông, bắc]. Ô PMTiles đã gộp/giản lược đường nên điểm giao không chắc là đỉnh
 *  chung → tự tìm giao điểm giữa các đoạn rồi chẻ ra. Cầu, hầm, cao tốc chỉ nối ở đầu mút / nút chữ T, không nối khi cắt chéo. */
function buildGraph(region, bbox) {
  const T = openRegion(region);
  const mPerUnit = (40075016.7 * Math.cos((((bbox[1] + bbox[3]) / 2) * Math.PI) / 180)) / (2 ** Z * EXT);
  const S = [];
  const x0 = Math.floor(lon2x(bbox[0], Z)), x1 = Math.floor(lon2x(bbox[2], Z));
  const y0 = Math.floor(lat2y(bbox[3], Z)), y1 = Math.floor(lat2y(bbox[1], Z));
  if ((x1 - x0 + 1) * (y1 - y0 + 1) > 4000) throw new Error("Vùng tìm đường quá rộng (> 4000 ô z14): thêm điểm via ở giữa");
  for (let tx = x0; tx <= x1; tx++)
    for (let ty = y0; ty <= y1; ty++) {
      const L = T.tile(Z, tx, ty)?.layers.roads;
      if (!L) continue;
      for (let i = 0; i < L.length; i++) {
        const f = L.feature(i), p = f.properties, v = speedOf(p);
        if (!v || f.type !== 2) continue;
        const flat = !p.is_bridge && !p.is_tunnel && p.kind !== "highway";
        for (const line of f.loadGeometry())
          for (let j = 1; j < line.length; j++) {
            const c = clip(line[j - 1], line[j]);
            if (c) S.push({ a: [tx * EXT + c[0].x, ty * EXT + c[0].y], b: [tx * EXT + c[1].x, ty * EXT + c[1].y], v, flat, cut: [0, 1] });
          }
      }
    }
  // giao điểm (lưới băm 128 đơn vị)
  const G = 128, grid = new Map();
  S.forEach((s, i) => {
    for (let gx = Math.floor((Math.min(s.a[0], s.b[0]) - TOL) / G); gx <= Math.floor((Math.max(s.a[0], s.b[0]) + TOL) / G); gx++)
      for (let gy = Math.floor((Math.min(s.a[1], s.b[1]) - TOL) / G); gy <= Math.floor((Math.max(s.a[1], s.b[1]) + TOL) / G); gy++) {
        const k = gx * 1e6 + gy;
        (grid.get(k) || grid.set(k, []).get(k)).push(i);
      }
  });
  const seen = new Set();
  for (const ids of grid.values())
    for (let m = 0; m < ids.length; m++)
      for (let n = m + 1; n < ids.length; n++) {
        const i = ids[m], j = ids[n], key = i < j ? i * 1e7 + j : j * 1e7 + i;
        if (seen.has(key)) continue;
        seen.add(key);
        const P = S[i], Q = S[j];
        const r = [P.b[0] - P.a[0], P.b[1] - P.a[1]], q = [Q.b[0] - Q.a[0], Q.b[1] - Q.a[1]];
        const den = r[0] * q[1] - r[1] * q[0];
        if (Math.abs(den) < 1e-9) continue;
        const w = [Q.a[0] - P.a[0], Q.a[1] - P.a[1]];
        const t = (w[0] * q[1] - w[1] * q[0]) / den, u = (w[0] * r[1] - w[1] * r[0]) / den;
        const et = TOL / Math.hypot(...r), eu = TOL / Math.hypot(...q);
        if (t < -et || t > 1 + et || u < -eu || u > 1 + eu) continue;
        const endP = t < et || t > 1 - et, endQ = u < eu || u > 1 - eu;
        if (!endP && !endQ && !(P.flat && Q.flat)) continue;
        P.cut.push(Math.min(1, Math.max(0, t)));
        Q.cut.push(Math.min(1, Math.max(0, u)));
      }
  // nút (gộp điểm cách ≤ TOL) + cạnh
  const nodes = [], adj = [], cell = new Map();
  const nodeAt = (gx, gy) => {
    const cx = Math.round(gx / 8), cy = Math.round(gy / 8);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
      for (const id of cell.get(`${cx + dx},${cy + dy}`) || []) if (Math.abs(nodes[id][0] - gx) <= TOL && Math.abs(nodes[id][1] - gy) <= TOL) return id;
    const id = nodes.push([gx, gy]) - 1;
    adj.push([]);
    const k = `${cx},${cy}`;
    (cell.get(k) || cell.set(k, []).get(k)).push(id);
    return id;
  };
  for (const s of S) {
    const cuts = [...new Set(s.cut)].sort((x, y) => x - y);
    for (let k = 1; k < cuts.length; k++) {
      const p0 = [s.a[0] + (s.b[0] - s.a[0]) * cuts[k - 1], s.a[1] + (s.b[1] - s.a[1]) * cuts[k - 1]];
      const p1 = [s.a[0] + (s.b[0] - s.a[0]) * cuts[k], s.a[1] + (s.b[1] - s.a[1]) * cuts[k]];
      const a = nodeAt(...p0), b = nodeAt(...p1);
      if (a === b) continue;
      const len = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]) * mPerUnit;
      adj[a].push([b, len / 1000 / s.v]);
      adj[b].push([a, len / 1000 / s.v]);
    }
  }
  return { nodes, adj, mPerUnit };
}

const toG = ([lon, lat]) => [lon2x(lon, Z) * EXT, lat2y(lat, Z) * EXT];
const toLL = ([x, y]) => { const n = Math.PI - (2 * Math.PI * (y / EXT)) / 2 ** Z; return [+((x / EXT / 2 ** Z) * 360 - 180).toFixed(6), +((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))).toFixed(6)]; };

/** Đường bám mạng đường giữa a và b (Dijkstra). Trả về toạ độ + khoảng cách (m) từ a, b tới nút đường gần nhất. */
export function roadPath(region, a, b) {
  const margin = Math.max(0.03, Math.hypot(a[0] - b[0], a[1] - b[1]) * 0.25);
  const bbox = [Math.min(a[0], b[0]) - margin, Math.min(a[1], b[1]) - margin, Math.max(a[0], b[0]) + margin, Math.max(a[1], b[1]) + margin];
  const { nodes, adj, mPerUnit } = buildGraph(region, bbox);
  const nearest = (p, ok = () => true) => { const [x, y] = toG(p); let best = -1, bd = Infinity; nodes.forEach((n, i) => { const d = (n[0] - x) ** 2 + (n[1] - y) ** 2; if (d < bd && adj[i].length && ok(i)) (bd = d), (best = i); }); return [best, Math.sqrt(bd) * mPerUnit]; };
  const [s, ds] = nearest(a);
  const dist = new Float64Array(nodes.length).fill(Infinity), prev = new Int32Array(nodes.length).fill(-1);
  const heap = [[0, s]];
  dist[s] = 0;
  const push = (it) => { heap.push(it); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) if (d + w < dist[v]) (dist[v] = d + w), (prev[v] = u), push([d + w, v]);
  }
  // đích: nút ĐÃ TỚI ĐƯỢC gần b nhất (đường trong khu chưa nối vào mạng thì dừng ở mép)
  const [e, de] = nearest(b, (i) => dist[i] < Infinity);
  const path = [];
  for (let u = e; u >= 0; u = prev[u]) path.push(u);
  path.reverse();
  // bỏ điểm gần thẳng hàng (lệch ≤ 2 m)
  const pts = path.map((i) => nodes[i]), keep = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = keep.at(-1), q = pts[i], r = pts[i + 1];
    const cross = Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])) / (Math.hypot(r[0] - p[0], r[1] - p[1]) || 1);
    if (cross * mPerUnit > 2) keep.push(q);
  }
  if (pts.length > 1) keep.push(pts.at(-1));
  return { coords: keep.map(toLL), snapStart: ds, snapEnd: de };
}
