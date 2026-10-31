#!/usr/bin/env node
// Kiểm chữ toàn bộ preset đã duyệt với câu chữ khác chữ mẫu (lỗi hay gặp: xén nét, đè dấu/nét móc, key ngắt dòng, tràn, lệch tâm,
// chưa hiện đủ). 3 video thử, mỗi video một bộ chữ + một cặp font, dựng bằng lib/ như video thật:
//   v1 dấu nặng + nét móc xuống (S1 Be Vietnam) · v2 câu dài, dấu chồng (S6 Montserrat) · v3 rất ngắn (S4 Playfair)
//   npm run test:kiem-chu   (tạo plan + media → lib/build.mjs --no-render → kt-check → scripts/qa/text-ink.cjs)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRESET } from "../../text-presets/presets.mjs";
import { DUYET } from "../../text-presets/duyet.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");

const STYLE = ["S1", "S6", "S4"], SLOT = 2.6;

// ---------- câu chữ: [v1, v2, v3] ----------
const P3 = {
  lead: ["Quỹ đất gốc", "Chỉ cách trung tâm", "Q2"],
  main: ["giá gốc đẹp", "sở hữu vĩnh viễn", "đẹp"],
  sub: ["gần chợ, quy hoạch rõ", "pháp lý đầy đủ từng căn", "ngay"],
  hand: ["Quý giá", "Đẳng cấp thượng lưu", "Ổn"],
  num: ["1,25 TỶ", "12.500 M²", "35%"],
  place: ["Phú Mỹ Hưng", "Quận Gò Vấp mới", "Q7"],
};
const B = {
  "tieu-de-kep": (v) => ({ k: P3.lead[v], m: P3.main[v].toUpperCase() }),
  "nhan-neon": (v) => ({ m: ["Sổ hồng riêng", "Đã bàn giao từng căn", "Ổn"][v] }),
  "canh-bao": (v) => ({ m: ["Giá ảo", "Cam kết lợi nhuận ảo", "Ảo"][v] }),
  "dia-danh": (v) => ({ m: P3.place[v] }),
  "go-chu": (v) => ({ m: ["Giá gốc hay giá ảo?", "Sổ hồng riêng từng căn chưa?", "Ổn không?"][v], sub: P3.sub[v] }),
  "noi-bat": (v) => ({ m: ["Góp 0%", "Ưu đãi 18%", "35%"][v] }),
  "chuyen-dong": (v) => ({ m: ["GỬI", "THUÊ DÀI HẠN", "MUA"][v], m2: ["hay MUA", "hay SỞ HỮU VĨNH VIỄN", "hay BÁN"][v] }),
  "ky-thuat": (v) => ({ m: ["quy hoạch", "diện tích thông thủy", "PCCC"][v], sub: P3.sub[v] }),
  "chu-bac": (v) => ({ k: P3.lead[v], m: ["hạng sang", "biệt thự song lập", "đẹp"][v] }),
  "tang-truong": (v) => ({ k: P3.lead[v], m: ["tăng gấp đôi", "tăng 18% mỗi năm", "tăng"][v] }),
  "toc-do": (v) => ({ m: ["15 phút", "45 phút tới sân bay", "5'"][v] }),
  "quay-vong": (v) => ({ k: P3.lead[v], words: [["quy hoạch", "giấy tờ", "pháp lý"], ["trường quốc tế", "bệnh viện", "trung tâm thương mại"], ["ổn", "đẹp"]][v], step: 0.7 }),
  "khoi-noi": (v) => ({ k: P3.lead[v], m: ["GIÁ GỐC ĐẸP", "SỞ HỮU VĨNH VIỄN", "ĐẸP"][v], hl: ["ĐẸP", "VĨNH VIỄN", "ĐẸP"][v] }),
  "dien-anh": (v) => ({ k: ["Gò Vấp", "Phú Mỹ Hưng Quận 7", "Q2"][v], m: ["GIÁ GỐC", "VIEW SÔNG VĨNH VIỄN", "ĐẸP"][v] }),
  "tap-chi": (v) => ({ k: P3.place[v], m: ["NHÀ PHỐ GÓC", "BIỆT THỰ SONG LẬP VEN SÔNG", "ĐẸP"][v], hl: ["GÓC", "VEN SÔNG", "ĐẸP"][v] }),
  "tung-chu": (v) => ({ k: P3.lead[v], m: P3.main[v] }),
  "top-list": (v) => ({ k: "TOP", m: ["9 KHU", "10 DỰ ÁN ĐÁNG MUA", "3"][v], sub: ["giá gốc", "đáng sống nhất năm", "ổn"][v] }),
  "ky-niem": (v) => ({ m: ["Năm 2019", "Hồi giá còn rẻ", "2010"][v] }),
  "chuong-moi": (v) => ({ k: ["Phần 3", "Phần tiếp theo", "P2"][v], m: ["quy hoạch", "pháp lý từng căn", "giá"][v] }),
  "song": (v) => ({ m: ["ven sông", "view sông Sài Gòn", "sông"][v] }),
  "gia-chot": (v) => [{ k: "GIÁ GỐC", value: 1.25, suffix: " tỷ" }, { k: "GIÁ CHỈ TỪ", value: 12500, suffix: " m²" }, { k: "GIÁ", value: 35, suffix: "%" }][v],
  "cao-trao": (v) => ({ lines: [
    [{ parts: [{ t: "không chỉ", v: "dem" }, { t: "giá gốc", v: "khoa" }] }, { t: "mà còn", v: "dem" }, { t: "Quý giá", v: "cam" }, { t: "đáng sống", v: "chot" }],
    [{ parts: [{ t: "không chỉ là", v: "dem" }, { t: "nơi ở", v: "khoa" }] }, { t: "mà còn mở ra", v: "dem" }, { t: "một cơ hội", v: "nho" }, { t: "Đẳng cấp", v: "cam" }, { t: "sở hữu vĩnh viễn", v: "chot" }],
    [{ t: "rẻ", v: "dem" }, { t: "ĐẸP", v: "khoa" }, { t: "Ổn", v: "cam" }]][v] }),
  // ---- ME4REAL ----
  "kim-loai": (v) => ({ m: ["GIÁ GỐC", "SỞ HỮU VĨNH VIỄN", "ĐẸP"][v], s: P3.hand[v], tone: ["vang", "bac", "vang"][v] }),
  "so-khong-lo": (v) => [{ k: "TRIỆU ĐỒNG", value: 250, s: "quỹ đất gốc" }, { k: "TỶ ĐỒNG MỖI CĂN", value: 12, s: "hợp đồng thuê dài hạn" }, { k: "%", value: 35, s: "ổn" }][v],
  "so-dem": (v) => ({ rows: [[{ n: 12, u: "tầng" }, { n: 250, u: "phòng ngủ" }], [{ n: 1250, u: "căn hộ" }, { n: 18, u: "tiện ích quy hoạch" }], [{ n: 3, u: "PN" }]][v] }),
  "cap-dong": (v) => ({ rows: [[{ hoa: "GIÁ GỐC", viet: "Quý giá" }, { hoa: "QUY HOẠCH", viet: "Rõ ràng" }], [{ hoa: "SỞ HỮU", viet: "Vĩnh viễn" }, { hoa: "PHÁP LÝ", viet: "Đầy đủ từng căn" }], [{ hoa: "ĐẸP", viet: "Ổn" }]][v] }),
  "phoi-canh": (v) => ({ lines: [[{ t: "GIÁ GỐC" }, { parts: [{ t: "chỉ từ", v: "nho" }, { t: "1,25 TỶ", v: "so" }] }], [{ t: "THANH TOÁN SỚM" }, { parts: [{ t: "chiết khấu đến", v: "nho" }, { t: "18%", v: "so" }] }], [{ t: "GÓP" }, { parts: [{ t: "chỉ", v: "nho" }, { t: "3%", v: "so" }] }]][v], goc: -16 }),
  "noi-khoi": (v) => ({ m: ["QUỸ ĐẤT GỐC", "SỞ HỮU VĨNH VIỄN", "ĐẸP"][v], tone: ["vang", "bang", "vang"][v] }),
  "so-chen": (v) => [{ truoc: "Góp|gốc", so: "0", sau: "%" }, { truoc: "Thanh toán|chỉ", so: "18", sau: "% mỗi năm" }, { truoc: "Góp", so: "3", sau: "năm" }][v],
  "pill-xep": (v) => ({ items: [["QUỸ ĐẤT GỐC", "GẦN CHỢ"], ["12 TẦNG NỔI", "3 TẦNG HẦM", "1 TẦNG KỸ THUẬT"], ["3PN"]][v].map((t) => ({ t })) }),
  "nhan-ban-do": (v) => ({ m: ["PHÚ MỸ HƯNG", "GÒ VẤP QUY HOẠCH MỚI", "Q2"][v] }),
  "chu-gian": (v) => ({ m: ["GIÁ GỐC", "PENTHOUSE VĨNH VIỄN", "ĐẸP"][v], s: ["quỹ đất gốc", "trở thành điểm đến", ""][v] || undefined }),
  "logo-ghep": (v) => [{ m: "Mira", s: "Quý giá", so: "9", sub: "Gò Vấp" }, { m: "Lumiere", s: "Riverside", so: "12", sub: "Second Home ven sông" }, { m: "Q", s: "Ổn", so: "1", sub: "Q2" }][v],
  "so-thu-tu": (v) => ({ rows: [[{ n: "1", nho: "quỹ đất", lon: "GIÁ GỐC" }, { n: "2", nho: "luồng", lon: "Quý giá", viet: true }], [{ n: "1", nho: "một mặt bằng", lon: "THƯƠNG MẠI DỊCH VỤ" }, { n: "2", nho: "hai luồng", lon: "Đẳng cấp thượng lưu", viet: true }], [{ n: "3", nho: "", lon: "ĐẸP" }]][v] }),
  "khung-sdt": (v) => ({ m: ["0900.000.111", "0900.000.222", "1900 0000"][v] }) // số giả,
};
// bộ chung: mỗi dòng của preset nhận chữ theo vai (dòng lớn nhất = chữ chính, viết tay = chữ ký, còn lại chữ dẫn / chữ phụ),
// số → số; giữ hoa / thường theo chữ mẫu
const SCRIPT = new Set(["f-script", "f-hand"]);
function chungTexts(id, v) {
  const L = PRESET[id].lines;
  const big = L.reduce((a, l, k) => ((l.s ?? 60) > (L[a].s ?? 60) ? k : a), 0);
  return L.map((l, k) => {
    const t = l.t ?? l.pill ?? "";
    const up = t === t.toUpperCase() && /[A-ZÀ-Ỹ]/.test(t);
    let x;
    if (l.pill) x = ["trượt để nghe", "trượt để nghe máy ngay", "nghe"][v];
    else if (l.count) x = ["1.250", "12.500", "35"][v];
    else if (/^\d/.test(t)) x = id === "c-step" ? ["01 XEM QUY HOẠCH", "02 KIỂM TRA SỔ HỒNG TỪNG CĂN", "03 GÓP"][v] : P3.num[v];
    else if (SCRIPT.has(l.f)) x = P3.hand[v];
    else if (k === big) x = P3.main[v];
    else if (k < big) x = P3.lead[v];
    else x = P3.sub[v];
    if (/\[.+\]/.test(t)) x = x.replace(/(\S+)$/, "[$1]"); // dòng có cụm tô nền [..]
    return up ? x.toUpperCase() : x;
  });
}

const ids = [...DUYET.bds.dung, ...DUYET.me4real.dung.filter((p) => !DUYET.bds.dung.includes(p)), ...DUYET.chung.dung.map((p) => "chung:" + p)];
execFileSync("node", [path.join(ROOT, "tests/demo/make-media.mjs")], { stdio: "ignore" });
for (let v = 0; v < 3; v++) {
  const name = `kiem-chu-${v + 1}`, dir = path.join(ROOT, "work/kiem-chu", `v${v + 1}`), work = path.join(ROOT, "work", name); // plan sinh ra nằm trong work/ (không commit)
  fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(work, { recursive: true });
  let t = 0.1;
  const blocks = ids.map((p) => {
    const o = p.startsWith("chung:") ? { texts: chungTexts(p.slice(6), v) } : B[p](v);
    for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
    const b = { p, at: +t.toFixed(2), o, ...(p === "khung-sdt" ? { top: 1260 } : {}) };
    t += p === "quay-vong" ? 0.75 + (o.words.length - 1) * o.step + 0.38 + 0.9 : p === "cao-trao" ? 3.4 : SLOT; // đủ thời gian để mọi chữ đứng yên
    return b;
  });
  const dur = +(t + 0.5).toFixed(2);
  const T = { chunks: blocks.map((b, i) => ({ i, start: b.at, end: +(b.at + 2).toFixed(2), text: JSON.stringify(b.o).replace(/[{}"[\]:,]/g, " "), words: [] })) };
  fs.writeFileSync(path.join(dir, "transcript.json"), JSON.stringify(T));
  fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify({ video: name, kenh: null, style: { base: STYLE[v] }, info_numbers: [], blocks }, null, 1));
  // media: nền + "người" của tests/demo kéo dài đủ thời lượng; tiếng ù đúng các quãng nói
  const ff = (a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);
  ff(["-stream_loop", "-1", "-i", path.join(ROOT, "work/demo/footage.mp4"), "-t", String(dur), "-c", "copy", path.join(work, "footage.mp4")]); // lặp nền thử, không cần mã hóa lại
  const on = T.chunks.map((c) => `between(t,${c.start},${c.end})`).join("+");
  ff(["-f", "lavfi", "-i", `aevalsrc='0.3*sin(2*PI*180*t)*gt(${on},0)':s=48000:d=${dur}`, path.join(work, "voice.wav")]);
  console.log(`✔ ${path.relative(ROOT, dir)}: ${blocks.length} khối · ${STYLE[v]} · ${dur}s`);
}
