#!/usr/bin/env node
// Dựng bộ mẫu cho thư viện text preset:
//   node text-presets/gallery.mjs [--no-render]
// Ra build/text-presets/:
//   index.html + output.mp4  — video dọc: từng preset diễn hoạt vào – giữ – ra (2,6 s/preset), có nhãn số và tên
//   catalog-1..6.png         — 6 trang × 10 preset tĩnh (trang 1–4 như video mẫu, 5–6 là 4 bộ mới), để tra nhanh
//   bo-moi-tren-video.png    — 4 bộ mới đặt trên khung hình thật (footage + màu thương hiệu)
// Kiểm tự động (dừng nếu lỗi): mỗi preset rộng ≤ 960 px; không chữ nào bị hai màu (phần chữ nằm ngoài lớp tô gradient).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { PRESETS, presetHtml, presetJs, presetRuntime } from "./presets.mjs";
import { fontCss } from "./fonts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(ROOT, "build", "text-presets");
const TMP = path.join(ROOT, "work", "text-presets");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets/vendor"), { recursive: true });
fs.mkdirSync(TMP, { recursive: true });
fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(OUT, "assets/vendor/gsap.min.js"));
const FONTS = fontCss(OUT);
const CSS = fs.readFileSync(path.join(HERE, "presets.css"), "utf8");
const BG = `#root { position: relative; width: 1080px; height: 1920px; overflow: hidden;
  background: radial-gradient(120% 70% at 50% 40%, #1a1012 0%, #0b0809 55%, #050405 100%); }
.lbl { position: absolute; left: 60px; right: 60px; font-family: "Be Vietnam Pro", sans-serif; color: rgba(255,255,255,.55); opacity: 0; }
.lbl b { color: #FF8A3D; font-weight: 800; margin-right: 14px; }`;

const SLOT = 2.6;
const DUR = +(PRESETS.length * SLOT + 0.4).toFixed(2);

// ---------- video demo ----------
const html = [], js = [];
PRESETS.forEach((p, i) => {
  const at = +(0.2 + i * SLOT).toFixed(2);
  html.push(presetHtml(p.id, [], { id: `p${i}`, left: 540, top: 760 }));
  html.push(`<div class="lbl" id="l${i}" style="top:1500px;font-size:34px"><b>#${String(i + 1).padStart(2, "0")}</b>${p.name.replace(/[<>&]/g, "")}<div style="font-size:28px;margin-top:10px;color:rgba(255,255,255,.4)">${p.use}</div></div>`);
  js.push(presetJs(p.id, `#p${i}`, at, { hold: SLOT - 0.15 }));
  js.push(`tl.fromTo("#l${i}", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${at}); tl.to("#l${i}", { opacity: 0, duration: 0.25 }, ${+(at + SLOT - 0.4).toFixed(2)});`);
});
fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>Text presets</title><script src="assets/vendor/gsap.min.js"></script><style>${FONTS}
body { margin: 0; background: #000; } ${CSS} ${BG}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${DUR}">
${html.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${js.join("\n")}
tl.set({}, {}, ${DUR});
window.__timelines["main"] = tl;
</script>${presetRuntime()}</body></html>`);

// ---------- catalog tĩnh + kiểm ----------
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
// ảnh tĩnh = khung thật của timeline sau khi mọi diễn hoạt vào và hiệu ứng màu đã xong (không phải CSS tĩnh):
// chuỗi màu dừng ở màu cuối, gạch báo động đã tắt, hạt lấp lánh đã tắt — đúng như khung cuối ổn định của video mẫu
const SETTLE = 3.4;
const settled = (items) => items.map(([pid, sel, theme]) => presetJs(pid, sel, 0, { exit: false, theme })).join("\n");
const pageHtml = (body, extra = "", js = "") => `<!doctype html><html><head><meta charset="utf-8"><script src="assets/vendor/gsap.min.js"></script><style>${FONTS} body{margin:0;background:#000} ${CSS} ${BG} ${js ? "" : ".tp{opacity:1}"} ${extra}</style></head><body><div id="root">${body}</div>${presetRuntime()}<script>const tl = gsap.timeline({ paused: true });\n${js}\ntl.seek(${SETTLE});</script></body></html>`;
const load = async (body, extra, js) => { fs.writeFileSync(path.join(OUT, "_page.html"), pageHtml(body, extra, js)); await page.goto("file://" + path.join(OUT, "_page.html")); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(60); };

const errs = [];
const jobs = [];
for (const [i, p] of PRESETS.entries()) {
  const one = presetHtml(p.id, [], { id: "x", left: 540, top: 500 });
  const oneJs = settled([[p.id, "#x"]]);
  await load(one, "", oneJs);
  // khung thật của chữ: hợp mọi ký tự, trang trí, hộp (kể cả dòng lệch ngang)
  const r = await page.evaluate(() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const e of document.querySelectorAll("#x .ch, #x .tp-deco, #x .in, #x .big")) { const b = e.getBoundingClientRect(); if (!b.width) continue; x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); }
    const s = document.querySelector(".tp-pos")._s ?? 1; // runtime đã thu nhỏ → đo lại bề rộng gốc
    return { x: x0, y: y0, w: (x1 - x0) / s, h: y1 - y0 }; });
  if (r.w > 960) errs.push(`#${i + 1} ${p.id} rộng ${Math.round(r.w)} px`);
  if (p.lines.some((l) => typeof l.fill === "string" && l.fill.includes("rgba(255,255,255,0)"))) continue; // preset cố ý tan dần
  const clip = { x: 0, y: Math.max(0, Math.floor(r.y - 160)), width: 1080, height: Math.ceil(r.h + 320) };
  const off = "#root{background:none!important} .tp-line{filter:none!important} .tp-deco,.hd-dot,.tp-vbar,.tp-pill{display:none!important} .boxed .in,.outlined .in,.hl{background:none!important;box-shadow:none!important}";
  await load(one, off, oneJs);
  const fill_png = path.join(TMP, `fill-${i}.png`); await page.screenshot({ path: fill_png, omitBackground: true, clip });
  await load(one, off + " .ch{background:none!important;color:#fff!important}", oneJs);
  const base_png = path.join(TMP, `base-${i}.png`); await page.screenshot({ path: base_png, omitBackground: true, clip });
  jobs.push({ id: i, fill_png, base_png });
}
fs.writeFileSync(path.join(TMP, "uncovered.json"), JSON.stringify(jobs));
const uc = JSON.parse(execFileSync("python3", ["-I", path.join(ROOT, "scripts/bg-sample.py"), "uncovered", path.join(TMP, "uncovered.json")]).toString());
for (const o of uc) if (o.uncovered > 0) errs.push(`#${o.id + 1} ${PRESETS[o.id].id}: ${o.uncovered} điểm ảnh chữ ngoài lớp tô (chữ hai màu)`);

// 4 trang catalog, 2 cột × 5 hàng, thu 0,52
for (let pg = 0; pg < Math.ceil(PRESETS.length / 10); pg++) {
  const body = PRESETS.slice(pg * 10, pg * 10 + 10).map((p, k) => {
    const col = k < 5 ? 0 : 1, row = k % 5;
    return presetHtml(p.id, [], { id: `c${k}`, left: col ? 800 : 280, top: 170 + row * 345, scale: 0.52 }) +
      `<div class="lbl" style="opacity:1;top:${row * 345 + 470}px;left:${col ? 560 : 40}px;width:480px;font-size:22px;text-align:center"><b>#${pg * 10 + k + 1}</b>${p.id}</div>`;
  }).join("");
  await load(body + `<div class="lbl" style="opacity:1;top:40px;font-size:40px;color:#fff"><b>TEXT PRESETS</b>trang ${pg + 1}/${Math.ceil(PRESETS.length / 10)}${pg >= 4 ? " · bộ mới" : ""}</div>`, "",
    settled(PRESETS.slice(pg * 10, pg * 10 + 10).map((p, k) => [p.id, `#c${k}`])));
  await page.screenshot({ path: path.join(OUT, `catalog-${pg + 1}.png`) });
}
// 4 bộ mới trên khung hình thật (nếu có ảnh nền thử ở work/nen-thu/, không commit): mỗi bộ 1 hook + 1 số, màu thương hiệu, bật footage
const STILL = fs.existsSync(path.join(ROOT, "work/nen-thu")) ? fs.readdirSync(path.join(ROOT, "work/nen-thu")).filter((f) => /\.jpe?g$/i.test(f)).map((f) => path.join(ROOT, "work/nen-thu", f))[0] ?? "" : "";
if (fs.existsSync(STILL)) {
  fs.copyFileSync(STILL, path.join(OUT, "still.jpg"));
  const { THEMES } = await import("./presets.mjs");
  const demo = [["a-hook", THEMES.coral], ["b-number", THEMES.gold], ["c-marker", THEMES.coral], ["d-spec", THEMES.coral]];
  for (const [k, [pid, theme]] of demo.entries()) {
    await load(`<img src="still.jpg" style="position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover">` + presetHtml(pid, [], { id: "f", left: 540, top: 260, footage: true, theme }), "", settled([[pid, "#f", theme]]));
    await page.screenshot({ path: path.join(TMP, `fam-${k}.png`) });
  }
  execFileSync("ffmpeg", ["-v", "error", "-y", ...[0, 1, 2, 3].flatMap((k) => ["-i", path.join(TMP, `fam-${k}.png`)]), "-filter_complex", "[0][1][2][3]hstack=4,scale=2160:-1", path.join(OUT, "bo-moi-tren-video.jpg")]);
}
await browser.close();
fs.rmSync(path.join(OUT, "_page.html"));
if (errs.length) { console.error("Lỗi preset:\n  " + errs.join("\n  ")); process.exit(1); }
console.log(`✔ ${PRESETS.length} preset · kiểm hai màu ${jobs.length} preset: 0 lỗi · ${path.relative(ROOT, OUT)}/catalog-*.png`);
if (!process.argv.includes("--no-render"))
  execFileSync("npx", ["hyperframes", "render", "-o", "output.mp4"], { cwd: OUT, stdio: "inherit", env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" } });
