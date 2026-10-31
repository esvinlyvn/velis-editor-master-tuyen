# Nguồn và quyền sử dụng tài nguyên bên ngoài

Giữ file này khi đóng gói hoặc phát hành bds-editor. Mỗi mục cần ghi ngày được phép và nơi lưu chứng từ (email, hóa đơn).

| Tài nguyên | Nằm ở | Nguồn | Quyền | Chứng từ |
|---|---|---|---|---|
| Thẻ chuyển động, demo, phương pháp SHOTBOOK | `docs/shots/`, `docs/SHOTS.md` | video-talkcraft · Vincent Wei · github.com/Vincentwei1021/video-talkcraft | Giấy phép gốc PolyForm Noncommercial 1.0.0. Đang dùng nội bộ thử nghiệm, chưa thương mại; xin phép tác giả trước khi giao video cho khách | (chưa có: điền ngày, link email khi xin được) |
| Script kiểm chuyển động | `scripts/qa/motion_check.py`, `scripts/qa/frame_signature.py` | như trên | như trên | như trên |
| SFX "Motion Design Sound Effects" | `sfx/` (các tên open, thock, meter, text-tick, error-soft, bản thêm của click, pop, notify) | gói thương mại, nhập qua repo master-video | Đã mua, được phép dùng | (điền: hóa đơn, điều khoản) |
| Phương pháp hook, minh họa, house rules | `docs/TRINH-BAY.md` | AI MASTER (repo master-video), chủ sở hữu là người dùng | Nội bộ | — |
| Phương pháp phong cách ME4REAL | `docs/PHONG-CACH-ME4REAL.md`, `lib/` (preset `cao-trao`, công thức SFX, công thức khung) | Phân tích 6 bản quay timeline của một editor BĐS (watermark ME4REAL) người dùng gửi; chỉ rút phương pháp, số đo, không chép hình, nhạc hay SFX của họ | Nội bộ | — |
| Font SVN (Việt hóa) | `fonts/svn/` (SVN-Nickainley Script, SVN-Haptic Script, SVN-Paris Pro) | Bộ 254 font SVN (thaitrien.com) người dùng gửi 30/10/2026 | **Chưa rõ quyền phân phối lại**: dùng nội bộ; trước khi phát hành gói cho người khác phải có giấy phép hoặc bỏ `fonts/svn/` (thư viện tự dùng font dự phòng và báo) | — |
| Font | `@fontsource/*` | Google Fonts | SIL OFL, phân phối lại được | — |
| Giọng đọc của project mẫu | `projects/example/nguon/mic.flac` | Piper TTS, giọng `vi_VN-vais1000-medium` (huggingface.co/rhasspy/piper-voices), tạo trên máy | Dữ liệu VAIS-1000 theo CC BY 4.0 (ghi nguồn). Giọng được tinh chỉnh từ giọng tiếng Anh "lessac" của Piper, nên chỉ dùng làm tiếng cho project mẫu, không dùng trong video giao khách | model card trên huggingface.co |
| Hình, tiếng môi trường, nhạc của project mẫu | `projects/example/make-media.mjs` (tạo vào `work/example/`) | dựng bằng ffmpeg (bộ lọc geq, anoisesrc, aevalsrc) | Của repo |  — |
| LUT `am-nhe`, `mat-sang` | `luts/` | tự tạo, `luts/make-luts.mjs` | Của repo (`luts/SOURCES.md`) | — |

Required Notice (video-talkcraft): Copyright (c) 2026 Vincent Wei (https://github.com/Vincentwei1021/video-talkcraft)
