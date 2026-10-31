#!/usr/bin/env node
// Kiểm mật độ sự kiện (PHONG-CACH-ME4REAL K, quyết định G8): không quãng nào quá N giây (mặc định 3) mà không có
// khối chữ vào, dòng chữ vào, SFX hay cú cắt cảnh trong clip. Đọc build/<video>/blocks.json (lib/build.mjs ghi).
//   node scripts/qa/density.mjs build/<video> [--max 3]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve(process.argv[2] ?? ""), i = process.argv.indexOf("--max"), MAX = i > 0 ? +process.argv[i + 1] : 3;
const B = JSON.parse(fs.readFileSync(path.join(dir, "blocks.json"), "utf8"));
const ev = [];
for (const b of B.blocks) { ev.push([b.at, `chữ ${b.p}`]); if (Array.isArray(b.text)) b.text.forEach((L) => L.at != null && ev.push([L.at, "dòng cao-trao"])); }
for (const s of B.sfx) ev.push([s.at, `sfx ${s.name}`]);
const ft = path.join(dir, "assets/footage.mp4");
if (fs.existsSync(ft)) {
  const log = spawnSync("ffmpeg", ["-nostats", "-i", ft, "-vf", "select='gt(scene,0.3)',showinfo", "-an", "-f", "null", "-"], { encoding: "utf8" }).stderr ?? "";
  for (const m of String(log).matchAll(/pts_time:([\d.]+)/g)) ev.push([+m[1], "cắt cảnh"]);
}
ev.sort((a, b) => a[0] - b[0]);
ev.push([B.duration, "hết"]);
const gaps = [];
for (let k = 1, prev = 0; k < ev.length; k++) { if (ev[k][0] - prev > MAX) gaps.push(`${prev.toFixed(1)}–${ev[k][0].toFixed(1)}s (${(ev[k][0] - prev).toFixed(1)} s)`); prev = ev[k][0]; }
console.log(`${ev.length - 1} sự kiện / ${B.duration}s · trung bình ${(B.duration / Math.max(1, ev.length - 1)).toFixed(1)} s một sự kiện`);
console.log(gaps.length ? `✗ ${gaps.length} quãng trống quá ${MAX} s:\n  ` + gaps.join("\n  ") : `✓ không quãng nào quá ${MAX} s`);
process.exit(gaps.length ? 1 : 0);
