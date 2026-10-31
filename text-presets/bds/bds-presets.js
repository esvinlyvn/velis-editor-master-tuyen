/* bds-presets.js — preset chữ BĐS cho Vis (HyperFrames + GSAP 3).
 *
 * Cách dùng trong template (sau khi đã có gsap và bds-presets.css):
 *   const h = BDS.make("gia-chot", "#s2-in", { k: "GIÁ CHỐT", value: 2.5, suffix: " tỷ", size: 120, c: "#ffd23f" });
 *   const end = BDS.in(tl, h, 3.2);      // trả về giây kết thúc phần vào
 *   BDS.out(tl, h, 6.1);                 // thoát (mặc định 0,25 giây)
 *
 * Nguyên tắc: không Math.random (ngẫu nhiên theo seed), không đặt transform trong CSS, mọi fromTo ghi rõ đích,
 * hiệu ứng tạm dùng immediateRender:false — đúng luật TOOLKIT mục 5.5 để seek/render lại ra y hệt.
 * Gọi BDS.make sau khi font đã nạp (document.fonts.ready) nếu preset cần đo vị trí ký tự.
 */
(function (g) {
  "use strict";
  const SEG = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("vi", { granularity: "grapheme" }) : null;
  const graphemes = (s) => (SEG ? [...SEG.segment(String(s).normalize("NFC"))].map((x) => x.segment) : Array.from(String(s).normalize("NFC")));
  const rnd = (i, seed = 1) => { const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const B = (px) => `blur(${px}px)`;
  function chars(parent, text) {
    const out = [];
    for (const c of graphemes(text)) {
      const s = el("span", c === " " ? "ch sp" : "ch", c === " " ? "\u00a0" : c);
      parent.appendChild(s); out.push(s);
    }
    return out;
  }
  function line(root, cls, text, split = true) {
    const l = el("span", "ln " + cls);
    root.appendChild(l);
    const cs = split ? chars(l, text) : (l.textContent = text, []);
    return { l, cs };
  }
  // nhịp hiện từng ký tự có trần tổng: câu dài không kéo phần vào quá ~0,45 s (người dùng duyệt 30/10/2026: chữ phải vào xong kịp)
  const stg = (n, s, total = 0.45) => Math.min(s, total / Math.max(1, n - 1));
  const goStep = (n) => Math.min(0.06, 1.0 / Math.max(1, n)); // nhịp gõ go-chu (giây / ký tự)
  // số chữ số thập phân đúng như giá trị ghi (1,25 tỷ hiện 1,25 — không làm tròn thành 1,3)
  const decOf = (v) => { const s = String(v); return s.includes(".") ? s.split(".")[1].length : 0; };
  const fmtVi = (v, dec) => v.toLocaleString("vi-VN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const SCRAMBLE = "ABCDEGHIKLMNOPQRSTUVXY0123456789";
  // Chữ đổi theo thời gian (số đếm, giải mã) KHÔNG dùng onUpdate: khi HyperFrames tua khung để xuất, callback bị bỏ qua.
  // Dựng sẵn từng bước, xếp chồng trong inline-grid (bề rộng cố định), timeline chỉ bật/tắt từng bước.
  function steps(parent, texts, cls) {
    const st = el("span", "stack " + (cls || "")); parent.appendChild(st);
    return texts.map((t) => { const s = el("span", "st", t); st.appendChild(s); return s; });
  }
  function playSteps(tl, spans, t0, dur, ease) {
    const n = spans.length, E = gsap.parseEase(ease || "none");
    spans.forEach((s, i) => {
      const t = t0 + dur * (n === 1 ? 0 : i / (n - 1));
      tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.001, immediateRender: i === 0 }, t);
      if (i < n - 1) {
        const tn = t0 + dur * ((i + 1) / (n - 1));
        tl.fromTo(s, { opacity: 1 }, { opacity: 0, duration: 0.001, immediateRender: false }, tn);
      }
    });
  }

  const P = {};

  P["tieu-de-kep"] = {
    vi: "Tiêu đề kẹp", use: "Chữ chốt mặc định: một chữ dẫn màu + một cụm chính trắng.", from: "Minimal Style",
    sample: { k: "Giá thật", m: "SAU THUẾ", c: "#4da3ff" },
    build(r, o) { return { k: line(r, "k", o.k), m: line(r, "m", o.m) }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.k.cs, { opacity: 0, y: 0.3 * fs, filter: B(8) }, { opacity: 1, y: 0, filter: B(0), duration: 0.45, ease: "power3.out", stagger: 0.02 }, at);
      tl.fromTo(x.m.cs, { opacity: 0, y: 0.45 * fs, scale: 0.94, filter: B(12) }, { opacity: 1, y: 0, scale: 1, filter: B(0), duration: 0.5, ease: "power3.out", stagger: 0.025 }, at + 0.15);
      return at + 0.65 + 0.025 * x.m.cs.length;
    },
  };

  P["nhan-neon"] = {
    vi: "Nhãn neon", use: "Nhãn trạng thái một cụm: ĐÃ BÀN GIAO, CÓ SỔ, CHƯA CÓ PHÉP. Xanh lá = ổn, cam = chú ý.", from: "Orange · Clear Green · Fresh Simple",
    sample: { m: "Đã bàn giao", c: "#ffb03a", glow: "#ff7a00" },
    build(r, o) { if (o.glow) r.style.setProperty("--glow", o.glow); return { m: line(r, "m neon", o.m, false) }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m.l, { opacity: 0, x: -0.5 * fs, y: -0.35 * fs, rotation: -14, skewX: -18, scale: 1.25, filter: B(14) },
        { opacity: 1, x: 0, y: 0, rotation: 0, skewX: 0, scale: 1, filter: B(0), duration: 0.55, ease: "back.out(1.4)" }, at);
      tl.fromTo(x.m.l, { opacity: 1 }, { opacity: 0.55, duration: 0.05, yoyo: true, repeat: 3, immediateRender: false }, at + 0.62);
      return at + 0.85;
    },
  };

  P["canh-bao"] = {
    vi: "Cảnh báo", use: "Điều sai hay hiểu lầm: GIÁ ẢO, CAM KẾT LÃI. Hiện trắng trước, rồi bị gạch và đỏ lên.", from: "Error",
    sample: { m: "Giá ảo", c: "#ff3b4f" },
    build(r, o) { const m = line(r, "m", o.m, false); const s = el("i", "strike"); m.l.appendChild(s); return { m, s }; },
    in(tl, x, at, o, fs, C) {
      tl.fromTo(x.m.l, { opacity: 0, scale: 1.06, filter: B(12), color: "#ffffff", textShadow: "0 0 0px rgba(0,0,0,0)" },
        { opacity: 1, scale: 1, filter: B(0), color: "#ffffff", textShadow: "0 0 0px rgba(0,0,0,0)", duration: 0.45, ease: "power2.out" }, at);
      tl.fromTo(x.s, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, at + 0.9);
      tl.to(x.m.l, { color: C, textShadow: `0 0 ${0.25 * fs}px ${C}`, duration: 0.4 }, at + 1.0);
      tl.fromTo(x.m.l, { x: -0.05 * fs }, { x: 0, duration: 0.35, ease: "elastic.out(1,0.3)", immediateRender: false }, at + 1.0);
      return at + 1.4;
    },
  };

  P["dia-danh"] = {
    vi: "Địa danh", use: "Tên phường, đường, khu, dự án — như đang bôi chọn trên bản đồ.", from: "Text Focused",
    sample: { m: "Thủ Thiêm", c: "#38b6ff" },
    build(r, o) {
      const box = el("span", "ln box"); r.appendChild(box);
      const hl = el("i", "hl"), hdl = el("i", "hd l"), hdr = el("i", "hd r");
      box.append(hl, hdl, hdr);
      const m = el("span", "m"); box.appendChild(m);
      return { box, hl, hd: [hdl, hdr], cs: chars(m, o.m), m };
    },
    in(tl, x, at, o, fs) {
      const mid = x.m.offsetWidth / 2;
      tl.fromTo(x.cs, { opacity: 0, scale: 0.3, filter: B(6), x: (i, t) => mid - (t.offsetLeft + t.offsetWidth / 2) },
        { opacity: 1, scale: 1, filter: B(0), x: 0, duration: 0.55, ease: "expo.out", stagger: { each: 0.02, from: "center" } }, at);
      tl.fromTo(x.hd, { scaleY: 0 }, { scaleY: 1, duration: 0.25, ease: "back.out(2)", stagger: 0.06 }, at + 0.35);
      tl.fromTo(x.hl, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.out" }, at + 0.4);
      return at + 0.8;
    },
  };

  P["go-chu"] = {
    vi: "Gõ chữ", use: "Câu nói, câu hỏi của khách hay của sale: “Có sổ chưa em?”.", from: "Central Focus",
    sample: { m: "Có sổ chưa em?", sub: "câu đầu tiên khách hỏi", c: "#7fd3ff" },
    build(r, o) {
      const m = el("span", "ln m"); r.appendChild(m);
      const typer = el("span", "typer", o.m); const caret = el("i", "caret");
      m.append(typer, caret);
      const sub = o.sub ? line(r, "sub", o.sub, false) : null;
      return { m, typer, caret, sub, n: graphemes(o.m).length };
    },
    in(tl, x, at, o, fs) {
      const d = x.n * goStep(x.n), W = x.typer.offsetWidth; // câu dài gõ nhanh hơn: tối đa ~1 s (lib/plan.mjs dùng cùng nhịp cho tiếng phím)
      x.caret.style.left = x.typer.offsetLeft + "px";
      tl.fromTo(x.typer, { clipPath: "inset(-0.3em 100% -0.3em 0%)" }, { clipPath: "inset(-0.3em 0% -0.3em 0%)", duration: d, ease: `steps(${x.n})` }, at);
      tl.fromTo(x.caret, { opacity: 1, x: 0 }, { opacity: 1, x: W + 0.04 * fs, duration: d, ease: `steps(${x.n})` }, at);
      tl.fromTo(x.caret, { opacity: 1 }, { opacity: 0, duration: 0.01, yoyo: true, repeat: 5, repeatDelay: 0.18, immediateRender: false }, at + d);
      if (x.sub) tl.fromTo(x.sub.l, { opacity: 0, y: 0.25 * fs }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, at + d - 0.05);
      return at + d + 0.4;
    },
  };

  P["noi-bat"] = {
    vi: "Nổi bật", use: "Con số hay cụm chữ đắt nhất của video: LÃI 0%, MIỄN PHÍ 2 NĂM.", from: "Premium Text",
    sample: { m: "Lãi 0%", c: "#ffe11f" },
    build(r, o, seed) {
      const m = line(r, "m", o.m);
      const bks = [];
      m.cs.forEach((c, i) => { if (c.classList.contains("sp") || rnd(i, seed) > 0.7) return; const b = el("i", "bk"); m.l.appendChild(b); bks.push([b, c]); });
      return { m, bks };
    },
    in(tl, x, at, o, fs, C, seed) {
      x.bks.forEach(([b, c], i) => {
        b.style.left = c.offsetLeft + c.offsetWidth / 2 - 0.45 * fs + "px";
        b.style.top = c.offsetTop + c.offsetHeight / 2 - 0.45 * fs + "px";
        const t = at + 0.04 * i;
        tl.fromTo(b, { opacity: 0, scale: 0.4 }, { opacity: 0.95, scale: 1.3 + 0.5 * rnd(i, seed + 3), duration: 0.22, ease: "power2.out" }, t);
        tl.to(b, { opacity: 0, scale: 0.5, duration: 0.35, ease: "power2.in" }, t + 0.25);
      });
      tl.fromTo(x.m.cs, { opacity: 0, scale: 2, filter: B(16) }, { opacity: 1, scale: 1, filter: B(0), duration: 0.5, ease: "power3.out", stagger: { each: 0.03, from: "edges" } }, at + 0.12);
      return at + 0.75 + 0.03 * x.m.cs.length / 2;
    },
  };

  P["chuyen-dong"] = {
    vi: "Chuyển động đối", use: "So sánh hai vế: THUÊ / MUA, TRƯỚC / SAU. Hai dòng trượt ngược chiều rồi chồng lên nhau.", from: "Modern Vibrant",
    sample: { m: "THUÊ", m2: "hay MUA", c: "#2f8bff", c2: "#6fd0ff" },
    build(r, o) { return { a: line(r, "l1", o.m), b: line(r, "l2 grad", o.m2 || "") }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.a.cs, { opacity: 0, x: -1.1 * fs, filter: B(14) }, { opacity: 1, x: 0, filter: B(0), duration: 0.5, ease: "expo.out", stagger: 0.02 }, at);
      tl.fromTo(x.b.cs, { opacity: 0, x: 1.1 * fs, filter: B(14) }, { opacity: 1, x: 0, filter: B(0), duration: 0.5, ease: "expo.out", stagger: { each: 0.02, from: "end" } }, at + 0.08);
      return at + 0.7;
    },
  };

  P["ky-thuat"] = {
    vi: "Thuật ngữ", use: "Từ chuyên môn kèm một dòng giải thích: THÔNG THỦY / đo từ mép trong tường.", from: "Soft Motion · Future Digital",
    snugSub: true,
    sample: { m: "thông thủy", sub: "đo từ mép trong tường", c: "#4ea8ff", c2: "#a7e0ff" },
    build(r, o) { return { m: line(r, "m grad", o.m), sub: o.sub ? line(r, "sub", o.sub) : null }; },
    in(tl, x, at, o, fs) {
      const n = x.m.cs.length;
      tl.fromTo(x.m.cs, { opacity: 0, x: -0.2 * fs, filter: B(8) }, { opacity: 1, x: 0, filter: B(0), duration: 0.35, ease: "power2.out", stagger: stg(x.m.cs.length, 0.045) }, at);
      let end = at + 0.35 + stg(n, 0.045) * n;
      if (x.sub) { const s = stg(x.sub.cs.length, 0.03, 0.4); tl.fromTo(x.sub.cs, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: s }, end - 0.15); end += s * x.sub.cs.length; }
      return end;
    },
  };

  P["chu-bac"] = {
    vi: "Chữ bạc", use: "Phân khúc, đẳng cấp: HẠNG SANG, CAO CẤP. Ánh kim quét qua.", from: "Bright Silver",
    sample: { k: "Căn hộ", m: "hạng sang" },
    build(r, o) { return { k: line(r, "k", o.k), m: line(r, "m", o.m) }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.k.cs, { opacity: 0, y: 0.2 * fs, filter: B(6) }, { opacity: 1, y: 0, filter: B(0), duration: 0.4, ease: "power3.out", stagger: 0.03 }, at);
      tl.fromTo(x.m.cs, { opacity: 0, y: 0.35 * fs, filter: B(8) }, { opacity: 1, y: 0, filter: B(0), duration: 0.45, ease: "power3.out", stagger: 0.035 }, at + 0.15);
      tl.fromTo(x.m.cs, { backgroundPosition: "100% 0%" }, { backgroundPosition: "0% 0%", duration: 1.1, ease: "power1.inOut", stagger: 0.04 }, at + 0.45);
      return at + 0.8 + 0.035 * x.m.cs.length;
    },
  };

  P["tang-truong"] = {
    vi: "Tăng trưởng", use: "Giá, nhu cầu, hạ tầng đi lên: TĂNG 30%. Chữ dâng lên, đáy mờ dần.", from: "Energy Rising",
    sample: { k: "Giá thuê", m: "tăng 30%", c: "#ffb12e", c2: "#ff6a00" },
    build(r, o) { return { k: line(r, "k", o.k), m: line(r, "m grad", o.m) }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.k.cs, { opacity: 0, filter: B(6) }, { opacity: 1, filter: B(0), duration: 0.3, stagger: 0.04 }, at);
      tl.fromTo(x.m.cs, { opacity: 0, y: 0.55 * fs }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.045 }, at + 0.12);
      return at + 0.67 + 0.045 * x.m.cs.length;
    },
  };

  P["toc-do"] = {
    vi: "Tốc độ", use: "Thời gian đi lại, kẹt xe, tiến độ: 45 PHÚT, 3 TIẾNG. Có vệt bóng kéo phía sau.", from: "Speed Up",
    sample: { m: "45 phút", c: "#ff3b4f" },
    build(r, o) {
      const stack = el("span", "ln stk"); stack.style.padding = "0"; r.appendChild(stack);
      const ghosts = [1, 2, 3].map(() => { const gh = el("span", "ln m ghost"); chars(gh, o.m); stack.appendChild(gh); return gh; });
      const m = el("span", "ln m"); const cs = chars(m, o.m); stack.appendChild(m);
      return { ghosts, cs };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.cs, { opacity: 0, x: -0.7 * fs, skewX: -20, filter: B(10) }, { opacity: 1, x: 0, skewX: 0, filter: B(0), duration: 0.4, ease: "expo.out", stagger: 0.025 }, at);
      x.ghosts.forEach((gh, i) => {
        const k = i + 1;
        tl.fromTo(gh, { opacity: 0, x: -0.25 * fs * k }, { opacity: 0.35 / k, x: -0.14 * fs * k, duration: 0.2 }, at + 0.05);
        tl.to(gh, { opacity: 0, x: 0, duration: 0.5, ease: "power2.out" }, at + 0.35);
      });
      return at + 0.85;
    },
  };

  P["quay-vong"] = {
    vi: "Quay vòng", use: "Liệt kê nhiều thứ cùng một câu khung: “Phía Đông là… công nghệ / đại học / khởi nghiệp”.", from: "Dynamic Rotating · word slot",
    sample: { k: "Phía Đông là", words: ["công nghệ", "đại học", "khởi nghiệp"], c: "#ffb547" },
    build(r, o) {
      const k = line(r, "k", o.k);
      const slot = el("span", "ln slot"); r.appendChild(slot);
      const ws = (o.words || [o.m]).map((w) => { const e = el("span", "w", w); e.style.color = "var(--c)"; slot.appendChild(e); return e; });
      return { k, slot, ws };
    },
    in(tl, x, at, o) {
      const step = o.step || 0.65;
      tl.fromTo(x.k.cs, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: stg(x.k.cs.length, 0.025, 0.2) }, at);
      // Chữ mới dâng lên từ dưới (mờ → nét), chữ cũ bay lên tan đi. Không dùng khung cắt nên dấu tiếng Việt không bị xén.
      x.ws.forEach((w, i) => {
        const t = at + 0.15 + i * step;
        tl.fromTo(w, { yPercent: 55, opacity: 0, scale: 0.92, filter: B(10) }, { yPercent: 0, opacity: 1, scale: 1, filter: B(0), duration: 0.38, ease: "back.out(1.6)" }, t);
        if (i < x.ws.length - 1) tl.to(w, { yPercent: -45, opacity: 0, filter: B(8), duration: 0.22, ease: "power2.in" }, t + step - 0.2);
      });
      return at + 0.5 + (x.ws.length - 1) * step;
    },
  };

  P["khoi-noi"] = {
    vi: "Khối nổi", use: "Chữ chốt mặc định thay tieu-de-kep: chữ dẫn trong nhãn màu + cụm chính lớn hiện lần lượt từng ký tự, chữ khóa (hl) tô màu.", from: "Minimal Style + Pop Label",
    sample: { k: "Mặt tiền", m: "LỘ GIỚI 50 MÉT", hl: "50 MÉT", c: "#ffd23f" },
    build(r, o) {
      const pl = el("span", "ln k pill"), tx = el("span", "tx", o.k); pl.appendChild(tx); r.appendChild(pl);
      const m = el("span", "ln m"); const cs = chars(m, o.m); r.appendChild(m);
      if (o.hl) {
        const gs = graphemes(o.m), hg = graphemes(o.hl);
        for (let i = 0; i + hg.length <= gs.length; i++)
          if (gs.slice(i, i + hg.length).join("") === hg.join("")) { cs.slice(i, i + hg.length).forEach((c) => c.classList.add("hl")); break; }
      }
      return { k: { l: pl, cs: [] }, tx, m, cs };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.k.l, { opacity: 0, scaleX: 0.15, filter: B(6) }, { opacity: 1, scaleX: 1, filter: B(0), duration: 0.34, ease: "expo.out" }, at);
      tl.fromTo(x.tx, { opacity: 0, y: 0.08 * fs }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, at + 0.1);
      const st = Math.min(0.028, 0.3 / x.cs.length), t0 = at + 0.12; // chữ dài vẫn hiện xong trong ~0,8 s
      tl.fromTo(x.cs, { opacity: 0, yPercent: 60, rotationX: -75, transformPerspective: 600, transformOrigin: "50% 100%", filter: B(10) },
        { opacity: 1, yPercent: 0, rotationX: 0, transformPerspective: 600, transformOrigin: "50% 100%", filter: B(0), duration: 0.45, ease: "back.out(1.7)", stagger: st }, t0);
      const end = t0 + 0.45 + st * (x.cs.length - 1);
      tl.fromTo(x.m, { scale: 1 }, { scale: 1.045, duration: 0.11, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, end - 0.12);
      return end;
    },
  };

  P["dien-anh"] = {
    vi: "Điện ảnh", use: "Tiêu đề kiểu phim: chữ dẫn giãn rộng (to, không vạch) + cụm chính rất lớn co chữ (tracking-in) từ mờ sang nét, trôi chậm khi đứng. Hợp với chữ nằm sau đối tượng.", from: "Cinematic title",
    sample: { k: "Green City", m: "VIEW SÔNG", c: "#e9c27a" },
    build(r, o) {
      // không có vạch gạch 2 bên chữ dẫn (người dùng không thích)
      const k = el("span", "ln k"), tx = el("span", "tx");
      const ks = chars(tx, o.k || ""); k.append(tx); r.appendChild(k);
      const m = el("span", "ln m"); const cs = chars(m, o.m); r.appendChild(m);
      if (o.hl) {
        const gs = graphemes(o.m), hg = graphemes(o.hl);
        for (let i = 0; i + hg.length <= gs.length; i++)
          if (gs.slice(i, i + hg.length).join("") === hg.join("")) { cs.slice(i, i + hg.length).forEach((c) => c.classList.add("hl")); break; }
      }
      return { k: { l: k, cs: ks }, tx, ks, m, cs };
    },
    // Co chữ (tracking-in) bằng x của từng ký tự — không tween letterSpacing (reflow, giật theo pixel khi chụp từng khung)
    in(tl, x, at, o, fs) {
      const sp = (arr, k) => (i) => (i - (arr.length - 1) / 2) * k;
      tl.fromTo(x.cs, { x: sp(x.cs, 0.13 * fs), opacity: 0, filter: B(14) }, { x: 0, opacity: 1, filter: B(0), duration: 1.0, ease: "expo.out" }, at);
      tl.fromTo(x.m, { scale: 1.08 }, { scale: 1, duration: 1.0, ease: "expo.out" }, at);
      tl.fromTo(x.ks, { x: sp(x.ks, 0.07 * fs), opacity: 0, filter: B(5) }, { x: 0, opacity: 1, filter: B(0), duration: 0.8, ease: "power3.out" }, at + 0.15);
      // đứng yên thì trôi rất chậm (o.hold = số giây đứng), như máy quay điện ảnh
      if (o.hold > 1.2) tl.fromTo(x.m, { scale: 1 }, { scale: 1.035, duration: o.hold - 1.0, ease: "none", immediateRender: false }, at + 1.0);
      return at + 1.0;
    },
    // Thoát: chữ giãn ra (x) + mờ, dùng trước BDS.out
    spread(tl, x, at, fs) {
      tl.to(x.cs, { x: (i) => (i - (x.cs.length - 1) / 2) * 0.06 * fs, duration: 0.35, ease: "power2.in" }, at);
    },
  };

  P["tap-chi"] = {
    vi: "Tạp chí", use: "Tiêu đề kiểu tạp chí nhà đẹp: chữ dẫn sans nhỏ giãn rộng + cụm chính serif, chữ khóa (hl) nghiêng tô gradient. Hiện theo TỪ (dâng lên lần lượt), không theo ký tự.", from: "Editorial / luxury magazine",
    sample: { k: "Sunrise Villa", m: "BIỆT THỰ SONG LẬP", hl: "SONG LẬP", c: "#e2b864" },
    build(r, o) {
      const k = line(r, "k", o.k || "", false);
      const m = el("span", "ln m"); r.appendChild(m);
      const hl = o.hl ? o.hl.split(/\s+/) : [];
      const words = o.m.split(/\s+/).map((w, i, a) => {
        const e = el("span", "w" + (hl.includes(w) ? " hl" : ""), w); m.appendChild(e);
        if (i < a.length - 1) m.appendChild(document.createTextNode(" "));
        return e;
      });
      return { k, m, words };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.k.l, { opacity: 0, y: 0.12 * fs, filter: B(4) }, { opacity: 1, y: 0, filter: B(0), duration: 0.5, ease: "power3.out" }, at);
      x.words.forEach((w, i) => {
        const t = at + 0.12 + i * 0.11, it = w.classList.contains("hl");
        tl.fromTo(w, { opacity: 0, y: 0.45 * fs, skewX: it ? -12 : 0, filter: B(8) }, { opacity: 1, y: 0, skewX: 0, filter: B(0), duration: 0.6, ease: "power4.out" }, t);
      });
      return at + 0.72 + 0.11 * (x.words.length - 1);
    },
    // Thoát: từng từ rơi xuống, mờ dần theo thứ tự (dùng trước BDS.out)
    leave(tl, x, at, fs) {
      tl.to(x.words, { y: 0.25 * fs, opacity: 0, filter: B(6), duration: 0.3, ease: "power2.in", stagger: 0.05 }, at);
      tl.to(x.k.l, { opacity: 0, duration: 0.25 }, at);
    },
  };

  P["tung-chu"] = {
    vi: "Tung chữ", use: "Tiêu đề bật mạnh, có chữ dẫn: “Mua nhà / lần đầu”.", from: "Create Freely · Made Simple · Instant upgrades",
    sample: { k: "Mua nhà", m: "lần đầu", c: "#d88bff", c2: "#7c4dff" },
    build(r, o) {
      const k = line(r, "k", o.k);
      const wrap = el("span", "ln"); wrap.style.padding = "0"; r.appendChild(wrap);
      const gh = el("span", "ln m grad ghost"); chars(gh, o.m); wrap.appendChild(gh);
      const m = el("span", "ln m grad"); const cs = chars(m, o.m); wrap.appendChild(m);
      return { k, gh, cs };
    },
    in(tl, x, at, o, fs) {
      const order = x.k.cs.map((_, i) => i);
      tl.fromTo(x.k.cs, { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: (i) => 0.05 * ((i * 7) % order.length) }, at);
      tl.fromTo(x.cs, { opacity: 0, scale: 0.3, y: 0.3 * fs, filter: B(8) }, { opacity: 1, scale: 1, y: 0, filter: B(0), duration: 0.4, ease: "back.out(2)", stagger: 0.045 }, at + 0.1);
      const t = at + 0.1 + 0.045 * x.cs.length;
      tl.fromTo(x.gh, { opacity: 0.5, x: 0.1 * fs }, { opacity: 0, x: 0.3 * fs, duration: 0.5, ease: "power2.out" }, t);
      return t + 0.4;
    },
  };

  P["top-list"] = {
    vi: "Danh sách TOP", use: "Mở một danh sách: TOP / 5 KHU / đáng sống.", from: "The essential 10",
    snugSub: true,
    sample: { k: "TOP", m: "5 KHU", sub: "đáng sống", c: "#ff4f6d" },
    build(r, o) { return { k: line(r, "k", o.k), m: line(r, "m", o.m), sub: o.sub ? line(r, "sub", o.sub) : null }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m.cs, { opacity: 0, y: -0.6 * fs, filter: B(6) }, { opacity: 1, y: 0, filter: B(0), duration: 0.4, ease: "back.out(1.6)", stagger: stg(x.m.cs.length, 0.04) }, at);
      tl.fromTo(x.k.l, { opacity: 0, x: -0.2 * fs }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, at + 0.1);
      let end = at + 0.4 + stg(x.m.cs.length, 0.04) * x.m.cs.length;
      if (x.sub) { const s = stg(x.sub.cs.length, 0.04, 0.4); tl.fromTo(x.sub.cs, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: s }, end - 0.1); end += s * x.sub.cs.length; }
      return end;
    },
  };

  P["ky-niem"] = {
    vi: "Ký ức", use: "Mốc quá khứ, hồi tưởng: NĂM 2010, HỒI ĐÓ. Lệch màu như băng VHS rồi hội tụ.", from: "VHS · Colorful text",
    sample: { m: "Năm 2010" },
    build(r, o) {
      const wrap = el("span", "ln"); wrap.style.padding = "0"; r.appendChild(wrap);
      const gr = el("span", "ln m ghost gr", o.m), gc = el("span", "ln m ghost gc", o.m), m = el("span", "ln m", o.m);
      wrap.append(gr, gc, m);
      return { gr, gc, m };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m, { opacity: 0, scale: 1.1, filter: B(16) }, { opacity: 1, scale: 1, filter: B(0), duration: 0.6, ease: "power2.out" }, at);
      tl.fromTo(x.gr, { opacity: 0.8, x: -0.08 * fs }, { opacity: 0, x: 0, duration: 0.7, ease: "power2.out" }, at + 0.05);
      tl.fromTo(x.gc, { opacity: 0.8, x: 0.08 * fs }, { opacity: 0, x: 0, duration: 0.7, ease: "power2.out" }, at + 0.05);
      tl.fromTo([x.gr, x.gc], { opacity: 0 }, { opacity: 0.7, x: (i) => (i ? 0.04 : -0.04) * fs, duration: 0.04, yoyo: true, repeat: 3, immediateRender: false }, at + 1.0);
      return at + 0.75;
    },
  };

  P["chuong-moi"] = {
    vi: "Chương mới", use: "Sang phần mới của câu chuyện: “Phần 2 / pháp lý”. Chữ dẫn giải mã, chữ chính bật từng ký tự.", from: "Next Chapter · New Creative",
    sample: { k: "Phần 2", m: "pháp lý", c: "#57d36b" },
    build(r, o, seed) {
      const real = graphemes(o.k), n = real.length, N = 10;
      const frames = [];
      for (let f = 0; f <= N; f++) {
        const shown = Math.floor((f / N) * n);
        frames.push(real.map((c, i) => (i < shown || c === " " ? c : SCRAMBLE[Math.floor(rnd(i * 31 + f, seed) * SCRAMBLE.length)])).join(""));
      }
      const kl = el("span", "ln k"); r.appendChild(kl);
      return { kl, ks: steps(kl, frames), m: line(r, "m", o.m) };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.kl, { opacity: 0 }, { opacity: 1, duration: 0.15 }, at);
      playSteps(tl, x.ks, at, 0.6, "none");
      tl.fromTo(x.m.cs, { opacity: 0, scale: 1.4, filter: B(10) }, { opacity: 1, scale: 1, filter: B(0), duration: 0.35, ease: "power3.out", stagger: 0.05 }, at + 0.2);
      return at + 0.55 + 0.05 * x.m.cs.length;
    },
  };

  P["song"] = {
    vi: "Sóng", use: "Sông, biển, hồ, cảnh quan: VEN SÔNG, VIEW BIỂN. Rơi xuống rồi lượn sóng nhẹ.", from: "Wave",
    sample: { m: "ven sông", c: "#2ee6d6" },
    build(r, o) { return { m: line(r, "m", o.m) }; },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m.l, { opacity: 0, y: -0.8 * fs, filter: B(10) }, { opacity: 1, y: 0, filter: B(0), duration: 0.45, ease: "power3.out" }, at);
      tl.fromTo(x.m.cs, { y: 0 }, { y: -0.07 * fs, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: o.waves ?? 3, stagger: 0.07, immediateRender: false }, at + 0.5);
      return at + 0.5;
    },
  };

  P["gia-chot"] = {
    vi: "Giá chốt", use: "Số tiền: GIÁ CHỐT 2,5 tỷ, TIỀN THUÊ 12 triệu. Số chạy lên, bóng số lớn phía sau. Vàng = tiền.", from: "Money 100",
    sample: { k: "GIÁ CHỐT", value: 2.5, suffix: " tỷ", c: "#ffd23f" },
    build(r, o) {
      const k = line(r, "k", o.k || "");
      const dec = o.decimals ?? decOf(o.value);
      const txt = (v) => (o.prefix || "") + fmtVi(v, dec) + (o.suffix || "");
      const E = gsap.parseEase("power3.out"), N = 14, vals = [];
      for (let i = 0; i <= N; i++) vals.push(i === N ? o.value : Math.round(o.value * E(i / N) * 10 ** dec) / 10 ** dec);
      const m = el("span", "ln m"); r.appendChild(m);
      const num = el("span", "ch"); m.appendChild(num);
      const ns = steps(num, vals.map(txt));
      const bg = el("span", "bg", txt(o.value)); m.appendChild(bg);
      return { k, num, ns, bg };
    },
    in(tl, x, at, o, fs) {
      gsap.set(x.bg, { xPercent: -50, yPercent: -50 });
      tl.fromTo(x.k.cs, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.02 }, at);
      playSteps(tl, x.ns, at + 0.05, 0.9, "none");
      tl.fromTo(x.num, { scale: 1 }, { scale: 1.08, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, at + 0.95);
      tl.fromTo(x.bg, { opacity: 0, scale: 1.25 }, { opacity: 0.9, scale: 1, duration: 0.6, ease: "power2.out" }, at + 0.8);
      return at + 1.15;
    },
  };

  P["cao-trao"] = {
    vi: "Cao trào bậc thang", use: "Câu cao trào / khối thông tin / danh sách cộng dồn dựng dần 3–5 dòng, mỗi dòng vào đúng lúc nói tới, rồi tan cùng lúc. Mỗi dòng 2–5 chữ (luật 1). Vai: dem (đệm nhỏ) · nho (rất nhỏ) · muc (mục danh sách) · mong (to nét mảnh) · khoa (đậm hoa) · cam (viết tay) · vien (viết tay rỗng ruột) · so (số gradient lớn) · chot (gradient, một lần mỗi cụm). o.align trai|giua|phai; phần nào cũng nhận c riêng (danh sách nhiều màu).", from: "Kinetic typography BĐS (phong cách ME4REAL, docs/PHONG-CACH-ME4REAL.md C1–C2)",
    sample: { lines: [{ parts: [{ t: "mà còn", v: "dem" }, { t: "mở ra", v: "khoa" }] }, { t: "một cơ hội", v: "dem" }, { t: "sở hữu", v: "khoa" }, { t: "Ven Sông", v: "cam" }, { t: "hiếm có", v: "chot" }], c: "#ffd166", c2: "#e8761a" },
    // o.lines: [{ t, v, at? } | { parts: [{ t, v }], at? }] · at = giây tuyệt đối dòng đó vào (bám lời); thiếu thì cách nhau o.step (0,35 s)
    build(r, o) {
      const rows = (o.lines || []).map((L, i) => {
        const row = el("span", "ln row"); r.appendChild(row);
        const al = o.align ?? "trai";
        if (al === "trai") row.style.marginLeft = (i * (o.indent ?? 0.22)) + "em"; // bậc thang: mỗi dòng thụt thêm một nấc
        else if (al === "phai") row.style.marginRight = (i * (o.indent ?? 0)) + "em";
        const parts = (L.parts || [L]).map((p, j) => {
          const v = p.v || "dem", s = el("span", "pt v-" + v + (v === "chot" || v === "so" ? " grad" : ""));
          if (p.hoa === false) s.style.textTransform = "none"; // giữ chữ thường (Cao Cấp)
          if (p.c) { s.style.setProperty("--c", p.c); s.style.setProperty("--c2", p.c2 ?? p.c); if (v !== "chot" && v !== "so") s.style.color = p.c; }
          row.appendChild(s);
          if (j) s.style.marginLeft = ".22em";
          if (v === "chot" || v === "so") chars(s, p.t); else s.textContent = p.t;
          return { s, v };
        });
        return { row, parts, at: L.at };
      });
      r.classList.add("al-" + (o.align ?? "trai"));
      return { rows };
    },
    in(tl, x, at, o, fs) {
      const step = o.step ?? 0.35;
      let end = at;
      x.rows.forEach((R, i) => {
        const t = R.at ?? at + i * step;
        // immediateRender mặc định (true): dòng ẩn từ đầu, chỉ hiện đúng giờ nói tới. immediateRender: false làm mọi dòng
        // hiện sẵn trước giờ vào (trạng thái CSS) — cả cụm bung cùng lúc, mất "vào theo lời" (lỗi thấy ở snapshot 31/10/2026)
        tl.fromTo(R.row, { opacity: 0, x: -0.3 * fs, filter: B(6) }, { opacity: 1, x: 0, filter: B(0), duration: 0.32, ease: "power3.out" }, t);
        // dòng chốt: nhấp nháy 2 lần rồi đứng (flicker)
        if (R.parts.some((p) => p.v === "chot")) {
          tl.fromTo(R.row, { opacity: 1 }, { opacity: 0.35, duration: 0.05, immediateRender: false }, t + 0.34);
          tl.fromTo(R.row, { opacity: 0.35 }, { opacity: 1, duration: 0.05, immediateRender: false }, t + 0.42);
          tl.fromTo(R.row, { opacity: 1 }, { opacity: 0.5, duration: 0.04, immediateRender: false }, t + 0.5);
          tl.fromTo(R.row, { opacity: 0.5 }, { opacity: 1, duration: 0.05, immediateRender: false }, t + 0.56);
        }
        end = Math.max(end, t + 0.6);
      });
      return end;
    },
  };

  // Ôm sát chữ dẫn vào dòng dưới: đo viền mực thật (canvas) của từng ký tự, chỉ xét các ký tự dòng dưới nằm
  // ngay dưới chữ dẫn. Dưới chữ dẫn không có dấu (0 Đ…) thì chữ dẫn xuống sát đầu chữ; có dấu (hỏi của "tỷ")
  // thì dừng ngay trên dấu. Khe chừa = o.gap (px), mặc định max(12% cỡ chữ dẫn, 5% cỡ dòng dưới). Cần font đã nạp xong.
  const CTX = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
  function inkBoxes(line) {
    const out = [];
    const walk = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(".bg, .ghost, .strike") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n; (n = walk.nextNode()); ) {
      const cs = getComputedStyle(n.parentElement);
      CTX.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const hm = CTX.measureText("H"), asc = hm.fontBoundingBoxAscent, cap = hm.actualBoundingBoxAscent;
      let i = 0;
      for (const g of graphemes(n.data)) {
        const len = g.length, rg = document.createRange();
        rg.setStart(n, i); rg.setEnd(n, i + len); i += len;
        if (!g.trim()) continue;
        // đo đúng chữ đang hiển thị (text-transform: uppercase → chữ hoa có dấu cao hơn) và lấy bề ngang theo MỰC thật
        // (dấu của chữ nghiêng ngả ra ngoài khung ký tự)
        const gs = cs.textTransform === "uppercase" ? g.toUpperCase() : g;
        const b = rg.getBoundingClientRect(), m = CTX.measureText(gs), sx = b.width / (m.width || 1) || 1;
        out.push({ l: Math.min(b.left, b.left - m.actualBoundingBoxLeft * sx), r: Math.max(b.right, b.left + m.actualBoundingBoxRight * sx), base: b.top, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, fasc: asc, cap });
      }
    }
    return out;
  }
  function snug(h) {
    const k = h.parts.k?.l ?? h.parts.kl, m = k?.nextElementSibling; // kl: chữ dẫn giải mã của chuong-moi
    if (!CTX) return;
    // Đo khi chưa có transform của timeline (y, scale…): gỡ tạm, đo xong trả lại
    withFlat(h, () => {
      if (h.o.snug !== false) {
        if (k && m) { k.style.marginBottom = ""; measure(h, k, m); } // đo lại từ giãn cách gốc của CSS
        // dòng phụ dưới cụm chính (preset có snugSub): kéo sát lên nhưng không chạm dấu / nét móc của dòng trên
        const sub = (h.parts.sub ?? h.parts.s)?.l, up = sub?.previousElementSibling;
        if (h.p.snugSub && up) { up.style.marginBottom = ""; measure(h, up, sub); }
      }
      unhang(h);
    });
  }
  function withFlat(h, f) { // đo khi chưa có transform của timeline
    const els = [h.r, ...h.r.querySelectorAll("*")], saved = els.map((e) => e.style.transform);
    els.forEach((e) => (e.style.transform = "none"));
    try { f(); } finally { els.forEach((e, i) => (e.style.transform = saved[i])); }
  }
  function measure(h, k, m) {
    const sc = h.r.getBoundingClientRect().width / (h.r.offsetWidth || 1) || 1; // bù scale của khung cha (.stage…)
    const K = inkBoxes(k), M = inkBoxes(m);
    if (!K.length || !M.length) return;
    // base: đỉnh hộp chữ (client px) → đường chân chữ = đỉnh + fontAscent (đơn vị CSS) × scale
    // chữ dẫn dạng nhãn (.pill): đáy là mép nhãn, không phải đáy mực chữ
    const kBot = k.classList.contains("pill") ? k.getBoundingClientRect().bottom : Math.max(...K.map((c) => c.base + (c.fasc + c.desc) * sc));
    // xét cả dấu sát mép chữ dẫn (0,35 em dòng dưới mỗi bên): dấu nhô lên ngay cạnh chữ dẫn nhìn như dính vào chữ dẫn
    const pad = 0.35 * parseFloat(getComputedStyle(m).fontSize) * sc;
    const kL = Math.min(...K.map((c) => c.l)) - pad, kR = Math.max(...K.map((c) => c.r)) + pad;
    const under = M.filter((c) => c.r > kL && c.l < kR);
    const mTop0 = Math.min(...(under.length ? under : M).map((c) => c.base + (c.fasc - c.asc) * sc));
    // không cho chữ dẫn tụt lọt vào khe giữa các chữ của dòng dưới ("T4 · 05" + "VÀ" → đọc thành "T4 VÀ 05"):
    // chữ dẫn không thấp hơn mặt trên chữ hoa (bỏ dấu) của cả dòng dưới
    const mTop = Math.min(mTop0, ...M.map((c) => c.base + (c.fasc - Math.min(c.asc, c.cap)) * sc));
    const gap = (h.o.gap ?? Math.max(0.12 * parseFloat(getComputedStyle(k).fontSize), 0.05 * parseFloat(getComputedStyle(m).fontSize))) * sc;
    const delta = (kBot + gap - mTop) / sc; // dời dòng dưới lên/xuống bằng margin-bottom của chữ dẫn
    const kfs = parseFloat(getComputedStyle(k).fontSize); // ghi bằng em để vẫn đúng khi cỡ chữ đổi sau đó
    k.style.marginBottom = (parseFloat(getComputedStyle(k).marginBottom) + delta) / kfs + "em";
  }

  // Luật 21 (người dùng duyệt 30/10/2026): hai cụm chữ chỉ được chồng nhau khi cụm TRÊN không có dấu dưới (dấu nặng) hay
  // nét móc xuống (g, j, p, q, y…). Có thì đo nét thật, cụm dưới chạm thì đẩy xuống vừa đủ (cụm trong luồng: margin-top;
  // cụm xếp chồng trong lưới / vị trí tuyệt đối: top tương đối). Áp cho mọi preset, sau snug.
  const HANGS = /[gjpqyQ,;]|\u0323/;
  function unhang(h) {
    if (!CTX) return;
    const sc = h.r.getBoundingClientRect().width / (h.r.offsetWidth || 1) || 1;
    const units = [...new Set([...h.r.querySelectorAll(".ch, .ln, .lg-s, .lg-m, .lg-so, .sub")].map((e) => e.closest(".row, .lg-m, .lg-s, .lg-so, .sub, .ln")).filter(Boolean))]
      .filter((u, i, a) => !a.some((v) => v !== u && v.contains(u)) && u.textContent.trim());
    if (!units.some((u) => HANGS.test(u.textContent.normalize("NFD")))) return; // không cụm nào có dấu dưới / nét móc: không có gì để gỡ
    // chạy lại (font nạp xong, co cỡ) phải ra cùng kết quả: trả về giá trị gốc trước khi đo
    for (const u of units) {
      if (u.dataset.uh == null) u.dataset.uh = JSON.stringify([u.style.marginTop, u.style.top, u.style.position]);
      [u.style.marginTop, u.style.top, u.style.position] = JSON.parse(u.dataset.uh);
    }
    const moved = new Set(); // cụm đã dời: chỗ chạm mới do nó gây ra cũng phải gỡ (không còn là chồng có chủ đích)
    for (let pass = 0; pass < 2 * units.length; pass++) {
      const box = units.map((u) => { const K = inkBoxes(u); return { u, K, top: Math.min(...K.map((c) => c.base + (c.fasc - c.asc) * sc)), fs: parseFloat(getComputedStyle(u).fontSize) }; }).filter((b) => b.K.length).sort((a, b) => a.top - b.top);
      let changed = false;
      for (let i = 0; i < box.length && !changed; i++) for (let j = i + 1; j < box.length && !changed; j++) {
        const A = box[i], Bx = box[j];
        if (!HANGS.test(A.u.textContent.normalize("NFD")) && !moved.has(A.u)) continue;
        const gap = 0.05 * Bx.fs * sc;
        let need = 0;
        for (const a of A.K) for (const b of Bx.K) {
          if (b.r <= a.l || b.l >= a.r) continue;
          const d = a.base + (a.fasc + a.desc) * sc + gap - (b.base + (b.fasc - b.asc) * sc);
          if (d > need) need = d;
        }
        if (need > 0.5) {
          const u = Bx.u, cs = getComputedStyle(u), flow = cs.position === "static" && getComputedStyle(u.parentElement).display !== "grid";
          if (flow) u.style.marginTop = (parseFloat(cs.marginTop) || 0) + need / sc + "px";
          else { u.style.position = cs.position === "static" ? "relative" : cs.position; u.style.top = (parseFloat(cs.top) || 0) + need / sc + "px"; }
          moved.add(u); changed = true;
        }
      }
      if (!changed) break;
    }
  }

  let seq = 0;
  function make(key, target, o = {}) {
    const p = P[key]; if (!p) throw new Error("BDS: không có preset " + key);
    const host = typeof target === "string" ? document.querySelector(target) : target;
    const r = el("div", "bds bds-" + key);
    if (o.size) r.style.fontSize = o.size + "px";
    if (o.c) r.style.setProperty("--c", o.c);
    if (o.c2) r.style.setProperty("--c2", o.c2);
    if (o.display) r.style.setProperty("--display", o.display);
    if (o.sans) r.style.setProperty("--sans", o.sans);
    if (o.id) r.id = o.id;
    host.appendChild(r);
    const seed = o.seed ?? ++seq;
    const parts = p.build(r, o, seed);
    const h = { key, p, r, parts, o, seed };
    snug(h);
    // Weight của preset chỉ bắt đầu tải khi khối chữ được tạo, nên document.fonts.ready lúc trước chưa tính nó:
    // chưa nạp thì tải rồi đo lại (renderer HyperFrames chờ fonts.ready trước khi chụp).
    const fonts = [...new Set([r, ...r.querySelectorAll(".ln")].map((e) => { const cs = getComputedStyle(e); return `${cs.fontStyle} ${cs.fontWeight} 1em ${cs.fontFamily}`; }))];
    if (fonts.some((f) => !document.fonts.check(f))) Promise.all(fonts.map((f) => document.fonts.load(f))).then(() => snug(h));
    return h;
  }
  function enter(tl, h, at) {
    const fs = parseFloat(getComputedStyle(h.r).fontSize);
    const C = h.o.c || getComputedStyle(h.r).getPropertyValue("--c").trim() || "#ff3b4f";
    tl.fromTo(h.r, { opacity: 0, y: 0, filter: B(0) }, { opacity: 1, y: 0, filter: B(0), duration: 0.01 }, at);
    return h.p.in(tl, h.parts, at, h.o, fs, C, h.seed);
  }
  function exit(tl, h, at, d = 0.25) {
    const fs = parseFloat(getComputedStyle(h.r).fontSize);
    tl.to(h.r, { opacity: 0, y: -0.15 * fs, filter: B(6), duration: d, ease: "power2.in" }, at);
    return at + d;
  }
  // u: hàm phụ cho bộ preset bổ sung (me4real.js) dùng chung quy ước dựng sẵn từng bước, không onUpdate
  g.BDS = { presets: P, make, in: enter, out: exit, list: () => Object.keys(P), u: { el, B, chars, line, steps, playSteps, fmtVi, decOf, HANGS } };
})(typeof window !== "undefined" ? window : globalThis);
