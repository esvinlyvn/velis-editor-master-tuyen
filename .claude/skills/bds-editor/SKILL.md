---
name: bds-editor
description: Dựng video bất động sản từ clip quay thật (sale hoặc chủ đầu tư nói trước máy, quay dự án) thành video dọc 1080×1920 hoàn chỉnh: cắt nhịp, chữ chốt theo preset, chữ sau người, bản đồ, minh họa, SFX, màu/LUT, kiểm và giao. Dùng khi người dùng gửi clip thô (.mp4/.mov) về dự án, căn hộ, khu đất, hoặc nói "edit video này", "dựng clip cho anh X", "thêm chữ, bản đồ cho video BĐS", "làm theo phong cách ME4REAL". Không dùng cho content tự động của kênh Vis giữ xe.
---

# bds-editor

Mọi luật nằm trong repo; skill này chỉ là đường đi. Làm theo thứ tự, mỗi bước mở đúng tài liệu được chỉ.

1. **Đọc luật:** `docs/VAN-HANH.md` và `docs/TRINH-BAY.md` (toàn bộ), bảng luật đầu `TALKING-HEAD.md`, mục 4c của TALKING-HEAD (phong cách đã dùng), `lib/README.md` (định dạng `plan.json`). Bộ mã phong cách: `docs/PHONG-CACH-ME4REAL.md` (đọc mục cần, không cần cả file).
2. **Nhận việc:** điền bảng ở VAN-HANH mục 2. Thiếu tên khách hay CTA thì hỏi **một lần**, gộp thành một câu. Thiếu phần khác thì dùng mặc định và ghi vào `NOTES.md`.
   Mở `clients/<khach>/brand.json`; khách mới thì tạo từ `clients/_mau/`. Tạo video: `node scripts/new-video.mjs <khach>-<du-an> --recipe R? --style S?` (chọn công thức trong `lib/recipes.json`, style trong `lib/styles.json` khác video trước của khách ≥ 3/5 gen).
3. **Tiếp nhận (bước 1):** bỏ cảnh quay vào `work/<video>/01_footage/<máy>/` (A-roll ở `cam_a`/`cam_b`, B-roll ở `drone`/`broll`), mic rời ở `02_audio/voiceover/`, nhạc / tiếng môi trường ở `02_audio/`. Chạy `node lib/ingest.mjs projects/<video>`, đọc CẢNH BÁO (clip Log thiếu LUT kỹ thuật, fps lạ).
4. **Dựng thô, dựng tinh (bước 2–3):** nghe hết bản thu, ghi `plan.edit` (đoạn chọn, đổi máy, punch-in, J/L-cut, B-roll che điểm cắt, đổi hình mỗi 2–4 s), chạy `node lib/assemble.mjs`, kiểm độ lệch đồng bộ. Nhận diện giọng trên `work/<video>/voice.wav` → `transcript.json` (sửa tay). Hook (`scripts/hook-pick.mjs`), SHOTBOOK có minh họa theo TRINH-BAY. Gửi bản dựng cho người dùng duyệt thứ tự cảnh thì `--lock`.
5. **Âm, màu, chữ (bước 3–4):** `plan.audio` (tiếng môi trường), `plan.music` nếu có quyền, `plan.color` (sửa màu rồi LUT), chữ chốt theo `text-presets/QUY-TAC-CHU.md` (`pick-text.mjs`, `mode: "bds"`) vào `roles`, `blocks`; SFX để `auto` trừ khi QC báo che lời. `node lib/build.mjs projects/<video> --no-render`, đọc hết CẢNH BÁO.
6. **Kiểm, xuất (bước 5):** `node lib/qc.mjs projects/<video>` + snapshot (TALKING-HEAD mục 6, TRINH-BAY mục 3), **render một lần**, `node lib/qc.mjs projects/<video> --asr` đạt hết, `node lib/export.mjs projects/<video> --draft` gửi kèm danh sách khối chữ. Người dùng duyệt xong: `--final`, commit, ghi lịch sử khách, thêm dòng vào bảng 4c (VAN-HANH mục 9).
7. **Học từ phản hồi:** điều người dùng sửa mà là ý muốn chung thì thêm thành luật vào bảng của TALKING-HEAD, kèm nguồn.

Không làm:
- Không thêm số liệu, tên riêng không có trong lời nói hay trong `info/`.
- Không đặt chữ hay đồ họa che mặt, che miệng.
- Không dùng hiệu ứng ký tự ngẫu nhiên.
- Không render nhiều lần để thử; dùng snapshot.
- Không commit clip thô.
- Không chép code dựng của video cũ; đổi cách dựng thì sửa `lib/`.
- Không dùng video AI.
