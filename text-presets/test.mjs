#!/usr/bin/env node
// Kiểm bộ preset bằng chữ bất động sản thật (test-phrases.mjs) trên nền ảnh thật — không dùng chữ mẫu CapCut.
//   node text-presets/test.mjs [id,…]
// Mỗi preset × 2 bộ chữ, mỗi bộ đặt trên một ảnh nền khác nhau (trời sáng, nội thất tối, sông, bản đồ, người nói…):
//   1) đo nền dưới khối chữ (scripts/bg-sample.py colors) → contrastPlan() chọn chế độ nền sáng/tối và màu theme
//   2) chụp khung cuối ổn định (timeline đã chạy xong) → build/text-presets/test/thu-<n>.jpg (10 ô/tờ)
//   3) chụp 5 khung giữa lúc diễn hoạt của bộ 1 → build/text-presets/test/dien-hoat-<n>.jpg (kiểm gõ chữ, đổi màu, vẽ nét…)
// Dừng với lỗi nếu: chữ tràn khỏi khung 1080 (lề 24 px), khối phải thu nhỏ dưới 65 % sau khi đã tự xuống dòng (chữ quá dài cho preset này),
// hai dòng liền kề chạm nhau (trừ chữ ký và dòng đặt chồng có chủ đích `z`).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { PRESETS, presetHtml, presetJs, presetRuntime, contrastPlan } from "./presets.mjs";
import { TEST_PHRASES } from "./test-phrases.mjs";
import { fontCss } from "./fonts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(ROOT, "build", "text-presets", "test");
const TMP = path.join(ROOT, "work", "text-presets", "test");
fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "bg"), { recursive: true });
fs.mkdirSync(TMP, { recursive: true });
fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(OUT, "gsap.min.js"));
const FONTS = fontCss(OUT);
const CSS = fs.readFileSync(path.join(HERE, "presets.css"), "utf8");

// nền thử: ảnh dọc 1080×1920 đặt ở work/nen-thu/ (không commit; nên đủ loại sáng / tối / bão hòa — cảnh sông, phòng, bản đồ, sự kiện)
const MEDIA = path.join(ROOT, "work/nen-thu");
const BGS = fs.existsSync(MEDIA) ? fs.readdirSync(MEDIA).filter((f) => /\.jpe?g$/i.test(f)).sort().slice(0, 12) : [];
if (!BGS.length) { console.error("Không có ảnh nền thử: đặt vài ảnh dọc .jpg vào work/nen-thu/"); process.exit(1); }
BGS.forEach((f, i) => fs.copyFileSync(path.join(MEDIA, f), path.join(OUT, "bg", `${i}.jpg`)));
// preset đặt ở phần dưới khung (giới thiệu người nói, cuộc gọi) — còn lại ở dải trên đầu người nói
const LOW = new Set(["d-lower", "dang-goi", "d-call"]);

const only = process.argv[2]?.split(",");
const cases = [];
PRESETS.forEach((p, i) => {
  if (only && !only.includes(p.id)) return;
  (TEST_PHRASES[p.id] ?? []).forEach((texts, k) => cases.push({ n: cases.length, i, p, k, texts, bg: (i * 2 + k) % BGS.length, top: LOW.has(p.id) ? 1360 : 300 }));
});

const page = (bgi, body, js, extra = "") => `<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>${FONTS}
body{margin:0;background:#000} #root{position:relative;width:1080px;height:1920px;overflow:hidden}
#root>img{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover} ${CSS} ${extra}</style></head>
<body><div id="root">${bgi == null ? "" : `<img src="bg/${bgi}.jpg">`}${body}</div>${presetRuntime()}
<script>const tl = gsap.timeline({ paused: true });\n${js}\nwindow.seekTo = (t) => { tl.seek(t); }; // như khi xuất khung: callback bị bỏ qua tl.seek(0);</script></body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const load = async (html) => { fs.writeFileSync(path.join(OUT, "_p.html"), html); await pg.goto("file://" + path.join(OUT, "_p.html")); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(80); };
const SETTLE = 3.4;
const boxOf = () => pg.evaluate(() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const e of document.querySelectorAll("#x .ch, #x .tp-deco, #x .in, #x .big, #x .tp-vbar, #x .tp-nhan")) { const b = e.getBoundingClientRect(); if (!b.width) continue; x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, s: document.querySelector(".tp-pos")._s ?? 1 }; });

// 1) đo nền dưới khối chữ
for (const bgi of new Set(cases.map((c) => c.bg))) {
  await load(page(bgi, "", ""));
  await pg.screenshot({ path: path.join(TMP, `bg-${bgi}.png`) });
}
const errs = [], jobs = [];
for (const c of cases) {
  await load(page(null, presetHtml(c.p.id, c.texts, { id: "x", top: c.top }), presetJs(c.p.id, "#x", 0, { exit: false })));
  await pg.evaluate((t) => window.seekTo(t), SETTLE);
  c.box = await boxOf();
  jobs.push({ id: c.n, png: path.join(TMP, `bg-${c.bg}.png`), box: [c.box.x - 20, c.box.y - 20, c.box.w + 40, c.box.h + 40] });
}
fs.writeFileSync(path.join(TMP, "colors.json"), JSON.stringify(jobs));
const stats = JSON.parse(execFileSync("python3", ["-I", path.join(ROOT, "scripts/bg-sample.py"), "colors", path.join(TMP, "colors.json")]).toString());
for (const s of stats) cases[cases.findIndex((c) => c.n === s.id)].stat = s;

// 2) khung cuối + 3) khung giữa diễn hoạt
const FRAMES = [0.12, 0.3, 0.55, 0.9, 1.5];
for (const c of cases) {
  const plan = contrastPlan(c.stat, "coral", c.p.id);
  c.plan = plan;
  const html = page(c.bg, presetHtml(c.p.id, c.texts, { id: "x", top: c.top, bg: plan.bg, theme: plan.themeObj, recolor: plan.recolor }), presetJs(c.p.id, "#x", 0, { exit: false, theme: plan.themeObj, recolor: plan.recolor }));
  await load(html);
  await pg.evaluate((t) => window.seekTo(t), SETTLE);
  const b = await boxOf();
  if (b.x < 24 || b.x + b.w > 1056) errs.push(`${c.p.id} bộ ${c.k + 1}: chữ tràn khung (${Math.round(b.x)}–${Math.round(b.x + b.w)} px)`);
  if (b.s < 0.65) errs.push(`${c.p.id} bộ ${c.k + 1}: phải thu nhỏ còn ${Math.round(b.s * 100)} % — chữ quá dài cho preset này`);
  const y = Math.max(0, Math.floor(b.y - 70)), h = Math.min(1920 - y, Math.ceil(b.h + 140));
  c.clip = { x: 0, y, width: 1080, height: h };
  c.final = path.join(TMP, `f-${c.n}.png`);
  await pg.screenshot({ path: c.final, clip: c.clip });
  // từng dòng riêng (không nền, không glow) để đo chữ chạm nhau giữa các dòng không được thiết kế chồng
  c.lines = [];
  for (let k = 0; k < c.p.lines.length; k++) {
    await pg.addStyleTag({ content: `body{background:transparent!important} #root>img{display:none} .tp-line{filter:none!important} .tp-line:not(.L${k}),.tp-vbar,.tp-deco,.hd-dot{visibility:hidden!important} #lineoff${k}{}` });
    const f = path.join(TMP, `l-${c.n}-${k}.png`);
    await pg.screenshot({ path: f, clip: c.clip, omitBackground: true });
    c.lines.push(f);
    await pg.evaluate(() => document.querySelectorAll("style").forEach((st, i, a) => { if (i === a.length - 1) st.remove(); }));
  }
  if (c.k === 0) {
    c.frames = [];
    for (const [j, t] of FRAMES.entries()) {
      await pg.evaluate((t) => window.seekTo(t), t);
      const f = path.join(TMP, `a-${c.n}-${j}.png`);
      await pg.screenshot({ path: f, clip: c.clip });
      c.frames.push(f);
    }
  }
}
await browser.close();
fs.rmSync(path.join(OUT, "_p.html"));

// chữ chạm nhau: chỉ xét cặp dòng liền kề mà cả hai không phải chữ ký và không đặt chồng có chủ đích (z)
const ov = [];
for (const c of cases) c.p.lines.forEach((l, k) => { const m = c.p.lines[k + 1];
  if (m && l.f !== "f-script" && m.f !== "f-script" && !l.z && !m.z && !l.big && !m.big) ov.push({ id: `${c.n}:${k}`, pngs: [c.lines[k], c.lines[k + 1]] }); });
fs.writeFileSync(path.join(TMP, "overlap.json"), JSON.stringify(ov));
for (const o of JSON.parse(execFileSync("python3", ["-I", path.join(ROOT, "scripts/bg-sample.py"), "overlap", path.join(TMP, "overlap.json")]).toString())) {
  if (o.overlap < 40) continue;
  const [n, k] = o.id.split(":").map(Number), c = cases.find((x) => x.n === n);
  errs.push(`${c.p.id} bộ ${c.k + 1}: dòng ${k + 1} và ${k + 2} chạm nhau (${o.overlap} điểm ảnh) — "${c.texts[k]}" / "${c.texts[k + 1]}"`);
}

// ghép tờ
const meta = cases.map((c) => ({ n: c.n, label: `#${c.i + 1} ${c.p.id} · bộ ${c.k + 1} · nền ${path.basename(BGS[c.bg])} · ${c.plan.bg}${c.p.id.match(/^[a-d]-/) ? " · " + c.plan.theme : ""}${c.plan.recolor ? " · đổi màu → " + c.plan.recolorName : ""} (lum ${c.stat.lum})`,
  final: c.final, frames: c.frames ?? null }));
fs.writeFileSync(path.join(TMP, "sheets.json"), JSON.stringify({ out: OUT, frames: FRAMES, cases: meta }));
execFileSync("python3", ["-I", path.join(HERE, "tools/test-sheets.py"), path.join(TMP, "sheets.json")], { stdio: "inherit" });
if (errs.length) { console.error("Lỗi thử chữ thật:\n  " + errs.join("\n  ")); process.exit(1); }
console.log(`✔ ${cases.length} lượt thử (${new Set(cases.map((c) => c.p.id)).size} preset × chữ BĐS) trên ${BGS.length} nền: 0 lỗi · ${path.relative(ROOT, OUT)}/`);
