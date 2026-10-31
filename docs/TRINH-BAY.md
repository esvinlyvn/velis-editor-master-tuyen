# Trình bày video: hook, minh họa, bố cục, kiểm

Phần này học từ AI MASTER (repo master-video). Nguồn gồm 03-HOOK V2.0, 06-EXPLAINER V2.1, 05-QA và 09-HOUSE-RULES V2.4: đây là các luật người làm AI MASTER chốt qua hàng chục video talking-head thật. Ở đây chúng được chuyển sang HyperFrames và video BĐS. Bộ công cụ chữ vẫn là của bds-editor (preset, chữ sau người, lớp tối…). Các luật trong file này lo phần **hình**: hook, minh họa, vị trí đồ họa.

Thứ tự ưu tiên giữ như `docs/VAN-HANH.md` mục 1: bảng luật đã chốt trong `TALKING-HEAD.md` vẫn thắng file này.

## 1. Hook 3 giây đầu

Người dùng AI MASTER coi đây là phần quan trọng nhất của video.

**Nguyên tắc**
- Chọn hook theo **góc tâm lý của câu mở**, không theo ngành. BĐS chỉ quyết định nội dung đổ vào hook: chữ, icon, con số, loại giấy tờ.
- **Phép thử tắt tiếng:** chỉ nhìn hook mà đoán được câu đang nói về gì. Không đoán được thì loại.
- Hook tốt nhất là hook **nối với cao trào** (đáp án, kết quả, tên được tiết lộ). Hook úp mở thì cuối video phải mở ra (bookend).
- Không dùng lại hook của video trước **cùng khách** nếu có phương án khác đủ tốt.

**Bảng góc → hook**

| Góc câu mở | Tín hiệu lời nói | Hook | Ví dụ BĐS | Bookend | SFX |
|---|---|---|---|---|---|
| Úp mở, tò mò | "có một…", "ít ai biết", "đoán xem", đáp án nói ở cuối | `mystery`: thẻ có đáp án bị làm mờ kèm dấu "?", lộ ở cao trào | quận nào, dự án nào, tầng nào view đẹp nhất | lộ đáp án (mờ → rõ) đúng lúc nói | `open` lúc thẻ hiện · `pop` lúc dấu "?" bật · `text-tick` khi lộ |
| Khẳng định mạnh, chứng nhận | "chắc chắn", "đã", "100%", tính từ mạnh | `stamp`: tờ giấy theo ngữ cảnh, con dấu từ khóa đập đúng lúc nói, rung khung | HỢP ĐỒNG MUA BÁN → ĐÃ CHỐT · SỔ HỒNG → CÓ SỔ · BIÊN BẢN BÀN GIAO → ĐÃ GIAO | — | `thock` đúng lúc dấu chạm |
| Phủ định nỗi đau | "không cần", "khỏi", liệt kê điều khó chịu | `strike`: 2–3 thẻ nỗi đau chuyển sang trạng thái bị loại khi nói tới giải pháp | khỏi kẹt xe · không lo pháp lý · không phí ẩn | — | `click` mỗi thẻ bị loại |
| Con số, tiền, thời gian | số, tỷ, triệu, %, năm | `number`: số chạy từ 0, chạm đích đúng lúc nói số | 3,2 TỶ · 30% · 5 NĂM | nhắc lại số ở phần kết | `meter` lúc bắt đầu chạy · `text-tick` lúc chạm đích |
| Câu hỏi, lựa chọn | "… hay …?", "nên chọn" | `question`: thẻ câu hỏi + 2–3 lựa chọn, đáp án sáng đúng lúc nói (hoặc để ngỏ) | thuê hay mua · căn góc hay căn giữa | đáp án sáng khi người nói trả lời | `click` mỗi lựa chọn · `open` khi chọn |
| Đối lập, trước–sau | "thay vì", "khác với", "đừng… hãy" | `versus`: 2 thẻ + VS, bên thua xám kèm dấu X **đỏ**, bên thắng sáng | thuê vs mua · gửi tiết kiệm vs mua đất | bên thắng xuất hiện lại ở kết luận | `pop` lúc VS bật · `thock` lúc chốt bên thắng |
| Tên dự án, chủ đề lớn, không góc nào ở trên | — | `title`: tên dự án lớn, có thể đặt sau người (luật 11) | SUNRISE · GREEN CITY | — | theo preset |

**Nhịp bên trong hook (PHONG-CACH-ME4REAL H, áp cho mọi loại hook):** khung 0 đã chuyển động → giây 0,9–1,2 icon hoặc sticker bật (vượt ~110% rồi về) → giây ~1,5 từ khóa đỉnh → cụm cũ tan bằng mờ + nhòe 0,15 s khi sang từ khóa kế. Âm: công thức `bung-mo` (tiếng dâng chạy trước, tiếng chốt đúng `hook_peak` trong `plan.json`), tối đa 4–5 lớp tiếng trong 3 s đầu. Câu mở dạng "10 năm trước…", "ngày xưa…" dùng `title` với chữ dẫn là mốc thời gian.

Với `strike`: theo luật house-rules số 9, **không dùng nét gạch chéo nghiêng**. "Bị loại" thể hiện bằng đổi trạng thái sạch: viền thẻ đổi màu, hiện ô cấm đỏ, chữ mờ đi.

**Quy trình**
1. Đọc lời 3 giây đầu và toàn bộ lời. Ghi ra: câu mở; từ khóa đỉnh và giây nói (`peak`); cao trào hoặc đáp án và giây nói (`payoff`).
2. Xác định góc câu mở (một câu có thể có 2–3 góc).
3. Viết `projects/<video>/hook.json` với **ít nhất 3 phương án**. Chấm mỗi phương án 1–5 điểm theo 4 tiêu chí:
   - `fit` (35%): tắt tiếng vẫn hiểu. Dưới 3 điểm thì loại.
   - `payoff` (25%): có bookend.
   - `motion` (20%): có chuyển động từ khung đầu tiên, đỉnh rơi đúng từ khóa.
   - `space` (20%): nằm ở vùng trống, không che mặt.
4. Chạy `node scripts/hook-pick.mjs projects/<video>/hook.json`. Script xếp hạng, trừ điểm nếu lặp hook của khách: −25 video trước, −15 video trước nữa, −8 video thứ ba.
5. Script báo **sát điểm** (cách nhau ≤ 6) thì dựng 2 bản xem trước 3 giây, gửi người dùng chọn rồi mới dựng tiếp. Không sát điểm thì dùng luôn phương án thắng.
6. Giao xong: `hook-pick.mjs … --commit [id]` để ghi lịch sử theo khách.

**Thời điểm và vị trí**
- Có chuyển động ngay từ khung 0 (clip vào bằng punch-out, hook vào bằng lò xo).
- Từ khóa đỉnh rơi trong khoảng 1,5 giây đầu.
- Hook nằm dưới khối chữ chốt hoặc ở vùng trống; mép hook cách đỉnh đầu ít nhất 20 px. Không đè mặt, không đè miệng.
- Nội dung hook lấy **từ chính lời nói**, rút gọn còn 1–4 chữ, không bịa ý mới.

**Dựng:** các hook dựng bằng HTML + GSAP trong `text-presets/hooks/`, theo đúng quy ước của bộ BĐS: không đặt transform trong CSS, `fromTo` ghi rõ đích, không dùng `onUpdate`, số đếm dựng sẵn từng bước. Lần đầu dùng hook nào thì dựng hook đó, kèm một trang xem thử như `text-presets/bds/gallery.html`. Thêm hook mới thì cập nhật bảng trên và danh sách id trong `hook-pick.mjs`.

## 2. Minh họa: nói gì vẽ nấy

**Nguyên tắc**
- Mỗi ý trong lời nói có một hình đúng nghĩa trên màn hình: sơ đồ, đồ vật, ô icon, ảnh thật, bản đồ. Không chỉ có chữ. Giữ một hình cho trọn một ý.
- **Tắt tiếng mà vẫn hiểu đại ý** của cả video.
- Mật độ:
  - **ít nhất 70% thời lượng có hình minh họa**, gồm cả đồ họa đặt trên cảnh người nói;
  - trong đó khoảng 45–55% thời lượng không thấy rõ mặt: nền mờ hoặc toàn màn (HAU-KY quy tắc 4).

  Clip thiếu tư liệu thì ưu tiên đồ họa đặt trên cảnh người nói và bản đồ.
- **Ý phủ định dùng màu đỏ** (đỏ sáng vừa phải): "không nên", ô cấm, dấu X, rủi ro. Không dùng màu thương hiệu cho ý phủ định.
- **Icon đúng chủ thể:** nói "hồ bơi" thì icon hồ bơi, nói "sổ hồng" thì hình cuốn sổ; không thay bằng icon chung chung.
- **Tên riêng** (dự án, chủ đầu tư, địa danh): dùng **ảnh thật** do khách gửi hoặc ảnh brochure, đặt trong thẻ ảnh có viền. Không có ảnh thì dùng bản đồ (`MAP.md`) hoặc thẻ chữ. Không tự lấy ảnh không có quyền dùng.
- **Chữ theo nghĩa, không theo lỗi nghe máy:** sửa lại cho đúng ý người nói, nhưng mốc thời gian vẫn bám theo lời.

**Bảng chọn minh họa cho BĐS**

| Lời nói về… | Minh họa |
|---|---|
| Giá, khoảng giá ("từ 2,8 tới 3,5 tỷ") | thanh khoảng: thanh chạy, đoạn giá tô màu nhấn |
| Tiến độ thanh toán, các đợt | dòng mốc: các đợt hiện lần lượt, đợt đang nói sáng lên |
| Quy trình mua: đặt cọc → ký HĐ → nhận nhà | các nút nối bằng nét đứt, nút sau màu nhấn |
| Vị trí, khoảng cách, "cách trung tâm 15 phút" | bản đồ (`MAP.md`): ghim, tuyến đường, nhãn thời gian |
| Liệt kê tiện ích, lý do (2–5 ý) | thẻ xếp chồng, mỗi thẻ hiện đúng lúc nói, có icon đúng chủ thể |
| Thông số căn (diện tích, phòng ngủ, hướng, tầng) | thẻ thông số, hoặc preset `d-spec`, `ky-thuat` |
| Pháp lý, giấy tờ | tờ giấy mô phỏng + con dấu hoặc nhãn trạng thái (`nhan-neon`) |
| So sánh hai lựa chọn | cặp thẻ: bên thua xám, bên thắng sáng |
| Điều không nên, rủi ro | thẻ đổi viền đỏ + ô cấm + chữ mờ + nhãn "Không nên". Không dùng gạch chéo |
| Con số lặp lại, "gấp đôi" | huy hiệu tròn "×2" màu nhấn |
| Tăng giá, tăng trưởng | biểu đồ cột hoặc đường mọc lên (preset `tang-truong`) |
| Kêu gọi cuối video | 1–2 thẻ CTA theo `brand.json`, kèm icon nhắn tin |

**Bố cục**
- **Không bao giờ đặt icon, thẻ, hiệu ứng lên mặt**, kể cả tóc và trán. Đo vị trí mặt theo thời gian, vì người nói cúi hay nghiêng làm mặt tụt xuống; tính cả lúc punch-in.
- **Đồ họa trên cảnh người nói nằm dưới khối chữ chốt** (vùng ngực, tay; khoảng y 1110–1650 trên khung 1080×1920), gom gọn ngay dưới chữ (khoảng 1150–1350). Không đẩy sát đáy khung. Hai vật tranh chỗ thì gộp cùng hàng, không xếp thêm tầng.
- **Cảnh nền tối** (toàn màn): đồ họa ở y 240–880.
- **Người nói đang đọc kịch bản** (mắt nhìn xuống, không nhìn máy): bỏ hình người ở đoạn đó, thay bằng nền tối có minh họa; nền phải phủ kín trước khung đọc đầu tiên. Giọng vẫn chạy liền.
- **Khách đã có dải phụ đề cố định:** không vật nào chạm dải đó.
- **Không tách cụm từ tiếng Việt qua hai dòng** ("CHUYÊN / NGHIỆP" là sai): khóa cụm bằng `white-space: nowrap`.

**Chuyển động**
- Mượt, có sức sống: lò xo, nhòe chuyển động, thoát có ease. Không pop cứng 4–7 khung.
- Lớp tối không bao giờ bật cứng: mờ vào, mờ ra khi đổi cảnh. Luật 13 của TALKING-HEAD vẫn giữ.

**Chế độ êm**

Khách dặn "ít hiệu ứng", "không phụ đề", hoặc video hướng dẫn hay demo màn hình:
- không có khung nhấn hay thẻ liệt kê giữa khung;
- chỉ một nhãn nhỏ ở mép trên;
- chữ chốt vẫn theo luật nhưng thưa hơn.

**Minh họa bổ sung (PHONG-CACH-ME4REAL C5, I):**

| Lời nói | Vẽ gì | Ghi chú |
| --- | --- | --- |
| Diện tích lô, khu đất | Viền nét đứt vàng bám quanh lô trên ảnh vệ tinh / drone + nhãn diện tích | Viền vẽ dần 0,6–0,8 s, tiếng `line-draw` |
| Thông số (tầng, hầm, số căn) | Pill màu xếp dọc cạnh tòa nhà ("31 TẦNG NỔI", "3 TẦNG HẦM") | Mỗi pill một tiếng nhỏ, cách nhau 0,25 s |
| "Dự án này", chỉ vào công trình trên render | Tô sáng (glow vàng) đúng tòa nhà của dự án | Chỉ trên render / sa bàn, không trên cảnh người |
| Liệt kê tiện ích có ảnh | Lưới ảnh 3×2 (hoặc 3 ảnh dọc), đổi bộ theo phách nếu có nhạc | Ảnh lấy từ `info/`, có quyền dùng |
| Dẫn nguồn báo chí, quy hoạch | Ảnh chụp bài báo đặt nghiêng, phóng tới tiêu đề | Ghi nguồn vào `NOTES.md`; không dùng nếu không có trong `info/` |

## 3. Kiểm bổ sung

Thêm vào TALKING-HEAD mục 6 và VAN-HANH mục 8:
1. **Vùng chữ quét mỗi 2 khung** suốt video: không chữ bị xén (O, móc Ư/Ơ, dấu ngã, dấu nặng), không mất nét, không đè nhau.
2. **Mọi chuyển cảnh**, xem từ 5 khung trước tới 5 khung sau: có nhòe, không giật, không có khung đen.
3. **Mọi lúc vào/ra** của thẻ, icon, nhãn: icon nằm trọn trong khung, lề đều, không đè viền.
4. **Miệng:** không khung nào bị đồ họa che miệng. Khung mặt tính từ đỉnh đầu tới vai.
5. **Hook:** có chuyển động ngay khung đầu, đạt phép thử tắt tiếng, bookend (nếu có) lộ đúng lúc nói.
6. **Mật độ minh họa:** tổng thời lượng có hình minh họa ≥ 70%. Ghi con số này vào NOTES.
7. **Âm lượng:** `ffmpeg -i output.mp4 -af loudnorm=print_format=summary -f null -` cho −14 LUFS ±0,5, true peak ≤ −1,4 dBTP.
8. **SFX:** mỗi khối chữ một tiếng, mỗi dòng của cụm `cao-trao` một tiếng nhỏ (luật 10, 17; quyết định M1); cú cắt thường trong clip không tiếng, chỉ chuyển cảnh lớn mới có; không lặp loại tiếng trong 30 s; mỗi SFX ghi `why` đúng sự kiện (`build/<video>/blocks.json`).

## 4. Giao

Gửi video hoàn chỉnh kèm 2–3 dòng: thời lượng, hook dùng kiểu nào, bao nhiêu SFX, % minh họa, chỗ nào người dùng nên xem kỹ. Không gửi ảnh duyệt, trừ khi người dùng hỏi.
