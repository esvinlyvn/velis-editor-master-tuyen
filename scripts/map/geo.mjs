// Hình học dùng chung: khoảng cách, vòng tròn bán kính, khung vừa vùng (fit), lấy ranh vùng từ ô bản đồ.
import { openRegion, lon2x, lat2y } from "./tiles.mjs";

const R = 6371008.8;
const rad = (d) => (d * Math.PI) / 180;
/** Khoảng cách (m) giữa 2 điểm [lon, lat]. */
export function dist([a, b], [c, d]) {
  const x = rad(c - a) * Math.cos(rad((b + d) / 2)), y = rad(d - b);
  return Math.hypot(x, y) * R;
}
/** Chiều dài lũy tiến (m) dọc theo đường. */
export function cumulative(coords) {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + dist(coords[i - 1], coords[i]));
  return cum;
}
/** Đa giác tròn bán kính km quanh tâm. */
export function circle([lon, lat], km, n = 128) {
  const ring = Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * 2 * Math.PI;
    return [+(lon + (km / (111.32 * Math.cos(rad(lat)))) * Math.cos(a)).toFixed(6), +(lat + (km / 110.574) * Math.sin(a)).toFixed(6)];
  });
  return { type: "Polygon", coordinates: [ring] };
}
export function bboxOf(coordsList) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of coordsList) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
  return b;
}
/** Mọi toạ độ của một geometry GeoJSON. */
export function allCoords(g) {
  if (g.type === "Feature") return allCoords(g.geometry);
  if (g.type === "FeatureCollection") return g.features.flatMap(allCoords);
  if (g.type === "GeometryCollection") return g.geometries.flatMap(allCoords);
  const flat = (c) => (typeof c[0] === "number" ? [c] : c.flatMap(flat));
  return flat(g.coordinates);
}
const mx = (lon) => (lon + 180) / 360;
const my = (lat) => { const s = Math.sin(rad(lat)); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
const unMy = (y) => (360 / Math.PI) * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - 90;
/** Camera (tâm, zoom) để bbox vừa trong khung w×h, chừa lề pad (px). Tile MapLibre 512 px. */
export function fit(b, w, h, pad = 120) {
  const dx = Math.max(1e-9, mx(b[2]) - mx(b[0])), dy = Math.max(1e-9, my(b[1]) - my(b[3]));
  const z = Math.log2(Math.min((w - 2 * pad) / (512 * dx), (h - 2 * pad) / (512 * dy)));
  return { center: [((mx(b[0]) + mx(b[2])) / 2) * 360 - 180, unMy((my(b[1]) + my(b[3])) / 2)], zoom: +Math.min(16, z).toFixed(3) };
}
/** Khoảng cách điểm ảnh (ở zoom z) giữa 2 tâm — để quyết định có "vồng" zoom khi bay xa. */
export function pxDist(a, b, z) { return Math.hypot(mx(a[0]) - mx(b[0]), my(a[1]) - my(b[1])) * 512 * 2 ** z; }

function inRing(pt, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
/** Lấy ranh một vùng có sẵn trên bản đồ (sân bay, công viên, khu công nghiệp…): đa giác thuộc lớp `layer`, loại `kind`,
 *  chứa điểm `near`. Đọc ở zoom thấp (mặc định 10) để cả vùng nằm gọn trong một ô; tăng zoom nếu vùng nhỏ. */
export function areaFromMap(region, { layer = "landuse", kind, near, zoom = 10, name }) {
  const t = openRegion(region);
  const tx = Math.floor(lon2x(near[0], zoom)), ty = Math.floor(lat2y(near[1], zoom));
  const L = t.tile(zoom, tx, ty)?.layers[layer];
  if (!L) throw new Error(`Không có lớp ${layer} ở ô z${zoom} quanh ${near}`);
  for (let i = 0; i < L.length; i++) {
    const f = L.feature(i);
    if (kind && f.properties.kind !== kind) continue;
    if (name && !String(f.properties.name ?? "").includes(name)) continue;
    const g = f.toGeoJSON(tx, ty, zoom).geometry;
    for (const poly of g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [])
      if (inRing(near, poly[0])) return { type: "Polygon", coordinates: poly };
  }
  throw new Error(`Không thấy vùng ${layer}/${kind ?? "*"} chứa điểm ${near} ở z${zoom} (thử zoom khác hoặc dùng file GeoJSON)`);
}
