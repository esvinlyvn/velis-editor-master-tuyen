# Quy tắc vận hành bds-editor

bds-editor nhận **clip quay thật về bất động sản** (người nói trước máy, quay dự án) và dựng thành video dọc 1080×1920 hoàn chỉnh: cắt nhịp, chữ chốt, bản đồ và minh họa, SFX, màu, kiểm, giao.

File này gom mọi luật người dùng đã yêu cầu cho việc edit BĐS, gỡ chỗ mâu thuẫn giữa các tài liệu, và chỉ rõ luật nào nằm ở đâu. Mỗi luật chỉ có **một nơi sống**: các file khác chỉ dẫn tới đó, không chép lại.

## 1. Thứ tự ưu tiên

Hai chỗ nói khác nhau thì chỗ đứng trên thắng:

1. Lời người dùng trong phiên đang làm.
2. **Bảng luật đã chốt** ở đầu `TALKING-HEAD.md`. Đây là nơi duy nhất ghi luật người dùng chốt qua từng video, có cột nguồn.
3. `clients/<khach>/brand.json`: lựa chọn riêng của khách (màu, LUT, CTA, logo, lịch sử phong cách).
4. File này và `docs/TRINH-BAY.md` (phần hình: hook, minh họa, bố cục đồ họa, học từ AI MASTER).
5. `docs/HAU-KY.md`, `docs/DAC-TA-CHU.md`: đặc tả gốc đo từ video mẫu; `docs/PHONG-CACH-ME4REAL.md`: bộ mã phong cách đo từ editor BĐS chuyên nghiệp (khung, hook, chữ, chuyển cảnh, âm, CTA).
6. `lib/README.md`, `TOOLKIT.md`, `MAP.md`, `text-presets/README.md`, `text-presets/bds/BDS-PRESETS.md`: cách dùng công cụ.

**Ghi luật mới:** người dùng chốt thêm điều gì (khen, chê, sửa), thì sau khi giao video thêm một dòng vào bảng của `TALKING-HEAD.md`, cột Nguồn ghi tên video (video thực hành ghi "Thực hành n"). Luật mới mâu thuẫn với luật cũ thì sửa dòng cũ, không để hai dòng chọi nhau.

### Mâu thuẫn đã gỡ

| Chủ đề | Tài liệu cũ nói | Áp dụng |
|---|---|---|
| Số chữ một khối | HAU-KY: keyword 1–3 từ | **Luật 1: 2–5 chữ**, không chép nguyên câu |
| Chữ sau người | HAU-KY: tiêu đề lớn đặt sau người | **Luật 11: chỉ sau NGƯỜI**, chỗ nào bị che mất chữ thì không lồng |
| Lớp tối sau chữ | các cách cũ: dải theo khối… | **Luật 13**: gradient cố định từ mép trên, chỉ hiện khi có chữ, các khối liền nhau (nghỉ dưới 1 s) dùng chung một lần phủ |
| CTA cuối video | Vis: không CTA chữ | BĐS: **có CTA** theo `brand.json` của khách (HAU-KY quy tắc 10). Không có thông tin thì hỏi |
| Màu phim | HAU-KY: da ấm, nền tím vàng (phong cách 3 video mẫu) | Chỉ là một gợi ý. Màu theo LUT của khách (mục 7) |
| Đổi phong cách | Luật 5 (khác video trước) và HAU-KY 7 (không trùng quá 2/5 gen) | Gộp: so với **lịch sử của chính khách đó** (mục 6); điểm xuất phát là tổ hợp S1–S5 trong `lib/styles.json` |
| SHOTBOOK | TALKING-HEAD 6: theo `brand/VIS-SHOTS.md` | Viết `SHOTBOOK.md` theo mục 3 file này, phương pháp ở `docs/SHOTS.md`. Phần chuyển động camera chỉ áp cho cảnh minh họa và đồ họa, không áp cho cảnh người nói |
| Gạch bỏ | bộ preset có `canh-bao` (gạch ngang), AI MASTER cấm gạch chéo | Gạch **ngang** thẳng cho chữ sai thì được. Không dùng gạch **chéo** trên thẻ, icon. Ý "không nên" thể hiện bằng viền đỏ + ô cấm + chữ mờ (TRINH-BAY mục 2) |
| Mật độ minh họa | HAU-KY: 45–55% không thấy mặt; AI MASTER: ≥ 70% có minh họa | Cả hai: ≥ 70% thời lượng có hình minh họa (tính cả đồ họa trên cảnh người nói), trong đó 45–55% không thấy rõ mặt |
| Khung nhấn và chữ dày | luật 4: gần như mỗi câu một khối chữ; AI MASTER: một khung nhấn mỗi 6–10 s | Không chọi nhau: chữ chốt theo luật 4; khung minh họa (thẻ, sơ đồ) theo TRINH-BAY, đặt dưới khối chữ |
| Nhiều hiệu ứng | bộ quy tắc chọn chữ của Vis: xoay vòng preset, thưởng preset lạ | **Luật 8: mỗi loại thông tin một preset** cố định trong cả video. Xoay vòng là giữa các video, không phải trong một video (mục 4) |
| Mật độ SFX (M1) | ME4REAL: mọi dòng chữ, mọi cú cắt đều có tiếng; TRINH-BAY 3.8 cũ: không SFX cho cú cắt | Mỗi khối một tiếng (luật 10, 17); mỗi dòng của cụm `cao-trao` một tiếng nhỏ; cú cắt thường không tiếng; hook tối đa 4–5 lớp |
| Nền sau chữ (M2) | ME4REAL: làm mờ cả nền khi chữ lớn hiện | Gradient luật 13 là mặc định; nền mờ (`style.scrim: "mo"`) là một kiểu lớp tối để xoay vòng giữa các video |
| Chữ nhiều dòng (M3) | ME4REAL: cụm bậc thang 3–8 dòng gần trọn câu | Luật 1 áp cho từng dòng; preset `cao-trao` 3–5 dòng, tối đa 1 cụm mỗi 10–15 s |
| Video AI (M4) | ME4REAL: Kling, orbit / dolly AI, ảnh thành drone | **Không dùng** |
| Nhạc, montage (M5) | ME4REAL: một bài xuyên suốt, montage cắt mỗi ô nhịp | Chỉ khi có nhạc có quyền; ducking −18 đến −24 dB (`lib/music.mjs`); được một đoạn montage theo phách |
| Chuyển cảnh lớn (M6) | ME4REAL: flash mỗi 1,9 s trong montage | Giữ ~4 lần mỗi 150 s; cả đoạn montage tính 1 lần |
| Cách dựng | Chép `build.mjs` / `template.html` của một video mẫu | **Thư viện `lib/`**: mỗi video chỉ là `plan.json` + transcript (`lib/README.md`) |
| Xử lý sau chữ | Luật 18 cũ: luôn có viền tối mảnh, không bao giờ tỏa sáng; luật 13: lớp phủ gradient | **Luật 18 mới**: đo trước; đủ tương phản thì không xử lý; thiếu thì viền → bóng → tỏa sáng (chữ tối) → nền mờ + tối nhẹ. Gradient luật 13 chỉ còn là hình dạng của lớp phủ khi cần phủ, `style.scrim: "gradient-dam"` để phủ tới 0,6 |
| Font | Font `@fontsource` thay thế gần đúng | Bộ phong cách ME4REAL (S6) dùng Montserrat + font SVN người dùng cung cấp (`fonts/svn/`), chọn bằng cách so từng font với chữ trong video mẫu |
| Phụ đề | Khung hậu kỳ chuẩn: video ngắn cần phụ đề có hiệu ứng | **Luật 1 thắng: không phụ đề chạy.** Chữ chốt 2–5 chữ có hiệu ứng làm việc của phụ đề (M7) |
| Proxy | Khung chuẩn: ProRes Proxy / DNxHR để dựng mượt trên timeline | Không có timeline kéo tay: `lib/ingest.mjs` tạo bản dựng H.264 1080×1920 30 fps (đủ nhẹ để dựng, đủ nét để render). Cảnh 4K/6K, 10-bit chỉ đọc một lần lúc tạo proxy |
| Foley | Khung chuẩn: tự thu lại tiếng đời thực | Lấy tiếng có sẵn trong kho (vai SFX `foley`: bước chân, cửa, giấy tờ…), đặt tay trong `sfx_layer` khớp hành động trên hình |
| Bản xuất | Khung chuẩn: ProRes hoặc H.264/H.265 20–50 Mbps | Master H.264 25 Mbps render một lần; bản nháp nén từ master; không ProRes (nền tảng đăng nén lại H.264) |

## 2. Nhận việc

Đọc tin nhắn và file của người dùng, rồi tự điền các mục sau. Thiếu mục nào **ảnh hưởng tới kết quả** thì hỏi **một lần**, gộp thành một câu. Thiếu mục không quan trọng thì dùng mặc định và ghi giả định vào `projects/<video>/NOTES.md`.

| Mục | Mặc định khi thiếu |
|---|---|
| Khách / kênh (để lấy `clients/<khach>/brand.json`) | **phải hỏi**, vì phong cách và lịch sử theo khách |
| Clip thô | **phải có** |
| Tên dự án, thông tin dự án (giá, vị trí, tiện ích) | lấy từ lời nói. Số liệu không có trong lời và không có trong `info/` thì không tự thêm |
| CTA cuối video | theo `brand.json`. Chưa có thì hỏi |
| Nền tảng đăng | TikTok / Reels / Shorts dọc 1080×1920 |
| Hạn giao | 40–60 phút một video (TALKING-HEAD) |

Thư mục video: `node scripts/new-video.mjs <khach>-<du-an> --recipe R1 --style S1` tạo `projects/<video>/plan.json` và `work/<video>/`. Không chép video cũ. Thông tin dự án khách gửi để ở `projects/<video>/info/`.

**Không commit clip thô và file render**: chỉ giữ trong `work/` và `build/`, hai thư mục này đã gitignore. Repo chỉ chứa dữ liệu dựng: `plan.json`, transcript, SHOTBOOK, text-plan, hook.json, NOTES. Clip, giọng, mặt nạ để ở `work/<video>/`.

## 3. Quy trình: 5 bước hậu kỳ

Mỗi bước có một lệnh trong `lib/` (chi tiết định dạng ở `lib/README.md`). Luật của từng khâu nằm ở TALKING-HEAD và các mục sau của file này. Một video = `projects/<video>/` (commit) + `work/<video>/` (không commit).

**Bước 0 · Chuẩn bị** (2 phút): đọc bảng luật TALKING-HEAD, `brand.json`, mục 4c (phong cách đã dùng); chọn công thức (`lib/recipes.json`) và style (`lib/styles.json`). `node scripts/new-video.mjs <kenh>-<du-an>` tạo `plan.json` và cây thư mục.

**Bước 1 · Tiếp nhận & sắp xếp dữ liệu** — `node lib/ingest.mjs projects/<video>`
- Cây thư mục `work/<video>/`: `01_footage/{cam_a, cam_b, drone, broll}` · `02_audio/{voiceover, music, ambience, sfx}` · `03_assets` (logo, ảnh) · `05_exports/{draft, final}`. Phần "04 project" chính là `projects/<video>/` trong repo.
- A-roll (người nói, nội dung chính) để ở `cam_a` / `cam_b`; B-roll (cảnh dự án, drone, đặc tả, minh họa) ở `drone` / `broll`. B-roll dùng để che điểm cắt của A-roll và giữ nhịp đổi hình.
- Lệnh dò từng clip (độ phân giải, fps, độ sâu màu, Log / HLG) và tạo **proxy** 1080×1920 30 fps. Clip Log phải khai LUT kỹ thuật (mục 7) trước, không thì màu bạc.

**Bước 2 · Đồng bộ âm, dựng thô** — `plan.edit` + `node lib/assemble.mjs projects/<video>`
- **Đồng bộ âm:** mic thu rời (`edit.voice`) tự khớp với tiếng máy bằng tương quan chéo, báo độ lệch và độ tin cậy (dưới 0,5 thì kiểm tay).
- **Chọn đoạn (selects):** nghe hết bản thu, chọn lượt nói tốt nhất của mỗi câu, ghi vào `edit.aroll` theo thứ tự kịch bản (assembly). Cắt: câu vấp, câu nói lại, tiếng thở, chỗ ngập ngừng; chừa đệm khoảng 0,1 s quanh câu, không quãng im quá ~150 ms (HAU-KY mục 0, 3).
- Kết quả: bản dựng thô đúng mạch nội dung (`work/<video>/footage.mp4` + `voice.wav`), chưa cần chữ, màu.

**Bước 3 · Dựng tinh, khóa hình, âm thanh**
- **Dựng tinh:** cứ 2–4 s đổi hình một lần: đổi máy, punch-in (`punch`), B-roll (`edit.broll`: cắt thẳng hoặc hòa 0,2 s, đẩy / trôi máy), minh họa, chữ. **J-cut** (nghe câu sau trước khi thấy hình, `cut` > 0) và **L-cut** (thấy hình sau, tiếng câu trước còn chạy, `cut` < 0) để chỗ nối êm tai. Chuyển cảnh ưu tiên cắt giấu vết (theo chuyển động máy, vật đi ngang) và match cut; chuyển cảnh lớn (flash, light leak) tối đa ~4 lần / 150 s (M6).
- **Khóa hình (picture lock):** khách duyệt bản dựng thì `lib/assemble.mjs --lock`. Sau đó không đổi thứ tự, thời lượng; muốn đổi phải `--unlock` và làm lại transcript, chữ, SFX.
- **Transcript** theo giờ thật của bản đã dựng (`scripts/asr/`, sửa tay tên riêng, lỗi nghe), rồi **hook** (`hook.json` ≥ 3 phương án, `scripts/hook-pick.mjs`) và **SHOTBOOK.md** theo `docs/SHOTS.md`: từng đoạn ý, hình chính, chữ chốt, SFX, chỗ chữ sau người, bản đồ, minh họa "nói gì vẽ nấy" (TRINH-BAY mục 2).
- **Âm thanh 4 lớp** theo mục 5.

**Bước 4 · Màu, chữ, đồ họa** — `plan.color`, `plan.blocks` + `node lib/build.mjs projects/<video> --no-render`
- Màu theo mục 7 (sửa màu trước, LUT sau). Chữ chốt theo mục 4, chữ sau người theo TALKING-HEAD 4b, bản đồ theo `MAP.md`, CTA theo `brand.json`. Không phụ đề (luật 1).

**Bước 5 · Kiểm định, duyệt, xuất** — `lib/qc.mjs`, `lib/export.mjs`
- Trước render: `node lib/qc.mjs projects/<video>` (lint, kt-check, text-ink: nét chữ bị xén / đè dấu, mật độ) + snapshot khối đứng yên và đang chạy (TALKING-HEAD mục 6). **Render một lần**: `node lib/build.mjs projects/<video>`.
- Sau render: `node lib/qc.mjs projects/<video> --asr` phải đạt hết (mục 8).
- Xuất và giao theo mục 9.

## 4. Chữ chốt

- **Nguồn preset:** bộ chung 67 (`text-presets/presets.mjs`), bộ BĐS 22 và bộ ME4REAL 14 (`text-presets/bds/`), chỉ dùng preset có trong `lib/presets-duyet.json` (luật 20), thẻ bám lời (`text-presets/vis-cards.mjs`, hợp cho đoạn mở 3 giây và câu cao trào).
- **Gán vai:** mỗi khối chữ gắn một vai (bảng vai trong `text-presets/QUY-TAC-CHU.md`): số tiền, địa danh, tiện ích, pháp lý, so sánh, cảnh báo…
- **Luật 8, một loại thông tin một preset:** trong một video, cùng một vai luôn dùng cùng một preset. Ví dụ mọi số tiền dùng `gia-chot`, mọi địa danh dùng `dia-danh`. Chạy `node text-presets/pick-text.mjs projects/<video>/text-plan.json` với `"mode": "bds"` để script giữ cố định theo vai và tránh lặp phong cách của khách.
- **Một preset chính** cho khối chữ thường (cột "Preset chính" ở bảng 4c), khác video trước của cùng khách.
- **Chữ dày (luật 4):** gần như mỗi câu một khối, có chữ ngay từ giây 0,1.
- **Cấm theo luật:**
  - Chỉ dùng preset người dùng đã duyệt (luật 20, `lib/presets-duyet.json`; `lib/plan.mjs` chặn preset "không dùng"). Trước đây agent tự suy ra `chuong-moi`, `popRand`, `scatter` vi phạm luật 7 nên cấm; buổi duyệt 30/10/2026 người dùng đã xem clip và cho dùng.
  - Không vạch gạch hai bên chữ (luật 9). Trang trí `rules` đã gỡ khỏi `b-number`, `b-location`, `d-counter` (30/10/2026).
  - Không xén mép chữ nghiêng (luật 12).
- **Màu (luật 6):** chữ chính ưu tiên gradient. Màu nhấn lấy từ `brand.json`.
- **Đọc được (luật 15):** đo nền sau từng khối bằng `scripts/bg-sample.py` và `contrastPlan`. Chữ chính phải đạt tương phản ≥ 3:1, chữ dẫn trắng ≥ 4,5:1. Phủ tối tối đa mà vẫn chưa đủ thì thêm viền tối sát chữ.
- **Vị trí (luật 2, 3):** không che người, đầu người nằm dưới khối chữ. Chữ dẫn ôm sát chữ chính, chỉ chừa đủ để không đè dấu.

## 5. Âm thanh: 4 lớp

Âm thanh quyết định nửa chất lượng video. Bốn lớp, mỗi lớp một chỗ trong code:

| Lớp | Việc | Ở đâu |
|---|---|---|
| **1. Lời thoại** | rõ, đều, không tạp âm: lọc dưới 80 Hz → khử ồn nhẹ (10 dB) → EQ bớt "bùn" 300 Hz, thêm độ rõ 3 kHz → de-ess → nén 3:1 → −14 LUFS, đỉnh −1,5 dBTP | `lib/audio.mjs` `dialogue()`; ghi đè ở `plan.audio.dialogue` (`denoise`, `eq`, `deess`, `ratio`) |
| **2a. Tiếng môi trường** (ambience) | không gian thật: gió, phố, quán; mức nền cố định −38 LUFS (thấp hơn giọng ~24 dB), vuốt vào/ra | `plan.audio.ambience` `{ file, lufs }` |
| **2b. SFX điểm** (spot) | mỗi khối chữ một tiếng theo vai; lớp tiếng phụ cho chuyển động; foley khớp hành động | `lib/plan.mjs` + `lib/sfx-roles.json` (luật bên dưới) |
| **3. Nhạc nền** | hạ dưới giọng theo giờ lời nói (ducking): −20 dB khi nói (khoảng −18 đến −24), −6 dB khi không nói; cắt montage theo phách | `plan.music` (`lib/music.mjs`); chỉ khi khách gửi hoặc `brand.json` có, và phải có quyền dùng |

**Luật SFX:**
- mỗi khối chữ một tiếng, hai khối liền nhau không trùng loại tiếng (luật 10); cùng loại cách nhau ≥ 30 s;
- không để quá ít, không lặp một tiếng; thêm lớp tiếng nhỏ cho chuyển động phụ: chữ quay vòng, số chốt, nét gạch, chuyển cảnh (luật 17);
- chữ gõ đi với tiếng gõ phím đúng nhịp từng ký tự, kể cả câu mời (luật 16);
- cú cắt thường không tiếng; B-roll vào có whoosh khi ghi `sfx` (M1);
- **không đè lời:** tiếng phụ tự dời vào khe sau chữ; tiếng chính bắt đầu đúng âm đầu một chữ thì `lib/build.mjs` cảnh báo. Kiểm thật bằng `lib/qc.mjs --asr` (so theo đoạn): chữ nghe được trên giọng mà mất trên bản dựng thì ghi tay tiếng ngắn hơn (`sfx: ["tên", vol]`) hoặc dời khối;
- tiếng khởi đầu chậm (`reveal`, `riser`) đo ra nhỏ, không dùng làm tiếng chính.

**Mức và độ to:**
- `scripts/qa/sfx-levels.py` (trong `lib/qc.mjs`): đỉnh SFX trong khoảng −4 đến +6 dB so với RMS giọng tại chỗ đó (đích ≈ +2 dB), không tiếng NHỎ / TO.
- Bản trộn sau render tự chuẩn hóa về −14 LUFS, đỉnh ≤ −1,5 dBTP, kiểu tuyến tính (tỷ lệ các lớp giữ nguyên) — `loudnormMix` trong `scripts/build-video.mjs`.

## 6. Phong cách và lịch sử theo khách

Mỗi khách (sale, kênh, dự án) có `clients/<khach>/brand.json`, mẫu ở `clients/_mau/`:
- màu nhấn, cặp font ưu tiên (nếu có);
- LUT, CTA, logo;
- **lịch sử**: mỗi video ghi lại preset chính, font, cách hiện chữ, lớp tối.

Video mới phải khác video trước **của cùng khách** ở ít nhất 3 trong 5 "gen": preset chính, font chữ chính, font chữ dẫn, cách hiện chữ, kiểu lớp tối. Bảng 4c của TALKING-HEAD ghi các video thật đã giao để nhìn toàn cục.

## 7. Màu: sửa màu rồi mới phối màu

Thứ tự cố định, mỗi bước một chỗ khai trong `plan.json`:

1. **Log → Rec.709** (chỉ footage Log: S-Log, D-Log, C-Log…): LUT kỹ thuật của hãng máy, khai theo thư mục máy `plan.color.input_lut: { "cam_a": "slog3-709.cube" }`, áp khi tạo proxy (`lib/ingest.mjs` tự nhận clip Log và báo nếu thiếu).
2. **Sửa màu (color correction)**: đưa về chuẩn và đồng bộ các máy: cân trắng (`colortemperature`, `colorbalance`), khôi phục vùng tối / sáng, tương phản, bão hòa (`eq`) — `plan.color.correct` là chuỗi bộ lọc ffmpeg. Clip điện thoại nhạt: `eq=contrast=1.06…1.08:saturation=1.08…1.12` (luật 19). Hai máy lệch màu thì sửa máy phụ cho khớp máy chính trước khi phối.
3. **Phối màu (color grading)**: LUT nghệ thuật tạo mood & tone, trộn 50–80% (`plan.color.lut` + `strength`; mặc định LUT của khách trong `brand.json`). Có sẵn `am-nhe` (ấm, nhà ở) và `mat-sang` (sáng lạnh, căn hộ cao cấp) — `luts/README.md`.
4. Chữ và đồ họa nằm trên cùng, **không bao giờ** áp LUT lên chữ.

Luật:
- Một video một LUT nghệ thuật. Da người phải trông tự nhiên: soi ít nhất 3 khung có mặt người trước khi render. BĐS ưa trung tính, không grade mạnh (PHONG-CACH-ME4REAL mục M).
- Chỉ dùng `.cube` có quyền dùng, ghi nguồn ở `luts/SOURCES.md`.

## 8. Kiểm định (QC)

`node lib/qc.mjs projects/<video> [--asr]` gom các mục máy kiểm được, ghi `work/<video>/qc.json`; `lib/export.mjs --final` chỉ chạy khi QC đạt:

| Mục | Ngưỡng |
|---|---|
| `npx hyperframes lint` | 0 error |
| `kt-check` | 100% khối |
| `text-ink` (`scripts/qa/text-ink.cjs`) | 0 khối xén nét, 0 khối đè dấu / nét móc (luật 12, 21) |
| mật độ sự kiện (`scripts/qa/density.mjs`) | không quãng nào quá 3 s không có chữ, tiếng hay cú cắt |
| khung đen (`blackdetect`) | không có |
| hình đứng im (`freezedetect`, `motion_check.py` so với footage gốc) | không đoạn nào ≥ 0,8 s; nhiễu có sẵn trong clip không tính |
| độ to | −14 ± 0,5 LUFS, đỉnh ≤ −1,4 dBTP |
| mức SFX | không tiếng NHỎ / TO so với giọng |
| `--asr`: SFX không che lời | chữ nghe được trên giọng thì còn nghe được trên bản dựng (so theo đoạn ±1,5 s) |

Người kiểm thêm (máy không thấy được), xem ở toàn màn hình:
- **Các mục kiểm phần hình** ở TRINH-BAY mục 3: quét vùng chữ, chuyển cảnh, miệng, hook, % minh họa.
- **Dấu tiếng Việt:** ở mọi khối có hộp, viền hoặc gradient, chụp lúc đứng yên và soi dấu (Ắ, Ầ, Ữ, Ạ, Ặ).
- **Bản đồ:** đúng vị trí; nhãn địa danh đúng chính tả.
- **Số liệu và tên riêng** trên chữ khớp lời nói. Không tự thêm số không có nguồn.
- **Màu:** da người tự nhiên, các máy đồng màu, B-roll không lệch tông A-roll.

## 9. Duyệt và giao

1. **Bản nháp gửi duyệt:** `node lib/export.mjs projects/<video> --draft` → `work/<video>/05_exports/draft/<video>_draft_v<N>.mp4` (1080p ~1–4 Mbps, nhẹ để gửi Drive / Zalo). Gửi kèm danh sách khối chữ (thời điểm, chữ, preset).
2. Khách góp ý thứ tự / thời lượng cảnh → mở khóa hình, sửa `plan.edit`, làm lại từ bước 2. Góp ý chữ, màu, âm → sửa `plan.json`, render lại một lần.
3. **Bản cuối:** QC đạt thì `node lib/export.mjs projects/<video> --final` → `05_exports/final/<video>_final_v<N>.mp4`: chính master H.264 25 Mbps đã render (khung 20–50 Mbps), âm −14 LUFS, không mã hóa lại.
4. Người dùng duyệt xong thì:
   - commit dữ liệu dựng (`projects/<video>/`);
   - thêm một dòng vào bảng 4c của TALKING-HEAD;
   - ghi lịch sử vào `brand.json` của khách;
   - chạy `pick-text.mjs --commit`.
5. Người dùng sửa gì mà đó là ý muốn chung (không chỉ riêng video này) thì thêm thành luật (mục 1).

## 10. Giữ repo sẵn sàng phát hành

Giữ các điều sau ngay từ bây giờ để sau này tách ra dễ:
- Không ghi cứng tên người, kênh, thương hiệu trong code hay tài liệu chung. Mọi thứ riêng của khách nằm trong `clients/`.
- Đường dẫn trong code đều tương đối với gốc repo. Không phụ thuộc thư mục ngoài repo.
- **Tài nguyên bên ngoài đã có quyền dùng.** Chứng từ ghi ở `docs/SOURCES.md`; khi phát hành bản đóng gói phải giữ file này:
  - thẻ chuyển động và script lấy từ video-talkcraft (`docs/shots/`, `scripts/qa/motion_check.py`, `frame_signature.py`): đang dùng nội bộ thử nghiệm; phải có thư cho phép của tác giả trước khi dùng thương mại (`docs/SOURCES.md`);
  - gói SFX "Motion Design Sound Effects": đã mua và được phép dùng.

  Trước khi phát hành cho người khác, đọc lại điều khoản để chắc quyền đó bao gồm việc phân phối lại cho người dùng thứ ba. Nếu không, mỗi người tự nhập SFX bằng `sfx-import.mjs`.
- Font `@fontsource` (OFL) phát hành kèm được.
- Cửa vào là skill `.claude/skills/bds-editor/`; luật nằm trong `docs/`; mẫu cấu hình ở `clients/_mau/`; README hướng dẫn cài đặt cho người mới. Thông tin và cấu hình khách thật (`clients/<khach>/`, `projects/<khach>-*`) là dữ liệu riêng: khi phát hành cho người ngoài, tách sang repo dữ liệu riêng hoặc bỏ ra.

