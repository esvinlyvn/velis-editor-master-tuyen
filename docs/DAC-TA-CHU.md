# Đặc tả lớp chữ (Text Overlay Spec) cho video nói về tài chính, đầu tư, kinh tế, quy hoạch, BĐS

> Bản chép trong repo của đặc tả gốc (artifact `CV9WPSDCBE1476VidcBcq8`), **phiên bản 0.2, ngày 24/10/2026**. Đây là chuẩn bắt buộc cho mọi chữ trên khung hình. Khi `HAU-KY.md` hay template nào mâu thuẫn với file này thì làm theo file này. Đặc tả gốc đổi thì chép lại toàn bộ vào đây.

**Phạm vi:** mọi chữ xuất hiện trên khung hình trong video do agent dựng, cho mọi chủ đề tài chính, đầu tư, kinh tế, quy hoạch, BĐS. Không bao gồm logo và đồ họa bản đồ, trừ nhãn chữ trên bản đồ (mục 4.10). Mục nào chỉ dùng cho BĐS được đánh dấu *(BĐS & quy hoạch)*.

Đặc tả được rút từ video BĐS (nguồn bên dưới) nhưng quy tắc là chung: cụm ý, lockup, vị trí, phông, màu, nhịp không phụ thuộc chủ đề. Ví dụ trong tài liệu dùng cả chủ đề tài chính chung lẫn BĐS.

**Nguồn rút đặc tả:**
- 17 video thành phẩm do editor thuê ngoài dựng (nhiều dự án căn hộ, biệt thự), phân tích ở 360×640.
- 3 video tham chiếu bổ sung (kênh chủ đầu tư: Cần Giờ, Hóc Môn, "nói vàng 5 năm"), phân tích ở 720×1280. Đây là nguồn chính cho **bố cục và phông chữ** của bản 0.2.

**Thay đổi so với 0.1:**
- Bỏ bảng màu cố định, thay bằng quy tắc màu theo tương phản (mục 7).
- Thay khái niệm "một keyword to" bằng **thư viện bố cục** (lockup, mục 4).
- Phông chữ chuyển sang **vai trò phông**, kèm danh sách đã kiểm chứng tiếng Việt (mục 6).

Mọi con số kích thước và thời lượng là **giá trị đề xuất**, cần hiệu chỉnh khi có thêm mẫu ở độ phân giải gốc.

---

## 1. Nguyên tắc cốt lõi
1. **Chữ là cụm ý, không phải phụ đề.** Mỗi khoảnh khắc chỉ hiện một cụm ý ngắn, có thứ bậc rõ: phần dẫn nhỏ, phần chốt to. Không chạy phụ đề cả câu trong ô nền.
2. **Bố cục thay đổi liên tục.** Không dùng một kiểu bố cục cho cả video. Mỗi cụm ý chọn một lockup trong thư viện (mục 4), phù hợp với nội dung và với khoảng trống của khung hình.
3. **Thứ bậc bằng tương phản phông,** không chỉ bằng cỡ chữ: chữ viết tay hoặc chữ thường mảnh đi với chữ in hoa đậm hoặc chữ hẹp đậm.
4. **Chữ sống cùng cảnh:** đặt vào khoảng trống thật của khung hình (cạnh đầu, ngang ngực, vùng tối). Được phép nằm **sau** người nói (mục 5.3).
5. **Màu do khung hình quyết định,** không do bảng màu cố định (mục 7).
6. **Trung thực với lời nói.** Được rút gọn, không thêm ý, thêm số liệu hay cam kết mà người nói không nói.
7. **Đa dạng có kiểm soát** qua bộ gen (mục 8).

## 2. Đơn vị nội dung
Agent không chọn "từ khóa" rời mà chọn **cụm ý** (phrase) từ transcript. Mỗi cụm gồm các vai trò:

| Vai trò | Mô tả | Ví dụ |
| --- | --- | --- |
| `lead` | Phần dẫn, 1–4 từ, nhỏ | "Anh chị có hơn", "Nghe thì", "So với", "Là" |
| `hero` | Phần chốt, 1–3 từ hoặc một con số, to nhất | "3 tỷ", "ĐƠN GIẢN", "TRÁI PHIẾU", "LẠM PHÁT", "7%/năm" |
| `tail` | Phần đuôi bổ sung, 1 dòng, nhỏ, thường mang màu nhấn | "Lo thủ tục", "Kẹt thanh khoản", "Cố định 12 tháng" |
| `body` | 1–3 dòng giải thích ngắn (chỉ dùng trong lockup panel, callout) | "Phân khúc giá bán / thanh khoản thứ cấp cao nhất" |
| `highlight` | Một cụm trong `lead`/`tail`/`body` được tô đậm và đổi màu | "thứ cấp cao nhất", "GIỮ VÀNG" |

Một cụm ý có thể chỉ có `hero`, hoặc `lead + hero`, hoặc `lead + hero + tail`. `hero` là bắt buộc, trừ lockup câu nhấn (4.4).

## 3. Chọn cụm ý
Thứ tự ưu tiên `hero` khi một câu có nhiều ứng viên:
1. Giá, số liệu có đơn vị: "3 tỷ", "7%/năm", "90%", "1.200 điểm"; BĐS: "75m2", "1400ha"
2. Thời gian, khoảng cách: "2 phút", "5 năm"
3. Khái niệm chốt của lập luận: "ĐƠN GIẢN", "RỦI RO", "AN TOÀN", "CẮT LỖ?"
4. Tên riêng: doanh nghiệp, ngân hàng, mã chứng khoán, khu vực, dự án
5. Điểm nổi bật, lợi ích: "ĐIỂN HÌNH", "MIỄN PHÍ", "LÔ GIA RIÊNG"
6. Hành động: "NHẬN BẢNG TÍNH", "ĐĂNG KÝ NGAY"

Quy tắc:
- `hero` tối đa 3 từ. Số kèm đơn vị tính là 1 cụm. Tên riêng dài được tách 2 dòng (ví dụ "Ngân hàng" nhỏ ở trên, "NHÀ NƯỚC" to ở dưới).
- `lead` lấy nguyên văn phần ngay trước `hero` trong lời nói ("Nghe thì" → "ĐƠN GIẢN"). Đây là cách tạo nhịp "dẫn – chốt" mà video tham chiếu dùng liên tục.
- Số đọc bằng chữ chuyển sang chữ số. Đơn vị viết theo thói quen ngành ("7%/năm" hoặc "7% một năm"; "75m2" hoặc "75 m²"), nhưng thống nhất trong một video.
- Không dùng từ đệm làm `hero`.
- Câu không có ứng viên đủ mạnh thì không hiện chữ.

## 4. Thư viện bố cục (lockup)
Mỗi lockup là một cách sắp xếp các vai trò ở mục 2. Agent chọn lockup theo nội dung và theo khung hình. Một video phải dùng **ít nhất 4 lockup khác nhau**, không lockup nào chiếm quá 40% số cụm ý.

### 4.1 `script_giant`: chữ viết tay dẫn + chữ khổng lồ
- `lead` bằng phông viết tay, mảnh, nhỏ. `hero` khổng lồ (chiều cao chữ 15–25% chiều cao khung), thường viết chữ thường hoặc hoa chữ đầu ("3 tỷ", "Lãi kép").
- Vị trí: nửa trên khung, cạnh hoặc **sau** đầu người nói (mục 5.3). `lead` lệch trái, phía trên `hero`.
- Dùng cho: mở video, con số lớn, tên khu vực.
- `hero` có thể tô gradient từ đặc sang mờ dần xuống dưới.

### 4.2 `lead_heavy`: dẫn thường + chốt đậm
- `lead` sans thường hoặc nghiêng, cỡ nhỏ. Ngay dưới là `hero` in hoa đậm hoặc chữ hẹp đậm, to gấp 2–3 lần `lead`.
- Vị trí: ngang ngực người nói, căn giữa.
- Dùng cho nhịp "Nghe thì / ĐƠN GIẢN", "So với / TRÁI PHIẾU", "Là / NHÀ". Đây là lockup dùng nhiều nhất.

### 4.3 `three_tier`: ba tầng
- `lead` (thường) / `hero` (in hoa đậm) / `tail` (thường, màu nhấn). Căn trái hoặc căn giữa, khoảng cách dòng sát (0,9–1,05 lần cỡ chữ).
- Vị trí: ngang ngực, hoặc giữa khung trong `blur_panel`.
- Ví dụ: "Các công ty / VÀNG BẠC ĐÁ QUÝ / Lo thủ tục"; "Lãi suất / 7%/NĂM / Cố định 12 tháng".

### 4.4 `inline_highlight`: câu nhấn
- 1–2 dòng sans nghiêng hoặc thường. Một cụm trong đó đậm hơn và đổi màu.
- Vị trí: 1/3 dưới vùng an toàn, hoặc ngang ngực.
- Ví dụ: "Khách sau trả trên / **300-500tr vẫn không có**".
- Đây là lockup duy nhất được phép không có `hero` riêng.

### 4.5 `ghost_number`: số chìm
- Con số rất to, độ mờ 35–60% hoặc chế độ hòa trộn (overlay/soft-light), đặt đè lên thân người hoặc nền, kèm `lead` viết tay rõ nét.
- Ví dụ: "Lãi" (viết tay) + "8%" (chìm trên ngực áo); BĐS: "Căn" + "75m2".

### 4.6 `callout_box`: khung chú thích
- Khung chữ nhật viền đứt nét, 4 góc có ô vuông nhỏ (kiểu khung chọn của phần mềm thiết kế). Bên trong là `lead` viết tay + `hero` số.
- Dưới khung là `body` 2–3 dòng, có `highlight`.
- Dùng cho thông số: lãi suất, kỳ hạn, giá, tỷ lệ; BĐS: diện tích đất, diện tích xây dựng, giá bán.

### 4.7 `card`: thẻ ảnh
- Ảnh bo góc 24–40 px, đổ bóng, chiếm 50–70% bề rộng khung. Tiêu đề in hoa đậm phía trên hoặc phía dưới, chú thích 1–2 dòng bên dưới.
- Chỉ dùng khi có ảnh hoặc footage đúng chủ đề trong kho (sản phẩm, doanh nghiệp, sự kiện, dự án).

### 4.8 `blur_panel`: nền mờ giải thích
- Footage người nói vẫn chạy nhưng bị làm mờ mạnh và tối đi (độ sáng còn 30–45%). Giữa khung là một `three_tier` hoặc `callout_box`, có thể kèm biểu tượng hoặc vật thể 3D (thỏi vàng, tiền, đồng hồ cát, logo ngân hàng).
- Dùng để giải thích một khái niệm, so sánh, liệt kê. Mỗi lần tối đa 3–5 giây, tổng cộng không quá 25% thời lượng video.

### 4.9 `ordinal`: số thứ tự
- Tiêu đề in hoa đậm + dòng phụ, bên dưới là chữ số thứ tự rất to, nghiêng ("SAU 5 NĂM / Có 3 trường hợp / 1").
- Dùng khi người nói liệt kê.

### 4.10 `map_label`: nhãn bản đồ *(BĐS & quy hoạch)*
- Tên 2 dòng (dòng trên là loại khu, dòng dưới là tên riêng) + số liệu màu nhấn ("KCN / Xuyên Á / 479 ha").
- Chỉ dùng trên cảnh bản đồ. Quy tắc riêng cho bản đồ, khoanh lô, mặt bằng: `HAU-KY.md` mục 12.

### 4.11 `cta`
- Nút bo góc, chữ đậm, con trỏ bấm, vòng lan khi bấm, âm thanh click.
- Nội dung lấy từ lời nói nếu có. Nếu không có thì dùng một trong: `NHẬN BẢNG TÍNH`, `ĐĂNG KÝ NGAY`, `LIÊN HỆ NGAY`, `NHẬN BÁO GIÁ` (BĐS: `ƯU TIÊN BOOKING`). Không tự thêm số điện thoại.

## 5. Vị trí (khung 1080 × 1920)
### 5.1 Vùng an toàn
x 60–1020, y 200–1320.
- Trên y 200 là thanh giao diện nền tảng.
- Dưới y 1320 là vùng caption và nút.
- Dải x > 960, y 900–1500 có cột biểu tượng.

### 5.2 Bản đồ khoảng trống
Trước khi đặt chữ, agent tính cho từng cảnh: hộp mặt người (cộng 10% lề), hộp thân người, và các vùng trống (độ chi tiết thấp, không có mặt). Lockup được đặt vào vùng trống phù hợp:

| Vùng | Lockup ưu tiên |
| --- | --- |
| Cạnh đầu, nửa trên khung | `script_giant`, tên riêng 2 dòng |
| Ngang ngực (dưới cằm, trên mép vùng an toàn dưới) | `lead_heavy`, `three_tier`, `inline_highlight`, `ghost_number` |
| Toàn khung (sau khi làm mờ) | `blur_panel`, `ordinal` |
| Cảnh không người | `card`, `callout_box`, `map_label`, mọi lockup khác |

Căn lề được phép trái, giữa hoặc phải. Khi người nói lệch về một bên khung, chữ ưu tiên căn về phía trống.

### 5.3 Chữ sau người nói
- `script_giant` và `ghost_number` được phép đặt **sau** người nói: chữ nằm giữa nền và người, đầu hoặc vai che một phần chữ.
- Cần mặt nạ tách người theo từng khung hình (HyperFrames có công cụ tách nền). Phần chữ bị che không được quá 35% diện tích chữ, và các ký tự quan trọng (chữ số, đơn vị) phải đọc được.
- Không có mặt nạ đạt chất lượng thì đặt chữ phía trước, không cố làm.

### 5.4 Không bao giờ
- Chữ đè lên mắt hoặc miệng người nói.
- Chữ ra ngoài vùng an toàn.
- Hai lockup cùng lúc trên khung (trừ `card`, vốn có tiêu đề và chú thích của chính nó).

## 6. Phông chữ theo vai trò
### 6.1 Vai trò phông
| Vai trò | Dùng cho | Ứng viên đã kiểm chứng có tiếng Việt (Fontsource) |
| --- | --- | --- |
| `display_condensed` | `hero` hẹp đậm, số | Barlow Condensed (100–900, có nghiêng), Roboto Condensed (100–900, có nghiêng), Oswald (200–700), Anton (400) |
| `display_geometric` | `hero` in hoa đậm rộng | Montserrat (đã dùng thực tế), Be Vietnam Pro (100–900, có nghiêng), Lexend (100–900) |
| `text_sans` | `lead`, `tail`, `body` | Be Vietnam Pro, Roboto Condensed, Barlow Condensed (dùng bản nghiêng cho `inline_highlight`) |
| `script` | `lead` viết tay, `ghost_number` | Dancing Script (đã dùng thực tế), Great Vibes, Allura, Pacifico (400) |
| `serif_luxury` | Thương hiệu cao cấp (ngân hàng riêng, BĐS hạng sang), tùy chọn | Playfair Display (400–900, có nghiêng) |

**Không dùng Bebas Neue**: bản trên Fontsource không có bộ ký tự tiếng Việt, dù rất phổ biến trong video mẫu nước ngoài.

### 6.2 Cặp phông
Mỗi video chọn 2 vai trò chính, cộng tối đa 1 vai trò phụ. Ví dụ:
- `script` × `display_condensed` (giống video Cần Giờ)
- `text_sans` × `display_geometric` (giống video "nói vàng")
- `script` × `display_geometric` × `serif_luxury`

### 6.3 Cỡ chữ (px, ở bề rộng 1080)
| Vai trò trong lockup | Cỡ |
| --- | --- |
| `hero` trong `script_giant` | 220–420 (chiều cao chữ 15–25% khung) |
| `hero` trong `lead_heavy`, `three_tier` | 90–160 |
| `hero` số trong `ghost_number` | 200–320 |
| `lead` viết tay | 54–90 |
| `lead`, `tail` sans | 40–60 |
| `body` | 34–44 |
| `inline_highlight` | 46–64 |

Tỷ lệ `hero` : `lead` tối thiểu 2 : 1. Đo bề rộng bằng số liệu phông thật. Không vừa thì tách dòng cân đối, không thu nhỏ dưới mức tối thiểu.

### 6.4 Viết hoa, ký hiệu
- `hero` in hoa hoặc chữ thường tùy lockup (`script_giant` thường để chữ thường: "tỷ", "Cần Giờ").
- Viết hoa ngay trong dữ liệu, **không** dùng `text-transform: uppercase` (làm hỏng "m²", "tr").
- Kiểm tra glyph: mọi ký tự trong chuỗi phải có trong phông đang dùng.

## 7. Màu theo tương phản (không cố định)
### 7.1 Cách chọn
Với mỗi cụm ý, agent lấy mẫu vùng nền ngay sau hộp chữ, trên các khung hình mà chữ xuất hiện:
1. Tính độ sáng trung bình (luminance) và màu chủ đạo (hue) của vùng nền.
2. **Màu chữ chính**: trắng nếu nền tối hoặc trung tính; gần đen nếu nền rất sáng và không thể làm tối.
3. **Màu nhấn** (cho `highlight`, `tail`, số): chọn màu bão hòa cao, có hue cách màu chủ đạo của nền 120°–180°. Ví dụ nền tím hồng của văn phòng → vàng hoặc cyan; nền xanh biển → vàng cam.
4. Kiểm tra tỷ lệ tương phản giữa chữ và nền: tối thiểu 4,5 : 1 cho `lead`, `tail`, `body`; tối thiểu 3 : 1 cho `hero` từ 90 px trở lên. Không đạt thì lần lượt thử: tăng bóng tối, thêm gradient tối cục bộ, đổi màu chữ.
5. Ngoại lệ có chủ đích: `ghost_number` được phép tương phản thấp, nhưng `lead` đi kèm phải đạt chuẩn.

### 7.2 Giữ thống nhất
- Một video dùng 1 màu chữ chính + tối đa 2 màu nhấn. Màu nhấn được đổi giữa các phần lớn của video (ví dụ phần "vấn đề" và phần "giải pháp"), không đổi theo từng câu.
- Màu nhấn của một con số giữ nguyên mỗi lần con số đó xuất hiện lại.

### 7.3 Hiệu ứng hỗ trợ đọc
- Bóng đổ tối mềm cho mọi chữ trên footage: `0 4–8px 18–28px rgba(0,0,0,.5–.7)`.
- Glow chỉ dùng cho `hero`, màu glow cùng hue với màu chữ, độ mờ 40–70%.
- Gradient trong chữ (đặc → mờ dần) chỉ dùng cho `hero` của `script_giant`.

## 8. Bộ gen (đa dạng hóa)
Hai video cùng kênh hoặc cùng chủ đề (cùng dự án nếu là BĐS) không được trùng quá 2 trong 6 gen.

| Gen | Biến thể |
| --- | --- |
| `font_pair` | các cặp ở mục 6.2 |
| `lockup_mix` | tỷ lệ dùng các lockup (ví dụ thiên về `lead_heavy` + `blur_panel`, hay `script_giant` + `ghost_number`) |
| `align` | ưu tiên căn giữa / căn trái / theo phía trống |
| `entrance` | hiện từng dòng từ dưới lên; mờ thành rõ; gõ chữ (typewriter); bật nảy; trượt mask; chữ khổng lồ thu về kích thước thật |
| `exit` | mờ dần; trượt mask; thu nhỏ; cắt theo dòng |
| `emphasis` | tô màu `highlight` sau khi hiện; vạch gạch chân chạy; số đếm lên; khung `callout_box` vẽ dần |

Đối chiếu từng biến thể với ID cụ thể trong thư viện Motion Prompt khi tích hợp. Bộ gen được bổ sung định kỳ bằng cách phân tích video xu hướng mới.

## 9. Thời gian
| Thông số | Giá trị |
| --- | --- |
| Cụm ý vào trước từ đầu tiên được nói | 0,05–0,15 giây |
| `lead` vào trước `hero` | 0,2–0,6 giây, đúng nhịp lời nói |
| Thời lượng một cụm ý trên khung | 0,8–3 giây (`blur_panel`, `callout_box`: tối đa 5 giây) |
| Khoảng đổi cụm ý điển hình | 1–3 giây |
| Hiệu ứng vào | 0,2–0,45 giây; các dòng trong lockup vào lệch nhau 0,06–0,15 giây |
| Hiệu ứng ra | 0,15–0,25 giây |
| Số đếm lên | 0,6–1,0 giây, giữ con số cuối ít nhất 0,8 giây |
| Khung hình đầu tiên | bắt buộc có cụm ý (ưu tiên `script_giant` hoặc `lead_heavy`) |

Hai cụm ý không chồng nhau. Cụm sau chỉ vào khi cụm trước đã bắt đầu ra.

## 10. Từ điển tên riêng
Nhận dạng giọng nói tiếng Việt sai tên riêng rất thường xuyên. Thực tế đã gặp: tên dự án tiếng Anh ra chuỗi chữ vô nghĩa, tên ngắn bị cụt còn 1–2 âm.
- Mỗi video (hoặc mỗi chuỗi video cùng chủ đề) bắt buộc có file từ điển. Agent chuẩn hóa transcript theo từ điển trước khi chọn cụm ý.
- Tên không có trong từ điển và nghe không chắc thì **không đưa lên màn hình**.

Trong repo này, từ điển đặt tại `projects/<ten-video>/glossary.yaml` (đặc tả gốc ghi `kits/<du-an>/`):
```yaml
project: Lãi suất tiết kiệm 2026
aliases:
  VN-Index: [vn index, việt nam index, vê en index]
  Vietcombank: [việt com bank, vietcom banh]
  lãi kép: [lãi kết, lại kép]
  trái phiếu: [trái phiếu, chái phiếu]
```
Với BĐS, thêm tên dự án, chủ đầu tư và thuật ngữ ("lô gia" ra "loa", "sold out" ra "sun haod").

## 11. Định dạng dữ liệu cho agent
```json
{
  "genes": { "font_pair": "script×display_condensed", "lockup_mix": "lead_heavy+blur_panel", "align": "free_side", "entrance": "line_up", "exit": "mask", "emphasis": "highlight_color" },
  "colors": { "text": "#FFFFFF", "accents": ["#FFD23F", "#3EE6FF"], "source": "auto_contrast" },
  "phrases": [
    { "lockup": "script_giant", "lead": "Anh chị có hơn", "hero": "3 tỷ", "start": 0.0, "end": 2.1, "behind_subject": true, "anchor_words": [12, 15] },
    { "lockup": "lead_heavy", "lead": "Nghe thì", "hero": "ĐƠN GIẢN", "start": 24.6, "end": 26.0 },
    { "lockup": "inline_highlight", "body": ["Khách sau trả trên", "300-500tr vẫn không có"], "highlight": "300-500tr vẫn không có", "start": 40.2, "end": 42.9 },
    { "lockup": "callout_box", "lead": "Diện tích đất", "hero": "75m2", "body": ["Phân khúc giá bán", "thanh khoản thứ cấp cao nhất"], "highlight": "thứ cấp cao nhất", "start": 85.0, "end": 89.5 },
    { "lockup": "blur_panel", "inner": "three_tier", "lead": "Các công ty", "hero": "VÀNG BẠC ĐÁ QUÝ", "tail": "Lo thủ tục", "icon": "gold_bars", "start": 60.1, "end": 63.4 },
    { "lockup": "cta", "hero": "NHẬN BÁO GIÁ", "start": 128.0, "end": 135.3 }
  ]
}
```
Màu trong `colors` do bước 7.1 tính ra, không nhập tay.

## 12. Bảng kiểm tự động trước khi giao
Mọi mục phải đo được. Vi phạm thì agent sửa và kiểm lại, không giao.
- [ ] Mỗi `hero` tối đa 3 từ (trừ tên riêng tách dòng).
- [ ] Mỗi cụm ý hiển thị trong giới hạn thời lượng của lockup (mục 9).
- [ ] Khoảng trung vị giữa hai lần đổi cụm ý từ 1 đến 3 giây.
- [ ] Không có phụ đề cả câu trong ô nền đặc.
- [ ] Khung hình đầu tiên có cụm ý.
- [ ] Ít nhất 4 lockup khác nhau; không lockup nào chiếm quá 40% số cụm ý.
- [ ] `blur_panel` không quá 25% thời lượng video.
- [ ] Tỷ lệ `hero` : `lead` tối thiểu 2 : 1 trong mọi lockup có cả hai.
- [ ] Mọi chữ trong vùng an toàn; không đè mắt, miệng (kiểm trên khung lấy mẫu mỗi 0,5 giây).
- [ ] Chữ sau người nói: bị che không quá 35% diện tích, chữ số và đơn vị đọc được.
- [ ] Tương phản đạt mục 7.1 (trừ `ghost_number`).
- [ ] Tối đa 1 màu chữ chính + 2 màu nhấn trong video.
- [ ] Mọi ký tự có glyph trong phông đang dùng; không có `text-transform: uppercase`.
- [ ] Mọi tên riêng khớp từ điển; mọi con số trên màn hình có trong lời nói.
- [ ] Hai cụm ý không chồng nhau.
- [ ] Tổ hợp gen không trùng quá 2/6 gen với các video trước cùng kênh hoặc cùng chủ đề.

## 13. Lỗi đã gặp, không lặp lại
| Lỗi | Bản dựng | Vi phạm mục |
| --- | --- | --- |
| Phụ đề cả câu 56 px trong ô nền tối chạy suốt video | bản dựng cũ | 1, 12 |
| Tiêu đề 4–6 từ, phải thu nhỏ còn 74–86 px | bản dựng cũ | 3, 6.3 |
| Mỗi tiêu đề đứng 5–10 giây | bản dựng cũ | 9 |
| `m²` bị biến thành `M²` do viết hoa bằng CSS | bản dựng cũ | 6.4 |
| Bước tự soát chỉ kiểm lỗi kỹ thuật, không kiểm tuân thủ đặc tả | bản dựng cũ | 12 |
| Chỉ một bố cục (khối chữ trên đầu) cho cả video | bản dựng cũ | 2, 4, 12 |
| Màu nhấn cố định (cyan, hồng) chọn sẵn, không theo nền | bản dựng cũ | 7 |
| Không có nhịp "dẫn – chốt", phần lớn chỉ có một từ khóa đứng riêng | bản dựng cũ | 2, 4.2 |
