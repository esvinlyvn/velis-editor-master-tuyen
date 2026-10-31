# Phong cách ME4REAL: bộ mã dựng video BĐS

Rút từ 6 bản quay màn hình DaVinci Resolve của một editor BĐS chuyên nghiệp (watermark ME4REAL; tổng 9 phút 23 giây, 6 dự án căn hộ, khách sạn, đất thương mại). Đo bằng: ghép ảnh toàn cảnh timeline (đọc tên clip, macro chữ, SFX, nhạc), EBU R128 cho âm, thống kê màu trên khung preview. Bản đầy đủ có hình và bảng đối chiếu: tài liệu "Hồ sơ phong cách editor BĐS (ME4REAL)" trên claude.ai.

Đây là **nguồn phương pháp** (mức ưu tiên 5, `docs/VAN-HANH.md` mục 1): luật người dùng đã chốt ở `TALKING-HEAD.md` luôn đứng trên. Mã ở đây (K, H, C, I, T, A, M, E, R) được `lib/` dùng lại.

**Năm luật lớn:** chữ là nhân vật thứ hai (câu đắt dựng thành cụm bậc thang theo lời) · mọi sự kiện hình đều có tiếng · thân bài 4,2–4,7 s/shot, montage 1–2 s · hook 0–8 s dày lớp nhất · không quãng nào quá 3 s đứng yên.

## K. Khung video

| Mã | Đoạn | Tỷ lệ | Nội dung |
| --- | --- | --- | --- |
| K1 | Hook | 0–8 s (~10%) | Câu gây tò mò + con số / từ khóa lớn + cú bùng âm |
| K2 | Định vị | 10–15% | Vị trí, bản đồ, khoảng cách, tầm nhìn |
| K3 | Thông số | 10–15% | Diện tích, tầng, số căn (số chạy) |
| K4 | Tiện ích / trải nghiệm | 25–35% | Render, nhà mẫu, người dẫn đi tour, lưới ảnh |
| K5 | Bằng chứng & chính sách | 15–20% | Báo chí, chủ đầu tư, vay, chiết khấu |
| K6 | CTA | 5–8 s | "Số lượng có hạn" + số điện thoại, người dẫn nhìn ống kính |

Ba biến thể: người dẫn (A-roll 40–60%) · voice-over liên tục · skit (không dùng ở bds-editor).

## H. Hook

Công thức chung: khung đầu đã chuyển động → giây 0,9–1,2 icon / sticker bật (vượt ~110% rồi về) → giây 1,5 từ khóa thứ nhất → giây 1,9–2,1 cụm cũ tan (blur + fade 0,15 s), từ khóa chính hiện, nền mờ → âm: riser 2–4 s chốt bằng impact đúng lúc từ khóa chính. Loudness ngắn hạn hook cao hơn thân bài 3–5 LU.

| Mã | Mẫu | Ánh xạ `hook-pick.mjs` |
| --- | --- | --- |
| H3 | Con số sốc ("Tăng 42,8%", "800 m²") | `number` |
| H4 | Câu chuyện thời gian ("10 năm trước…") | `title` (chưa có hook riêng) |
| H5 | Giới thiệu bên sa bàn / tên dự án | `title`, `mystery` |
| H1, H2 | Biến hình bằng AI, skit trợ lý ảo | **không dùng** (người dùng bỏ video AI) |

## C. Chữ

- **C1 Cụm bậc thang** → preset `cao-trao`: 3–5 dòng, mỗi dòng 2–5 chữ (luật 1), vào theo lời cách 0,3–0,5 s, căn trái thụt dần, giữ 1–2,5 s sau dòng cuối, tan đồng loạt. Tối đa 1 cụm mỗi 10–15 s.
- **C2 Bốn vai trong cụm:** `dem` (sans nhỏ) · `khoa` (đậm hoa) · `cam` (viết tay) · `chot` (gradient, một lần mỗi cụm, nhấp nháy khi vào).
- **C3 Bộ preset ME4REAL** (`text-presets/bds/me4real.js`, bảng ở `BDS-PRESETS.md` mục 2b): 14 preset `kim-loai`, `so-khong-lo`, `so-dem`, `cap-dong`, `phoi-canh`, `noi-khoi`, `so-chen`, `pill-xep`, `nhan-ban-do`, `chu-gian`, `logo-ghep`, `poster-serif`, `so-thu-tu`, `khung-sdt`, cộng `cao-trao` mở rộng (thông tin, chỉ số căn phải, danh sách nhiều màu, viết tay rỗng). Tổng 15 preset phủ 20 kiểu chữ đếm được trong 6 video. Macro gốc tương ứng: Slide → `cao-trao` / `cap-dong`; Flicker → dòng chốt; Count → `so-khong-lo` / `so-dem`; Write → vai `cam`, chữ viết tay của `kim-loai` / `logo-ghep`; Letter slide / tracking → `chu-gian`.
- **C4 Phụ đề:** ME4REAL dùng phụ đề từng chữ; bds-editor **không phụ đề** (luật 1).
- **C5 Nhãn trên hình:** pill thông số, viền nét đứt quanh lô đất + diện tích, chữ bám mặt tòa nhà (TRINH-BAY mục 2).

**Font (đo bằng cách so từng font với chữ gốc, style S6):** chữ chính sans hình học rất dày, khít (Montserrat 800–900, giãn chữ −0,035 đến −0,04 em) · chữ to nét mảnh ghép chữ nhỏ đậm (Montserrat 300 + 700, vai `mong`) · chữ dẫn Montserrat 600–700 · viết tay nét đơn kiểu chữ ký (SVN-Nickainley Script) · viết tay cọ (SVN-Haptic Script, chữ "xa hoa" màu navy) · serif tương phản cao nét mảnh (SVN-Paris Pro). Dòng phụ của cặp dòng ("Ấn Tượng") là sans đậm vừa, không phải viết tay.

**Xử lý sau chữ:** ME4REAL gần như không làm tối video. Chữ đủ nổi thì để trần; nền sáng thì dùng nền mờ sau chữ, bóng chữ, nét tối trong chất kim loại. Ứng với luật 18 mới.

## I. Hình

A-roll người dẫn (punch-in khi đổi câu) · drone · bản đồ (ghim rơi, đường phát sáng, sơ đồ nhánh) · lưới ảnh 3×2 đổi theo phách · ảnh báo chí có nguồn · tô sáng (glow) tòa nhà trên render. Video AI (I3, I4): **không dùng**.

## T. Chuyển cảnh và nhịp

| Mã | Kỹ thuật | Thời lượng | Tiếng |
| --- | --- | --- | --- |
| T1 | Whip pan / motion blur | 2–3 khung | whoosh |
| T2 | Punch-in 100→115% | 0,3–0,6 s | không / click nhẹ |
| T3 | Flash + zoom (montage) | 0,4–0,6 s | riser ngắn + whoosh |
| T4 | Blur-dissolve giữa các cụm chữ | 0,15–0,25 s | glitch / pop |
| T5 | Rung máy ở khoảnh khắc chốt | 0,3–0,8 s | impact |
| T6 | Nền mờ khi chữ lớn lên | suốt cụm | — |

Montage mẫu: 8 cú cắt mỗi ~1,9 s (4 phách ở ~126 BPM), mỗi cú = flash + riser + whoosh. Ở bds-editor: chỉ khi có nhạc, cả đoạn tính là 1 chuyển cảnh lớn (giới hạn ~4 lần / 150 s).

## A. Âm thanh

- Đo: −14,0 đến −16,7 LUFS, LRA 3,9–5,0 LU; true peak +1 đến +2,2 dBTP ở 4/6 video (**lỗi, không chép**: repo này giữ ≤ −1,5 dBTP).
- Một bài nhạc xuyên suốt, ducking dưới giọng (repo này: −18 đến −24 dB, `lib/music.mjs`).
- Vai SFX: chữ vào · chuyển cảnh · dâng · chốt · bản đồ · tiền · số chạy · phủ định · giấy tờ · CTA → `lib/sfx-roles.json`.
- Công thức A4: `bung-mo` (riser → impact → lấp lánh) · `cum-chu` (mỗi dòng một tiếng nhỏ) · `con-so` (số chạy → tiếng tiền) · `ban-do` (ghim → whoosh) · `montage` · `cta`.

## M. Màu

Trung tính, không grade mạnh (chênh R−B 0 đến +4 ở 5/6 video); A-roll phố có thể giảm bão hòa để chữ nổi; nền đặt chữ lớn tối hoặc mờ đi. Ở bds-editor: luật 19 (pha nhẹ) + LUT của kênh nếu có.

## E. CTA và thương hiệu

Người dẫn nhìn ống kính 5–8 s · cụm khan hiếm (`cao-trao` hoặc preset chính) · số điện thoại trong khung · logo dự án dạng thẻ · tên dự án chèn 2–3 lần.

## R. Công thức phối → `lib/recipes.json`

R1 Hiện trường · R2 Căn hộ cao cấp · R5 Bản đồ dòng tiền · R6 Tour 60 giây · R7 Tin thị trường. (R3 skit và R4 biến hình AI đã bỏ.)

## Quyết định khi đưa vào bds-editor (30/10/2026)

| Mã | Chủ đề | Chốt |
| --- | --- | --- |
| M1 | Mật độ SFX | Mỗi dòng chữ một tiếng nhỏ (−28 đến −32 dB); cú cắt thường không tiếng; hook tối đa 4–5 lớp |
| M2 | Nền sau chữ | Gradient luật 13 là mặc định; "nền mờ" (`style.scrim: "mo"`) là một kiểu lớp tối để xoay vòng |
| M3 | Chữ nhiều dòng | Vai `cao-trao` 3–5 dòng, mỗi dòng 2–5 chữ, tối đa 1 cụm / 10–15 s |
| M4 | Video AI | Không dùng |
| M5 | Nhạc | Chỉ khi có quyền; ducking −18 đến −24 dB; được một đoạn montage theo phách |
| M6 | Chuyển cảnh lớn | Giữ ~4 lần / 150 s; cả đoạn montage tính 1 lần |
| M7 | Phụ đề | Không (luật 1) |
