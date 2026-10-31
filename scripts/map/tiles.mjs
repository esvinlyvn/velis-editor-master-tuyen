// Đọc ô vector trong work/map/<vùng>.pmtiles (trên máy, không qua mạng) cho route.mjs và lấy ranh vùng từ bản đồ.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { VectorTile } from "@mapbox/vector-tile";
import Pbf from "pbf";
import { parseHeader, parseDirectory, decompress, zxyToTileId, HEADER_LEN } from "./pmtiles-io.mjs";
export { lon2x, lat2y } from "./pmtiles-io.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const WORK = path.join(ROOT, "work/map");
export const regionFile = (region) => path.join(WORK, `${region}.pmtiles`);

const cache = new Map();
export function openRegion(region) {
  if (cache.has(region)) return cache.get(region);
  const file = regionFile(region);
  if (!fs.existsSync(file)) throw new Error(`Chưa có ${path.relative(ROOT, file)} — chạy: npm run map:data ${region}`);
  const fd = fs.openSync(file, "r");
  const read = (off, len) => { const b = Buffer.alloc(len); fs.readSync(fd, b, 0, len, off); return b; };
  const h = parseHeader(read(0, HEADER_LEN));
  const dirs = new Map();
  const dir = (off, len) => { const k = `${off}:${len}`; if (!dirs.has(k)) dirs.set(k, parseDirectory(decompress(read(off, len), h.internalCompression))); return dirs.get(k); };
  function find(entries, id) {
    let lo = 0, hi = entries.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (entries[m].tileId <= id) lo = m + 1; else hi = m - 1; }
    return entries[hi];
  }
  const r = {
    header: h,
    tile(z, x, y) {
      const id = zxyToTileId(z, x, y);
      let entries = dir(h.rootOffset, h.rootLength);
      for (let depth = 0; depth < 4; depth++) {
        const e = find(entries, id);
        if (!e) return null;
        if (e.runLength === 0) { entries = dir(h.leafOffset + e.offset, e.length); continue; }
        if (id >= e.tileId + e.runLength) return null;
        let buf = read(h.dataOffset + e.offset, e.length);
        if (h.tileCompression === 2) buf = zlib.gunzipSync(buf);
        return new VectorTile(new Pbf(buf));
      }
      return null;
    },
  };
  cache.set(region, r);
  return r;
}
