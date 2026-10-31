# Thư viện text preset (60 mẫu)

Học từ 2 video mẫu: "40 text presets dành riêng cho editor CapCut" (4 trang × 10 preset tĩnh) và video diễn hoạt từng preset. Dựng lại toàn bộ bằng HTML/CSS + GSAP để dùng trong HyperFrames, không phụ thuộc CapCut.

> **Chữ trong preset chỉ là chữ mẫu.** Preset là *kiểu dáng* (font, cỡ, màu, glow, bố cục dòng, diễn hoạt). Mọi video truyền chữ thật qua `texts`. Bộ cụm từ kiểm thử hiện có (`test-phrases.mjs`, mục 5) thuộc nhóm BĐS & quy hoạch.

**Phạm vi:** preset dùng cho mọi video tài chính, đầu tư, kinh tế, quy hoạch, BĐS. Mỗi preset có trường `nhom`: `chung` hoặc `bds-quy-hoach` (phần mở rộng BĐS: 9 mẫu CapCut có chữ mẫu và công dụng gắn căn hộ, tiện ích, vị trí; tập `NHOM_BDS` trong `presets.mjs`). Kiểu dáng của nhóm BĐS vẫn dùng được cho chủ đề khác, chỉ cần truyền chữ thật.

- **#1–40**: dựng lại 40 mẫu, màu đo bằng điểm ảnh trên khung cuối ổn định của mẫu, diễn hoạt theo chuỗi khung của video diễn hoạt.
- **#41–60**: 4 bộ mới (A, B, C, D) kết hợp từ thành phần của 40 mẫu. Mỗi bộ đúng 2 font và đổi màu theo thương hiệu bằng `theme` (mục 3).

| File | Vai trò |
| --- | --- |
| `presets.mjs` | dữ liệu 60 preset, `presetHtml()` (HTML), `presetJs()` (GSAP), `presetRuntime()` (đo bố cục), `contrastPlan()` (chọn chế độ nền + màu) |
| `presets.css` | font, cách tô màu, glow, trang trí |
| `fonts.mjs` | chép font (subset latin + tiếng Việt) từ `@fontsource` vào thư mục dựng |
| `test-phrases.mjs` | 2 bộ cụm từ BĐS cho mỗi preset (ngắn / dài, nhiều dấu, số, đơn vị) |
| `gallery.mjs` | video demo `build/text-presets/output.mp4`, catalog `catalog-1..6.png`, `bo-moi-tren-video.jpg`; kiểm tự động |
| `test.mjs` | thử chữ BĐS trên nền ảnh thật: `build/text-presets/test/thu-*.jpg` (khung cuối), `dien-hoat-*.jpg` (5 khung giữa diễn hoạt) |
| `tools/compare.mjs` + `tools/compose.py` | đối chiếu #1–40 với khung cuối ổn định của 2 video mẫu (mẫu \| thư viện) |

```bash
node text-presets/gallery.mjs --no-render     # catalog + kiểm (bỏ --no-render để xuất video demo)
node text-presets/test.mjs                    # thử chữ BĐS trên nền thật (hoặc: node text-presets/test.mjs a-hook,d-spec)
node text-presets/tools/compare.mjs work/textref && python3 -I text-presets/tools/compose.py work/textref
```

## 1. Ngữ pháp thiết kế rút ra từ mẫu

Mỗi preset là 1–4 dòng xếp chồng. Luôn có **một dòng chính** (key), các dòng còn lại làm nền cho nó.

| Thành phần | Cách làm trong mẫu | Trong thư viện |
| --- | --- | --- |
| Dòng chính | Chữ rất đậm: hẹp đậm (Anton, Barlow Condensed 800), tròn đậm (Montserrat 900), serif đậm (Playfair) | `f-anton`, `f-cond`, `f-black`, `f-heavy`, `f-sans-b`, `f-serif-b` |
| Dòng phụ | Chữ ký (thường chồng mép dưới dòng chính, lệch phải), serif thường, sans nhỏ | `f-script` (Great Vibes), `f-serif`, `f-serif-i`, `f-sans` |
| Tỷ lệ cỡ | Dòng chính 120–200 px; chữ ký 0,8–1,4 lần dòng chính (Great Vibes có chữ x rất thấp); chữ nhỏ 40–80 px | trường `s` |
| Màu | **Đo trên khung cuối ổn định**: neon bão hòa, phẳng (`F`) hoặc gradient **ngang** kiểu đèn: hai mép đậm, giữa sáng (`H(c1, c2)`). Không có gradient dọc tự chế. Dòng phụ trắng | `fill` trong `presets.mjs` |
| Glow | Quầng cùng màu chữ, 2 lớp: sát 3 px + loang 12 px ở 55 % | `filter: drop-shadow` trên dòng |
| Chồng dòng | Chữ ký đè góc dưới phải dòng chính (`mt` âm, `dx` dương, `z: 2`). Chữ đậm không đè dấu dòng trên | `mt`, `dx`, `z` |
| Trang trí | Hộp nền, cụm tô nền, thanh dọc, khung chọn có tay nắm, gạch chân cong, elip, gạch ngang, hộp viền tối, số lớn treo, ô cuộc gọi, hạt lấp lánh, con trỏ | `box`, `hl`, `vbar`, `deco`, `outlined`, `big`, `pill`, `fx: sparkle`, `a: "caret"` |

Gradient ngang chạy liền cả dòng dù mỗi ký tự là một khối riêng (để diễn hoạt từng chữ): `presetRuntime()` đo vị trí từng ký tự (`--x`) và bề rộng dòng (`--lw`), CSS kéo gradient theo đó. Chữ ký Great Vibes giữ nguyên từng **từ** (không tách ký tự) để nét nối giữa các chữ cái không đứt.

## 2. Diễn hoạt (học từ chuỗi khung video diễn hoạt)

Vào (`a`): `type` gõ chữ · `caret` gõ có con trỏ nháy (CĂN HỘ CAO CẤP) · `spread` dàn rộng rồi khép · `wipe` viết dần (chữ ký) · `fadeCh`/`riseCh` từng chữ hiện/trồi · `pop` nảy · `popRand` bật ra to nhỏ ngẫu nhiên (Capcut) · `drop` rơi từ to · `zoomCh` thu từ rất to, mờ · `grow` lớn dần · `streakR`/`streakL` trượt có vệt mờ · `scatter` bay từ nhiều hướng tụ lại · `tumble` xoay lộn vào · `wave` trồi theo sóng · `bounce` nảy bậc thang · `words` từng từ · `blur`, `slide`, `rise`, `fade` cả dòng · `reveal` trượt ra từ sau thanh dọc · `box`/`boxSpread` hộp mở rồi chữ vào.

Hiệu ứng màu/ánh sáng (`fx`), chạy sau khi chữ vào:
| fx | Hiệu ứng | Thấy ở |
| --- | --- | --- |
| `seq` | Đi qua chuỗi màu đo từ mẫu, dừng ở màu cuối (trắng → hồng → đỏ → cam → vàng → xanh lá) | Thay đổi màu sắc, Cơ hội, Không Gian Sống |
| `alarm` | Nháy đỏ 3 nhịp rồi về trắng, gạch ngang tắt dần | Cẩn Thận |
| `shine` | Vệt sáng quét ngang qua chữ | Bất động sản |
| `splitIn` | Chữ trắng, màu dâng từ chân lên tới đỉnh, khung cuối phủ kín màu | Capcut |
| `sparkle` | Hạt lấp lánh bật ra cuối dòng rồi tắt | Mobile |

- Nét trang trí vẽ dần bằng `clip-path` trên khung SVG (GSAP mở từ trái, `rtl` từ phải, xong thì bỏ `clip-path`). Không dùng `stroke-dasharray`/`pathLength`: cùng `vector-effect: non-scaling-stroke`, nét ra đứt khúc hoặc dừng giữa chừng khi khối được thu phóng.
- Giãn cách từng chữ tính theo số ký tự **thật** của dòng, chữ dài hơn chữ mẫu vẫn vào xong trong cùng khoảng thời gian.
- Các dòng vào lệch nhau 0,2–0,8 s (trường `d`): dòng chính trước, chữ ký sau. Ra: cả khối mờ, bay lên 14 px trong 0,3 s.

## 3. Bốn bộ mới (#41–60) và cách đổi màu thương hiệu

Mỗi bộ có đủ vai trò cho một video: mở đầu, con số, nhãn/thông số, đối chiếu hoặc danh sách, kêu gọi. Một video chọn **một bộ** là giữ được quy tắc 2 font, 2 màu của [`docs/DAC-TA-CHU.md`](../docs/DAC-TA-CHU.md).

| Bộ | Font | Gốc kết hợp | Preset | Hợp với |
| --- | --- | --- | --- | --- |
| A · Neon sang | Anton + Great Vibes | #1, #9, #29, #32, #36, #37 | `a-hook` · `a-key` · `a-number` · `a-label` · `a-compare` · `a-cta` | Thương hiệu cao cấp (tài chính, BĐS), footage tối hoặc vừa |
| B · Serif sang trọng | Playfair Display + Great Vibes | #13, #24, #31, #35 | `b-title` · `b-quote` · `b-number` · `b-location` · `b-list` | Thương hiệu sang, nhịp chậm |
| C · Đậm trẻ | Montserrat 900 + Be Vietnam Pro | #6, #10, #11, #18, #40 | `c-hook` · `c-marker` · `c-tag` · `c-step` · `c-alert` | Hook mạnh, khuyến mãi, các bước, sửa hiểu lầm |
| D · Thông số | Barlow Condensed + Be Vietnam Pro | #2, #25, #27 | `d-spec` · `d-select` · `d-counter` · `d-lower` · `d-call` | Thông số (lãi suất, kỳ hạn; BĐS: diện tích, tiến độ), giới thiệu người nói |
| E · Đè lớp | Anton + Be Vietnam Pro 800 (không chữ viết tay) | A + bố cục đè lớp của mẫu | `e-hook` · `e-key` · `e-number` · `e-label` · `e-compare` · `e-cta` | Mọi video khi không muốn chữ viết tay; chữ phụ nằm trên, đè mép chữ lớn |

Chữ phụ bộ E (`sub: true`): lớp trên (`z: 2`), KEY kéo lên dưới nó bằng `mt` âm, viền tối mảnh để đọc rõ khi đè lên chữ vàng.

Thành phần riêng của các bộ: thẻ có khấc (`tag`), bút dạ (`deco: marker`), gạch hai bên (`deco: rules`), dấu ✓ (`deco: check`), số đếm lên (`count`), hai tông (`split`), lower third (`d-lower`).

Màu thương hiệu: truyền `theme` (cùng một object) vào **cả** `presetHtml` và `presetJs` (fx đổi màu dừng ở màu theme). Theme tô dòng `key` (gradient ngang + glow), dòng `acc` (màu phụ), mọi hộp, vạch, trang trí có màu `"theme"`.
`THEMES`: `coral` (san hô), `gold`, `lime`, `neon`, `violet`, `rose` — mỗi theme `{ c1 mép, c2 giữa, glow, fill2, solid, hue }`.

## 4. Cách dùng trong một dự án

```js
import { presetHtml, presetJs, presetRuntime, contrastPlan } from "../../text-presets/presets.mjs";
import { fontCss } from "../../text-presets/fonts.mjs";
const fonts = fontCss(OUT);                                   // @font-face, chép font vào OUT/assets/fonts
const css = fs.readFileSync("text-presets/presets.css", "utf8");
// đo nền dưới vị trí đặt chữ (scripts/bg-sample.py colors → {lum, hue, sat}) rồi chọn chế độ + màu
const plan = contrastPlan(stat, "coral");                     // { bg: "light"|"dark", theme, themeObj }
html += presetHtml("a-number", ["Giá chỉ từ", "3,2 TỶ"], { id: "n1", left: 540, top: 300, bg: plan.bg, theme: plan.themeObj });
js   += presetJs("a-number", "#n1", 86.2, { hold: 3, theme: plan.themeObj });   // vào lúc 86,2 s, giữ 3 s
// cuối <body>: presetRuntime()   — bắt buộc (gradient liền dòng, tự xuống dòng / thu khối quá rộng, giữ khối trong khung)
```

- `texts` thay chữ theo thứ tự dòng; bỏ trống giữ chữ mẫu; `null` bỏ hẳn dòng đó (vd. `a-key` chỉ còn KEY: `[null, "CẮT LỖ?"]`). Cụm `[...]` được tô nền (preset có `hl`). Dòng có số treo (`big`) viết số ở đầu dòng ("02 KÝ HỢP ĐỒNG"); dòng đếm (`count`) viết số + đơn vị ("850", "98%").
- `bg: "light"` cho nền sáng (trời, tường trắng, nội thất sáng): glow giảm còn 35 %, thêm viền tối sát + bóng loang để chữ neon tách nền. `contrastPlan` bật khi `lum > 0,3`, và đổi theme khi màu nền gần màu theme (< 60°, nền đủ bão hòa).
- `maxWidth` (mặc định 940): khối rộng hơn thì runtime thu nhỏ cả khối. `edge` (mặc định 24): lề tối thiểu tới mép khung; dùng 60–62 để giữ trong vùng an toàn x 60–1020 của DAC-TA-CHU. `scale` thu phóng, `anchor: "left"` căn trái theo `left`, `speed` > 1 rút ngắn trễ giữa các dòng.

Cảnh chữ trên nền chuyển động riêng (không có người nói/b-roll): chọn nền, vùng chữ, màu theo `broll/nen/README.md` — `nenPlan()` trả sẵn `bg`, `theme`, `recolor`, tấm lót.

### Quy tắc khi đưa vào video thật (theo [`docs/DAC-TA-CHU.md`](../docs/DAC-TA-CHU.md) và [`docs/HAU-KY.md`](../docs/HAU-KY.md) mục 10)
1. **Mỗi video chọn 1 họ preset** dùng chung font và màu. Không trộn quá 2 font chính, 2 màu nhấn.
2. **Đổi màu theo thương hiệu/nền** bằng `theme` + `contrastPlan`, không dùng nguyên màu neon của mẫu khi nền cùng tông.
3. **Không để chữ chạm dấu dòng khác.** Chỉ chữ ký được chồng lên dòng chính, và chồng ở mép dưới.
4. Giữ khối chữ ít nhất 1,5 s sau khi diễn hoạt xong (`hold`). Chữ quá dài làm khối thu dưới 70 % → chọn preset khác hoặc rút gọn chữ.

## 5. Kiểm tra

Tự động trong `gallery.mjs` (ảnh tĩnh là **khung thật của timeline** sau khi diễn hoạt và fx đã xong, không phải CSS tĩnh):
- Bề rộng gốc của mỗi preset (trước khi runtime thu nhỏ) ≤ 960 px.
- **Chữ hai màu:** chụp riêng lớp tô và hình chữ; điểm ảnh chữ nằm ngoài lớp tô (dấu Ắ Ầ Ữ, dấu nặng Ạ Ặ) thì dừng. Hộp tô mỗi ký tự nới 0,36 em trên / 0,32 em dưới.
- `npx hyperframes lint` 0 lỗi: không diễn hoạt `letter-spacing`, không để GSAP đè `transform` căn giữa (vị trí ở `.tp-pos`, diễn hoạt ở `.tp`).

Dấu tiếng Việt và hộp (`tools/box-check.mjs`, chữ thử Ắ Ầ Ễ Ỗ Ữ Ặ Ộ Ỵ + chữ thật): mọi hộp màu, hộp viền, thẻ khấc, cụm tô nền có đệm trên ≥ 0,3 em, dưới ≥ 0,16 em → 0 điểm ảnh chữ lọt khỏi hộp. Dòng tự xuống dòng giãn 1,32 để dấu mũ dòng dưới không chạm chân dòng trên. Hộp màu theme sáng (gold) dùng chữ tối (`onSolid`). Diễn hoạt viết dần / mở hộp / trượt ra bỏ `clip-path` khi chạy xong (không xén nét, dấu ở mép).
Chữ ký Great Vibes vẽ móc ư/ơ rất nhỏ, ở cỡ phụ dễ đọc thành u/o: dùng `hand: true` (Dancing Script 700, móc rõ).

Lỗi chỉ lộ ra khi tua khung (như lúc xuất video), đã sửa và có kiểm:
- Số đếm (`count`) không dùng `onUpdate` (callback bị bỏ qua khi tua → số đứng ở 0) và không `tl.set` `textContent` (GSAP đọc "1.200" thành 1.2): các bước đếm dựng sẵn, xếp chồng bằng `inline-grid` (bề rộng cố định, số không nhảy), GSAP chỉ bật/tắt từng bước.
- `test.mjs` tua timeline như khi xuất khung (bỏ callback), nên lỗi loại này hiện ngay trên ảnh kiểm.

Ảnh kiểm mẫu đã lưu: `catalog/thu-chu-bds-*.jpg` (khung cuối trên nền thật), `catalog/dien-hoat-mau.jpg` (5 khung giữa diễn hoạt).

Thử chữ thật trong `test.mjs`: 60 preset × 2 bộ cụm từ (bộ hiện có thuộc nhóm BĐS & quy hoạch), mỗi bộ trên một nền ảnh khác nhau (sông, phòng khách, công viên, phòng ngủ, bản đồ, người nói, mặt bằng…). Đo nền dưới khối chữ → `contrastPlan`. Tự xuống dòng khi chữ quá dài; dừng nếu chữ tràn khung, khối vẫn phải thu dưới 65 %, hoặc hai dòng liền kề chạm nhau (trừ chữ ký và dòng chồng có chủ đích `z`). Font đã kiểm đủ glyph cho mọi ký tự trong bộ thử (² – · “ … ¿ và toàn bộ dấu tiếng Việt).

Đối chiếu với mẫu (`tools/compare.mjs`) — bài học:
- **Chỉ đo trên khung cuối ổn định** (chênh lệch điểm ảnh giữa các khung liên tiếp ≈ 0): trang 1–4 của video tĩnh ở 2,40 · 5,30 · 7,60 · 11,50 s; video diễn hoạt lấy khung cuối của từng đoạn. Chụp giữa lúc diễn hoạt cho màu sai (đang đổi màu), vị trí sai (chữ đang bay), thiếu chữ, và hiệu ứng tưởng là trạng thái cuối (Cẩn Thận: gạch đỏ tắt hẳn ở khung cuối; Capcut: phủ kín xanh, nửa trắng chỉ là lúc màu đang dâng).
- Màu chữ chính đo theo mặt cắt ngang và dọc: hầu hết là gradient ngang mép đậm – giữa sáng, không phải gradient dọc.
- Chữ ký Great Vibes phải 0,8–1,4 lần cỡ dòng chính mới cân như mẫu.
- Cụm tô nền / hộp phải chừa đáy cho dấu nặng (Ạ, Ị), nếu không dấu chấm lọt ra ngoài hộp trông như lỗi chính tả.
- Số Playfair bật `lining-nums`; số "1" nghiêng dùng Barlow Condensed (Montserrat nghiêng nhìn thành "7").

## 6. Bảng tra 60 preset

Ảnh tra nhanh: `catalog/trang-1.jpg` … `trang-7.jpg`, `catalog/bo-moi-tren-video.jpg`.


| # | Bộ | Nhóm | id | Mẫu | Font | Diễn hoạt (theo dòng) | Trang trí | Dùng cho |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mẫu | BĐS & quy hoạch | `bds-dang-song` | Bất động sản / Đáng sống | Anton + Great Vibes | spread → wipe | — | Tiêu đề lửa + chữ ký: mở video, chủ đề lớn |
| 2 | mẫu | Chung | `koki-select` | TÊN KÊNH (khung chọn) | Barlow Cond 800 | box | handles, hộp | Tên thương hiệu/kênh trong khung xanh có tay nắm như phần mềm thiết kế |
| 3 | mẫu | Chung | `am-thuc-4-mua` | Ẩm Thực / 4 mùa | Anton + Great Vibes | rise → wipe | — | Chữ trắng tan dần xuống + chữ ký vàng: ẩm thực, phong cách sống |
| 4 | mẫu | BĐS & quy hoạch | `can-ho-cao-cap` | CĂN HỘ CAO CẤP / Nâng tầm cuộc sống | Anton + Playfair 500 | type → rise | — | Tên sản phẩm neon xanh + slogan serif |
| 5 | mẫu | Chung | `capcut-mobile` | CAPCUT / Mobile | Montserrat 900 + Great Vibes | blur → wipe | — | Chữ trắng phát sáng + chữ ký neon xanh lá chéo góc |
| 6 | mẫu | Chung | `khoa-hoc` | Khóa Học | Montserrat 900 | type | — | Một cụm vàng neon đậm: nhấn từ khóa đơn |
| 7 | mẫu | Chung | `danh-thuc` | Tinh hoa / Đánh Thức / vị giác | Great Vibes + Montserrat 800 | wipe → type → wipe | — | Ba tầng: chữ ký – chữ đậm cam đào – chữ ký |
| 8 | mẫu | Chung | `can-than` | Cẩn Thận (gạch đỏ) | Montserrat 800 | type | strike | Cảnh báo, sai lầm: chữ hồng nhạt có nét gạch đỏ |
| 9 | mẫu | Chung | `tiet-kiem-50` | Tiết kiệm / 50 TRIỆU | Great Vibes + Montserrat 900 | wipe → type | — | Con số tiền: chữ ký + số trắng-xanh phát sáng |
| 10 | mẫu | Chung | `tang-cao` | Tăng cao | Montserrat 900 | pop | — | Xu hướng tăng, nhấn mạnh: hồng neon |
| 11 | mẫu | Chung | `capcut-split` | Capcut (hai tông) | Montserrat 900 | blur | — | Từ khóa trắng – nửa dưới xanh, thương hiệu trẻ |
| 12 | mẫu | Chung | `dang-ky` | Đăng Ký / Ngay hôm nay | Montserrat 900 + Great Vibes | type → wipe | — | Kêu gọi hành động: xanh lá + chữ ký |
| 13 | mẫu | Chung | `viral-edit` | Viral Edit (serif) | Playfair 500 | rise | — | Tiêu đề thanh lịch, ít màu |
| 14 | mẫu | Chung | `thay-doi` | Thay đổi màu sắc | Be Vietnam Pro 500 | type | — | Câu ngắn chữ thường đỏ cam |
| 15 | mẫu | Chung | `bi-quyet` | ¿Bí quyết? | Montserrat 800 | pop | — | Câu hỏi, bí mật: tím, dấu hỏi hai đầu |
| 16 | mẫu | BĐS & quy hoạch | `tim-dung-can-ho` | Tìm đúng / CĂN HỘ / phù hợp | Playfair 500 + Anton | rise → drop → rise | — | Ba tầng serif – chữ đặc tím – serif |
| 17 | mẫu | Chung | `co-hoi-dau-tu` | Cơ hội / Đầu Tư / Sinh lời | Great Vibes + Anton | wipe → drop → wipe | — | Đầu tư, lợi nhuận: chữ ký + đỏ trắng + chữ ký |
| 18 | mẫu | Chung | `ban-than` | phát triển / Bản Thân | Be Vietnam Pro 300 + Lexend 600 | type → type | — | Chữ thường mảnh + chữ tròn xanh ngọc |
| 19 | mẫu | Chung | `hien-dai` | Phong cách sống / Hiện Đại / Do bạn chọn | Playfair 500 + Montserrat 800 | rise → type → rise | — | Ba tầng serif – vàng cam – serif |
| 20 | mẫu | Chung | `dau-tu-sinh-loi` | Đầu tư / Sinh lời (trắng-hồng) | Montserrat 900 + Playfair 500 | blur → rise | — | Chữ trắng rất đậm + serif hồng |
| 21 | mẫu | BĐS & quy hoạch | `noi-bat` | Tiện ích / Nổi Bật | Playfair 500 + Be Vietnam Pro 800 | rise → drop | — | Serif nhỏ + chữ đậm xanh bạc hà, sát chữ |
| 22 | mẫu | Chung | `edit-video` | Kỹ năng / Edit Video / thứ bạn cần có | Great Vibes + Anton + Be Vietnam Pro 500 | wipe → drop → type | — | Chữ ký – chữ đặc xanh dương – chữ nhỏ |
| 23 | mẫu | Chung | `comment-khoa-hoc` | Comment / "Khóa học" | Playfair 500 + Montserrat 800 | rise → type | — | Kêu gọi bình luận từ khóa: serif + xanh trong ngoặc kép |
| 24 | mẫu | Chung | `phu-hop` | Phù Hợp / với mọi khách hàng | Playfair 700 + Playfair nghiêng | type → rise | — | Serif đậm hồng-tím + serif nghiêng |
| 25 | mẫu | Chung | `dang-goi` | TÊN KÊNH / is calling… | Barlow Cond 800 + Be Vietnam Pro 600 + ô cuộc gọi | type → fade → slide | — | Giao diện cuộc gọi đến: gây tò mò, mở đầu |
| 26 | mẫu | Chung | `comment-bao-gia` | Comment / "Báo Giá" | Great Vibes + Montserrat 900 | wipe → drop | — | Kêu gọi bình luận: chữ ký + vàng chanh trong ngoặc |
| 27 | mẫu | Chung | `sedan-hang-c` | SEDAN [HẠNG C] / Sang trọng | Barlow Cond 800 + Playfair nghiêng | slide → wipe | tô nền cụm, thanh dọc | Thông số có cụm tô nền xanh, thanh dọc bên trái |
| 28 | mẫu | Chung | `style-sub` | Style Capcut (chú thích nhỏ) | Be Vietnam Pro 800 + Playfair 500 | type → fade | — | Từ khóa xanh lá kèm 3 chú thích nhỏ phía dưới |
| 29 | mẫu | BĐS & quy hoạch | `tham-quan-can-ho` | Tham quan / Căn Hộ | Great Vibes + Anton | wipe → drop | — | Chữ ký + chữ đặc vàng chanh: lời mời |
| 30 | mẫu | BĐS & quy hoạch | `khong-gian-song` | Sở hữu / Không Gian Sống / đẳng cấp cho [Bạn] | Great Vibes + Be Vietnam Pro 800 | wipe → type → fade | tô nền cụm | Ba tầng, chữ cuối trong ô viền đỏ |
| 31 | mẫu | Chung | `co-hoi-ngay` | Hãy nắm bắt / Cơ hội / Ngay bây giờ | Great Vibes + Playfair 500 + Be Vietnam Pro 300 | wipe → type → type | — | Serif lớn vàng chanh giữa chữ ký và chữ nhỏ |
| 32 | mẫu | BĐS & quy hoạch | `vi-tri` | Vị Trí / trung tâm đắc địa | Barlow Cond 800 nghiêng + Playfair 500 | box → rise | hộp | Chữ nghiêng trắng trong hộp vàng kim + serif: vị trí, thông số |
| 33 | mẫu | BĐS & quy hoạch | `khong-gian-xanh` | Không Gian / (xanh) | Barlow Cond 800 nghiêng + Playfair 500 | pop → pop → fade | ellipse | Chữ nghiêng xanh lá bậc thang + chữ serif trong elip |
| 34 | mẫu | Chung | `chinh-sua` | dễ dàng / Chỉnh Sửa | Montserrat 900 | type → type | — | Hai dòng đậm chồng sát: trắng xám + bạc hà |
| 35 | mẫu | Chung | `an-toan` | Trải nghiệm / An Toàn | Playfair 500 + Anton | rise → type | — | Serif + chữ đặc xanh ngọc-dương |
| 36 | mẫu | Chung | `100-trieu` | trị giá / 100 Triệu / đồng | Be Vietnam Pro 300 + Montserrat 900 + Playfair 500 | type → type → rise | swoosh | Giá trị tiền: chữ tròn xanh lá + nét gạch cong + serif |
| 37 | mẫu | Chung | `5-hieu-ung` | 5 / Hiệu ứng có sẵn / [hộp] | Playfair 500 + Barlow Cond 800 | type → rise → box | số lớn, hộp viền | Số lớn serif + chữ hai dòng + nhãn trong hộp viền |
| 38 | mẫu | Chung | `dong-xe-suv` | Đừng mua / Dòng xe SUV / nếu bạn chưa biết gì | Great Vibes + Be Vietnam Pro 800 + Be Vietnam Pro 300 | wipe → type → type → wipe | — | Cảnh báo/khơi tò mò: chữ ký – xanh đậm – chữ nhỏ + chữ ký |
| 39 | mẫu | BĐS & quy hoạch | `1-can-ho` | 1 / Căn Hộ / Đáng sống | Anton + Great Vibes | type → wipe | số lớn, swoosh | Số thứ tự rất lớn nghiêng + tên + chữ ký + nét cong |
| 40 | mẫu | Chung | `tai-sao` | Tại sao? / [Edit video] / lại cần thiết | Be Vietnam Pro 300 + Playfair 500 + Great Vibes | type → box → wipe → wipe | hộp | Câu hỏi: chữ nhỏ + cụm trong hộp đỏ + chữ ký |
| 41 | A | Chung | `a-hook` | A1 · Mở đầu: chữ ký / KEY khổng lồ / chữ ký | Great Vibes + Anton | wipe → spread → wipe | — | Câu hook: tên dự án, chủ đề lớn |
| 42 | A | Chung | `a-number` | A2 · Con số: chữ ký / SỐ đếm lên / nét cong | Great Vibes + Anton | wipe → blur | swoosh, số đếm | Giá, diện tích, số lượng |
| 43 | A | Chung | `a-label` | A3 · Nhãn: KEY trong hộp màu / chữ ký | Anton + Great Vibes | box → wipe | hộp | Vị trí, tiện ích, ưu đãi đóng khung |
| 44 | A | Chung | `a-compare` | A4 · Đối chiếu: giá cũ gạch / CÒN giá mới | Great Vibes + Anton | wipe → rise → drop | strike | Trước – sau, giá cũ – giá mới, cắt lỗ |
| 45 | A | Chung | `a-cta` | A5 · Kêu gọi: chữ ký / KEY trong hộp viền | Great Vibes + Anton | wipe → box | hộp viền | CTA cuối video: nhắn tin, đăng ký, nhận báo giá |
| 46 | B | Chung | `b-title` | B1 · Tiêu đề: chữ ký / Serif lớn / nghiêng | Great Vibes + Playfair 700 + Playfair nghiêng | wipe → type → rise | — | Mở đầu sang trọng, tên khu, tên căn |
| 47 | B | Chung | `b-quote` | B2 · Trích dẫn: ngoặc lớn / câu nghiêng / chữ ký tên | Playfair 700 + Playfair nghiêng + Great Vibes | pop → rise → rise → wipe | — | Câu nói của người dẫn, cảm nhận khách hàng |
| 48 | B | Chung | `b-number` | B3 · Số sang: — SỐ — / nghiêng | Playfair 700 + Playfair nghiêng | blur → rise | rules, số đếm | Diện tích, số phòng, năm bàn giao |
| 49 | B | Chung | `b-location` | B4 · Địa danh: — CHỮ GIÃN — / chữ ký | Playfair 500 + Great Vibes | spread → wipe | rules | Vị trí, khu vực, tên dự án nhỏ gọn |
| 50 | B | Chung | `b-list` | B5 · Danh sách: ✓ dòng nghiêng × 3 | Playfair nghiêng | slide → slide → slide | check | Liệt kê quyền lợi, tiện ích, điều kiện |
| 51 | C | Chung | `c-hook` | C1 · Hook hai tông + câu phụ | Montserrat 900 + Be Vietnam Pro 600 | blur → type | hai tông | Câu hỏi gây chú ý ở 3 giây đầu |
| 52 | C | Chung | `c-marker` | C2 · Câu có từ được tô bút dạ | Be Vietnam Pro 600 + Montserrat 900 | type → pop | marker | Câu ngắn có 1 cụm cần nhấn |
| 53 | C | Chung | `c-tag` | C3 · Thẻ giảm giá có khấc + chữ phụ | Montserrat 900 + Be Vietnam Pro 600 | box → type | thẻ khấc | Chiết khấu, khuyến mãi, quà tặng |
| 54 | C | Chung | `c-step` | C4 · Bước: số thứ tự lớn / tiêu đề / phụ | Montserrat 900 + Be Vietnam Pro 600 | type → type | số lớn | Các bước thanh toán, lý do 1-2-3 |
| 55 | C | Chung | `c-alert` | C5 · Cảnh báo: nhãn / KEY gạch / sửa lại | Be Vietnam Pro 800 + Montserrat 900 | box → type → pop | hộp, strike | Hiểu lầm cần sửa, sai lầm thường gặp |
| 56 | D | Chung | `d-spec` | D1 · Thông số: thanh dọc / NHÃN [GIÁ TRỊ] / phụ | Barlow Cond 800 + Be Vietnam Pro 600 | slide → type | tô nền cụm, thanh dọc | Diện tích, hướng, tầng, tiến độ |
| 57 | D | Chung | `d-select` | D2 · Khung chọn + chú thích | Barlow Cond 800 + Be Vietnam Pro 600 | box → type | handles, hộp | Gắn tên cho vật trên hình (khung chọn có tay nắm) |
| 58 | D | Chung | `d-counter` | D3 · Bộ đếm: — SỐ đếm — / chú thích | Barlow Cond 800 + Be Vietnam Pro 800 | blur → spread | rules, số đếm | Số căn đã bán, số khách, phần trăm |
| 59 | D | Chung | `d-lower` | D4 · Lower third: TÊN / chức danh | Barlow Cond 800 + Be Vietnam Pro 600 | slide → type | thanh dọc | Giới thiệu người nói ở góc dưới |
| 60 | D | Chung | `d-call` | D5 · Cuộc gọi đến (theo thương hiệu) | Barlow Cond 800 + Be Vietnam Pro 600 + ô cuộc gọi | type → fade → slide | — | Mở đầu gây tò mò, gợi ý gọi hotline |
