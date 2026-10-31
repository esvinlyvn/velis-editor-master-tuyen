#!/usr/bin/env node
// Kiểm dấu tiếng Việt lọt khỏi hộp: mọi dòng có hộp màu (box), hộp viền (outlined), thẻ khấc (tag), cụm tô nền ([..] hl).
//   node text-presets/tools/box-check.mjs ["chữ thử 1" "chữ thử 2" …]
// Mỗi dòng có hộp được render với chữ thử nặng dấu (dấu chồng Ắ Ầ Ễ Ỗ Ữ trên chữ hoa, dấu nặng Ặ Ộ Ỵ dưới chân)
// → chụp riêng hình chữ (tắt nền hộp) → đếm điểm ảnh chữ nằm ngoài hình chữ nhật của hộp. Có điểm lọt → báo, thoát 1.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { PRESETS, presetHtml, presetRuntime } from "../presets.mjs";
import { fontCss } from "../fonts.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "work/box-check");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const FONTS = fontCss(OUT), CSS = fs.readFileSync(path.join(ROOT, "text-presets/presets.css"), "utf8");
const STRESS = ["ẮẦỄ ỖỮ ẶỘỴ", "GẦN CẤT NÓC", "KHÔNG LÃI, KHÔNG GỐC", "MỞ BÁN 7/2025", "TÍCH LŨY TÀI SẢN", "NHẮN LAN", ...process.argv.slice(2)];
const HL_STRESS = ["CĂN [ẮẦỄ ẶỘ]", "TẦNG [ĐỒNG HỒ]"];

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const jobs = [];
for (const p of PRESETS) p.lines.forEach((l, k) => {
  if (!(l.box || l.outlined || l.tag || l.hl)) return;
  for (const t of l.hl ? HL_STRESS : STRESS) jobs.push({ pid: p.id, k, t, n: p.lines.length });
});
const res = [];
for (const [j, job] of jobs.entries()) {
  const texts = Array.from({ length: job.n }, (_, i) => (i === job.k ? job.t : null));
  // chữ trắng đặc, tắt nền hộp, glow, trang trí — chỉ còn hình chữ; rect hộp đo từ DOM
  const off = `.tp-line{filter:none!important} .ch{background:none!important;color:#fff!important} .tp-line .in,.hl{background:none!important;box-shadow:none!important} .tp-tagbg,.tp-deco,.hd-dot,.tp-vbar,.tp-marker,.tp-caret,.tp-spark{display:none!important} body{background:transparent}`;
  fs.writeFileSync(path.join(OUT, "p.html"), `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS} body{margin:0} ${CSS} .tp{opacity:1} ${off}</style></head><body><div style="position:relative;width:1080px;height:1920px">${presetHtml(job.pid, texts, { id: "x", top: 500 })}</div>${presetRuntime()}</body></html>`);
  await pg.goto("file://" + path.join(OUT, "p.html")); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(40);
  const rects = await pg.evaluate((hl) => [...document.querySelectorAll(hl ? "#x .hl" : "#x .tp-line .in")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }), !!PRESETS.find((p) => p.id === job.pid).lines[job.k].hl);
  const png = path.join(OUT, `j${j}.png`);
  await pg.screenshot({ path: png, omitBackground: true });
  res.push({ ...job, png, rects });
}
await b.close();
fs.writeFileSync(path.join(OUT, "jobs.json"), JSON.stringify(res));
const out = JSON.parse(execFileSync("python3", ["-I", "-c", `
import json, sys
import numpy as np
from PIL import Image
jobs = json.load(open(sys.argv[1])); out = []
for j in jobs:
    a = np.asarray(Image.open(j["png"]).convert("RGBA"))[:, :, 3] > 100
    m = np.zeros_like(a)
    for x0, y0, x1, y1 in j["rects"]: m[int(y0):int(np.ceil(y1)), int(x0):int(np.ceil(x1))] = True
    if j["rects"]:
        # chỉ xét chữ trong dải ngang của hộp (cụm tô nền: chữ thường ngoài [..] nằm ngoài hộp là đúng)
        x0 = int(min(r[0] for r in j["rects"])); x1 = int(max(r[2] for r in j["rects"]))
        a[:, :x0] = False; a[:, x1:] = False
    out.append({"pid": j["pid"], "k": j["k"], "t": j["t"], "out": int((a & ~m).sum())})
print(json.dumps(out))
`, path.join(OUT, "jobs.json")]).toString());
const bad = out.filter((o) => o.out > 0);
for (const o of bad) console.log(`  ${o.pid} dòng ${o.k + 1} "${o.t}": ${o.out} điểm ảnh chữ ngoài hộp`);
console.log(`${bad.length ? "✗" : "✔"} ${out.length} lượt (${new Set(out.map((o) => o.pid + o.k)).size} dòng có hộp): ${bad.length} lượt có dấu lọt khỏi hộp`);
process.exit(bad.length ? 1 : 0);
