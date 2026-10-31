# HẬU KỲ: từ video quay thô (người nói trước máy) đến thành phẩm

Phạm vi: video người nói trước máy về **tài chính, đầu tư, kinh tế, quy hoạch, BĐS**. Mục 0–9 dùng chung cho mọi chủ đề; quy tắc riêng cho bản đồ, khoanh lô, mặt bằng, flycam dự án nằm ở **mục 12 (BĐS & quy hoạch)**. Mục 10–11 là ghi chép từ các video đã dựng và video mẫu.

Tài liệu này đúc kết từ 3 video mẫu dạng "chuyên gia ngồi nói" về đầu tư, giữ vàng, BĐS (Reels, 2–3 phút):

| Mã | Chủ đề | Dài | Khung gốc |
| --- | --- | --- | --- |
| V1 | "Anh chị có hơn 3 tỷ muốn đầu tư dự án ven biển" | 135 s | 720×1280, 30 fps |
| V2 | "chủ đầu tư nói giữ vàng 5 năm, được thêm bao nhiêu?" | 148 s | 720×1280, 30 fps |
| V3 | "Tôi tin tại chủ đầu tư Hóc Môn, dòng sản phẩm ngon nhất…" | 168 s | 720×1280, 30 fps |

Cách phân tích: dò điểm cắt cảnh (`select=gt(scene,0.25)`), xem từng giây trên contact sheet 1 fps, xem chi tiết 10 fps ở các đoạn chữ chạy và chuyển cảnh, đo âm bằng `ebur128` và phổ tần. Ảnh tóm tắt 12 kỹ thuật chính nằm ở `docs/hau-ky/style-board.jpg`.

Số liệu đo được ghi là **đo**. Chỗ suy ra bằng mắt ghi là **ước lượng**.

**Thứ tự ưu tiên:**
- Chữ trên khung hình: theo `DAC-TA-CHU.md`.
- Thư viện và cách đưa b-roll vào khung dọc: theo `broll/README.md`.
- Tài liệu này: nhịp dựng, cảnh minh họa và quy trình (mục 8).
- Ba video mẫu chỉ để tham khảo phong cách, không phải khuôn bắt buộc.

---

## 0. Mười quy tắc cốt lõi

1. **Không để một khoảng lặng nào.** Đo: cả 3 video gần như không có quãng nào im quá 150 ms. Cắt hết tiếng thở, chỗ ngập ngừng và câu nói hỏng (jump cut).
2. **Không chạy phụ đề nguyên câu.** Chỉ hiện keyword 1–3 từ, đúng lúc người nói phát âm cụm đó (chi tiết ở `DAC-TA-CHU.md`).
3. **Cứ khoảng 2–4 giây hình phải đổi một lần**: punch-in, đổi góc máy, chuyển sang cảnh minh họa, hoặc thêm một dòng chữ.
4. **Khoảng một nửa thời lượng không thấy mặt người nói rõ** (ước lượng 45–55%): ảnh phối cảnh hoặc bản đồ toàn màn hình, hoặc nền là chính cảnh nói bị làm mờ, bên trên đặt thẻ ảnh hay icon và chữ.
5. **Giọng nói không bao giờ đứt.** Hình minh họa đè lên, còn tiếng vẫn là tiếng của cảnh nói chạy liên tục.
6. **Chữ tiêu đề lớn nằm sau người** (text-behind-subject): đầu và vai che một phần chữ, tạo chiều sâu.
7. **Mỗi video chọn 1 bộ gen chữ** (font, màu nhấn, hiệu ứng vào, ra và nhấn) theo `DAC-TA-CHU.md` mục 8. Video sau cùng kênh hoặc cùng chủ đề không trùng quá 2/5 gen.
8. **Mở đầu bằng con số hoặc câu hỏi trúng ví tiền** ("hơn 3 tỷ", "5 năm được thêm bao nhiêu?"). Ngay sau đó là lời hứa ("Trong 2 phút tôi chỉ anh chị…").
9. **Thân bài đánh số** (Thứ nhất / Thứ hai…, "3 trường hợp", "4 tệp khách"). Mỗi mục bắt đầu bằng một tiêu đề lớn.
10. **Kết bằng CTA cụ thể**: nhắn tin để nhận bảng tính, tài liệu hoặc bảng phân tích (BĐS: giỏ hàng), cộng nút Follow. Sau đó fade đen.

---

## 1. Kịch bản: khung nội dung chung

| Đoạn | Thời lượng | Nội dung | Ví dụ từ mẫu |
| --- | --- | --- | --- |
| Hook | 0–3 s | Con số hoặc câu hỏi, chữ lớn sau đầu | "Anh chị có hơn **3 tỷ**, muốn đầu tư **dự án ven biển**, nhưng sợ vốn kẹt thanh khoản" |
| Bằng chứng nhanh | 3–20 s | 1–2 cảnh minh họa có số liệu | "Căn AS12, 75 m² bán 11 tỷ, khách sau trả trên 300–500 tr vẫn không có" |
| Lời hứa | ~20–30 s | Nói rõ người xem sẽ nhận được gì | "Trong 2 phút tôi chỉ anh chị: tại sao AS12 đáng xuống tiền nhất…" |
| Thân bài | 30 s – 2 ph | 3–4 luận điểm đánh số, mỗi luận điểm: tiêu đề, giải thích, minh họa | "THỨ NHẤT – tệp khách thuê có sẵn", "SAU 5 NĂM có 3 trường hợp" |
| Đảo chiều / rủi ro | ~15 s | Thừa nhận rủi ro, tăng độ tin | "Cả rủi ro… không có phương án hoàn hảo", "Nhìn đủ 2 mặt" |
| Chốt + CTA | 10–15 s | Kết luận một câu, rồi lời mời hành động | "Nhắn tin cho tôi nhận giỏ hàng + bảng tính dòng tiền 5 năm", "Follow tôi" |

Lời thoại: câu ngắn, nhiều số, xưng "tôi" và gọi "anh chị", tốc độ nhanh. Người quay đọc kịch bản trước, mỗi ý một câu, để khi dựng dễ cắt.

---

## 2. Quay thô: yêu cầu để dựng được kiểu này

- **Khung dọc 9:16, tốt nhất quay 4K** (hoặc tối thiểu 1080×1920), để còn crop punch-in 120–140% mà không vỡ hình.
- **Hai góc máy** (cả V1 và V3 đều có): góc chính trực diện, từ ngực trở lên, mặt ở 1/3 trên khung; góc phụ chéo 3/4 hoặc rộng toàn thân trên ghế. Không có máy thứ hai thì giả bằng crop (xem mục 3).
- **Bối cảnh**: phòng làm việc tối, tường ốp gỗ hoặc panel, đèn hắt trần vàng ấm, đèn RGB tím hắt tường phía sau, một chậu cây xanh. Người nói tách hẳn khỏi nền.
- **Trang phục** trơn, màu tối hoặc xám, không họa tiết. Trang phục là nền cho chữ đặt ngang ngực.
- **Máy đứng yên**, không lia. Mọi chuyển động camera đều làm ở khâu hậu kỳ.
- **Thu âm** bằng mic cài áo hoặc mic shotgun gần miệng, phòng ít vang.
- Chừa khoảng trống trên đầu (headroom) khoảng 15–20% khung để đặt chữ tiêu đề.

---

## 3. Dựng nhịp (timeline)

### 3.1 Jump cut
- Đo: mức nền giữa các từ chỉ là nhạc (khoảng -29 đến -33 dB). Không có quãng lặng dài.
- Cách làm: dò lặng `silencedetect=noise=-35dB:d=0.15`, cắt bỏ, chừa đệm 40–80 ms hai đầu để không mất phụ âm. Bỏ luôn câu nói lại hoặc nói vấp.
- Mỗi chỗ cắt nhảy trên cùng một góc máy phải che bằng một trong các cách sau, để không giật hình:
  - Đổi mức punch-in.
  - Đổi góc máy.
  - Cắt sang cảnh minh họa.

### 3.2 Punch-in và góc máy
- Xen kẽ 2–3 mức khung: **100%** (trung cảnh), **~125%** (cận ngực) và **~145%** (cận mặt, dùng cho câu chốt hoặc câu cảm xúc).
- Đổi mức ở đầu câu mới hoặc ở chỗ jump cut. Không đổi giữa một từ.
- Đoạn dài không cắt (V1 cuối, khoảng 2:06–2:13) thì zoom chậm vào thêm 3–5% trong cả đoạn.
- Góc phụ (chéo, rộng) dùng cho câu chuyển ý ("Điểm tôi thích nhất…", "Khi hơn 100 block này…").

### 3.3 Mật độ
- Đo số điểm cắt cảnh: V1 31 lần trong 135 s, V2 47 lần trong 148 s, V3 45 lần trong 168 s. Tính ra trung bình 3–4 giây một lần đổi hình lớn. Chữ thì đổi nhanh hơn: khoảng 1–2 giây một lần.

---

## 4. Chữ trên khung hình: theo `DAC-TA-CHU.md`

**Mọi chữ phải tuân theo `DAC-TA-CHU.md`** (đặc tả chính thức, rút từ 17 video editor thuê ngoài). Đặc tả quy định:
- Chữ là keyword 1–3 từ, mỗi keyword hiện 0,8–3 giây.
- Vùng an toàn y 200–1320, dải keyword y 620–1150, không đè lên mặt.
- Cỡ chữ keyword 1 từ 180–220 px.
- Bộ gen font, màu và hiệu ứng.
- Từ điển tên riêng, file `text-events.json`, bảng kiểm tự động.

Phần dưới chỉ ghi những gì 3 video mẫu bổ sung **trong khuôn khổ đặc tả**.

### 4.1 Khối chữ trong 3 video mẫu, quy về các lớp của đặc tả
```
  accent  (viết tay, nhỏ, chéo)       ← "Tính theo", "Anh chị có hơn", "Khách hàng thuê"
  keyword / number (to, đậm, glow)    ← "GIÁ VÀNG", "3 TỶ", "SHOPHOUSE HÓC MÔN"
  subline (nhỏ, màu nhấn)             ← "Tại 5 năm sau", "Có sẵn & rất lớn"
```
- Video mẫu có chỗ dùng keyword 4 từ ("SHOPHOUSE HÓC MÔN" có tên riêng). Đặc tả chỉ cho vượt 3 từ khi là tên riêng, và phải tách dòng.
- Các phần tử cùng khối hiện **cộng dồn** theo lời nói: `accent` vào trước, `keyword` vào đúng từ khóa, `subline` vào sau. Sang ý mới thì cả khối ra cùng lúc. Cách này hợp với đặc tả: `attach_to` và quy tắc không chồng 2 keyword liên tiếp.

### 4.2 Biến thể vị trí: chữ sau người
- Video mẫu đặt tiêu đề hook sau đầu người nói. Theo đặc tả, khi mặt nằm ở dải giữa thì keyword "ngay trên đầu" vẫn hợp lệ, nhưng phải nằm trong y ≥ 200 và không đè mặt (mặt cộng 10% lề).
- "Chữ sau người" là lớp chữ đặt dưới lớp matte của người (mục 8.6). Đầu che phần chữ ngoài vùng mặt, không che mất nghĩa. Bảng kiểm "không đè mặt" vẫn tính trên chữ đã bị che.

### 4.3 Gen gợi ý rút từ mẫu (bổ sung cho mục 8 của đặc tả)
| Gen | Biến thể thấy trong mẫu |
| --- | --- |
| `font_pair` | sans đậm × viết tay (V1); sans đậm × sans thường (V2); condensed nghiêng × condensed đậm (V3, cần thêm biến thể `condensed`) |
| `palette` | gold (V1), cyan (V2, V3); chữ lớn gradient trắng → màu nhấn nhạt |
| `entrance` | hiện từng ký tự kèm blur → rõ, letter-spacing rộng → chuẩn (stagger 0,02–0,03 s mỗi ký tự, tổng 0,3–0,5 s) |
| `exit` | blur kèm mờ 0,12–0,2 s, hoặc cắt cứng cùng lúc với cắt hình |
| `emphasis` | trôi lên 4–6 px suốt thời gian hiện |

Font: `poppins` và `bebas-neue` trên fontsource **không có** subset tiếng Việt. Font condensed dùng `anton` hoặc `oswald`, font viết tay dùng `dancing-script` hoặc `great-vibes` (đều có subset tiếng Việt, chưa cài trong repo).

---

## 5. Cảnh minh họa

### 5.1 Nền mờ (dùng nhiều nhất ở V2, V3)
- Lấy **chính cảnh đang nói** làm nền: `blur` 20–30 px, độ sáng còn 35–50%. Giọng vẫn chạy, người xem vẫn cảm thấy người nói "ở đó".
- Chuyển vào: trong 0,3 s, nền tăng blur và tối dần, đồng thời thẻ hoặc icon hiện ra (scale 0.9 → 1, blur → 0). Chuyển ra thì làm ngược lại, hoặc cắt cứng về cảnh nói.
- Trên nền mờ đặt một trong các thứ sau:
  - **Thẻ ảnh bo góc**: radius khoảng 28 px, bóng đổ lớn. Thẻ dọc rộng khoảng 60% khung, thẻ ngang rộng khoảng 80%.
  - **Icon 3D PNG** nền trong suốt: thỏi vàng, cọc tiền, lịch lật, đồng hồ cát, tay đưa tiền. Icon có thể bay vào, xếp chồng, lật số.
  - **Logo** thương hiệu (chủ đầu tư, ngân hàng), kèm 1–2 dòng chữ dưới logo.
  - **Biểu đồ** vẽ dần: đường cong đỏ có chấm, trục mờ.
  - **Khung chấm đứt** (viền chấm, 4 góc có chấm tròn) chứa thông số: "Diện tích đất 75m2".
  - **Liệt kê cộng dồn**: tiêu đề, rồi số lớn 1/2/3, cạnh mỗi số là 2 dòng nhỏ.

### 5.2 Toàn màn hình (V1 dùng nhiều)
- Ảnh hoặc footage đúng chủ đề (bảng điện, biểu đồ thị trường, trụ sở doanh nghiệp, phối cảnh dự án) hoặc video AI (V3 có watermark "Veo"). Chuyển động camera chậm: Ken Burns 3–6% kèm lia nhẹ.
- **Bản đồ hoặc mặt bằng tổng** *(BĐS & quy hoạch, chi tiết ở mục 12)*:
  - Viền phát sáng vẽ dần quanh khu được nói tới (vàng chanh, đỏ, hồng neon). Viền có glow, bên trong sáng hơn phần ngoài.
  - Ghim định vị kèm đường đứt nét nối tới nhãn tên khu ("khu ÁNH SÁNG", "COSMO BAY", "THE PARADISE"), dưới nhãn là 1 dòng mô tả.
  - Các khu công nghiệp hoặc khu lân cận thì ghi tên kèm diện tích (ha) màu nhấn.
  - Đường giao thông: vẽ dần bằng nét trắng hoặc xanh, nhãn dạng thẻ cam đầu nhọn ("QUỐC LỘ 22", "VÀNH ĐAI 3").
  - Thẻ ảnh nổi trên bản đồ, gắn với vị trí ghim (V1: "Căn AS12").

---

## 6. Chuyển cảnh, màu, kết

- **Cắt cứng** là chủ yếu.
- **Blur dissolve** khoảng 0,3 s khi đi vào hoặc ra cảnh nền mờ và thẻ ảnh.
- **Flash hoặc light leak** 3–6 khung hình (0,1–0,2 s), màu trắng, cyan hoặc ánh cầu vồng, ở chỗ chuyển giữa các phần lớn. V2 dùng khoảng 4 lần trong 148 s. Không dùng nhiều hơn.
- **Fade đen** 0,5–1 s ở cuối video.
- **Màu**: da ấm, nền tím và vàng, tương phản cao, làm nét nhẹ. Cả 3 video cùng tông, gần như là thương hiệu cá nhân.
- **Kết**: câu CTA bằng lời, chữ "Nhắn tin cho tôi" kèm icon bong bóng chat, nút "Follow" kiểu TikTok ở giữa ngực. Không có màn hình kết riêng, chỉ có fade đen.

---

## 7. Âm thanh

| Thông số (đo) | V1 | V2 | V3 |
| --- | --- | --- | --- |
| Loudness tích hợp | -14,4 LUFS | -14,2 LUFS | -14,3 LUFS |
| LRA | 4,4 LU | 3,6 LU | 3,3 LU |

- **Voice**: chuẩn -14 LUFS. LRA 3–4,5 LU nghĩa là nén khá mạnh, giọng đều và "dày". Chuỗi xử lý gợi ý:
  - `highpass=80` để cắt tiếng ù tần thấp.
  - De-ess nhẹ.
  - `acompressor` ratio 3–4.
  - `loudnorm=I=-14:TP=-1.5:LRA=4`.
- **Nhạc nền**: chạy liên tục cả video (phổ có dải bass và nốt kéo dài từ giây khoảng 6), mức thấp hơn voice khoảng 15–20 dB. Ở V1, 6 giây đầu nhạc gần như vắng, nhạc vào cùng cảnh minh họa đầu tiên.
- **SFX**: whoosh ở chuyển cảnh và flash, pop hoặc tick khi chữ hay thẻ bật ra, ding hoặc impact khi số chốt hiện. Dùng thư viện `sfx/` sẵn có.
- **Lưu ý quy tắc repo**: thư viện `sfx/` **không nhận nhạc nền**. Nếu làm giống mẫu thì nhạc nền là file riêng của từng video (`projects/<ten-video>/music.*`), có bản quyền rõ ràng, do người làm video cung cấp, và không đưa vào `sfx/`.

---

## 8. Quy trình khi nhận video thô

```
Bước 1  Nhận video thô        projects/<ten-video>/raw/*.mp4 (+ script.txt nếu có)
Bước 2  Phân tích              ffprobe, tách voice, transcript, chuẩn hóa theo glossary.yaml, jump cut → edl.json
Bước 3  BẢNG YÊU CẦU MINH HỌA  broll-request.md: câu nào cần hình gì, đã có sẵn file nào, CẦN NẠP gì
        ── dừng, gửi bảng cho người làm video, chờ nạp b-roll ──
Bước 4  Xử lý khung dọc        broll-scan + broll-fit → projects/<ten-video>/fit/
Bước 5  Chữ                    text-events.json theo DAC-TA-CHU.md
Bước 6  Dựng + âm thanh        HyperFrames: cảnh nói theo EDL, minh họa, chữ, SFX, nhạc
Bước 7  Kiểm tra               lint, snapshot, bảng kiểm DAC-TA-CHU mục 12, loudness → render
```

### 8.1 Nhận video thô
- Thư mục video:
  - `projects/<ten-video>/raw/`: video gốc, 1 hoặc 2 góc máy.
  - `projects/<ten-video>/script.txt`: lời thoại, nếu có.
  - `projects/<ten-video>/glossary.yaml`: chép từ video cùng chủ đề (cùng kênh, cùng dự án) rồi bổ sung.
- Kiểm tra bằng `ffprobe` (độ phân giải, fps, xoay hình, độ dài, kênh âm), rồi đưa về 30 fps CFR. Nếu có 2 máy thì đồng bộ theo âm thanh.
- Video quay ngang hoặc dưới 1080×1920: báo ngay cho người làm video. Khung dọc cắt từ máy ngang 1080p sẽ mờ.

### 8.2 Phân tích
- **Transcript**: nhận dạng giọng nói chạy trên máy bằng `faster-whisper` (mô hình `large-v3`, `int8`, CPU). 130 s âm thanh mất khoảng 6 phút. Kết quả có mốc từng từ, lưu `projects/<ten-video>/asr.json`. Khi có `script.txt` thì dùng thêm `align.mjs`.
  - Nạp âm thanh dạng mảng numpy (`ffmpeg … -ac 1 -ar 16000 -f f32le`), vì bản PyAV đang cài lỗi khi mở file.
  - Whisper hay viết sai tên riêng: ví dụ "cắt lỗ" ra "Cát Lỗ", tên dự án và tập đoàn ra chữ vô nghĩa. Chuẩn hóa theo `glossary.yaml` (DAC-TA-CHU mục 10). Chỗ nào không chắc thì hỏi người làm video, không đoán.
  - Mô hình tải từ huggingface.co: môi trường phải cho phép host này.
- **Jump cut**:
  - Dò lặng `silencedetect=noise=-35dB:d=0.15`, chừa đệm 0,04–0,08 s hai đầu, gộp các đoạn cách nhau dưới 0,1 s.
  - Loại các câu nói lại (`"drop": true` trong `edl.json`). **Whisper chép bình thường tự "làm sạch" câu, bỏ mất chỗ nói nhầm rồi nói lại**: một từ có mốc kéo dài bất thường (> 0,6 s, ví dụ `"có"[23,10–25,46]`) thường đang che một câu nói lại. Cách tìm:
    - Nhận dạng **nguyên văn từng đoạn ngắn** 3–6 s quanh các chỗ nghi ngờ, `condition_on_previous_text=False`, **không** dùng `initial_prompt` (lời mồi làm mô hình bịa câu ở đoạn ngập ngừng).
    - Xem đường năng lượng 40 ms để đặt điểm cắt vào chỗ ngắt hơi.
    - Câu nói lại thì **giữ câu sau** (câu đã sửa), bỏ câu trước. Đọc nghĩa: câu sai thì, sai từ ("sẽ không thành công" cho việc đã xảy ra) là câu phải bỏ.
    - **Không cắt giữa một chữ đang kéo dài** ("2021…", "hoànnn thành"): cắt rút vần làm méo tiếng, nhận dạng lại nghe thành chữ khác.
    - Sau khi cắt, **nhận dạng lại toàn bộ bản đã cắt** và đối chiếu từng mối cắt; tên riêng, con số đầu video (thông tin quan trọng nhất) phải còn nguyên.
  - Voice thành phẩm là các đoạn giữ lại nối liền, mỗi chỗ nối có crossfade 10 ms.
- **Dò mặt** trên cảnh nói, lấy mẫu mỗi 0,5 giây, để đặt chữ và chọn mức punch-in. Dùng OpenCV `FaceDetectorYN` với mô hình YuNet (`huggingface.co/opencv/face_detection_yunet`). OpenCV 5 không còn Haar cascade.
- **Độ phân giải nguồn**: nếu video thô dưới 1080×1920 thì đã phải phóng lên, punch-in tối đa khoảng 1,12×. Hỏi xin file gốc từ điện thoại.

### 8.3 Bảng yêu cầu minh họa: `broll-request.md`
Đây là sản phẩm của bước phân tích, **gửi cho người làm video trước khi dựng**. Mỗi câu (theo mốc thời gian sau jump cut) có một hàng:

| # | Mốc | Lời (rút gọn) | Hình | Cần gì | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| 3 | 0:07–0:11 | "lãi tiết kiệm 12 tháng chỉ còn 4,7%…" | Nền mờ + `number` | Chỉ dùng chữ, kèm icon `icon-heo-dat.png` | Icon **CẦN NẠP** |
| 4 | 0:11–0:14 | "VN-Index về lại 1.200 điểm…" | Toàn màn hình | Biểu đồ tự dựng; cần ảnh tự chụp bảng điện, tên đề nghị `bang-dien-01.jpg` | **CẦN NẠP** |
| 5 | 0:14–0:16 | "88 triệu một mét vuông" (BĐS) | Nền mờ + `number` | Chỉ dùng chữ, kèm icon `icon-coc-tien.png` | Icon **CẦN NẠP** |
| 6 | 0:16–0:20 | "5 phút tới khu công nghệ cao" (BĐS) | Bản đồ | Nền bản đồ vệ tinh khu vực, không chữ. Viền, ghim và nhãn tôi tự dựng | **CẦN NẠP** nền bản đồ |

Quy tắc khi lập bảng:
- **Chọn kiểu hình theo lời nói:**
  - Câu có số liệu, mốc thời gian, so sánh, địa danh (BĐS: hạ tầng, tiện ích): minh họa.
  - Câu quan điểm hoặc cảm xúc: mặt người nói.
  - Không để mặt người nói quá 6–8 giây liền, không để minh họa quá 10–12 giây liền. Tỷ lệ minh họa mục tiêu 40–55%.
- **Dò thư viện trước**: `broll/catalog.json` (theo `tags`, `desc`), cộng với tư liệu đi kèm video thô nếu người làm video gửi. Chỉ ghi CẦN NẠP khi thực sự không có.
- **Mỗi dòng CẦN NẠP phải mô tả đủ để người nạp đi tìm được**:
  - Nội dung cụ thể (góc nhìn, giờ trong ngày nếu quan trọng).
  - Ảnh hay clip, độ dài clip.
  - Định dạng tối thiểu (`broll/README.md` mục 2).
  - Tên file đề nghị.
- **Ghi rõ phần tôi tự dựng, không cần nạp**, gồm:
  - Viền phát sáng, ghim, đường dẫn, nhãn trên bản đồ.
  - Khung chấm đứt, biểu đồ, số đếm.
  - Nút CTA, con trỏ, bong bóng chat, nút Follow.
  - Flash và chớp sáng tạo bằng CSS.
- Cuối bảng tổng hợp: số mục có sẵn, số mục CẦN NẠP chia theo nhóm, và SFX còn thiếu (theo tên trong `scripts/sfx-import.mjs`).
- Nếu người làm video không nạp được một mục, có phương án dự phòng theo thứ tự: ảnh khác cùng chủ đề, hình tự dựng (bản đồ vẽ, icon), cuối cùng là mặt người nói kèm keyword.

### 8.4 Xử lý khung dọc
1. `node scripts/broll-scan.mjs <thư-mục> --preview`: lập catalog, gợi ý chế độ, vẽ 5 tâm cắt.
2. Xem preview, chọn tâm, rồi `node scripts/broll-fit.mjs <vào> projects/<ten-video>/fit/<tên> --mode … --focus …`.
3. Quy tắc chọn chế độ (chi tiết ở `broll/README.md` mục 3):
   - Ảnh ngang đủ lớn: `crop` (đứng yên hoặc push-in), hoặc `strip` để lia ngang.
   - Ảnh có chữ hoặc chi tiết không được cắt (mặt bằng, CSBH, bản đồ có chú thích): `fill` hoặc `card`.
   - Clip ngang 1080p: chỉ dùng `card` hoặc `fill`.
   - Icon, logo, mặt bằng tách nền: `icon`.
4. `--headroom 1.1` (mặc định) chừa 10% để template push-in hay lia mà không phóng ảnh. Công cụ in CẢNH BÁO khi phải phóng to quá 1,05×. Gặp cảnh báo đó thì đổi sang `card`/`fill`, hoặc yêu cầu nguồn lớn hơn.
5. Chuyển động trên ảnh tĩnh làm trong template, không render sẵn:
   - Push-in 3–6% trong cả cảnh.
   - Lia ngang dải `strip` 1/3–1/2 bề ngang trong 3–4 giây, ease `sine.inOut`.

### 8.5 Chữ
- Lập `text-events.json` đúng mục 11 của đặc tả, chọn bộ gen không trùng quá 2/5 với video trước cùng dự án.
- Keyword đặt theo dò mặt (8.2). Trên cảnh minh họa thì đặt vào vùng trời hoặc mảng tối.

### 8.6 Dựng trong HyperFrames
- **Cảnh nói**: `<video muted>` với `data-media-start` = điểm in trong file gốc, `data-duration` = out − in. Voice là track âm riêng đã nối từ EDL.
- **Punch-in**: tween `scale` hoặc `x/y` của lớp bọc video. Không đặt transform trong CSS (TOOLKIT 5.4).
- **Nền mờ cho minh họa dạng thẻ**: bản sao lớp video, `filter: blur(24px) brightness(.45)`, tween opacity.
- **Chữ sau người**: thứ tự lớp gồm video, chữ sau, matte người (`rembg u2net_human_seg` hoặc `mediapipe`, xuất WebM có alpha, cùng `data-media-start`), rồi chữ trước. Chỉ làm cho những đoạn cần.
- Ảnh và clip lấy từ `projects/<ten-video>/fit/`.

### 8.7 Kiểm tra trước khi giao
1. `npx hyperframes lint`: 0 error.
2. Snapshot giữa mỗi cảnh, xem contact sheet.
3. **Bảng kiểm `DAC-TA-CHU.md` mục 12**: đo bằng máy, không đoán.
4. Không còn ảnh nào bị phóng to quá 1,05× (xem log của `broll-fit`).
5. Render xong, đo `ebur128`: I ≈ -14 LUFS, đỉnh ≤ -1 dBTP. SFX không vượt đỉnh voice.
6. Xem lại toàn bộ ở tốc độ thật: không còn tiếng thở hay ngập ngừng, không có cú nhảy hình nào thiếu che, CTA rõ ràng.

---

## 9. Việc toolkit còn thiếu

| Hạng mục | Trạng thái |
| --- | --- |
| Chuyển ảnh/clip sang khung dọc | **Có**: `scripts/broll-fit.mjs`, `scripts/broll-scan.mjs` |
| Thư viện b-roll và danh sách cần nạp | **Có**: `broll/README.md` |
| Đặc tả chữ | **Có**: `DAC-TA-CHU.md`, mẫu từ điển `glossary.yaml` (mục 10 của đặc tả) |
| Tên SFX bổ sung | **Có** trong `sfx-import.mjs` (chờ nạp file âm thanh) |
| Đầu vào video thô, jump cut ra `edl.json` | Chưa có |
| Sinh `broll-request.md` từ transcript và catalog | Chưa có (hiện lập tay theo 8.3) |
| Template keyword theo `text-events.json` và bảng kiểm tự động mục 12 | Chưa có |
| Dò mặt, matte người cho chữ sau người | Chưa có |
| Nhạc nền riêng từng video có ducking | Chưa có, chờ quyết định về nhạc |

---

## 10. Bài học từ video "cắt lỗ?" (10/2026) — ví dụ BĐS

| Vấn đề | Nguyên nhân | Cách làm đúng |
| --- | --- | --- |
| Hình lệch tiếng 0,2 s ở cuối video | Cắt tiếng theo mili giây, hình làm tròn theo khung, cộng dồn qua 41 chỗ cắt | Mọi điểm cắt bám lưới khung (1/30 s); cắt tiếng đúng các khung đó (`prep.mjs`) |
| Mặt nạ lệch khung | Ghép mặt nạ với hình khi hai luồng không cùng mốc thời gian | `setpts=N/30/TB` cho cả hai luồng trước khi ghép |
| Tay và thân dưới bị trong suốt khi tách nền | `u2net_human_seg` kém ở vùng tay | Không thay nền sau người nói |
| Video nháy liên tục, viền người lỗi | Retouch theo vùng và chữ sau người đều dùng mặt nạ tách người theo từng khung; mặt nạ rung → viền và nền nháy | **Không dùng mặt nạ tách người cho video nói.** Chỉnh màu một lớp toàn khung; chữ đặt trên đầu, không đặt sau người |
| Lớp mờ, gradient sau chữ | Cố đạt tương phản bằng lớp nền cục bộ | **Không dùng.** Tương phản đạt bằng viền chữ (stroke) cộng bóng nhẹ |
| Chữ lúc to lúc nhỏ, nhiều font, nhiều màu | Màu theo từng phần, cỡ chữ co giãn theo từng cụm | Cả video chỉ 2 font, 2 màu: key một cỡ cố định, chữ phụ một cỡ cố định. Tách dòng chứ không đổi cỡ |
| Dấu tiếng Việt bị cắt | Hiệu ứng trượt dùng `overflow: hidden` | Hiệu ứng mờ → rõ có nhích lên, không dùng mask; chừa padding trên cho dấu |
| `background-clip: text` mất chữ | Span con có transform tạo lớp riêng | Gradient đặt trên chính span. Glow và viền đặt ở lớp `::before`, chữ gradient ở `<i>` bên trong |
| Render treo ở khung ~2450, rồi lỗi | Cache tách khung trong `/tmp` (PNG cho video alpha) làm đầy đĩa 21 GB, Chrome phình bộ nhớ | `render-chunks.mjs`: render từng đoạn 35 s, xóa cache sau mỗi đoạn, nối hình rồi tự trộn tiếng |
| Tải cả thư mục Drive | Thư mục có hàng trăm asset | `gdown --folder <url> --json` để liệt kê, xem thumbnail `drive.google.com/thumbnail?id=…`, chỉ tải file chọn |

Hệ chữ đã chốt với người làm video:
- **Key**: Barlow Condensed 800, 116 px. Neon gradient màu thương hiệu (ví dụ san hô `#EA8D6B`), viền navy, có glow.
- **Chữ phụ**: Be Vietnam Pro 600, 50 px, trắng, viền mảnh, bóng nhẹ.
- **Tên dự án ở hook**: chữ khổng lồ phía trên đầu người nói (không đặt sau người).

Góp ý bản 2 → cách làm ở bản 3 (áp dụng cho mọi video nói):
| Góp ý | Cách làm đúng |
| --- | --- |
| Cắt, ngắt vụn; lạm dụng ngắt | Chỉ bỏ khoảng lặng bỏ được ≥ 0,45 s (chừa 0,15 s mỗi đầu). Không cắt giữa câu. Video thường còn 0–8 chỗ cắt, không phải 40 |
| Chuyển cảnh, nhịp quá gấp | Đổi khung máy chỉ ở đầu câu, trung bình ~9 s một lần. Cảnh minh họa giữ ≥ 3 s, zoom chậm 5–6%. Không flash, không hòa hình |
| Keyword tệ, chữ lặp chồng | Mỗi câu tối đa 1 cụm chữ (lead + key), chỉ chọn ý chính của câu. Không đồ họa nhắc lại đúng chữ đang hiện (ô "GIÁ = GIÁ", nhãn "24%" cạnh key "24%"). Bỏ câu đệm, câu nhắc lại |
| SFX không hợp | 10–15 SFX cho 2 phút: whoosh nhẹ khi vào cảnh minh họa, pop/cash cho 2–3 con số chính, click ở CTA. Không SFX cho từng cụm chữ |
| Asset trình bày cả ảnh, mất trọng tâm | Cắt 9:16 vào chủ thể của câu nói (tháp đang xây, đám đông ở sự kiện, khối ưu đãi trên poster, giường ở phòng ngủ, vị trí dự án trên bản đồ). Không đặt cả ảnh ngang thành dải giữa nền mờ |

Góp ý bản 3 → bản 4:
| Góp ý | Cách làm đúng |
| --- | --- |
| Số to bị chồng lớp: "TỶ", "%" vừa to vừa nhỏ | Lớp viền/glow `::before` lấy nguyên chuỗi từ `data-t`; nếu lớp gradient thu nhỏ đơn vị thì hai lớp lệch nhau. Số và đơn vị luôn cùng cỡ. Kiểm bằng ảnh cắt cỡ thật, không chỉ nhìn lưới thu nhỏ |
| Màu đục ngầu | Không nén vùng sáng (trắng thành xám). Đen sâu nhẹ, bão hòa +15%, so trước/sau trên cùng một khung trước khi chạy cả video |
| Cắt zoom giật | Cảnh nói không cắt thì không đổi khung rộng/chặt, không phóng to (trên cảnh quay liền, đổi khung = giật). Giữ một khung suốt video |
| Ảnh ngang nhét cho đủ dọc → xấu | Ảnh ngang dưới ~2300 px phần cắt: đặt nguyên tỷ lệ ở nửa trên (1080×600), người vẫn nói bên dưới. Chỉ ảnh gốc rất lớn (≥ 6000 px) hoặc ảnh dọc mới dùng toàn khung. Mặt bằng, poster: đặt nguyên trên thẻ |
| Hình nhiều xài ít, chữ chỗ có chỗ thiếu | Mỗi câu có một cụm chữ (trừ câu nhắc lại). Dùng ảnh cho mọi câu nói về sản phẩm: sự kiện, phối cảnh, tiến độ, poster, mặt bằng, view, nội thất, bản đồ, vị trí |
| Chữ mỗi lúc một chỗ | Một dải chữ duy nhất trên đầu người nói (đáy y ≈ 540–590) cho cả cảnh nói, ảnh, nền mờ |

Góp ý bản 4 → bản 5:
| Góp ý | Cách làm đúng |
| --- | --- |
| Dấu của key (Ắ trong "NGẮN HẠN") bị dòng trên đè, mất màu | Dòng key chừa đệm trên 0,24 em cho dấu chồng; lead cách key ≥ 2 px, tail cách key 6 px; glow key thu nhỏ. `build.mjs` chụp riêng từng dòng (chữ + viền) và dừng dựng nếu hai dòng chạm nhau dù 1 điểm ảnh |
| Đối tượng hiện rồi biến mất ngay | Key giữ ≥ 1,5 s sau khi hiện xong; cảnh/diễn hoạt (đếm số, ghim bản đồ, thanh thanh toán) giữ ≥ 1,2 s sau khi chạy xong mới chuyển |
| Xuất hiện, biến mất, chuyển cảnh chưa thu hút | Chữ phụ: trồi lên từ mờ ra rõ. Key: bật sáng kiểu neon (phóng nhẹ, mờ → rõ, sáng gắt → thường). Ra: bay lên + mờ. Ảnh toàn khung vào: phóng nhẹ từ mờ ra rõ. Ảnh nửa trên: trượt xuống, ra trượt lên |
| Ảnh nửa trên cần chuyển mờ ở mép dưới | `mask-image` gradient: đặc tới 68%, mờ dần tới trong suốt ở mép dưới |
| Ảnh toàn khung thì người dẫn mất hút | Khung vuông người dẫn 330 px, góc dưới trái (x 60, y 1290), lớp trên cùng, bật ra kiểu nảy. Nội dung chính của cảnh đặt trong y 200–1290 để không bị che. Cảnh ngồi nói vẫn toàn màn |
| Quá ít SFX | Thêm SFX theo sự kiện (xem bản 6: không gắn cho mọi chữ) |

Góp ý bản 5 → bản 6:
| Góp ý | Nguyên nhân | Cách làm đúng |
| --- | --- | --- |
| Key vẫn mất màu | Lớp gradient (`background-clip: text` trên `<i>` inline) chỉ phủ hộp chữ; dấu trên (Ắ, Ầ, Ữ) và dấu nặng (Ạ, Ặ) nằm ngoài hộp → lộ màu lớp viền bên dưới, chữ hai màu. Gradient trên cùng gần trắng → nhìn bạc màu | `<i>` thành `inline-block`, nới hộp tô 0,36 em trên / 0,32 em dưới bằng padding + margin âm (không đổi bố cục). Gradient bão hòa, không ngả trắng. `build.mjs` chụp riêng lớp gradient và hình chữ, dừng dựng nếu có điểm ảnh chữ nằm ngoài lớp gradient (thử lại với CSS cũ: bắt được 8 key) |
| SFX ở keyword lạm dụng, dở | Gắn "title-in" (1,6 s) cho mọi key → 20 lần cùng một tiếng dài | ~28 SFX/2 phút. Chữ thường không có tiếng; chỉ key quan trọng có tiếng ngắn (pop ≤ 0,25 s), số có coin/cash/chart-up, chuyển cảnh lướt nhẹ (vol 0,18–0,25 ≈ 20 dB dưới giọng), mỗi tiếng ≥ 0,6 s cách nhau |
| Key bật sáng quá trắng khi hiện | brightness 2,2 | brightness 1,5 |



## 11. Học từ video mẫu "explainer" (một kênh BĐS, 103 s, 10/2026)

Video mẫu không có một lần cắt cứng nào (dò cảnh ở ngưỡng 0,25 cho 0 điểm cắt): mọi thứ chuyển bằng chuyển động. Nhịp: người nói toàn khung chỉ ~12 % thời lượng (đoạn mở và đoạn kết); phần còn lại là **màn giải thích** do người dựng vẽ, người nói đi theo dưới dạng avatar tròn.

### 11.1 Cấu trúc
| Đoạn | Thời gian | Cách dựng |
| --- | --- | --- |
| Hook | 0–6,5 s | Chữ chuyển động trên **một tấm canvas lớn** nền navy có lưới chấm mờ; "camera" lia/zoom từ cụm này sang cụm khác (12 tháng + lịch 12 ô → 0 % mỗi tháng đóng → 45–46 triệu/tháng → "nổi không?"). Các cụm cũ vẫn nằm trên canvas, trôi ra khỏi khung chứ không biến mất. |
| Vào người nói | 6,4–7,0 s | Khung người bay vào từ góc dưới phải dưới dạng **thẻ nghiêng ~−8°, bo góc**, vừa xoay thẳng vừa phóng to ra toàn khung; canvas phía sau lùi xa. |
| Người nói | 7–10,8 s | Toàn khung, phụ đề karaoke ở dưới. |
| Ra màn giải thích | 10,9–12,8 s | Toàn khung co thành **thẻ dọc** rồi trượt sang phải ra khỏi khung; chữ của ý mới hiện bên trái; người nói xuất hiện lại thành **avatar tròn ở giữa** (viền trắng mảnh, bóng) ngay dưới câu chữ, rồi bay lên **góc trên phải** và ở đó suốt màn giải thích. |
| Màn giải thích | 13–95,5 s | Nền navy (có một đoạn chuyển sang nền sáng xám khi đổi ý "chỉ là ví dụ"). Bố cục cố định: nhãn mục ở góc trên trái, avatar góc trên phải, nội dung ở giữa, phụ đề ở dưới. |
| Về người nói | 95,4–96,0 s | Avatar mờ đi; thẻ người nghiêng bay vào từ góc dưới phải, xoay thẳng, phóng ra toàn khung (đảo ngược 6,4 s). |
| Kết | 96–103 s | Người nói + "nhớ lưu video này lại nha" + nút Follow; thẻ cuối kênh. |

### 11.2 Ngôn ngữ đồ họa của màn giải thích
- **Nhãn mục**: chữ mono, chữ hoa, giãn rộng, màu xanh nhạt, có gạch ngang phía trước ("— 3 VIỆC NÊN LÀM", "— NGÀY XƯA", "— THỬ PHƯƠNG ÁN", "— DÒNG TIỀN"). Đổi nhãn = đổi ý, nội dung cũ mờ đi rồi mới hiện nội dung mới.
- **Thẻ danh sách kiểu giao diện app**: hộp bo góc nền tối hơi xanh, viền mảnh, ô biểu tượng vuông xanh dương bên trái, tiêu đề đậm + dòng mô tả nhỏ. Hiện **từng thẻ đúng lúc được nói**; khi sang bước sau, thẻ cũ giữ lại nhưng mờ đi; nối bằng mũi tên khi là trình tự (Tìm phương thức → Nhờ môi giới → Môi giới tính).
- **Mô phỏng giao diện thật**: thanh địa chỉ gõ "một kênh BĐS.vn" + nút Copy; ảnh chụp trang web trong thẻ; máy tính trả góp với **con trỏ chuột bấm** vào từng lựa chọn (2PN, CK 9 %, vay 70 %, lãi 0 % 12 tháng) đúng nhịp lời.
- **Sơ đồ ý niệm**: một nút "anh chị" xanh ở giữa, các nút đỏ (môi giới) tỏa ra quanh rồi bị gạch → "KHỎI CẦN HỎI AI".
- **Số liệu bằng hình**: lịch 12 ô sáng dần; dòng tiền năm 1 / năm 2 bằng 12 ô mỗi năm, ô tháng căng nhất đỏ có dấu "?".
- **Chữ nhấn lớn**: serif đậm (kiểu Playfair/DM Serif) cho số và cụm then chốt ("45–46 triệu", "1–2 phút", "chờ tiếp"); vàng cho câu hook, đỏ cho cảnh báo, xanh cho tích cực. Một số cụm viết nghiêng serif ("kéo tiền mất tật mang").
- **Phụ đề**: chữ trắng nhỏ ở giữa dưới, hiện dần theo từ; từ khóa tách thành dòng thứ hai **chữ hoa xanh dương đậm** ("TẬP CUỐI", "CĂN 2 PHÒNG NGỦ", "9%").
- **Bảng màu**: nền gần đen xanh (#04050E → #0A1530 ở giữa), xanh dương nhấn (#2F6BFF), trắng; vàng chỉ dùng ở hook; đỏ chỉ cho rủi ro.

### 11.3 Áp dụng cho video của mình
1. Không cắt cứng; mỗi lần đổi cảnh phải là một chuyển động có hướng (thẻ bay, co, trượt, camera lia).
2. Người nói khi không toàn khung thì là **avatar tròn nhỏ cố định góc trên phải** (không phải khung vuông góc dưới): không đè nội dung, không đè phụ đề, nhìn gọn.
3. Ra/vào toàn khung bằng **thẻ nghiêng** (co thành thẻ dọc rồi trượt đi; vào thì thẻ nghiêng bay tới, xoay thẳng, phóng ra).
4. Màn giải thích có khung cố định: nhãn mục trái trên + avatar phải trên + nội dung giữa + phụ đề dưới. Một ý = một nhãn mục.
5. Nội dung là "giao diện" (thẻ, danh sách, máy tính, con trỏ bấm) thay vì chữ to đứng một mình; mỗi phần tử hiện đúng lúc được nói, phần cũ mờ đi chứ không biến mất.
6. Phụ đề karaoke + một từ khóa chữ hoa màu nhấn; chữ lớn chỉ dùng cho 1–2 con số/cụm then chốt mỗi đoạn.

---

## 12. Phần mở rộng: BĐS & quy hoạch

Các quy tắc dưới đây chỉ dùng cho video có **vị trí, bản đồ, lô đất, mặt bằng, dự án**. Phần chung (mục 0–9, `DAC-TA-CHU.md`) vẫn áp dụng đầy đủ.

### 12.1 Thành phần riêng trong repo
| Thành phần | Ở đâu |
| --- | --- |
| Nhãn bản đồ `map_label` | `DAC-TA-CHU.md` mục 4.10 |
| Bản đồ, viền khu, ghim, đường giao thông | mục 5.2 ở trên |
| Text preset gắn BĐS (chữ mẫu căn hộ, tiện ích, sổ hồng…) | `text-presets/README.md` mục 6, cột *Nhóm* = BĐS & quy hoạch; bộ cụm từ kiểm thử `text-presets/test-phrases.mjs` |
| B-roll riêng (flycam dự án, phối cảnh, nội thất, tiến độ) | `broll/README.md` mục 1 (nhóm BĐS & quy hoạch) |
| SFX | `pin-drop` (ghim vị trí), `scribble` (vẽ viền), `stamp` (đóng dấu pháp lý) trong `sfx/` |

### 12.2 Người nói đang chỉ trên bản đồ (quay màn hình, có con trỏ)
Bài học từ video "Đấu giá lại 3 lô đất Thủ Thiêm" (10/2026):
1. **Bản đồ là nền xuyên suốt.** Người nói dùng con trỏ để chỉ lô; bỏ bản đồ thì người xem không biết đang nói lô nào. Không thay bằng màn giải thích tách rời.
2. **Tách ảnh bản đồ sạch** bằng trung vị nhiều khung (con trỏ, sticker biến mất), rồi **dò con trỏ** (chênh lệch từng khung so với ảnh sạch) để biết người nói chỉ vào đâu khi nhắc tên lô.
3. **Khoanh lô theo mép đất thật** (lề đường, hàng cây), viền mảnh 3–4 px, glow nhẹ, màu phủ nhạt (độ mờ 0,2–0,35) để vẫn thấy mặt đất. Viền thô ước lượng nhìn rất xấu.
4. **Thông tin gắn trên lô đang nói**: nhãn "LÔ x", diện tích, giá, số tầng (khối tầng mọc lên trên lô). Thông tin không gắn vị trí (năm, chủ thể, quyết định) ở thẻ ngay dưới bản đồ.
5. **Camera đẩy/lia tới lô đang nói** thay cho con trỏ; vòng lan (ping) trên lô khi được nhắc lại. Nhãn giá giữ lại trên lô tới khi lùi ra toàn cảnh để so sánh.
6. **Không phụ đề chạy** khi bản đồ đã có chữ; mở video bằng tiêu đề lớn tên lô/khu (thông tin quan trọng nhất).

