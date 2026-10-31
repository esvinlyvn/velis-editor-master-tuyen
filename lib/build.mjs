#!/usr/bin/env node
// lib/build.mjs — dựng MỌI video từ dữ liệu: node lib/build.mjs projects/<video> [--no-render]
//   Đầu vào (repo): projects/<video>/plan.json + transcript.json (+ SHOTBOOK.md, NOTES.md, info/).
//   Đầu vào (không commit): work/<video>/footage.mp4, voice.wav [, music.*, matte/].  Đầu ra: build/<video>/.
//   Không có code riêng cho từng video: muốn đổi cách dựng thì sửa thư viện lib/ (áp cho mọi video sau) hoặc dữ liệu plan.json.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlan, resolveBlocks, resolveSfx, SFX_ROLES, textsOf } from "./plan.mjs";
import { duck, beatGrid } from "./music.mjs";
import { dialogue, ambience } from "./audio.mjs";
import { sfxHtml } from "../scripts/sfx-cues.mjs";
import { scrimPlan, lumHex, ratio } from "../scripts/text-contrast.mjs";
import { behind } from "../scripts/fx/behind.mjs";
import { loudnormMix } from "../scripts/build-video.mjs";

const LIB = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(LIB, "..");
const dirArg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!dirArg) { console.error("Cách dùng: node lib/build.mjs projects/<video> [--no-render]"); process.exit(1); }
const DIR = path.resolve(dirArg);
const RENDER = !process.argv.includes("--no-render");
const r2 = (n) => Math.round(n * 1000) / 1000;
const rel = (p) => path.relative(ROOT, p);

const P = loadPlan(DIR);
const { plan, T, st, brand } = P;
const slug = plan.video ?? path.basename(DIR);
const WORK = path.join(ROOT, "work", slug), OUT = path.join(ROOT, "build", slug);
const media = { footage: path.join(WORK, "footage.mp4"), voice: path.join(WORK, "voice.wav"), ...Object.fromEntries(Object.entries(plan.media ?? {}).map(([k, v]) => [k, v && path.resolve(ROOT, v)])) };
for (const k of ["footage", "voice"]) if (!fs.existsSync(media[k])) throw new Error(`Thiếu ${k}: ${rel(media[k])} (clip thô để ở work/, không commit)`);
const ff = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args]);
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// ---------- màu (VAN-HANH mục 7): Log → Rec.709 đã làm ở proxy (lib/ingest.mjs, LUT kỹ thuật) ----------
//   1. sửa màu (color correction): cân trắng, vùng tối / sáng, tương phản, bão hòa — plan.color.correct (bộ lọc ffmpeg)
//   2. phối màu (color grading): LUT nghệ thuật trộn theo cường độ — plan.color.lut + strength, mặc định LUT của kênh (brand.json)
//   plan.grade (cũ) vẫn đọc như plan.color.correct. Bản pha để ở work/ (không commit), tự làm lại khi footage / plan mới hơn.
let FOOT = media.footage;
const COL = { correct: plan.color?.correct ?? plan.grade, lut: plan.color?.lut ?? brand?.lut?.file, k: plan.color?.strength ?? brand?.lut?.cuong_do ?? 0.65 };
const lut = COL.lut && path.join(ROOT, "luts", COL.lut);
if (lut && !fs.existsSync(lut)) throw new Error(`Không có LUT ${rel(lut)}`);
if (COL.correct || lut) {
  FOOT = path.join(WORK, "footage-graded.mp4");
  const stale = !fs.existsSync(FOOT) || fs.statSync(FOOT).mtimeMs < Math.max(fs.statSync(media.footage).mtimeMs, fs.statSync(path.join(DIR, "plan.json")).mtimeMs);
  if (stale) {
    const vf = `[0:v]${COL.correct ? COL.correct + "," : ""}${lut ? `split[a][b];[b]lut3d=file=${lut}:interp=tetrahedral[g];[a][g]blend=all_expr='A*(1-${COL.k})+B*${COL.k}'` : "null"}`;
    fs.mkdirSync(WORK, { recursive: true });
    ff(["-i", media.footage, "-filter_complex", vf, "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-g", "30", "-keyint_min", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", FOOT]);
  }
  console.log(`màu: ${COL.correct ? "sửa màu " + COL.correct : "không sửa"} → ${lut ? `LUT ${COL.lut} ${Math.round(COL.k * 100)}%` : "không LUT"}`);
}

// ---------- khối chữ, tương phản, chữ sau người ----------
const { KT, warn } = resolveBlocks(P);
const VDUR = probe(media.voice), DURATION = Math.round((VDUR + (plan.tail ?? 0.3)) * 100) / 100;
// màu đại diện của chữ để đo tương phản (giữa gradient / mặt kim loại)
const TONE = { vang: "#ffd84a", bac: "#e3e9f0", bang: "#e6f7ff", trang: "#ffffff" };
const TXT = (c) => c.p === "chu-bac" ? "#c9ced6" : c.p === "ky-niem" ? "#ffffff"
  : ["kim-loai", "so-khong-lo", "noi-khoi"].includes(c.p) ? TONE[c.o.tone ?? (c.p === "noi-khoi" ? "vang" : "vang")]
  : c.p === "chu-gian" ? (c.o.mau ? c.o.c : "#ffffff") : c.p === "logo-ghep" ? "#e8fbff" : c.o.c ?? "#ffffff";
const SELF_BG = new Set(["pill-xep", "nhan-ban-do"]); // chữ nằm trên nền riêng của preset: không cần xử lý
const CON = scrimPlan(FOOT, KT, { dur: VDUR, color: TXT, heroMin: 2.6, leadMin: 3.5, maxA: 0.6 });
// Luật 18 (mới): đo trước, xử lý sau. q = tương phản hiện có / chuẩn (chữ chính 3 : 1, chữ dẫn trắng 4,5 : 1), lấy phần kém hơn.
//   q ≥ 1 → KHÔNG thêm gì · q ≥ 0,66 → viền mảnh · q ≥ 0,45 → bóng gọn · chữ tối trên nền tối → tỏa sáng nhẹ
//   · q < 0,45 → nền mờ sau chữ + bóng + viền + tối nhẹ (tối đa 0,35), như video mẫu ME4REAL; style.scrim "gradient-dam" thì phủ tới 0,6.
//   Viền / bóng tạo mép tối sát nét nên đọc rõ mà không làm tối video (luật 19).
KT.forEach((c, i) => {
  const { lum } = CON[i], Lt = lumHex(TXT(c));
  c.scrim = 0; c.fx = "khong";
  if (SELF_BG.has(c.p) || c.objTop != null) return;
  if (Lt < 0.2) { // chữ tối (mực poster): cần nền sáng, thiếu thì tỏa sáng nhẹ; thiếu nặng thì báo đổi cảnh
    const r = ratio(Lt, lum);
    if (r < 3) c.fx = "sang";
    if (r < 1.8) warn.push(`khối ${i + 1} (${c.p}): chữ tối trên nền tối (tương phản ${r.toFixed(1)} : 1) — đặt lên cảnh sáng hoặc đổi màu chữ`);
    return;
  }
  const q = Math.min(ratio(Lt, lum) / 3, ratio(1, lum) / 4.5);
  c.q = Math.round(q * 100) / 100;
  if (q >= 1) return;
  if (q >= 0.66) { c.fx = "vien"; return; }
  if (q >= 0.45) { c.fx = "bong"; return; }
  const Lmax = Math.min((Lt + 0.05) / 2 - 0.05, 1.05 / 3 - 0.05);
  const cap = st.scrim === "gradient-dam" ? 0.6 : 0.35;
  c.scrim = Math.min(cap, Math.max(0.1, 1 - Lmax / lum)); c.fx = "mo"; c.blur = true;
});

const BEHIND = plan.behind ?? {}, okF = path.join(WORK, "behind-ok.json");
const behindOk = fs.existsSync(okF) ? JSON.parse(fs.readFileSync(okF, "utf8")) : {};
const objTop = (name, a, b) => {
  const f = path.join(WORK, "matte", name + ".json");
  if (!fs.existsSync(f)) return plan.behind_top?.[name];
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  const v = j.top.filter((x, i) => x != null && j.start + i / j.fps >= a && j.start + i / j.fps <= b).sort((x, y) => x - y);
  return v[Math.floor(v.length / 2)];
};
for (const c of KT) {
  if (!c.behind) continue;
  const top = behindOk[c.behind] === false ? null : objTop(c.behind, c.at, c.out);
  if (top == null) { warn.push(`khối "${c.o.m ?? c.p}": chữ sau người "${c.behind}" chưa có mặt nạ/đỉnh đầu hoặc không đạt kiểm đọc → chữ nổi bình thường`); delete c.behind; continue; }
  c.objTop = top; c.narrow = top + 60 > 700;
}

// ---------- nhạc (M5) + montage theo phách ----------
let musicHtml = "";
const mus = plan.music ?? (brand?.nhac ? { file: brand.nhac } : null);
if (mus?.montage?.length) {
  if (!mus.bpm) throw new Error("music.montage cần music.bpm");
  for (const [a, b] of mus.montage) {
    const cuts = beatGrid(mus.bpm, { offset: mus.offset ?? 0, from: a, to: b, every: mus.every ?? 4 });
    console.log(`montage ${a}–${b}s: ${cuts.length} cú cắt theo phách → ${cuts.join(", ")}`);
    (plan.sfx_layer ??= []).push(...cuts.map((t) => ({ at: t, role: SFX_ROLES.formulas.montage[0].role, vol: SFX_ROLES.formulas.montage[0].vol, why: "cắt montage theo phách" })));
  }
}

// B-roll có ghi sfx: tiếng chuyển cảnh lúc vào (mặc định không: cú cắt thường không tiếng, quyết định M1)
for (const b of plan.edit?.broll ?? []) if (b.sfx) (plan.sfx_layer ??= []).push({ at: b.at, role: b.sfx === true ? "chuyen-canh" : b.sfx, vol: 0.3, why: "B-roll vào" });

// ---------- công thức (lib/recipes.json): in khung thời lượng gợi ý để đối chiếu ----------
const RECIPES = JSON.parse(fs.readFileSync(path.join(LIB, "recipes.json"), "utf8"));
const R = plan.recipe && RECIPES[plan.recipe];
if (plan.recipe && !R) throw new Error(`recipe "${plan.recipe}" không có trong lib/recipes.json (${Object.keys(RECIPES).filter((k) => !k.startsWith("_")).join(", ")})`);
if (R) {
  let t = 0;
  console.log(`công thức ${plan.recipe} · ${R.ten}: ` + R.khung.map(([k, f]) => `${k} ${t.toFixed(0)}–${(t += f * DURATION).toFixed(0)}s`).join(" · "));
  const roles = new Set(KT.map((c) => c.role));
  const miss = R.vai_uu_tien.filter((v) => !roles.has(v));
  if (miss.length) warn.push(`công thức ${plan.recipe} nên có vai: ${miss.join(", ")}`);
}

// ---------- SFX ----------
const S = resolveSfx(P, KT);
warn.push(...S.warn);

// ---------- dựng thư mục build ----------
fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ["assets/fonts", "assets/vendor"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });
let fonts = "";
const fam = {}, loads = [];
const embed = ([pkg, weights], role) => {
  // font từ file (bộ SVN ở fonts/svn): ["file:fonts/svn/<tên>.otf"] — một file một kiểu chữ
  if (pkg.startsWith("file:")) {
    const src = path.join(ROOT, pkg.slice(5));
    if (!fs.existsSync(src)) { warn.push(`thiếu font ${pkg.slice(5)} → dùng font dự phòng`); return embed(role === "serif" ? ["playfair-display", [400]] : ["lobster", [400]], role); }
    const name = path.basename(src), famName = name.replace(/\.(otf|ttf)$/i, "");
    fs.copyFileSync(src, path.join(OUT, "assets/fonts", name.replace(/\s+/g, "_")));
    fonts += `@font-face { font-family: '${famName}'; src: url(assets/fonts/${name.replace(/\s+/g, "_")}) format('${/otf$/i.test(name) ? "opentype" : "truetype"}'); font-weight: 400; font-display: block; }\n`;
    fam[role] ??= famName;
    if (role) loads.push(`400 100px "${famName}"`);
    return;
  }
  const dir = path.join(ROOT, "node_modules/@fontsource", pkg);
  if (!fs.existsSync(dir)) throw new Error(`Chưa cài font @fontsource/${pkg} (npm install)`);
  for (const w of weights) {
    const css = fs.readFileSync(path.join(dir, `${w}.css`), "utf8");
    fam[role] ??= /font-family:\s*'([^']+)'/.exec(css)[1];
    fonts += css.replace(/url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\),\s*url\([^)]+\) format\('woff'\)/g, (_, f) => (fs.copyFileSync(path.join(dir, "files", f), path.join(OUT, "assets/fonts", f)), `url(assets/fonts/${f}) format('woff2')`));
    if (role) loads.push(`${String(w).includes("italic") ? "italic " : ""}${parseInt(w)} 100px "${fam[role]}"`);
  }
};
embed(st.display, "display"); embed(st.sans, "sans"); embed(st.script, "script"); embed(st.script2 ?? st.script, "script2");
if (KT.some((c) => c.p === "poster-serif")) embed(st.serif ?? ["playfair-display", [400]], "serif"); // poster-serif cần font serif
embed(["be-vietnam-pro", [900]], null); // font dự phòng trong CSS preset BĐS (lint)
if (fam.script !== "Lobster") embed(["lobster", [400]], null); // dự phòng viết tay trong CSS preset (lint)
fs.copyFileSync(path.join(ROOT, "node_modules/gsap/dist/gsap.min.js"), path.join(OUT, "assets/vendor/gsap.min.js"));
fs.copyFileSync(FOOT, path.join(OUT, "assets/footage.mp4"));
// lớp 1 lời thoại: lọc, khử ồn, EQ, de-ess, nén, −14 LUFS (lib/audio.mjs)
dialogue(media.voice, path.join(OUT, "assets/voice.wav"), plan.audio?.dialogue);
// lớp 2a tiếng môi trường nền (lớp 2b SFX điểm, lớp 3 nhạc, foley là vai SFX "foley")
const amb = plan.audio?.ambience;
if (amb) {
  ambience(path.resolve(ROOT, amb.file), path.join(OUT, "assets/ambience.wav"), { dur: DURATION, lufs: amb.lufs });
  musicHtml += `<audio id="ambience" src="assets/ambience.wav" data-start="0" data-duration="${DURATION}" data-track-index="7" data-volume="1"></audio>`;
  console.log(`tiếng môi trường: ${amb.file} · ${amb.lufs ?? -38} LUFS`);
}
if (mus) {
  const f = path.resolve(ROOT, mus.file);
  const d = duck(f, T, path.join(OUT, "assets/music.wav"), { dur: DURATION, bed_db: mus.bed_db, duck_db: mus.duck_db });
  musicHtml += `<audio id="music" src="assets/music.wav" data-start="0" data-duration="${DURATION}" data-track-index="8" data-volume="1"></audio>`;
  console.log(`nhạc: ${rel(f)} · hạ dưới ${d.spans} quãng nói`);
}

// ---------- bộ chung (p "chung:<id>", luật 20): HTML + GSAP sinh sẵn bằng text-presets/presets.mjs, đặt trong ô kt-slot
//   như các bộ khác nên cùng vị trí, lớp tối, xử lý tương phản (luật 18), kt-check. Template dời ô, đặt bề rộng rồi chạy lại bố cục.
let chungCss = "", chungHtml = "", chungJs = "{}", chungRuntime = "";
if (KT.some((c) => c.p.startsWith("chung:"))) {
  const { presetHtml, presetJs, presetRuntime, PRESET } = await import("../text-presets/presets.mjs");
  const { fontCss, fontLoads } = await import("../text-presets/fonts.mjs");
  loads.push(...fontLoads()); // font của bộ chung phải tải xong trước khi template đo bố cục (đo bằng font dự phòng thì khối co sai, tràn ô)
  chungCss = `<style>\n${fontCss(OUT)}\n${fs.readFileSync(path.join(ROOT, "text-presets/presets.css"), "utf8")}</style>`;
  const fns = [];
  KT.forEach((c, j) => {
    if (!c.p.startsWith("chung:")) return;
    const id = c.p.slice(6), sel = `#ktx${j}`;
    const theme = { c1: c.o.c2 ?? c.o.c, c2: c.o.c, glow: c.o.c, fill2: "#ffffff", solid: c.o.c2 ?? c.o.c, hue: 0 };
    chungHtml += `<div class="kt-slot" id="ktc${j}">${presetHtml(id, c.o.texts, { id: `ktx${j}`, left: 450, top: 0, theme, bg: "dark", maxWidth: 864, edge: 0, center: "ink", wrap: false })}</div>\n`;
    const exit = c.out < 900;
    // bộ chung vào chậm hơn bộ BĐS (gõ từng chữ, dòng sau trễ): tăng tốc để vào xong trong ~1,2 s và trước lúc ra
    const entry = Math.max(...PRESET[id].lines.map((l) => (l.d ?? 0) + 0.9)), room = Math.min(1.2, (exit ? c.out - c.at : 9) - 0.45);
    const speed = r2(Math.min(2.5, Math.max(1, entry / Math.max(0.4, room))));
    // timeline con (mốc 0 = lúc vào), tăng tốc cả khối rồi gắn vào tl tại c.at; giờ ra giữ đúng c.out
    const hold = exit ? r2((c.out - c.at + 0.3) * speed) : 1e4;
    fns.push(`${j}: (T) => { const tl = gsap.timeline();\n${presetJs(id, sel, 0, { hold, exit, theme })}\ntl.timeScale(${speed}); T.add(tl, ${c.at}); }`);
  });
  chungJs = `{\n${fns.join(",\n")}\n}`;
  chungRuntime = presetRuntime();
}

const comp = slug.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
const bds = (f) => fs.readFileSync(path.join(ROOT, "text-presets/bds", f), "utf8");
const html = fs.readFileSync(path.join(LIB, "template.html"), "utf8")
  .replace("{{TITLE}}", () => slug)
  .replaceAll("{{COMP}}", comp)
  .replace("{{FONTS}}", () => fonts)
  .replace("{{BDS_CSS}}", () => `<style>\n${bds("bds-presets.css")}\n${bds("me4real.css")}</style>`)
  .replace("{{BDS_JS}}", () => `<script>\n${bds("bds-presets.js")}</script>\n<script>\n${bds("me4real.js")}</script>`)
  .replaceAll("{{DURATION}}", String(DURATION))
  .replace("{{VOICE_DUR}}", String(r2(VDUR)))
  .replace("{{SFX}}", () => sfxHtml(S.cues, OUT, { gainDb: 6, minGap: 0.35 }))
  .replace("{{MUSIC}}", () => musicHtml)
  .replace("{{KT}}", () => JSON.stringify(KT))
  .replace("{{CHUNG_CSS}}", () => chungCss)
  .replace("{{CHUNG_HTML}}", () => chungHtml)
  .replace("{{CHUNG_JS}}", () => chungJs)
  .replace("{{CHUNG_RUNTIME}}", () => chungRuntime)
  .replace("{{STYLE}}", () => JSON.stringify({ display: fam.display, sans: fam.sans, script: fam.script, serif: fam.serif ?? fam.display, script2: fam.script2 ?? fam.script, loads, scrim: st.scrim ?? "gradient" }));
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "blocks.json"), JSON.stringify({ duration: DURATION, blocks: KT.map(({ o, ...c }) => ({ ...c, text: o.m ?? o.lines ?? o.words ?? o.value })), sfx: S.cues }, null, 1));

console.log(`✔ ${rel(OUT)}/index.html · ${DURATION}s · phong cách ${st.id ?? st.ten ?? "riêng"} (${st.main}, ${fam.display} / ${fam.sans}, lớp tối ${st.scrim ?? "gradient"}) · ${KT.length} khối · ${S.cues.length} SFX`);
for (const c of KT) console.log(`  ${String(c.at).padStart(6)}–${String(c.out).padEnd(6)} ${c.p.padEnd(12)} ${(c.role ?? "").padEnd(12)} ${c.o.lines ? c.o.lines.map((L) => L.t ?? L.parts.map((x) => x.t).join(" ")).join(" / ") : textsOf(c.o).join(" ") || c.o.words?.join(" / ")}  xử lý ${c.fx}${c.q != null ? ` q ${c.q}` : ""}${c.scrim ? ` (phủ ${c.scrim.toFixed(2)})` : ""}${c.objTop != null ? ` · sau người (đỉnh ${c.objTop})` : ""}`);
if (warn.length) console.log("\nCẢNH BÁO:\n- " + warn.join("\n- "));

if (RENDER) {
  // master: H.264 25 Mbps (khung 20–50 Mbps), render MỘT lần; bản nháp / bản cuối lấy từ đây (lib/export.mjs)
  execFileSync("npx", ["hyperframes", "render", "-o", "output.mp4", "--video-bitrate", plan.bitrate ?? "25M"], { cwd: OUT, stdio: "inherit", env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" } });
  const wins = Object.fromEntries(Object.entries(BEHIND).filter(([k]) => KT.some((c) => c.behind === k && c.objTop != null)));
  if (Object.keys(wins).length) {
    if (!fs.existsSync(okF)) throw new Error("Chưa kiểm chữ-sau-người: chạy scripts/fx/behind-check.py trước khi render");
    behind(OUT, FOOT, path.join(WORK, "matte"), wins);
  }
  if (plan.loudnorm !== false) loudnormMix(path.join(OUT, "output.mp4")); // bản trộn về −14 LUFS, đỉnh ≤ −1,5 dBTP (VAN-HANH 5)
  console.log(`Tiếp: node lib/qc.mjs ${dirArg} --asr → node lib/export.mjs ${dirArg} --draft (gửi duyệt) → --final`);
}
