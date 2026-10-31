#!/usr/bin/env python3
# Lấy mẫu nền sau hộp chữ (DAC-TA-CHU.md mục 7.1) và đo phần chữ bị người che (mục 5.3).
#   python3 -I scripts/bg-sample.py colors <jobs.json>    jobs: [{id, png, box:[x,y,w,h]}] → [{id, lum, p75, hue, sat}]
#   python3 -I scripts/bg-sample.py cover  <jobs.json>    jobs: [{id, text_png, masks:[png…]}] → [{id, cover}]
#   python3 -I scripts/bg-sample.py overlap <jobs.json>   jobs: [{id, pngs:[ảnh từng dòng chữ, cùng khung]}] → [{id, overlap: số điểm ảnh 2 dòng chạm nhau}]
#     (chữ + viền, không tính bóng/glow; nới mỗi dòng 3 px để bắt cả chỗ sát nhau)
#   python3 -I scripts/bg-sample.py uncovered <jobs.json> jobs: [{id, fill_png, base_png}] → [{id, uncovered}]
#     fill_png: chỉ lớp gradient của key; base_png: chỉ hình chữ (không viền) — đếm điểm ảnh có chữ mà gradient không phủ
#     (phần dấu hoặc chấm nằm ngoài hộp tô → hiện màu lớp dưới, chữ bị hai màu)
# lum = độ sáng tương đối (WCAG, tuyến tính), hue theo độ (trung bình vòng tròn, trọng số theo độ bão hòa).
import json, sys, colorsys
import numpy as np
from PIL import Image

def lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def colors(jobs):
    out = []
    for j in jobs:
        im = np.asarray(Image.open(j["png"]).convert("RGB")).astype(float)
        x, y, w, h = [int(round(v)) for v in j["box"]]
        x0, y0 = max(0, x), max(0, y)
        r = im[y0:y + h, x0:x + w].reshape(-1, 3)
        L = 0.2126 * lin(r[:, 0]) + 0.7152 * lin(r[:, 1]) + 0.0722 * lin(r[:, 2])
        hs = np.array([colorsys.rgb_to_hsv(*(p / 255.0))[:2] for p in r[:: max(1, len(r) // 4000)]])
        ang = hs[:, 0] * 2 * np.pi
        wgt = hs[:, 1] + 1e-6
        hue = (np.degrees(np.arctan2((np.sin(ang) * wgt).sum(), (np.cos(ang) * wgt).sum())) + 360) % 360
        out.append({"id": j["id"], "lum": round(float(L.mean()), 4), "p75": round(float(np.percentile(L, 75)), 4),
                    "hue": round(float(hue), 1), "sat": round(float(hs[:, 1].mean()), 3)})
    return out

def cover(jobs):
    out = []
    for j in jobs:
        t = np.asarray(Image.open(j["text_png"]).convert("RGBA")).astype(float)[:, :, 3] / 255.0
        vals = []
        for m in j["masks"]:
            a = np.asarray(Image.open(m).convert("L").resize((t.shape[1], t.shape[0]))).astype(float) / 255.0
            vals.append(float((t * a).sum() / max(t.sum(), 1e-6)))
        out.append({"id": j["id"], "cover": round(max(vals), 3)})
    return out

def dilate(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out

def overlap(jobs):
    out = []
    for j in jobs:
        ms = [dilate(np.asarray(Image.open(p).convert("RGBA"))[:, :, 3] > 64, 3) for p in j["pngs"]]
        worst = 0
        for a in range(len(ms)):
            for b in range(a + 1, len(ms)):
                worst = max(worst, int((ms[a] & ms[b]).sum()))
        out.append({"id": j["id"], "overlap": worst})
    return out

def uncovered(jobs):
    out = []
    for j in jobs:
        f = np.asarray(Image.open(j["fill_png"]).convert("RGBA")).astype(float)[:, :, 3] / 255.0
        b = np.asarray(Image.open(j["base_png"]).convert("RGBA")).astype(float)[:, :, 3] / 255.0
        out.append({"id": j["id"], "uncovered": int(((b > 0.5) & (f < 0.2)).sum())})
    return out

mode, path = sys.argv[1], sys.argv[2]
jobs = json.load(open(path))
print(json.dumps({"colors": colors, "cover": cover, "overlap": overlap, "uncovered": uncovered}[mode](jobs)))
