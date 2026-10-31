// lib/plan.mjs — đọc projects/<video>/plan.json → dòng thời gian khối chữ (KT) + SFX, kèm kiểm luật.
// Mỗi video chỉ là DỮ LIỆU (plan.json + transcript.json); mọi code dựng nằm ở lib/. Định dạng plan: lib/README.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRESET as CHUNG } from "../text-presets/presets.mjs";

const LIB = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(LIB, "..");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const PALETTES = J(path.join(LIB, "palettes.json"));
export const STYLES = J(path.join(LIB, "styles.json"));
export const SFX_ROLES = J(path.join(LIB, "sfx-roles.json"));
const CATALOG = J(path.join(ROOT, "sfx/catalog.json"));
const r2 = (n) => Math.round(n * 100) / 100;
const base = (n) => CATALOG[n]?.base ?? n.replace(/-\d+$/, "");

// Cỡ chữ mặc định theo preset (px, khung 1080), lấy từ các video thực hành đã duyệt. Template tự co nếu tràn.
const SIZE = { "tieu-de-kep": 150, "tap-chi": 150, "tang-truong": 140, "noi-bat": 160, "top-list": 150, "khoi-noi": 140, "gia-chot": 175,
  "toc-do": 150, "ky-niem": 140, "chuyen-dong": 130, "quay-vong": 135, "nhan-neon": 115, "canh-bao": 120, "chu-bac": 135, "ky-thuat": 130,
  "song": 130, "go-chu": 90, "dien-anh": 210, "tung-chu": 160, "dia-danh": 130, "cao-trao": 150,
  // bộ ME4REAL (text-presets/bds/me4real.js)
  "kim-loai": 170, "so-khong-lo": 150, "so-dem": 130, "cap-dong": 120, "phoi-canh": 110, "noi-khoi": 190, "so-chen": 230,
  "pill-xep": 150, "nhan-ban-do": 150, "chu-gian": 150, "logo-ghep": 230, "poster-serif": 150, "so-thu-tu": 170, "khung-sdt": 150 };
// chữ hiển thị của một khối (mọi preset): để kiểm luật 1 và số liệu khớp lời
const TEXT_KEYS = new Set(["m", "m2", "k", "s", "sub", "t", "u", "hoa", "viet", "nho", "lon", "so", "truoc", "sau", "n", "value"]);
export const textsOf = (o) => {
  if (!o || typeof o !== "object") return [];
  return Object.entries(o).flatMap(([k, v]) => {
    if (k === "texts" && Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim()); // bộ chung: mỗi phần tử một dòng
    if (typeof v === "object") return textsOf(v);
    return TEXT_KEYS.has(k) && v !== "" && v != null ? [String(v).replace(/\|/g, " ")] : [];
  });
};
// Preset người dùng đã duyệt (lib/presets-duyet.json, luật 20): preset "không dùng" bị chặn; dùng cho ý nào là agent tự tính
export { DUYET } from "../text-presets/duyet.mjs";
import { DUYET } from "../text-presets/duyet.mjs";
const KHONG = new Set([...DUYET.bds.khong, ...DUYET.me4real.khong]);

// ---------- mốc thời gian theo lời: "3:sở" = chữ "sở" trong cụm 3 · "3:sở#1" = lần thứ 2 · số = giây ----------
export function wordTime(T, ref) {
  if (typeof ref === "number") return ref;
  const m = /^(\d+):([^#]+)(?:#(\d+))?$/.exec(String(ref).trim());
  if (!m) throw new Error(`Mốc "${ref}" sai dạng — dùng số giây hoặc "cụm:chữ" (vd "3:sở", "3:sở#1")`);
  const [, i, w, n] = m, chunk = T.chunks.find((c) => c.i === +i);
  if (!chunk) throw new Error(`Không có cụm ${i} trong transcript`);
  const norm = (s) => s.toLowerCase().normalize("NFC").replace(/[,.?!:;"“”]/g, "");
  const hit = chunk.words.filter((x) => norm(x.w).split(" ")[0] === norm(w));
  if (!hit[+(n ?? 0)]) throw new Error(`Cụm ${i} không có chữ "${w}" (lần ${+(n ?? 0) + 1})`);
  return hit[+(n ?? 0)].s;
}

export function loadPlan(dir) {
  const plan = J(path.join(dir, "plan.json"));
  const T = J(path.join(dir, "transcript.json"));
  const st = typeof plan.style === "string" ? { id: plan.style, ...STYLES[plan.style] } : { ...(STYLES[plan.style?.base] ?? {}), ...plan.style };
  if (!st.main) throw new Error(`style "${JSON.stringify(plan.style)}" không có preset chính — chọn S1–S5 trong lib/styles.json hoặc ghi đủ`);
  st.script ??= STYLES._script.default;
  const brandF = plan.kenh && path.join(ROOT, "clients", plan.kenh, "brand.json");
  const brand = brandF && fs.existsSync(brandF) ? J(brandF) : null;
  return { plan, T, st, brand };
}

// ---------- màu: tên nghĩa (main, so, an-toan…) → tên màu → { c, c2 } ----------
function colorOf(st, brand, key = "main") {
  const set = PALETTES.sets[st.palette] ?? PALETTES.sets["vang-bien"];
  if (key === "main" && brand?.mau_nhan?.length >= 2) return { c: brand.mau_nhan[0], c2: brand.mau_nhan[1] };
  const name = set[key] ?? key, col = PALETTES.colors[name];
  if (!col) throw new Error(`Màu "${key}" không có trong lib/palettes.json`);
  return col;
}

export function resolveBlocks({ plan, T, st, brand }) {
  const warn = [];
  const roles = { "chot-y": st.main, ...(plan.roles ?? {}) };
  const T_TEXT = T.chunks.map((c) => c.text).join(" ").toLowerCase();
  const KT = (plan.blocks ?? []).map((b, i) => {
    const p = b.p ?? roles[b.role] ?? st.main;
    // bộ chung (text-presets/presets.mjs): ghi "chung:<id>", chữ ở o.texts (mỗi phần tử một dòng của preset; null = bỏ dòng)
    if (p.startsWith("chung:")) {
      const id = p.slice(6);
      if (!CHUNG[id]) throw new Error(`Khối ${i + 1}: bộ chung không có preset "${id}"`);
      if (DUYET.chung.khong.includes(id)) throw new Error(`Khối ${i + 1}: preset chung:${id} người dùng đã duyệt "không dùng" (lib/presets-duyet.json)`);
      if (!DUYET.chung.dung.includes(id)) throw new Error(`Khối ${i + 1}: preset chung:${id} chưa được duyệt (luật 20)`);
      if (!Array.isArray(b.o?.texts)) throw new Error(`Khối ${i + 1}: chung:${id} cần "o": { "texts": [dòng 1, dòng 2, …] } (${CHUNG[id].lines.length} dòng)`);
    }
    if (KHONG.has(p)) throw new Error(`Khối ${i + 1}: preset ${p} người dùng đã duyệt "không dùng" (lib/presets-duyet.json)`);
    const bvKhong = DUYET.bien_the_khong[p]?.vai ?? [];
    if (bvKhong.length && (b.o?.lines ?? []).some((L) => (L.parts ?? [L]).some((x) => bvKhong.includes(x.v))))
      throw new Error(`Khối ${i + 1}: ${p} dùng vai ${bvKhong.join("/")} — biến thể người dùng đã duyệt "không dùng" (lib/presets-duyet.json)`);
    const at = wordTime(T, b.at) + (typeof b.at === "string" ? (b.shift ?? -0.1) : 0);
    const o = { ...(p === "canh-bao" ? colorOf(st, brand, "phu-dinh") : colorOf(st, brand, b.color)), size: b.size ?? SIZE[p] ?? 140, ...b.o };
    if (p === "nhan-neon") o.glow ??= o.c;
    if (o.lines) o.lines = o.lines.map((L) => (L.at != null ? { ...L, at: r2(wordTime(T, L.at) + (typeof L.at === "string" ? -0.08 : 0)) } : L));
    // luật 1: mỗi dòng 2–5 chữ (chỉ cảnh báo: tên riêng, số có thể ngắn hơn)
    const lines = o.lines ? o.lines.map((L) => (L.parts ?? [L]).map((x) => x.t).join(" ")) : textsOf(o);
    for (const L of lines) if (String(L).split(/\s+/).length > 5) warn.push(`khối ${i + 1} "${L}": quá 5 chữ (luật 1)`);
    // số liệu trên chữ phải có trong lời (VAN-HANH 8)
    const nums = [...new Set(textsOf(o).join(" ").match(/\d+(?:[.,]\d+)?/g) ?? [])];
    for (const n of nums) if (!T_TEXT.includes(n.toLowerCase()) && !T_TEXT.includes(n.replace(",", ".")) && !(plan.info_numbers ?? []).includes(n)) warn.push(`khối ${i + 1}: số "${n}" không thấy trong lời — kiểm lại hoặc thêm vào info_numbers nếu lấy từ info/`);
    return { i, role: b.role, p, at: r2(at), out: b.out != null ? r2(wordTime(T, b.out)) : null, top: b.top ?? plan.top ?? 250, narrow: b.narrow,
      behind: b.behind, behindFrac: b.behindFrac, sfx: b.sfx ?? "auto", o };
  }).sort((a, b) => a.at - b.at);
  // luật 8: cùng vai → cùng preset
  const byRole = {};
  for (const c of KT) if (c.role) (byRole[c.role] ??= new Set()).add(c.p);
  for (const [r, s] of Object.entries(byRole)) if (s.size > 1) warn.push(`vai ${r} đang dùng ${[...s].join(", ")} — luật 8: một vai một preset`);
  // giờ ra: khối trước tắt trước khối sau 0,35 s (mờ ra mất 0,3 s, tắt muộn hơn thì 2 khối cùng hiện — TALKING-HEAD 4a); khối cuối giữ tới hết
  KT.forEach((c, j) => {
    c.out ??= KT[j + 1] ? r2(KT[j + 1].at - 0.35) : 999;
    c.o.hold = r2(c.out - c.at);
  });
  // cao-trao: dòng cuối phải đứng yên ≥ 0,9 s trước khi cả cụm tan (ME4REAL giữ 1–2,5 s)
  for (const c of KT.filter((c) => c.p === "cao-trao")) {
    const last = Math.max(c.at, ...c.o.lines.map((L, k) => L.at ?? c.at + k * (c.o.step ?? 0.35)));
    if (c.out - last < 0.9) warn.push(`cụm cao-trao lúc ${c.at}s: dòng cuối chỉ đứng ${r2(c.out - last)} s — dời khối sau muộn hơn hoặc bớt dòng`);
  }
  // quay-vong: mỗi chữ hiện 0,38 s và bắt đầu bay đi ở step − 0,2 s → step < 0,6 thì không chữ nào kịp đứng yên; chữ cuối cần đứng ≥ 0,5 s
  for (const c of KT.filter((c) => c.p === "quay-vong")) {
    const step = c.o.step ?? 0.65, lastIn = c.at + 0.15 + (c.o.words.length - 1) * step + 0.38;
    if (step < 0.6) warn.push(`quay-vong lúc ${c.at}s: step ${step} < 0,6 s — chữ chưa hiện đủ đã bay đi`);
    if (c.out - lastIn < 0.5) warn.push(`quay-vong lúc ${c.at}s: chữ cuối chỉ đứng ${r2(c.out - lastIn)} s — dời khối sau muộn hơn hoặc bớt chữ`);
  }
  if (KT[0] && KT[0].at > 0.5) warn.push(`khối đầu vào lúc ${KT[0].at}s — luật 4: có chữ ngay từ 0,1 s`);
  return { KT, warn };
}

// ---------- SFX: khối chữ → tiếng theo vai (auto) hoặc ghi tay; công thức tổ hợp; chống lặp loại trong 30 s ----------
export function resolveSfx({ plan, T }, KT) {
  const cues = [], used = []; // used: [{ at, base }]
  const okBase = (b, t) => !used.some((u) => u.base === b && Math.abs(u.at - t) < 30) && used.at(-1)?.base !== b;
  const pick = (role, t) => {
    const list = SFX_ROLES.roles[role] ?? SFX_ROLES.roles["chu-vao"];
    const all = [...list, ...Object.values(SFX_ROLES.roles).flat().filter((n) => !list.includes(n))];
    const name = all.find((n) => CATALOG[n] && okBase(base(n), t)) ?? list[0];
    return name;
  };
  // pri 1 = tiếng chính của khối (luật 10), 0 = tiếng phụ (công thức, lớp 2) — chỗ quá dày thì tiếng phụ nhường
  const add = (at, name, vol, why, extra = {}, pri = 1) => { cues.push({ at: r2(at), name, vol, why, pri, ...extra }); used.push({ at, base: base(name) }); };
  const F = SFX_ROLES.formulas;
  KT.forEach((c, j) => {
    const why = c.o.m ?? c.o.lines?.map((L) => L.t ?? L.parts.map((x) => x.t).join(" ")).join(" / ") ?? c.o.words?.join(" / ") ?? `${c.o.k ?? ""} ${c.o.value ?? ""}`;
    if (c.sfx === null || c.sfx === false) return;
    if (Array.isArray(c.sfx)) return add(c.at, c.sfx[0], c.sfx[1] ?? 0.45, why);
    // chữ gõ: tiếng phím chạy đúng nhịp từng ký tự (luật 16), kể cả khi là câu mời; câu mời thêm tiếng "gửi" lúc gõ xong
    if (c.p === "go-chu") {
      const n = [...new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(c.o.m)].length;
      const step = Math.min(0.06, 1.0 / Math.max(1, n)); // cùng nhịp gõ với preset (bds-presets.js goStep)
      add(c.at, "type", 0.32, why, { run: { n, step, names: ["type", "type-3"] } });
      if (c.role === "cta") { const t = c.at + n * step + 0.15; add(t, pick("cta", t), 0.5, `${why} · gõ xong`, {}, 0); }
      return;
    }
    // công thức: hook mở đầu · cụm cao-trao · số · CTA
    const formula = j === 0 && plan.hook_burst !== false ? "bung-mo" : c.p === "cao-trao" ? "cum-chu" : c.role === "cta" ? "cta" : c.p === "gia-chot" ? "con-so" : null;
    if (formula) {
      for (const f of F[formula]) {
        if (f.per_line) (c.o.lines ?? [{}]).forEach((L, k) => { const t = L.at ?? c.at + k * (c.o.step ?? 0.35); add(t, pick(f.role, t), f.vol, `${why} · dòng ${k + 1}`, {}, 1); });
        else {
          const t0 = formula === "bung-mo" && plan.hook_peak != null ? wordTime(T, plan.hook_peak) : c.at, t = t0 + f.offset;
          if (t >= 0) add(t, pick(f.role, t), f.vol, `${why} · ${f.role}`, {}, f.main ? 1 : 0); // riser không đủ chỗ trước đỉnh hook thì bỏ
        }
      }
      return;
    }
    const role = SFX_ROLES.by_text_role[c.role] ?? "chu-vao";
    add(c.at, pick(role, c.at), 0.45, why);
  });
  for (const s of plan.sfx_layer ?? []) add(s.at, s.name ?? pick(s.role ?? "chuyen-canh", s.at), s.vol ?? 0.3, s.why ?? "lớp phụ", {}, 0); // lớp 2: chuyển động phụ, chuyển cảnh trong clip (luật 17)
  // SFX không đè lời (TALKING-HEAD 4a): tiếng bắt đầu đúng âm đầu của một chữ có thể làm mờ phụ âm đầu (kiểm bằng lib/qc.mjs --asr).
  //   (âm đầu chữ rơi vào 0,15 s đầu của tiếng) tiếng phụ → dời vào khe sau chữ nếu có · tiếng chính dài > 0,25 s → chỉ cảnh báo (không tự đổi tiếng theo nghĩa)
  const WORDS = T.chunks.flatMap((c) => c.words ?? []), sfxWarn = [];
  const dur = (n) => CATALOG[n]?.duration ?? 0.5;
  const onsetHit = (t, d) => WORDS.find((w) => w.s >= t - 0.03 && w.s < t + Math.min(d, 0.15)); // âm đầu chữ rơi vào 0,15 s đầu của tiếng
  for (const c of cues) {
    if (c.run) continue;
    const w = onsetHit(c.at, dur(c.name));
    if (!w) continue;
    if (!c.pri) { // tiếng phụ: dời vào khe sau chữ đó nếu có khe trong 0,6 s; lời nói liền không có khe thì giữ nguyên (luật 17: số chốt vẫn có tiếng)
      let t = w.e ?? w.s + 0.3, hit;
      for (let k = 0; k < 3 && (hit = onsetHit(t, dur(c.name))); k++) t = hit.e ?? hit.s + 0.3;
      if (!onsetHit(t, dur(c.name)) && t - c.at <= 0.6) c.at = r2(t + 0.02);
      else sfxWarn.push(`${c.name}@${c.at} trùng âm đầu chữ "${w.w}", lời nói liền không có khe: giữ nguyên, nghe lại chỗ này`);
      continue;
    }
    if (dur(c.name) <= 0.25) continue;
    sfxWarn.push(`${c.name}@${c.at} (${dur(c.name)} s) bắt đầu ngay âm đầu chữ "${w.w}" — nghe lại; che lời thì ghi tay tiếng ngắn hơn (sfx: ["tên", vol]) hoặc dời khối`);
  }
  const missing = cues.filter((c) => !CATALOG[c.name]).map((c) => c.name);
  if (missing.length) throw new Error(`SFX không có trong kho: ${[...new Set(missing)].join(", ")}`);
  if (cues.some((c) => c.name === "scribble-2")) throw new Error("Không dùng SFX scribble-2 (CLAUDE.md)");
  // giãn cách tối thiểu 0,35 s (sfx-cues minGap): tiếng phụ sát tiếng khác thì bỏ; hai tiếng chính sát nhau thì lùi tiếng sau
  const GAP = 0.35, res = [], dropped = [];
  for (const c of cues.sort((a, b) => a.at - b.at || b.pri - a.pri)) {
    const last = res.at(-1);
    if (!last || c.at - last.at >= GAP - 1e-6) { res.push(c); continue; }
    if (c.pri > last.pri) { dropped.push(res.pop()); res.push(c); }
    else if (c.pri && last.pri) res.push({ ...c, at: r2(last.at + GAP) });
    else dropped.push(c);
  }
  const warn = [...sfxWarn, ...(dropped.length ? [`bỏ ${dropped.length} tiếng phụ vì quá sát: ${dropped.map((d) => `${d.name}@${d.at}`).join(", ")}`] : [])];
  const hook = res.filter((c) => c.at < 3).length;
  if (hook > 5) warn.push(`hook 3 s đầu có ${hook} tiếng — tối đa 4–5 lớp (M1)`);
  return { cues: res.map(({ pri, ...c }) => c), warn };
}
