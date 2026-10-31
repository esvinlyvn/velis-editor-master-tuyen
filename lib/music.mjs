// lib/music.mjs — nhạc nền (VAN-HANH mục 5, quyết định M5). Chỉ dùng khi khách gửi nhạc hoặc brand.json có, và có quyền dùng.
//   duck(): hạ nhạc dưới giọng theo giờ lời nói trong transcript (không đoán bằng sidechain → kết quả lặp lại y hệt).
//     bed_db: mức nhạc lúc không nói (mặc định −6 dB so với mức chuẩn −20 LUFS) · duck_db: lúc có giọng (mặc định −20, khoảng −18…−24)
//   beatGrid(): mốc cắt cho đoạn montage theo phách (mỗi `every` phách một cú cắt; 4 phách ≈ 1 ô nhịp).
import { execFileSync } from "node:child_process";

export function duck(music, T, out, { dur, bed_db = -6, duck_db = -20, attack = 0.15, release = 0.4 } = {}) {
  // gộp các quãng nói cách nhau < 0,5 s để biểu thức ngắn và nhạc không nhấp nhô giữa câu
  const spans = [];
  for (const c of T.chunks) {
    const last = spans.at(-1);
    if (last && c.start - last[1] < 0.5) last[1] = c.end; else spans.push([c.start, c.end]);
  }
  // w(t) = 1 khi đang nói, dốc lên `attack` giây trước câu, dốc xuống `release` giây sau câu
  const term = ([a, b]) => `clip((t-${(a - attack).toFixed(2)})/${attack},0,1)*clip((${(b + release).toFixed(2)}-t)/${release},0,1)`;
  const w = spans.length ? `min(1,${spans.map(term).join("+")})` : "0";
  const vol = `pow(10,(${bed_db}+(${duck_db - bed_db})*${w})/20)`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", music, "-af",
    `loudnorm=I=-20:TP=-2:LRA=11,volume=eval=frame:volume='${vol}',afade=t=out:st=${Math.max(0, dur - 1.5)}:d=1.5`,
    "-t", String(dur), "-ar", "48000", out]);
  return { spans: spans.length };
}

export function beatGrid(bpm, { offset = 0, from, to, every = 4 } = {}) {
  const step = (60 / bpm) * every, out = [];
  for (let t = offset; t <= to + 1e-6; t += step) if (t >= from - 1e-6) out.push(Math.round(t * 100) / 100);
  return out;
}
