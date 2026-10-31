#!/usr/bin/env node
// Render cảnh bản đồ (file JSON, MAP.md) thành MP4 1080×1920 bằng Chromium ngầm, WebGL phần mềm, hoàn toàn offline.
//   npm run map -- <canh.json> [--workers 3] [--out đường/dẫn.mp4]
//   npm run map -- <canh.json> --at 1,3.5,6        # chỉ chụp vài khung + contact sheet (xem nhanh, không ra video)
//   npm run map -- <canh.json> --dry               # chỉ dựng trang + in kế hoạch (không mở trình duyệt)
// Kết quả: build/map/<tên>/<tên>.mp4, <tên>.sfx.json (gợi ý SFX theo mốc trong video), frames/, contact-sheet.jpg
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { buildPlan, W, H } from "./scenes.mjs";
import { baseLayers, bgStat } from "./styles.mjs";
import { ROOT, WORK, regionFile } from "./tiles.mjs";
import { presetHtml, presetJs, presetRuntime, contrastPlan } from "../../text-presets/presets.mjs";
import { fontCss } from "../../text-presets/fonts.mjs";

process.on("uncaughtException", (e) => { console.error(`✗ ${e.message}`); if (process.env.DEBUG) console.error(e.stack); process.exit(1); });
const require = createRequire(import.meta.url);
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const files = argv.filter((a, i) => a.endsWith(".json") && argv[i - 1] !== "--out");
if (!files.length) { console.log("Dùng: npm run map -- <canh.json> [--workers N] [--at 1,2,3] [--out file.mp4] [--dry]"); process.exit(1); }
const WORKERS = opt("--workers") ? Number(opt("--workers")) : Math.max(1, Math.min(4, Math.floor(os.cpus().length / 1.5)));
const AT = opt("--at");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const r3 = (n) => +(+n).toFixed(3);

// skin.fonts: [["gói @fontsource", [độ đậm…]], …] → @font-face woff2 (subset latin + vietnamese), chép vào assets/fonts
function skinFonts(list, out) {
  const dst = path.join(out, "assets/fonts");
  fs.mkdirSync(dst, { recursive: true });
  let css = "";
  for (const [pkg, weights] of list) {
    const dir = path.join(ROOT, "node_modules/@fontsource", pkg);
    for (const w of weights)
      for (const block of fs.readFileSync(path.join(dir, `${w}.css`), "utf8").match(/@font-face\s*{[^}]*}/g) ?? []) {
        if (!/-(latin|vietnamese)-\d/.test(block) || /latin-ext/.test(block)) continue;
        css += block.replace(/url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\),\s*url\([^)]+\) format\('woff'\)/g, (_, f) => (fs.copyFileSync(path.join(dir, "files", f), path.join(dst, f)), `url(assets/fonts/${f}) format('woff2')`)) + "\n";
      }
  }
  return css;
}

function buildPage(plan, out) {
  fs.rmSync(path.join(out, "assets"), { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "assets/vendor"), { recursive: true });
  const vend = (from, name) => fs.copyFileSync(path.join(ROOT, "node_modules", from), path.join(out, "assets/vendor", name));
  vend("maplibre-gl/dist/maplibre-gl.js", "maplibre-gl.js");
  vend("maplibre-gl/dist/maplibre-gl.css", "maplibre-gl.css");
  vend("pmtiles/dist/pmtiles.js", "pmtiles.js");
  vend("gsap/dist/gsap.min.js", "gsap.min.js");
  fs.copyFileSync(new URL("./runtime.js", import.meta.url), path.join(out, "assets/runtime.js"));
  const fonts = fontCss(out) + skinFonts(plan.skin?.fonts ?? [], out);
  const SK = plan.skin ?? {};
  const presetCss = fs.readFileSync(path.join(ROOT, "text-presets/presets.css"), "utf8");
  const cp = contrastPlan(bgStat(plan.style), plan.theme);
  if (cp.theme !== plan.theme) plan.warn.push(`theme "${plan.theme}" trùng tông nền → nhãn dùng "${cp.theme}"`);
  const light = plan.style === "light";
  let html = "", js = "", stems = "";
  for (const p of plan.pins) {
    html += `<div class="mw" id="w-${p.id}"><div class="mpin" id="${p.id}"><i class="mp-ping"></i><i class="mp-dot"></i></div></div>\n`;
    js += `tl.fromTo("#${p.id}", { opacity: 0, y: -46, scale: 0.6 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "bounce.out" }, ${p.at});\n`;
    if (p.ping) js += `tl.fromTo("#${p.id} .mp-ping", { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 2.8, duration: 1.1, ease: "power1.out", repeat: 1, immediateRender: false }, ${r3(p.at + 0.35)});\n`;
  }
  // vật chạy theo tuyến: icon nhìn từ trên xuống (xe tải), đổ bóng — nổi khối trên bản đồ nghiêng
  const ICONS = {
    truck: (c) => `<svg width="84" height="84" viewBox="-42 -42 84 84"><ellipse cx="4" cy="10" rx="30" ry="12" fill="rgba(0,0,0,.45)"/><g transform="rotate(-12)"><rect x="-30" y="-16" width="40" height="30" rx="5" fill="${c}"/><rect x="10" y="-11" width="20" height="25" rx="5" fill="#fff"/><rect x="14" y="-7" width="11" height="9" rx="2" fill="#223"/><circle cx="-18" cy="16" r="6" fill="#111"/><circle cx="18" cy="16" r="6" fill="#111"/></g></svg>`,
  };
  for (const m of plan.movers ?? []) html += `<div class="mw mover" id="w-${m.id}" style="opacity:0"><div style="position:absolute;left:-42px;top:-56px">${ICONS[m.icon](m.color ?? plan.accent.line)}</div></div>\n`;
  for (const n of plan.places) {
    html += `<div class="mw" id="w-${n.id}"><div class="mplace" id="${n.id}">${esc(n.text)}</div></div>\n`;
    js += `tl.fromTo("#${n.id}", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${n.at});\n`;
    if (n.out !== null) js += `tl.to("#${n.id}", { opacity: 0, duration: 0.4 }, ${r3(n.out - 0.4)});\n`;
  }
  for (const g of plan.tags) {
    html += `<div class="mw" id="w-${g.id}"><div class="mtag" id="${g.id}">${esc(g.text)}</div></div>\n`;
    js += `tl.fromTo("#${g.id}", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${g.at});\n`;
    if (g.out != null) js += `tl.to("#${g.id}", { opacity: 0, scale: 0.8, duration: 0.3 }, ${r3(g.out - 0.3)});\n`;
    if (g.color) html = html.replace(`<div class="mtag" id="${g.id}">`, `<div class="mtag" id="${g.id}" style="color:${g.color};border-color:${g.color}">`);
  }
  for (const l of plan.labels) {
    // nhãn = text preset của repo (DAC-TA-CHU 4.10 map_label); vị trí theo toạ độ do runtime.js đặt từng khung
    html += `<div class="mw ml" id="w-${l.id}">${presetHtml(l.preset, l.texts, { id: `lab-${l.id}`, left: 0, top: 0, scale: l.scale, edge: -9999, bg: cp.bg, theme: cp.themeObj })}</div>\n`;
    js += presetJs(l.preset, `#lab-${l.id}`, l.at, { hold: l.hold ?? 99, exit: l.hold !== null, theme: cp.themeObj }) + "\n";
    if (l.stem && !l.pos) {
      stems += `<line id="s-${l.id}" x1="0" y1="0" x2="0" y2="0"/>`;
      js += `tl.fromTo("#s-${l.id}", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${r3(Math.max(0, l.at - 0.15))});\n`;
      if (l.hold !== null) js += `tl.to("#s-${l.id}", { opacity: 0, duration: 0.3 }, ${r3(l.at + l.hold - 0.3)});\n`;
    }
  }
  for (const [i, d] of plan.dividers.entries()) {
    html += `<div class="mdiv" id="d${i}" style="top:${d.y}px"></div>\n`;
    js += `tl.fromTo("#d${i}", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, ${d.at});\n`;
  }
  const A = plan.accent;
  const page = `<!doctype html>
<html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=${W}, height=${H}">
<title>${esc(plan.name)}</title>
<link rel="stylesheet" href="assets/vendor/maplibre-gl.css">
<script src="assets/vendor/maplibre-gl.js"></script><script src="assets/vendor/pmtiles.js"></script><script src="assets/vendor/gsap.min.js"></script>
<style>
${fonts}
${presetCss}
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${SK.bg ?? (light ? "#dcd8d0" : "#11141b")}; }
#maps, #over { position: absolute; inset: 0; }
.mview { position: absolute; overflow: hidden; }
.mw { position: absolute; left: 0; top: 0; will-change: transform; }
.mpin { position: absolute; left: -22px; top: -22px; width: 44px; height: 44px; opacity: 0; }
.mp-dot { position: absolute; inset: 9px; border-radius: 50%; background: ${A.fill}; box-shadow: 0 0 0 5px ${light ? "#fff" : "rgba(255,255,255,.92)"}, 0 0 26px 8px ${A.glow}; }
.mp-ping { position: absolute; inset: 0; border-radius: 50%; border: 5px solid ${A.glow}; opacity: 0; }
.mplace { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: 50px; letter-spacing: .06em; opacity: 0;
  color: ${light ? "#2a2d34" : "#f4f4f0"}; text-shadow: ${light ? "0 0 3px #fff, 0 0 10px #fff, 0 0 18px rgba(255,255,255,.9)" : "0 3px 14px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.95)"}; }
.mtag { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; font-family: "Be Vietnam Pro", sans-serif; font-weight: 800; font-size: 30px; letter-spacing: .08em; opacity: 0;
  padding: .42em .8em .3em; border-radius: .5em; color: ${A.line}; background: ${light ? "rgba(255,255,255,.94)" : "rgba(9,12,20,.88)"}; border: 3px dashed ${A.line}; }
#stems { position: absolute; inset: 0; width: ${W}px; height: ${H}px; overflow: visible; }
#stems line { stroke: ${light ? "#2a2d34" : "rgba(255,255,255,.85)"}; stroke-width: 3; stroke-dasharray: 8 7; opacity: 0; }
.mdiv { position: absolute; left: 0; width: ${W}px; height: 4px; background: ${A.line}; box-shadow: 0 0 18px ${A.glow}; transform-origin: 50% 50%; }
.mscale { position: absolute; display: flex; align-items: flex-end; gap: 14px; font-family: "Be Vietnam Pro", sans-serif; font-weight: 700; font-size: 30px; color: ${light ? "#2a2d34" : "#f4f4f0"}; text-shadow: ${light ? "0 0 4px #fff, 0 0 10px #fff" : "0 1px 6px rgba(0,0,0,.9)"}; }
.mscale i { display: block; height: 12px; border: 4px solid currentColor; border-top: 0; box-sizing: border-box; }
${SK.css ?? ""}
#attr { position: absolute; right: 26px; bottom: 22px; font-family: "Be Vietnam Pro", sans-serif; font-weight: 600; font-size: 22px; color: ${light ? "rgba(30,32,38,.75)" : "rgba(244,244,240,.75)"}; text-shadow: ${light ? "0 0 4px #fff" : "0 1px 4px rgba(0,0,0,.85)"}; }
</style></head>
<body>
<div id="maps"></div>
<div id="over">
<svg id="stems">${stems}</svg>
${html}<div id="attr">© OpenStreetMap</div>
</div>
<script>
window.__PLAN = ${JSON.stringify(plan)};
window.__BASE = ${JSON.stringify(baseLayers(plan.style, SK.palette))};
const tl = gsap.timeline({ paused: true });
window.tl = tl;
${js}
</script>
${presetRuntime()}
<script src="assets/runtime.js"></script>
</body></html>`;
  fs.writeFileSync(path.join(out, "index.html"), page);
}

// máy chủ tĩnh chỉ nghe 127.0.0.1, có Range (PMTiles đọc theo khoảng byte)
function serve(out) {
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const [dir, rel] = url.startsWith("/tiles/") ? [WORK, url.slice(7)] : [out, url.slice(1) || "index.html"];
    const file = path.join(dir, rel);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
    const size = fs.statSync(file).size;
    const headers = { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Accept-Ranges": "bytes" };
    const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || "");
    if (m) {
      const a = +m[1], b = m[2] ? Math.min(+m[2], size - 1) : size - 1;
      res.writeHead(206, { ...headers, "Content-Range": `bytes ${a}-${b}/${size}`, "Content-Length": b - a + 1 });
      return fs.createReadStream(file, { start: a, end: b }).pipe(res);
    }
    res.writeHead(200, { ...headers, "Content-Length": size });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

// --disable-gpu-compositing: compositor của Chromium không vẽ lại cả khung bằng SwiftShader (nhanh hơn ~6 lần, MAP.md mục 6)
const CHROME_ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-gpu-compositing"];
async function openPage(chromium, base, blocked) {
  const browser = await chromium.launch({ args: CHROME_ARGS });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(base) || u.startsWith("data:") || u.startsWith("blob:")) return route.continue();
    blocked.add(u);
    return route.abort();
  });
  page.on("pageerror", (e) => console.error("  [trang]", e.message));
  page.on("console", (m) => m.type() === "error" && console.error("  [trang]", m.text()));
  await page.goto(`${base}/index.html`);
  await page.evaluate(() => window.ready);
  const cdp = await page.context().newCDPSession(page);
  const shot = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true })).data, "base64");
  return { browser, page, shot };
}
const ffmpegOut = (file, fps) => {
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(fps), file], { stdio: ["pipe", "inherit", "inherit"] });
  return { ff, done: new Promise((r) => ff.on("close", r)) };
};

async function renderOne(file) {
  const t0 = Date.now();
  const plan = buildPlan(file, ROOT);
  if (!fs.existsSync(regionFile(plan.region))) throw new Error(`Chưa có dữ liệu vùng: npm run map:data ${plan.region}`);
  const out = path.join(ROOT, "build/map", plan.name);
  fs.mkdirSync(out, { recursive: true });
  buildPage(plan, out);
  const N = Math.round(plan.duration * plan.fps);
  console.log(`▶ ${plan.name} · ${plan.views.length > 1 ? "2 khung" : "1 khung"} · ${plan.style}/${plan.theme} · ${plan.duration}s = ${N} khung${plan.routeKm ? ` · tuyến ${plan.routeKm} km (chỉ để tham khảo)` : ""}`);
  for (const w of plan.warn) console.log(`  ⚠ ${w}`);
  // gợi ý SFX theo mốc trong video (cộng mốc bắt đầu cảnh) để chép vào sfx.json của project
  const cues = plan.sfx.filter((c) => c.at >= 0 && c.at < plan.duration).map((c) => ({ ...c, at: r3(c.at + plan.start) }))
    .sort((a, b) => a.at - b.at).filter((c, i, a) => !i || c.at - a[i - 1].at >= 0.6 - 1e-6);
  fs.writeFileSync(path.join(out, `${plan.name}.sfx.json`), JSON.stringify(cues, null, 1));
  if (argv.includes("--dry")) { console.log(`  trang: ${path.relative(ROOT, out)}/index.html`); return; }

  const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
  const server = await serve(out);
  const base = `http://127.0.0.1:${server.address().port}`;
  const blocked = new Set();
  try {
    if (AT) {
      const ts = AT.split(",").map(Number);
      const P = await openPage(chromium, base, blocked);
      fs.rmSync(path.join(out, "frames"), { recursive: true, force: true });
      fs.mkdirSync(path.join(out, "frames"), { recursive: true });
      const shots = [];
      for (const t of ts) {
        await P.page.evaluate((t) => window.renderFrame(t), t);
        const f = path.join(out, "frames", `t${t.toFixed(2)}.png`);
        fs.writeFileSync(f, await P.shot());
        shots.push(f);
      }
      await P.browser.close();
      // contact sheet: 4 khung một hàng, mỗi khung 360 px
      const cols = Math.min(4, shots.length), rows = Math.ceil(shots.length / cols);
      const inputs = shots.flatMap((f) => ["-i", f]);
      const pad = Array.from({ length: rows * cols - shots.length }, () => ["-f", "lavfi", "-i", "color=c=black:s=1080x1920:d=1"]).flat();
      const n = rows * cols;
      const fc = Array.from({ length: n }, (_, i) => `[${i}]scale=360:640,drawtext=text='${i < shots.length ? ts[i].toFixed(2) + "s" : ""}':x=12:y=12:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(";") + ";" +
        Array.from({ length: rows }, (_, r) => `${Array.from({ length: cols }, (_, c) => `[v${r * cols + c}]`).join("")}${cols > 1 ? `hstack=${cols}` : "null"}[r${r}]`).join(";") +
        (rows > 1 ? `;${Array.from({ length: rows }, (_, r) => `[r${r}]`).join("")}vstack=${rows}[o]` : "");
      const sheet = (f) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...inputs, ...pad, "-filter_complex", f, "-map", rows > 1 ? "[o]" : "[r0]", "-frames:v", "1", "-q:v", "3", path.join(out, "contact-sheet.jpg")]);
      try { sheet(fc); } catch { sheet(fc.replace(/,drawtext=[^\[]*/g, "")); } // máy thiếu font cho drawtext: bỏ nhãn giây
      console.log(`  ✔ ${ts.length} khung → ${path.relative(ROOT, out)}/frames/, contact-sheet.jpg (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } else {
      const workers = Math.min(WORKERS, N);
      const per = Math.ceil(N / workers);
      const segs = [];
      const stat = { frame: 0, map: 0, shot: 0 };
      let doneN = 0;
      await Promise.all(Array.from({ length: workers }, async (_, w) => {
        const a = w * per, b = Math.min(N, a + per);
        if (a >= b) return;
        const seg = path.join(out, `seg-${w}.mp4`);
        segs[w] = seg;
        const P = await openPage(chromium, base, blocked);
        const E = ffmpegOut(seg, plan.fps);
        for (let i = a; i < b; i++) {
          const s = performance.now();
          await P.page.evaluate((t) => window.renderFrame(t), i / plan.fps);
          const m = performance.now();
          const png = await P.shot();
          stat.map += m - s; stat.shot += performance.now() - m; stat.frame++;
          if (!E.ff.stdin.write(png)) await new Promise((r) => E.ff.stdin.once("drain", r));
          if (++doneN % 30 === 0 && process.stdout.isTTY) process.stdout.write(`\r  ${doneN}/${N} khung`);
        }
        E.ff.stdin.end();
        await E.done;
        await P.browser.close();
      }));
      if (process.stdout.isTTY) process.stdout.write("\r");
      const mp4 = path.resolve(opt("--out") ?? path.join(out, `${plan.name}.mp4`));
      const list = path.join(out, "segs.txt");
      fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s}'`).join("\n"));
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", mp4]);
      for (const s of segs.filter(Boolean)) fs.rmSync(s);
      const sfxSrc = path.join(out, `${plan.name}.sfx.json`), sfxDst = mp4.replace(/\.mp4$/, ".sfx.json");
      if (sfxDst !== sfxSrc) fs.copyFileSync(sfxSrc, sfxDst); // gợi ý SFX luôn nằm cạnh MP4 (embed.mjs đọc ở đó)
      fs.rmSync(list);
      const wall = (Date.now() - t0) / 1000;
      console.log(`  ✔ ${path.relative(ROOT, mp4)} · ${workers} trình duyệt · ${wall.toFixed(1)}s (${((wall * 1000) / N).toFixed(0)} ms/khung thực tế; mỗi trình duyệt: vẽ ${(stat.map / stat.frame).toFixed(0)} + chụp ${(stat.shot / stat.frame).toFixed(0)} ms/khung)`);
    }
    console.log(blocked.size ? `  ⚠ đã chặn ${blocked.size} request ra ngoài: ${[...blocked].slice(0, 3).join(", ")}` : "  ✔ không có request nào ra ngoài máy");
  } finally {
    server.close();
  }
}

for (const f of files) await renderOne(path.resolve(f));
