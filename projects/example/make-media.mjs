#!/usr/bin/env node
// Tạo nguồn quay mẫu cho project mẫu (không của khách nào) vào work/example/, đúng cây thư mục của lib/ingest.mjs:
//   01_footage/cam_a/A001.mp4  máy chính, dọc 1080×1920, có tiếng máy (thu xa, ồn, bật máy sau mic 0,62 s)
//   01_footage/cam_b/B001.mp4  góc thứ hai, NGANG 1920×1080 (ingest cắt về khung dọc), tiếng máy lệch 1,37 s
//   01_footage/drone/D001.mp4  cảnh trên cao, ngang, không tiếng → B-roll
//   02_audio/voiceover/mic.flac  mic cài áo: giọng Piper (docs/SOURCES.md), có một câu nói vấp và quãng nghỉ dài để cắt
//   02_audio/ambience/city.wav · 02_audio/music/pad.wav   tiếng phố và nhạc nền tự tạo bằng ffmpeg
//   node projects/example/make-media.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const W = path.resolve(HERE, "../../work/example");
const ff = (a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-nostdin", ...a]);
for (const d of ["01_footage/cam_a", "01_footage/cam_b", "01_footage/drone", "02_audio/voiceover", "02_audio/ambience", "02_audio/music"]) fs.mkdirSync(path.join(W, d), { recursive: true });
const MIC = path.join(W, "02_audio/voiceover/mic.flac");
fs.copyFileSync(path.join(HERE, "nguon/mic.flac"), MIC);
const DUR = 22.5;

// Ảnh trời + dãy nhà có cửa sổ sáng (nửa trên sáng: lớp tối theo nền có việc làm)
const B = "st(0,1250+380*abs(sin(floor(X/120)*12.9898+1.3)));st(1,gt(Y,ld(0)));st(2,lt(mod(X,40),16)*lt(mod(Y,56),26)*gt(sin(floor(X/40)*7.1+floor(Y/56)*3.3),0.35))";
const sky = `color=c=black:s=1440x2560:d=0.04,format=rgb24,geq=r='${B};if(ld(1),if(ld(2),250,32+10*sin(floor(X/120))),228-(228-120)*pow(Y/H,0.9))':g='${B};if(ld(1),if(ld(2),205,38+10*sin(floor(X/120))),241-(241-140)*pow(Y/H,0.9))':b='${B};if(ld(1),if(ld(2),130,52+10*sin(floor(X/120))),255-(255-170)*pow(Y/H,0.8))'`;
const png = path.join(W, "sky.png");
ff(["-f", "lavfi", "-i", sky, "-frames:v", "1", png]);
// Tiếng máy = tiếng mic thu xa: bật máy sau mic `off` giây, lọc dải, nhỏ hơn, có ồn nền
const camAudio = (off) => `[1:a]atrim=start=${off},asetpts=PTS-STARTPTS,highpass=f=200,lowpass=f=3500,volume=0.35[m];anoisesrc=color=brown:amplitude=0.02:duration=${DUR}[n];[m][n]amix=inputs=2:normalize=0,aresample=48000[a]`;
const enc = ["-c:v", "libx264", "-crf", "26", "-preset", "fast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-shortest"];
ff(["-loop", "1", "-framerate", "30", "-i", png, "-i", MIC, "-t", String(DUR), "-filter_complex",
  `[0:v]zoompan=z='1.05+0.2*on/675':x='iw/2-(iw/zoom/2)+50*sin(on/45)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,noise=alls=4:allf=t[v];${camAudio(0.62)}`,
  "-map", "[v]", "-map", "[a]", ...enc, path.join(W, "01_footage/cam_a/A001.mp4")]);
ff(["-loop", "1", "-framerate", "30", "-i", png, "-i", MIC, "-t", String(DUR), "-filter_complex",
  `[0:v]crop=1440:810:0:1050,zoompan=z='1.0+0.1*on/675':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,noise=alls=4:allf=t[v];${camAudio(1.37)}`,
  "-map", "[v]", "-map", "[a]", ...enc, path.join(W, "01_footage/cam_b/B001.mp4")]);
// Drone: phố nhìn từ trên cao (đường, khối nhà, cây), lia ngang
const D = "st(0,lt(mod(X,240),28)+lt(mod(Y,240),28));st(1,gt(sin(floor(X/240)*3.7+floor(Y/240)*5.1),0.4))";
ff(["-f", "lavfi", "-i", `color=c=black:s=2880x1620:d=0.04,format=rgb24,geq=r='${D};if(ld(0),95,if(ld(1),60,150+20*sin(X/9)))':g='${D};if(ld(0),95,if(ld(1),120,140+20*sin(Y/11)))':b='${D};if(ld(0),100,if(ld(1),60,130))'`, "-frames:v", "1", path.join(W, "aerial.png")]);
ff(["-loop", "1", "-framerate", "30", "-i", path.join(W, "aerial.png"), "-t", "10", "-vf", "zoompan=z=1.3:x='(iw-iw/zoom)*on/300':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,noise=alls=3:allf=t",
  "-c:v", "libx264", "-crf", "26", "-preset", "fast", "-pix_fmt", "yuv420p", path.join(W, "01_footage/drone/D001.mp4")]);
// Tiếng phố: ồn nâu lọc thấp, lên xuống chậm. Nhạc nền: hợp âm đơn, 4 phách mỗi ô ở 120 BPM
ff(["-f", "lavfi", "-i", `anoisesrc=color=brown:amplitude=0.3:duration=${DUR}`, "-af", "lowpass=f=900,volume='0.6+0.4*sin(2*PI*t/7)':eval=frame", "-ar", "48000", "-ac", "1", path.join(W, "02_audio/ambience/city.wav")]);
ff(["-f", "lavfi", "-i", `aevalsrc='(0.18*sin(2*PI*220*t)+0.13*sin(2*PI*277.2*t)+0.11*sin(2*PI*329.6*t))*(0.6+0.4*abs(sin(PI*t*2)))':s=48000:d=${DUR}`, path.join(W, "02_audio/music/pad.wav")]);
for (const f of ["sky.png", "aerial.png"]) fs.rmSync(path.join(W, f));
console.log("✔ work/example: cam_a, cam_b (ngang), drone (ngang), mic.flac, ambience, music → tiếp: node lib/ingest.mjs projects/example");
