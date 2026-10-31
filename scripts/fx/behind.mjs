// Chữ NẰM SAU đối tượng: HyperFrames render chữ đè lên mọi thứ → phủ lại đối tượng gốc (footage × mặt nạ từ scripts/fx/matte.py)
// lên output.mp4 trong từng cửa sổ thời gian. Chữ còn thấy ở chỗ không có đối tượng, bị che ở chỗ có → như nằm phía sau.
//   import { behind } from "../../scripts/fx/behind.mjs";
//   behind(outDir, footage, matteDir, { intro: [0, 4.8], … })   // gọi sau buildVideo (render xong)
// Điều kiện: footage phủ kín khung 1080×1920 không biến đổi (không zoom/lia #cam trong các cửa sổ); mặt nạ cùng cỡ footage, 30 fps.
// Lớp tối/scrim của template không phủ lên đối tượng được phủ lại → đối tượng nổi hơn nền, đúng ý điện ảnh.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function behind(outDir, footage, matteDir, windows) {
  const out = path.join(outDir, "output.mp4"), raw = path.join(outDir, "output-raw.mp4");
  fs.renameSync(out, raw);
  const args = ["-loglevel", "error", "-y", "-i", raw];
  const fl = [];
  let prev = "0:v", n = 1;
  for (const [name, [a, b]] of Object.entries(windows)) {
    const dir = path.join(matteDir, name);
    if (!fs.existsSync(dir)) throw new Error(`Chưa có mặt nạ ${dir} — chạy scripts/fx/matte.py`);
    args.push("-ss", String(a), "-t", String(b - a), "-i", footage, "-framerate", "30", "-i", path.join(dir, "%05d.png"));
    const f = n++, m = n++;
    fl.push(`[${f}:v]scale=1080:1920:flags=bicubic,format=rgba,setpts=PTS-STARTPTS[f${f}]`,
      `[${m}:v]scale=1080:1920:flags=bicubic,format=gray,setpts=PTS-STARTPTS[m${m}]`,
      `[f${f}][m${m}]alphamerge,setpts=PTS+${a}/TB[a${f}]`,
      `[${prev}][a${f}]overlay=eof_action=pass:enable='between(t,${a},${b})'[v${f}]`);
    prev = `v${f}`;
  }
  args.push("-filter_complex", fl.join(";"), "-map", `[${prev}]`, "-map", "0:a", "-c:a", "copy", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out);
  execFileSync("ffmpeg", args, { stdio: "inherit" });
  console.log(`✔ chữ sau đối tượng: ${Object.keys(windows).join(", ")} → ${path.relative(process.cwd(), out)}`);
}
