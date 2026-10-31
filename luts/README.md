# LUT màu

Luật dùng nằm ở `docs/VAN-HANH.md` mục 7. Hai loại LUT, áp ở hai chỗ khác nhau:

| Loại | Việc | Khai ở | Áp lúc |
|---|---|---|---|
| **Kỹ thuật** (Log → Rec.709) | đưa footage Log (S-Log, D-Log, C-Log…) về màu chuẩn | `plan.color.input_lut`: `{ "cam_a": "slog3-709.cube" }` theo thư mục máy | tạo proxy (`lib/ingest.mjs`), trước mọi bước khác |
| **Nghệ thuật** (creative) | tạo mood & tone | `plan.color.lut` + `strength` (50–80%), mặc định lấy `lut` trong `brand.json` | sau bước sửa màu (`lib/build.mjs`) |

Thứ tự đầy đủ: Log → Rec.709 (LUT kỹ thuật) → sửa màu `plan.color.correct` (cân trắng, vùng tối / sáng, tương phản, bão hòa; đồng bộ các máy) → LUT nghệ thuật → chữ, đồ họa (không bao giờ áp LUT lên chữ).

LUT có sẵn (tự tạo, `node luts/make-luts.mjs`):
- `am-nhe`: ấm nhẹ ở vùng sáng, vùng tối giữ nguyên. Nhà ở, nhà phố, đất nền.
- `mat-sang`: sáng, hơi lạnh, giảm bão hòa nhẹ. Căn hộ cao cấp, văn phòng.

Trước khi render: chụp 3 khung có mặt người, so trước và sau. Da phải tự nhiên, vùng sáng không cháy. Một video một LUT. Nguồn và giấy phép từng file ghi ở `luts/SOURCES.md`.
