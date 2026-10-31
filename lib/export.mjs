#!/usr/bin/env node
// lib/export.mjs — Bước 5 hậu kỳ: xuất bản nháp (gửi duyệt) và bản cuối (master), đánh số phiên bản.
//   node lib/export.mjs projects/<video> --draft        → work/<video>/05_exports/draft/<video>_draft_v<N>.mp4
//   node lib/export.mjs projects/<video> --final        → work/<video>/05_exports/final/<video>_final_v<N>.mp4
// Master render MỘT lần ở lib/build.mjs: H.264 1080×1920 30 fps, 25 Mbps (khung 20–50 Mbps cho TikTok / Reels / Shorts),
// âm −14 LUFS. Bản cuối là chính master đó (không mã hóa lại, không mất chất lượng); chỉ xuất khi lib/qc.mjs đạt (--force để bỏ qua).
// Bản nháp nén lại từ master: 1080p, ~4 Mbps, AAC 128 kbps — nhẹ để gửi qua Google Drive / Zalo lấy góp ý.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const a = process.argv.slice(2), dir = a.find((x) => !x.startsWith("--"));
const kind = a.includes("--final") ? "final" : a.includes("--draft") ? "draft" : null;
if (!dir || !kind) { console.error("Cách dùng: node lib/export.mjs projects/<video> --draft | --final [--force]"); process.exit(1); }
const plan = JSON.parse(fs.readFileSync(path.join(dir, "plan.json"), "utf8"));
const slug = plan.video ?? path.basename(path.resolve(dir));
const master = path.join(ROOT, "build", slug, "output.mp4");
if (!fs.existsSync(master)) throw new Error(`Chưa render: node lib/build.mjs ${dir}`);
const outDir = path.join(ROOT, "work", slug, "05_exports", kind);
fs.mkdirSync(outDir, { recursive: true });
const n = fs.readdirSync(outDir).filter((f) => f.startsWith(`${slug}_${kind}_v`)).length + 1;
const out = path.join(outDir, `${slug}_${kind}_v${n}.mp4`);

if (kind === "final") {
  const qcF = path.join(ROOT, "work", slug, "qc.json");
  const qc = fs.existsSync(qcF) ? JSON.parse(fs.readFileSync(qcF, "utf8")) : null;
  const stale = !qc || new Date(qc.at).getTime() < fs.statSync(master).mtimeMs;
  const bad = qc?.rows.filter((r) => !r.ok) ?? [];
  if (!a.includes("--force") && (stale || bad.length || !qc.rows.some((r) => r.muc.startsWith("độ to"))))
    throw new Error(stale ? `Chưa chạy QC trên bản render này: node lib/qc.mjs ${dir}` : `QC chưa đạt: ${bad.map((r) => r.muc).join(", ") || "chưa kiểm phần sau render"}`);
  fs.copyFileSync(master, out);
} else {
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-nostdin", "-i", master, "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-maxrate", "4M", "-bufsize", "8M",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out]);
}
const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,bit_rate,size", "-of", "json", out]).toString()).format;
console.log(`✔ ${path.relative(ROOT, out)} · ${(info.size / 1e6).toFixed(1)} MB · ${(info.bit_rate / 1e6).toFixed(1)} Mbps · ${(+info.duration).toFixed(1)} s`);
