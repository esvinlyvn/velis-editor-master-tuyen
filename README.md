# bds-editor

Bộ công cụ dựng video bất động sản dọc 1080×1920 từ **clip quay thật** (sale hay chủ đầu tư nói trước máy, quay dự án). Dùng với Claude Code: thả clip thô vào, Claude dựng ra video hoàn chỉnh gồm:
- cắt nhịp, bỏ khoảng lặng;
- hook 3 giây theo góc của câu mở;
- chữ chốt theo preset (bộ chung 67 preset, 22 preset BĐS, 14 preset ME4REAL, thẻ bám lời; chỉ dùng preset đã duyệt trong `lib/presets-duyet.json`), có chữ đặt sau người;
- minh họa "nói gì vẽ nấy", bản đồ;
- SFX, màu và LUT;
- tự kiểm trước khi giao.

Chạy bằng [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML + GSAP → MP4), offline.

## Cài

**Người mới:** đọc [`HUONG-DAN.md`](HUONG-DAN.md), đi từ tạo tài khoản GitHub, cài công cụ, lấy repo về làm của riêng, tới video đầu tiên và cách dạy luật mới.

Cần Node.js 22+, FFmpeg, Python 3.

```
npm install
npm run demo             # kiểm thư viện: dựng tests/demo (media tổng hợp), không render
npm run example          # video mẫu đủ 5 bước (tạo nguồn → tiếp nhận → dựng → render) → build/example/output.mp4
```

## Dùng

Mở Claude Code trong repo, gửi clip và nói ví dụ: "edit video này cho anh Minh, dự án Sunrise". Skill `bds-editor` tự nhận việc. Nó chỉ hỏi những gì còn thiếu (khách nào, CTA gì), tối đa một lần.

Mỗi khách có cấu hình riêng ở `clients/<khach>/brand.json`: màu, LUT, CTA, lịch sử phong cách. Video mới của cùng khách sẽ tự đổi phong cách so với video trước.

## Tài liệu

| File | Nội dung |
|---|---|
| `HUONG-DAN.md` | hướng dẫn chi tiết cho người mới |
| `CLAUDE.md` | điểm vào cho Claude |
| `lib/README.md` | thư viện dựng: `plan.json`, phong cách S1–S5, công thức R1–R7 |
| `docs/PHONG-CACH-ME4REAL.md` | bộ mã phong cách đo từ editor BĐS chuyên nghiệp |
| `docs/VAN-HANH.md` | quy tắc vận hành, thứ tự ưu tiên, các mâu thuẫn đã gỡ |
| `TALKING-HEAD.md` | bảng luật người dùng đã chốt, quy trình 40–60 phút |
| `docs/TRINH-BAY.md` | hook, minh họa, bố cục đồ họa, kiểm phần hình |
| `docs/HAU-KY.md`, `docs/DAC-TA-CHU.md` | đặc tả gốc đo từ video mẫu |
| `TOOLKIT.md`, `MAP.md`, `docs/SHOTS.md` | công cụ dựng, bản đồ, phương pháp cú máy |
| `text-presets/` | preset chữ và quy tắc chọn |
| `docs/SOURCES.md` | nguồn và quyền sử dụng tài nguyên bên ngoài |

## Lưu ý

- Clip thô và file render không đưa vào repo (`work/`, `build/` đã có trong `.gitignore`).
- Tài nguyên bên ngoài (SFX, thẻ chuyển động) dùng theo quyền ghi trong `docs/SOURCES.md`.
