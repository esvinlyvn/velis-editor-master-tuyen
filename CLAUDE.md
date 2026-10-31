# bds-editor: dựng video BĐS từ clip quay thật

Repo này chỉ làm một việc: nhận clip quay thật về bất động sản (người nói trước máy, quay dự án), dựng thành video dọc 1080×1920.

Đọc theo thứ tự:
1. `docs/VAN-HANH.md`: quy tắc vận hành, thứ tự ưu tiên tài liệu, các mâu thuẫn đã gỡ.
2. `TALKING-HEAD.md`: bảng **luật người dùng đã chốt** (nơi duy nhất ghi luật mới) và quy trình 40–60 phút.
3. `lib/README.md`: thư viện dựng, định dạng `plan.json`. `docs/PHONG-CACH-ME4REAL.md`: bộ mã phong cách (khung, hook, chữ, chuyển cảnh, âm, CTA) và các quyết định M1–M7.
4. `docs/TRINH-BAY.md`: hook 3 giây, minh họa "nói gì vẽ nấy", bố cục đồ họa, các mục kiểm phần hình.
5. `TOOLKIT.md`, `MAP.md`, `docs/SHOTS.md`, `text-presets/QUY-TAC-CHU.md` khi tới bước tương ứng.

Luật nền:
- Mỗi video là **dữ liệu** `projects/<khach>-<du-an>/plan.json` + `transcript.json`, tạo bằng `node scripts/new-video.mjs`. Không chép `build.mjs` / `template.html` của video nào; cách dựng chung nằm ở `lib/`. Cấu hình riêng của khách nằm ở `clients/<khach>/brand.json`.
- Quy trình 5 bước hậu kỳ (`docs/VAN-HANH.md` mục 3): `lib/ingest.mjs` → `lib/assemble.mjs` (+ transcript) → `lib/build.mjs` → `lib/qc.mjs` → `lib/export.mjs`. Nguồn ở `work/<video>/` theo cây thư mục chuẩn, kết quả ở `build/<video>/` và `work/<video>/05_exports/`. Render **một lần** ở cuối. Sửa `lib/` thì chạy `npm run demo`, `npm run test:chung` và `npm run example` để kiểm; sửa preset chữ / template / runtime chữ thì thêm `npm run test:kiem-chu`.
- Trước render: `node lib/qc.mjs projects/<video>` đạt (gồm kt-check và text-ink: chữ không xén, không đè dấu), đã xem snapshot. Sau render: `node lib/qc.mjs projects/<video> --asr` đạt hết (VAN-HANH mục 8) và các mục kiểm của TRINH-BAY mục 3. Bản cuối chỉ xuất khi QC đạt.
- Mọi bước chạy trên máy, không gọi API ngoài, không commit khóa. Không commit clip thô và file render (`work/`, `build/`). Không dùng video AI.
- Không dùng SFX scribble-2.
- Python chạy bằng `~/.asr/bin/python` (trên cloud `.claude/hooks/session-start.sh` tự cài khi mở phiên; chạy trên máy: `HUONG-DAN.md` mục Chạy trên máy của mình).
- Người dùng chốt luật mới thì ghi vào bảng của `TALKING-HEAD.md` kèm nguồn.
