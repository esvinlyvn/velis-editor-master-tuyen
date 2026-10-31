#!/usr/bin/env node
// lib/qc.mjs — Bước 5 hậu kỳ: kiểm định (Quality Control) gom mọi mục kiểm vào một bảng ĐẠT / LỖI.
//   node lib/qc.mjs projects/<video> [--asr]
//   Trước render (chỉ có index.html): lint, kt-check, text-ink (nét chữ bị xén / đè dấu), mật độ sự kiện.
//   Sau render (có output.mp4): thêm khung đen, hình đứng im, độ to −14 ± 0,5 LUFS, đỉnh ≤ −1,4 dBTP, mức SFX so với giọng,
//   motion_check; --asr: nhận diện giọng trên voice.wav và output.mp4, chữ nào đúng ở giọng mà sai ở bản dựng là bị SFX che.
//   Ghi work/<video>/qc.json. Thoát mã 1 nếu có mục LỖI (không xuất bản cuối khi QC chưa đạt).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, opt = {}) => { const r = spawnSync(cmd, args, { encoding: "utf8", cwd: ROOT, maxBuffer: 1 << 28, ...opt }); return { code: r.status, out: (r.stdout ?? "") + (r.stderr ?? "") }; };
const PY = fs.existsSync(path.join(os.homedir(), ".asr/bin/python")) ? path.join(os.homedir(), ".asr/bin/python") : "python3";

export function qc(dir, { asr = false } = {}) {
  const plan = JSON.parse(fs.readFileSync(path.join(dir, "plan.json"), "utf8"));
  const slug = plan.video ?? path.basename(path.resolve(dir)), B = path.join("build", slug), comp = slug.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const out = path.join(B, "output.mp4"), rows = [];
  const row = (muc, ok, chi_tiet) => rows.push({ muc, ok, chi_tiet: String(chi_tiet).trim() });
  if (!fs.existsSync(path.join(ROOT, B, "index.html"))) throw new Error(`Chưa dựng: node lib/build.mjs ${dir} --no-render`);

  let r = run("npx", ["hyperframes", "lint", B]);
  const err = +(/(\d+) error\(s\)/.exec(r.out)?.[1] ?? NaN);
  row("lint", err === 0, `${err} error`);
  r = run("node", ["scripts/qa/kt-check.cjs", path.join(B, "index.html"), comp]);
  const kt = r.out.trim().split("\n").at(-1);
  row("kt-check (chữ chốt)", /^OK/.test(kt), kt);
  // nét chữ bằng điểm ảnh: xén (chữ nghiêng, dấu, nét móc ra ngoài vùng tô) và đè dấu / nét móc giữa hai dòng (luật 12, 21)
  const INK = path.join("work", slug, "qc-ink");
  r = run("node", ["scripts/qa/text-ink.cjs", path.join(B, "index.html"), comp, INK]);
  const ink = r.out.trim().split("\n").at(-1) ?? "";
  row("text-ink (xén / đè dấu)", /^OK/.test(ink), /^OK/.test(ink) ? ink : `${ink} — ảnh lỗi ở ${INK}/`);
  r = run("node", ["scripts/qa/density.mjs", B]);
  row("mật độ sự kiện ≤ 3 s", r.code === 0, r.out.split("\n").filter(Boolean).at(-1));

  if (fs.existsSync(path.join(ROOT, out))) {
    r = run("ffmpeg", ["-nostdin", "-i", out, "-vf", "blackdetect=d=0.04:pix_th=0.08", "-an", "-f", "null", "-"]);
    const blacks = [...r.out.matchAll(/black_start:([\d.]+)/g)].map((m) => (+m[1]).toFixed(2));
    row("không khung đen", !blacks.length, blacks.length ? `đen ở ${blacks.join(", ")} s` : "không có");
    r = run("ffmpeg", ["-nostdin", "-i", out, "-vf", "freezedetect=n=0.003:d=0.8", "-an", "-f", "null", "-"]);
    const fr = [...r.out.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => (+m[1]).toFixed(1));
    row("không hình đứng im ≥ 0,8 s", !fr.length, fr.length ? `đứng im từ ${fr.join(", ")} s` : "không có");
    r = run("ffmpeg", ["-nostdin", "-i", out, "-af", "loudnorm=print_format=json", "-vn", "-f", "null", "-"]);
    const j = JSON.parse(r.out.slice(r.out.lastIndexOf("{"), r.out.lastIndexOf("}") + 1));
    row("độ to −14 ± 0,5 LUFS", Math.abs(+j.input_i + 14) <= 0.5, `${j.input_i} LUFS`);
    row("đỉnh ≤ −1,4 dBTP", +j.input_tp <= -1.4, `${j.input_tp} dBTP`);
    // sfx-levels.py đọc <thư mục>/sfx.json: video dựng bằng lib/ ghi danh sách SFX trong blocks.json → chép sang work/
    const W = path.join("work", slug), bj = JSON.parse(fs.readFileSync(path.join(ROOT, B, "blocks.json"), "utf8"));
    fs.mkdirSync(path.join(ROOT, W), { recursive: true });
    fs.writeFileSync(path.join(ROOT, W, "sfx.json"), JSON.stringify({ cues: bj.sfx }) + "\n");
    r = run(PY, ["-I", "scripts/qa/sfx-levels.py", B, W]);
    row("mức SFX so với giọng", /SFX ổn/.test(r.out), r.out.trim().split("\n").at(-1));
    // baseline = footage gốc cùng vùng đo: nhiễu / hạt có sẵn trong clip không tính là lỗi render
    r = run(PY, ["scripts/qa/motion_check.py", out, "--baseline", path.join(B, "assets/footage.mp4"), "--baseline-crop", "960:120:60:150"]);
    row("motion_check", /画面健康 PASS/.test(r.out), (/\[静止\][^\n]*/.exec(r.out) ?? [""])[0]);
    if (asr) {
      // so cả bài dễ báo nhầm (ASR giải mã khác theo ngữ cảnh dài) → chữ nghi bị che thì cắt ±1,5 s quanh nó ở cả giọng và bản dựng,
      // nhận diện lại: giọng nghe ra mà bản dựng không nghe ra mới là SFX che lời thật
      const norm = (w) => w.toLowerCase().replace(/[,.?!]/g, "");
      const asrWords = (f, ss, t) => {
        const wav = path.join(os.tmpdir(), `qc-${slug}-${process.pid}.wav`), js = wav.replace(/\.wav$/, ".json");
        run("ffmpeg", ["-nostdin", "-y", "-loglevel", "error", ...(ss != null ? ["-ss", String(ss), "-t", String(t)] : []), "-i", f, "-vn", "-ac", "1", "-ar", "16000", wav]);
        run(PY, ["-I", "scripts/asr/transcribe.py", wav, js]);
        return fs.existsSync(js) ? JSON.parse(fs.readFileSync(js, "utf8")).flatMap((c) => c.words.map((w) => ({ w: norm(w.w), s: w.s + (ss ?? 0) }))) : [];
      };
      const vw = asrWords(path.join(B, "assets/voice.wav")), ow = new Set(asrWords(out).map((x) => x.w));
      const lost = [];
      for (const x of vw.filter((x) => !ow.has(x.w))) {
        const ss = Math.max(0, x.s - 1.5);
        if (asrWords(path.join(B, "assets/voice.wav"), ss, 3).some((y) => y.w === x.w) && !asrWords(out, ss, 3).some((y) => y.w === x.w)) lost.push(`${x.w}@${x.s.toFixed(1)}`);
      }
      row("SFX không che lời (ASR)", !lost.length, lost.length ? `nghe sai trên bản dựng: ${lost.join(", ")}` : "các chữ nghe trên giọng đều còn trên bản dựng");
    }
  } else row("render", false, `chưa có ${out} — kiểm phần sau render khi đã render`);

  fs.mkdirSync(path.join(ROOT, "work", slug), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "work", slug, "qc.json"), JSON.stringify({ at: new Date().toISOString(), rows }, null, 1) + "\n");
  return rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!dir) { console.error("Cách dùng: node lib/qc.mjs projects/<video> [--asr]"); process.exit(1); }
  const rows = qc(dir, { asr: process.argv.includes("--asr") });
  for (const x of rows) console.log(`${x.ok ? "✓" : "✗"} ${x.muc.padEnd(28)} ${x.chi_tiet}`);
  const bad = rows.filter((x) => !x.ok).length;
  console.log(bad ? `\n✗ ${bad} mục chưa đạt` : "\n✓ QC đạt");
  process.exit(bad ? 1 : 0);
}
