// Kiểm nét chữ bằng điểm ảnh (bổ sung kt-check): chữ bị XÉN và dòng ĐÈ dấu / nét móc của dòng trên.
//   node scripts/qa/text-ink.cjs build/<video>/index.html <composition-id> [thư-mục-ảnh-lỗi]
// Mỗi khối, tại lúc kt-check kiểm (khối đã đứng yên), chỉ hiện riêng khối đó trên nền trong suốt:
//   1) xén: chụp bản thật và bản "chữ đặc" (mọi chữ trắng, không tô gradient / mặt nạ / cắt) → điểm có nét ở bản đặc mà
//      mất ở bản thật = nét bị xén (chữ nghiêng, dấu, nét móc ra ngoài vùng tô). Preset cố ý mờ dần (fadeWhite, mặt nạ đáy) không xét.
//   2) đè: chụp riêng từng dòng (chữ đặc) → hai dòng liền nhau trùng điểm ảnh, dòng trên có dấu dưới / nét móc (luật 21) = lỗi.
// Trình duyệt: như kt-check (PW_CHROMIUM, /opt/pw-browsers/chromium, Chromium của Playwright).
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const sharp = require("sharp");
const { INIT } = require("./kt-times.cjs");
const OPT = "/opt/pw-browsers/chromium";
const CLIP_MIN = 25, OVER_MIN = 25; // điểm ảnh (khung 1080) — dưới mức này coi là răng cưa khử
const FADE = new Set(["chung:am-thuc-4-mua"]); // chữ trắng tan dần xuống (cố ý)
const SOLID = `{ -webkit-background-clip: border-box !important; background-clip: border-box !important; background-image: none !important; background-color: transparent !important;
  -webkit-text-fill-color: #fff !important; color: #fff !important; -webkit-mask-image: none !important; mask-image: none !important; clip-path: none !important;
  filter: none !important; text-shadow: none !important; box-shadow: none !important; border-color: transparent !important; }`; // giữ opacity / visibility: phần cố ý ẩn (chữ quay chưa tới, bước số đếm, bóng) không tính
(async () => {
  const file = path.resolve(process.argv[2]), comp = process.argv[3] || "main", outDir = process.argv[4];
  if (outDir) fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (fs.existsSync(OPT) ? OPT : undefined) });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.addInitScript(() => { window.__timelines = {}; });
  await p.addInitScript(INIT);
  await p.goto("file://" + file);
  await p.waitForFunction(() => window.__kt && window.__kt.length, null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  // nền trong suốt, chỉ còn lớp chữ
  await p.addStyleTag({ content: `html, body, #root { background: transparent !important; } video, .scrim, #blur, #scrim, #scrim-low { visibility: hidden !important; } #kt { visibility: visible !important; opacity: 1 !important; display: block !important; } #root { width: 1080px !important; height: 1920px !important; }` });
  const n = await p.evaluate(() => window.__kt.length);
  const alpha = async (clip) => {
    const { data, info } = await sharp(await p.screenshot({ clip, omitBackground: true })).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = new Uint8Array(info.width * info.height);
    for (let i = 0; i < a.length; i++) a[i] = data[i * 4 + 3];
    return { a, w: info.width, h: info.height };
  };
  const res = [];
  for (let i = 0; i < n; i++) {
    const job = await p.evaluate(([i, comp]) => {
      const tl = window.__timelines[comp], c = window.__kt[i];
      const t = window.__restTimes(c, tl.duration())[0]; // cùng mốc với kt-check (quay-vong: chữ đầu)
      tl.seek(t, false);
      const slot = c.h.r.closest(".kt-slot");
      document.querySelectorAll(".kt-slot").forEach((s) => (s.style.visibility = s === slot ? "" : "hidden"));
      slot.id ||= "kt" + i;
      // nhóm dòng: bộ chung = .tp-line / nhãn; bộ BĐS = con trực tiếp của khối có chữ (cao-trao: từng hàng)
      const root = c.h.r, groups = root.classList.contains("tp") ? [...root.querySelectorAll(".tp-line, .tp-nhan")] : [...root.children].flatMap((e) => (e.classList.contains("row") || !e.querySelector(".row") ? [e] : [...e.querySelectorAll(".row")])).filter((e) => e.textContent.trim());
      groups.forEach((g, k) => g.setAttribute("data-ink", k));
      const r = root.getBoundingClientRect(), q = window.__tpInk?.(root) ?? r; // vùng chữ thật (bộ chung) hoặc khung khối
      const x0 = Math.max(0, Math.floor(Math.min(r.left, q.left) - 60)), y0 = Math.max(0, Math.floor(Math.min(r.top, q.top) - 60));
      const x1 = Math.min(1080, Math.ceil(Math.max(r.right, q.right) + 60)), y1 = Math.min(1920, Math.ceil(Math.max(r.bottom, q.bottom) + 60));
      const HG = window.__tpHangs ?? window.BDS?.u.HANGS; // luật 21: cùng regex với runtime chữ
      const hang = (s) => HG.test(s.normalize("NFD"));
      return { id: slot.id, p: c.p, t, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, groups: groups.map((g) => { const q = g.getBoundingClientRect(), em = 0.35 * parseFloat(getComputedStyle(g).fontSize); // nới cho dấu / nét móc ngoài khung dòng
        return { txt: g.textContent.trim(), hang: hang(g.textContent), top: q.top, y0: q.top - em, y1: q.bottom + em }; }) };
    }, [i, comp]);
    if (job.clip.width < 4 || job.clip.height < 4) continue;
    const errs = [];
    // 1) xén
    const real = await alpha(job.clip);
    const st = await p.addStyleTag({ content: `#${job.id} *, #${job.id} ${SOLID}` });
    const solid = await alpha(job.clip);
    let clipped = 0;
    const diff = Buffer.alloc(real.a.length * 4);
    for (let k = 0; k < real.a.length; k++) if (solid.a[k] > 160 && real.a[k] < 24) { clipped++; diff[k * 4] = 255; diff[k * 4 + 3] = 255; }
    if (clipped >= CLIP_MIN && !FADE.has(job.p)) errs.push(`xén ${clipped} điểm`);
    // 2) đè dòng (chữ đặc, từng dòng một) — chỉ chụp khi có hai dòng có thể chồng nhau theo chiều dọc
    const G = job.groups, near = G.some((a, u) => G.some((b, v) => v > u && a.y0 < b.y1 && b.y0 < a.y1));
    const masks = [];
    for (let k = 0; near && k < job.groups.length; k++) {
      await p.evaluate(([id, k]) => document.querySelectorAll(`#${id} [data-ink]`).forEach((g) => (g.style.visibility = +g.dataset.ink === k ? "visible" : "hidden")), [job.id, k]);
      masks.push((await alpha(job.clip)).a);
    }
    await p.evaluate((id) => document.querySelectorAll(`#${id} [data-ink]`).forEach((g) => (g.style.visibility = "")), job.id);
    const order = near ? job.groups.map((g, k) => k).sort((a, b) => job.groups[a].top - job.groups[b].top) : [];
    for (let u = 0; u < order.length; u++) for (let v = u + 1; v < order.length; v++) {
      const A = masks[order[u]], B = masks[order[v]];
      let over = 0;
      for (let k = 0; k < A.length; k++) if (A[k] > 120 && B[k] > 120) { over++; diff[k * 4 + 2] = 255; diff[k * 4 + 3] = 255; }
      if (over >= OVER_MIN && job.groups[order[u]].hang) errs.push(`đè: "${job.groups[order[v]].txt}" chạm dấu/nét móc của "${job.groups[order[u]].txt}" (${over} điểm)`);
      else if (over >= OVER_MIN) job.note = (job.note ? job.note + "; " : "") + `chồng có chủ đích "${job.groups[order[u]].txt}" / "${job.groups[order[v]].txt}" (${over} điểm, dòng trên không có dấu dưới / nét móc)`;
    }
    await st.evaluate((e) => e.remove());
    if (errs.length && outDir) {
      await sharp(await p.screenshot({ clip: job.clip })).toFile(path.join(outDir, `${String(i).padStart(3, "0")}-${job.p.replace(":", "_")}.png`));
      await sharp(diff, { raw: { width: real.w, height: real.h, channels: 4 } }).png().toFile(path.join(outDir, `${String(i).padStart(3, "0")}-${job.p.replace(":", "_")}-loi.png`));
    }
    res.push({ i, ...job, errs });
  }
  await b.close();
  let bad = 0;
  for (const x of res) { if (x.errs.length) bad++; console.log(`${x.errs.length ? "✗" : "✓"} #${x.i} ${x.t.toFixed(2)}s ${x.p} ${x.errs.join(" · ")}${x.note ? "  (" + x.note + ")" : ""}`); }
  console.log(bad ? `${bad}/${res.length} khối lỗi nét` : `OK ${res.length} khối: không xén, không đè dấu / nét móc`);
  process.exit(bad ? 1 : 0);
})();
