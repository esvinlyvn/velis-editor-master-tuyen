// lib/audio.mjs — âm thanh 4 lớp (VAN-HANH mục 5). Lớp SFX ở lib/plan.mjs + scripts/sfx-cues.mjs, lớp nhạc ở lib/music.mjs.
//   dialogue(): lời thoại rõ, đều, không tạp âm — lọc dưới 80 Hz → khử ồn nhẹ → EQ (bớt "bùn" 300 Hz, thêm độ rõ 3 kHz)
//               → de-ess → nén 3:1 → −14 LUFS, đỉnh −1,5 dBTP. plan.audio.dialogue ghi đè: { denoise, eq, ratio, deess }.
//   ambience(): tiếng môi trường nền (gió, phố, quán) cho cảnh có không gian; lặp đủ dài, mức cố định thấp dưới giọng
//               (mặc định −38 LUFS ≈ thấp hơn giọng 24 dB), vuốt vào/ra 1 s. Chỉ dùng tiếng có quyền dùng.
import { execFileSync } from "node:child_process";

const ff = (args) => {
  try { return execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-nostdin", ...args], { stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { throw new Error("ffmpeg lỗi:\n" + String(e.stderr).split("\n").slice(0, 6).join("\n")); }
};

export function dialogueChain({ denoise = true, eq = true, deess = true, ratio = 3 } = {}) {
  return [
    "highpass=f=80",
    denoise && "afftdn=nr=10:nf=-45:tn=1", // khử ồn nền nhẹ (10 dB), theo dõi ồn liên tục; mạnh hơn sẽ làm giọng "dưới nước"
    eq && "equalizer=f=300:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.5:g=2",
    deess && "deesser=i=0.35:m=0.5:f=0.5",
    `acompressor=threshold=-20dB:ratio=${ratio}:attack=8:release=120:makeup=2`,
    "loudnorm=I=-14:TP=-1.5:LRA=5",
  ].filter(Boolean).join(",");
}

export function dialogue(input, out, opts = {}) {
  ff(["-i", input, "-af", dialogueChain(opts), "-ar", "48000", "-ac", "1", out]);
}

export function ambience(input, out, { dur, lufs = -38 } = {}) {
  ff(["-stream_loop", "-1", "-i", input, "-t", String(dur), "-af",
    `loudnorm=I=${lufs}:TP=-9:LRA=11,afade=t=in:d=1,afade=t=out:st=${Math.max(0, dur - 1)}:d=1`, "-ar", "48000", "-ac", "1", out]);
}
