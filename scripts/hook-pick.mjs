#!/usr/bin/env node
// hook-pick.mjs — xếp hạng phương án hook 3 giây đầu (docs/TRINH-BAY.md mục 1), trừ điểm lặp theo khách.
//   node scripts/hook-pick.mjs projects/<video>/hook.json
//   node scripts/hook-pick.mjs projects/<video>/hook.json --commit [id]
// hook.json: { "video": "kenh-du-an", "client": "kenh",
//   "opening": "câu mở", "peak": 1.2, "payoff": 41.5,
//   "candidates": [ { "id": "number", "content": "3,2 TỶ", "fit": 5, "payoff": 4, "motion": 4, "space": 4 }, ... ] }
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const IDS = ["mystery", "stamp", "strike", "number", "question", "versus", "title"];
const W = { fit: 0.35, payoff: 0.25, motion: 0.2, space: 0.2 };
const PEN = [25, 15, 8]; // video trước, trước nữa, thứ ba (cùng khách)
const HIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "clients", "hook-history.json");

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && a.endsWith(".json"));
if (!file) { console.error("Cách dùng: node scripts/hook-pick.mjs <hook.json> [--commit [id]]"); process.exit(1); }
const h = JSON.parse(fs.readFileSync(file, "utf8"));
if (!h.client) { console.error('hook.json thiếu "client".'); process.exit(1); }
const hist = fs.existsSync(HIST) ? JSON.parse(fs.readFileSync(HIST, "utf8")) : [];
const past = hist.filter((x) => x.client === h.client && x.video !== h.video).slice(-3).reverse();

const warn = [];
if ((h.candidates || []).length < 3) warn.push("Cần ít nhất 3 phương án.");
const rows = (h.candidates || []).map((c) => {
  if (!IDS.includes(c.id)) warn.push(`"${c.id}" chưa có trong danh sách hook — dựng mới thì thêm vào IDS và bảng TRINH-BAY.`);
  if (c.fit < 3) return { ...c, score: null, note: "loại: fit < 3 (tắt tiếng không hiểu)" };
  let s = 20 * (W.fit * c.fit + W.payoff * c.payoff + W.motion * c.motion + W.space * c.space); // thang 100
  const notes = [];
  past.forEach((p, i) => { if (p.hook === c.id) { s -= PEN[i]; notes.push(`lặp hook video ${p.video} −${PEN[i]}`); } });
  return { ...c, score: +s.toFixed(1), note: notes.join(", ") };
}).sort((a, b) => (b.score ?? -1e9) - (a.score ?? -1e9));

for (const r of rows) console.log(`${String(r.score ?? "—").padStart(6)}  ${r.id.padEnd(9)} ${String(r.content || "").padEnd(28)} ${r.note || ""}`);
const ok = rows.filter((r) => r.score != null);
if (!ok.length) warn.push("Không phương án nào qua phép thử tắt tiếng — thiết kế hook mới.");
else if (ok.length > 1 && ok[0].score - ok[1].score <= 6) warn.push(`SÁT ĐIỂM (${ok[0].id} vs ${ok[1].id}): dựng 2 bản xem trước 3 giây cho người dùng chọn.`);
else console.log(`\nChọn: ${ok[0].id}`);
if (warn.length) console.log("\n- " + warn.join("\n- "));

const ci = args.indexOf("--commit");
if (ci >= 0) {
  const id = args[ci + 1] && !args[ci + 1].startsWith("--") && !args[ci + 1].endsWith(".json") ? args[ci + 1] : ok[0]?.id;
  if (!id) process.exit(1);
  const rest = hist.filter((x) => !(x.client === h.client && x.video === h.video));
  rest.push({ client: h.client, video: h.video, hook: id, at: new Date().toISOString().slice(0, 10) });
  fs.mkdirSync(path.dirname(HIST), { recursive: true });
  fs.writeFileSync(HIST, JSON.stringify(rest, null, 2));
  console.log(`Đã ghi lịch sử hook: ${h.client} · ${h.video} → ${id}`);
}
