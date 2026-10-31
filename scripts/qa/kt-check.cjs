// Tự kiểm chữ chốt preset BĐS (window.__kt do template ghi): tua tới lúc mỗi khối đã đứng yên, đo khung và từng ký tự.
//   node scripts/qa/kt-check.cjs build/<ten-video>/index.html <composition-id>
// Báo lỗi: lệch tâm > 8 px, tràn vùng an toàn, ký tự chưa hiện đủ (opacity < 0.99) hoặc ra ngoài khung hình, 2 khối cùng hiện.
// Trình duyệt: PW_CHROMIUM, không có thì /opt/pw-browsers/chromium (máy cloud), không có nữa thì Chromium của Playwright (`npx playwright install chromium`).
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { INIT } = require("./kt-times.cjs");
const OPT = "/opt/pw-browsers/chromium";
(async () => {
  const file = path.resolve(process.argv[2]), comp = process.argv[3] || "main";
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (fs.existsSync(OPT) ? OPT : undefined) });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.addInitScript(() => { window.__timelines = {}; });
  await p.addInitScript(INIT);
  await p.goto("file://" + file);
  await p.waitForFunction(() => window.__kt && window.__kt.length, null, { timeout: 20000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const res = await p.evaluate((comp) => {
    const tl = window.__timelines[comp], out = [];
    // mỗi khối kiểm ở lúc đã đứng yên (scripts/qa/kt-times.cjs; quay-vong: từng chữ)
    const jobs = [...window.__kt.entries()].flatMap(([i, c]) => window.__restTimes(c, tl.duration()).map((t) => [i, c, t]));
    for (const [i, c, t] of jobs) {
      tl.seek(t, false);
      // bộ chung (chung:<id>): đo theo nét chữ thật (dòng lệch ngang dx nằm ngoài khung bố cục)
      const r = c.p.startsWith("chung:") ? window.__tpInk(c.h.r) : c.h.r.getBoundingClientRect(), low = c.zone === "low";
      // vùng an toàn TikTok: y 250–1440; cột nút bên phải chiếm x > 940 từ y 700 → khối chạm y > 700 thì giới hạn ngang 60–940
      // ô hẹp (class narrow do template đặt) → kiểm theo khung 60–940; còn lại khung theo vị trí thật
      const narrow = c.h.r.closest(".kt-slot")?.classList.contains("narrow");
      const box = low ? { l: 140, r: 940, t: 1240, b: 1440 } : narrow ? { l: 60, r: 940, t: 250, b: 1440 } : r.bottom > 700 ? { l: 60, r: 940, t: 250, b: 1440 } : { l: 60, r: 1020, t: 250, b: 700 };
      const errs = [];
      const cx = (r.left + r.right) / 2, want = (box.l + box.r) / 2;
      const left = /\b(left|right)\b/.test(c.h.r.closest(".kt-slot")?.className ?? ""); // khối căn trái/phải có chủ đích (cao-trao, pill-xep): không kiểm tâm
      if (!left && Math.abs(cx - want) > 8) errs.push(`lệch tâm ${Math.round(cx - want)}px`);
      if (r.left < box.l - 1 || r.right > box.r + 1) errs.push(`tràn ngang ${Math.round(r.left)}–${Math.round(r.right)}`);
      if (r.top < box.t - 1 || r.bottom > box.b + 1) errs.push(`tràn dọc ${Math.round(r.top)}–${Math.round(r.bottom)}`);
      if (parseFloat(getComputedStyle(c.h.r).opacity) < 0.99) errs.push("khối chưa hiện đủ");
      // lớp trang trí (số mờ .bg, bóng .ghost) không được ra ngoài khung hình
      for (const g of c.h.r.querySelectorAll(".bg, .ghost")) { const q = g.getBoundingClientRect(); if (parseFloat(getComputedStyle(g).opacity) > 0.05 && (q.left < 0 || q.right > 1080)) errs.push(`lớp ${g.className} tràn khung ${Math.round(q.left)}–${Math.round(q.right)}`); }
      const chs = [...c.h.r.querySelectorAll(".ch, .w, .tx")].filter((e) => !e.closest(".ghost,.bg"));
      // chữ quay-vong: chỉ chữ đang hiện
      const vis = c.p === "quay-vong" ? chs.filter((e) => !e.classList.contains("w") || parseFloat(getComputedStyle(e).opacity) > 0.5) : chs;
      const op = (e) => { let o = 1; for (let n = e; n && n !== c.h.r.parentElement; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity); return o; };
      const dim = vis.filter((e) => e.textContent.trim() && op(e) < 0.99);
      if (dim.length) errs.push(`${dim.length} ký tự mờ: "${dim.map((e) => e.textContent).join("")}"`);
      const others = window.__kt.filter((o, j) => j !== i && parseFloat(getComputedStyle(o.h.r).opacity) > 0.05).map((o) => o.o.m || o.o.k || o.o.texts?.filter(Boolean).join(" "));
      if (others.length) errs.push(`chồng với: ${others.join(", ")}`);
      out.push({ i, t: +t.toFixed(2), p: c.p, txt: c.o.texts ? c.o.texts.filter(Boolean).join(" / ") : c.o.lines ? c.o.lines.map((L) => L.t ?? L.parts.map((x) => x.t).join(" ")).join(" / ") : `${c.o.k ?? ""} / ${c.o.m ?? c.o.words ?? c.o.value ?? c.o.so ?? (c.o.rows ?? c.o.items)?.map((x) => Object.values(x).join(" ")).join(" / ")}`, size: c.h.o.size, rect: [r.left, r.top, r.right, r.bottom].map(Math.round), errs });
    }
    return out;
  }, comp);
  let bad = 0;
  for (const x of res) { if (x.errs.length) bad++; console.log(`${x.errs.length ? "✗" : "✓"} #${x.i} ${x.t}s ${x.p} ${x.txt} size=${x.size} [${x.rect}] ${x.errs.join(" · ")}`); }
  console.log(bad ? `${bad}/${res.length} khối lỗi` : `OK ${res.length} khối`);
  await b.close();
  process.exit(bad ? 1 : 0);
})();
