#!/usr/bin/env node
// Sinh media tổng hợp cho bài kiểm build (không phải mẫu phong cách): work/demo/{footage.mp4, voice.wav, music.wav}.
//   node tests/demo/make-media.mjs && node lib/build.mjs tests/demo --no-render
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), W = path.resolve(HERE, "../../work/demo");
const T = JSON.parse(fs.readFileSync(path.join(HERE, "transcript.json"), "utf8"));
fs.mkdirSync(W, { recursive: true });
const ff = (a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);
// footage: nền chuyển màu + một khối "người" ở nửa dưới, 10,8 s, 1080×1920, 30 fps
ff(["-f", "lavfi", "-i", "gradients=s=1080x1920:d=10.8:r=30:c0=0xb9c6d6:c1=0x5a6b80:speed=0.02", "-vf", "drawbox=x=390:y=900:w=300:h=1020:color=0x2b2b33:t=fill", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "28", path.join(W, "footage.mp4")]);
// voice: tiếng ù 180 Hz đúng các quãng nói (thay giọng thật, đủ để đo loudness và ducking)
const on = T.chunks.map((c) => `between(t,${c.start},${c.end})`).join("+");
ff(["-f", "lavfi", "-i", `aevalsrc='0.3*sin(2*PI*180*t)*(${on})':s=48000:d=10.5`, path.join(W, "voice.wav")]);
// music: hợp âm đơn giản 10,8 s
ff(["-f", "lavfi", "-i", "aevalsrc='0.2*sin(2*PI*220*t)+0.15*sin(2*PI*277*t)+0.12*sin(2*PI*330*t)':s=48000:d=10.8", path.join(W, "music.wav")]);
console.log("✔ work/demo: footage.mp4, voice.wav, music.wav");
