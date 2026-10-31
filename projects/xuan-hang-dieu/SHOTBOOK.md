# SHOTBOOK · xuan-hang-dieu

Kênh: Xuân (`clients/xuan/brand.json`, kênh mới, chưa có lịch sử). Công thức R1 (Hiện trường), style S3 (Điện ảnh: `dien-anh`, Archivo / Saira, lớp tối gradient).

## Nguồn

| Thư mục | File | Ghi chú |
|---|---|---|
| `01_footage/cam_a` | `A001.mp4` dọc 720×1280, 29,97 fps, 8-bit Rec.709, 85,9 s | một cú máy liền (gimbal), người dẫn đi bộ trước dãy biệt thự; mic cài áo, tiếng nằm trong clip |

Không có B-roll, mic rời, nhạc, tài liệu dự án. Clip 720p được phóng lên 1080×1920 (hình hơi mềm).

## Bước 1 · Tiếp nhận

`lib/ingest.mjs`: không Log, không cần LUT kỹ thuật → `proxy/` 1080×1920 30 fps.

## Bước 2–3 · Dựng (`plan.edit`)

- Bỏ 1,95 s đầu (đi bộ, chưa nói) và đuôi sau 82,85 s (chữ "Rồi" lúc dừng quay); `tail` 1,5 s giữ hình cho CTA.
- Cắt mọi quãng ngừng ≥ 0,35 s (đo năng lượng giọng 50 ms, ngưỡng −32 dB; nền ngoài trời ~−38 dB), chừa ~0,1 s trước và ~0,08 s sau → 85,9 s còn 73,7 s lời.
- 28 đoạn, punch-in 108% xen kẽ để giấu vết cắt (T2); tách thêm ở ranh giới câu 9,2–20,1 s, 70,8–80,9 s (nguồn) và hai chỗ 8,7 s, 46,2 s (bản dựng) để đổi khung mỗi 2–5 s.
- `transcript.json`: large-v3 trên `voice.wav` đã dựng; sửa: chủ tư → chủ đầu tư, chùng → trùng, hơi hứa → hơi thở (nghe chưa chắc, không đưa lên chữ).

## Bước 3–4 · Âm, màu, chữ

- **Màu:** `eq=contrast=1.06:saturation=1.1` (luật 19), không LUT (BĐS trắng, giữ trung tính; soi da ở 21 snapshot).
- **Hook:** `number` (hook-pick 91 điểm, cách xa `stamp` 68): số chạy 0 → 17 THÁNG chạm đích đúng lúc nói "17" (1,76 s), chữ dẫn "CHỈ CÒN 2 NGÀY", viết tay "từ lúc khởi công". Bookend: "SẮP BÀN GIAO" ngay sau.
- **Vai → preset** (luật 8): con-so `so-khong-lo` (17 tháng, 939 căn, 200 mẫu) · phap-ly `nhan-neon` · dia-danh `dia-danh` · canh-bao `canh-bao` · ten-du-an `logo-ghep` · cao-trao `cao-trao` · liet-ke `quay-vong` · cta `go-chu` · chot-y `dien-anh` (preset chính).
  - Đổi so với `pick-text`: con-so `noi-bat` → `so-khong-lo` (số đếm lên hợp hook number); ten-du-an `chu-bac` → `logo-ghep` (tên dự án dạng logo "Blanca *City*"); cta `khung-sdt` → `go-chu` (chưa có số điện thoại).
- **Khối 200 mẫu:** đơn vị "MẪU" của `so-khong-lo` bị xén dấu ngã (text-ink) → đưa "mẫu thiết kế" xuống dòng viết tay.
- **3 cụm cao-trao** (cách nhau ≥ 18 s): "câu chuyện / NGÔN NGỮ THIẾT KẾ / chủ đầu tư ĐẶT HẾT / TÂM HUYẾT" · "tuy là / MỘT DÃY PHỐ / KHÔNG CĂN NÀO" · "dấu ấn / ĐẶC BIỆT / cho chủ nhân".
- **Chữ sau người:** không dùng — máy đi theo người suốt clip (luật 11 / TALKING-HEAD 4b chỉ lồng khi máy đứng yên).
- **SFX:** auto theo vai; `sfx_layer` thêm click nhẹ ở 7 cú punch-in nằm trong quãng trống (T2), tiếng đổi chữ của `quay-vong` (luật 17), tiếng chốt số 939, tiếng nhỏ khi dòng "BIỂU TƯỢNG VŨNG TÀU" hiện. Khối "PHONG CÁCH RIÊNG" ghi tay `shimmer` (auto chọn `neon-on` dài 3 s).
- **Mức SFX sau render** (`sfx-levels.py`, đích đỉnh ≈ giọng + 2 dB): hook `bung-mo` và cụm cao-trao cuối ghi tay ở `sfx_layer` (khối `"sfx": false`) để chỉnh riêng riser (NHỎ) và toggle (TO); ghim tên mọi tiếng lớp phụ để bản trộn không xáo; punch-in 46,18 s dùng `camera` 0,16 s vì `confirm` che chữ "thở" (QC `--asr`). Lưu ý: `"sfx": null` bị đọc thành auto (`lib/plan.mjs` dùng `??`), phải ghi `false`.

## Khung R1

| Khung | Giây | Nội dung |
|---|---|---|
| K1 hook | 0–5 | 17 THÁNG từ lúc khởi công |
| K2 định vị / tiến độ | 5–19 | sắp bàn giao, làm sổ, biệt thự song lập, đường Hàng Điều |
| K3 giá trị | 19–35 | không phải mét vuông, bờ biển + sổ lâu dài, ngôn ngữ thiết kế |
| K4 dự án | 35–68 | Blanca City, kiến trúc, 939 căn / 200 mẫu, không trùng lặp |
| K5–K6 kết, CTA | 68–75 | dấu ấn đặc biệt, Nhắn tin nhận bảng giá |
