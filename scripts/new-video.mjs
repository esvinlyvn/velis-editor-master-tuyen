#!/usr/bin/env node
// Tạo video mới: node scripts/new-video.mjs <kenh>-<du-an> [--kenh <kenh>] [--recipe R1] [--style S1]
//   → projects/<video>/plan.json (khung rỗng) + work/<video>/ với cây thư mục chuẩn (lib/ingest.mjs: 01_footage, 02_audio,
//     03_assets, 05_exports, proxy; không commit). Bỏ cảnh quay vào 01_footage/<máy>/, mic rời vào 02_audio/voiceover/.
//   Không chép video cũ: mọi cách dựng nằm ở lib/ (lib/README.md).
import fs from "node:fs";
import path from "node:path";
import { DIRS } from "../lib/ingest.mjs";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const a = process.argv.slice(2), slug = a.find((x) => !x.startsWith("--")), opt = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) { console.error("Cách dùng: node scripts/new-video.mjs <kenh>-<du-an> [--kenh k] [--recipe R1] [--style S1] (chữ thường, số, gạch nối)"); process.exit(1); }
const P = path.join(ROOT, "projects", slug);
if (fs.existsSync(P)) { console.error(`Đã có ${path.relative(ROOT, P)}`); process.exit(1); }
fs.mkdirSync(path.join(P, "info"), { recursive: true });
for (const d of DIRS) fs.mkdirSync(path.join(ROOT, "work", slug, d), { recursive: true });
const plan = { video: slug, kenh: opt("--kenh", slug.split("-")[0]), recipe: opt("--recipe", "R1"), style: opt("--style", "S1"),
  edit: { voice: null, aroll: [], broll: [] }, color: { correct: null, lut: null, strength: 0.65 }, audio: { ambience: null },
  roles: {}, hook_peak: null, blocks: [], sfx_layer: [] };
fs.writeFileSync(path.join(P, "plan.json"), JSON.stringify(plan, null, 1) + "\n");
fs.writeFileSync(path.join(P, "NOTES.md"), `# ${slug}\n\nNguồn số liệu, mặc định đã dùng, điều người dùng dặn riêng.\n`);
console.log(`✔ projects/${slug}/plan.json + work/${slug}/{01_footage,02_audio,03_assets,05_exports} · bỏ cảnh quay vào đó rồi làm theo lib/README.md (ingest → assemble → transcript → build → qc → export)`);
