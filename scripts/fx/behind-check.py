#!/usr/bin/env python3
"""Kiểm chữ-sau-đối-tượng có còn đọc được không: đo phần mỗi ký tự chữ chính bị mặt nạ che, qua mọi khung trong lúc khối hiện.

  ~/.asr/bin/python -I scripts/fx/behind-check.py build/<v>/index.html <composition-id> <matte_dir> <out.json>

- Lấy khung từng ký tự (.m .ch) của các khối có `behind` bằng scripts/fx/behind-rects.cjs (Playwright, window.__kt), lúc khối đã đứng.
- Mỗi khung mặt nạ trong [at + 0,3; out]: tỉ lệ diện tích ký tự bị che.
- KHÔNG ĐẠT (không lồng, để chữ nổi bình thường) nếu có ký tự bị che > 55% ở bất kỳ khung nào, hoặc trung bình cả cụm > 25%.
- Ra <out.json>: { tên_cửa_sổ: true/false } (cửa sổ dùng chung cho nhiều khối: chỉ true khi mọi khối đều đạt) + chi tiết.
"""
import json, subprocess, sys, os, glob
import numpy as np
from PIL import Image

html, comp, matte, out = sys.argv[1:5]
res = json.loads(subprocess.run(["node", "scripts/fx/behind-rects.cjs", html, comp], capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])
verdict, detail = {}, []
for c in res:
    meta = json.load(open(os.path.join(matte, c["behind"] + ".json")))
    files = sorted(glob.glob(os.path.join(matte, c["behind"], "*.png")))
    worst_char, worst_mean = 0.0, 0.0
    for i, f in enumerate(files):
        t = meta["start"] + i / meta["fps"]
        if t < c["at"] + 0.3 or t > c["out"]: continue
        m = np.array(Image.open(f).convert("L"), dtype=np.float32) / 255
        H, W = m.shape; sx, sy = W / 1080, H / 1920
        covs = []
        for ch, l, tp, r, bt in c["chars"]:
            x0, x1, y0, y1 = int(l * sx), max(int(r * sx), int(l * sx) + 1), int(tp * sy), max(int(bt * sy), int(tp * sy) + 1)
            covs.append(float(m[max(0, y0):y1, max(0, x0):x1].mean()) if y1 > 0 and x1 > 0 else 0.0)
        worst_char, worst_mean = max(worst_char, max(covs)), max(worst_mean, sum(covs) / len(covs))
    ok = worst_char <= 0.55 and worst_mean <= 0.25
    verdict[c["behind"]] = verdict.get(c["behind"], True) and ok
    detail.append(f'{"✓" if ok else "✗"} {c["behind"]:6s} {c["m"]:16s} ký tự bị che nhiều nhất {worst_char:.0%} · trung bình cụm {worst_mean:.0%}')
print("\n".join(detail))
json.dump(verdict, open(out, "w"), indent=1)
print("→", out, verdict)
