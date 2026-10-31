#!/usr/bin/env node
// pick-text.mjs — gợi ý preset chữ cho từng chữ chốt của một video, có xoay vòng và nhớ lịch sử.
// Không thay phán đoán của agent: in ra lựa chọn + 2 phương án dự phòng + lý do, agent được đổi nếu có lý do tốt
// (ghi lý do vào SHOTBOOK). Quy tắc đầy đủ: text-presets/QUY-TAC-CHU.md
//
//   node text-presets/pick-text.mjs projects/<video>/text-plan.json            # in gợi ý
//   node text-presets/pick-text.mjs projects/<video>/text-plan.json --commit   # ghi kết quả + lưu lịch sử
//
// text-plan.json: { "video": "<video>", "family": "E", "moments": [
//   { "id": "k1", "role": "mo-dau", "text": "20 PHÚT VÔ TRUNG TÂM", "energy": "cao" }, ... ] }
// family: A | B | C | D | E (bộ 60 preset) | "rieng" (chỉ dùng preset BĐS + thẻ bám lời theo font của video)
// mode: "vis" (mặc định: chữ chốt thưa, xoay vòng trong video) | "bds" (bds-editor: chỉ preset B18; luật 8 — mỗi vai một preset cố định
//       trong cả video; cấm hiệu ứng ký tự ngẫu nhiên, vạch gạch hai bên; lịch sử so theo "client")
// client: tên khách (bắt buộc ở mode bds) — lịch sử chỉ so với video trước của cùng khách
// main: preset chính cho khối chữ thường (vai chot-y), vd "B18:tieu-de-kep" — nên khác video trước của khách

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DUYET, khong } from "./duyet.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HIST = path.join(HERE, "history.json");

// src: L60 = text-presets/presets.mjs · B18 = text-presets/bds · CARD = vis-cards (bám lời)
// fam: bộ font của L60 (null = theo font video) · e: năng lượng 1–3 · mv: kiểu chuyển động (để xen kẽ)
const C = (src, id, fam, e, mv) => ({ src, id, fam, e, mv });
const ROLES = {
  "mo-dau":     [C("L60","a-hook","A",3,"spread"), C("L60","e-hook","E",3,"spread"), C("L60","c-hook","C",3,"blur"), C("L60","b-title","B",2,"type"), C("B18","tung-chu",null,3,"pop"), C("B18","impact",null,3,"pop"), C("CARD","cards",null,2,"spring"), C("M4","kim-loai",null,3,"metal"), C("M4","so-khong-lo",null,3,"count")],
  "chot-y":     [C("B18","tieu-de-kep",null,2,"rise"), C("L60","a-key","A",2,"spread"), C("L60","e-key","E",2,"spread"), C("L60","c-marker","C",2,"marker"), C("CARD","cards",null,2,"spring"), C("B18","noi-bat",null,3,"burst")],
  "con-so-tien":[C("B18","gia-chot",null,2,"count"), C("L60","a-number","A",2,"count"), C("L60","e-number","E",2,"count"), C("L60","b-number","B",1,"count"), C("L60","100-trieu",null,2,"type"), C("M4","so-khong-lo",null,3,"count"), C("M4","so-chen",null,2,"drop")],
  "con-so":     [C("L60","d-counter","D",2,"count"), C("L60","b-number","B",1,"count"), C("L60","e-number","E",2,"count"), C("B18","noi-bat",null,3,"burst"), C("L60","d-spec","D",1,"slide"), C("M4","so-dem",null,2,"count"), C("M4","so-chen",null,2,"drop")],
  "tang-giam":  [C("B18","tang-truong",null,2,"rise"), C("L60","tang-cao",null,3,"pop"), C("L60","d-counter","D",2,"count"), C("M4","so-khong-lo",null,3,"count")],
  "dia-danh":   [C("B18","dia-danh",null,2,"select"), C("L60","b-location","B",1,"spread"), C("L60","d-select","D",2,"select"), C("L60","a-label","A",2,"box"), C("L60","e-label","E",2,"box"), C("L60","vi-tri",null,2,"box"), C("M4","noi-khoi",null,3,"pop3d"), C("M4","nhan-ban-do",null,2,"pin")],
  "thuat-ngu":  [C("B18","ky-thuat",null,1,"type"), C("L60","d-spec","D",1,"slide"), C("L60","c-marker","C",2,"marker")],
  "so-sanh":    [C("B18","chuyen-dong",null,2,"slide"), C("L60","a-compare","A",2,"strike"), C("L60","e-compare","E",2,"strike"), C("M4","cap-dong",null,2,"pair")],
  "canh-bao":   [C("B18","canh-bao",null,2,"strike"), C("L60","c-alert","C",2,"strike"), C("L60","can-than",null,2,"type")],
  "trich-loi":  [C("B18","go-chu",null,1,"type"), C("L60","b-quote","B",1,"rise")],
  "liet-ke":    [C("B18","quay-vong",null,2,"slot"), C("L60","b-list","B",1,"slide"), C("L60","c-step","C",2,"type"), C("B18","top-list",null,2,"drop"), C("M4","so-thu-tu",null,2,"number"), C("M4","pill-xep",null,1,"pill")],
  "trang-thai": [C("B18","nhan-neon",null,2,"swing"), C("L60","c-tag","C",2,"box"), C("L60","a-label","A",2,"box"), C("L60","e-label","E",2,"box"), C("M4","noi-khoi",null,3,"pop3d"), C("M4","phoi-canh",null,2,"tilt")],
  "thoi-gian":  [C("B18","toc-do",null,3,"streak"), C("L60","d-counter","D",2,"count")],
  "qua-khu":    [C("B18","ky-niem",null,1,"blur"), C("L60","b-title","B",1,"type")],
  "phan-moi":   [C("B18","chuong-moi",null,2,"decode"), C("L60","c-step","C",2,"type")],
  "canh-quan":  [C("B18","song",null,1,"wave"), C("L60","khong-gian-xanh",null,2,"pop"), C("M4","kim-loai",null,2,"metal")],
  "phan-khuc":  [C("B18","chu-bac",null,2,"shine"), C("L60","can-ho-cao-cap",null,2,"type"), C("L60","b-title","B",1,"type"), C("M4","chu-gian",null,2,"track")],
  "tien-ich":   [C("L60","noi-bat",null,2,"drop"), C("B18","nhan-neon",null,2,"swing"), C("L60","khong-gian-song",null,2,"type"), C("L60","a-label","A",2,"box"), C("L60","e-label","E",2,"box"), C("M4","poster-serif",null,1,"serif"), C("M4","phoi-canh",null,2,"tilt")],
  "phap-ly":    [C("B18","nhan-neon",null,2,"swing"), C("L60","c-tag","C",2,"box"), C("L60","d-spec","D",1,"slide")],
  "ten-du-an":  [C("L60","bds-dang-song",null,3,"spread"), C("B18","chu-bac",null,2,"shine"), C("L60","can-ho-cao-cap",null,2,"type"), C("L60","a-hook","A",3,"spread"), C("L60","e-hook","E",3,"spread"), C("M4","logo-ghep",null,2,"logo"), C("M4","chu-gian",null,2,"track")],
  "cta":        [C("L60","a-cta","A",2,"box"), C("L60","e-cta","E",2,"box"), C("L60","dang-ky",null,2,"type"), C("L60","comment-bao-gia",null,2,"drop"), C("L60","d-call","D",2,"type"), C("M4","khung-sdt",null,2,"box")],
  "cao-trao":   [C("B18","cao-trao",null,3,"stair")],
  "cau-hoi":    [C("L60","bi-quyet",null,2,"pop"), C("L60","tai-sao",null,2,"box"), C("B18","go-chu",null,1,"type")],
};
// sửa tên: B18 không có "impact" — dùng noi-bat
ROLES["mo-dau"] = ROLES["mo-dau"].map((c) => (c.id === "impact" ? { ...c, id: "noi-bat", mv: "burst" } : c));

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) { console.error("Cách dùng: node text-presets/pick-text.mjs <text-plan.json> [--commit]"); process.exit(1); }
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const hist = fs.existsSync(HIST) ? JSON.parse(fs.readFileSync(HIST, "utf8")) : { videos: [] };
const MODE = plan.mode || "vis";
if (MODE === "bds" && !plan.client) { console.error('mode "bds" cần trường "client" (tên khách).'); process.exit(1); }
const recent = hist.videos.filter((v) => v.video !== plan.video && (MODE !== "bds" || v.client === plan.client)).slice(-3);
// danh sách người dùng đã duyệt (text-presets/duyet.mjs; repo không có danh sách thì không chặn gì)
const BO = { B18: "bds", M4: "me4real", L60: "chung" };
const sticky = {};                                         // mode bds: vai → preset cố định trong video
const usedLast = new Set((recent.at(-1)?.presets) || []);
const usedRecent = new Set(recent.flatMap((v) => v.presets));
const fam = plan.family || "rieng";
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000; };
const E = { thap: 1, vua: 2, cao: 3 };

let da = plan.main || plan.da || null; // preset 'da': chữ chốt thường của cả video
if (MODE === "bds" && da) sticky["chot-y"] = da; // preset chính giữ vai chữ thường (QUY-TAC-CHU bước 2)
const count = {}; let prev = null; const out = []; let highUsed = 0, cardsRuns = 0;
for (const m of plan.moments) {
  // mode bds: lib/build.mjs chỉ dựng preset bộ BĐS (B18 + M4) → chỉ gợi ý hai bộ này; vai không có B18 thì dùng preset chính
  const cands = MODE === "bds" ? (ROLES[m.role] || []).filter((c) => c.src === "B18" || c.src === "M4" || (c.src === "L60" && DUYET?.chung.dung.includes(c.id))) : ROLES[m.role]; // L60 đã duyệt: lib/ dựng được dạng "chung:<id>" // M4 = bộ ME4REAL (bds/me4real.js)
  if (MODE === "bds" && ROLES[m.role] && !cands.length && da) { sticky[m.role] = da; out.push({ ...m, pick: da, score: null, why: "vai chưa có preset B18 → preset chính" }); continue; }
  if (!cands || !cands.length) { out.push({ ...m, pick: null, why: `role "${m.role}" không có trong bảng — xem QUY-TAC mục 2` }); continue; }
  if (MODE === "bds" && sticky[m.role]) {
    const key = sticky[m.role]; count[key] = (count[key] || 0) + 1; prev = { key, mv: prev?.mv };
    out.push({ ...m, pick: key, score: null, why: "luật 8: cùng vai, giữ preset đã chọn cho vai này" }); continue;
  }
  const scored = cands.map((c) => {
    let s = 0, why = [];
    const pos = cands.indexOf(c); s += 3 - Math.min(pos, 2) * 0.5; why.push(`hợp vai ${3 - Math.min(pos, 2) * 0.5}`);
    if (c.fam && c.fam !== fam) { s -= 5; why.push("khác bộ font −5"); }
    if (c.src === "L60" && fam === "rieng" && c.fam) { s -= 5; }
    if (c.src === "L60" && !c.fam) { s -= 2; why.push("mẫu gốc mang font riêng −2 (chỉ dùng nếu font trùng cặp font video)"); }
    const key = `${c.src}:${c.id}`;
    if (prev && prev.key === key) { s -= 6; why.push("trùng chữ chốt trước −6"); }
    if (prev && prev.mv === c.mv) { s -= 1.5; why.push("cùng kiểu chuyển động với chữ trước −1,5"); }
    if (khong(BO[c.src], c.id)) { s -= 99; why.push("người dùng đã duyệt không dùng (lib/presets-duyet.json)"); }
    if (MODE === "bds" && Object.values(sticky).includes(key)) { s -= 3; why.push("preset đã giữ cho vai khác −3"); }
    const isDa = da === key && m.role === "chot-y";
    const n = count[key] || 0; if (n && !isDa) { s -= 1.2 * n; why.push(`đã dùng ${n} lần −${(1.2 * n).toFixed(1)}`); }
    if (isDa) { s += 2.5; why.push("preset da +2,5"); if (prev && prev.key === key) s += 4; }
    if (MODE !== "bds" && !n && Object.keys(count).length >= 5) { s -= 3; why.push("đã đủ 5 preset khác nhau −3"); }
    if (usedLast.has(key)) { s -= 1.5; why.push("video trước đã dùng −1,5"); } else if (!usedRecent.has(key)) { s += 1; why.push("lâu chưa dùng +1"); }
    const want = E[m.energy] || 2; s -= Math.abs(want - c.e) * 0.7;
    if (c.e === 3 && highUsed >= 2) { s -= 4; why.push("đã đủ 2 chữ năng lượng cao −4"); }
    if (c.src === "CARD" && cardsRuns >= 2) { s -= 4; why.push("đã có 2 đoạn bám lời −4"); }
    s += hash(plan.video + m.id + key) * 0.6; // phá thế hòa khác nhau giữa các video
    return { c, key, s: +s.toFixed(2), why };
  }).sort((a, b) => b.s - a.s);
  let best = scored[0];
  if (best.s < 0 && da) best = { c: { e: 2, mv: "da", src: "da" }, key: da, s: 0, why: ["không có ứng viên hợp vai trong bộ font này → dùng preset chính"] };
  if (!da && m.role === "chot-y") da = best.key;
  if (MODE === "bds") sticky[m.role] = best.key;
  count[best.key] = (count[best.key] || 0) + 1;
  if (best.c.e === 3) highUsed++;
  if (best.c.src === "CARD") cardsRuns++;
  prev = { key: best.key, mv: best.c.mv };
  out.push({ ...m, pick: best.key, score: best.s, why: best.why.join(", "), alt: scored.slice(1, 3).map((x) => `${x.key} (${x.s})`) });
}

// kiểm tra tổng thể
const warn = [];
const distinct = Object.keys(count).length, total = out.filter((o) => o.pick).length;
if (MODE !== "bds" && total >= 4 && (distinct < 3 || distinct > 6)) warn.push(`Đang dùng ${distinct} preset khác nhau cho ${total} chữ chốt — nên 3–6`);
for (const [k, n] of Object.entries(count)) if (MODE !== "bds" && n / total > 0.5 && total >= 4) warn.push(`${k} chiếm ${n}/${total} — quá 1/2`);
if (MODE !== "bds" && !Object.values(count).some((n) => n / total >= 0.3) && total >= 5) warn.push("Không có preset 'da' nào ≥ 30 % — video dễ rời rạc; chọn 1 preset làm da chính cho chữ chốt thường");

// mode bds: ghi đúng tên lib/plan.json nhận — bộ BĐS / ME4REAL ghi tên trần, bộ chung ghi "chung:<id>"
const asLib = (k) => (MODE === "bds" && typeof k === "string" ? k.replace(/^L60:/, "chung:").replace(/^(B18|M4):/, "") : k);
for (const o of out) { o.pick = asLib(o.pick); if (o.alt) o.alt = o.alt.map(asLib); }
for (const o of out) console.log(`${o.id.padEnd(5)} ${o.role.padEnd(12)} → ${String(o.pick).padEnd(26)} ${o.score ?? ""}  | ${o.why}${o.alt ? "  | dự phòng: " + o.alt.join(", ") : ""}`);
console.log(`\nPreset da: ${da || "(chưa có chữ chốt vai chot-y)"}`);
if (warn.length) console.log("\nCẢNH BÁO:\n- " + warn.join("\n- "));

if (args.includes("--commit")) {
  fs.writeFileSync(file.replace(/\.json$/, ".picked.json"), JSON.stringify({ ...plan, moments: out }, null, 2));
  hist.videos = hist.videos.filter((v) => v.video !== plan.video);
  hist.videos.push({ video: plan.video, client: plan.client || null, mode: MODE, family: fam, da, presets: Object.keys(count) });
  fs.writeFileSync(HIST, JSON.stringify(hist, null, 2));
  console.log(`\nĐã ghi ${file.replace(/\.json$/, ".picked.json")} và cập nhật text-presets/history.json`);
}
