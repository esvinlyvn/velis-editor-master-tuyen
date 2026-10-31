# SHOTS: phương pháp cú máy và thư viện thẻ chuyển động

File này nói **cách chọn và sắp từng cú máy theo lời voice** để video không thành "slide PowerPoint có tiếng". Với clip quay thật, SHOTBOOK viết theo `docs/VAN-HANH.md` mục 3; phần chuyển động camera chỉ áp cho cảnh minh họa, không áp cho cảnh quay thật. Khi file này vênh với `TALKING-HEAD.md` hoặc `docs/VAN-HANH.md`, hai file kia thắng.

Nguồn: rút từ [video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) (commit a7c29ed), phương pháp và 42 thẻ chuyển động. Thẻ gốc tiếng Trung để nguyên trong `docs/shots/cards/`, demo HTML + GSAP chạy được trong `docs/shots/demos/<tên>/index.html`. Giấy phép xem mục cuối.

---

## 1. Bốn bệnh "PPT" cần tự soát

1. **Không có camera.** Cảnh đứng im, đồ vật chỉ mờ vào trượt vào trên một sân khấu cố định. Cách chữa: mỗi bối cảnh có một đường camera rất chậm, đẩy vào `scale 1.00 → 1.04–1.06` (mặc định) hoặc kéo ra `1.06 → 1.00` (khi muốn lắng, nguội, khép lại), chạy suốt bối cảnh.
2. **Vào xong là chết.** Mọi animation chỉ là "hiện ra rồi đứng". Sự sống của khung hình do camera trôi chậm gánh, không bắt từng món đồ tự rung lắc.
3. **Đổi cảnh như lật trang.** Mỗi ranh giới giữa hai bối cảnh phải có cách chuyển có chủ đích (mục 5). Cắt trơn là lỗi.
4. **Bày chữ như tài liệu, chỉ vào không ra.** Một nhịp chỉ có một nhân vật chính; nói xong thì nhường chỗ. Không để tới cuối video màn hình chất đầy đồ.

Chuẩn nghiệm thu máy: không có đoạn nào **đứng im hoàn toàn từ 0,8 giây trở lên** (mục 7).

## 2. Một nhịp, một chủ thể, rồi nhường chỗ

- Mỗi nhịp lời có đúng **một chủ thể**. Đồ vật khác chỉ được ở lại nếu đang phối hợp với chủ thể đó.
- Chủ thể mới vào thì chủ thể cũ nhường, bắt đầu khoảng 0,2 giây trước mốc vào của chủ thể mới. Có ba cách nhường, chọn theo câu "món này còn quay lại không":
  - **Thoát hẳn** (0,15–0,5 giây rồi biến khỏi khung): nói xong không nhắc lại nữa. Ưu tiên cách này.
  - **Lùi xuống** (thu 0,92, nhích lên, tối đi khoảng 2/3, mờ nhẹ 3px): sắp được so lại hay nhắc lại. Món lùi xuống **vẫn chiếm chỗ và vẫn tính vào ngân sách** ở mục 4; không đặt món mới đè vào vị trí của nó.
  - **Camera rời đi**: trong cảnh "thế giới" dài (long-take), camera lia sang chỗ khác là đã nhường.
- Vật đang ở yên thì đứng yên thật, không rung, không nhịp thở. Chuyển động *thuộc về nội dung* thì giữ (số đang chạy, tiền đang chảy, xe đang chạy).

## 3. SHOTBOOK: viết kịch bản cú máy trước khi viết template

Trước khi đụng vào `template.html`, viết `projects/<video>/SHOTBOOK.md` từ lời người nói (mốc lời trong `transcript.json`) và cảnh quay có sẵn.

**3.1 Bảng nhịp bố cục toàn video** (đặt đầu file, để thấy cả video có bị "tám cảnh một kiểu" không):

| Bối cảnh | Mốc | Người nói ở đâu | Kiểu chứa nội dung | Thẻ chính |
|---|---|---|---|---|
| B1 | @0–@7 | vắng | toàn khung | number-slab-pop |
| B2 | @8–@15 | góc dưới phải | bản đồ | map-route-pin |

Từ vựng "Người nói ở đâu": vắng (cảnh dự án) / giữa / lệch trái / lệch phải / khung nhỏ. "Kiểu chứa": toàn khung / thẻ có khung / chia đôi / nhiều món sắp xếp / bản đồ / màn điện thoại / tờ giấy.

**3.2 Mỗi bối cảnh** ghi:
- Một câu ý đồ ("con số 20 phút bị kéo dài ra theo từng tòa nhà").
- Đường tiếp sức chủ thể: ai nhường cho ai.
- Bảng nhịp:

| Mốc lời | Lớp | Đối tượng | Động tác | Phối hợp với ai |
|---|---|---|---|---|
| @12:"hai mươi phút" | chủ thể | tờ rơi | number-slab-pop | — |
| @14:"sai dần" | chủ thể | con số | strike-and-replace 20→70 | thay tờ rơi |

Dòng nào không trả lời được cột "phối hợp với ai" thì xóa dòng đó.
- Hướng camera (đẩy hay kéo, scale đầu cuối) và cách chuyển ra khỏi bối cảnh (mục 5).

Cuối SHOTBOOK có mục **"Chưa làm được"**: chỗ nào của bảng HÌNH ẢNH không dựng nổi thì ghi lý do và cách thay. Mục này để báo cho người dùng; nếu không có gì thì ghi "không có", nhưng không được bỏ mục.

## 4. Ngân sách bố cục (chống rối)

1. **Chia bối cảnh theo đoạn ý**, không cắt máy móc một câu một cảnh. Mỗi bối cảnh có một việc chính: mở / định nghĩa / số liệu / quy trình / so sánh / cú lật / kết.
2. **Câu xoay chiều thuộc về cảnh sau.** Câu kiểu "Có điều…", "Ai dè…", "Hổng phải" là nhịp đầu của bối cảnh mới: dọn cảnh cũ trước, rồi mới mở cú lật trên một sân khấu sạch.
3. **Cùng lúc tối đa 3 nhóm chủ thể** (tính cả món đang lùi xuống; chữ chốt và người nói không tính). Nhóm thứ 4 muốn vào thì phải có một nhóm thoát hẳn.
4. **Luôn chừa ít nhất một góc trống.** Bốn góc và dải giữa đều kín là rối.
5. **Một màn một "hero".** Nhiều con số hay chữ lớn cùng lúc thì chỉ một cái được làm to, tô màu, có khối nền; còn lại là chữ nhỏ.
6. **Chữ trên hình không chép voice**: tối đa khoảng 12 chữ; chữ chốt vẫn theo `TALKING-HEAD.md` luật 1 (2–5 chữ).
7. **Đổi bố cục 2–4 lần mỗi phút.** Đổi khi có ý mới, số liệu mới, so sánh, kết luận; không đổi chỉ vì hết một câu.
8. **Ba bước không chồng nhau:** món cũ thoát hẳn → chủ thể mới vào → chữ hay nhãn mới hiện.
9. **Luân phiên:** một thẻ trình bày không dùng 3 bối cảnh liền, và không chiếm quá 1/3 video. Cột "Người nói ở đâu" và "Kiểu chứa" không được giống nhau 3 bối cảnh liền.

## 5. Chuyển giữa các bối cảnh

Mỗi ranh giới chọn **một** cách, ghi rõ trong SHOTBOOK. Hai cảnh chồng lên nhau khoảng 0,4–0,5 giây, chuyển động hai bên **cùng chiều**.

| Cách | Khi dùng | Thẻ |
|---|---|---|
| Lia trong thế giới dài | cảnh có không gian, lộ trình, dòng thời gian (cổng → đường nội khu → tòa nhà). Đây là cách mặc định cho cảnh minh họa | long-take-world |
| Đẩy xuyên | đi sâu vào chi tiết, "nhìn kỹ thì…" | push-through-transition |
| Lia giật (whip) | đổi chỗ, đổi phe, "còn bên kia thì…" | whip-pan-transition |
| Mảng màu quét | sang chương mới, nhịp nhanh | shape-wipe-transition |
| Đường kẻ kéo đi | nét gạch chân của cảnh trước chạy ra thành khung cảnh sau. **Mỗi video tối đa 1 lần**, làm dấu ấn | line-carry-transition |
| Đập màu nền | câu đắt, cú chốt bằng chữ | color-slam-beat-card |
| Đen đập | **chỉ 1 lần mỗi video**, dành cho cú lật lớn nhất | black-slam-transition |

Một video khoảng 60 giây có 3–5 ranh giới. Lặp một cách cho cả video vẫn đẹp hơn mỗi ranh giới một kiểu.

## 6. Bảng tra: lời voice nói gì → dùng thẻ nào

Mỗi thẻ là một công thức đã chỉnh kỹ: các pha theo thời gian, thông số, lỗi đã gặp, gợi ý SFX. Đọc thẻ trong `docs/shots/cards/<tên>.md`, mở demo `docs/shots/demos/<tên>/index.html` để xem chuyển động, rồi chép **thời lượng, ease và thứ tự pha** vào timeline GSAP của template (giây tuyệt đối theo mốc lời). Màu, font, kích thước lấy theo video, không lấy theo demo.

**Con số và dữ liệu**

| Voice nói | Thẻ | Ghi chú |
|---|---|---|
| Một con số quan trọng (giá, lương, %, số căn) | number-counter | chạy 1–1,5 giây, chậm dần, chạm đích thì nảy 1,08. Số dưới 10 thì bật ra luôn, đừng chạy |
| Con số mở đầu, con số gây sốc | number-slab-pop | khối màu rơi xuống trước, số bật sau |
| Con số kèm xu hướng tăng giảm | metric-with-sparkline | |
| So vài cột số (giá theo năm, theo khu) | chart-grow, bar-chart-growth | cột cao nhất sáng lên ở cuối |
| "Từ chỗ này, nếu… thì sẽ…" (dự phóng) | line-chart-story-draw | đoạn lịch sử có sẵn, đoạn giả định mới vẽ ra |
| Tỉ lệ "N trên 100 người" | unit-grid-proportion | trực quan hơn con số % trần |
| Nhiều nguồn dồn về một chỗ (dòng tiền, nhiều khoản cộng lại) | source-converge | |
| Thuật ngữ cần giải thích (thông thủy, tim tường) | info-term-card | |

**Chữ chốt, cú lật, câu đắt**

| Voice nói | Thẻ | Ghi chú |
|---|---|---|
| Đổi một giá trị cũ thành giá trị mới (20 phút → 70 phút) | strike-and-replace | nét gạch màu đỏ (đỏ = sai) |
| "Người ta tưởng… thật ra…" | error-retype | gõ vế sai, xóa, gõ lại vế đúng |
| Liệt kê bằng một câu khung ("Ở giữa là… / phía Đông là…") | word-slot-cycle | phần đầu câu đứng yên, đuôi câu thay liên tục |
| Câu mở bằng một chữ trọng tâm | lead-word-zoom-assemble | |
| Câu chốt ở cuối đoạn | quote-hold-arrow | hiện bình thường trước, rồi mới nâng cấp nhấn mạnh |
| Tiêu đề có một chữ phải nhấn | slab-punch-title | |
| Mở video bằng một câu mạnh | impact-open-title | |
| "Có 5 vùng", "3 lý do" | count-badge-title | |
| Một chữ trọng âm trong câu | type-contrast-emphasis | mỗi câu tối đa một chữ được nhấn |

**Chỉ điểm, nhấn vào đồ vật**

| Voice nói | Thẻ | Ghi chú |
|---|---|---|
| "Cái này nè" (khoanh một chỗ) | hand-drawn-ellipse, converging-arrows | |
| Gạch chân một chữ trên tờ giấy hay bảng | ink-underline, highlighter-sweep | |
| Gắn nhãn cho một chi tiết | callout-line-label | |
| Đi qua lần lượt từng món trong một nhóm | focus-dim-spotlight | món đang nói sáng, còn lại tối 40% |
| "Nhìn kỹ chỗ này" | crash-zoom-punch | **tối đa 2 lần mỗi video** |
| "Chính nó" (chốt một mục tiêu) | reticle-lock-on | |
| Phóng to chi tiết nhỏ (chữ nhỏ trong hợp đồng) | magnifier-detail | |

**So sánh**

| Voice nói | Thẻ | Ghi chú |
|---|---|---|
| Hai thứ, nói tới cái nào nét cái đó | rack-focus-pair | |
| Trước / sau, hai cách đo | split-compare-slider | kéo giật nhanh rồi lướt chậm, tỉ lệ khoảng 5:1 |

**Quy trình, không gian, thời gian**

| Voice nói | Thẻ | Ghi chú |
|---|---|---|
| Đi từ A tới B trên bản đồ | map-route-pin | với bản đồ thật thì dùng `scripts/map/` (MAP.md), thẻ này chỉ lấy cách ghim rơi và nhãn trượt |
| Các bước theo thứ tự | step-timeline-vertical, numbered-step-stack | |
| Cả đoạn có không gian liền mạch | long-take-world | tốc độ camera tối đa 1,5 khung mỗi giây; bố trí trạm sao cho trạm kế bên không lộ nửa vời khi đang lia |

**Chứng cứ trong câu chuyện**

| Voice nói | Thẻ | Ghi chú |
|---|---|---|
| Tin nhắn, group chat | chat-message-flow | tin của mình gõ ra, bên kia hiện "đang nhập" trước khi trả lời |
| Mẩu tin, thông báo, tờ giấy | news-card-desk | thiết kế giả, không lấy logo báo hay đơn vị thật |
| Nhiều tấm hình, nhiều tờ rơi | stack-fan-out | |

Lời voice không khớp dòng nào thì tự dựng theo ngôn ngữ hình của video đó, rồi ghi lại trong SHOTBOOK như một thẻ mới.

## 7. Kiểm tra bổ sung

Thêm vào bước kiểm tra trong `TALKING-HEAD.md` mục 6 và TOOLKIT mục 5.6:

1. **Không đứng im:** `python3 scripts/qa/motion_check.py build/<video>/output.mp4`. FAIL nghĩa là có đoạn đứng im từ 0,8 giây trở lên. Cách sửa là cho camera trôi tiếp, không bắt đồ vật rung.
   - Đoạn hình chốt cuối video (CTA) cũng để camera đẩy cực chậm, khoảng 0,5% mỗi giây: mắt vẫn thấy đứng yên mà không bị báo lỗi. Nếu cố ý giữ đứng im tuyệt đối thì được bỏ qua lỗi riêng đoạn cuối này.
   - Phần "抖动" (rung) của script viết cho Remotion; với HyperFrames chỉ cần đọc phần "静止" (đứng im).
2. **Ranh giới:** đối chiếu SHOTBOOK, ranh giới nào cũng có cách chuyển, không cắt trơn.
3. **Ngân sách mục 4:** ở mỗi snapshot đếm số nhóm chủ thể, góc trống, số hero.
4. **Đồng khởi đồng thu:** chữ cuối của bối cảnh tắt thì nền và camera cũng khép trong khoảng 0,4 giây. Không để "chữ đã tắt mà cảnh vẫn chạy không".

## 8. Lỗi kỹ thuật đáng nhớ (từ talkcraft, đúng với GSAP)

- Mọi số ngẫu nhiên phải cố định theo seed hoặc theo chỉ số. Không dùng `Math.random()` vì mỗi lần render ra khác nhau.
- Đường camera dùng ease kiểu `sine.inOut` thì điểm cuối có tốc độ 0, nên mấy khung cuối như đứng im. Đặt điểm cuối của tween camera **ra sau** lúc kết thúc bối cảnh.
- Hoa văn chấm hoặc lưới quá mịn (nét ≤ 2px, khoảng cách ≤ 24px) nằm trong lớp bị camera zoom sẽ rung lăn tăn. Làm to ra (chấm ≥ 2,5px, cách ≥ 32px) hoặc đưa ra lớp đứng yên.
- Mờ khi thoát cảnh chỉ đẹp trên nền tối. Nền sáng mà làm mờ thì cả khung nhìn như bị nhòe.
- Demo trong `docs/shots/demos/` phần lớn là khung ngang 1920×1080. Khi đưa vào video dọc (1080×1920, bọc `.stage`), dàn lại theo chiều dọc: hai thứ đặt trái ↔ phải thì chuyển thành trên ↕ dưới.

## 9. Giấy phép

Thư mục `docs/shots/` và `scripts/qa/motion_check.py`, `scripts/qa/frame_signature.py` lấy từ video-talkcraft:

> Required Notice: Copyright (c) 2026 Vincent Wei (https://github.com/Vincentwei1021/video-talkcraft)

Giấy phép gốc PolyForm Noncommercial 1.0.0 (toàn văn ở `docs/shots/LICENSE-video-talkcraft.txt`): dùng không thương mại thì miễn phí; dùng thương mại phải xin phép tác giả. Hiện repo chỉ dùng nội bộ để thử nghiệm, chưa dùng thương mại. Trước khi giao video có dùng thư mục này cho khách (có thu tiền), phải có thư cho phép của tác giả, ghi ngày và link vào `docs/SOURCES.md`; không xin được thì gỡ thư mục này ra.
