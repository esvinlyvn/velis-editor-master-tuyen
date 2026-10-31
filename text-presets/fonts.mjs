// Font cho thư viện text preset — chép woff2 (chỉ subset latin + vietnamese) từ @fontsource vào <outDir>/assets/fonts,
// trả về CSS @font-face trỏ tới đó. Chạy hoàn toàn trên máy.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// [gói @fontsource, file css (độ đậm[-italic])]
export const FONT_FILES = [
  ["anton", "400"],
  ["barlow-condensed", "800"], ["barlow-condensed", "800-italic"],
  ["montserrat", "800"], ["montserrat", "900"], ["montserrat", "900-italic"],
  ["be-vietnam-pro", "300"], ["be-vietnam-pro", "400"], ["be-vietnam-pro", "500"], ["be-vietnam-pro", "600"], ["be-vietnam-pro", "700"], ["be-vietnam-pro", "800"],
  ["lexend", "600"],
  ["playfair-display", "400"], ["playfair-display", "500"], ["playfair-display", "700"], ["playfair-display", "400-italic"],
  ["great-vibes", "400"],
  ["dancing-script", "700"], // chữ viết tay thay thế: móc ư/ơ rõ hơn Great Vibes (presetHtml hand: true)
];

// chuỗi document.fonts.load cho mọi font của thư viện ('700 100px "Be Vietnam Pro"', 'italic 800 100px "Barlow Condensed"'…):
// trang chờ tải xong mới đo bố cục (lib/build.mjs)
export const fontLoads = () => FONT_FILES.map(([pkg, w]) => {
  const fam = /font-family:\s*'([^']+)'/.exec(fs.readFileSync(path.join(ROOT, "node_modules/@fontsource", pkg, `${w}.css`), "utf8"))[1];
  return `${w.includes("italic") ? "italic " : ""}${parseInt(w)} 100px "${fam}"`;
});

export function fontCss(outDir, rel = "assets/fonts") {
  const dst = path.join(outDir, rel);
  fs.mkdirSync(dst, { recursive: true });
  let css = "";
  for (const [pkg, file] of FONT_FILES) {
    const dir = path.join(ROOT, "node_modules/@fontsource", pkg);
    const src = fs.readFileSync(path.join(dir, `${file}.css`), "utf8");
    for (const block of src.match(/@font-face\s*{[^}]*}/g) ?? []) {
      if (!/-(latin|vietnamese)-\d/.test(block) || /latin-ext/.test(block)) continue;
      css += block.replace(/url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\),\s*url\([^)]+\) format\('woff'\)/g, (_, f) => {
        fs.copyFileSync(path.join(dir, "files", f), path.join(dst, f));
        return `url(${rel}/${f}) format('woff2')`;
      }) + "\n";
    }
  }
  return css;
}
