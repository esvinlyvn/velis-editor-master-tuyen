#!/usr/bin/env python3
"""Đo từng tiếng SFX trong output.mp4: tách SFX = tiếng tổng − voice (đã khớp hệ số), so với giọng tại đúng chỗ đó.

  python3 -I scripts/qa/sfx-levels.py build/<ten-video> projects/<ten-video>

- Đọc KÊNH TRÁI của MP4 (pan=mono|c0=c0). Đừng dùng -ac 1: ffmpeg cộng 2 kênh ×0,707 → lệch +3 dB, kết quả sai.
- NHỎ: đỉnh SFX thấp hơn RMS giọng quá 4 dB (khó nghe). TO: đỉnh SFX cao hơn RMS giọng quá 6 dB (át giọng).
- Đạt chung (TOOLKIT 6.3): đỉnh output ≤ -1,5 dBFS. SFX nghe được mà trùng đỉnh giọng thì tổng nhích ~1 dB so với voice là bình thường.
- Mức đã thử ổn (gainDb 6): whoosh-soft 0.34 · text-tick 0.6 · pop 0.85 · swipe 0.4 · meter 0.5 · cash 0.5 · error-soft 0.6 · shimmer 0.75.
"""
import json, subprocess, sys
import numpy as np

build, proj = sys.argv[1], sys.argv[2]
rd = lambda f, af: np.frombuffer(subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f, "-af", af, "-ar", "48000", "-f", "f32le", "-"],
                                                 capture_output=True, check=True).stdout, np.float32)
o = rd(f"{build}/output.mp4", "pan=mono|c0=c0"); v = rd(f"{build}/assets/voice.wav", "pan=mono|c0=c0")  # voice stereo (clip quay gốc) → cũng chỉ lấy kênh trái
n = min(len(o), len(v)); o, v = o[:n], v[:n]
seg = slice(48000, min(n, 48000 * 30))
g = float(np.dot(o[seg], v[seg]) / np.dot(v[seg], v[seg]))
d = o - g * v
db = lambda x: 20 * np.log10(max(float(x), 1e-9))
print(f"đỉnh output {db(abs(o).max()):.1f} dBFS ({'đạt' if db(abs(o).max()) <= -1.5 else 'VƯỢT -1,5'}) · đỉnh voice {db(abs(v).max()):.1f} · voice trong mix ×{g:.2f}")
bad = 0
for c in json.load(open(f"{proj}/sfx.json"))["cues"]:
    a = int(c["at"] * 48000); b = min(n, a + int(0.7 * 48000))
    if b - a < 4800 or np.sqrt(np.mean(v[a:b] ** 2)) < 1e-4:  # ngoài vùng có giọng (trước lời đầu / sau lời cuối): không có gì để so
        print(f'{c["at"]:7.2f} {c["name"]:14s} vol={c["vol"]:.2f} (không có giọng để so)'); continue
    sp, vr = db(abs(d[a:b]).max()), db(np.sqrt(np.mean((g * v[a:b]) ** 2)))  # giọng đúng mức trong bản trộn (đã chuẩn hóa)
    flag = "NHỎ" if sp < vr - 4 else ("TO" if sp > vr + 6 else "")
    bad += bool(flag)
    print(f'{c["at"]:7.2f} {c["name"]:14s} vol={c["vol"]:.2f} sfx={sp:6.1f} giọng_rms={vr:6.1f} {flag}')
print(f"{bad} tiếng cần chỉnh" if bad else "SFX ổn")
