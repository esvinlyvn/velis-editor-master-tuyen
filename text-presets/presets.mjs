// Thư viện text preset cho video dọc 1080×1920 (HyperFrames + GSAP).
//   #1–40  : dựng lại bộ "40 text presets" CapCut — màu đo bằng điểm ảnh trên khung cuối ổn định của 2 video mẫu,
//            diễn hoạt theo chuỗi khung của video diễn hoạt (README mục 1–2)
//   #41–60 : 4 bộ mới kết hợp từ các thành phần trên, mỗi bộ đúng 2 font, đổi màu theo thương hiệu bằng `theme`
// Chữ trong preset chỉ là chữ mẫu: truyền chữ thật qua `texts` (mỗi phần tử một dòng).
//   import { presetHtml, presetJs, presetRuntime, THEMES } from "../../text-presets/presets.mjs";
//   html += presetHtml("a-hook", ["Sức mạnh của", "LÃI KÉP", "thời gian"], { id: "t1", left: 540, top: 300, theme: THEMES.coral, bg: "light" });
//   js   += presetJs("a-hook", "#t1", 0.2, { hold: 3 });
//   cuối body: presetRuntime()  (đo vị trí từng ký tự để gradient chạy liền cả dòng, tự thu nhỏ khối vượt khổ)

// ---------- màu ----------
// Đo trên mẫu: chữ chính là màu neon sáng, bão hòa; phần lớn có gradient NGANG kiểu đèn: hai mép đậm, giữa sáng (H).
// Một số là màu phẳng (F). Không dùng gradient dọc tự chế (làm đục và lệch màu so với mẫu).
const F = (c) => ({ c1: c, c2: c });
const H = (c1, c2) => ({ c1, c2 });
const SPLIT = (c) => ({ split: c }); // trắng, màu dâng từ dưới lên (--lv) rồi phủ kín
const W = F("#ffffff");
export const C = {
  fadeWhite: "linear-gradient(180deg, #ffffff 0%, #ffffff 40%, rgba(255,255,255,.55) 62%, rgba(255,255,255,.1) 82%, rgba(255,255,255,0) 92%)",
  grayFade: "linear-gradient(180deg, #ffffff 0%, #ededed 45%, #8c8c8c 100%)",
};
const GL = { orange: "#FF8A00", cyan: "#00F0FF", yellow: "#F5F000", white: "#ffffff", lime: "#7CFF1E", pink: "#FF3CC0", purple: "#A23BFF",
  red: "#FF2A2A", blue: "#1AA8FF", mint: "#2BFF9C", gold: "#FFC23A", magenta: "#E23BFF" };

// Màu thương hiệu cho bộ mới (#41–60): c1 mép · c2 giữa · glow · fill2 nhấn phụ · solid màu hộp/vạch · hue (độ) để chọn theo nền
export const THEMES = {
  coral: { c1: "#F0784E", c2: "#FFC6AA", glow: "#FF7A4A", fill2: "#FFD9C6", solid: "#E8754D", hue: 15 }, // san hô
  gold: { c1: "#E0A93C", c2: "#FFE7A0", glow: "#FFC23A", fill2: "#F6E2AE", solid: "#E3B04B", onSolid: "#1C1406", hue: 42 }, // onSolid: chữ trên hộp màu theme (trắng trên vàng không đủ tương phản)
  lime: { c1: "#7DFC18", c2: "#C8FF8E", glow: "#7CFF1E", fill2: "#E6FFB8", solid: "#57D21E", hue: 95 },
  neon: { c1: "#0FE5FE", c2: "#9EF7FF", glow: "#00E0FF", fill2: "#C9FBFF", solid: "#13A8F0", hue: 188 },
  violet: { c1: "#A21DFD", c2: "#D49BFC", glow: "#A23BFF", fill2: "#EBD4FF", solid: "#8E2BE8", hue: 280 },
  rose: { c1: "#FD47C8", c2: "#FFA6E4", glow: "#FF3CC0", fill2: "#FFD3F0", solid: "#E43BAF", hue: 320 },
};

// ---------- preset ----------
// dòng: t chữ mẫu · f font (presets.css) · s cỡ px · fill (F/H/SPLIT/chuỗi gradient) · glow · gw độ glow
//       mt lề trên px (âm = chồng lên dòng trên) · dx lệch ngang px · sx co ngang · z lớp · ls giãn chữ
//       a diễn hoạt vào · d trễ (s) · fx hiệu ứng màu/ánh sáng · box/outlined/tag nền · hl màu nền cụm [..] · deco trang trí
//       key/acc: dòng nhận màu theme · count: { to, fmt, unit } số đếm lên · big: số lớn treo trái
export const PRESETS = [
  // ===== Trang 1 =====
  { id: "bds-dang-song", name: "Bất động sản / Đáng sống", use: "Tiêu đề cam neon + chữ ký: mở video, chủ đề lớn",
    lines: [{ t: "Bất động sản", f: "f-anton", s: 128, fill: F("#FE9804"), glow: GL.orange, a: "spread", fx: [{ k: "shine", d: .9 }] },
      { t: "Đáng sống", f: "f-script", s: 150, fill: W, glow: GL.white, gw: .5, mt: -44, dx: 110, z: 2, a: "wipe", d: .55 }] },
  { id: "koki-select", name: "TÊN KÊNH (khung chọn)", use: "Tên thương hiệu/kênh trong khung xanh có tay nắm như phần mềm thiết kế",
    lines: [{ t: "TÊN KÊNH", f: "f-cond", s: 96, fill: W, glow: GL.white, gw: .3, box: { bg: "#26B0FE", pad: ".30em .7em .16em", r: "0", shadow: "0 0 26px rgba(38,176,254,.75)" }, a: "box", deco: [{ k: "handles", color: "#35F2FF" }] }] },
  { id: "am-thuc-4-mua", name: "Ẩm Thực / 4 mùa", use: "Chữ trắng tan dần xuống + chữ ký vàng: ẩm thực, phong cách sống",
    lines: [{ t: "Ẩm Thực", f: "f-anton", s: 176, fill: C.fadeWhite, glow: GL.white, gw: .3, a: "rise" },
      { t: "4 mùa", f: "f-script", s: 210, fill: F("#F4F406"), glow: GL.yellow, mt: -96, dx: -40, z: 2, a: "wipe", d: .4 }] },
  { id: "can-ho-cao-cap", name: "CĂN HỘ CAO CẤP / Nâng tầm cuộc sống", use: "Tên sản phẩm neon xanh gõ chữ + slogan serif",
    lines: [{ t: "CĂN HỘ CAO CẤP", f: "f-anton", s: 118, fill: F("#10FAFD"), glow: GL.cyan, a: "caret" },
      { t: "Nâng tầm cuộc sống", f: "f-serif", s: 78, fill: W, glow: GL.white, gw: .4, mt: 12, dx: 50, sx: .86, a: "spread", d: .7 }] },
  { id: "capcut-mobile", name: "CAPCUT / Mobile", use: "Chữ trắng phát sáng trượt vào + chữ ký neon xanh lá lấp lánh",
    lines: [{ t: "CAPCUT", f: "f-black", s: 168, sx: .84, fill: W, glow: GL.white, gw: .7, a: "streakR" },
      { t: "Mobile", f: "f-script", s: 150, fill: F("#98F032"), glow: GL.lime, mt: -18, dx: 190, z: 2, a: "wipe", d: .45, fx: [{ k: "sparkle", color: "#B6FF6A", d: .7 }] }] },
  { id: "khoa-hoc", name: "Khóa Học", use: "Một cụm vàng neon đậm: nhấn từ khóa đơn",
    lines: [{ t: "Khóa Học", f: "f-black", s: 136, fill: F("#FCF900"), glow: GL.yellow, a: "type" }] },
  { id: "danh-thuc", name: "Tinh hoa / Đánh Thức / vị giác", use: "Ba tầng: chữ ký – chữ đậm cam đào – chữ ký",
    lines: [{ t: "Tinh hoa", f: "f-script", s: 112, fill: W, glow: GL.white, gw: .4, dx: -130, a: "fadeCh", d: .25 },
      { t: "Đánh Thức", f: "f-heavy", s: 120, fill: H("#FFA855", "#FFCC96"), glow: GL.orange, gw: .6, mt: -26, a: "type" },
      { t: "vị giác", f: "f-script", s: 112, fill: W, glow: GL.white, gw: .4, mt: -24, dx: 150, a: "riseCh", d: .55 }] },
  { id: "can-than", name: "Cẩn Thận (báo động đỏ)", use: "Cảnh báo, sai lầm: chữ nháy đỏ, nét gạch đỏ rồi trở về trắng",
    lines: [{ t: "Cẩn Thận", f: "f-heavy", s: 140, fill: W, glow: GL.white, gw: .5, a: "type", fx: [{ k: "alarm", d: .45 }], deco: [{ k: "strike", color: "#FF2B2B", from: -6, to: 20, fade: true }] }] },
  { id: "tiet-kiem-50", name: "Tiết kiệm / 50 TRIỆU", use: "Con số tiền: chữ ký + số xanh băng trượt vào",
    lines: [{ t: "Tiết kiệm", f: "f-script", s: 124, fill: W, glow: GL.white, gw: .4, dx: 40, a: "fadeCh" },
      { t: "50 TRIỆU", f: "f-black", s: 172, sx: .84, fill: H("#7CF3FF", "#9CFFFE"), glow: GL.cyan, mt: -18, a: "streakL", d: .3 }] },
  { id: "tang-cao", name: "Tăng cao", use: "Xu hướng tăng, nhấn mạnh: hồng neon",
    lines: [{ t: "Tăng cao", f: "f-black", s: 136, fill: F("#FD47C8"), glow: GL.pink, a: "pop" }] },
  // ===== Trang 2 =====
  { id: "capcut-split", name: "Capcut (hai tông)", use: "Chữ trắng, nửa dưới loang xanh: thương hiệu trẻ",
    lines: [{ t: "Capcut", f: "f-black", s: 168, fill: SPLIT("#03F9FE"), glow: GL.cyan, gw: .5, a: "popRand", fx: [{ k: "splitIn", d: .75 }] }] },
  { id: "dang-ky", name: "Đăng Ký / Ngay hôm nay", use: "Kêu gọi hành động: xanh lá + chữ ký",
    lines: [{ t: "Đăng Ký", f: "f-black", s: 140, fill: H("#90FD4C", "#C2FF9A"), glow: GL.lime, a: "drop" },
      { t: "Ngay hôm nay", f: "f-script", s: 118, fill: W, glow: GL.white, gw: .4, mt: -18, dx: 90, z: 2, a: "wipe", d: .45 }] },
  { id: "viral-edit", name: "Viral Edit (serif)", use: "Tiêu đề thanh lịch, ít màu",
    lines: [{ t: "Viral Edit", f: "f-serif", s: 132, fill: W, glow: GL.white, gw: .45, a: "rise" }] },
  { id: "thay-doi", name: "Thay đổi màu sắc", use: "Chữ đổi màu liên tục trắng → hồng → đỏ → cam → vàng → xanh lá",
    lines: [{ t: "Thay đổi màu sắc", f: "f-sans", s: 88, fill: F("#81DC04"), glow: "#7BD600", gw: .7, a: "type",
      fx: [{ k: "seq", d: .6, step: .32, cols: ["#ffffff", "#F799AB", "#FA0A5E", "#F50510", "#F36408", "#F0B909", "#DAE109", "#81DC04"] }] }] },
  { id: "bi-quyet", name: "¿Bí quyết?", use: "Câu hỏi, bí mật: tím, dấu hỏi hai đầu",
    lines: [{ t: "¿Bí quyết?", f: "f-heavy", s: 128, fill: H("#D37BFB", "#EEB0FE"), glow: GL.purple, a: "pop" }] },
  { id: "tim-dung-can-ho", name: "Tìm đúng / CĂN HỘ / phù hợp", use: "Ba tầng serif – chữ đặc tím – serif",
    lines: [{ t: "Tìm đúng", f: "f-serif", s: 76, fill: W, glow: GL.white, gw: .35, dx: -70, a: "type" },
      { t: "CĂN HỘ", f: "f-anton", s: 160, fill: H("#9457FE", "#CB97FF"), glow: GL.purple, mt: 30, a: "zoomCh", d: .2 },
      { t: "phù hợp", f: "f-serif", s: 76, fill: W, glow: GL.white, gw: .35, mt: -4, dx: 90, a: "type", d: .55 }] },
  { id: "co-hoi-dau-tu", name: "Cơ hội / Đầu Tư / Sinh lời", use: "Đầu tư, lợi nhuận: chữ ký + đỏ neon + chữ ký bay tụ lại",
    lines: [{ t: "Cơ hội", f: "f-script", s: 124, fill: W, glow: GL.white, gw: .4, dx: -70, a: "fade" },
      { t: "Đầu Tư", f: "f-anton", s: 156, fill: H("#F11C1E", "#F88B8D"), glow: GL.red, mt: -14, a: "drop", d: .25 },
      { t: "Sinh lời", f: "f-script", s: 120, fill: W, glow: GL.white, gw: .4, mt: -40, dx: 130, z: 2, a: "scatter", d: .6 }] },
  { id: "ban-than", name: "phát triển / Bản Thân", use: "Chữ mảnh lượn sóng + chữ tròn xanh ngọc",
    lines: [{ t: "phát triển", f: "f-sans-l", s: 96, fill: W, glow: GL.white, gw: .35, dx: 20, a: "wave" },
      { t: "Bản Thân", f: "f-round", s: 136, fill: H("#23EAFC", "#9AF6FD"), glow: GL.cyan, mt: 4, a: "riseCh", d: .3 }] },
  { id: "hien-dai", name: "Phong cách sống / Hiện Đại / Do bạn chọn", use: "Ba tầng serif – vàng ấm xoay vào – serif",
    lines: [{ t: "Phong cách sống", f: "f-serif", s: 70, fill: W, glow: GL.white, gw: .35, dx: -40, a: "tumble" },
      { t: "Hiện Đại", f: "f-heavy", s: 136, fill: H("#FEC440", "#FEDC89"), glow: GL.gold, mt: 2, a: "tumble", d: .25 },
      { t: "Do bạn chọn", f: "f-serif", s: 70, fill: W, glow: GL.white, gw: .35, mt: 2, dx: 90, a: "riseCh", d: .6 }] },
  { id: "dau-tu-sinh-loi", name: "Đầu tư / Sinh lời (trắng-hồng)", use: "Chữ trắng rất đậm + serif hồng",
    lines: [{ t: "Đầu tư", f: "f-black", s: 160, fill: W, glow: GL.white, gw: .6, a: "blur" },
      { t: "Sinh lời", f: "f-serif", s: 96, fill: F("#EC46B6"), glow: GL.pink, gw: .6, mt: 2, dx: 70, a: "rise", d: .4 }] },
  // ===== Trang 3 =====
  { id: "noi-bat", name: "Tiện ích / Nổi Bật", use: "Serif nhỏ + chữ đậm xanh bạc hà, sát chữ",
    lines: [{ t: "Tiện ích", f: "f-serif", s: 92, fill: W, glow: GL.white, gw: .35, dx: 40, a: "rise" },
      { t: "Nổi Bật", f: "f-sans-b", s: 150, fill: H("#4BFDB3", "#93FDD3"), glow: GL.mint, mt: 6, a: "drop", d: .25 }] },
  { id: "edit-video", name: "Kỹ năng / Edit Video / thứ bạn cần có", use: "Chữ ký – chữ đặc xanh dương rơi xuống – chữ nhỏ bật ra",
    lines: [{ t: "Kỹ năng", f: "f-script", s: 118, fill: W, glow: GL.white, gw: .4, dx: -150, a: "wipe" },
      { t: "Edit Video", f: "f-anton", s: 146, fill: H("#0BACFE", "#77D9FB"), glow: GL.blue, mt: -26, a: "drop", d: .3 },
      { t: "thứ bạn cần có", f: "f-sans", s: 60, ls: "-.03em", fill: W, glow: GL.white, gw: .3, mt: 14, dx: 150, a: "popRand", d: .7 }] },
  { id: "comment-khoa-hoc", name: "Comment / \"Khóa học\"", use: "Kêu gọi bình luận từ khóa: serif + xanh trong ngoặc kép",
    lines: [{ t: "Comment", f: "f-serif", s: 96, fill: W, glow: GL.white, gw: .35, dx: -120, a: "rise" },
      { t: "\"Khóa học\"", f: "f-heavy", s: 118, fill: H("#1FF2FA", "#91F9FD"), glow: GL.cyan, mt: -6, dx: 70, a: "type", d: .3 }] },
  { id: "phu-hop", name: "Phù Hợp / với mọi khách hàng", use: "Serif đậm hồng-tím + serif nghiêng trượt vào",
    lines: [{ t: "Phù Hợp", f: "f-serif-b", s: 150, fill: H("#FD86D4", "#F6A9D2"), glow: GL.pink, gw: .55, a: "zoomCh", d: .3 },
      { t: "với mọi khách hàng", f: "f-serif-i", s: 98, fill: W, glow: GL.white, gw: .35, mt: -8, a: "spread" }] },
  { id: "dang-goi", name: "TÊN KÊNH / is calling……", use: "Giao diện cuộc gọi đến: gây tò mò, mở đầu",
    lines: [{ t: "TÊN KÊNH", f: "f-cond", s: 112, fill: W, glow: GL.white, gw: .45, a: "type" },
      { t: "is calling……", f: "f-sans-m", s: 40, fill: W, mt: 4, a: "fade", d: .5 },
      { pill: "slide to answer", mt: 44, a: "slide", d: .8 }] },
  { id: "comment-bao-gia", name: "Comment / \"Báo Giá\"", use: "Kêu gọi bình luận: chữ ký + vàng chanh trong ngoặc",
    lines: [{ t: "Comment", f: "f-script", s: 136, fill: W, glow: GL.white, gw: .4, dx: 30, a: "wipe" },
      { t: "\"Báo Giá\"", f: "f-black", s: 160, sx: .78, fill: H("#F6FE19", "#F9FE7A"), glow: GL.yellow, mt: -6, a: "drop", d: .35 }] },
  { id: "sedan-hang-c", name: "SEDAN [HẠNG C] / Sang trọng", use: "Thông số có cụm tô nền xanh, thanh dọc bên trái",
    vbar: "#2BAAFD", align: "flex-start",
    lines: [{ t: "SEDAN [HẠNG C]", f: "f-cond", s: 104, fill: W, hl: "#2BAAFD", a: "reveal", d: .2 },
      { t: "Sang trọng", f: "f-serif-i", s: 90, sx: .82, fill: F("#4FB0F5"), glow: GL.blue, gw: .5, mt: 14, a: "wipe", d: .6 }] },
  { id: "style-sub", name: "Style Capcut (chú thích nhỏ)", use: "Từ khóa xanh lá kèm 3 chú thích nhỏ phía dưới",
    lines: [{ t: "Style Capcut", f: "f-sans-b", s: 128, fill: H("#86FC28", "#B6FD74"), glow: GL.lime, a: "type" },
      { t: "subtittle        animation        directly", f: "f-serif", s: 36, fill: W, mt: 8, a: "fadeCh", d: .6 }] },
  { id: "tham-quan-can-ho", name: "Tham quan / Căn Hộ", use: "Chữ ký + chữ đặc vàng chanh: lời mời",
    lines: [{ t: "Tham quan", f: "f-script", s: 132, fill: W, glow: GL.white, gw: .4, dx: 20, a: "wipe" },
      { t: "Căn Hộ", f: "f-anton", s: 176, fill: H("#FCFD30", "#FDFD8A"), glow: GL.yellow, mt: -4, a: "drop", d: .3 }] },
  { id: "khong-gian-song", name: "Sở hữu / Không Gian Sống / đẳng cấp cho [Bạn]", use: "Ba tầng, chữ tối dần thành tím, chữ cuối trong ô viền đỏ",
    lines: [{ t: "Sở hữu", f: "f-script", s: 124, fill: W, glow: GL.white, gw: .4, dx: 60, a: "wipe" },
      { t: "Không Gian Sống", f: "f-sans-b", s: 100, fill: H("#A21DFD", "#CC84F9"), glow: GL.purple, mt: -30, a: "fadeCh", d: .3,
        fx: [{ k: "seq", d: .3, step: .3, cols: ["#ffffff", "#7553D6", "#9756EC", "#A21DFD"] }] },
      { t: "đẳng   cấp   cho   [Bạn]", f: "f-script", s: 84, fill: W, glow: GL.white, gw: .35, mt: -6, hl: "#160606", hlStyle: "outline", hlFill: F("#FF2B2B"), a: "words", d: .8 }] },
  // ===== Trang 4 =====
  { id: "co-hoi-ngay", name: "Hãy nắm bắt / Cơ hội / Ngay bây giờ", use: "Serif lớn chuyển xanh → vàng chanh giữa chữ ký và chữ nhỏ",
    lines: [{ t: "Hãy nắm bắt", f: "f-script", s: 96, fill: W, glow: GL.white, gw: .35, dx: -150, a: "wipe" },
      { t: "Cơ hội", f: "f-serif", s: 168, fill: H("#F2FD50", "#F8FE92"), glow: GL.yellow, mt: -40, a: "fadeCh", d: .3,
        fx: [{ k: "seq", d: .3, step: .3, cols: ["#ffffff", "#619C65", "#C6E57D", "#F2FD50"] }] },
      { t: "Ngay bây giờ", f: "f-sans-l", s: 68, fill: W, glow: GL.white, gw: .3, mt: 14, dx: 110, a: "type", d: .8 }] },
  { id: "vi-tri", name: "Vị Trí / trung tâm đắc địa", use: "Chữ nghiêng trắng trong hộp vàng be + serif: vị trí, thông số",
    lines: [{ t: "Vị Trí", f: "f-cond-i", s: 200, fill: W, box: { bg: "#F0D07D", pad: ".30em .55em .16em", r: ".08em", shadow: "0 0 0 4px #F6E2AE" }, a: "box", d: .2 },
      { t: "trung tâm đắc địa", f: "f-serif", s: 76, fill: W, glow: GL.white, gw: .35, mt: 12, a: "type" }] },
  { id: "khong-gian-xanh", name: "Không Gian / (xanh)", use: "Chữ nghiêng xanh lá nảy bậc thang + chữ serif trong elip",
    lines: [{ t: "Không", f: "f-cond-i", s: 140, fill: H("#79FD0E", "#BCFD80"), glow: GL.lime, dx: -90, a: "bounce" },
      { t: "Gian", f: "f-cond-i", s: 130, fill: H("#79FD0E", "#BCFD80"), glow: GL.lime, mt: -80, dx: 170, a: "bounce", d: .25 },
      { t: "xanh", f: "f-serif", s: 96, fill: W, mt: -20, dx: -110, a: "type", d: .6, deco: [{ k: "ellipse", color: "#6BFF2A", from: -22, to: 122 }] }] },
  { id: "chinh-sua", name: "dễ dàng / Chỉnh Sửa", use: "Hai dòng đậm chồng sát: trắng xám + bạc hà",
    lines: [{ t: "dễ dàng", f: "f-black", s: 128, fill: C.grayFade, dx: -10, a: "blur" },
      { t: "Chỉnh Sửa", f: "f-black", s: 136, fill: H("#12FD83", "#8CFDC5"), glow: GL.mint, mt: -40, z: 2, a: "riseCh", d: .3 }] },
  { id: "an-toan", name: "Trải nghiệm / An Toàn", use: "Serif + chữ đặc xanh ngọc",
    lines: [{ t: "Trải nghiệm", f: "f-serif", s: 88, fill: W, glow: GL.white, gw: .35, dx: -70, a: "fadeCh" },
      { t: "An Toàn", f: "f-anton", s: 168, fill: H("#0FE5FE", "#7DF1FF"), glow: GL.cyan, mt: 34, dx: 30, a: "zoomCh", d: .3 }] },
  { id: "100-trieu", name: "trị giá / 100 Triệu / đồng", use: "Giá trị tiền: chữ tròn xanh lá + nét gạch cong + serif",
    lines: [{ t: "trị giá", f: "f-sans-l", s: 76, fill: W, glow: GL.white, gw: .3, dx: -120, a: "type" },
      { t: "100 Triệu", f: "f-black", s: 136, fill: H("#7DFC18", "#BBFD7E"), glow: GL.lime, mt: -6, a: "spread", d: .25, deco: [{ k: "swoosh", color: "#57E22E" }] },
      { t: "đồng", f: "f-serif", s: 92, fill: W, glow: GL.white, gw: .35, mt: 28, dx: 170, a: "type", d: .9 }] },
  { id: "5-hieu-ung", name: "5 / Hiệu ứng có sẵn / [hộp]", use: "Số lớn + chữ hai dòng + nhãn trong hộp viền",
    lines: [{ t: "5 Hiệu ứng", f: "f-serif", s: 100, fill: W, glow: GL.white, gw: .35, a: "type", d: .15, big: { t: "5", fill: H("#E4FF0E", "#EFFF77"), s: 250, top: "-.06em" }, dx: 50 },
      { t: "có sẵn", f: "f-serif", s: 88, fill: W, glow: GL.white, gw: .35, mt: -10, dx: 150, a: "type", d: .5 },
      { t: "CapCut", f: "f-cond", s: 150, fill: H("#E4FF0E", "#EFFF77"), glow: GL.yellow, gw: .5, outlined: true, mt: 16, a: "boxSpread", d: .7 }] },
  { id: "dong-xe-suv", name: "Đừng mua / Dòng xe SUV / nếu bạn chưa biết gì", use: "Cảnh báo/khơi tò mò: chữ ký – xanh đậm – chữ nhỏ + chữ ký",
    lines: [{ t: "Đừng mua", f: "f-script", s: 112, fill: W, glow: GL.white, gw: .4, a: "wipe" },
      { t: "Dòng xe SUV", f: "f-sans-b", s: 140, sx: .86, fill: H("#16B0FD", "#69D0FD"), glow: GL.blue, mt: -40, a: "grow", d: .3 },
      { t: "nếu bạn", f: "f-sans-l", s: 62, fill: W, mt: 2, dx: -200, a: "type", d: .7 },
      { t: "chưa biết gì", f: "f-script", s: 108, fill: W, glow: GL.white, gw: .35, mt: -70, dx: 150, a: "scatter", d: .9 }] },
  { id: "1-can-ho", name: "1 / Căn Hộ / Đáng sống", use: "Số thứ tự rất lớn nghiêng + tên + chữ ký + nét cong",
    lines: [{ t: "Căn Hộ", f: "f-anton", s: 150, fill: H("#E005FF", "#EC81FD"), glow: GL.magenta, dx: 70, a: "zoomCh", d: .3, big: { t: "1", fill: H("#E005FF", "#EC81FD"), s: 400, f: "f-cond-i", top: "-.1em" } },
      { t: "Đáng sống", f: "f-script", s: 128, fill: W, glow: GL.white, gw: .4, mt: -34, dx: 100, z: 2, a: "wipe", d: .6, deco: [{ k: "swoosh", color: "#C05CFF" }] }] },
  { id: "tai-sao", name: "Tại sao? / [Edit video] / lại cần thiết", use: "Câu hỏi: chữ nhỏ + cụm trong hộp đỏ + chữ ký",
    lines: [{ t: "Tại sao?", f: "f-sans-l", s: 84, fill: W, glow: GL.white, gw: .3, dx: -150, a: "type" },
      { t: "Edit video", f: "f-serif", s: 130, fill: W, box: { bg: "#EE6F72", pad: ".30em .22em .16em", r: "0" }, mt: 10, dx: -60, a: "box", d: .3 },
      { t: "lại", f: "f-script", s: 170, fill: W, glow: GL.white, gw: .4, mt: -100, dx: 330, z: 2, a: "wipe", d: .7 },
      { t: "cần thiết", f: "f-script", s: 170, fill: W, glow: GL.white, gw: .4, mt: -86, dx: 290, z: 2, a: "wipe", d: .85 }] },

  // ===== Bộ A · "Neon sang" — Anton + Great Vibes (từ #1, #9, #29, #32, #36, #37) =====
  { id: "a-hook", fam: "A", name: "A1 · Mở đầu: chữ ký / KEY khổng lồ / chữ ký", use: "Câu hook: chủ đề lớn, tên sản phẩm, tên dự án",
    lines: [{ t: "Sức mạnh của", f: "f-script", s: 110, fill: W, glow: GL.white, gw: .45, dx: -110, a: "wipe" },
      { t: "LÃI KÉP", f: "f-anton", s: 210, key: true, mt: 4, a: "spread", d: .25, fx: [{ k: "shine", d: 1.0 }] },
      { t: "thời gian", f: "f-script", s: 120, fill: W, glow: GL.white, gw: .45, mt: -36, dx: 210, z: 2, a: "wipe", d: .75 }] },
  { id: "a-number", fam: "A", name: "A2 · Con số: chữ ký / SỐ đếm lên / nét cong", use: "Giá, lợi nhuận, số lượng (BĐS: diện tích)",
    lines: [{ t: "Lợi nhuận đạt", f: "f-script", s: 110, fill: W, glow: GL.white, gw: .45, dx: -90, a: "wipe" },
      { t: "9,8 TỶ", f: "f-anton", s: 220, key: true, count: { to: 9.8, fmt: "dec1", unit: " TỶ" }, mt: 6, a: "blur", d: .2, deco: [{ k: "swoosh", color: "theme" }] }] },
  { id: "a-label", fam: "A", name: "A3 · Nhãn: KEY trong hộp màu / chữ ký", use: "Thông số, ưu đãi, nhãn đóng khung (BĐS: vị trí, tiện ích)",
    lines: [{ t: "LÃI SUẤT 8%", f: "f-anton", s: 140, fill: W, box: { bg: "theme", pad: ".30em .5em .16em", r: ".08em" }, a: "box" },
      { t: "kỳ hạn 12 tháng", f: "f-script", s: 108, fill: W, glow: GL.white, gw: .45, mt: 10, dx: 90, z: 2, a: "wipe", d: .45 }] },
  { id: "a-key", fam: "A", name: "A6 · Từ khóa: chữ ký nhỏ / KEY lớn", use: "Từ khóa của câu nói (bỏ dòng chữ ký bằng null)",
    lines: [{ t: "Tình trạng", f: "f-script", s: 104, fill: W, glow: GL.white, gw: .45, dx: -70, a: "wipe" },
      { t: "CẮT LỖ", f: "f-anton", s: 190, key: true, mt: -2, a: "zoomCh", d: .2 }] },
  { id: "a-compare", fam: "A", name: "A4 · Đối chiếu: giá cũ gạch / CÒN giá mới", use: "Trước – sau, giá cũ – giá mới, A vs B, cắt lỗ",
    lines: [{ t: "Giá đợt trước", f: "f-script", s: 96, fill: W, glow: GL.white, gw: .4, dx: -120, a: "wipe" },
      { t: "10,5 TỶ", f: "f-anton", s: 110, fill: F("#a0a0a0"), mt: 8, a: "rise", d: .2, deco: [{ k: "strike", color: "#FF3B30", from: -6, to: 106 }] },
      { t: "CÒN 9,8 TỶ", f: "f-anton", s: 170, key: true, mt: 28, a: "drop", d: .7 }] },
  { id: "a-cta", fam: "A", name: "A5 · Kêu gọi: chữ ký / KEY trong hộp viền", use: "CTA cuối video: nhắn tin, đăng ký, nhận tài liệu/báo giá",
    lines: [{ t: "Nhắn ngay", f: "f-script", s: 120, fill: W, glow: GL.white, gw: .45, dx: -60, a: "wipe" },
      { t: "NHẬN BẢNG TÍNH", f: "f-anton", s: 128, key: true, outlined: true, mt: 22, a: "boxSpread", d: .35 }] },
  // ===== Bộ E · "Đè lớp" — Anton + Be Vietnam Pro 800, KHÔNG chữ viết tay =====
  // Chữ phụ (sub) nằm TRÊN và ĐÈ lên mép chữ lớn như bố cục mẫu (z: 2, dòng sau kéo lên bằng mt âm), có viền tối mảnh để tách khỏi KEY.
  // Chữ phụ là NHÃN gắn góc chữ lớn (nhan: "tl" câu dẫn đè góc trên trái · "br" câu bổ sung đè góc dưới phải, on: dòng KEY).
  // Nhãn có nền tối + viền theme → không có chữ chồng lên chữ; presetRuntime() tự đặt sao cho nhãn không che dấu của KEY.
  { id: "e-hook", fam: "E", name: "E1 · Mở đầu: nhãn dẫn / KEY khổng lồ / nhãn bổ sung", use: "Hook: chủ đề lớn, tên sản phẩm, tên dự án",
    lines: [{ t: "Bí mật của", nhan: "tl", on: 1, s: 48, a: "nhan", d: .05 },
      { t: "LÃI KÉP", f: "f-anton", s: 210, key: true, a: "spread", d: .2, fx: [{ k: "shine", d: 1.0 }] },
      { t: "sau 20 năm", nhan: "br", on: 1, s: 48, a: "nhan", d: .7 }] },
  { id: "e-key", fam: "E", name: "E2 · Từ khóa: nhãn dẫn đè góc trên trái KEY", use: "Từ khóa của câu nói (bỏ nhãn bằng null)",
    lines: [{ t: "Tình trạng", nhan: "tl", on: 1, s: 50, a: "nhan", d: .05 },
      { t: "CẮT LỖ", f: "f-anton", s: 200, key: true, a: "zoomCh", d: .15 }] },
  { id: "e-number", fam: "E", name: "E3 · Con số: nhãn dẫn / SỐ đếm lên / nét cong", use: "Giá, lợi nhuận, số lượng (BĐS: diện tích)",
    lines: [{ t: "Lợi nhuận đạt", nhan: "tl", on: 1, s: 50, a: "nhan", d: .05 },
      { t: "9,8 TỶ", f: "f-anton", s: 230, key: true, count: { to: 9.8, fmt: "dec1", unit: " TỶ" }, a: "blur", d: .2, deco: [{ k: "swoosh", color: "theme" }] }] },
  { id: "e-label", fam: "E", name: "E4 · Nhãn: KEY trong hộp / nhãn bổ sung đè góc dưới phải", use: "Nhãn, ưu đãi, mốc, lợi ích",
    lines: [{ t: "LÃI SUẤT 8%", f: "f-anton", s: 132, fill: W, box: { bg: "theme", pad: ".30em .5em .16em", r: ".08em" }, a: "box" },
      { t: "kỳ hạn 12 tháng", nhan: "br", on: 0, s: 46, a: "nhan", d: .45 }] },
  { id: "e-compare", fam: "E", name: "E5 · Đối chiếu: nhãn dẫn / cũ gạch / MỚI", use: "Trước – sau, tin đồn – sự thật",
    lines: [{ t: "Giá đợt trước", nhan: "tl", on: 1, s: 46, a: "nhan", d: .05 },
      { t: "10,5 TỶ", f: "f-anton", s: 124, fill: F("#a8a8a8"), a: "rise", d: .2, deco: [{ k: "strike", color: "#FF3B30", from: -6, to: 106 }] },
      { t: "CÒN 9,8 TỶ", f: "f-anton", s: 190, key: true, mt: 46, a: "drop", d: .7 }] },
  { id: "e-cta", fam: "E", name: "E6 · Kêu gọi: nút KEY trong hộp màu", use: "CTA cuối video, đặt dưới ngực người nói",
    lines: [{ t: "NHẮN NGAY", f: "f-anton", s: 112, fill: W, box: { bg: "theme", pad: ".30em .62em .16em", r: ".5em", shadow: "0 0 40px rgba(255,194,58,.55), 0 14px 30px rgba(0,0,0,.5)" }, a: "box" }] },
  // ===== Bộ B · "Serif sang trọng" — Playfair Display + Great Vibes (từ #13, #24, #31, #35) =====
  { id: "b-title", fam: "B", name: "B1 · Tiêu đề: chữ ký / Serif lớn / nghiêng", use: "Mở đầu sang trọng, tên chủ đề (BĐS: tên khu, tên căn)",
    lines: [{ t: "Hãy nắm bắt", f: "f-script", s: 104, fill: W, glow: GL.white, gw: .4, dx: -150, a: "wipe" },
      { t: "Cơ hội vàng", f: "f-serif-b", s: 150, key: true, mt: -10, a: "fadeCh", d: .3, fx: [{ k: "seq", d: .3, step: .3, cols: ["#ffffff", "theme"] }] },
      { t: "trong năm 2026", f: "f-serif-i", s: 72, fill: W, glow: GL.white, gw: .3, mt: 14, dx: 120, a: "type", d: .8 }] },
  { id: "b-quote", fam: "B", name: "B2 · Trích dẫn: ngoặc lớn / câu nghiêng / chữ ký tên", use: "Câu nói của người dẫn, cảm nhận khách hàng",
    lines: [{ t: "“", f: "f-serif-b", s: 220, key: true, mt: 0, dx: -360, a: "pop" },
      { t: "Đầu tư là chọn", f: "f-serif-i", s: 84, fill: W, glow: GL.white, gw: .3, mt: -150, a: "riseCh", d: .25 },
      { t: "đúng thời điểm", f: "f-serif-b", s: 96, acc: true, glow: GL.white, gw: .2, mt: 12, a: "riseCh", d: .5 },
      { t: "Nhà đầu tư", f: "f-script", s: 100, fill: W, glow: GL.white, gw: .4, mt: 16, dx: 200, a: "wipe", d: .9 }] },
  { id: "b-number", fam: "B", name: "B3 · Số sang: — SỐ — / nghiêng", use: "Số liệu sang: tỷ lệ, năm, mốc (BĐS: diện tích, số phòng)",
    lines: [{ t: "8%", f: "f-serif-b", s: 190, key: true, count: { to: 8, unit: "%" }, a: "blur" },
      { t: "lãi suất mỗi năm", f: "f-serif-i", s: 76, fill: W, glow: GL.white, gw: .3, mt: -6, a: "type", d: .5 }] },
  { id: "b-location", fam: "B", name: "B4 · Địa danh: — CHỮ GIÃN — / chữ ký", use: "Địa danh, khu vực, thị trường (BĐS: tên dự án)",
    lines: [{ t: "TRUNG TÂM TÀI CHÍNH", f: "f-serif", s: 54, ls: ".16em", key: true, a: "spread" },
      { t: "giữa lòng thành phố", f: "f-script", s: 120, fill: W, glow: GL.white, gw: .4, mt: 10, a: "wipe", d: .5 }] },
  { id: "b-list", fam: "B", name: "B5 · Danh sách: ✓ dòng nghiêng × 3", use: "Liệt kê quyền lợi, điều kiện, lợi ích",
    align: "flex-start",
    lines: [{ t: "Lãi suất cố định", f: "f-serif-i", s: 80, fill: W, glow: GL.white, gw: .3, a: "slide", deco: [{ k: "check", color: "theme" }] },
      { t: "Rút trước hạn linh hoạt", f: "f-serif-i", s: 80, fill: W, glow: GL.white, gw: .3, mt: 22, a: "slide", d: .35, deco: [{ k: "check", color: "theme" }] },
      { t: "Không phí quản lý", f: "f-serif-i", s: 80, fill: W, glow: GL.white, gw: .3, mt: 22, a: "slide", d: .7, deco: [{ k: "check", color: "theme" }] }] },
  // ===== Bộ C · "Đậm trẻ" — Montserrat 900 + Be Vietnam Pro (từ #6, #10, #11, #18, #40) =====
  { id: "c-hook", fam: "C", name: "C1 · Hook hai tông + câu phụ", use: "Câu hỏi gây chú ý ở 3 giây đầu",
    lines: [{ t: "CẮT LỖ?", f: "f-black", s: 190, key: true, split: true, a: "blur", fx: [{ k: "splitIn", d: .5 }] },
      { t: "Sự thật về cổ phiếu", f: "f-sans-m", s: 64, fill: W, glow: GL.white, gw: .3, mt: -8, a: "type", d: .55 }] },
  { id: "c-marker", fam: "C", name: "C2 · Câu có từ được tô bút dạ", use: "Câu ngắn có 1 cụm cần nhấn",
    lines: [{ t: "Chỉ cần", f: "f-sans-m", s: 76, fill: W, glow: GL.white, gw: .3, a: "type" },
      { t: "24% VỐN", f: "f-black", s: 150, fill: W, mt: 10, a: "pop", d: .3, deco: [{ k: "marker", color: "theme" }] }] },
  { id: "c-tag", fam: "C", name: "C3 · Thẻ giảm giá có khấc + chữ phụ", use: "Chiết khấu, khuyến mãi, quà tặng",
    lines: [{ t: "-8%", f: "f-black", s: 170, fill: W, tag: "theme", a: "box" },
      { t: "giảm phí giao dịch", f: "f-sans-m", s: 62, fill: W, glow: GL.white, gw: .3, mt: 18, a: "type", d: .45 }] },
  { id: "c-step", fam: "C", name: "C4 · Bước: số thứ tự lớn / tiêu đề / phụ", use: "Các bước, lộ trình, lý do 1-2-3",
    lines: [{ t: "01 ĐẶT MỤC TIÊU", f: "f-black", s: 88, fill: W, glow: GL.white, gw: .4, a: "type", d: .2, big: { t: "01", key: true, s: 210, f: "f-black-i", top: "-.2em" }, dx: 110 },
      { t: "tiết kiệm 20% thu nhập", f: "f-sans-m", s: 54, fill: W, glow: GL.white, gw: .3, mt: 14, dx: 110, a: "type", d: .6 }] },
  { id: "c-alert", fam: "C", name: "C5 · Cảnh báo: nhãn / KEY gạch / sửa lại", use: "Hiểu lầm cần sửa, sai lầm thường gặp",
    lines: [{ t: "SỰ THẬT", f: "f-sans-b", s: 56, ls: ".08em", fill: W, box: { bg: "#FF3B30", pad: ".38em .5em .2em", r: ".3em" }, a: "box" },
      { t: "Lãi cao là tốt", f: "f-black", s: 96, fill: F("#bdbdbd"), mt: 34, a: "type", d: .3, deco: [{ k: "strike", color: "#FF3B30", from: -4, to: 104 }] },
      { t: "Rủi ro cao hơn", f: "f-black", s: 86, key: true, mt: 10, a: "pop", d: .9 }] },
  // ===== Bộ D · "Thông số" — Barlow Condensed + Be Vietnam Pro (từ #2, #25, #27) =====
  { id: "d-spec", fam: "D", name: "D1 · Thông số: thanh dọc / NHÃN [GIÁ TRỊ] / phụ", use: "Thông số: lãi suất, kỳ hạn, phí (BĐS: diện tích, hướng, tầng)",
    vbar: "theme", align: "flex-start",
    lines: [{ t: "LÃI SUẤT [7,5%]", f: "f-cond", s: 110, fill: W, hl: "theme", a: "reveal", d: .2 },
      { t: "kỳ hạn 12 tháng · trả lãi cuối kỳ", f: "f-sans-m", s: 58, fill: W, glow: GL.white, gw: .3, mt: 14, a: "type", d: .55 }] },
  { id: "d-select", fam: "D", name: "D2 · Khung chọn + chú thích", use: "Gắn tên cho vật trên hình (khung chọn có tay nắm)",
    lines: [{ t: "VÙNG HỖ TRỢ", f: "f-cond", s: 96, fill: W, box: { bg: "theme", pad: ".30em .7em .16em", r: "0" }, a: "box", deco: [{ k: "handles", color: "#ffffff" }] },
      { t: "quanh 1.200 điểm", f: "f-sans-m", s: 56, fill: W, glow: GL.white, gw: .3, mt: 26, a: "type", d: .45 }] },
  { id: "d-counter", fam: "D", name: "D3 · Bộ đếm: — SỐ đếm — / chú thích", use: "Số khách, số lượng, phần trăm (BĐS: số căn đã bán)",
    lines: [{ t: "1.600", f: "f-cond", s: 230, key: true, count: { to: 1600, fmt: "dot" }, a: "blur" },
      { t: "KHÁCH HÀNG", f: "f-sans-b", s: 60, ls: ".2em", fill: W, glow: GL.white, gw: .3, mt: 12, a: "spread", d: .5 }] },
  { id: "d-lower", fam: "D", name: "D4 · Lower third: TÊN / chức danh", use: "Giới thiệu người nói ở góc dưới",
    vbar: "theme", align: "flex-start",
    lines: [{ t: "NGUYỄN AN", f: "f-cond", s: 96, fill: W, a: "reveal", d: .2 },
      { t: "Chuyên viên tư vấn tài chính", f: "f-sans-m", s: 46, acc: true, mt: 6, a: "type", d: .45 }] },
  { id: "d-call", fam: "D", name: "D5 · Cuộc gọi đến (theo thương hiệu)", use: "Mở đầu gây tò mò, gợi ý gọi hotline",
    lines: [{ t: "NGÂN HÀNG", f: "f-cond", s: 120, key: true, a: "type" },
      { t: "đang gọi cho bạn……", f: "f-sans-m", s: 44, fill: W, mt: 6, a: "fade", d: .5 },
      { pill: "trượt để nghe", mt: 44, a: "slide", d: .8 }] },
];
// Nhóm: "chung" (mọi chủ đề tài chính, đầu tư, kinh tế) · "bds-quy-hoach" (phần mở rộng BĐS & quy hoạch: chữ mẫu và công dụng gắn căn hộ, tiện ích, vị trí)
export const NHOM_BDS = new Set(["bds-dang-song", "can-ho-cao-cap", "tim-dung-can-ho", "noi-bat", "tham-quan-can-ho", "khong-gian-song", "vi-tri", "khong-gian-xanh", "1-can-ho"]);
for (const p of PRESETS) p.nhom = NHOM_BDS.has(p.id) ? "bds-quy-hoach" : "chung";
export const PRESET = Object.fromEntries(PRESETS.map((p) => [p.id, p]));
export const FAMILIES = {
  A: { name: "Neon sang", fonts: "Anton + Great Vibes", note: "Mở đầu, con số, CTA cho thương hiệu cao cấp (tài chính, BĐS)" },
  B: { name: "Serif sang trọng", fonts: "Playfair Display + Great Vibes", note: "Thương hiệu sang, giọng chậm" },
  C: { name: "Đậm trẻ", fonts: "Montserrat 900 + Be Vietnam Pro", note: "Hook mạnh, khuyến mãi, liệt kê bước; nhịp nhanh" },
  E: { name: "Đè lớp", fonts: "Anton + Be Vietnam Pro 800", note: "Không chữ viết tay; chữ phụ nằm trên và đè mép chữ lớn" },
  D: { name: "Thông số", fonts: "Barlow Condensed + Be Vietnam Pro", note: "Diện tích, tiến độ, giới thiệu người nói; gọn, dễ đọc" },
};

// ---------- tương phản theo nền ----------
const hueOf = (hex) => { const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return null;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const farTheme = (hue) => Object.keys(THEMES).sort((a, b) => hueDist(THEMES[b].hue, hue) - hueDist(THEMES[a].hue, hue))[0];

/** Chọn chế độ hiển thị và màu cho vùng nền dưới khối chữ (đo bằng scripts/bg-sample.py colors: lum 0–1 tuyến tính, hue độ, sat 0–1).
 *  bg: "dark" (lum < 0,1: glow đầy đủ) · "mid" (0,1–0,3: nền vừa/rối như cây lá, nội thất gỗ → glow 70 % + viền tối mảnh)
 *      · "light" (> 0,3: trời, tường trắng → glow 35 %, viền tối + bóng 3 lớp).
 *  theme: màu cho bộ A–D — giữ màu ưu tiên nếu khác hue nền ≥ 60°, nếu không lấy theme có hue xa nền nhất.
 *  recolor (khi truyền pid của preset #1–40): màu cố định của preset trùng tông nền (< 50°, nền đủ bão hòa)
 *      → đổi dòng màu sang theme xa nền nhất (vd. chữ cam trên gỗ ấm → xanh neon). Truyền vào presetHtml/presetJs. */
export function contrastPlan({ lum = 0, hue = 0, sat = 0 } = {}, prefer = "coral", pid) {
  const colorful = sat > 0.18;
  let theme = prefer;
  if (colorful && hueDist(THEMES[prefer].hue, hue) < 60) theme = farTheme(hue);
  let recolor, recolorName;
  const p = pid && PRESET[pid];
  if (p && colorful) {
    const f = p.lines.map((l) => l.fill).find((f) => f && typeof f === "object" && !f.split && hueOf(f.c1) != null);
    const h = f && hueOf(f.c1);
    if (h != null && hueDist(h, hue) < 50) { recolorName = farTheme(hue); recolor = THEMES[recolorName]; }
  }
  return { bg: lum > 0.3 ? "light" : lum > 0.1 ? "mid" : "dark", theme, themeObj: THEMES[theme], recolor, recolorName };
}

// ---------- HTML ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const seg = new Intl.Segmenter("vi", { granularity: "grapheme" });
const graphemes = (t) => [...seg.segment(t.normalize("NFC"))].map((g) => g.segment);
// chữ ký (Great Vibes) giữ nguyên từng từ để nét nối liền giữa các chữ cái; font khác tách từng ký tự để diễn hoạt
const chars = (t, joined = false) => (joined
  ? t.normalize("NFC").split(/( +)/).filter(Boolean).map((w) => (/^ +$/.test(w) ? `<span class="ch sp" style="width:${0.26 * w.length}em"> </span>` : `<span class="ch w">${esc(w)}</span>`)).join("")
  : graphemes(t).map((g) => (g === " " ? `<span class="ch sp"> </span>` : `<span class="ch">${esc(g)}</span>`)).join(""));

function decoSvg(d, col) {
  const color = d.color === "theme" ? col : d.color;
  const st = `stroke="${color}" vector-effect="non-scaling-stroke"`;
  const cls = `dr${d.fade ? " fade" : ""}`;
  if (d.k === "swoosh") return `<svg class="tp-deco" style="left:-6%;width:112%;bottom:-.3em;height:.4em" viewBox="0 0 100 40" preserveAspectRatio="none"><path class="${cls}" d="M2,36 Q46,2 98,10" stroke-width="5" ${st}/></svg>`;
  if (d.k === "ellipse") { const a = d.from ?? -8, b = d.to ?? 108; return `<svg class="tp-deco" style="left:${a}%;width:${b - a}%;top:-.1em;height:1.2em" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse class="${cls}" cx="50" cy="50" rx="48" ry="44" stroke-width="4" ${st}/></svg>`; }
  if (d.k === "strike") { const a = d.from ?? 0, b = d.to ?? 100; return `<svg class="tp-deco" style="left:${a}%;width:${b - a}%;top:.5em;height:.1em" viewBox="0 0 100 10" preserveAspectRatio="none"><path class="${cls}" d="M0,5 L100,5" stroke-width="9" ${st}/></svg>`; }
  if (d.k === "handles") return `<svg class="tp-deco hd" style="left:-8px;top:-8px;width:calc(100% + 16px);height:calc(100% + 16px)" viewBox="0 0 100 100" preserveAspectRatio="none"><rect class="${cls}" x="1" y="1" width="98" height="98" stroke-width="3" fill="none" ${st}/></svg>` +
    `<i class="hd-dot" style="right:-16px;top:-16px;background:${color};box-shadow:0 0 12px ${color}"></i><i class="hd-dot" style="left:-16px;bottom:-16px;background:${color};box-shadow:0 0 12px ${color}"></i>`;
  if (d.k === "check") return `<svg class="tp-deco" style="right:calc(100% + .3em);top:.12em;width:.82em;height:.82em" viewBox="0 0 100 100"><circle class="${cls}" cx="50" cy="50" r="44" stroke-width="7" ${st}/><path class="${cls}" d="M28,52 L44,67 L73,35" stroke-width="10" stroke-linejoin="round" ${st}/></svg>`;
  if (d.k === "marker") return `<i class="tp-marker" style="background:${color}"></i>`;
  return "";
}
// hạt lấp lánh cuối dòng (CAPCUT Mobile)
const sparkles = (color) => [[96, -10, 26], [108, 30, 18], [88, 52, 14], [114, -24, 12]].map(([x, y, s]) =>
  `<svg class="tp-spark" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px" viewBox="0 0 20 20"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8Z" fill="${color}"/></svg>`).join("");

/** Biến màu của dòng: --c1/--c2 (gradient ngang mép–giữa–mép) và --fill. */
// dòng màu cố định (#1–40, không phải trắng / hai tông) đổi sang màu `recolor` khi màu gốc trùng tông nền (contrastPlan)
const isColor = (f) => f && typeof f === "object" && !f.split && !(/^#f{6}$/i.test(f.c1) && /^#f{6}$/i.test(f.c2));
function lineFill(l, th, rc) {
  if (l.key) return { c1: th.c1, c2: th.c2 };
  if (l.acc) return F(th.fill2);
  if (rc && isColor(l.fill)) return { c1: rc.c1, c2: rc.c2 };
  return l.fill;
}
const lineGlow = (l, th, rc) => (l.key ? th.glow : rc && isColor(l.fill) ? rc.glow : l.glow);
function fillVars(l, th, rc) {
  let f = lineFill(l, th, rc);
  if (l.box?.bg === "theme" && th.onSolid) f = F(th.onSolid); // hộp màu theme sáng → chữ tối
  if (l.split) f = SPLIT(th.solid);
  if (f && typeof f === "object" && f.split) return `--c1:#ffffff;--c2:${f.split};--fill:linear-gradient(0deg, var(--c2) 0%, var(--c2) var(--lv, 100%), var(--c1) calc(var(--lv, 100%) + 2%), var(--c1) 100%)`;
  if (f && typeof f === "object") return `--c1:${f.c1};--c2:${f.c2};--fill:linear-gradient(90deg, var(--c1) 0%, var(--c2) 50%, var(--c1) 100%)`;
  return `--fill:${f ?? "linear-gradient(#fff,#fff)"}`;
}

/** HTML của 1 preset. texts: chữ thật cho từng dòng (bỏ trống = chữ mẫu). opts:
 *  { id, left, top, scale, anchor: "center"|"left", maxWidth, bg: "dark"|"light", theme }
 *  bg "light": nền sáng (trời, tường trắng, nội thất sáng) → quầng tối + bóng thay cho glow sáng (contrastPlan() chọn hộ).
 *  hand: true thay chữ ký Great Vibes bằng Dancing Script 700 (móc ư/ơ rõ — dùng khi chữ ký là chữ phụ cỡ nhỏ).
 *  maxWidth: presetRuntime() tự thu nhỏ cả khối nếu rộng hơn (mặc định 940 px). edge: lề tối thiểu tới mép khung (mặc định 24 px; 60 = vùng an toàn DAC-TA-CHU). */
// dòng có dấu dưới (dấu nặng) hay nét móc xuống (g, j, p, q, y…) — luật 21; runtime dùng chung nguồn này
const HANG_RE = /[gjpqyQ,;]|\u0323/;
export function presetHtml(pid, texts = [], { id, left = 540, top = 400, scale = 1, anchor = "center", maxWidth = 940, edge = 24, bg = "dark", footage, theme, recolor, hand = false, center, wrap = true } = {}) {
  const p = PRESET[pid];
  if (!p) throw new Error(`Không có preset: ${pid}`);
  const th = theme ?? THEMES.coral;
  const solid = (v) => (v === "theme" ? th.solid : v);
  const light = bg === "light" || footage === true;
  const mode = light ? " on-light" : bg === "mid" ? " on-mid" : "";
  // nhãn gắn góc (nhan): gom vào dòng đích, vị trí do presetRuntime() tính theo chữ thật
  const nhans = {};
  p.lines.forEach((l, k) => { if (!l.nhan || texts[k] === null) return; const t = (texts[k] ?? l.t).normalize("NFC");
    (nhans[l.on] ??= []).push(`<span class="tp-nhan st${k}" data-at="${l.nhan}" style="font-size:${l.s ?? 48}px">${esc(t)}</span>`); });
  // Chồng dòng (mt âm) chỉ khi dòng ngay trên không có dấu dưới (dấu nặng) hay nét móc xuống (g, j, p, q, y…);
  // có thì dòng dưới đứng sát ngay dưới, không đè (người dùng duyệt 30/10/2026)
  const shown = p.lines.map((l, k) => (texts[k] === null || l.nhan ? null : (texts[k] ?? l.t ?? l.pill ?? "").normalize("NFC")));
  const hangs = (t) => HANG_RE.test(t.normalize("NFD"));
  const lines = p.lines.map((l0, k) => {
    if (texts[k] === null || l0.nhan) return ""; // null: bỏ dòng này · nhan: đã gắn vào dòng đích
    let up = k - 1; while (up >= 0 && shown[up] == null) up--;
    const l = l0.mt < 0 && up >= 0 && hangs(shown[up]) ? { ...l0, mt: 0 } : l0;
    const t = (texts[k] ?? l.t ?? "").normalize("NFC");
    const glow = lineGlow(l, th, recolor);
    // hand: chữ ký Great Vibes → Dancing Script 700 (móc ư/ơ rõ, nét dày; chữ x cao hơn nên cỡ × 0,74)
    const sw = hand && l.f === "f-script";
    const cls = ["tp-line", `L${k}`, sw ? "f-hand" : l.f ?? "", l.box ? "boxed" : "", l.outlined ? "outlined" : "", l.tag ? "tagged" : "", l.a === "caret" ? "caret-line" : "", l.key ? "key-line" : ""].join(" ").replace(/\s+/g, " ").trim();
    const tf = [l.dx ? `translateX(${l.dx}px)` : "", l.sx ? `scaleX(${l.sx})` : ""].filter(Boolean).join(" ");
    const style = [`font-size:${Math.round((l.s ?? 60) * (sw ? 0.74 : 1))}px`, fillVars(l, th, recolor), `--glow:${l.box || l.tag ? "transparent" : glow ?? "transparent"}`, `--gw:${l.gw ?? 1}`,
      l.mt ? `margin-top:${l.mt}px` : "", tf ? `transform:${tf}` : "", l.z ? `--z:${l.z}` : "", l.ls ? `letter-spacing:${l.ls}` : "",
      l.box ? `--box:${solid(l.box.bg)};--box-pad:${l.box.pad ?? ".1em .34em .06em"};--box-r:${l.box.r ?? ".06em"};--box-shadow:${l.box.shadow ?? "none"}` : "",
      l.outlined && l.key ? `--ol:${th.solid}` : "",
      l.sub ? "--shade:drop-shadow(0 0 1.5px rgba(0,0,0,.95)) drop-shadow(0 0 1px rgba(0,0,0,.95)) drop-shadow(0 3px 8px rgba(0,0,0,.6))" : ""].filter(Boolean).join(";");
    if (l.pill) return `<div class="${cls}" style="${style}"><span class="in"><span class="tp-pill"><i><svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg></i>${esc(texts[k] ?? l.pill)}</span></span></div>`;
    const joined = l.f === "f-script";
    let body;
    if (l.count) { // số đếm: 1 khối .nv (GSAP đổi nội dung), phần sau số là đơn vị ("850", "98%", "12,5 %", "3,2 TỶ")
      const m = t.match(/^([\d.,]+)(.*)$/);
      const num = m ? m[1] : t, unit = m ? m[2] : "";
      const to = Number(num.replace(/\./g, "").replace(",", ".")) || l.count.to;
      // định dạng theo chữ thật: "1.600" chấm nghìn, "9,8" một số lẻ, còn lại số nguyên
      const fmt = texts[k] != null ? (/\.\d{3}/.test(num) ? "dot" : /,/.test(num) ? "dec1" : "int") : l.count.fmt ?? (/,/.test(num) ? "dec1" : "int");
      // các bước đếm dựng sẵn, xếp chồng (inline-grid: bề rộng cố định, số không nhảy); GSAP chỉ bật/tắt từng bước
      const fv = (v) => fmt === "dot" ? Math.round(v).toLocaleString("de-DE") : fmt === "dec1" ? v.toFixed(1).replace(".", ",") : String(Math.round(v));
      const steps = Array.from({ length: COUNT_N + 1 }, (_, i) => { const q = i / COUNT_N; return i === COUNT_N ? num : fv(to * (1 - (1 - q) * (1 - q))); });
      body = `<span class="ch nv">${steps.map((v, i) => `<span class="nvs" style="${i === COUNT_N ? "" : "visibility:hidden"}">${esc(v)}</span>`).join("")}</span>${chars(unit)}`;
    } else {
      body = t.split(/(\[[^\]]+\])/).filter(Boolean).map((part) => {
        if (!part.startsWith("[")) return chars(part, joined);
        const hs = l.hlStyle === "outline" ? `--hl:${solid(l.hl)};box-shadow:0 0 0 3px #FF3B30, 0 0 12px rgba(255,59,48,.6);border-radius:.5em;padding:.36em .6em .2em` : `--hl:${solid(l.hl)}`;
        const hf = l.hlFill ? `;--c1:${l.hlFill.c1};--c2:${l.hlFill.c2};--fill:linear-gradient(90deg, var(--c1), var(--c2) 50%, var(--c1))` : "";
        return `<span class="hl" style="${hs}${hf}">${chars(part.slice(1, -1), joined)}</span>`;
      }).join("");
    }
    let big = "";
    // số treo lấy từ chữ thật: "02 KÝ HỢP ĐỒNG" → số "02" treo trái, phần còn lại là dòng chữ.
    // Chữ thật không mở đầu bằng số ("12.500 M²", "35%"): lead = null → không treo số mẫu, không xóa ký tự nào của chữ thật
    const lead = texts[k] != null ? t.match(/^(\d+)\s+(.+)$/) : undefined;
    if (l.big && lead !== null) {
      const bigT = lead ? lead[1] : l.big.t;
      if (lead) body = chars(lead[2], joined);
      const bf = l.big.key ? { c1: th.c1, c2: th.c2 } : recolor && isColor(l.big.fill) ? { c1: recolor.c1, c2: recolor.c2 } : l.big.fill;
      big = `<span class="big ${l.big.f ?? l.f}" style="font-size:${l.big.s}px;top:${l.big.top ?? "-.12em"};--c1:${bf.c1};--c2:${bf.c2};--fill:linear-gradient(90deg, var(--c1), var(--c2) 50%, var(--c1))">${chars(bigT)}</span>`;
      if (!lead) body = body.replace(chars(l.big.t + " "), "").replace(chars(l.big.t), "");
    }
    const tagBg = l.tag ? `<i class="tp-tagbg" style="background:${solid(l.tag)}"></i>` : "";
    const caret = l.a === "caret" ? `<i class="tp-caret"></i>` : "";
    const spark = (l.fx ?? []).filter((f) => f.k === "sparkle").map((f) => sparkles(f.color)).join("");
    return `<div class="${cls}" style="${style}"><span class="in">${tagBg}${big}${body}${(l.deco ?? []).map((d) => decoSvg(d, th.solid)).join("")}${caret}${spark}${(nhans[k] ?? []).join("")}</span></div>`;
  }).join("");
  // vị trí/căn/thu phóng ở lớp ngoài .tp-pos; lớp .tp (id) để GSAP diễn hoạt tự do
  const tf = anchor === "left" ? `transform:scale(${scale});transform-origin:0 0` : `transform:translateX(-50%) scale(${scale});transform-origin:50% 0`;
  return `<div class="tp-pos" data-maxw="${maxWidth}" data-edge="${edge}" data-anchor="${anchor}" data-scale="${scale}"${center ? ` data-center="${center}"` : ""}${wrap ? "" : ` data-wrap="0"`} style="left:${left}px;top:${top}px;${tf}"><div class="tp tp-${pid}${mode}" id="${id}" style="--nhanbd:${th.c1};${p.align ? `--tp-align:${p.align}` : ""}">${p.vbar ? `<i class="tp-vbar" style="--vbar:${solid(p.vbar)}"></i>` : ""}${lines}</div></div>`;
}

/** Script chạy một lần trong trang (đặt cuối body), đo bằng bố cục thật sau khi font tải xong:
 *  1) mỗi ký tự lấy vị trí trong dòng (--x) và bề rộng dòng (--lw) → gradient ngang và vệt sáng chạy liền cả dòng
 *     dù mỗi ký tự là một khối riêng để diễn hoạt;
 *  2) chữ thật quá dài cho preset → xuống dòng tại khoảng trắng gần giữa; khối vẫn rộng hơn data-maxw → thu nhỏ;
 *     khối lệch tràn mép khung → dịch vào trong. */
export function presetRuntime() {
  return `<script>(function(){
function box(pos){ var x0=1e9,x1=-1e9; pos.firstElementChild.querySelectorAll(".ch,.tp-deco,.big,.in,.tp-nhan").forEach(function(e){ var r=e.getBoundingClientRect(); if(!r.width) return; x0=Math.min(x0,r.left); x1=Math.max(x1,r.right); }); return [x0,x1]; }
function inkBox(root){ var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9, add=function(q){ if(!q.width||!q.height) return; x0=Math.min(x0,q.left); y0=Math.min(y0,q.top); x1=Math.max(x1,q.right); y1=Math.max(y1,q.bottom); };
  var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), n, rg=document.createRange();
  while((n=tw.nextNode())){ if(!n.data.trim()) continue; var st=getComputedStyle(n.parentElement); if(st.visibility==="hidden"||+st.opacity===0) continue; rg.selectNodeContents(n); add(rg.getBoundingClientRect()); }
  root.querySelectorAll(".tp-deco,.boxed .in,.outlined .in,.tagged .in,.tp-pill").forEach(function(e){ add(e.getBoundingClientRect()); });
  return { left:x0, right:x1, top:y0, bottom:y1 }; }
window.__tpInk=inkBox;
// Luật 21: dòng TRÊN có dấu dưới / nét móc (g, j, p, q, y…) thì dòng dưới không được chạm — đo nét thật, chạm thì đẩy xuống
var HG=new RegExp(${JSON.stringify(HANG_RE.source)}), CV=document.createElement("canvas").getContext("2d"), lastF="", fa=0;
window.__tpHangs=HG;
function inkChars(line,sc){ var out=[], tw=document.createTreeWalker(line,NodeFilter.SHOW_TEXT), n, rg=document.createRange();
  while((n=tw.nextNode())){ if(!n.data.trim()) continue; var st=getComputedStyle(n.parentElement); if(st.visibility==="hidden") continue;
    var f=st.fontStyle+" "+st.fontWeight+" "+st.fontSize+" "+st.fontFamily; if(f!==lastF){ CV.font=f; fa=CV.measureText("H").fontBoundingBoxAscent; lastF=f; }
    for(var i=0;i<n.data.length;i++){ var ch=n.data[i]; if(!ch.trim()) continue; var j=i+1; while(j<n.data.length && /[\u0300-\u036f]/.test(n.data[j])) j++;
      rg.setStart(n,i); rg.setEnd(n,j); var b=rg.getBoundingClientRect(), m=CV.measureText(n.data.slice(i,j)); i=j-1;
      out.push({ l:b.left, r:b.right, top:b.top+(fa-m.actualBoundingBoxAscent)*sc, bot:b.top+(fa+m.actualBoundingBoxDescent)*sc }); } }
  return out; }
function unhang(tp){ var sc=tp.getBoundingClientRect().width/(tp.offsetWidth||1)||1;
  var L=[].slice.call(tp.querySelectorAll(".tp-line")).filter(function(l){ return l.textContent.trim(); });
  L.forEach(function(l){ if(l.dataset.uh==null) l.dataset.uh=l.style.marginTop; l.style.marginTop=l.dataset.uh; });
  for(var k=1;k<L.length;k++){ var up=L[k-1], lo=L[k];
    if(!HG.test(up.textContent.normalize("NFD"))) continue;
    var A=inkChars(up,sc), B=inkChars(lo,sc), gap=0.05*parseFloat(getComputedStyle(lo).fontSize)*sc, need=0;
    A.forEach(function(a){ B.forEach(function(b){ if(b.r<=a.l||b.l>=a.r) return; var d=a.bot+gap-b.top; if(d>need) need=d; }); });
    if(need>0.5) lo.style.marginTop=(parseFloat(getComputedStyle(lo).marginTop)||0)+need/sc+"px"; } }
function lay(force, scope){
  if(window.__tpLock && !force) return;
  // scope: chỉ bố cục lại một khối (.tp-pos) — gọi từng khối thì không đo lại cả trang
  var Q=function(sel){ return scope ? [].slice.call(scope.querySelectorAll(sel)).concat(scope.matches(sel) ? [scope] : []) : [].slice.call(document.querySelectorAll(sel)); }; // trang đã tự đặt bố cục xong và gắn chuyển động (lib/template.html): không đo lại trên trạng thái đang diễn hoạt
  // 1) chữ thật quá dài (khối phải thu dưới 72 %): xuống dòng dòng rộng nhất tại khoảng trắng gần giữa nhất, thay vì thu nhỏ
  Q(".tp-pos[data-maxw]").forEach(function(pos){
    if(pos._wrapped || pos.dataset.wrap==="0" || (document.fonts && document.fonts.status!=="loaded")) return; // đo bằng font thật, không đo font dự phòng
    var s0=+pos.dataset.scale||1, cur=pos._s||s0, b=box(pos), w=(b[1]-b[0])/cur;
    if(w*s0 <= +pos.dataset.maxw/0.72) return;
    var best=null, bw=0;
    pos.querySelectorAll(".tp-line .in").forEach(function(inn){ if(inn.scrollWidth>bw){ bw=inn.scrollWidth; best=inn; } });
    // chỉ xuống dòng chính dòng rộng nhất (dòng gõ có con trỏ thì không: con trỏ chạy theo một hàng)
    // dòng key (chữ nhấn) giữ một hàng: không ngắt, để bước sau thu nhỏ cả khối (người dùng duyệt 30/10/2026)
    if(!best || best.closest(".caret-line") || best.closest(".key-line") || !best.querySelector(".ch.sp")) return;
    var mid=best.scrollWidth/2, pick=null, d=1e9;
    best.querySelectorAll(".ch.sp").forEach(function(sp){ if(sp.closest(".hl")) return; var dd=Math.abs(sp.offsetLeft-mid); if(dd<d){ d=dd; pick=sp; } });
    if(!pick) return;
    var br=document.createElement("br"); pick.replaceWith(br);
    best.style.lineHeight="1.32"; /* chữ hoa có dấu chồng: dòng dưới cần ≥ 1,3 để dấu không chạm chân dòng trên */ best.style.textAlign="center"; pos._wrapped=1;
  });
  // 1b) nhãn gắn góc: KHÔNG che nét chữ — mép nhãn chỉ chạm sát đỉnh chữ hoa (tl) hoặc chân chữ (br), phần đè nằm trong
  //     khoảng trống dấu; trượt dọc mép tới đoạn các chữ bên dưới/bên trên nhãn không có dấu (tl: dấu trên · br: dấu nặng),
  //     không có đoạn nào thì nhãn đứng hẳn ngoài KEY. Đường cơ sở đo bằng mốc thật trong dòng (đúng cả với số đếm inline-grid).
  //     Hộp màu (boxed): nhãn đè mép hộp, thẳng mép trái/phải hộp.
  var cv=document.createElement("canvas").getContext("2d");
  var ABOVE=/[\u0300\u0301\u0303\u0309\u0302\u0306\u031B]/, BELOW=/\u0323/;
  Q(".tp-nhan").forEach(function(n){
    var inn=n.parentElement, at=n.dataset.at, nw=n.offsetWidth, nh=n.offsetHeight, W=inn.offsetWidth, H=inn.offsetHeight;
    if(inn.closest(".boxed")){ var bl=(at==="tl" ? 0 : W-nw), bt=(at==="tl" ? -nh+0.38*nh : H-0.38*nh);
      // phần nhãn đè vào hộp không được che dấu: chữ dưới nhãn có dấu nặng (br) / dấu trên (tl) → nhãn ra hẳn ngoài mép hộp
      var hitB=[].slice.call(inn.querySelectorAll(".ch")).some(function(c){ var x0=0,e=c; while(e&&e!==inn){ x0+=e.offsetLeft; e=e.offsetParent; }
        return (at==="tl" ? ABOVE : BELOW).test(c.textContent.normalize("NFD")) && x0+c.offsetWidth>bl+2 && x0<bl+nw-2; });
      if(hitB) bt = at==="tl" ? -nh-Math.round(0.04*nh) : H+Math.round(0.04*nh);
      n.style.left=bl+"px"; n.style.top=bt+"px"; return; }
    var cs=[].slice.call(inn.querySelectorAll(".ch")).filter(function(c){ return !c.closest(".big"); });
    // dòng tự xuống dòng: nhãn trên bám dòng ĐẦU, nhãn dưới bám dòng CUỐI (mốc đường cơ sở đặt đầu/cuối dòng)
    var mk=document.createElement("span"); mk.style.cssText="display:inline-block;width:0;height:0;vertical-align:baseline";
    if(at==="tl") inn.insertBefore(mk, inn.firstChild); else inn.appendChild(mk);
    var base=mk.offsetTop; mk.remove();
    var f=getComputedStyle(cs[0]||inn), em=parseFloat(f.fontSize); cv.font=f.fontStyle+" "+f.fontWeight+" "+em+"px "+f.fontFamily;
    var cap=base-cv.measureText("H").actualBoundingBoxAscent;
    var info=cs.map(function(c){ var x0=0,e=c; while(e&&e!==inn){ x0+=e.offsetLeft; e=e.offsetParent; } var t=c.textContent.normalize("NFD"), m=cv.measureText(c.textContent);
      var y0=0; e=c; while(e&&e!==inn){ y0+=e.offsetTop; e=e.offsetParent; }
      return { x0:x0, x1:x0+c.offsetWidth, ln:y0, hit: at==="tl" ? ABOVE.test(t) : BELOW.test(t), top: base-m.actualBoundingBoxAscent, bot: base+m.actualBoundingBoxDescent }; });
    var lnSel = at==="tl" ? Math.min.apply(null,info.map(function(c){return c.ln;})) : Math.max.apply(null,info.map(function(c){return c.ln;}));
    info=info.filter(function(c){ return Math.abs(c.ln-lnSel)<2; }); // chỉ xét chữ của dòng nhãn bám
    var free=function(px){ return !info.some(function(c){ return c.hit && c.x1>px+2 && c.x0<px+nw-2; }); };
    var step=Math.max(6,em*0.04), ok=null, k, px, y, gap=Math.round(0.04*nh);
    if(at==="tl"){ for(k=0;k<80;k++){ px=k*step; if(px+nw>W) break; if(free(px)){ ok=px; break; } }
      if(ok===null){ ok=0; y=Math.min.apply(null,info.map(function(c){return c.top;}))-nh-gap; } else y=cap-nh+gap; }
    else { for(k=0;k<80;k++){ px=W-nw-k*step; if(px<0) break; if(free(px)){ ok=px; break; } }
      if(ok===null){ ok=Math.max(0,W-nw); y=Math.max.apply(null,info.map(function(c){return c.bot;}))+gap; } else y=base-gap; }
    n.style.left=Math.round(ok)+"px"; n.style.top=Math.round(y)+"px";
  });
  // 1c) luật 21: gỡ đè dấu / nét móc giữa hai dòng liền nhau
  Q(".tp-pos .tp").forEach(unhang);
  // 2) gradient ngang liền dòng: vị trí từng ký tự (--x) và bề rộng dòng (--lw)
  Q(".tp-line .in, .tp-line .big").forEach(function(bx){
    bx.style.setProperty("--lw", bx.scrollWidth+"px");
    bx.querySelectorAll(".ch").forEach(function(c){
      if(bx.classList.contains("in") && c.closest(".big")) return;
      var x=0,e=c; while(e && e!==bx){ x+=e.offsetLeft; e=e.offsetParent; }
      c.style.setProperty("--x", x+"px");
    });
  });
  // 3) khối rộng hơn data-maxw: thu nhỏ cả khối; khối lệch (dòng có dx) tràn mép khung: dịch vào trong (lề 24 px)
  Q(".tp-pos[data-maxw]").forEach(function(pos){
    var s0=+pos.dataset.scale||1, cur=pos._s||s0, b=box(pos);
    var w=(b[1]-b[0])/cur, max=+pos.dataset.maxw;
    var s=Math.min(s0, max/w); if(Math.abs(s-cur)>1e-3){ pos._s=s; }
    var tf=function(dx){ pos.style.transform=(pos.dataset.anchor==="left"?"":"translateX(-50%) ")+"translateX("+dx+"px) scale("+(pos._s||s0)+")"; };
    tf(pos._dx||0); b=box(pos);
    // so trong hệ tọa độ của khung chứa (khối có thể nằm trong một ô lệch khỏi mép trang, như kt-slot của lib/)
    var op=pos.offsetParent||document.body, ox=op.getBoundingClientRect().left; b=[b[0]-ox, b[1]-ox];
    var W=op.clientWidth||1080, sh=0;
    // center "ink": căn giữa theo nét chữ thật (preset có dòng lệch ngang dx), không theo khung bố cục
    if(pos.dataset.center==="ink"){ var ib=inkBox(pos.firstElementChild), want=W/2-(ib.left+ib.right)/2+ox; if(Math.abs(want)>0.5){ pos._dx=(pos._dx||0)+want; tf(pos._dx); b=[b[0]+want,b[1]+want]; } }
    var E=pos.dataset.edge?+pos.dataset.edge:24; if(b[1]>W-E) sh=W-E-b[1]; if(b[0]+sh<E) sh=E-b[0];
    if(sh){ pos._dx=(pos._dx||0)+sh; tf(pos._dx); }
  });
}
window.__tpLay=function(pos){ lay(true, pos); }; // bố cục lại một khối (pos) sau khi dời chỗ / đổi bề rộng (lib/template.html); không truyền pos: cả trang
lay(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(lay);
})();</script>`;
}

// ---------- Diễn hoạt vào (học từ chuỗi khung video mẫu) ----------
// giãn cách từng chữ theo số ký tự THẬT của dòng (chữ thật dài hơn chữ mẫu vẫn vào trong cùng khoảng thời gian)
const st = (n, max, total) => `(i, e, a) => i * Math.min(${max}, ${total} / a.length)`;
const ANIM = {
  // nhãn gắn góc bật ra từ góc của nó
  nhan: (s, t) => `tl.fromTo("${s}", { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(2.2)" }, ${t});`,
  // gõ từng chữ: hiện dần từ trái, mờ → rõ
  type: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, x: -10, filter: "blur(6px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.28, stagger: ${st(n, .05, .6)}, ease: "power2.out" }, ${t});`,
  // gõ chữ có con trỏ (CĂN HỘ CAO CẤP): hé lộ từng nấc, con trỏ chạy theo rồi nháy và tắt
  caret: (s, t) => `{ const n = document.querySelectorAll("${s} .ch").length || 1; tl.fromTo("${s} .in", { "--rev": "0%" }, { "--rev": "100%", duration: 0.06 * n + .2, ease: "steps(" + n + ")" }, ${t}); tl.fromTo("${s} .tp-caret", { opacity: 1 }, { opacity: 0, duration: 0.12, repeat: 3, yoyo: true, ease: "none", immediateRender: false }, ${t} + 0.06 * n + .25); tl.set("${s} .tp-caret", { opacity: 0 }, ${t} + 0.06 * n + .75); }`,
  // chữ dàn rộng rồi khép lại (Bất động sản, Nâng tầm cuộc sống, 100 Triệu) — dịch x từng chữ, không đổi letter-spacing
  spread: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, x: (i, e, a) => (i - (a.length - 1) / 2) * 26 }, { opacity: 1, x: 0, duration: 0.8, stagger: ${st(n, .03, .4)}, ease: "power3.out" }, ${t});`,
  // chữ ký viết dần trái → phải
  wipe: (s, t) => `tl.fromTo("${s} .in", { clipPath: "inset(-45% 100% -45% -8%)" }, { clipPath: "inset(-45% -8% -45% -8%)", duration: 0.75, ease: "power1.inOut" }, ${t}); tl.set("${s} .in", { clipPath: "none" }, ${(t + 0.76).toFixed(3)});`,
  // từng chữ hiện dần tại chỗ / trồi lên
  fadeCh: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: ${st(n, .05, .5)}, ease: "power1.out" }, ${t});`,
  riseCh: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, y: 40, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, stagger: ${st(n, .05, .5)}, ease: "power3.out" }, ${t});`,
  // từng chữ nảy (Tăng cao, ¿Bí quyết?)
  pop: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, scale: 0, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: ${st(n, .06, .6)}, ease: "back.out(2.6)" }, ${t});`,
  // chữ nhỏ bật ra cỡ to nhỏ khác nhau rồi về cỡ thật (thứ bạn cần có)
  popRand: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, scale: (i) => [1.9, .5, 1.5, .7][i % 4], y: (i) => [-14, 10, -6, 12][i % 4] }, { opacity: 1, scale: 1, y: 0, duration: 0.35, stagger: ${st(n, .05, .5)}, ease: "back.out(2)" }, ${t});`,
  // từng chữ rơi từ to xuống (Đăng Ký, Đầu Tư, Edit Video)
  drop: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, y: -50, scale: 1.7, filter: "blur(8px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.4, stagger: ${st(n, .05, .5)}, ease: "power3.out" }, ${t});`,
  // từng chữ thu từ rất to, mờ về cỡ thật (CĂN HỘ, An Toàn, Phù Hợp, Căn Hộ)
  zoomCh: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, scale: 2.4, filter: "blur(12px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.45, stagger: ${st(n, .05, .45)}, ease: "power3.out" }, ${t});`,
  // từng chữ lớn dần từ nhỏ (Dòng xe SUV)
  grow: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: 0.4, stagger: ${st(n, .04, .45)}, ease: "power2.out" }, ${t});`,
  // từng chữ trượt vào có vệt mờ chuyển động (CAPCUT từ phải, 50 TRIỆU từ trái)
  streakR: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, x: 90, scaleX: 1.6, filter: "blur(10px)" }, { opacity: 1, x: 0, scaleX: 1, filter: "blur(0px)", duration: 0.35, stagger: ${st(n, .06, .5)}, ease: "power3.out" }, ${t});`,
  streakL: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, x: -90, scaleX: 1.6, filter: "blur(10px)" }, { opacity: 1, x: 0, scaleX: 1, filter: "blur(0px)", duration: 0.35, stagger: ${st(n, .06, .5)}, ease: "power3.out" }, ${t});`,
  // chữ bay từ nhiều hướng rồi tụ lại (Sinh lời, chưa biết gì)
  scatter: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, x: (i) => ((i * 73) % 9 - 4) * 30, y: (i) => ((i * 37) % 7 - 3) * 26, rotation: (i) => ((i * 53) % 11 - 5) * 10 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.6, stagger: ${st(n, .04, .4)}, ease: "power3.out" }, ${t});`,
  // từng chữ xoay lộn vào (Hiện Đại, Phong cách sống)
  tumble: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, rotation: -80, y: 30, transformOrigin: "50% 100%" }, { opacity: 1, rotation: 0, y: 0, duration: 0.45, stagger: ${st(n, .05, .5)}, ease: "back.out(1.6)" }, ${t});`,
  // từng chữ trồi theo sóng (phát triển)
  wave: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, y: (i) => -30 * Math.sin(i * .9), rotation: (i) => 18 * Math.cos(i * .9) }, { opacity: 1, y: 0, rotation: 0, duration: 0.5, stagger: ${st(n, .05, .5)}, ease: "power2.out" }, ${t});`,
  // từng chữ nảy xuống bậc thang (Không Gian)
  bounce: (s, t, n) => `tl.fromTo("${s} .ch", { opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.6, stagger: ${st(n, .07, .5)}, ease: "bounce.out" }, ${t});`,
  // từng từ hiện lần lượt (đẳng cấp cho Bạn)
  words: (s, t) => `tl.fromTo("${s} .ch.w, ${s} .hl", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.18, ease: "power2.out" }, ${t});`,
  // cả dòng
  blur: (s, t) => `tl.fromTo("${s} .in", { opacity: 0, scale: 1.35, filter: "blur(18px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, ${t});`,
  slide: (s, t) => `tl.fromTo("${s} .in", { opacity: 0, x: -140, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, ${t});`,
  rise: (s, t) => `tl.fromTo("${s} .in", { opacity: 0, y: 36, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, ${t});`,
  fade: (s, t) => `tl.fromTo("${s} .in", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, ${t});`,
  // trượt ra từ sau thanh dọc (SEDAN): phần bên trái bị che, chữ đi từ trái sang; cụm tô nền kéo dài sau
  reveal: (s, t) => `tl.fromTo("${s} .in", { x: -260, clipPath: "inset(-40% -10% -40% 260px)" }, { x: 0, clipPath: "inset(-40% -10% -40% 0px)", duration: 0.55, ease: "power3.out" }, ${t}); tl.set("${s} .in", { clipPath: "none" }, ${(t + 0.56).toFixed(3)}); tl.fromTo("${s} .hl", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.35, ease: "power2.out" }, ${(t + .35).toFixed(3)});`,
  // hộp mở từ trái rồi chữ hiện (Vị Trí, TÊN KÊNH)
  box: (s, t, n) => `tl.fromTo("${s} .in", { clipPath: "inset(-30% 100% -30% -6%)" }, { clipPath: "inset(-30% -10% -30% -6%)", duration: 0.4, ease: "power2.out" }, ${t}); tl.set("${s} .in", { clipPath: "none" }, ${(t + 0.41).toFixed(3)}); tl.fromTo("${s} .ch", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, stagger: ${st(n, .04, .4)}, ease: "power2.out" }, ${(t + 0.22).toFixed(3)});`,
  // hộp mở rồi chữ dàn rộng khép lại (CapCut trong hộp)
  boxSpread: (s, t, n) => `tl.fromTo("${s} .in", { clipPath: "inset(-30% 100% -30% -6%)" }, { clipPath: "inset(-30% -10% -30% -6%)", duration: 0.4, ease: "power2.out" }, ${t}); tl.set("${s} .in", { clipPath: "none" }, ${(t + 0.41).toFixed(3)}); tl.fromTo("${s} .ch", { opacity: 0, x: (i, e, a) => (i - (a.length - 1) / 2) * 30 }, { opacity: 1, x: 0, duration: 0.6, stagger: ${st(n, .03, .3)}, ease: "power3.out" }, ${(t + 0.2).toFixed(3)});`,
};
// ---------- Hiệu ứng màu / ánh sáng (fx) ----------
const FX = {
  // chuỗi màu (Thay đổi màu sắc, Cơ hội, Không Gian Sống): đi qua từng màu, dừng ở màu cuối của dòng
  seq: (s, t, f, l, th, rc) => {
    const lf = lineFill(l, th, rc), end = [lf.c1, lf.c2];
    const cols = f.cols;
    const js = [`tl.set("${s}", { "--c1": "${cols[0]}", "--c2": "${cols[0]}" }, ${Math.max(0, t - .35).toFixed(3)});`];
    cols.slice(1).forEach((c, i) => { const last = i === cols.length - 2; const a = last || c === "theme" ? end : [c, c];
      js.push(`tl.to("${s}", { "--c1": "${a[0]}", "--c2": "${a[1]}", duration: ${f.step}, ease: "none" }, ${(t + i * f.step).toFixed(3)});`); });
    return js.join(" ");
  },
  // báo động (Cẩn Thận): chữ nháy đỏ 3 nhịp rồi về trắng, nét gạch tắt dần
  alarm: (s, t) => `tl.to("${s}", { "--c1": "#FF1518", "--c2": "#FF7375", "--glow": "#FF1E1E", duration: 0.15, repeat: 5, yoyo: true, ease: "none" }, ${t}); tl.to("${s}", { "--c1": "#ffffff", "--c2": "#ffffff", "--glow": "#ffffff", duration: 0.3 }, ${(t + 0.95).toFixed(3)}); tl.to("${s} .dr.fade", { opacity: 0, duration: 0.3 }, ${(t + 1.1).toFixed(3)});`,
  // vệt sáng quét qua chữ (Bất động sản)
  shine: (s, t) => `tl.fromTo("${s}", { "--sx": "-500px" }, { "--sx": "1400px", duration: 1.1, ease: "power1.inOut" }, ${t});`,
  // màu dâng từ chân chữ lên tới đỉnh sau khi chữ trắng hiện (Capcut: khung cuối phủ kín màu)
  splitIn: (s, t) => `tl.fromTo("${s}", { "--lv": "0%" }, { "--lv": "102%", duration: 0.8, ease: "power1.inOut" }, ${t});`,
  // hạt lấp lánh bật ra rồi tắt
  sparkle: (s, t) => `tl.fromTo("${s} .tp-spark", { opacity: 0, scale: 0, rotation: -60 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.3, stagger: 0.08, ease: "back.out(3)" }, ${t}); tl.to("${s} .tp-spark", { opacity: 0, scale: .4, duration: 0.4, stagger: 0.08 }, ${(t + .6).toFixed(3)});`,
};
const decoJs = (s, t) => `tl.fromTo("${s} .tp-deco", { clipPath: "inset(-60% 115% -60% -15%)" }, { clipPath: "inset(-60% -10% -60% -15%)", duration: 0.6, ease: "power2.inOut" }, ${t}); tl.set("${s} .tp-deco", { clipPath: "none" }, ${(t + 0.62).toFixed(3)}); tl.fromTo("${s} .hd-dot", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, ${t}); tl.fromTo("${s} .tp-marker", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, ${t});`;
const bigJs = (s, t) => `tl.fromTo("${s} .big", { opacity: 0, x: -120, scale: 1.4, filter: "blur(10px)" }, { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, ${t});`;
// số đếm lên: bật lần lượt các bước dựng sẵn (không onUpdate — callback bị bỏ qua khi tua khung; không tl.set textContent —
// GSAP đọc "1.200" thành số 1.2)
const COUNT_N = 24;
const countJs = (s, t) => `{ const st = document.querySelectorAll("${s} .nvs"); tl.set(st, { visibility: "hidden" }, ${t}); st.forEach((e, i) => { const at = ${t} + 0.9 * i / ${COUNT_N}; tl.set(e, { visibility: "visible" }, at); if (i < st.length - 1) tl.set(e, { visibility: "hidden" }, ${t} + 0.9 * (i + 1) / ${COUNT_N}); }); }`; // lúc bắt đầu đếm tắt MỌI bước (kể cả số cuối đang hiện sẵn) → chỉ 1 lớp số

/** Mã GSAP (chuỗi) cho timeline `tl`: vào lúc `at`, giữ `hold` giây kể từ lúc vào, ra bằng mờ + bay lên.
 *  theme: như presetHtml (fx đổi màu của dòng key kết thúc ở màu theme). */
export function presetJs(pid, sel, at, { hold = 2.5, exit = true, speed = 1, theme, recolor } = {}) {
  const p = PRESET[pid];
  const th = theme ?? THEMES.coral;
  const js = [`tl.set("${sel}", { opacity: 1 }, ${at});`];
  if (p.vbar) js.push(`tl.fromTo("${sel} .tp-vbar", { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.35, ease: "power2.out" }, ${at});`);
  p.lines.forEach((l, k) => {
    const t = +(at + (l.d ?? 0) / speed).toFixed(3);
    const s = l.nhan ? `${sel} .st${k}` : `${sel} .L${k}`;
    const n = graphemes(l.t ?? l.pill ?? "").length || 1;
    if (l.big) js.push(bigJs(s, t));
    js.push((ANIM[l.a] ?? ANIM.rise)(s, l.big ? +(t + 0.2).toFixed(3) : t, n));
    if (l.count) js.push(countJs(s, t));
    if (l.deco) js.push(decoJs(s, +(t + 0.35).toFixed(3)));
    for (const f of l.fx ?? []) js.push(FX[f.k](s, +(t + (f.d ?? 0)).toFixed(3), f, l, th, recolor));
  });
  if (exit) js.push(`tl.to("${sel}", { opacity: 0, filter: "blur(8px)", y: -14, duration: 0.3, ease: "power2.in" }, ${+(at + hold - 0.3).toFixed(3)});`);
  return js.join("\n");
}

export const ANIMS = Object.keys(ANIM);
