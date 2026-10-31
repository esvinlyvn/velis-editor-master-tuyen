# Nguồn SFX: gói "Motion Design Sound Effects"

Các file dưới đây lấy từ gói âm thương mại **"Motion Design Sound Effects"**, qua repo `<ten-ban>/master-video` (nhánh `claude/awesome-fermi-edjroe`, thư mục `.claude/skills/ai-master/assets/sfx/`).
Bộ "đã duyệt" là 8 nhóm trong `config/sfx_pools.json` của master-video (APPROVED V4). Bản "thêm" được chọn bằng số đo trong `config/sfx_inventory.json` (độ dài tiếng, số nhịp, centroid, tỉ lệ dải trầm/cao) theo tính chất của bộ đã duyệt cùng nhóm.

**Lưu ý giấy phép:** đây là gói âm thương mại. Repo phải giữ private, không chia sẻ thư mục `sfx/` ra ngoài. File gốc của master-video không commit vào repo này; chỉ bản đã qua `scripts/sfx-import.mjs` nằm trong `sfx/`.

## Bảng file

| Tên trong Vis | Nhóm Vis | Nhóm master-video | File gốc | Lý do chọn |
|---|---|---|---|---|
| `text-tick` | ui | TEXT | `UI CLICK/UI_Click_86.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `text-tick-2` | ui | TEXT | `UI CLICK/UI_Click_46.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `text-tick-3` | ui | TEXT | `UI CLICK/UI_Click_117.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `text-tick-4` | ui | TEXT | `UI CLICK/UI_Click_58.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `click-4` | ui | UI | `UI CLICK/UI_Click_111.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `click-5` | ui | UI | `UI CLICK/UI_Click_56.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `click-6` | ui | UI | `UI CLICK/UI_Click_42.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `click-7` | ui | UI | `UI CLICK/UI_Click_65.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `click-8` | ui | UI | `UI CLICK/UI_Click_71.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `click-9` | ui | UI | `UI CLICK/UI_Click_88.wav` | click sáng như bộ duyệt (hi 0,98), 181 ms, 2 nhịp |
| `pop-5` | ui | POP | `UI ICON/UI_Icon_57.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `pop-6` | ui | POP | `UI ICON/UI_Icon_93.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `pop-7` | ui | POP | `UI ICON/UI_Icon_61.wav` | pop một nhịp 220 ms, sáng (hi 0,74) |
| `pop-8` | ui | POP | `UI ICON/UI_Icon_47.wav` | pop một nhịp 140 ms, gần nhất với bộ duyệt, hơi tối hơn cho đa dạng |
| `open` | accent | OPEN | `UI ICON/UI_Icon_52.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `open-2` | accent | OPEN | `UI ICON/UI_Icon_111.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `open-3` | accent | OPEN | `UI ICON/UI_Icon_51.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `open-4` | accent | OPEN | `UI ICON/UI_Icon_117.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `open-5` | accent | OPEN | `UI ICON/UI_Icon_10.wav` | cùng dáng phổ với bộ duyệt (hi 0,90), 328 ms, không nhịp lặp |
| `open-6` | accent | OPEN | `UI ICON/UI_Icon_39.wav` | sáng (centroid 10,4 kHz), 483 ms |
| `open-7` | accent | OPEN | `UI ICON/UI_Icon_100.wav` | ấm hơn (centroid 5,4 kHz), 373 ms, một nhịp |
| `thock` | impact | THOCK | `UI CLICK/UI_Click_118.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `thock-2` | impact | THOCK | `UI ICON/UI_Icon_31.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `thock-3` | impact | THOCK | `UI ICON/UI_Icon_85.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `thock-4` | impact | THOCK | `UI ICON/UI_Icon_32.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `thock-5` | impact | THOCK | `UI CLICK/UI_Click_96.wav` | tiếng trầm (low 0,60), 200 ms, đuôi 156 ms |
| `thock-6` | impact | THOCK | `UI CLICK/UI_Click_83.wav` | trầm vừa (low 0,48), 219 ms, đuôi rất ngắn |
| `meter` | ui | METER | `UI ICON/UI_Icon_84.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `meter-2` | ui | METER | `UI ICON/UI_Icon_19.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `meter-3` | ui | METER | `UI ICON/UI_Icon_83.wav` | chuỗi 4 tick 632 ms, đuôi ngắn |
| `meter-4` | ui | METER | `UI ICON/UI_Icon_62.wav` | chuỗi 6 tick 311 ms, ấm hơn bộ duyệt |
| `meter-5` | ui | METER | `UI ICON/UI_Icon_54.wav` | chuỗi 8 tick nhanh 408 ms |
| `meter-6` | ui | METER | `UI ICON/UI_Icon_36.wav` | chuỗi 4 tick sáng 377 ms |
| `error-soft` | accent | NEG | `UI ICON/UI_Error_02.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `error-soft-2` | accent | NEG | `UI ICON/UI_Error_08.wav` | đã duyệt trong master-video (sfx_pools.json) |
| `error-soft-3` | accent | NEG | `UI ICON/UI_Error_03.wav` | báo sai nhẹ một nhịp 359 ms, mềm hơn bộ duyệt |
| `notify-3` | ui | BELL | `UI NOTIFICATION BELL/UI_Notification_Bell_06.wav` | đã duyệt trong master-video (sfx_pools.json) |

## Không nhập

- `UI_Icon_48`, `UI_Icon_02` (POP) và `UI_Icon_29` (OPEN): dù thuộc bộ đã duyệt, sau khi chuẩn hóa vẫn nhỏ hơn các bản cùng tên 2,8–4,3 dB (đỉnh nhọn nên `sfx-import.mjs` không kéo lên được), vượt quy tắc lệch tối đa khoảng 2,5 dB.
- TEXT: không có file nào khác đủ sáng và ngắn như bộ đã duyệt (các click còn lại tối hơn rõ).
- BELL: các chuông còn lại có nhiều nốt (giai điệu) hoặc đuôi ngân trên 1 giây.
- Bánh răng, vuốt, âm dâng kéo dài: loại theo luật của Vis (không có trong ba thư mục UI CLICK / UI ICON / UI NOTIFICATION BELL được dùng).
