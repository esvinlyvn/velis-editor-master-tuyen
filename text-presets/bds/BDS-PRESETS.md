# Preset chữ BĐS

22 preset chữ chốt cho video bất động sản, dựng lại từ việc phân tích từng khung của video mẫu "PRESET CAPTION · Kéo thả là sử dụng" (35 preset kiểu CapCut). Chạy bằng GSAP trong HyperFrames, theo đúng luật TOOLKIT và TALKING-HEAD.

| File | Nội dung |
|---|---|
| `bds-presets.css` | Kiểu chữ của 22 preset. Màu và font đi qua biến CSS |
| `bds-presets.js` | Hàm dựng và animation (`window.BDS`) |
| `gallery.html` | Bảng xem thử các preset chạy lặp. Mở trực tiếp trong trình duyệt |
| `gallery-preview.mp4` | Bản quay bảng xem thử |

## 1. Phân tích video mẫu (đọc từng khung, 30 fps)

Video mẫu gồm 2 trang lưới 3 cột, mỗi ô một preset chạy lặp khoảng 1,8 giây: vào 0,4–0,8 giây, giữ khoảng 1 giây, rồi tắt gọn. Các hàng khởi động lệch nhau khoảng 4 khung. Rút ra mấy "ngữ pháp" chung:

1. **Hai tầng chữ.** Khoảng 2/3 số preset có một chữ dẫn nhỏ, thường trắng, đặt lệch góc, đi cùng một chữ chính lớn có màu. Ví dụ: Next / chapter, Stay / stunning, Made / Simple.
2. **Vào bằng mờ → nét, không bằng trượt trơn.** Gần như mọi preset bắt đầu từ trạng thái nhòe (blur 8–16px) rồi nét dần, thường kèm thu nhỏ hoặc dâng lên.
3. **Lệch nhịp từng ký tự 1–2 khung.** Chữ hiện từng ký tự (Subtitles, Movement Fluid, Create freely…). Nhiều preset có bóng ma: bản sao mờ của ký tự kéo vệt rồi tan (Speed Up, Instant upgrades).
4. **Một màu chủ đạo bão hòa trên nền đen**, kèm phát sáng cùng tông (Orange, Clear Green, Wave), hoặc gradient dọc 2 màu (Energy Rising, Future Digital) có đổ bóng đen dưới chữ.
5. **Một "khoảnh khắc thứ hai" sau khi vào.** Error hiện trắng trước, khoảng 0,9 giây sau mới bị gạch và chuyển đỏ. Text Focused tụ chữ xong mới bật 2 tay cầm và dải bôi chọn. Bright Silver có vệt sáng quét. Đây là chỗ preset có ý nghĩa, không chỉ đẹp.

Số đo một vài preset:
- Minimal Style: vào trong 18 khung (0,6 giây), hai dòng lệch nhau 4 khung.
- Text Focused: chữ bung từ một đốm ở tâm trong 10 khung, tay cầm và dải bôi chọn hiện ở khung thứ 12–20.
- Error: mờ → nét 0,4 giây; gạch ngang ở khoảng giây 0,9; chuyển đỏ trong khoảng 0,5 giây.
- Premium Text: các đốm sáng tụ thành chữ đậm trong khoảng 12 khung.
- Central Focus: gõ khoảng 2 khung một ký tự, có chấm con trỏ chạy theo.

## 2. 22 preset và lúc dùng

| Preset | Tên | Dùng cho | Lấy ý từ |
|---|---|---|---|
| `tieu-de-kep` | Tiêu đề kẹp | Chữ chốt mặc định: chữ dẫn màu + cụm chính trắng | Minimal Style |
| `nhan-neon` | Nhãn neon | Trạng thái: ĐÃ BÀN GIAO, CÓ SỔ. Xanh lá = ổn, cam = chú ý | Orange, Clear Green |
| `canh-bao` | Cảnh báo | Điều sai, hiểu lầm: GIÁ ẢO, CAM KẾT LÃI. Trắng → bị gạch → đỏ | Error |
| `dia-danh` | Địa danh | Tên phường, đường, khu, dự án, như đang bôi chọn trên bản đồ | Text Focused |
| `go-chu` | Gõ chữ | Câu nói của khách hoặc sale: "Có sổ chưa em?" | Central Focus |
| `noi-bat` | Nổi bật | Con số hay cụm đắt nhất video: LÃI 0% | Premium Text |
| `chuyen-dong` | Chuyển động đối | So sánh hai vế: THUÊ / MUA, TRƯỚC / SAU | Modern Vibrant |
| `ky-thuat` | Thuật ngữ | Từ chuyên môn + một dòng giải thích: thông thủy | Soft Motion, Future Digital |
| `chu-bac` | Chữ bạc | Phân khúc: HẠNG SANG, CAO CẤP | Bright Silver |
| `tang-truong` | Tăng trưởng | Giá, nhu cầu đi lên: TĂNG 30% | Energy Rising |
| `toc-do` | Tốc độ | Thời gian đi lại, kẹt xe: 45 PHÚT | Speed Up |
| `quay-vong` | Quay vòng | Liệt kê trong một câu khung: "Phía Đông là… công nghệ / đại học" | Dynamic Rotating |
| `tung-chu` | Tung chữ | Tiêu đề bật mạnh có chữ dẫn: Mua nhà / lần đầu | Create Freely, Made Simple |
| `top-list` | Danh sách TOP | Mở một danh sách: TOP / 5 KHU / đáng sống | The essential 10 |
| `ky-niem` | Ký ức | Mốc quá khứ: NĂM 2010, HỒI ĐÓ | VHS, Colorful text |
| `chuong-moi` | Chương mới | Sang phần mới: Phần 2 / pháp lý | Next Chapter, New Creative |
| `song` | Sóng | Sông, biển, cảnh quan: VEN SÔNG | Wave |
| `gia-chot` | Giá chốt | Số tiền chạy lên: GIÁ CHỐT 2,5 tỷ. Vàng = tiền | Money 100 |
| `khoi-noi` | Khối nổi | Chữ chốt mặc định thay `tieu-de-kep`: chữ dẫn trong nhãn màu + cụm chính lớn hiện lần lượt từng ký tự (lật nhẹ từ dưới lên); `hl` tô màu chữ khóa | Minimal Style + nhãn |
| `dien-anh` | Điện ảnh | Tiêu đề kiểu phim: chữ dẫn to giãn rộng (không vạch gạch 2 bên) + cụm chính rất lớn co chữ từ mờ sang nét, trôi chậm khi đứng (`hold`); hợp với chữ nằm sau đối tượng (`scripts/fx/`) | Cinematic title |
| `tap-chi` | Tạp chí | Tiêu đề kiểu tạp chí nhà đẹp: chữ dẫn sans giãn rộng + cụm chính serif, chữ khóa (`hl`) NGHIÊNG tô gradient; hiện theo từ (dâng lên lần lượt), thoát rơi xuống (`leave`) | Editorial |

| `cao-trao` | Cao trào bậc thang | Câu đắt nhất dựng thành 3–5 dòng vào theo lời (`lines[].at`), căn trái thụt dần, tan cùng lúc. Vai dòng: `dem` sans nhỏ · `khoa` đậm hoa · `cam` viết tay (`--script`) · `chot` gradient nhấp nháy, một lần mỗi cụm. Mỗi dòng 2–5 chữ (luật 1); tối đa 1 cụm mỗi 10–15 s | Kinetic typography BĐS (`docs/PHONG-CACH-ME4REAL.md` C1–C2) |

Không dựng lại: Subtitles và Simple Type, vì không dùng phụ đề chạy (TALKING-HEAD luật 1); Fully customizable và Colorful text, vì trùng ý với preset khác.

## 2b. Bộ ME4REAL (14 preset, `me4real.js` / `me4real.css`)

Dựng lại từ 6 video của editor BĐS ME4REAL (`docs/PHONG-CACH-ME4REAL.md`), đo từng khung 0,15 s lúc chữ vào; số đo ghi ở dòng `đo:` trong code. Nạp **sau** `bds-presets.js`, đăng ký vào `BDS.presets` nên dùng chung `BDS.make / in / out`, `lib/` và `kt-check`. Trong `pick-text.mjs` là nhóm `M4`. Không chép: quầng sáng sau chữ (luật 18) và vị trí dưới vùng an toàn TikTok.

| Preset | Dùng cho | Tham số chính | Gốc |
| --- | --- | --- | --- |
| `kim-loai` | Từ khóa đắt, hook: PHÁO HOA *Quốc Tế*, DU LỊCH, BOOKING | `m`, `s` (viết tay), `tone` vang \| bac, `tia` | V1 4 s, V3 22 s |
| `so-khong-lo` | Con số là cả câu: 200 triệu, 10 năm trước, 800 m² | `k` (nhãn trên), `value`, `from`, `u` (đơn vị, to ngang số; `uNho` nhỏ), `s` (viết tay), `dem:false` = đập vào | V1 5 s, V5 1 s, V6 2 s |
| `so-dem` | Thông số theo dòng: 10 tầng / 50 phòng | `rows: [{ n, u, k?, from?, at? }]`, màu dòng 1 `c/c2`, dòng 2 `c3/c4` | V1 44 s |
| `cap-dong` | Tiêu chí song song: VỊ TRÍ *Ấn Tượng* / QUY MÔ *Lý Tưởng* | `rows: [{ hoa, viet, at? }]` | V1 28 s |
| `phoi-canh` | Chữ nằm theo mặt phẳng, trôi theo máy: VỐN BAN ĐẦU chỉ từ 1,3 TỶ | `lines` (vai thuong \| nho \| so), `goc`, `xien`, `troi: [dx, dy]`, `noi` | V2 17 s |
| `noi-khoi` | Địa danh, cam kết: HỘI AN, SỞ HỮU LÂU DÀI | `m`, `s`, `tone` vang \| bang \| trang, `goc`, `xien` | V6 7 s, V2 24 s |
| `so-chen` | Ưu đãi một con số: Miễn phí quản lí **1** năm | `truoc` ("dòng1\|dòng2"), `so`, `sau`, `goc` | V2 30 s |
| `pill-xep` | Thông số dán cạnh công trình: 31 TẦNG NỔI / 3 TẦNG HẦM (dải dưới, căn trái) | `items: [{ t, at? }]` | V3 47 s |
| `nhan-ban-do` | Điểm trên bản đồ: thẻ vàng + ghim đỏ | `m`, `goc` | V2 43 s |
| `chu-gian` | Tên dự án / hạng mục: SKY VILLA, LÀM VIỆC | `m`, `s`, `mau` (chữ màu cỡ vừa), `gian` | V5 15 s, V4 32 s |
| `logo-ghep` | Tên dự án dạng logo: Lumi *Riverside* 5 · Second Home | `m`, `s`, `so`, `sub` | V3 78 s |
| `poster-serif` | Tiện ích sang trọng **trên nền sáng**: TIỆN ÍCH *xa hoa* | `m`, `s`, `sub`, `c` (màu mực) | V5 35 s |
| `so-thu-tu` | Lợi thế đánh số: **1** mặt bằng THƯƠNG MẠI | `rows: [{ n, nho, lon, viet?, at? }]` | V6 19 s |
| `khung-sdt` | CTA: số điện thoại trong khung viền | `m` | V3 118 s |

`cao-trao` (bộ 22) được mở rộng cùng đợt để phủ thêm 5 kiểu của ME4REAL: khối thông tin ("NGÂN HÀNG hỗ trợ 70%…"), chỉ số căn phải ("Tăng 15% so với Năm 2024", `align: "phai"`), danh sách nhiều màu (`align: "giua"`, vai `muc`, `c` từng dòng), chữ viết tay rỗng ruột (vai `vien`), giữ chữ thường ở dòng chốt (`hoa: false`). Vai đủ: `dem`, `nho`, `muc`, `khoa`, `cam`, `vien`, `so`, `chot`.

Bảng thử cả bộ: `npm run test:kiem-chu` (mọi preset đã duyệt × 3 bộ câu chữ × 3 cặp font; kt-check + text-ink).

## 3. Cách dùng trong template

1. Nhúng `bds-presets.css` và `bds-presets.js` vào template, sau gsap. Cách gọn: trong `build.mjs` đọc hai file này rồi thay vào placeholder `{{BDS_CSS}}` và `{{BDS_JS}}`. Hoặc chép thẳng nội dung vào template.
2. Trong script của template, trước khi dựng timeline:

```js
const h1 = BDS.make("dia-danh", "#s1-in", { m: "Thủ Thiêm", size: 96, c: "#38b6ff" });
const h2 = BDS.make("gia-chot", "#s2-in", { k: "GIÁ CHỐT", value: 2.5, suffix: " tỷ", size: 120, c: "#ffd23f" });
const e1 = BDS.in(tl, h1, T("@3"));      // trả về giây kết thúc phần vào
BDS.out(tl, h1, T("@5") - 0.25);         // thoát 0,25 giây trước chữ chốt kế
BDS.in(tl, h2, T("@5"));
```

Các tham số dùng chung: `k` (chữ dẫn), `m` (chữ chính), `m2` (vế thứ hai của `chuyen-dong`), `sub` (dòng phụ), `words` (danh sách của `quay-vong`), `value` / `prefix` / `suffix` / `decimals` (của `gia-chot`), `size` (px), `c` / `c2` (màu), `display` / `sans` (font), `seed`, `id`. Riêng `song` có thêm `waves` (số lần lượn).

3. Đặt khối chữ theo vùng chữ chốt của `TALKING-HEAD.md` (dải trên, đầu người nằm dưới khối chữ, trong `.stage`). Preset chỉ lo chữ, không lo vị trí.

## 4. Luật khi dùng

- **Khi nào dùng bộ này (người dùng chốt):** cho video có nội dung quy hoạch, có người thật hoặc cảnh quay thật do người dùng cung cấp.

Cách chọn preset cho từng chữ chốt (cùng với bộ chung 67 preset và thẻ bám lời) nằm ở `text-presets/QUY-TAC-CHU.md`. Các luật dưới đây chỉ riêng cho bộ này.

- **Hai tầng chữ phải ôm sát nhau.** Chữ dẫn (`k`) nằm sát dòng dưới, không chừa khoảng hở làm vụn ý. Hai dòng được lấn vào khoảng trống của nhau, miễn không đè nét hay dấu: dưới chữ dẫn không có dấu (Chỉ với / **0 Đ**ỒNG) thì chữ dẫn xuống sát đầu chữ; dưới chữ dẫn có dấu (CHỒNG CHO THÊM / 26 t**ỷ**) thì dừng ngay trên dấu. `BDS.make` tự làm việc này: đo viền mực thật của từng ký tự (chỉ xét ký tự dòng dưới nằm ngay dưới chữ dẫn) rồi chỉnh `margin-bottom` của chữ dẫn, khe chừa mặc định max(12% cỡ chữ dẫn, 5% cỡ dòng dưới). Đổi khe bằng `gap` (px), tắt bằng `snug: false`. Weight chưa nạp thì nó tự tải rồi đo lại.
- **Clip quay thật BĐS (TALKING-HEAD.md):** mỗi loại thông tin một preset (5–7 preset mỗi video), để không lặp một hiệu ứng.
  - Preset chính mỗi video phải khác video trước (bảng mục 4c của TALKING-HEAD.md).
- **Màu chữ ưu tiên gradient** (người dùng chốt): chữ khóa tô gradient dọc sáng trên → đậm dưới (`c` là màu giữa, `c2` là màu đáy, mặc định `c` pha 30% đen), chữ thường trắng → bạc. `khoi-noi`, `quay-vong`, `gia-chot` đã tô gradient sẵn. Chữ cắt nền thì đặt bóng bằng `filter: drop-shadow` trên cả dòng, không dùng `text-shadow` (bóng lộ qua lòng chữ).
- **Màu theo nghĩa:** đỏ = sai, mất tiền; xanh lá = đúng, ổn; vàng = tiền. Các màu khác lấy từ bảng màu của video qua `c` và `c2`.
- **Font theo cặp font của video:** truyền `display` và `sans`, hoặc đặt biến `--display`, `--sans` trên `:root`. Font phải có subset tiếng Việt.
- **Chữ chốt 2–5 chữ** (TALKING-HEAD luật 1) và không chép nguyên câu voice. `go-chu` là ngoại lệ, vì nó trích nguyên câu nói.
- **Không dùng preset cho nội dung trái brief:** không làm nhãn khan hiếm giả ("CÒN 3 CĂN"), không làm giá "chốt" khi đó chỉ là giá rao.
- **Gọi `BDS.make` sau khi font nạp xong.** Ba preset đo vị trí ký tự (`dia-danh`, `noi-bat`, `go-chu`) sẽ lệch nếu đo khi font chưa vào.
- Số đếm (`gia-chot`) và chữ giải mã (`chuong-moi`) dựng sẵn từng bước rồi bật/tắt, không dùng `onUpdate` (callback bị bỏ qua khi HyperFrames tua khung để xuất).
- Bộ này giữ đúng TOOLKIT mục 5.5: không đặt transform trong CSS, `fromTo` luôn ghi rõ đích, hiệu ứng tạm có `immediateRender: false`, không dùng `Math.random`. Seek tới giây nào cũng ra cùng một hình.

## 5. Xem thử

Mở `gallery.html` trong trình duyệt khi đã có `node_modules`; nó cần `gsap` và `@fontsource/be-vietnam-pro`. Thêm `?static` để dừng, rồi gọi `__seek(giây)` trong console để soi từng thời điểm.
