# Hướng dẫn cho người mới

Bộ công cụ này nhận **clip quay thật về bất động sản** (người nói trước máy, cảnh quay dự án) và dựng thành video dọc 1080×1920: cắt nhịp, chữ chốt, minh họa, bản đồ, SFX, màu. Người làm chính là **Claude Code** chạy trên cloud của Claude. Anh/chị gửi clip, nói muốn gì, duyệt bản xem trước và góp ý. Claude ghi lại những gì anh/chị dạy vào repo, nên video sau làm đúng ý hơn video trước.

Anh/chị sẽ có **một repo riêng**, private, chỉ mình anh/chị có quyền. Luật anh/chị dạy chỉ nằm trong repo đó. Repo không nối với ai khác.

Làm lần lượt từ bước 1 đến bước 6 (bước 7 khi muốn nhận bản cập nhật). Mỗi bước có phần **Xong khi** để biết đã làm đúng. Chỗ nào ghi **(người giao)** là việc người giao bộ công cụ làm, anh/chị chỉ cần chờ.

| Bước | Việc | Thời gian |
|---|---|---|
| 1 | Chuẩn bị tài khoản Claude và GitHub | 15 phút |
| 2 | Nhận repo riêng từ repo mẫu | 5 phút |
| 3 | Cho Claude quyền vào repo | 3 phút |
| 4 | Chọn mạng cho môi trường (Network Full) | 1 phút |
| 5 | Làm video đầu tiên | 40–60 phút |
| 6 | Dạy luật mới, kỹ năng mới | khi cần |
| 7 | Nhận bản cập nhật từ repo mẫu | khi có bản mới |

Phần sau bước 7: [chạy trên máy của mình](#chạy-trên-máy-của-mình), [lỗi hay gặp](#lỗi-hay-gặp), [quyền sử dụng tài nguyên](#quyền-sử-dụng-tài-nguyên), [bảng lệnh](#bảng-lệnh-nhanh).

---

## Bước 1. Chuẩn bị tài khoản

1. **Tài khoản Claude** gói **Pro** hoặc **Max** ở [claude.ai](https://claude.ai). Gói Max làm được nhiều video hơn mỗi ngày.
2. **Tài khoản GitHub** (miễn phí). Chưa có thì:
   1. Vào [github.com/signup](https://github.com/signup), nhập email, mật khẩu, tên người dùng (ví dụ `nguyenvana`).
   2. Xác nhận email.
   3. Bật xác thực 2 lớp: ảnh đại diện → **Settings** → **Password and authentication** → **Enable two-factor authentication**. Dùng app như Google Authenticator. Lưu mã khôi phục ở chỗ an toàn.
3. **Gửi tên người dùng GitHub** (ví dụ `nguyenvana`) cho người giao bộ công cụ.

**Xong khi:** đăng nhập được claude.ai và github.com; người giao đã có tên GitHub của anh/chị.

---

## Bước 2. Nhận repo riêng từ repo mẫu

**(người giao)** mời anh/chị vào repo mẫu với quyền đọc.

1. Mở email từ GitHub có tiêu đề kiểu "… invited you to … " (hoặc vào [github.com/notifications](https://github.com/notifications)) → **View invitation** → **Accept invitation**.
2. Trong trang repo mẫu, bấm nút xanh **Use this template** → **Create a new repository**.
3. Điền:
   - **Owner:** tài khoản của anh/chị.
   - **Repository name:** tên tùy ý, ví dụ `bds-editor`.
   - Chọn **Private**.
   - Để trống ô **Include all branches**.
4. Bấm **Create repository**.
5. Báo người giao là đã tạo xong.

**(người giao)** gỡ anh/chị khỏi repo mẫu. Repo vừa tạo không bị ảnh hưởng: nó thuộc hẳn về anh/chị, không ghi "forked from", người giao không có quyền gì trên đó.

> **Đừng bấm Fork.** Fork giữ dây nối với repo mẫu, và bị xóa theo khi anh/chị bị gỡ khỏi repo mẫu.

**Xong khi:** repo mới nằm dưới tên anh/chị (`github.com/<ten-ban>/bds-editor`), có nhãn **Private**, có các file `CLAUDE.md`, `HUONG-DAN.md`, `package.json`.

---

## Bước 3. Cho Claude quyền vào repo

1. Vào [claude.ai/code](https://claude.ai/code), đăng nhập tài khoản Claude.
2. Nếu được hỏi kết nối GitHub thì làm theo (hoặc vào [claude.ai/connect-github](https://claude.ai/connect-github)).
3. Cài **Claude GitHub App** cho repo của mình: vào [github.com/apps/claude](https://github.com/apps/claude) → **Install** (hoặc **Configure** nếu đã cài) → chọn tài khoản của anh/chị → **Only select repositories** → chọn repo vừa tạo ở bước 2 → **Save**.

**Xong khi:** ở claude.ai/code, lúc chọn repo cho phiên mới, thấy repo của mình trong danh sách.

---

## Bước 4. Chọn mạng cho môi trường (một lần, 1 phút)

1. Ở claude.ai/code, bấm vào **tên môi trường** cạnh ô chọn repo (thường là "Default") → **Edit**.
2. **Network access:** chọn **Full** → **Lưu**. (Cần để tải model nhận diện giọng nói và tải clip từ Google Drive.)

Không cần dán gì thêm: repo **tự cài mọi thứ** mỗi khi mở phiên (`.claude/hooks/session-start.sh`). Phiên đầu tiên chờ vài phút để cài, các phiên sau vào ngay.

Mỗi phiên chạy trên một máy ảo riêng, lấy repo từ GitHub về, làm xong thì đẩy lên lại. **Máy ảo bị xóa sau khi phiên kết thúc**: thứ gì chưa push lên GitHub hoặc chưa tải về là mất.

**Xong khi:** môi trường đã để Network **Full**. Làm video luôn ở bước 5.

---

## Bước 5. Làm video đầu tiên

### 5a. Đưa clip lên Google Drive

1. Tải clip `.mp4` / `.mov` lên Google Drive (hoặc Dropbox). Nhiều clip thì bỏ chung một thư mục, đặt tên theo thứ tự: `01.mp4`, `02.mp4`…
2. Tài liệu dự án (bảng giá, vị trí, tiện ích, logo) để cùng thư mục. Claude chỉ đưa lên video số liệu **có trong lời nói hoặc trong tài liệu này**, không tự bịa.
3. Chuột phải thư mục → **Chia sẻ** → **Bất kỳ ai có đường liên kết** → **Người xem** → **Sao chép đường liên kết**.

> Clip của khách là dữ liệu riêng. Chỉ bật chia sẻ trong lúc làm, xong thì tắt. Claude để clip trong `work/`, thư mục này **không bao giờ** được đưa lên GitHub.

### 5b. Giao việc

Tạo phiên mới (repo của mình, môi trường `dung-video`) và nói tự nhiên, càng rõ càng ít bị hỏi lại:

```
Edit video cho anh Tuấn, dự án Sunrise Riverside.
Clip và tài liệu: <link Google Drive>.
Khách mới: màu nhấn xanh ngọc #19C3B1, CTA "Nhắn anh Tuấn để nhận bảng giá". Đăng TikTok.
```

Claude cần biết ba điều, thiếu thì nó hỏi **một lần**:
- **Khách là ai.** Mỗi khách có cấu hình riêng ở `clients/<khach>/brand.json`: màu, LUT, CTA, logo, lịch sử phong cách. Khách mới thì Claude tạo từ `clients/_mau/`.
- **CTA cuối video:** câu kêu gọi, ví dụ "Nhắn tin để nhận bảng giá".
- **Clip:** link.

### 5c. Claude làm gì

Không cần nhớ, chỉ để biết đang tới đâu. Claude đi đúng 5 bước hậu kỳ chuyên nghiệp (`docs/VAN-HANH.md` mục 3):
1. **Tiếp nhận:** đọc luật, tải clip về đúng cây thư mục (A-roll người nói, B-roll cảnh dự án, mic rời, nhạc), kiểm từng clip (độ phân giải, Log hay không), tạo bản dựng nhẹ.
2. **Dựng thô:** đồng bộ tiếng mic rời với máy quay, nhận diện lời nói, chọn lượt nói tốt nhất, cắt chỗ vấp, chỗ im.
3. **Dựng tinh:** đổi máy, phóng cận, chèn B-roll che điểm cắt, J-cut / L-cut cho êm tai; xử lý âm 4 lớp (giọng, tiếng môi trường, SFX, nhạc hạ dưới giọng). Mỗi phiên mới phải tải model nhận diện giọng khoảng 3 GB, mất vài phút.
4. **Màu và chữ:** sửa màu, phối màu bằng LUT; hook 3 giây đầu; chữ chốt, minh họa, bản đồ. Kế hoạch ghi ở `SHOTBOOK.md`.
5. **Kiểm và xuất:** tự kiểm (chữ, khung đen, hình đứng im, độ to, SFX có che lời không), render **một lần**, gửi bản nháp nhẹ vào khung chat kèm danh sách khối chữ.

Mất khoảng 40–60 phút. Không cần ngồi canh: đóng tab rồi quay lại sau, phiên vẫn chạy.

### 5d. Xem, góp ý, duyệt

1. Bấm thẻ file trong khung chat để xem bản xem trước.
2. Góp ý cụ thể, có giây và lý do:
   - "Giây 12 chữ che mặt anh Tuấn, dời lên trên."
   - "Chữ GIÁ 3 TỶ 2 màu vàng khó đọc trên nền trời, đổi màu hoặc thêm nền."
   - "Hook đầu chưa đủ gắt, thử câu 'Căn này rẻ hơn thị trường 400 triệu'."
3. Ưng rồi thì nói: **"Duyệt. Gửi bản cuối, rồi commit và push."** Claude sẽ:
   - xuất và gửi file MP4 bản cuối (H.264 25 Mbps, đã qua kiểm định). **Tải về ngay**, vì máy ảo sẽ bị xóa;
   - commit dữ liệu dựng (không commit clip và file render);
   - ghi lịch sử phong cách vào `brand.json` của khách, để video sau của khách này tự đổi kiểu;
   - thêm một dòng vào bảng 4c của `TALKING-HEAD.md`;
   - push lên GitHub.

**Xong khi:** đã tải MP4 bản cuối về máy, và trang repo trên GitHub có commit mới của video này.

---

## Bước 6. Dạy luật mới, kỹ năng mới

Mỗi phiên Claude bắt đầu trắng trơn. Nó chỉ biết **những gì ghi trong repo**. Vì vậy mọi điều anh/chị dạy phải được **ghi vào file, commit và push**, nếu không thì phiên sau quên.

### 6a. Dạy gì, ghi ở đâu

| Muốn dạy | Ghi vào | Nói với Claude ví dụ |
|---|---|---|
| Luật chung cho mọi video ("chữ không bao giờ đè lên mặt", "không dùng màu đỏ") | bảng **Luật người dùng đã chốt** đầu `TALKING-HEAD.md` | "Chốt luật: …. Ghi vào bảng luật, nguồn là video này." |
| Điều riêng của một khách (màu, logo, CTA, khách ghét font nào) | `clients/<khach>/brand.json`, ô `ghi_chu` | "Ghi cho khách anh Tuấn: luôn để logo góc trên trái." |
| Cách trình bày, minh họa, hook | `docs/TRINH-BAY.md` | "Thêm vào TRINH-BAY: nói về tiện ích thì hiện icon + khoảng cách phút." |
| Cách vận hành, thứ tự bước, mặc định | `docs/VAN-HANH.md` | "Đổi mặc định: video không quá 75 giây." |
| Kiểu chữ mới | `text-presets/` | "Tạo preset chữ mới tên 'gia-soc' giống mẫu này: …" (gửi ảnh hoặc link video) |
| Tiếng SFX mới | `sfx/` qua `scripts/sfx-import.mjs` | "Tải các file ở <link> rồi nhập vào kho SFX." |
| Màu phim (LUT) | `luts/*.cube`, nguồn ghi ở `luts/SOURCES.md` | "Thêm LUT ở <link> tên am-ap, cường độ 0,6, làm mặc định cho khách anh Tuấn." |
| Một quy trình hoàn toàn mới (video tin tức, video so sánh dự án…) | một **skill** mới ở `.claude/skills/<ten>/SKILL.md` | xem 6c |

### 6b. Câu mẫu để dạy luật

```
Từ giờ trở đi: số tiền luôn viết "3,2 tỷ" chứ không viết "3.200.000.000".
Chốt thành luật vào bảng của TALKING-HEAD.md, nguồn là video anh-tuan-sunrise. Commit và push.
```

Luật mới **trái** với luật cũ thì nói rõ để Claude sửa dòng cũ, không để hai dòng chọi nhau:

```
Bỏ luật 9 (không vạch gạch hai bên chữ dẫn). Giờ tôi muốn có vạch gạch mảnh. Sửa lại dòng đó.
```

Khi hai chỗ nói khác nhau, chỗ đứng trước thắng: **lời anh/chị trong phiên đang làm** > bảng luật `TALKING-HEAD.md` > `brand.json` của khách > `docs/VAN-HANH.md`, `docs/TRINH-BAY.md` > các tài liệu còn lại.

### 6c. Dạy một kỹ năng mới (skill)

Skill là một bản hướng dẫn mà Claude tự mở khi gặp đúng loại việc. Repo có sẵn skill `.claude/skills/bds-editor/SKILL.md` cho việc dựng clip BĐS; mở ra xem để biết một skill trông thế nào.

Cách nhanh nhất là nói với Claude:

```
Tạo skill mới tên "video-so-sanh": khi tôi gửi 2 dự án và nói "so sánh", dựng video chia đôi màn hình,
mỗi bên một dự án, có bảng so sánh giá / vị trí / pháp lý ở giữa video, kết bằng CTA của khách.
Dùng lại luật chữ, SFX, kiểm như video thường. Ghi vào .claude/skills/video-so-sanh/SKILL.md, commit và push.
```

Phần `description` ở đầu file skill quyết định **khi nào** Claude dùng nó, nên ghi rõ những câu anh/chị hay nói. Muốn gọi thẳng thì gõ `/video-so-sanh`.

### 6d. Học từ video mẫu

```
Đây là video tham khảo: <link>. Phân tích cách họ làm hook, đặt chữ, nhịp cắt, chuyển cảnh.
Cái gì hợp với luật hiện có thì ghi vào docs/TRINH-BAY.md thành mục "Học từ <tên>".
Cái gì trái luật thì liệt kê cho tôi quyết. Không copy nguyên thiết kế của họ.
```

### 6e. Kiểm đã "học" chưa, và sửa khi dạy sai

- Mở **phiên mới** và hỏi: "Luật về số tiền hiện ghi ở đâu? Đọc lại cho tôi." Trả lời đúng nghĩa là đã lưu.
- Dạy sai thì nói: "Hoàn tác commit dạy luật vừa rồi." Claude dùng `git revert`, không mất lịch sử.

---

## Bước 7. Nhận bản cập nhật từ repo mẫu

Repo mẫu được cập nhật khi có quy tắc, kỹ năng mới đã chốt. Repo của anh/chị **không tự đổi**; muốn lấy bản mới thì làm bước này. Luật, kỹ năng anh/chị tự dạy (bước 6) và các video đã làm vẫn giữ nguyên.

1. Báo người giao để được mời lại vào repo mẫu (quyền Read), chấp nhận lời mời.
2. Mở phiên trên repo **của mình**, dán (thay `<link repo mẫu>` bằng link người giao gửi):
   ```
   Cập nhật từ repo mẫu <link repo mẫu>: thêm remote "mau" nếu chưa có, fetch nhánh main của nó rồi gộp vào main của mình
   (lần đầu thêm --allow-unrelated-histories). Chỗ trùng: lấy bản của repo mẫu cho lib/, scripts/, text-presets/, sfx/, docs/;
   giữ của mình cho projects/, clients/ và các dòng luật mình đã thêm trong bảng TALKING-HEAD.md (gộp cả hai bảng, đánh số tiếp).
   Chạy npm install, npm run demo, npm run test:chung, npm run example; đạt hết mới commit và push. Báo lại có gì mới.
   ```
3. Báo người giao là xong để họ gỡ quyền vào repo mẫu.

---

## Chạy trên máy của mình

Không bắt buộc. Khi đã quen cloud, chạy trên máy giúp clip dài nhanh hơn và clip không phải lên mạng. Cùng một repo, cùng luật: làm ở đâu cũng được, miễn là **pull trước khi làm, push sau khi xong**.

**Yêu cầu:** macOS, Linux, hoặc Windows 10/11 có **WSL2**; RAM từ 8 GB (nên 16 GB); ổ trống khoảng 15 GB.

**Cài công cụ.** Mọi lệnh gõ trong Terminal (Windows: app Ubuntu sau khi cài WSL).

macOS:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

```bash
brew install git node@22 ffmpeg python uv gh
```

Windows: mở PowerShell quyền Administrator, chạy `wsl --install -d Ubuntu`, khởi động lại máy, mở app Ubuntu, rồi làm như Linux. Để repo trong `~` của Ubuntu, **không** để trong `/mnt/c/...` (chạy rất chậm).

Linux (Ubuntu / Debian):

```bash
sudo apt update && sudo apt install -y git ffmpeg python3 python3-venv curl build-essential gh
```

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Đóng Terminal, mở lại:

```bash
nvm install 22 && curl -LsSf https://astral.sh/uv/install.sh | sh
```

Claude Code (mọi hệ điều hành). Cài xong mở Terminal mới, gõ `claude`, đăng nhập theo trình duyệt:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Git và GitHub (chọn **GitHub.com → HTTPS → Login with a web browser**):

```bash
git config --global user.name "Nguyễn Văn A" && git config --global user.email "email-github@example.com"
```

```bash
gh auth login && gh auth setup-git
```

**Lấy repo về và cài thư viện:**

```bash
git clone https://github.com/<ten-ban>/bds-editor.git ~/bds-editor && cd ~/bds-editor && npm install
```

```bash
npx hyperframes doctor && npx playwright install --with-deps chromium
```

```bash
uv venv ~/.asr && VIRTUAL_ENV=~/.asr uv pip install faster-whisper numpy imageio pillow "rembg[cpu]" opencv-python-headless
```

```bash
npm run example
```

Có `build/example/output.mp4` khoảng 15,5 giây là xong.

**Làm việc:** chép clip vào `work/<ten-video>/01_footage/cam_a/` (máy chính), `cam_b/` (máy phụ), `drone/` hoặc `broll/` (cảnh phụ), mic rời vào `02_audio/voiceover/`, rồi `cd ~/bds-editor && git pull && claude` và giao việc như bước 6b (thay link bằng đường dẫn thư mục). Bản nháp và bản cuối nằm ở `work/<ten-video>/05_exports/`. Xong thì bảo Claude "commit và push".

---

## Lỗi hay gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Đầu phiên báo hook cài đặt (SessionStart) lỗi | Thường do Network chưa để **Full** (bước 4) nên không tải được gói. Sửa rồi mở phiên mới. Phiên đang chạy thì nhờ Claude: "chạy lại .claude/hooks/session-start.sh" |
| Không thấy repo của mình khi tạo phiên | Chưa cài Claude GitHub App cho repo đó (bước 3) |
| Claude báo không push được | Như trên: kiểm Claude GitHub App có repo của mình chưa |
| Không tải được clip hay model, báo bị chặn | Network access của môi trường chưa để **Full** (bước 4) |
| Link Google Drive tải về file HTML nhỏ | Link chưa để "Bất kỳ ai có đường liên kết" (bước 5a) |
| Mất file render | Máy ảo đã bị xóa. Lần sau tải về ngay khi Claude gửi. Dữ liệu dựng đã push thì bảo Claude render lại |
| Không thấy nút **Use this template** | Chưa chấp nhận lời mời, hoặc người giao chưa bật Template repository. Báo người giao |
| Chữ tiếng Việt mất dấu, dấu bị cắt | Nói với Claude: "giây X mất dấu chữ Y" |
| Claude làm sai điều đã dặn hôm trước | Điều đó chưa được ghi vào repo. Dạy lại và bảo ghi vào bảng luật (bước 6) |
| Claude báo hết lượt dùng | Gói Pro có giới hạn theo giờ. Chờ, hoặc nâng lên Max |

Bí thì tả lỗi cho Claude kèm nguyên văn thông báo. Claude đọc lỗi và tự sửa được, hoặc chỉ anh/chị chỗ cần bấm.

---

## Quyền sử dụng tài nguyên

Đọc `docs/SOURCES.md` **trước khi làm video cho khách trả tiền**:

- **Thẻ chuyển động và vài script kiểm** lấy từ video-talkcraft, giấy phép **phi thương mại**. Dùng cho video thương mại thì phải có thư cho phép của tác giả, hoặc không dùng phần đó.
- **Kho SFX:** hỏi người giao xem giấy phép có cho anh/chị dùng không. Nếu không, tự mua gói SFX rồi nhờ Claude nhập bằng `scripts/sfx-import.mjs`.
- **Font** `@fontsource` (giấy phép OFL): dùng tự do.
- **LUT, nhạc nền, logo** tự thêm: chỉ dùng thứ có quyền, ghi nguồn vào `luts/SOURCES.md` hoặc `docs/SOURCES.md`.

---

## Bảng lệnh nhanh

Phần lớn thời gian chỉ cần nói với Claude. Bảng này để tra khi muốn tự làm hoặc kiểm Claude.

| Việc | Lệnh |
|---|---|
| Dựng thử mẫu | `npm run example` |
| Dựng một video, không render | `node projects/<video>/build.mjs --no-render` |
| Dựng và render | `node projects/<video>/build.mjs` |
| Kiểm lỗi template | `cd build/<video> && npx hyperframes lint` |
| Kiểm chữ chốt | `node scripts/qa/kt-check.cjs build/<video>/index.html <composition-id>` |
| Nhận diện giọng | `~/.asr/bin/python -I scripts/asr/transcribe.py clip.mp4 work/asr.json "Tên riêng, địa danh"` |
| Kiểm hình đứng im | `~/.asr/bin/python scripts/qa/motion_check.py build/<video>/output.mp4` |

## Đọc thêm khi đã quen

| File | Nội dung |
|---|---|
| `docs/VAN-HANH.md` | quy tắc vận hành, thứ tự ưu tiên, mâu thuẫn đã gỡ |
| `TALKING-HEAD.md` | bảng luật đã chốt, quy trình 40–60 phút, các bẫy kỹ thuật |
| `docs/TRINH-BAY.md` | hook 3 giây, minh họa "nói gì vẽ nấy", bố cục đồ họa |
| `TOOLKIT.md` | công cụ dựng, template, âm thanh |
| `MAP.md` | dựng bản đồ |
| `text-presets/QUY-TAC-CHU.md` | chọn kiểu chữ theo vai |
