// Đọc/ghi PMTiles v3 (header, thư mục) cho data.mjs (cắt vùng) và tiles.mjs (đọc ô trên máy).
// Đặc tả: https://github.com/protomaps/PMTiles/blob/main/spec/v3/spec.md
import zlib from "node:zlib";

export const HEADER_LEN = 127;
export const ROOT_MAX = 16384; // header + thư mục gốc phải nằm trong 16 KB đầu

// ---------- varint ----------
export function readVarint(buf, pos) {
  let v = 0, mul = 1, b;
  do {
    b = buf[pos.i++];
    v += (b & 0x7f) * mul;
    mul *= 128;
  } while (b & 0x80);
  return v;
}
function pushVarint(out, v) {
  while (v >= 0x80) { out.push((v % 128) | 0x80); v = Math.floor(v / 128); }
  out.push(v);
}

// ---------- header ----------
const u64 = (b, o) => Number(b.readBigUInt64LE(o));
export function parseHeader(b) {
  if (b.toString("latin1", 0, 7) !== "PMTiles" || b[7] !== 3) throw new Error("Không phải PMTiles v3");
  return {
    rootOffset: u64(b, 8), rootLength: u64(b, 16), metaOffset: u64(b, 24), metaLength: u64(b, 32),
    leafOffset: u64(b, 40), leafLength: u64(b, 48), dataOffset: u64(b, 56), dataLength: u64(b, 64),
    addressed: u64(b, 72), entries: u64(b, 80), contents: u64(b, 88), clustered: b[96] === 1,
    internalCompression: b[97], tileCompression: b[98], tileType: b[99], minZoom: b[100], maxZoom: b[101],
    minLon: b.readInt32LE(102) / 1e7, minLat: b.readInt32LE(106) / 1e7, maxLon: b.readInt32LE(110) / 1e7, maxLat: b.readInt32LE(114) / 1e7,
    centerZoom: b[118], centerLon: b.readInt32LE(119) / 1e7, centerLat: b.readInt32LE(123) / 1e7,
  };
}
export function writeHeader(h) {
  const b = Buffer.alloc(HEADER_LEN);
  b.write("PMTiles", 0, "latin1");
  b[7] = 3;
  [h.rootOffset, h.rootLength, h.metaOffset, h.metaLength, h.leafOffset, h.leafLength, h.dataOffset, h.dataLength, h.addressed, h.entries, h.contents]
    .forEach((v, k) => b.writeBigUInt64LE(BigInt(v), 8 + k * 8));
  b[96] = 1; // clustered: dữ liệu ô xếp theo tile id
  b[97] = 2; // thư mục nén gzip
  b[98] = h.tileCompression;
  b[99] = h.tileType;
  b[100] = h.minZoom;
  b[101] = h.maxZoom;
  [h.minLon, h.minLat, h.maxLon, h.maxLat].forEach((v, k) => b.writeInt32LE(Math.round(v * 1e7), 102 + k * 4));
  b[118] = h.centerZoom;
  b.writeInt32LE(Math.round(h.centerLon * 1e7), 119);
  b.writeInt32LE(Math.round(h.centerLat * 1e7), 123);
  return b;
}

// ---------- nén ----------
export function decompress(buf, kind) {
  if (kind === 1 || kind === 0) return buf; // none / unknown
  if (kind === 2) return zlib.gunzipSync(buf);
  throw new Error(`Chưa hỗ trợ kiểu nén ${kind}`);
}

// ---------- thư mục ----------
// entry: { tileId, offset, length, runLength } — runLength 0 = trỏ tới thư mục lá
export function parseDirectory(raw) {
  const pos = { i: 0 };
  const n = readVarint(raw, pos);
  const e = Array.from({ length: n }, () => ({}));
  let last = 0;
  for (const x of e) { last += readVarint(raw, pos); x.tileId = last; }
  for (const x of e) x.runLength = readVarint(raw, pos);
  for (const x of e) x.length = readVarint(raw, pos);
  e.forEach((x, k) => {
    const v = readVarint(raw, pos);
    x.offset = v === 0 && k > 0 ? e[k - 1].offset + e[k - 1].length : v - 1;
  });
  return e;
}
export function serializeDirectory(entries) {
  const out = [];
  pushVarint(out, entries.length);
  let last = 0;
  for (const x of entries) { pushVarint(out, x.tileId - last); last = x.tileId; }
  for (const x of entries) pushVarint(out, x.runLength);
  for (const x of entries) pushVarint(out, x.length);
  entries.forEach((x, k) => pushVarint(out, k > 0 && x.offset === entries[k - 1].offset + entries[k - 1].length ? 0 : x.offset + 1));
  return zlib.gzipSync(Buffer.from(out), { level: 9 });
}
/** Thư mục gốc (+ lá nếu cần) cho danh sách entry đã xếp theo tileId. */
export function buildDirectories(entries) {
  const root = serializeDirectory(entries);
  if (root.length <= ROOT_MAX - HEADER_LEN) return { root, leaves: Buffer.alloc(0) };
  for (let size = 4096; ; size *= 2) {
    const leafBufs = [], rootEntries = [];
    let off = 0;
    for (let i = 0; i < entries.length; i += size) {
      const b = serializeDirectory(entries.slice(i, i + size));
      rootEntries.push({ tileId: entries[i].tileId, offset: off, length: b.length, runLength: 0 });
      leafBufs.push(b);
      off += b.length;
    }
    const r = serializeDirectory(rootEntries);
    if (r.length <= ROOT_MAX - HEADER_LEN) return { root: r, leaves: Buffer.concat(leafBufs) };
  }
}

// ---------- tile id (đường Hilbert theo từng zoom) ----------
export function zxyToTileId(z, x, y) {
  let acc = 0;
  for (let t = 0; t < z; t++) acc += 4 ** t;
  const n = 2 ** z;
  let d = 0;
  for (let s = n / 2; s >= 1; s /= 2) {
    const rx = (x & s) > 0 ? 1 : 0, ry = (y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } [x, y] = [y, x]; }
  }
  return acc + d;
}
export const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z;
export const lat2y = (lat, z) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z;
/** Mọi ô (z, x, y) phủ bbox [minLon, minLat, maxLon, maxLat] từ minZoom tới maxZoom. */
export function* tilesInBbox([w, s, e, n], minZoom, maxZoom) {
  for (let z = minZoom; z <= maxZoom; z++) {
    const m = 2 ** z - 1;
    const x0 = Math.max(0, Math.floor(lon2x(w, z))), x1 = Math.min(m, Math.floor(lon2x(e, z)));
    const y0 = Math.max(0, Math.floor(lat2y(n, z))), y1 = Math.min(m, Math.floor(lat2y(s, z)));
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) yield [z, x, y];
  }
}
