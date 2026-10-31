// Build dùng chung cho các video có cấu hình: phụ đề, font, voice, SFX, SVG → build/<ten-video>/index.html (+ render).
//   import { buildVideo } from "../../scripts/build-video.mjs";
//   buildVideo(import.meta.url, { fonts, noCap, keep, force, endStart, tail, hl, svgs, maxCap, html })
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sfxHtml } from "./sfx-cues.mjs";
import { breakLines, canBreak } from "./vn-text.mjs";

export function buildVideo(metaUrl, cfg) {
  const HERE = path.dirname(fileURLToPath(metaUrl));
  const ROOT = path.resolve(HERE, "../..");
  const out = path.join(ROOT, "build", path.basename(HERE));
  const T = JSON.parse(fs.readFileSync(path.join(HERE, "transcript.json"), "utf8"));
  const VOICE_DUR = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(HERE, "voice.wav")]).toString());
  const DURATION = Math.round((VOICE_DUR + (cfg.tail ?? 1.9)) * 100) / 100;
  const r2 = (n) => Math.round(n * 1000) / 1000;

  // ---------- Phụ đề ----------
  const LEAD = 0.15, MAX = 7;
  const LINK = new Set("và là mà của thì với để nhưng những các từ ở có đến cho khi trong bởi hay hoặc nên vì rất chỉ đã sẽ".split(" "));
  const NO_CAP = new Set(cfg.noCap ?? []), KEEP = new Set(cfg.keep ?? []), FORCE = cfg.force ?? {};
  const pieces = [];
  for (const c of T.chunks.filter((c) => !NO_CAP.has(c.i))) {
    const words = c.text.split(/\s+/).filter(Boolean);
    const groups = [];
    let g = [];
    words.forEach((w, j) => {
      g.push(w);
      if (KEEP.has(c.i)) return;
      const next = words[j + 1], left = words.length - j - 1;
      if (!next) return;
      if (!canBreak(words, j + 1) && g.length < 11) return;
      if ((/[,.!?:;]$/.test(w) && g.length >= 3 && left >= 2) || (LINK.has(next.toLowerCase()) && g.length >= 4 && left >= 3) || (g.length >= MAX && left >= 3) || g.length >= 9) groups.push(g), (g = []);
    });
    if (FORCE[c.i]) (groups.length = 0), (g = []), FORCE[c.i].reduce((k, n) => (groups.push(words.slice(k, k + n)), k + n), 0);
    if (g.length) groups.length && g.length <= 2 ? groups[groups.length - 1].push(...g) : groups.push(g);
    const chars = words.join(" ").length;
    let acc = c.start;
    for (const gr of groups) {
      const d = ((gr.join(" ").length + 1) / (chars + 1)) * (c.end - c.start);
      pieces.push({ start: acc, end: acc + d, words: gr });
      acc += d;
    }
  }
  const caps = [];
  for (const p of pieces) {
    const last = caps.at(-1);
    if (last && !/[.!?…]["”']?$/.test(last.words.at(-1)) && ((p.start - last.end <= 0.45 && last.words.length + p.words.length <= MAX && (last.words.length < 3 || p.words.length < 3)) || (p.words.length <= 2 && p.start - last.end <= 1.0 && !/[.!?]$/.test(last.words.at(-1))))) {
      last.words.push(...p.words);
      last.end = p.end;
    } else caps.push({ ...p, words: [...p.words] });
  }
  caps.forEach((c, i) => {
    c.s = r2(Math.max(0, c.start - LEAD));
    c.e = r2(c.end + 0.1);
    if (i && caps[i - 1].e > c.s) caps[i - 1].e = c.s;
  });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const hlRe = cfg.hl?.length ? new RegExp(`(${cfg.hl.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi") : null;
  const line = (l) => (hlRe ? esc(l).replace(hlRe, '<b class="kw">$1</b>') : esc(l));
  const capHtml = caps
    .map((c, i) => `<div class="clip cap" id="cap-${i}" data-start="${c.s}" data-duration="${r2(c.e - c.s)}" data-track-index="2"><p class="cap-in">${breakLines(c.words.join(" "), cfg.maxCap ?? 26).map(line).join("<br>")}</p></div>`)
    .join("\n      ");

  // ---------- Font, gsap, voice ----------
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "assets/fonts"), { recursive: true });
  fs.mkdirSync(path.join(out, "assets/vendor"), { recursive: true });
  let fonts = "";
  for (const [pkg, weights] of cfg.fonts) {
    const dir = path.join(ROOT, "node_modules/@fontsource", pkg);
    for (const w of weights)
      fonts += fs.readFileSync(path.join(dir, `${w}.css`), "utf8").replace(/url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\),\s*url\([^)]+\) format\('woff'\)/g, (_, f) => (fs.copyFileSync(path.join(dir, "files", f), path.join(out, "assets/fonts", f)), `url(assets/fonts/${f}) format('woff2')`));
  }
  fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(out, "assets/vendor/gsap.min.js"));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", path.join(HERE, "voice.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", path.join(out, "assets/voice.wav")]);

  const sfx = JSON.parse(fs.readFileSync(path.join(HERE, "sfx.json"), "utf8"));
  let html = fs
    .readFileSync(path.join(HERE, "template.html"), "utf8")
    .replace("{{FONTS}}", fonts)
    .replace("{{CAPTIONS}}", capHtml)
    .replaceAll("{{DURATION}}", String(DURATION))
    .replace("{{SFX}}", sfxHtml(sfx.cues, out, sfx))
    .replace("{{VOICE_DUR}}", String(r2(VOICE_DUR)))
    .replace("{{END_DUR}}", String(r2(DURATION - cfg.endStart)));
  for (const [k, f] of Object.entries(cfg.svgs ?? {})) html = html.replace(`{{${k}}}`, fs.readFileSync(path.join(HERE, f), "utf8"));
  // Preset chữ BĐS (text-presets/bds/BDS-PRESETS.md): đặt {{BDS_CSS}} / {{BDS_JS}} trong template, {{BDS_JS}} sau thẻ gsap
  const bds = (f) => fs.readFileSync(path.join(ROOT, "text-presets/bds", f), "utf8");
  if (html.includes("{{BDS_CSS}}")) html = html.replace("{{BDS_CSS}}", () => `<style>\n${bds("bds-presets.css")}</style>`);
  if (html.includes("{{BDS_JS}}")) html = html.replace("{{BDS_JS}}", () => `<script>\n${bds("bds-presets.js")}</script>`);
  if (cfg.html) html = cfg.html(html, out, { DURATION, VOICE_DUR }); // chèn thêm (vd. cảnh bản đồ: scripts/map/embed.mjs)
  fs.writeFileSync(path.join(out, "index.html"), html);
  console.log(`✔ ${path.relative(ROOT, out)}/index.html · ${DURATION}s · ${caps.length} phụ đề`);
  console.log(caps.map((c) => c.words.join(" ")).join(" | "));
  if (!process.argv.includes("--no-render")) {
    execFileSync("npx", ["hyperframes", "render", "-o", "output.mp4"], { cwd: out, stdio: "inherit", env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" } });
    if (cfg.loudnorm !== false) loudnormMix(path.join(out, "output.mp4"));
  }
}

// Bản trộn (giọng −14 LUFS + SFX) thường to hơn chuẩn: SFX dày cộng thêm 1–3 dB. Lệch khỏi −14 ± 0,5 LUFS thì chuẩn hóa
// hai lượt kiểu tuyến tính (cả bản tăng/giảm đều nhau, tỷ lệ SFX / giọng giữ nguyên), trần đỉnh −1,5 dBTP, giữ nguyên hình.
export function loudnormMix(file, I = -14, TP = -1.5) {
  const measure = (af) => {
    const err = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", "-i", file, "-af", af, "-f", "null", "-"], { encoding: "utf8" }).stderr;
    return JSON.parse(err.slice(err.lastIndexOf("{"), err.lastIndexOf("}") + 1));
  };
  const m = measure(`loudnorm=I=${I}:TP=${TP}:LRA=11:print_format=json`);
  if (Math.abs(Number(m.input_i) - I) <= 0.5 && Number(m.input_tp) <= TP) return console.log(`✔ âm lượng ${m.input_i} LUFS, đỉnh ${m.input_tp} dBTP`);
  const tmp = file.replace(/\.mp4$/, ".loudnorm.mp4");
  execFileSync("ffmpeg", ["-loglevel", "error", "-nostdin", "-y", "-i", file, "-c:v", "copy", "-af",
    `loudnorm=I=${I}:TP=${TP}:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp]);
  fs.renameSync(tmp, file);
  const n = measure(`loudnorm=I=${I}:TP=${TP}:LRA=11:print_format=json`);
  console.log(`✔ âm lượng ${m.input_i} → ${n.input_i} LUFS, đỉnh ${m.input_tp} → ${n.input_tp} dBTP`);
}
