#!/usr/bin/env node
// Tải và cắt bản đồ vector PMTiles (Protomaps, dữ liệu OpenStreetMap) cho một vùng vào work/map/<vùng>.pmtiles.
//   npm run map:data hcm-dongnai                       # vùng khai báo sẵn trong scripts/map/regions.json
//   npm run map:data ten-vung -- --bbox 106.2,10.4,107.3,11.3 [--maxzoom 14]
//   tuỳ chọn: --build 20261027 (bản build Protomaps) · --source <url hoặc file .pmtiles> · --force (tải lại)
// Chỉ bước này cần mạng. Render sau đó đọc file trên máy.
// Đã có file phủ đủ vùng + zoom thì bỏ qua. Mỗi đoạn tải tự thử lại khi đứt (6 lần, chờ 1 → 32 s).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHeader, writeHeader, parseDirectory, buildDirectories, decompress, tilesInBbox, zxyToTileId, HEADER_LEN } from "./pmtiles-io.mjs";

process.on("uncaughtException", (e) => { console.error(`✗ ${e.message}`); if (process.env.DEBUG) console.error(e.stack); process.exit(1); });
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WORK = path.join(ROOT, "work/map");
const REGIONS = JSON.parse(fs.readFileSync(new URL("./regions.json", import.meta.url), "utf8"));
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.findIndex((a) => a === k || a.startsWith(k + "=")); if (i < 0) return undefined; return argv[i].includes("=") ? argv[i].split("=")[1] : argv[i + 1]; };
const name = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--") && !argv[i - 1].includes("=")));
if (!name) {
  console.log("Dùng: npm run map:data <vùng> [-- --bbox tây,nam,đông,bắc --maxzoom 14]\nVùng có sẵn:");
  for (const [k, v] of Object.entries(REGIONS)) if (!k.startsWith("_")) console.log(`  ${k.padEnd(12)} ${v.ten} · z0–${v.maxzoom}`);
  process.exit(1);
}
const reg = REGIONS[name] ?? {};
const bbox = opt("--bbox") ? opt("--bbox").split(",").map(Number) : reg.bbox;
if (!bbox || bbox.length !== 4 || bbox.some(Number.isNaN)) throw new Error(`Vùng "${name}" chưa có trong regions.json: thêm --bbox tây,nam,đông,bắc`);
const maxZoom = Number(opt("--maxzoom") ?? reg.maxzoom ?? 14);
const OUT = path.join(WORK, `${name}.pmtiles`);
fs.mkdirSync(WORK, { recursive: true });

// ---------- bỏ qua nếu đã có ----------
if (fs.existsSync(OUT) && !argv.includes("--force")) {
  const fd = fs.openSync(OUT, "r");
  const hb = Buffer.alloc(HEADER_LEN);
  fs.readSync(fd, hb, 0, HEADER_LEN, 0);
  fs.closeSync(fd);
  const h = parseHeader(hb);
  const eps = 1e-6;
  if (h.minLon <= bbox[0] + eps && h.minLat <= bbox[1] + eps && h.maxLon >= bbox[2] - eps && h.maxLat >= bbox[3] - eps && h.maxZoom >= maxZoom) {
    console.log(`✔ ${path.relative(ROOT, OUT)} đã có (z0–${h.maxZoom}, ${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB), bỏ qua. Thêm --force để tải lại.`);
    process.exit(0);
  }
  console.log(`File cũ không phủ đủ vùng/zoom yêu cầu → tải lại`);
}

// ---------- nguồn ----------
let source = opt("--source");
if (!source) {
  let build = opt("--build");
  if (!build) {
    const list = await withRetry("danh sách bản build", async () => { const r = await fetch("https://build-metadata.protomaps.dev/builds.json"); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
    build = list.at(-1).key.replace(".pmtiles", "");
  }
  source = `https://build.protomaps.com/${build.replace(".pmtiles", "")}.pmtiles`;
}
const isUrl = /^https?:\/\//.test(source);
const fd = isUrl ? null : fs.openSync(source, "r");
let bytesIn = 0, requests = 0;

async function withRetry(what, fn, tries = 6) {
  for (let k = 0; ; k++) {
    try { return await fn(); } catch (e) {
      if (e.fatal) throw new Error(`${what}: ${e.message}`);
      if (k >= tries - 1) throw new Error(`${what}: ${e.message} (đã thử ${tries} lần)`);
      const wait = 2 ** k;
      console.log(`  ⟳ ${what}: ${e.cause?.code ?? e.message} — thử lại sau ${wait}s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    }
  }
}
async function getRange(offset, length) {
  requests++;
  if (!isUrl) { const b = Buffer.alloc(length); fs.readSync(fd, b, 0, length, offset); bytesIn += length; return b; }
  return withRetry(`đoạn ${offset}+${length}`, async () => {
    const r = await fetch(source, { headers: { Range: `bytes=${offset}-${offset + length - 1}` }, signal: AbortSignal.timeout(120000) });
    if (r.status !== 206 && r.status !== 200) {
      // 4xx (sai tên bản build, không có file…) thì thử lại cũng vô ích; 408/429/5xx thì thử lại
      throw Object.assign(new Error(`HTTP ${r.status}`), { fatal: r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429 });
    }
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length !== length) throw new Error(`thiếu dữ liệu (${b.length}/${length} byte)`);
    bytesIn += length;
    return b;
  });
}
// chạy song song có giới hạn
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }));
}

const t0 = Date.now();
console.log(`Cắt "${name}" bbox ${bbox.join(",")} z0–${maxZoom} từ ${source}`);
const head = await getRange(0, 16384);
const H = parseHeader(head);
const meta = await getRange(H.metaOffset, H.metaLength);

// ---------- ô cần lấy ----------
const want = [];
for (const [z, x, y] of tilesInBbox(bbox, 0, maxZoom)) want.push(zxyToTileId(z, x, y));
want.sort((a, b) => a - b);
console.log(`  ${want.length} ô trong vùng`);

// ---------- duyệt thư mục: gốc → lá (chỉ lá có chứa ô cần) ----------
const found = []; // entry ô gốc giao với tập cần
const dirOf = (b) => parseDirectory(decompress(b, H.internalCompression));
async function walk(entries, depth = 0) {
  const leaves = [];
  let wi = 0;
  for (let k = 0; k < entries.length; k++) {
    const e = entries[k], next = entries[k + 1]?.tileId ?? Infinity;
    if (e.runLength === 0) {
      while (wi < want.length && want[wi] < e.tileId) wi++;
      if (wi < want.length && want[wi] < next) leaves.push(e);
    } else {
      const end = e.tileId + e.runLength;
      while (wi < want.length && want[wi] < e.tileId) wi++;
      // tách run thành các khoảng id liên tiếp cần lấy
      while (wi < want.length && want[wi] < end) {
        const a = want[wi];
        let b = a;
        while (wi + 1 < want.length && want[wi + 1] === b + 1 && want[wi + 1] < end) { wi++; b++; }
        wi++;
        found.push({ tileId: a, runLength: b - a + 1, src: e.offset, length: e.length });
      }
    }
  }
  if (!leaves.length) return;
  // gộp các lá nằm sát nhau thành ít request
  const groups = mergeRanges(leaves.map((e) => ({ offset: H.leafOffset + e.offset, length: e.length, e })), 1 << 20);
  const subs = [];
  await pool(groups, 4, async (g) => {
    const buf = await getRange(g.offset, g.length);
    for (const it of g.items) subs.push(...dirOf(buf.subarray(it.offset - g.offset, it.offset - g.offset + it.length)));
  });
  subs.sort((a, b) => a.tileId - b.tileId);
  if (depth > 4) throw new Error("Thư mục lồng quá sâu");
  await walk(subs, depth + 1);
}
// gộp các khoảng byte gần nhau (cách ≤ gap) thành một request
function mergeRanges(items, gap) {
  items.sort((a, b) => a.offset - b.offset);
  const out = [];
  for (const it of items) {
    const g = out.at(-1);
    if (g && it.offset <= g.offset + g.length + gap && it.offset + it.length - g.offset <= 32 << 20) {
      g.length = Math.max(g.length, it.offset + it.length - g.offset);
      g.items.push(it);
    } else out.push({ offset: it.offset, length: it.length, items: [it] });
  }
  return out;
}
await walk(dirOf(head.subarray(H.rootOffset, H.rootOffset + H.rootLength)));
found.sort((a, b) => a.tileId - b.tileId);

// ---------- tải dữ liệu ô (khử trùng theo offset nguồn) ----------
const uniq = new Map();
for (const f of found) if (!uniq.has(f.src)) uniq.set(f.src, { offset: H.dataOffset + f.src, length: f.length, src: f.src });
const total = [...uniq.values()].reduce((s, u) => s + u.length, 0);
const groups = mergeRanges([...uniq.values()], 64 << 10);
console.log(`  ${found.length} entry · ${uniq.size} ô khác nhau · ${(total / 1e6).toFixed(1)} MB · ${groups.length} request`);
const data = new Map();
let done = 0, lastLog = 0;
await pool(groups, 6, async (g) => {
  const buf = await getRange(g.offset, g.length);
  for (const it of g.items) data.set(it.src, buf.subarray(it.offset - g.offset, it.offset - g.offset + it.length));
  done += g.length;
  if (process.stdout.isTTY && Date.now() - lastLog > 500) { lastLog = Date.now(); process.stdout.write(`\r  tải ${(done / 1e6).toFixed(1)}/${(total / 1e6).toFixed(1)} MB`); }
});
if (process.stdout.isTTY) process.stdout.write("\n");

// ---------- ghi file mới (xếp theo tile id, dữ liệu trùng chỉ ghi một lần) ----------
const entries = [], chunks = [], newOff = new Map();
let off = 0;
for (const f of found) {
  if (!newOff.has(f.src)) { newOff.set(f.src, off); chunks.push(data.get(f.src)); off += f.length; }
  const o = newOff.get(f.src), last = entries.at(-1);
  // gộp run liền nhau cùng dữ liệu
  if (last && last.offset === o && last.tileId + last.runLength === f.tileId) last.runLength += f.runLength;
  else entries.push({ tileId: f.tileId, offset: o, length: f.length, runLength: f.runLength });
}
const { root, leaves } = buildDirectories(entries);
const metaJson = JSON.parse(decompress(meta, H.internalCompression).toString("utf8"));
metaJson["bds-editor:region"] = { name, bbox, maxzoom: maxZoom, source, extracted: new Date().toISOString().slice(0, 10) };
const metaBuf = (await import("node:zlib")).gzipSync(Buffer.from(JSON.stringify(metaJson)));
const h = {
  rootOffset: HEADER_LEN, rootLength: root.length,
  metaOffset: HEADER_LEN + root.length, metaLength: metaBuf.length,
  leafOffset: HEADER_LEN + root.length + metaBuf.length, leafLength: leaves.length,
  dataOffset: HEADER_LEN + root.length + metaBuf.length + leaves.length, dataLength: off,
  addressed: found.reduce((s, f) => s + f.runLength, 0), entries: entries.length, contents: newOff.size,
  tileCompression: H.tileCompression, tileType: H.tileType, minZoom: 0, maxZoom,
  minLon: bbox[0], minLat: bbox[1], maxLon: bbox[2], maxLat: bbox[3],
  centerZoom: Math.max(0, maxZoom - 6), centerLon: (bbox[0] + bbox[2]) / 2, centerLat: (bbox[1] + bbox[3]) / 2,
};
const tmp = OUT + ".part";
fs.writeFileSync(tmp, Buffer.concat([writeHeader(h), root, metaBuf, leaves, ...chunks]));
fs.renameSync(tmp, OUT);
if (fd) fs.closeSync(fd);
console.log(`✔ ${path.relative(ROOT, OUT)} · ${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB · ${requests} request, tải ${(bytesIn / 1e6).toFixed(1)} MB · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
