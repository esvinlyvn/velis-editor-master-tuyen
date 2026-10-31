#!/usr/bin/env node
// lib/assemble.mjs — Bước 2–3 hậu kỳ: đồng bộ âm, dựng thô (A-roll theo kịch bản), dựng tinh (J/L-cut, B-roll, punch-in), khóa hình.
//   node lib/assemble.mjs projects/<video> [--lock | --unlock]
// Đọc plan.edit, dùng proxy của lib/ingest.mjs, ghi work/<video>/footage.mp4 (hình, không tiếng), voice.wav (lời thoại thô),
// edl.json (dòng thời gian). Sau đó: nhận diện giọng trên voice.wav → projects/<video>/transcript.json → lib/build.mjs.
//
// plan.edit:
//   voice:  "02_audio/voiceover/mic.wav"  tiếng mic thu rời (đồng bộ tự động với tiếng máy); bỏ trống = dùng tiếng máy của A-roll
//   aroll:  [{ src: "01_footage/cam_a/a.mp4", in: 1.2, out: 5.8, cut: 0.3, punch: true }]   đoạn chọn, theo thứ tự kịch bản
//           cut > 0: J-cut, nghe câu sau trước khi thấy hình (hình đoạn trước kéo dài thêm cut giây)
//           cut < 0: L-cut, thấy hình đoạn sau trước, tiếng đoạn trước còn chạy; punch: phóng 108% (đổi khung trên cùng máy, T2)
//   broll:  [{ src: "01_footage/drone/d.mp4", at: 3.0, dur: 2.4, in: 0, tr: "cut" | "dissolve", move: "push" | "drift" }]
//           phủ hình lên dòng thời gian, lời thoại chạy liền bên dưới (che điểm cắt của A-roll, giữ nhịp 2–4 s đổi hình)
//   fit:    { cam: "crop" | "blur" }  cách đưa clip ngang vào khung dọc (lib/ingest.mjs)
// Khóa hình (picture lock): --lock ghi mã băm của edit vào plan.lock. Đã khóa mà edit đổi thì dừng, trừ khi --unlock (xóa khóa).
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { workDir, proxyName, probe } from "./ingest.mjs";

const r3 = (n) => Math.round(n * 1000) / 1000;
const ff = (args) => {
  try { return execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-nostdin", ...args], { maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { throw new Error("ffmpeg lỗi:\n" + String(e.stderr).split("\n").slice(0, 6).join("\n")); }
};

// ---------- đồng bộ: tương quan chéo đường bao âm lượng (100 Hz thô, rồi 1 kHz tinh) ----------
const pcm = (f, rate, secs) => {
  const b = ff(["-i", f, "-t", String(secs), "-vn", "-ac", "1", "-ar", String(rate), "-f", "f32le", "-"]);
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4);
};
const env = (x, k) => { const n = Math.floor(x.length / k), o = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < k; j++) s += Math.abs(x[i * k + j]); o[i] = s / k; } return o; };
const center = (x) => { let m = 0; for (const v of x) m += v; m /= x.length; return x.map((v) => v - m); };
function bestLag(a, b, from, to) { // b dịch so với a: a[i] ≈ b[i + lag]
  let best = -Infinity, at = 0;
  for (let L = from; L <= to; L++) {
    let s = 0, na = 0, nb = 0;
    for (let i = Math.max(0, -L); i < a.length && i + L < b.length; i++) { s += a[i] * b[i + L]; na += a[i] * a[i]; nb += b[i + L] * b[i + L]; }
    const r = s / Math.sqrt(na * nb + 1e-12);
    if (r > best) (best = r), (at = L);
  }
  return { lag: at, r: best };
}
// mic_time = cam_time + offset
export function syncOffset(cam, mic, { secs = 90, maxLag = 20 } = {}) {
  const ka = pcm(cam, 1000, secs), kb = pcm(mic, 1000, secs + maxLag);
  const a1 = center(env(ka, 10)), b1 = center(env(kb, 10));
  const c = bestLag(a1, b1, -maxLag * 100, maxLag * 100);
  const a2 = center(env(ka, 1)), b2 = center(env(kb, 1));
  const f = bestLag(a2, b2, c.lag * 10 - 15, c.lag * 10 + 15);
  return { offset: r3(f.lag / 1000), r: Math.round(c.r * 100) / 100 };
}

export function assemble(dir, { lock = false, unlock = false } = {}) {
  const planF = path.join(dir, "plan.json"), plan = JSON.parse(fs.readFileSync(planF, "utf8"));
  const slug = plan.video ?? path.basename(path.resolve(dir)), W = workDir(slug), E = plan.edit;
  if (!E?.aroll?.length) throw new Error("plan.edit.aroll trống: liệt kê các đoạn chọn (src, in, out)");
  const src = (s) => { const p = path.join(W, "proxy", proxyName(s)); if (!fs.existsSync(p)) throw new Error(`Chưa có proxy cho ${s}: chạy node lib/ingest.mjs ${dir}`); return p; };

  // ---------- khóa hình ----------
  const stamp = (s) => { const f = path.join(W, s); return fs.existsSync(f) ? `${s}:${fs.statSync(f).size}` : s; };
  const hash = crypto.createHash("sha1").update(JSON.stringify(E)).update([...new Set([...E.aroll, ...(E.broll ?? [])].map((x) => x.src)), E.voice ?? ""].map(stamp).join("|")).digest("hex").slice(0, 12);
  if (unlock) { delete plan.lock; fs.writeFileSync(planF, JSON.stringify(plan, null, 1) + "\n"); console.log("mở khóa hình"); }
  else if (plan.lock && plan.lock !== hash) throw new Error(`Hình đã khóa (${plan.lock}) mà plan.edit đã đổi (${hash}). Khách duyệt đổi thứ tự/thời lượng thì chạy lại với --unlock, rồi làm lại transcript, chữ, SFX.`);

  // ---------- âm: đồng bộ mic rời ----------
  const cams = [...new Set(E.aroll.map((s) => s.src))];
  const off = {};
  if (E.voice) {
    const mic = path.join(W, E.voice);
    if (!fs.existsSync(mic)) throw new Error(`Thiếu ${E.voice}`);
    const cacheF = path.join(W, "sync.json"), cache = fs.existsSync(cacheF) ? JSON.parse(fs.readFileSync(cacheF, "utf8")) : {};
    for (const c of cams) {
      const key = `${c}|${E.voice}|${fs.statSync(mic).size}`;
      if (!cache[key]) {
        if (!probe(src(c)).audio) throw new Error(`${c} không có tiếng máy để đồng bộ với mic`);
        cache[key] = syncOffset(src(c), mic);
      }
      off[c] = cache[key].offset;
      console.log(`đồng bộ ${c} ↔ ${E.voice}: lệch ${off[c]} s (tương quan ${cache[key].r})${cache[key].r < 0.5 ? "  ⚠ thấp: kiểm tay" : ""}`);
    }
    fs.writeFileSync(cacheF, JSON.stringify(cache, null, 1) + "\n");
  }

  // ---------- dòng thời gian: tiếng nối liền, ranh giới hình lệch theo cut (J/L) ----------
  let t = 0;
  const seg = E.aroll.map((s, k) => { const len = s.out - s.in; if (len <= 0) throw new Error(`aroll[${k}]: out phải lớn hơn in`); const g = { ...s, A: r3(t), len }; t += len; return g; });
  const TOTAL = r3(t), TAIL = plan.tail ?? 0.3; // đuôi video sau lời cuối (lib/build.mjs): hình đoạn cuối chạy tiếp, không treo khung
  const pic = seg.map((s, k) => {
    const c0 = k ? seg[k].cut ?? 0 : 0, c1 = seg[k + 1]?.cut ?? (k === seg.length - 1 ? TAIL : 0);
    return { src: s.src, from: r3(s.in + c0), to: r3(s.out + c1), punch: s.punch };
  });
  for (const [k, p] of pic.entries()) {
    const d = probe(src(p.src)).dur;
    if (p.from < 0 || p.to > d + 0.01) throw new Error(`aroll[${k}]: J/L-cut hoặc đuôi video (tail) kéo hình ra ngoài clip (${p.from}–${p.to} s, clip dài ${d.toFixed(2)} s)`);
  }

  // ---------- hình: ghép A-roll, phủ B-roll ----------
  const inputs = [...new Set([...pic.map((p) => p.src), ...(E.broll ?? []).map((b) => b.src)])];
  const idx = Object.fromEntries(inputs.map((s, i) => [s, i]));
  const fc = pic.map((p, k) => `[${idx[p.src]}:v]trim=start=${p.from}:end=${p.to},setpts=PTS-STARTPTS${p.punch ? ",scale=1166:2074,crop=1080:1920" : ""},setsar=1,fps=30,format=yuv420p[p${k}]`);
  fc.push(`${pic.map((_, k) => `[p${k}]`).join("")}concat=n=${pic.length}:v=1:a=0[v0]`);
  let last = "v0";
  for (const [j, b] of (E.broll ?? []).entries()) {
    if (b.at < 0 || b.at + b.dur > TOTAL + 0.01) throw new Error(`broll[${j}]: ${b.at}–${b.at + b.dur} s nằm ngoài dòng thời gian (${TOTAL} s)`);
    const mv = b.move === "push" ? `scale=w='1080*(1+0.08*t/${b.dur})':h=-2:eval=frame,crop=1080:1920` : b.move === "drift" ? `scale=1188:2112,crop=1080:1920:x='(iw-ow)*t/${b.dur}':y='(ih-oh)/2'` : "null";
    const fade = b.tr === "dissolve" ? `,format=yuva420p,fade=t=in:st=0:d=0.2:alpha=1,fade=t=out:st=${r3(b.dur - 0.2)}:d=0.2:alpha=1` : "";
    fc.push(`[${idx[b.src]}:v]trim=start=${b.in ?? 0}:duration=${b.dur},setpts=PTS-STARTPTS,${mv},setsar=1,fps=30${fade},setpts=PTS+${b.at}/TB[b${j}]`);
    fc.push(`[${last}][b${j}]overlay=enable='between(t,${b.at},${r3(b.at + b.dur)})':eof_action=pass[v${j + 1}]`);
    last = `v${j + 1}`;
  }
  fs.mkdirSync(W, { recursive: true });
  ff([...inputs.flatMap((s) => ["-i", src(s)]), "-filter_complex", fc.join(";"), "-map", `[${last}]`, "-t", String(r3(TOTAL + TAIL)), "-an",
    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-g", "30", "-keyint_min", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(W, "footage.mp4")]);

  // ---------- lời thoại: các đoạn A-roll nối liền, vuốt 10 ms ở mỗi mối nối (không tiếng tách) ----------
  const aIn = E.voice ? [path.join(W, E.voice)] : cams.map(src);
  const afc = seg.map((s, k) => {
    const i = E.voice ? 0 : cams.indexOf(s.src), o = E.voice ? off[s.src] : 0;
    return `[${i}:a]atrim=start=${r3(s.in + o)}:end=${r3(s.out + o)},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,afade=t=in:d=0.01,afade=t=out:st=${r3(s.len - 0.01)}:d=0.01[a${k}]`;
  });
  afc.push(`${seg.map((_, k) => `[a${k}]`).join("")}concat=n=${seg.length}:v=0:a=1[a]`);
  ff([...aIn.flatMap((f) => ["-i", f]), "-filter_complex", afc.join(";"), "-map", "[a]", "-c:a", "pcm_s16le", path.join(W, "voice.wav")]);

  const edl = { hash, total: TOTAL, aroll: seg.map((s, k) => ({ at: s.A, len: r3(s.len), src: s.src, in: s.in, out: s.out, pic: pic[k], cut: s.cut ?? 0 })), broll: E.broll ?? [], sync: off };
  fs.writeFileSync(path.join(W, "edl.json"), JSON.stringify(edl, null, 1) + "\n");
  if (lock) { plan.lock = hash; fs.writeFileSync(planF, JSON.stringify(plan, null, 1) + "\n"); }
  return edl;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!dir) { console.error("Cách dùng: node lib/assemble.mjs projects/<video> [--lock | --unlock]"); process.exit(1); }
  const e = assemble(dir, { lock: process.argv.includes("--lock"), unlock: process.argv.includes("--unlock") });
  console.log(`✔ dựng ${e.aroll.length} đoạn A-roll, ${e.broll.length} B-roll · ${e.total} s · edl ${e.hash}${process.argv.includes("--lock") ? " · ĐÃ KHÓA HÌNH" : ""}`);
  for (const s of e.aroll) console.log(`  ${String(s.at).padStart(7)} +${s.len.toFixed(2)}  ${s.src} ${s.in}–${s.out}${s.cut ? ` · ${s.cut > 0 ? "J" : "L"}-cut ${Math.abs(s.cut)} s` : ""}${s.pic.punch ? " · punch-in" : ""}`);
  for (const b of e.broll) console.log(`  B-roll ${b.at}–${r3(b.at + b.dur)}  ${b.src} ${b.tr ?? "cut"}${b.move ? " · " + b.move : ""}`);
  console.log("Tiếp: nhận diện giọng trên work/<video>/voice.wav → transcript.json, rồi node lib/build.mjs");
}
