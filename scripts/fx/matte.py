#!/usr/bin/env python3
"""Tách nền theo từng khung cho hiệu ứng "chữ nằm sau đối tượng" (chạy trên máy, rembg).

  ~/.asr/bin/python -I scripts/fx/matte.py <footage.mp4> <out_dir> <tên>:<model>:<giây_đầu>:<giây_cuối> [...]
  vd: person:u2net_human_seg:0:4.8  towers:isnet-general-use:11.9:13.9

Cài: VIRTUAL_ENV=~/.asr uv pip install "rembg[cpu]" opencv-python-headless  (model tải lần đầu vào ~/.rembg)
- Model: u2net_human_seg cho người (~0,6 s/khung, viền gọn); isnet-general-use cho vật thể / tòa tháp (~1,6 s/khung).
  birefnet-general-lite đẹp hơn nhưng 10–26 s/khung trên CPU → không dùng.
- Footage phải là CFR (fps=30): khung n của cửa sổ ↔ giây a + n/30.
- Hậu xử lý: trung bình 3 khung (hết nhấp nháy) → ngưỡng → đóng (close) lấp kẽ → lấp lỗ → bỏ mảnh nhỏ (người: chỉ giữ mảng
  lớn nhất, tránh dính người đi ngang phía sau) → co vào 2 px (không lấn ra nền, tránh quầng) → guided filter bám viền ảnh gốc.
- Tháp sa bàn bằng isnet: viền khung lưới, vỡ → đã thử ở một video trước, người dùng chê → chỉ dùng cho NGƯỜI.
- Ra: <out_dir>/<tên>/%05d.png (xám, cùng cỡ footage) + <tên>.json: đỉnh đối tượng mỗi khung (y theo khung 1080×1920)
  để đặt chữ: phần dưới chữ nằm sau đỉnh đầu / đỉnh tháp.
"""
import json, os, subprocess, sys
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session

def guided(I, p, r, eps):
    """Guided filter (He et al.): làm viền mặt nạ p bám theo cạnh của ảnh xám I."""
    box = lambda x: cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1))
    mI, mp = box(I), box(p)
    a = (box(I * p) - mI * mp) / (box(I * I) - mI * mI + eps)
    b = mp - a * mI
    return box(a) * I + box(b)

src, out = sys.argv[1], sys.argv[2]
for spec in sys.argv[3:]:
    name, model, a, b = spec.split(":"); a, b = float(a), float(b)
    d = os.path.join(out, name); os.makedirs(d, exist_ok=True)
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{a:.3f}", "-i", src, "-t", f"{b - a:.3f}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    W, H = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip().split(","))
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    sess = new_session(model); stats = []; raws = []
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9) if "human" in model else (15, 15))
    for i, f in enumerate(frames):
        m = np.array(remove(Image.fromarray(f), session=sess, only_mask=True)).astype(np.float32) / 255
        raws.append(m)
        if i % 30 == 0: print(f"{name} {i}/{len(frames)}", flush=True)
    for i, f in enumerate(frames):
        # (a) mượt theo thời gian: trung bình 3 khung liền nhau → hết nhấp nháy viền
        m = np.mean(raws[max(0, i - 1):i + 2], axis=0)
        m = (m > 0.45).astype(np.uint8) * 255
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
        n, lab, st, _ = cv2.connectedComponentsWithStats(m)
        keep = np.zeros_like(m)
        if n > 1:
            areas = st[1:, cv2.CC_STAT_AREA]
            ids = [1 + int(np.argmax(areas))] if "human" in model else [1 + j for j, ar in enumerate(areas) if ar > 0.004 * W * H]
            for j in ids: keep[lab == j] = 255
        # lấp lỗ: tô từ viền ngoài, phần không chạm tới là lỗ
        ff = keep.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 255)
        keep = keep | cv2.bitwise_not(ff)
        # (b) co vào trong 2 px: mặt nạ không lấn ra nền (lấn ra thì nền gốc phủ lên thành quầng)
        keep = cv2.erode(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
        # (c) tinh viền theo ảnh gốc (guided filter, r=6): viền bám tóc / vai thật thay vì viền thô của model 320 px
        keep = guided(cv2.cvtColor(f, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255, keep.astype(np.float32) / 255, 6, 1e-3)
        keep = np.clip((keep - 0.15) / 0.7, 0, 1)
        out8 = (keep * 255).astype(np.uint8)
        Image.fromarray(out8).save(os.path.join(d, f"{i:05d}.png"))
        rows = np.where((out8 > 128).sum(1) > 0.01 * W)[0]
        stats.append(round(float(rows[0]) * 1920 / H, 1) if len(rows) else None)
    json.dump({"start": a, "fps": 30, "frames": len(frames), "top": stats}, open(os.path.join(out, name + ".json"), "w"))
    print(f"✔ {name}: {len(frames)} khung, đỉnh min={min(x for x in stats if x)} max={max(x for x in stats if x)}", flush=True)
