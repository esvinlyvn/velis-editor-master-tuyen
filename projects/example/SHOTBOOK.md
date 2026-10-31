# SHOTBOOK · Project mẫu

Video mẫu đi đủ 5 bước hậu kỳ (`docs/VAN-HANH.md` mục 3) bằng thư viện `lib/`. **Không chép thư mục này** khi làm video mới: tạo bằng `node scripts/new-video.mjs <kenh>-<du-an>`, rồi lấy `plan.json` ở đây làm ví dụ cách ghi.

```
npm run example          # = make-media → ingest → assemble → build (render một lần), ~2,5 phút
node lib/qc.mjs projects/example --asr
node lib/export.mjs projects/example --draft     # rồi --final khi QC đạt
```

## Nguồn (không của khách nào, `make-media.mjs` tạo vào `work/example/`)

| Thư mục | File | Ghi chú |
|---|---|---|
| `01_footage/cam_a` | `A001.mp4` dọc 1080×1920 | máy chính, có tiếng máy (thu xa, ồn, bật máy sau mic 0,62 s) |
| `01_footage/cam_b` | `B001.mp4` **ngang** 1920×1080 | góc thứ hai; ingest cắt giữa về khung dọc |
| `01_footage/drone` | `D001.mp4` ngang | phố nhìn từ trên cao → B-roll |
| `02_audio/voiceover` | `mic.flac` | mic cài áo: giọng Piper (`nguon/mic.flac`, `docs/SOURCES.md`), 8 lượt nói, lượt 2 là câu vấp "Dự án Vườn… à" |
| `02_audio/ambience` · `music` | `city.wav` · `pad.wav` | tiếng phố, nhạc nền tự tạo bằng ffmpeg |

Không có người trong hình: luật về đầu người, mặt, miệng (luật 2, 11; TRINH-BAY bố cục) phải kiểm trên clip thật.

## Bước 1 · Tiếp nhận

`lib/ingest.mjs`: 3 clip đều 30 fps 8-bit Rec.709 (không Log nên không cần LUT kỹ thuật) → `proxy/` 1080×1920 30 fps.

## Bước 2–3 · Dựng thô, dựng tinh (`plan.edit`)

- **Đồng bộ âm:** mic ↔ cam_a lệch 0,619 s, mic ↔ cam_b lệch 1,369 s (tương quan 0,98; giá trị thật 0,62 / 1,37).
- **Chọn đoạn:** 7 lượt nói tốt, bỏ câu vấp và quãng nghỉ dài, chừa đệm ~0,1 s quanh câu → 22,5 s thu thành 14,4 s lời.
- **Đổi hình 2–4 s:** cam_a ↔ cam_b (đoạn 3, 7), punch-in 108% (đoạn 2, 5).
- **L-cut** đoạn 4: thấy cam_a trước 0,2 s, tiếng câu trước còn chạy. **J-cut** đoạn 7 (CTA): nghe "Nhắn tin" 0,25 s trước khi đổi sang cam_b.
- **B-roll:** drone 3,2–4,7 s (hòa 0,2 s, trôi ngang, có whoosh) lúc nói "cách trung tâm"; drone 8,6–10,2 s (cắt thẳng, đẩy vào) che điểm cắt 9,63 s.
- **Khóa hình:** khách duyệt bản dựng thì `node lib/assemble.mjs projects/example --lock`.
- `transcript.json`: nhận diện giọng trên `work/example/voice.wav` đã dựng, sửa tay: tiện ít → tiện ích, tròng giếm → phòng gym, phi → phí, 70m2 → 70 m².

## Bước 3–4 · Âm thanh, màu, chữ (`lib/build.mjs`)

- **Lời thoại:** lọc 80 Hz, khử ồn nhẹ, EQ, de-ess, nén 3:1, −14 LUFS. **Tiếng môi trường** −38 LUFS. **Nhạc** hạ dưới giọng (−20 dB khi nói, −6 dB khi không). **SFX** 12 tiếng theo vai, mỗi tiếng một loại.
- **Màu:** sửa màu `eq=contrast=1.06:saturation=1.08` → LUT `am-nhe` 60%.
- **Chữ** (style S5, công thức R2), 8 khối, không phụ đề:

| Mốc | Khối (preset · vai) |
|---|---|
| 0,1 | Với 3 tỷ / MUA NHÀ Ở ĐÂU? (`tang-truong` · mở đầu, hook `question`, chốt `sub-hit` đúng "3 tỷ") |
| 1,7 | VƯỜN MÂY · CÁCH TRUNG TÂM / 15 PHÚT (`gia-chot` · con số, màu nơi chốn) |
| 4,5 | CĂN HỘ / 70 m² (`gia-chot`; tiếng `text-tick` chọn tay vì QC báo `counter-roll` che chữ "căn") |
| 6,1 | Thiết kế / 2 PHÒNG NGỦ (`chu-bac` · phân khúc) |
| 7,5 | Tiện ích / HỒ BƠI → PHÒNG GYM → CÔNG VIÊN (`quay-vong`, step 0,65 s; dưới 0,6 s chữ không kịp đứng) |
| 10,2 | PHÍ ẨN gạch đỏ (`canh-bao`) |
| 11,8 | ĐÃ CÓ SỔ HỒNG (`nhan-neon` · pháp lý, màu an toàn) |
| 13,1 | Nhắn em nhận bảng giá (`go-chu` · CTA, tiếng gõ phím theo 21 ký tự, tiếng "gửi" khi gõ xong) |

## Bước 5 · Kiểm định, xuất

`lib/qc.mjs --asr`: lint 0 error · kt-check 10/10 · mật độ ≤ 3 s · không khung đen · không đứng im · −14,0 LUFS · đỉnh −3,8 dBTP · SFX ổn · motion_check PASS (so với footage gốc) · ASR theo đoạn không mất chữ nào.
Xuất: bản nháp ~1 Mbps (~2 MB) để gửi duyệt; bản cuối là master 25 Mbps (~22 Mbps thực tế).
