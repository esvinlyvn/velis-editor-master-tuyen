# lib/ — thư viện dựng (thay cho "chép video mẫu")

Mỗi video chỉ là **dữ liệu**: `projects/<video>/plan.json` + `transcript.json` (+ `SHOTBOOK.md`, `NOTES.md`, `info/`). Mọi code dựng nằm ở đây và dùng chung. Muốn đổi cách dựng cho mọi video sau thì sửa thư viện; muốn đổi một video thì sửa `plan.json` của nó. Không chép `build.mjs` hay `template.html` của video nào.

```
node scripts/new-video.mjs <kenh>-<du-an> --recipe R1 --style S1   # bước 0: plan.json + cây thư mục work/<video>/
#   bỏ cảnh quay vào work/<video>/01_footage/{cam_a,cam_b,drone,broll}/, mic rời vào 02_audio/voiceover/
node lib/ingest.mjs projects/<video>               # bước 1: dò clip (Log? fps?), tạo proxy 1080×1920
node lib/assemble.mjs projects/<video>             # bước 2–3: đồng bộ mic, A-roll + B-roll + J/L-cut theo plan.edit
#   nhận diện giọng trên work/<video>/voice.wav → projects/<video>/transcript.json (sửa tay); khách duyệt dựng → --lock
node lib/build.mjs projects/<video> --no-render    # bước 3–4: âm 4 lớp, màu, chữ, SFX → in bảng khối chữ, tương phản, cảnh báo
node lib/qc.mjs projects/<video>                   # lint, kt-check, text-ink, mật độ; xem snapshot
node lib/build.mjs projects/<video>                # render MỘT lần (master 25 Mbps) + chuẩn hóa −14 LUFS
node lib/qc.mjs projects/<video> --asr             # bước 5: khung đen, đứng im, độ to, SFX, che lời
node lib/export.mjs projects/<video> --draft       # bản nháp gửi duyệt → --final khi QC đạt
```

Video mẫu đi đủ chuỗi trên: `npm run example`, xem `projects/example/plan.json` và `SHOTBOOK.md`.

Kiểm thư viện sau mỗi lần sửa: `npm run demo` (dựng `tests/demo` bằng media tổng hợp, không render). Sửa preset chữ thì chạy thêm `npm run test:me4real` rồi `kt-check` trên `build/me4real/index.html` (21 khối). Sửa preset chữ, `lib/template.html` hay runtime chữ thì chạy `npm run test:kiem-chu` (mọi preset đã duyệt × 3 bộ câu chữ: dấu nặng / nét móc, câu dài, chữ rất ngắn × 3 cặp font; kt-check + text-ink).

## Thành phần

| File | Vai trò |
| --- | --- |
| `ingest.mjs` | Bước 1: cây thư mục, dò clip (độ phân giải, fps, bit, Log / HLG), proxy 1080×1920 30 fps, LUT kỹ thuật Log → Rec.709 |
| `assemble.mjs` | Bước 2–3: đồng bộ mic rời (tương quan chéo), A-roll theo đoạn chọn, punch-in, J/L-cut, B-roll (cắt / hòa, đẩy / trôi máy), khóa hình |
| `audio.mjs` | Lời thoại (lọc, khử ồn, EQ, de-ess, nén, −14 LUFS), tiếng môi trường |
| `qc.mjs` | Bước 5: bảng kiểm ĐẠT / LỖI, ghi `work/<video>/qc.json` |
| `export.mjs` | Bước 5: bản nháp (nén nhẹ), bản cuối (master), đánh số phiên bản |
| `build.mjs` | Lệnh dựng duy nhất: pha màu / LUT, đo tương phản, chữ sau người, nhạc, SFX, font, render, chuẩn hóa âm lượng |
| `plan.mjs` | Đọc `plan.json` → dòng thời gian khối chữ + SFX; kiểm luật 1, 4, 7, 8, số liệu khớp lời, cụm cao-trao đủ lâu |
| `template.html` | Template chung: xử lý sau chữ theo tương phản (luật 18 mới: không gì / viền / bóng / tỏa sáng / nền mờ + tối nhẹ, `build.mjs` chọn cho từng khối), chữ sau người, ô chữ tự co |
| `music.mjs` | Nhạc nền: hạ dưới giọng theo giờ lời nói (ducking), lưới phách cho montage |
| `styles.json` | Tổ hợp phong cách S1–S6 (preset chính, font theo vai display / sans / script / script2 / serif, cách hiện, lớp tối). S6 = ME4REAL: Montserrat + Lobster (viết tay) + font SVN ở `fonts/svn/` (`"file:fonts/svn/<tên>.otf"`). Viết tay mặc định Lobster (luật 22) |
| `presets-duyet.json` | Preset người dùng đã duyệt dùng / không dùng (luật 20). `plan.mjs` chặn preset "không dùng" và biến thể "không dùng" (`bien_the_khong`); `pick-text` và `scripts/map` cũng đọc file này |
| `palettes.json` | Màu gradient + bộ màu theo nghĩa (main, so, an-toan, noi-chon, thoi-gian, phu-dinh) |
| `sfx-roles.json` | Vai SFX → tên trong kho; vai chữ → vai SFX; 6 công thức tổ hợp tiếng |
| `recipes.json` | Công thức khung video R1, R2, R5, R6, R7 |

Nguồn phương pháp: `docs/PHONG-CACH-ME4REAL.md` (mã K, H, C, I, T, A, E, R dùng trong các file trên).

## plan.json

```json
{
  "video": "kenh-du-an",
  "kenh": "kenh",
  "recipe": "R1",
  "style": "S5",
  "roles": { "con-so-tien": "gia-chot", "trang-thai": "nhan-neon", "cao-trao": "cao-trao", "cta": "go-chu" },
  "hook_peak": "0:view",
  "grade": "eq=contrast=1.08:saturation=1.12",
  "blocks": [
    { "role": "mo-dau", "at": 0.1, "o": { "m": "VEN SÔNG" } },
    { "role": "con-so-tien", "at": "0:3", "shift": -0.3, "o": { "k": "GIÁ CHỈ", "value": 3, "suffix": " TỶ" } },
    { "role": "trang-thai", "at": "1:sở", "color": "an-toan", "o": { "m": "SỞ HỮU LÂU DÀI" } },
    { "role": "cao-trao", "at": "2:mà", "o": { "lines": [
      { "parts": [{ "t": "mà còn", "v": "dem" }, { "t": "mở ra", "v": "khoa" }], "at": "2:mà" },
      { "t": "Ven Sông", "v": "cam", "at": "2:ven" },
      { "t": "hiếm có", "v": "chot", "at": "2:hiếm" } ] } }
  ],
  "sfx_layer": [{ "at": 12.4, "role": "chuyen-canh", "why": "cú chuyển cảnh trong clip" }]
}
```

| Trường | Ý nghĩa |
| --- | --- |
| `style` | Mã trong `styles.json`, hoặc `{ "base": "S4", "scrim": "mo", "palette": "bac-xanh", "display": [...], "sans": [...] }` để đổi từng gen. Luật 5: khác video trước cùng kênh ≥ 3/5 gen |
| `roles` | Vai chữ → preset, lấy từ `pick-text.mjs` (mode `bds`). Vai `chot-y` mặc định là preset chính của style. Luật 8: một vai một preset |
| `blocks[].at` | Số giây, hoặc `"cụm:chữ"` (`"3:sở"`, lần thứ hai `"3:sở#1"`); mốc theo chữ tự lùi `shift` (mặc định −0,1 s) |
| `blocks[].out` | Bỏ trống = tắt trước khối sau 0,35 s; khối cuối giữ tới hết |
| `blocks[].color` | Tên nghĩa trong bộ màu (`so`, `an-toan`, `noi-chon`, `thoi-gian`, `phu-dinh`) hoặc tên màu; mặc định `main` (hoặc `mau_nhan` của brand.json) |
| `blocks[].sfx` | `"auto"` (mặc định: chọn theo vai, không lặp loại trong 30 s, tiếng phụ tự né âm đầu chữ), `["tên", vol]` ghi tay (vd. khi QC báo tiếng che lời), hoặc `null` |
| `blocks[].top`, `size`, `p` | Vị trí y (mặc định 250; ≥ 900 = dải dưới), cỡ chữ, preset ghi đè |
| `blocks[].behind`, `behindFrac` | Chữ sau người: tên cửa sổ trong `plan.behind` (`{ "intro": [0, 4.8] }`); mặt nạ ở `work/<video>/matte/` (TALKING-HEAD 4b) |
| `o` | Tham số preset (`text-presets/bds/BDS-PRESETS.md`, bộ ME4REAL ở mục 2b); `cao-trao` dùng `lines` với vai `dem` / `nho` / `muc` / `khoa` / `cam` / `vien` / `so` / `chot`, `align` trai \| giua \| phai |
| `p: "chung:<id>"` | Preset bộ chung (`text-presets/presets.mjs`), chỉ preset đã duyệt (luật 20). Chữ ghi ở `o.texts`: mỗi phần tử một dòng của preset theo thứ tự, `null` bỏ dòng đó. `lib/build.mjs` sinh sẵn HTML + GSAP, đặt trong ô chữ như các bộ khác (vị trí, lớp tối, luật 18, kt-check), tự tăng tốc cho vào xong trong ~1,2 s. Ví dụ `{ "p": "chung:a-hook", "at": 0.1, "o": { "texts": ["Căn hộ", "VEN SÔNG", null] } }`. Kiểm: `npm run test:chung` |
| `hook_peak` | Mốc đỉnh hook: tiếng chốt của công thức "bùng mở" rơi đúng đây, tiếng dâng chạy trước 1,6 s |
| `music` | `{ "file": "work/<video>/music.mp3", "bed_db": -6, "duck_db": -20, "bpm": 120, "montage": [[15, 32]] }`; chỉ khi có nhạc có quyền dùng |
| `info_numbers` | Số lấy từ `info/` mà lời không nói (để kiểm số liệu không báo nhầm) |
| `edit` | Dựng: `voice` (mic rời, trong `work/<video>/`), `aroll` `[{ src, in, out, cut, punch }]` (`cut` > 0 J-cut, < 0 L-cut), `broll` `[{ src, at, dur, in, tr: "cut" \| "dissolve", move: "push" \| "drift", sfx }]`, `fit` `{ cam: "crop" \| "blur" }` — chi tiết đầu `assemble.mjs` |
| `lock` | Mã khóa hình do `assemble.mjs --lock` ghi; đừng sửa tay |
| `color` | `input_lut` `{ cam: "file.cube" }` (Log → Rec.709), `correct` (bộ lọc ffmpeg sửa màu), `lut` + `strength` (LUT nghệ thuật, 0,5–0,8). `grade` cũ = `correct` |
| `audio` | `dialogue` `{ denoise, eq, deess, ratio }` ghi đè chuỗi lời thoại; `ambience` `{ file, lufs }` (mặc định −38 LUFS) |
| `tail` | Giây giữ hình sau lời cuối (mặc định 0,3); `assemble.mjs` kéo đoạn A-roll cuối dài thêm đúng bằng chừng đó |
| `bitrate` | Bitrate master (mặc định `25M`) |
| `media` | Ghi đè đường dẫn `footage` / `voice` (mặc định `work/<video>/`) |

## Thêm vào thư viện

- **Preset chữ mới:** `text-presets/bds/` (commit `core:`), thêm cỡ mặc định vào `SIZE` trong `plan.mjs`, thêm vai vào `pick-text.mjs`.
- **Tổ hợp phong cách mới** người dùng đã duyệt: thêm `S6…` vào `styles.json`.
- **Công thức khung mới:** thêm vào `recipes.json`.
- **Luật mới** của người dùng: ghi vào bảng luật `TALKING-HEAD.md` trước, rồi mới sửa code ở đây cho khớp.
