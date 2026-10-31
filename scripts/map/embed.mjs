// Ghép cảnh bản đồ đã render vào một project HyperFrames (build.mjs của video). Xem MAP.md mục 7.
//   import { mapClip } from "../../scripts/map/embed.mjs";
//   const m = mapClip("build/map/long-thanh/long-thanh.mp4", out, { id: "map1", start: 12.4 });
//   html.replace("{{MAP1}}", m.html)   ·   sfx cues: [...cues, ...m.cues]   ·   GSAP: tl.fromTo("#map1", {opacity:0}, {opacity:1, duration:.3}, 12.4)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT } from "./tiles.mjs";

/** Chép MP4 vào <out>/assets/video/ và trả về thẻ <video> (bọc trong lớp .map-broll để tween opacity — không tween chính thẻ
 *  <video>) + gợi ý SFX của cảnh (file <tên>.sfx.json cạnh MP4, mốc đã cộng `start` lúc render). */
export function mapClip(mp4, out, { id, start, duration, mediaStart = 0, track = 3 } = {}) {
  const src = path.resolve(ROOT, mp4);
  if (!fs.existsSync(src)) throw new Error(`Chưa có ${mp4} — chạy: npm run map -- <canh.json>`);
  if (!id) throw new Error("mapClip cần id (HyperFrames bắt buộc <video> có id)");
  const clipDur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).toString());
  const dur = +(duration ?? clipDur - mediaStart).toFixed(3);
  fs.mkdirSync(path.join(out, "assets/video"), { recursive: true });
  const name = path.basename(src);
  fs.copyFileSync(src, path.join(out, "assets/video", name));
  const html = `<div class="map-broll" id="${id}" style="position:absolute;inset:0;opacity:0"><video id="${id}-v" src="assets/video/${name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" data-start="${start}" data-duration="${dur}" data-media-start="${mediaStart}" data-track-index="${track}" muted playsinline></video></div>`;
  const sfxFile = src.replace(/\.mp4$/, ".sfx.json");
  const cues = fs.existsSync(sfxFile) ? JSON.parse(fs.readFileSync(sfxFile, "utf8")).filter((c) => c.at >= start && c.at < start + dur) : [];
  return { html, cues, duration: dur };
}
