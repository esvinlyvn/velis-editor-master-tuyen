#!/usr/bin/env node
// Bài kiểm bộ chung trong lib/ (luật 20): dùng lại media tổng hợp của tests/demo → work/chung/.
//   npm run test:chung
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");
execFileSync("node", [path.join(ROOT, "tests/demo/make-media.mjs")], { stdio: "ignore" });
const W = path.join(ROOT, "work/chung");
fs.mkdirSync(W, { recursive: true });
for (const f of ["footage.mp4", "voice.wav"]) fs.copyFileSync(path.join(ROOT, "work/demo", f), path.join(W, f));
console.log("✔ work/chung: footage.mp4, voice.wav");
