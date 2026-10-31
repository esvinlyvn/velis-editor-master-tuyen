#!/usr/bin/env node
// Sinh LUT nghệ thuật (creative LUT) của repo, tự tạo nên dùng và phát hành tự do (luts/SOURCES.md).
//   node luts/make-luts.mjs   → luts/am-nhe.cube, luts/mat-sang.cube (33×33×33)
// Áp SAU bước sửa màu, trộn 50–80% (plan.color.lut + strength). Cả hai giữ da người tự nhiên: dịch màu nhỏ,
// giữ độ sáng vùng trung tính, đường cong S nhẹ cho tương phản.
//   am-nhe   ấm nhẹ: vùng sáng hơi vàng, vùng tối giữ nguyên — nhà ở, nhà phố, đất nền (mood gần gũi)
//   mat-sang sáng, hơi lạnh: vùng sáng hơi xanh, vùng tối trung tính, bão hòa giảm nhẹ — căn hộ cao cấp, văn phòng (mood sạch)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url)), N = 33;
const clamp = (x) => Math.min(1, Math.max(0, x));
const S = (x, k) => clamp(x + k * x * (1 - x) * (x - 0.5) * 2); // S nhẹ: k > 0 tối hơn dưới 0,5, sáng hơn trên 0,5; giữ 0, 0,5, 1
const LUTS = {
  "am-nhe": ([r, g, b]) => {
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const warm = 0.022 * l; // ấm theo độ sáng: vùng tối gần như giữ nguyên
    return [S(r + warm, 0.15), S(g + warm * 0.3, 0.15), S(b - warm * 0.55, 0.15)];
  },
  "mat-sang": ([r, g, b]) => {
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b, sat = 0.92;
    const [r2, g2, b2] = [r, g, b].map((c) => l + (c - l) * sat);
    const cool = 0.025 * l;
    return [S(r2 - cool * 0.6 + 0.01, 0.15), S(g2 + 0.01, 0.15), S(b2 + cool + 0.01, 0.15)];
  },
};
for (const [name, fn] of Object.entries(LUTS)) {
  const lines = [`TITLE "${name} (bds-editor, tự tạo)"`, `LUT_3D_SIZE ${N}`, "DOMAIN_MIN 0 0 0", "DOMAIN_MAX 1 1 1"];
  for (let b = 0; b < N; b++) for (let g = 0; g < N; g++) for (let r = 0; r < N; r++) lines.push(fn([r / (N - 1), g / (N - 1), b / (N - 1)]).map((v) => v.toFixed(6)).join(" "));
  fs.writeFileSync(path.join(HERE, `${name}.cube`), lines.join("\n") + "\n");
  console.log(`✔ luts/${name}.cube`);
}
