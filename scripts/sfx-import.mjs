#!/usr/bin/env node
// Nhập & chuẩn hóa thư viện SFX dùng chung.
//   node scripts/sfx-import.mjs <thư-mục-nguồn>
// Mỗi file: cắt lặng đầu/cuối, cắt độ dài tối đa, fade-out, đưa về mức âm lượng chuẩn
// (thấp hơn voice -14 LUFS khoảng 14–18 dB, đỉnh bị chặn) → sfx/<tên>.wav + sfx/catalog.json
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
const OUT = path.resolve("sfx");
fs.mkdirSync(OUT, { recursive: true });

// Nhóm → mức trung bình mục tiêu (dB), đỉnh tối đa (dBFS), độ dài tối đa (s)
const CLASS = {
  ui: { mean: -31, peak: -9, max: 1.2 },
  transition: { mean: -30, peak: -8, max: 1.6 },
  impact: { mean: -28, peak: -6, max: 2.0 },
  accent: { mean: -30, peak: -8, max: 3.0 },
  ambience: { mean: -36, peak: -14, max: 4.0 },
  bed: { mean: -40, peak: -24, max: 15.0 }, // âm nền dài (quán đông người…), đặt rất nhỏ dưới voice
};
// Tên → nhóm + nhãn gợi ý dùng
const META = {
  "whoosh-soft": ["transition", "chuyển cảnh nhẹ, mờ dần"],
  "whoosh-fast": ["transition", "chuyển cảnh nhanh, đẩy/trượt"],
  swipe: ["transition", "lướt thẻ, đổi bước"],
  pop: ["ui", "thẻ/chip/icon bật ra"],
  click: ["ui", "nhấn, chọn mục"],
  toggle: ["ui", "bật/tắt, so sánh A/B"],
  scroll: ["ui", "cuộn danh sách"],
  type: ["ui", "gõ chữ, nhập số"],
  send: ["ui", "gửi tin/file"],
  like: ["ui", "tương tác mạng xã hội"],
  notify: ["ui", "tin nhắn/thông báo đến"],
  tick: ["ui", "đồng hồ, số đếm"],
  success: ["accent", "đúng, hoàn thành, kết quả tốt"],
  "ding-idea": ["accent", "ý tưởng, mẹo, 'à ra vậy'"],
  shimmer: ["accent", "nhẹ nhõm, sáng tỏ, kết đẹp"],
  coin: ["accent", "tiết kiệm, tiền lẻ"],
  cash: ["accent", "ra số tiền, lợi nhuận"],
  "chart-up": ["accent", "tăng trưởng, giá tăng"],
  lose: ["accent", "thua lỗ, kết quả tệ"],
  receipt: ["accent", "hóa đơn in ra"],
  scribble: ["accent", "gạch chữ, quẹt highlight"],
  oops: ["accent", "sai lầm, 'chết rồi' (hài)"],
  "sad-trombone": ["accent", "thất bại kiểu hài"],
  gasp: ["accent", "bất ngờ"],
  "record-scratch": ["accent", "khựng lại, 'khoan đã'"],
  "phone-vibrate": ["accent", "điện thoại rung, áp lực"],
  alarm: ["accent", "hẹn giờ, deadline"],
  "door-open": ["accent", "mở cửa, vào nhà"],
  riser: ["accent", "dồn nhịp ngắn trước câu quan trọng"],
  "riser-long": ["accent", "dồn nhịp dài trước khi lộ kết quả"],
  hit: ["impact", "hook, câu chốt"],
  punch: ["impact", "chữ đập vào khung"],
  stamp: ["impact", "nhãn/dấu đập xuống"],
  snap: ["impact", "búng tay, đổi ý nhanh"],
  "bass-drop": ["impact", "lộ kết quả bất ngờ"],
  "door-slam": ["impact", "chốt, đóng lại"],
  crickets: ["ambience", "im lặng ngượng ngùng"],
  "whoosh-heavy": ["transition", "chuyển chương lớn, có bass"],
  "zoom-in": ["transition", "phóng vào chi tiết"],
  "page-turn": ["transition", "lật trang, sang ý mới"],
  cymbal: ["impact", "chốt câu cuối, ta-da"],
  boing: ["accent", "bất ngờ kiểu hài"],
  "wrong-buzzer": ["accent", "sai, bị loại"],
  alert: ["accent", "cảnh báo"],
  "paper-rustle": ["accent", "giấy tờ, hợp đồng"],
  "phone-ring": ["accent", "chuông điện thoại reo"],
  "hang-up": ["ui", "cúp máy"],
  lock: ["ui", "khóa, bảo vệ"],
  unlock: ["ui", "mở khóa, được rồi"],
  "crowd-chatter": ["bed", "nền quán đông người"],
  heartbeat: ["ambience", "hồi hộp, lo lắng"],
  "tick-tock": ["ambience", "áp lực thời gian"],
  suspense: ["ambience", "bí ẩn, 'nhưng mà…'"],
  "boom-heavy": ["impact", "boom rất mạnh, cú sốc/tiết lộ lớn"],
  slide: ["transition", "khung/ảnh trượt vào, đổi slide"],
  "whoosh-double": ["transition", "whoosh kép, đổi 2 ý liên tiếp"],
  "pop-multi": ["ui", "nhiều chip/icon bật ra liên tiếp"],
  camera: ["ui", "chụp ảnh nhà/căn hộ, chụp màn hình"],
  "pen-click": ["ui", "bấm bút, ký hợp đồng"],
  knock: ["accent", "gõ cửa, ghé xem nhà"],
  "coin-shake": ["accent", "lắc ống heo, tích lũy tiền"],
  sparkle: ["accent", "lấp lánh, điểm sáng của căn nhà"],
  reward: ["accent", "phần thưởng, ưu đãi, quà tặng"],
  jackpot: ["accent", "trúng lớn, lãi đậm"],
  beep: ["ui", "bíp giao diện, đánh dấu mục"],
  glitch: ["transition", "nhiễu/lỗi, tin giả, chuyển cảnh giật"],
  crumple: ["accent", "vò giấy, gạt bỏ phương án"],
  "paper-tear": ["accent", "xé giấy, hủy hợp đồng/cọc"],
  "riser-drop": ["accent", "dồn rồi đập bass, lộ kết quả"],
  doink: ["accent", "ngớ ngẩn nhẹ, hài"],
  creak: ["accent", "cửa/sàn kẽo kẹt, nhà cũ xuống cấp"],
  bruh: ["accent", "'bruh', cạn lời (meme)"],
  bonk: ["impact", "cốc đầu, sai ngớ ngẩn (hài)"],
  wow: ["accent", "'wow', trầm trồ"],
  confetti: ["accent", "chúc mừng, chốt deal thành công"],
  cheer: ["accent", "reo hò, ăn mừng"],
  "glass-break": ["impact", "đổ vỡ, vỡ mộng"],
  thunder: ["accent", "tin sốc, sét đánh ngang tai"],
  gong: ["accent", "cồng, chốt mạnh/khai trương"],
  check: ["ui", "tích ✓ từng mục checklist"],
  rewind: ["accent", "tua lại, quay về quá khứ/giá năm xưa"],
  fall: ["accent", "rơi xuống, giá giảm"],
  slash: ["accent", "chém giá, cắt giảm"],
  aww: ["accent", "'ôi…' tiếc nuối"],
  reveal: ["transition", "lộ hình/ảnh căn nhà"],
  ting: ["accent", "'ting' sáng, chốt nhẹ"],
  shock: ["accent", "sốc, choáng"],
  "title-in": ["accent", "hiện tiêu đề kiểu bản tin"],
  confirm: ["ui", "xác nhận, chọn đáp án"],
  "dun-dun": ["accent", "'tèn ten', kịch tính, phát hiện điều bất ngờ"],
  sting: ["accent", "nốt giật mình, tiết lộ rủi ro"],
  bell: ["accent", "chuông, hết giờ/kết thúc"],
  surprise: ["accent", "bất ngờ"],
  question: ["accent", "'ủa?', thắc mắc"],
  awkward: ["accent", "ngượng, 'hơi sai sai'"],  "text-tick": ["ui", "nhãn/chữ phụ hiện ra, lớp tiếng nhỏ (nhẹ hơn title-in)"],
  open: ["accent", "thẻ chính, khung nhấn mạnh, chữ chốt hiện ra"],
  thock: ["impact", "khung chốt lại, punch-in, chuyển bối cảnh gọn"],
  meter: ["ui", "số bắt đầu chạy, thanh đo bắt đầu lên"],
  "error-soft": ["accent", "ý sai, tụt, tiêu cực (nhẹ hơn wrong-buzzer)"],
};

const vol = (f) => {
  const o = execFileSync("bash", ["-c", 'ffmpeg -hide_banner -i "$0" -af volumedetect -f null - 2>&1', f]).toString();
  return { mean: +o.match(/mean_volume: ([-\d.]+)/)[1], max: +o.match(/max_volume: ([-\d.]+)/)[1] };
};
const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString();

// SFX bị cấm, không nhập lại vào thư viện
const BANNED = new Set(["scribble-2"]);

const catalog = fs.existsSync(path.join(OUT, "catalog.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "catalog.json"))) : {};
for (const file of fs.readdirSync(src).filter((f) => /\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(f)).sort()) {
  const name = path.basename(file, path.extname(file)).toLowerCase();
  if (BANNED.has(name)) { console.log(`bỏ qua ${name} (bị cấm)`); continue; }
  // "pop-2" = phiên bản 2 của "pop" (file không đánh số = phiên bản 1)
  const base = name.replace(/-(\d+)$/, "");
  const variant = name === base ? 1 : Number(name.match(/-(\d+)$/)[1]);
  const [cls, use] = META[base] ?? ["accent", ""];
  const C = CLASS[cls];
  const tmp = path.join(OUT, `.${name}.tmp.wav`);
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.01";
  // 1) cắt lặng đầu/cuối + cắt độ dài + fade-out
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", path.join(src, file), "-af",
    `highpass=f=40,${trim},areverse,${trim},areverse,atrim=0:${C.max},afade=t=out:st=${Math.max(0, C.max - 0.25)}:d=0.25`, "-ar", "48000", "-ac", "2", tmp]);
  const d = dur(tmp);
  const fadeAt = Math.max(0, d - Math.min(0.12, d * 0.3));
  // 2) đưa về mức chuẩn: tăng/giảm tới mean mục tiêu nhưng không để đỉnh vượt ngưỡng
  const v = vol(tmp);
  // Tăng/giảm tới mức trung bình mục tiêu; âm quá nhọn thì cho vượt tối đa 6 dB rồi để limiter chặn đỉnh
  // → các phiên bản cùng tên (pop, pop-2…) nghe đều nhau thay vì bản to bản nhỏ.
  const gain = Math.min(C.mean - v.mean, C.peak - v.max + 6);
  const lim = Math.pow(10, C.peak / 20).toFixed(4);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tmp, "-af", `volume=${gain.toFixed(1)}dB,alimiter=limit=${lim}:attack=1:release=30:level=false,afade=t=out:st=${fadeAt.toFixed(3)}:d=${(d - fadeAt).toFixed(3)}`,
    path.join(OUT, `${name}.wav`)]);
  fs.rmSync(tmp);
  const after = vol(path.join(OUT, `${name}.wav`));
  catalog[name] = { file: `${name}.wav`, base, variant, class: cls, use, duration: Math.round(d * 100) / 100, mean: after.mean, peak: after.max };
  console.log(`${name.padEnd(15)} ${cls.padEnd(10)} ${d.toFixed(2)}s  mean ${after.mean}  peak ${after.max}`);
}
fs.writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log(`→ sfx/catalog.json · ${Object.keys(catalog).length} SFX`);
