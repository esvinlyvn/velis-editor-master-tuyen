#!/usr/bin/env python3
"""Đo bố cục từng khung của video Vis (1080 × 1920), bổ sung cho motion_check.py.

Lấy mẫu mỗi --step giây (mặc định 0,5), tách "tiền cảnh" là các điểm ảnh khác hẳn màu nền
(nền = trung vị của dải mép khung), rồi báo:
  CẮT   : tiền cảnh chạm sát mép trái/phải khung trong dải nội dung (y 250–1440): đối tượng bị cắt.
  UI    : tiền cảnh lấn vùng UI của app (cột nút phải x > 940 ở y 700–1600; dải dưới y > 1440) — bỏ qua dòng ghi công nhỏ.
  TRỐNG : vùng an toàn chia 3 × 3 ô, ít hơn --min-cells ô có tiền cảnh (khung trống, một vật nhỏ giữa khung).
Không thay việc nhìn contact sheet; nó bắt các lỗi lặp lại mà mắt dễ bỏ qua khi soát nhanh.

  python3 scripts/qa/layout_audit.py build/<video>/output.mp4 [--step 0.5] [--thresh 46] [--min-cells 3] [--from 0] [--to 999]
Thoát mã 1 nếu có CẮT hoặc UI.
"""
import argparse
import subprocess
import sys

import numpy as np
from PIL import Image


def frames(video, step, t0, t1):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                               capture_output=True, text=True).stdout.strip())
    t = t0
    while t < min(dur - 0.05, t1):
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1",
                              "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        if len(raw) == 1080 * 1920 * 3:
            yield t, np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3).astype(np.int16)
        t += step


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--step", type=float, default=0.5)
    ap.add_argument("--thresh", type=int, default=46, help="độ lệch màu so với nền để tính là tiền cảnh")
    ap.add_argument("--min-cells", type=int, default=3)
    ap.add_argument("--from", dest="t0", type=float, default=0)
    ap.add_argument("--to", dest="t1", type=float, default=1e9)
    a = ap.parse_args()
    bad = 0
    sparse = []
    for t, f in frames(a.video, a.step, a.t0, a.t1):
        band = np.concatenate([f[260:1430, :24].reshape(-1, 3), f[260:1430, -24:].reshape(-1, 3), f[255:275, :].reshape(-1, 3)])
        bg = np.median(band, axis=0)
        fg = np.abs(f - bg).max(axis=2) > a.thresh
        msgs = []
        # CẮT: cột mép trái/phải (8 px) có tiền cảnh dày trong dải nội dung
        # một hàng tính là cắt khi vật chạm mép VÀ dày ≥ 20 px vào trong (đường kẻ lưới mảnh trùng mép không tính)
        for name, edge, inner in (("trái", fg[250:1440, :8], fg[250:1440, :40]), ("phải", fg[250:1440, -8:], fg[250:1440, -40:])):
            col = edge.any(axis=1) & (inner.sum(axis=1) >= 20)
            if col.mean() > 0.02:
                rows = np.where(col)[0]
                msgs.append(f"CẮT mép {name} (y {250 + rows.min()}–{250 + rows.max()})")
        # UI: cột nút phải và dải dưới (bỏ dòng ghi công cao < 40 px ở đáy)
        if fg[700:1600, 950:1072].mean() > 0.03:
            msgs.append("UI cột nút phải")
        if fg[1450:1870, 30:1050].mean() > 0.03:
            msgs.append("UI dải dưới")
        # TRỐNG: 3 × 3 ô trong vùng an toàn
        cells = sum(fg[250 + r * 397:250 + (r + 1) * 397, 60 + c * 294:60 + (c + 1) * 294].mean() > 0.02 for r in range(3) for c in range(3))
        if cells < a.min_cells:
            sparse.append((t, cells))
        if msgs:
            bad += 1
            print(f"{t:6.2f}s  " + " · ".join(msgs))
    if sparse:
        runs, cur = [], [sparse[0]]
        for s in sparse[1:]:
            if s[0] - cur[-1][0] <= a.step + 1e-6:
                cur.append(s)
            else:
                runs.append(cur); cur = [s]
        runs.append(cur)
        for r in runs:
            if r[-1][0] - r[0][0] >= 1.0:
                print(f"{r[0][0]:6.2f}s → {r[-1][0]:.2f}s  TRỐNG (chỉ {min(c for _, c in r)}–{max(c for _, c in r)}/9 ô có nội dung)")
    print(f"[bố cục] {'FAIL' if bad else 'PASS'}: {bad} khung có CẮT/UI")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
