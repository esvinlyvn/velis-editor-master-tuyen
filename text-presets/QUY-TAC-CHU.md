# Quy tắc chọn chữ chốt: bds-editor

Luật gốc nằm ở bảng **luật đã chốt** của `TALKING-HEAD.md` (luật 1–17) và `docs/VAN-HANH.md` mục 4. File này chỉ hướng dẫn cách **chọn preset** cho từng khối chữ.

## Quy trình

1. Từ transcript đã cắt, đánh dấu khối chữ. Chữ dày (luật 4): gần như mỗi câu một khối, có chữ ngay từ giây 0,1.
2. Viết `projects/<video>/text-plan.json`:
   ```json
   { "video": "kenh-du-an", "mode": "bds", "client": "kenh", "family": "rieng",
     "main": "B18:tieu-de-kep",
     "moments": [ { "id": "k1", "role": "ten-du-an", "text": "GREEN CITY", "energy": "cao" } ] }
   ```
   - `main`: preset chính cho khối chữ thường. Phải khác preset chính của video trước cùng khách (`brand.json`, bảng 4c).
   - `family`: bộ font của bộ 60 nếu cặp font video trùng một bộ A–E; không trùng thì ghi `rieng`.
3. Chạy `node text-presets/pick-text.mjs projects/<video>/text-plan.json`. Ở `mode: "bds"` script gợi ý bộ BĐS, bộ ME4REAL và preset bộ chung đã duyệt (in sẵn đúng tên `plan.json` nhận: tên trần hoặc `chung:<id>`), và:
   - **giữ cố định preset theo vai** trong cả video (luật 8);
   - loại preset người dùng đã duyệt "không dùng" (`lib/presets-duyet.json` nếu repo có, luật 20 của bds-editor);
   - so lịch sử **chỉ với video trước của cùng khách**;
   - không có ứng viên hợp vai thì dùng preset chính.
4. Duyệt gợi ý. Đổi được khi có lý do (bố cục, độ dài chữ, đầu người, tương phản); ghi lý do vào SHOTBOOK.
5. Giao xong: `--commit`, và ghi lịch sử vào `clients/<khach>/brand.json`.

## Bảng vai

Dùng các vai chung trong `pick-text.mjs` (mo-dau, chot-y, con-so-tien, con-so, tang-giam, dia-danh, thuat-ngu, so-sanh, canh-bao, trich-loi, liet-ke, trang-thai, thoi-gian, qua-khu, phan-moi, canh-quan, phan-khuc, cau-hoi), cộng thêm 5 vai riêng cho BĐS (mode `bds` chỉ gợi ý preset bộ BĐS `B18` và bộ ME4REAL `M4`, vì `lib/build.mjs` chỉ dựng hai bộ này; bảng ở `bds/BDS-PRESETS.md` mục 2 và 2b):

| Vai | Khi lời đang… | Ví dụ |
|---|---|---|
| `ten-du-an` | gọi tên dự án hay khu | tên dự án, tên khu |
| `tien-ich` | kể tiện ích | "hồ bơi tràn", "công viên 2 ha" |
| `phap-ly` | nói giấy tờ, pháp lý, tiến độ | "sổ hồng riêng", "bàn giao quý 4" |
| `cta` | kêu gọi cuối video | "Nhắn tin nhận bảng giá" |
| `cao-trao` | nói câu đắt nhất, cao trào của đoạn | "không chỉ là nơi ở mà còn mở ra một cơ hội hiếm có" → preset `cao-trao`, tối đa 1 cụm mỗi 10–15 s |

## Khác với kênh Vis

| | Vis (content tự động) | bds-editor (clip quay thật) |
|---|---|---|
| Mật độ | thưa, 3–6 chữ chốt mỗi video | dày, gần như mỗi câu một khối |
| Trong một video | xoay vòng preset, thưởng preset lạ | mỗi vai một preset cố định |
| Lịch sử | theo kênh Vis | theo từng khách |
| CTA | không có | có, theo `brand.json` |
| Chữ sau người | không áp dụng | có, chỉ sau người (luật 11) |
