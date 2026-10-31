#!/usr/bin/env node
// Chạy trọn bài kiểm chữ: tạo 3 video thử → lib/build.mjs --no-render → kt-check → text-ink (xén / đè dấu, nét móc).
//   npm run test:kiem-chu      (khoảng 5 phút; lỗi thì thoát mã 1, ảnh lỗi ở work/kiem-chu-loi/)
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const run = (args) => { try { return { ok: true, out: execFileSync("node", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64e6 }) }; } catch (e) { return { ok: false, out: (e.stdout ?? "") + (e.stderr ?? "") }; } };
let bad = 0;
const r0 = run(["tests/kiem-chu/make.mjs"]); process.stdout.write(r0.out); if (!r0.ok) process.exit(1);
for (const v of [1, 2, 3]) {
  const b = run(["lib/build.mjs", `work/kiem-chu/v${v}`, "--no-render"]);
  if (!b.ok) { console.log(b.out); bad++; continue; }
  for (const [name, args] of [["kt-check", ["scripts/qa/kt-check.cjs", `build/kiem-chu-${v}/index.html`, `kiem-chu-${v}`]], ["text-ink", ["scripts/qa/text-ink.cjs", `build/kiem-chu-${v}/index.html`, `kiem-chu-${v}`, `work/kiem-chu-loi/v${v}`]]]) {
    const r = run(args);
    const lines = r.out.trim().split("\n");
    console.log(`v${v} ${name}: ${lines.at(-1)}`);
    if (!r.ok) { bad++; for (const l of lines) if (l.startsWith("✗")) console.log("   " + l); }
  }
}
process.exit(bad ? 1 : 0);
