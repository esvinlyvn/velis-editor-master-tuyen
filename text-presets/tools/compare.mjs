// Đối chiếu preset #1–40 với video mẫu: chụp từng preset của thư viện → tools/compose.py ghép cạnh ảnh cắt từ mẫu.
//   node text-presets/tools/compare.mjs <thư-mục-ảnh-mẫu> [chỉ số,…]
//   python3 -I text-presets/tools/compose.py <thư-mục-ảnh-mẫu>
// Thư mục ảnh mẫu chứa 4 khung toàn trang lấy từ video "40 text presets" (cắt 1000×1300 ở x40 y420) ở khung CUỐI ỔN ĐỊNH
// của mỗi trang (mọi chữ đã vào xong, chưa ra; đo bằng chênh lệch điểm ảnh giữa các khung liên tiếp ≈ 0): giây 2,40 · 5,30 · 7,60 · 11,50
//   ffmpeg -ss 2.40 -i mau.mp4 -frames:v 1 -vf crop=1000:1300:40:420 a_final_2.40.png   (tương tự cho 5.30, 7.60, 11.50)
// Chụp giữa lúc diễn hoạt sẽ đo sai màu (màu đang đổi), sai vị trí (chữ đang bay) và thiếu chữ.
// Tùy chọn: bpk_<id>.png — khung cuối ổn định của từng preset trong video diễn hoạt (video thứ 2), ghép thêm tờ sheetB*.jpg.
// Ảnh mẫu không đưa vào repo (bản quyền video gốc). Kết quả: <thư-mục>/cmp/sheet0..3.jpg (trái: mẫu, phải: thư viện).
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { PRESETS, presetHtml, presetJs, presetRuntime } from "../presets.mjs";
import { fontCss } from "../fonts.mjs";
const W = path.resolve(process.argv[2] ?? "work/textref"), OUT = path.join(W, "cmp");
fs.mkdirSync(OUT, { recursive: true });
const PAGES = ["a_final_2.40.png", "a_final_5.30.png", "a_final_7.60.png", "a_final_11.50.png"];
const BOX = [[70,170,480,310],[515,280,950,380],[100,360,470,520],[520,480,940,615],[85,570,490,720],[520,690,940,780],[75,765,485,980],[510,935,930,1050],[90,1005,480,1190],[515,1175,930,1270],
 [75,170,470,285],[505,255,945,420],[80,360,480,450],[510,480,945,550],[70,565,490,670],[555,640,900,860],[90,735,490,970],[540,910,915,1050],[80,1020,470,1190],[545,1155,900,1295],
 [115,145,420,295],[520,230,930,420],[90,370,490,490],[550,450,915,600],[125,570,430,780],[550,655,900,790],[90,810,450,965],[525,870,935,990],[130,1015,420,1175],[520,1095,930,1270],
 [90,165,460,345],[110,390,430,545],[105,605,465,790],[95,850,450,975],[95,1070,465,1205],[535,240,925,430],[535,465,920,665],[530,725,920,905],[570,935,900,1140],[545,1160,940,1300]];
const fonts = fontCss(OUT);
fs.copyFileSync(new URL("../../node_modules/gsap/dist/gsap.min.js", import.meta.url), path.join(OUT, "gsap.min.js"));
const css = fs.readFileSync(new URL("../presets.css", import.meta.url), "utf8");
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const only = process.argv[3] ? process.argv[3].split(",").map(Number) : PRESETS.slice(0, 40).map((_, i) => i);
for (const i of only) {
  const p = PRESETS[i];
  fs.writeFileSync(path.join(OUT, "p.html"), `<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>${fonts} body{margin:0;background:#000} ${css}</style></head><body>${presetHtml(p.id, [], { id: "x", left: 540, top: 600 })}${presetRuntime()}<script>const tl = gsap.timeline({ paused: true });\n${presetJs(p.id, "#x", 0, { exit: false })}\ntl.seek(3.4);</script></body></html>`);
  await pg.goto("file://" + path.join(OUT, "p.html")); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(60);
  const r = await pg.evaluate(() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const e of document.querySelectorAll("#x .ch, #x .tp-deco, #x .in, #x .big, #x .tp-vbar")) { const q = e.getBoundingClientRect(); if (!q.width) continue; x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); } return [x0, y0, x1, y1]; });
  const pad = 30, clip = { x: Math.max(0, r[0] - pad), y: Math.max(0, r[1] - pad), width: Math.min(1080, r[2] - r[0] + 2 * pad), height: r[3] - r[1] + 2 * pad };
  const mine = path.join(OUT, `m${i}.png`); await pg.screenshot({ path: mine, clip });

}
await b.close();
fs.writeFileSync(path.join(OUT, "box.json"), JSON.stringify({ BOX, PAGES, ids: PRESETS.map((p) => p.id) }));
