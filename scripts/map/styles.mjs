// Hai giao diện bản đồ nền (style MapLibre từ @protomaps/basemaps, bỏ toàn bộ chữ/biểu tượng của bản đồ nền):
//   dark  — nền xanh than; ở góc rộng (zoom ≤ 8) tự sáng hơn để còn đọc được đường, sông, ranh khu
//   light — nền be xám nhạt, đường trắng, nước xanh nhạt
// Màu nhấn (tuyến, vùng, ghim, nhãn) lấy theo THEMES của text-presets — xem accentFor().
import { layers, namedFlavor } from "@protomaps/basemaps";
import { THEMES } from "../../text-presets/presets.mjs";

const PALETTE = {
  dark: {
    base: "dark",
    over: {
      background: "#11141b", earth: "#1c2029", water: "#0d2335", park_a: "#1c2a26", park_b: "#1d3029", wood_a: "#1e2723", wood_b: "#1e2a24",
      scrub_a: "#1f2622", scrub_b: "#1f2622", industrial: "#20232b", school: "#22232a", hospital: "#24222a", aerodrome: "#22252e", beach: "#26272b",
      buildings: "#181b22", highway: "#6b7280", highway_casing_early: "#11141b", highway_casing_late: "#11141b", major: "#4f5563", link: "#4f5563",
      minor_a: "#383d48", minor_b: "#323743", other: "#2c303a", minor_service: "#2c303a", boundaries: "#59647a", railway: "#2a2e37",
    },
    lift: 0.55, // ở zoom ≤ 8: sáng thêm 55 % (giảm dần tới zoom 12)
    lum: 0.02, hue: 220, sat: 0.1, // đo nền để contrastPlan chọn chế độ chữ
  },
  light: {
    base: "light",
    over: {
      background: "#dcd8d0", earth: "#ebe8e2", water: "#a8cfe0", park_a: "#d4e3d4", park_b: "#bfdcc4", wood_a: "#d6e2d2", wood_b: "#c3dcc0",
      scrub_a: "#d8e2d6", scrub_b: "#c9ddca", industrial: "#e1e1e6", school: "#ece4dc", hospital: "#eedfdf", aerodrome: "#e0e0e6", beach: "#efe9d6",
      buildings: "#dcd7cf", highway: "#ffffff", highway_casing_early: "#c4beb4", highway_casing_late: "#c4beb4", major: "#ffffff", link: "#ffffff",
      major_casing_early: "#cfc9bf", major_casing_late: "#cfc9bf", minor_a: "#f7f5f1", minor_b: "#f4f1ec", other: "#f1eee9", minor_service: "#f1eee9",
      boundaries: "#a39aa8", railway: "#c9c4bc",
    },
    lift: 0,
    lum: 0.75, hue: 40, sat: 0.08,
  },
};
export const STYLES = Object.keys(PALETTE);

const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
/** Pha màu với trắng/đen: k > 0 sáng lên, k < 0 tối đi. */
export const shade = (c, k) => toHex(hex(c).map((v) => (k >= 0 ? v + (255 - v) * k : v * (1 + k))));

/** Lớp nền (không có chữ) cho source "protomaps". */
/** `over`: màu đè thêm (skin của cảnh, MAP.md mục 11), cùng khóa với PALETTE[style].over. */
export function baseLayers(style, over = {}) {
  const P = PALETTE[style];
  if (!P) throw new Error(`style phải là: ${STYLES.join(", ")}`);
  const flavor = { ...namedFlavor(P.base), ...P.over, ...over };
  const L = layers("protomaps", flavor, { lang: "vi" }).filter((l) => l.type !== "symbol");
  if (!P.lift) return L;
  // dark: màu phẳng → nội suy theo zoom (góc rộng sáng hơn)
  for (const l of L)
    for (const k of ["fill-color", "line-color", "background-color"]) {
      const v = l.paint?.[k];
      if (typeof v === "string" && v.startsWith("#")) l.paint[k] = ["interpolate", ["linear"], ["zoom"], 8, shade(v, P.lift * 0.35), 12, v];
    }
  return L;
}

/** Màu nhấn cho tuyến/vùng/ghim theo theme text-preset và nền. */
export function accentFor(style, themeName) {
  const th = THEMES[themeName];
  if (!th) throw new Error(`theme phải là: ${Object.keys(THEMES).join(", ")}`);
  if (style === "light") return { line: shade(th.solid, -0.18), glow: th.solid, head: "#ffffff", fill: th.solid, casing: "#ffffff" };
  return { line: th.c1, glow: th.glow, head: "#ffffff", fill: th.solid, casing: "rgba(0,0,0,0.55)" };
}
/** Số đo nền (cho contrastPlan của text-presets). */
export const bgStat = (style) => ({ lum: PALETTE[style].lum, hue: PALETTE[style].hue, sat: PALETTE[style].sat });
