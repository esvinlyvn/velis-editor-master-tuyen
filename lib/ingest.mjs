#!/usr/bin/env node
// lib/ingest.mjs — Bước 1 hậu kỳ: tiếp nhận & sắp xếp dữ liệu, tạo bản dựng nhẹ (proxy).
//   node lib/ingest.mjs projects/<video> [--force]
// Cây thư mục chuẩn (không commit, nằm ở work/<video>/):
//   01_footage/cam_a · cam_b · drone · broll   cảnh quay gốc (A-roll ở cam_a/cam_b, B-roll ở drone/broll)
//   02_audio/voiceover · music · ambience · sfx tiếng thu rời (mic cài áo), nhạc, tiếng môi trường, SFX riêng của video
//   03_assets/                                  logo, ảnh, brochure khách gửi
//   04_project → projects/<video>/ trong repo    plan.json, transcript.json, SHOTBOOK.md (thứ duy nhất được commit)
//   05_exports/draft · final                    bản nháp gửi duyệt, bản cuối (lib/export.mjs)
//   proxy/                                      bản dựng nhẹ do lệnh này tạo: 1080×1920, 30 fps, H.264, giữ tiếng máy để đồng bộ
// Mỗi clip được dò: độ phân giải, fps, độ sâu màu, đường cong (log / HLG / Rec.709). Clip Log mà plan.color.input_lut
// chưa khai LUT kỹ thuật cho máy đó thì báo: Log phải về Rec.709 trước khi sửa màu (VAN-HANH mục 7).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DIRS = ["01_footage/cam_a", "01_footage/cam_b", "01_footage/drone", "01_footage/broll", "02_audio/voiceover", "02_audio/music",
  "02_audio/ambience", "02_audio/sfx", "03_assets", "05_exports/draft", "05_exports/final", "proxy"];
const VIDEO = /\.(mp4|mov|mxf|mts|m4v|avi|mkv)$/i, AUDIO = /\.(wav|mp3|m4a|aac|flac|aif|aiff)$/i;
const ff = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-nostdin", ...args]);

export function workDir(slug) { return path.join(ROOT, "work", slug); }
export function proxyName(rel) { return rel.replace(/^01_footage\//, "").replace(/[\\/]/g, "__").replace(/\.[^.]+$/, ".mp4"); }

export function probe(f) {
  const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", f]).toString());
  const v = j.streams.find((s) => s.codec_type === "video"), a = j.streams.find((s) => s.codec_type === "audio");
  const [n, d] = String(v?.avg_frame_rate ?? "0/1").split("/").map(Number);
  const bits = Number(v?.bits_per_raw_sample) || (/(10|12)(le|be)?$/.test(v?.pix_fmt ?? "") ? Number(/(10|12)/.exec(v.pix_fmt)[1]) : 8);
  const trc = v?.color_transfer ?? "unknown";
  const name = path.basename(f).toLowerCase(), tags = JSON.stringify(j.format.tags ?? {}).toLowerCase();
  // Log nhận theo tên file / metadata máy (S-Log, D-Log, C-Log, V-Log, F-Log, N-Log, Log3G10) hoặc đường cong HLG
  const log = /(s-?log|d-?log|c-?log|v-?log|f-?log|n-?log|log3g10|logc)/.test(name + " " + tags) ? "log" : trc === "arib-std-b67" ? "hlg" : null;
  return { dur: Number(j.format.duration), w: v?.width, h: v?.height, fps: d ? Math.round((n / d) * 100) / 100 : null, bits, pix: v?.pix_fmt, trc, log, audio: !!a, codec: v?.codec_name };
}

// Khung dọc 1080×1920: clip dọc thì co; clip ngang thì cắt giữa (mặc định) hoặc đặt giữa trên nền mờ của chính nó (fit "blur")
export function fitFilter(fit = "crop") {
  return fit === "blur"
    ? "split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.08[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"
    : "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
}

export function ingest(slug, { plan = {}, force = false } = {}) {
  const W = workDir(slug);
  for (const d of DIRS) fs.mkdirSync(path.join(W, d), { recursive: true });
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  const inLut = plan.color?.input_lut ?? {};
  const report = { clips: [], audio: [], warn: [] };
  for (const f of walk(path.join(W, "01_footage")).filter((f) => VIDEO.test(f))) {
    const rel = path.relative(W, f), cam = rel.split("/")[1], p = probe(f);
    const lut = inLut[cam] ?? inLut[rel];
    if (p.log && !lut) report.warn.push(`${rel}: footage ${p.log.toUpperCase()} (${p.bits}-bit) chưa có LUT kỹ thuật trong plan.color.input_lut["${cam}"] → màu sẽ bạc, phẳng`);
    if (p.fps && Math.abs(p.fps - 30) > 0.05 && Math.abs(p.fps - 60) > 0.05) report.warn.push(`${rel}: ${p.fps} fps → proxy đổi về 30 fps (chuyển động có thể hơi giật; quay 30/60 fps cho video dọc)`);
    const out = path.join(W, "proxy", proxyName(rel));
    const fresh = fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(f).mtimeMs && !force;
    if (!fresh) {
      const fit = plan.edit?.fit?.[cam] ?? plan.edit?.fit?.[rel] ?? "crop";
      // Log → Rec.709 bằng LUT kỹ thuật của máy (khác LUT nghệ thuật, áp sau sửa màu ở lib/build.mjs)
      const tech = lut ? `lut3d=file=${path.join(ROOT, "luts", lut)}:interp=tetrahedral,` : "";
      ff(["-i", f, "-filter_complex", `[0:v]${tech}fps=30,${fitFilter(fit)},setsar=1,format=yuv420p[v]`, "-map", "[v]", ...(p.audio ? ["-map", "0:a:0", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"] : []),
        "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-g", "30", "-keyint_min", "30", "-movflags", "+faststart", out]);
    }
    report.clips.push({ src: rel, proxy: path.relative(W, out), ...p, input_lut: lut ?? null });
  }
  for (const f of walk(path.join(W, "02_audio")).filter((f) => AUDIO.test(f))) {
    const p = probe(f);
    report.audio.push({ src: path.relative(W, f), dur: p.dur });
  }
  fs.writeFileSync(path.join(W, "ingest.json"), JSON.stringify(report, null, 1) + "\n");
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!dir) { console.error("Cách dùng: node lib/ingest.mjs projects/<video> [--force]"); process.exit(1); }
  const plan = fs.existsSync(path.join(dir, "plan.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "plan.json"), "utf8")) : {};
  const slug = plan.video ?? path.basename(path.resolve(dir));
  const r = ingest(slug, { plan, force: process.argv.includes("--force") });
  console.log(`✔ work/${slug}: ${r.clips.length} clip, ${r.audio.length} file tiếng → proxy/, ingest.json`);
  for (const c of r.clips) console.log(`  ${c.src.padEnd(34)} ${c.w}×${c.h} ${c.fps} fps ${c.bits}-bit ${c.log ?? c.trc}${c.audio ? " · có tiếng máy" : ""}`);
  for (const a of r.audio) console.log(`  ${a.src.padEnd(34)} ${a.dur.toFixed(1)} s`);
  if (r.warn.length) console.log("\nCẢNH BÁO:\n- " + r.warn.join("\n- "));
}
