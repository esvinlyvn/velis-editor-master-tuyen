// Đo nền clip quay sau từng khối chữ chốt và tính độ tối lớp phủ (scrim) cần có để chữ không chìm (TALKING-HEAD luật 13, 15).
//   import { scrimPlan } from "../../scripts/text-contrast.mjs";
//   const plan = scrimPlan(footageMp4, KT, { color: (c) => c.o.c ?? "#ffffff" });   // → [{ lum, need, ratio, warn }] theo thứ tự KT
//
// Cách tính (chuẩn tương phản WCAG, độ sáng tuyến tính 0–1):
//   - nền: lấy 3 khung trong lúc khối hiện (đầu, giữa, cuối), cắt vùng chữ (x 140–940, y top−20 … top+330), lấy phân vị 80
//     của độ sáng điểm ảnh → chữ đặt lên chỗ sáng nhất mà vẫn phải đọc được;
//   - chữ chính (màu c của gradient) cần ≥ 3 : 1, chữ dẫn trắng cần ≥ 4,5 : 1 → nền sau lớp phủ phải tối hơn Lmax;
//   - lớp phủ đen độ phủ a làm nền còn L·(1−a) → a cần = 1 − Lmax / L (0 nếu nền vốn đã tối).
import { execFileSync } from "node:child_process";

const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const lumHex = (hex) => {
  const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

/** Phân vị p của độ sáng tuyến tính vùng [x, y, w, h] tại giây t của video (khung 1080×1920). */
export function sampleLum(mp4, t, [x, y, w, h], p = 0.8) {
  const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-ss", t.toFixed(2), "-i", mp4, "-frames:v", "1",
    "-vf", `scale=1080:1920,crop=${w}:${h}:${x}:${y},scale=${Math.round(w / 10)}:${Math.round(h / 10)}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
  const L = [];
  for (let k = 0; k < raw.length; k += 3) L.push(0.2126 * lin(raw[k]) + 0.7152 * lin(raw[k + 1]) + 0.0722 * lin(raw[k + 2]));
  L.sort((a, b) => a - b);
  return L[Math.min(L.length - 1, Math.floor(p * L.length))];
}

/** KT: [{ at, out, top, o }]. Trả về cho từng khối: lum nền, độ phủ cần (need 0–1), tương phản đạt được khi phủ đủ. */
export function scrimPlan(mp4, KT, { dur, color = (c) => c.o?.c ?? "#ffffff", heroMin = 3, leadMin = 4.5, maxA = 0.82, region } = {}) {
  return KT.map((c) => {
    const end = Math.min(c.out, dur ?? c.out, c.at + 6);
    const ts = [c.at + 0.4, (c.at + end) / 2, end - 0.25].filter((t) => t > 0 && t < (dur ?? 1e9));
    const box = region?.(c) ?? [140, Math.max(0, c.top - 20), 800, 350];
    const lum = Math.max(...ts.map((t) => sampleLum(mp4, t, box)));
    const Lh = lumHex(color(c));
    // nền tối nhất được phép: thỏa cả chữ chính (màu c) lẫn chữ dẫn trắng (L = 1)
    const Lmax = Math.min((Lh + 0.05) / heroMin - 0.05, (1 + 0.05) / leadMin - 0.05);
    const need = lum <= Lmax ? 0 : Math.min(1, 1 - Lmax / lum);
    const a = Math.min(need, maxA);
    const got = ratio(Lh, lum * (1 - a));
    return { lum: +lum.toFixed(3), need: +need.toFixed(2), a: +a.toFixed(2), ratio: +got.toFixed(1), warn: need > maxA };
  });
}
