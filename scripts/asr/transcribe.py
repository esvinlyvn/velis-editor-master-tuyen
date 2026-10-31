#!/usr/bin/env python3
"""Nhận diện giọng nói tiếng Việt trên máy (faster-whisper large-v3, CPU int8), có giờ từng chữ.

  python3 -I scripts/asr/transcribe.py <video|audio> <out.json> ["Tên riêng, thuật ngữ, ..."]

Cài một lần (venv riêng, không đụng repo):
  uv venv ~/.asr && VIRTUAL_ENV=~/.asr uv pip install faster-whisper
  ~/.asr/bin/python -I scripts/asr/transcribe.py clip.mp4 work/asr.json "Sunrise Riverside, Green City, Chủ đầu tư ABC"
Lần đầu tải model ~3 GB từ Hugging Face; clip 96 s chạy ~3–5 phút trên 4 CPU.

- Đọc audio bằng ffmpeg → WAV 16 kHz rồi đưa mảng numpy cho model (PyAV 19 không hợp với faster-whisper 1.2: lỗi metadata_errors).
- Tham số thứ 3 (initial_prompt): tên riêng, thuật ngữ có trong clip để model viết đúng.
- Kết quả: [{start, end, text, words: [{w, s, e}]}]. In từng câu khi nhận ra để theo dõi.
- Sai hay gặp ở giọng Nam bộ, sửa tay khi viết transcript.json: song→sông, liền kề→liên kê, diện tích→dựng tích,
  lộ giới→lỗ giới, bền vững→bên vẫn. Giờ chữ đầu câu sau một vết cắt có thể sớm ~0,3 s: đối chiếu đường năng lượng.
"""
import json, subprocess, sys, tempfile, wave
import numpy as np
from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
prompt = sys.argv[3] if len(sys.argv) > 3 else None
with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", tmp.name], check=True)
    w = wave.open(tmp.name)
    audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
model = WhisperModel("large-v3", device="cpu", compute_type="int8")
segs, _ = model.transcribe(audio, language="vi", word_timestamps=True, vad_filter=True, beam_size=5, initial_prompt=prompt)
res = []
for s in segs:
    res.append({"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip(),
                "words": [{"w": x.word.strip(), "s": round(x.start, 3), "e": round(x.end, 3)} for x in s.words]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text.strip()}", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
