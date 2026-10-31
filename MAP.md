# MAP: cảnh bản đồ (BĐS & quy hoạch)

Dựng cảnh bản đồ 1080×1920 thành MP4 rồi ghép vào video như một b-roll. Bản đồ vector từ dữ liệu OpenStreetMap (bản build Protomaps), vẽ bằng MapLibre GL JS trong Chromium ngầm (WebGL phần mềm). Chỉ bước tải dữ liệu cần mạng; render chạy hoàn toàn trên máy.

**Khi nào dùng, khi nào không:** `HAU-KY.md` mục 12.3. **Chữ trên bản đồ:** nhãn là text preset của repo, theo `DAC-TA-CHU.md` mục 4.10 (`map_label`) và vùng an toàn mục 5.1.

```bash
npm run map:data hcm-dongnai                                   # 1 lần: tải + cắt bản đồ vùng → work/map/hcm-dongnai.pmtiles
npm run map -- scripts/map/examples/2-route.json --at 1,4,8    # chụp vài khung + contact sheet để duyệt
npm run map -- scripts/map/examples/2-route.json               # render → build/map/2-route/2-route.mp4
```

| File | Vai trò |
| --- | --- |
| `scripts/map/data.mjs` | `npm run map:data`: tải và cắt PMTiles cho một vùng, tự thử lại khi đứt, bỏ qua nếu đã có |
| `scripts/map/regions.json` | Vùng khai báo sẵn (bbox, zoom tối đa) |
| `scripts/map/render.mjs` | `npm run map`: đọc file cảnh → dựng trang → render song song nhiều trình duyệt → MP4 + gợi ý SFX |
| `scripts/map/scenes.mjs` | 5 mẫu cảnh + mẫu tự do `free` → kế hoạch dựng (camera, tuyến, vùng, ghim, nhãn) |
| `scripts/map/runtime.js` | Chạy trong trang: camera, vẽ tuyến/viền theo tiến độ, vùng tối, tua timeline GSAP của nhãn |
| `scripts/map/route.mjs` | Tuyến theo điểm đi qua, bám đường, hoặc tự tìm (Dijkstra trên lớp `roads`) |
| `scripts/map/styles.mjs` | Hai giao diện `dark` / `light`, màu nhấn theo `THEMES` của text-presets |
| `scripts/map/timing.mjs` | Mốc thời gian theo `transcript.json` |
| `scripts/map/embed.mjs` | `mapClip()`: ghép MP4 vào `build.mjs` của project |
| `scripts/map/geo.mjs`, `tiles.mjs`, `pmtiles-io.mjs` | Hình học, đọc ô bản đồ, đọc/ghi PMTiles v3 |
| `scripts/map/examples/` | 5 cảnh mẫu (+ tuyến dự kiến `2b`), transcript mẫu, danh sách điểm TP.HCM |

---

## 1. Dữ liệu bản đồ: `npm run map:data`

```bash
npm run map:data                                   # liệt kê vùng có sẵn
npm run map:data hcm-dongnai                       # vùng trong regions.json
npm run map:data binh-duong -- --bbox 106.4,10.85,106.95,11.5 --maxzoom 14
npm run map:data hcm-dongnai -- --force            # tải lại (bản build mới)
```
- Nguồn mặc định: bản build Protomaps mới nhất (`build.protomaps.com`, cập nhật hằng ngày từ OSM). Chọn bản cố định bằng `--build 20261027`, hoặc cắt từ file có sẵn bằng `--source đường/dẫn.pmtiles`.
- Chỉ tải những ô trong bbox, từ z0 tới `--maxzoom` (mặc định 14). Ví dụ vùng `hcm-dongnai`: 15 140 ô, 47 MB, khoảng 6 giây.
- Đã có file phủ đủ bbox và zoom thì bỏ qua (thêm `--force` để tải lại). Mỗi đoạn tải tự thử lại 6 lần (chờ 1 → 32 giây). File chỉ được thay khi tải xong (`.part` → đổi tên).
- **Bbox phải cao hơn vùng định xem khoảng 1,6 lần**, vì khổ dọc nhìn thấy nhiều vĩ độ hơn kinh độ. Ngoài bbox, bản đồ trống.
- Thêm vùng hay dùng vào `regions.json`. `viet-nam` chỉ tới z9, dùng cho cảnh toàn quốc.
- Ghi công **"© OpenStreetMap"** luôn hiện ở góc phải dưới cảnh. Không được bỏ.

## 2. File cảnh (JSON)

Mỗi cảnh một file, đặt trong `projects/<ten-video>/map/<ten-canh>.json`. Đường dẫn trong file (GeoJSON, transcript) tính từ thư mục của file cảnh, hoặc từ gốc repo.

| Trường | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `template` | ✔ | `fly` · `route` · `area` · `tour` · `compare` · `free` (mục 4) |
| `region` | ✔ | Tên file `work/map/<region>.pmtiles` |
| `style` | | `dark` (mặc định) · `light` (mục 5) |
| `theme` | | Màu nhấn cho tuyến, vùng, ghim, nhãn, lấy từ `THEMES` của text-presets: `coral` · `gold` · `lime` · `neon` (mặc định) · `violet` · `rose` |
| `points` | | Tên điểm → `[kinh độ, vĩ độ]`. Mọi chỗ cần điểm đều ghi được tên hoặc toạ độ |
| `duration` | | Giây, hoặc mốc theo lời thoại (`"@2.end+1"`). Bỏ trống thì mẫu tự tính |
| `fps` | | Mặc định 30 |
| `transcript`, `start` | | Bật mốc theo lời thoại (mục 6) |
| `name` | | Tên đầu ra (mặc định là tên file) |
| `labelPreset`, `labelScale` | | Preset và cỡ mặc định của nhãn (mặc định `b-location`, 0,74; `e-label` người dùng duyệt "không dùng", `lib/presets-duyet.json`) |
| `scaleBar` | | Hiện thước tỷ lệ km (mẫu `compare` tự bật) |

**Nhãn** (mọi chỗ ghi `label`, `fromLabel`, `toLabel`, `labels[]`):
```json
{ "texts": ["LONG THÀNH", "sân bay quốc tế"], "preset": "b-location", "at": "@2:sân bay", "hold": 2.5, "place": "above", "scale": 0.74 }
```
- `texts` là các dòng của text preset, giống `presetHtml()` (`text-presets/README.md` mục 4). Với `e-label`: dòng 1 là tên riêng trong hộp màu, dòng 2 là nhãn nhỏ đè góc. Viết hoa ngay trong dữ liệu.
- **Chữ trên hình chỉ là chữ bạn ghi.** Công cụ không tự thêm số km, diện tích hay thời gian. Số km tự tính chỉ in ra console để tham khảo.
- `place`: `above` (mặc định, có đường đứt nối xuống ghim) · `below` · `center` · `pos: [x, y]` để đặt cố định trên khung. Khối chữ luôn bị kẹp vào vùng an toàn x 60–1020, y 200–1320.
- `hold`: số giây giữ nhãn rồi cho ra. Các mẫu tự đặt `hold` để nhãn trước ra rồi nhãn sau mới vào (không hai lockup cùng lúc). Riêng mẫu `compare` giữ 2 tên khu cùng lúc, vì đó là nội dung so sánh.

**Thêm tay** vào mẫu bất kỳ: `labels`, `pins` (`{point, at, ping}`), `extraPlaces` (tên địa danh chữ nhỏ), `extraAreas`, `extraRoutes`. `camera: [{t, center, zoom, bearing, pitch, ease}]` thay hẳn camera của mẫu.

## 3. Tuyến đường: ưu tiên điểm do người dựng chỉ định

```json
"route": { "via": ["q1", "an-phu", "long-thanh"], "follow": "roads" }
"route": { "via": [[106.70, 10.77], [106.75, 10.79], [107.05, 10.77]] }
"route": { "geojson": "tuyen-vanh-dai-3.geojson" }
"route": { "auto": { "from": "q1", "to": "long-thanh" } }
```
1. **`geojson`**: dùng nguyên hình học trong file (LineString / MultiLineString). Mặc định coi là **tuyến chưa xây**: vẽ nét đứt và gắn thẻ **"DỰ KIẾN"** giữa tuyến. Đổi chữ thẻ bằng `"tag"`. Tuyến đã có thì ghi `"planned": false`.
2. **`via`**: danh sách điểm đi qua do bạn chỉ định. `follow: "line"` (mặc định) nối thẳng các điểm; ghi điểm dày thì tuyến khớp đường thật. `follow: "roads"` cho mỗi đoạn giữa 2 điểm liền nhau bám theo mạng đường. Điểm nào cách đường quá 300 m thì in cảnh báo.
3. **`auto`**: chỉ có điểm đầu, điểm cuối, công cụ tự tìm đường ngắn nhất theo thời gian ước tính. Đây là **phương án dự phòng**, lần nào chạy cũng in cảnh báo. Không xét đường một chiều; đường trong khu chưa nối vào mạng thì tuyến dừng ở mép khu.

Thêm `"planned": true` cho `via` hoặc `auto` nếu đó là tuyến chưa có.

## 4. Năm mẫu cảnh + mẫu tự do

Ảnh duyệt của từng mẫu: `build/map/<tên>/contact-sheet.jpg` (sinh bằng `--at`).

### 4.1 `fly`: bay tới điểm (`examples/1-fly.json`)
Camera mở ở góc rộng, bay tới điểm đích. Xung quanh tối dần, ghim rơi xuống, nhãn hiện ra.
| Trường | Mặc định | |
| --- | --- | --- |
| `target` | ✔ | Điểm đích |
| `wide` | `{ zoom: zoom − 4 }` | Góc mở đầu (`center`, `zoom`) |
| `zoom`, `bearing`, `pitch` | 13, 0, 0 | Góc kết |
| `flyAt`, `flyDur` | 0,8 · 3,2 | Lúc bắt đầu bay, thời gian bay |
| `pinAt` | lúc tới nơi | Lúc ghim rơi xuống |
| `label` | | Nhãn ở điểm đích |
| `area` | | Tô thêm vùng quanh đích (cùng cú pháp với mẫu `area`) |
| `dim` | bật | `false` để tắt; `{ km, amount }` chỉnh bán kính sáng và độ tối |
| `places` | | Tên địa danh hiện ở góc rộng, tắt khi bay vào |

### 4.2 `route`: vẽ tuyến (`examples/2-route.json`, tuyến dự kiến `examples/2b-route-du-kien.json`)
Toàn vùng → tuyến sáng dần theo đường đi, có chấm đầu tuyến → (mặc định) bay về điểm cuối, xung quanh tối đi.
| Trường | Mặc định | |
| --- | --- | --- |
| `route` | ✔ | Mục 3 |
| `from`, `to` | đầu/cuối tuyến | Vị trí ghim |
| `drawAt`, `drawDur` | 1,2 · 3,6 | Lúc tuyến bắt đầu chạy, thời gian chạy hết |
| `drawEnd` | | Thay cho `drawDur`: lúc tuyến chạy tới đích (vd. `"@2:Long Thành"`) |
| `fromPinAt`, `toPinAt` | theo tuyến | Lúc ghim đầu/cuối rơi xuống |
| `end` | `"to"` | `"to"` bay về điểm cuối · `"fit"` giữ khung toàn tuyến |
| `endZoom` | tự tính | Zoom khi bay về điểm cuối |
| `fromLabel`, `toLabel` | | Nhãn đầu/cuối. Nhãn đầu tự ra trước khi nhãn cuối vào |
| `area`, `places`, `dim` | | Như `fly` |

### 4.3 `area`: tô vùng / vòng bán kính (`examples/3-area.json`)
Lần lượt từng vùng: viền vẽ dần quanh vùng, nền tô nhạt, nhãn hiện ngay trên mép vùng (vòng tròn thì nhãn ở trên ghim tâm).
```json
"areas": [
  { "geojson": "ranh-du-an.geojson", "label": { "texts": ["DỰ ÁN X", "45 ha"] } },
  { "fromMap": { "layer": "landuse", "kind": "aerodrome", "near": "tan-son-nhat", "zoom": 11 }, "label": {…} },
  { "circle": { "center": "q1", "km": 3 }, "label": { "texts": ["BÁN KÍNH 3 KM", "quanh Quận 1"] } },
  { "bbox": [106.70, 10.76, 106.73, 10.79] }
]
```
- `fromMap` lấy ranh có sẵn trên bản đồ: lớp `landuse` (kind `aerodrome`, `park`, `industrial`, `university`…), `water`… chứa điểm `near`. Đọc ở `zoom` 10 (vùng lớn), tăng lên 11–13 với vùng nhỏ. Vùng nằm vắt qua mép ô bị cắt theo ô, khi đó dùng file GeoJSON.
- Mỗi vùng: `at` (mặc định cách nhau `step` = 1,5 giây), `opacity`, `pin`, `pinAt`, `labelAt`. Một vùng duy nhất thì `"dim": {}` làm tối phần ngoài.

### 4.4 `tour`: nối nhiều điểm, camera đi lần lượt (`examples/4-tour.json`)
Toàn cảnh → điểm 1 → điểm 2 → … → (mặc định) lùi ra toàn cảnh. Đường nối vẽ dần trong lúc camera di chuyển. Bay xa thì zoom tự "vồng" ra giữa chừng.
| Trường | Mặc định | |
| --- | --- | --- |
| `stops` | ✔ | `[{ point, label, at, dwell, zoom, bearing }]`; `at` là lúc tới điểm (ghi theo lời thoại được) |
| `zoom` | toàn cảnh + 2,2 | Zoom ở mỗi điểm |
| `intro`, `travel`, `dwell` | 1,2 · 1,6 · 1,9 | Giữ toàn cảnh, thời gian di chuyển, thời gian dừng |
| `connect`, `follow` | `true`, `"line"` | Vẽ đường nối; `"roads"` để bám đường |
| `end` | `"overview"` | `"last"` dừng ở điểm cuối |

### 4.5 `compare`: chia đôi so sánh hai khu vực (`examples/5-compare.json`)
Khung trên là `a`, khung dưới là `b`, vạch chia màu nhấn ở giữa. Tên khu đặt cố định ở đầu mỗi nửa.
```json
"a": { "area": { "fromMap": {…} }, "label": { "texts": ["TÂN SƠN NHẤT", "hiện tại"] } },
"b": { "area": { "geojson": "…" }, "point": "…", "zoom": 12.5, "label": {…} }
```
- **Mặc định hai nửa cùng tỷ lệ** (cùng zoom, có thước km), để người xem so được độ lớn thật. `"sameScale": false` cho mỗi nửa tự khớp khung; khi đó độ lớn trên hình **không** so sánh được, nên đừng dùng để nói "lớn gấp mấy lần".

### 4.6 `free`: tự khai báo camera và từng lớp
Dùng khi bản đồ là **nền xuyên suốt** cả video (lời nói dắt camera qua nhiều chỗ). Không có camera hay nhãn tự sinh; mọi thứ khai báo tay, mốc ghi theo lời thoại.
```json
"focusY": 1150,
"camera": [{ "t": 0, "center": "C", "zoom": 11.2 }, { "t": "@8", "center": "E", "zoom": 13 }],
"lines": [
  { "id": "da-co", "geojson": "tuyen.geojson#da-co", "planned": false, "at": 0.3, "end": "@0:chưa nối",
    "fade": [{ "at": "@8", "to": 0.55 }], "pulse": [{ "from": "@4", "to": "@5.end" }] },
  { "id": "doan-1", "geojson": "tuyen.geojson#doan-1", "planned": true, "color": "#FF4A3D", "at": "@0:vòng tròn", "dur": 0.5 }
],
"tags": [{ "point": "m1", "text": "ĐOẠN 1", "at": "@10", "out": "@12", "color": "#FF6B5B" }]
```
- `lines[]`: như `route` (`geojson`, `via`, `auto`) cộng `color`/`glow` (màu riêng), `width`, `head` (chấm đầu tuyến), `reverse`, `at` + `end`/`dur` (vẽ dần), `out` (tắt), `fade` (đổi độ mờ để làm nền cho đoạn đang nói), `pulse` (nhấp nháy trong khoảng), `sfx` (gợi ý âm khi bắt đầu vẽ).
- **3D:** camera nghiêng bằng `pitch` và xoay bằng `bearing` trong `camera[]`; tuyến vẫn nằm phẳng trên mặt đất. **Tuyến đường giữ nét 2D**: dựng tuyến thành tường nhìn xấu (đã thử ở video Vành đai 2, bị loại); 3D dành cho motion graphics (`scripts/kt.mjs`: thẻ lật, vòng nghiêng, lịch lật). Nghiêng 30–40° là đủ chiều sâu. Tùy chọn `"wall": { "px": 46, "wpx": 6, "riseAt": "@1", "shade": 0.85, "color": "#FF4A3D" }` dựng tuyến thành tường (fill-extrusion) mọc dần. Chiều cao `px` và bề dày `wpx` tính theo pixel trên hình, nên tường không cao vọt khi camera zoom vào.
- **Vật chạy theo tuyến:** `"mover": { "icon": "truck", "color": "#FFD23F" }`, icon đi theo đầu tuyến lúc vẽ.
- **`"crisp": true`** (cấp cảnh): tuyến và tường dùng màu đặc, không glow mờ, không trong suốt. Mờ đi hay nhấp nháy thì pha màu với nền. Nên bật khi tuyến tự chồng lên nhau (hai chiều đường, nút giao): bản glow trong suốt sẽ cộng sáng thành đốm, nhìn chỗ sáng chỗ nhòe như lỗi.
- `geojson: "file#id"` chọn feature theo `properties.id`. `tags[]`: thẻ chữ nhỏ trên bản đồ (`at`, `out`, `color`). `focusY`: dời tâm điểm nhìn xuống (vd. 1150) để chừa nửa trên cho cụm ý của HyperFrames.

## 5. Giao diện và màu

| `style` | Nền | Dùng khi |
| --- | --- | --- |
| `dark` | Xanh than. Ở góc rộng (zoom ≤ 8) màu nền, đường, sông tự sáng thêm, giảm dần tới zoom 12 | Mặc định, hợp với nhãn neon / glow |
| `light` | Be xám nhạt, đường trắng, nước xanh nhạt | Video tông sáng, cần thấy rõ đường phố |

- Màu nhấn lấy từ `THEMES` của text-presets (`theme`). Bản `light` dùng màu `solid` tối đi 18% cho tuyến và thêm viền trắng dưới tuyến.
- Nhãn chọn chế độ chữ bằng `contrastPlan()` của text-presets: `light` → chữ có viền tối, glow giảm. Nếu theme trùng tông nền, nhãn tự đổi theme khác và in cảnh báo.
- Bản đồ nền không có chữ (đã bỏ toàn bộ lớp chữ và biểu tượng). Tên địa danh chỉ hiện khi bạn khai báo `places`.

## 6. Mốc theo lời thoại

Mọi trường thời gian (`at`, `drawAt`, `drawEnd`, `flyAt`, `pinAt`, `fromPinAt`, `toPinAt`, `duration`, `stops[].at`, `labels[].at`, `pins[].at`, `camera[].t`…) nhận số giây tính từ đầu cảnh, hoặc tham chiếu `transcript.json`:

| Viết | Nghĩa |
| --- | --- |
| `"@3"` / `"@3.end"` | Đầu / cuối cụm `i = 3` |
| `"@3:Long Thành"` | Lúc bắt đầu nói chữ "Long Thành" trong cụm 3. Ước lượng theo tỷ lệ ký tự trong cụm, giống cách chia phụ đề |
| `"@3:Long Thành+0.2"`, `"@3.end-0.3"`, `"@3+1.5"` | Cộng/trừ giây |

```json
"transcript": "../transcript.json",
"start": "@5",
"toLabel": { "texts": ["LONG THÀNH", "sân bay"], "at": "@7:Long Thành" }
```
- `start` là mốc cảnh bắt đầu trong video (số giây hoặc `"@…"`). Mốc `"@…"` được quy về giây trong cảnh bằng cách trừ `start`. Ghép cảnh vào video phải đúng mốc này.
- Gợi ý SFX (`<tên>.sfx.json`) đã cộng `start`, nên mốc khớp thẳng với `sfx.json` của project.

## 7. Render và ghép vào video

```bash
npm run map -- projects/<video>/map/<canh>.json --at 0.5,2,4,6,8   # duyệt: frames/*.png + contact-sheet.jpg
npm run map -- projects/<video>/map/<canh>.json                    # MP4
npm run map -- a.json b.json c.json --workers 3                    # nhiều cảnh liền
npm run map -- <canh>.json --dry                                   # chỉ dựng trang, in cảnh báo
```
Kết quả ở `build/map/<tên>/`:
- `<tên>.mp4`: H.264 CRF 16, 1080×1920, không tiếng.
- `<tên>.sfx.json`: gợi ý SFX (`pin-drop` ở ghim, `whoosh-soft` khi camera bay, `line-draw` khi tuyến chạy hoặc vẽ viền), đã lọc cách nhau ≥ 0,6 giây.
- `index.html`: trang cảnh, mở trực tiếp được để xem.

**Tốc độ** (máy cloud 4 vCPU, không GPU, cảnh `1-fly` 201 khung):

| Trình duyệt song song | Thời gian | ms/khung (thực tế) | Một trình duyệt vẽ + chụp |
| --- | --- | --- | --- |
| 1 | 118 s | 589 | 463 + 101 ms |
| 2 | 92 s | 458 | 653 + 112 ms |
| 3 | 93 s | 463 | 815 + 139 ms |
| 4 | 91 s | 450 | 1091 + 179 ms |

Song song chỉ nhanh hơn khoảng 1,3 lần, vì SwiftShader vẽ đa luồng và một trình duyệt đã dùng khoảng 3,5/4 nhân. Từ 2 trình duyệt trở lên, máy 4 nhân hết CPU. Máy nhiều nhân hơn sẽ lợi hơn. Bản render song song giống bản 1 trình duyệt (PSNR ≥ 44 dB, chỉ khác do nén ở chỗ nối đoạn). Ước lượng: **mỗi giây cảnh mất khoảng 14 giây render** trên máy 4 nhân.

Mặc định `--workers` = số nhân ÷ 1,5 (tối đa 4). Mỗi trình duyệt tốn khoảng 300 MB RAM. Lần đầu mở trang mỗi trình duyệt mất khoảng 1 giây để nạp ô bản đồ.

**Ghép vào `build.mjs` của project:**
```js
import { mapClip } from "../../scripts/map/embed.mjs";
const m1 = mapClip("build/map/long-thanh/long-thanh.mp4", out, { id: "map1", start: 12.4 });   // start = "start" của file cảnh
html = html.replace("{{MAP1}}", m1.html);                                                     // đặt trước {{CAPTIONS}}
sfxCfg.cues.push(...m1.cues);                                                                 // SFX gợi ý trong khoảng cảnh
// template: tl.fromTo("#map1", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 12.4);  (tween lớp bọc, không tween <video>)
```
- `<video>` phải có `id` (lint `media_missing_id`). `mapClip` tự đặt `<id>-v`.
- Cảnh bản đồ đã có chữ: thêm các cụm của đoạn đó vào `NO_CAP`, không chạy phụ đề trùng (`HAU-KY.md` 12.2 ý 6).

## 8. Kiểm tra trước khi giao
1. `--at` tại giữa mỗi nhịp (mở, tuyến chạy, tới đích, nhãn xong), xem `contact-sheet.jpg`: nhãn không che ghim/tuyến đang nói, dấu tiếng Việt đủ, không trống mép bản đồ.
2. Console không có `⚠` lạ. Riêng cảnh báo tuyến `auto` thì thay bằng `via` trước khi giao.
3. Sau render: cắt vài khung từ MP4 so với khung duyệt. Đo nhảy hình: `ffmpeg -i x.mp4 -vf "select='gte(scene,0)',metadata=print" -an -f null - 2>&1 | grep scene_score | sort -t= -k2 -nr | head`; đỉnh nên < 0,05.
4. Số liệu trên nhãn (km, ha, phút) phải do người nói nói ra hoặc có nguồn (`DAC-TA-CHU.md` 1.6).

## 9. Kỹ thuật và lỗi đã gặp

| Vấn đề | Cách xử lý trong công cụ |
| --- | --- |
| Chụp khung chậm 8–9 giây/khung | Compositor của Chromium cũng chạy trên SwiftShader. `--disable-gpu-compositing` giảm còn khoảng 0,15 giây phần vẽ |
| Sự kiện `idle` báo trước khi vẽ xong | SwiftShader vẽ bất đồng bộ: đọc 1 pixel (`readPixels`) để chờ vẽ xong thật rồi mới chụp |
| MSAA (`antialias: true`) | Chậm gấp đôi, không đẹp hơn rõ: để tắt; đường đã có khử răng cưa trong shader |
| `flyTo`, `easeTo` chạy theo đồng hồ thật | Không dùng: camera nội suy theo keyframe, tính lại cho từng khung |
| Đồ thị đường đứt | Protomaps đã gộp/giản lược đường: tự tìm giao điểm giữa các đoạn. Cầu, hầm, cao tốc không nối khi cắt chéo |
| GitHub releases bị chặn (không có binary `pmtiles`) | `data.mjs` đọc/ghi PMTiles v3 bằng Node, chỉ dùng `fetch` + Range |
| Nhãn hộp màu (`e-label`) che dấu nặng ("HỌA" → "HOA") | Sửa trong `text-presets/presets.mjs`: chữ dưới nhãn góc có dấu thì nhãn ra hẳn ngoài mép hộp |
| So sánh 2 khu khác zoom làm sai độ lớn | `compare` mặc định cùng tỷ lệ + thước km |

**Giới hạn hiện tại:** chưa có địa hình 3D hay ảnh vệ tinh (chỉ bản đồ vector). Chưa tìm đường theo chiều một chiều. `fromMap` lấy được vùng có trong OSM, còn ranh dự án thì cần file GeoJSON riêng.

## 10. Chép công cụ sang repo khác

Đã kiểm bằng cách chép đúng danh sách dưới đây vào một thư mục trống, `npm install`, rồi chạy `map:data` và `map`: chạy được.

**File và thư mục** (giữ nguyên đường dẫn tương đối so với gốc repo, vì mã tìm `node_modules/`, `text-presets/`, `work/map/` theo vị trí đó):
```
scripts/map/            # toàn bộ thư mục (data, render, scenes, runtime, route, tiles, geo, styles, timing, embed, pmtiles-io, regions.json, examples/)
text-presets/presets.mjs
text-presets/presets.css
text-presets/fonts.mjs
MAP.md                  # tài liệu (không bắt buộc để chạy)
```
Không cần: `scripts/kt.mjs` (chỉ dùng cho chữ chuyển động trong `build.mjs` của video), `projects/`, `sfx/`. `work/` và `build/` do công cụ tự tạo; nên thêm `work/` và `build/` vào `.gitignore`.

**package.json**: bắt buộc có `"type": "module"`, cùng các dòng:
```json
"scripts": {
  "map:data": "node scripts/map/data.mjs",
  "map": "node scripts/map/render.mjs"
},
"devDependencies": {
  "@fontsource/anton": "^5.3.0",
  "@fontsource/barlow-condensed": "^5.3.0",
  "@fontsource/be-vietnam-pro": "^5.3.0",
  "@fontsource/dancing-script": "^5.3.0",
  "@fontsource/great-vibes": "^5.3.0",
  "@fontsource/lexend": "^5.3.0",
  "@fontsource/montserrat": "^5.3.0",
  "@fontsource/playfair-display": "^5.3.0",
  "@mapbox/vector-tile": "3.0.0",
  "@protomaps/basemaps": "5.7.2",
  "gsap": "^3.13.0",
  "maplibre-gl": "5.24.0",
  "pbf": "3.3.0",
  "playwright": "1.63.0",
  "pmtiles": "4.5.0"
}
```
8 gói `@fontsource/*` là font của `text-presets/fonts.mjs` (nhãn trên bản đồ). Phiên bản `maplibre-gl`, `pmtiles`, `@protomaps/basemaps` ghim cứng vì đã kiểm với nhau.

**Trên máy:** Node.js 22+, `ffmpeg` + `ffprobe` trong PATH, Chromium cho Playwright (`npx playwright install chromium` nếu máy chưa có; máy cloud của repo này đã có sẵn ở `/opt/pw-browsers`). `npm run map:data` cần mạng một lần để tải bản đồ; render chạy offline.

## 11. Skin: cảnh bản đồ theo phong cách kênh

Khóa `skin` trong file cảnh đè màu nền, màu nhấn, font và CSS nhãn, để bản đồ cùng tông với phần còn lại của video (ví dụ màu nhấn của khách trong `clients/<khach>/brand.json`). Không khai báo thì giữ nguyên giao diện `dark` / `light` và `theme`.

| Khóa | Ý nghĩa |
| --- | --- |
| `fonts` | `[["gói @fontsource", [độ đậm…]], …]`: nhúng thêm font (subset latin + vietnamese) để dùng trong `css` |
| `bg` | Màu nền trang (lộ ra trước khi ô bản đồ tải xong) |
| `palette` | Màu đè lên giao diện nền, cùng khóa với `PALETTE` trong `scripts/map/styles.mjs` (`background`, `earth`, `water`, `park_a`, `buildings`, `highway`, `major`, `minor_a`…) |
| `accent` | Đè màu nhấn: `line`, `glow`, `fill`, `head`, `casing` |
| `crispBg`, `outline` | Màu nền và viền tối mảnh của tuyến khi bật `crisp` |
| `css` | CSS thêm vào cuối trang, ví dụ đổi kiểu `.mtag` (thẻ trên tuyến), `.mplace`, `#attr` |

