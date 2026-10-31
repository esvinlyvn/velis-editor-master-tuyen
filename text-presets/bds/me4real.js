/* me4real.js — 14 preset chữ dựng lại từ 6 video của editor BĐS ME4REAL (docs/PHONG-CACH-ME4REAL.md, mục C).
   Nạp SAU bds-presets.js; đăng ký vào window.BDS.presets nên dùng chung BDS.make / BDS.in / BDS.out, lib/ và kt-check.
   Quy ước như bộ BĐS: không đặt transform trong CSS (GSAP lo), fromTo ghi rõ đích, không onUpdate (số đếm dựng sẵn từng bước),
   không quầng sáng sau chữ (luật 18): chất kim loại bằng gradient trong lòng chữ; khối nổi 3D là các lớp đặc không nhòe.
   Thời gian đo từng khung 0,15 s trên bản gốc; ghi ở dòng "đo:" của mỗi preset. */
(function (g) {
  const { el, B, chars, line, steps, playSteps, fmtVi, decOf } = g.BDS.u;
  const P = g.BDS.presets;
  const ME = "ME4REAL (docs/PHONG-CACH-ME4REAL.md)";
  // hiện chữ viết tay: chỉ mở theo chiều ngang (trái → phải), chừa trên dưới để dấu và nét móc không bị cắt
  const WIPE = ["inset(-0.6em 100% -0.6em -0.3em)", "inset(-0.6em -0.3em -0.6em -0.3em)"];
  // khối nổi: lớp sau là chữ đặc màu `sau` đẩy lệch từng px (không nhòe), lớp trước là mặt chữ
  function extrude(parent, text, cls, depth, color) {
    const w = el("span", "ex " + (cls || "")); parent.appendChild(w);
    const back = el("span", "ex-b", text), face = el("span", "ex-f", text);
    back.style.color = color;
    const n = Math.max(2, Math.round(depth));
    back.style.textShadow = Array.from({ length: n }, (_, i) => `${(i + 1) * 0.6}px ${(i + 1)}px 0 ${color}`).join(", ");
    w.appendChild(back); w.appendChild(face);
    return { w, back, face };
  }
  // nét vẽ tay tỏa ra (tia pháo hoa / nhấn) quanh khối; vẽ bằng scaleX rồi tắt
  function sparks(parent, n, seed) {
    const box = el("span", "sparks"); parent.appendChild(box);
    return Array.from({ length: n }, (_, i) => {
      const s = el("span", "spk"); box.appendChild(s);
      const a = (i / n) * 360 + ((seed * 37) % 20), d = 0.55 + ((i * 7 + seed) % 5) * 0.06;
      s.dataset.a = a; s.dataset.d = d;
      return s;
    });
  }
  const countVals = (to, from, dec, N = 16, ease = "power3.out") => {
    const E = gsap.parseEase(ease), out = [];
    for (let i = 0; i <= N; i++) out.push(i === N ? to : Math.round((from + (to - from) * E(i / N)) * 10 ** dec) / 10 ** dec);
    return out;
  };

  P["kim-loai"] = {
    vi: "Kim loại", use: "Từ khóa đắt (PHÁO HOA, DU LỊCH, PHÁT TRIỂN, BOOKING): chữ hoa chất kim loại vàng/bạc + chữ viết tay đè góc dưới phải, có thể kèm tia vẽ tay. Một lần mỗi đoạn, hợp hook.", from: ME,
    // đo: chữ chính nhòe→nét 0,15 s · chữ viết tay vào sau 0,15 s, trượt từ phải · tia bung 0,1→0,5 s rồi tắt
    sample: { m: "PHÁO HOA", s: "Quốc Tế", tone: "vang", tia: true },
    build(r, o, seed) {
      r.classList.add("tone-" + (o.tone || "vang"));
      const m = line(r, "m", o.m);
      const s = o.s ? line(r, "s", o.s, false) : null;
      const tia = o.tia ? sparks(r, 8, seed) : [];
      return { m, s, tia };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m.l, { opacity: 0, scale: 1.08, filter: B(10) }, { opacity: 1, scale: 1, filter: B(0), duration: 0.18, ease: "power2.out" }, at);
      if (x.s) tl.fromTo(x.s.l, { opacity: 0, x: 0.35 * fs }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, at + 0.15);
      x.tia.forEach((t, i) => {
        const a = +t.dataset.a, d = +t.dataset.d;
        gsap.set(t, { rotation: a, transformOrigin: "0% 50%" });
        tl.fromTo(t, { scaleX: 0, opacity: 1, x: 0 }, { scaleX: 1, x: d * fs * 0.25, duration: 0.18, ease: "power2.out" }, at + 0.1 + i * 0.015);
        tl.fromTo(t, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, at + 0.42 + i * 0.015);
      });
      return at + 0.5;
    },
  };

  P["so-khong-lo"] = {
    vi: "Số khổng lồ", use: "Con số là cả câu (200 triệu, 10 năm trước, 800 m², 35 triệu, 25%): số rất lớn chất vàng, nhãn nhỏ phía trên, đơn vị trượt ra từ sau số, chữ viết tay bên dưới. Hợp chữ sau người (behind).", from: ME,
    // đo: nhãn vào trước 0,15 s · đếm 42→800 trong 0,75 s (chậm dần) hoặc đập vào 0,12 s (dem:false) · đơn vị trượt +0,15 s · viết tay khi số dừng
    snugSub: true,
    sample: { k: "TRIỆU ĐỒNG", value: 200, u: "", s: "hợp đồng thuê", dem: true },
    build(r, o) {
      r.classList.add("tone-" + (o.tone || "vang"));
      const k = o.k ? line(r, "k", o.k) : null;
      const m = el("span", "ln m"); r.appendChild(m);
      const dec = o.decimals ?? decOf(o.value);
      const txt = (v) => (o.prefix || "") + fmtVi(v, dec);
      const num = el("span", "num"); m.appendChild(num);
      const ns = o.dem === false ? [num.appendChild(el("span", "st", txt(o.value)))] : steps(num, countVals(o.value, o.from ?? 0, dec).map(txt));
      const u = o.u ? el("span", "u" + (o.uNho ? " nho" : ""), o.u) : null; if (u) m.appendChild(u); // uNho: đơn vị chữ nhỏ thay vì to ngang số
      const s = o.s ? line(r, "s", o.s, false) : null;
      return { k, m, num, ns, u, s };
    },
    in(tl, x, at, o, fs) {
      if (x.k) tl.fromTo(x.k.l, { opacity: 0, y: 0.1 * fs }, { opacity: 1, y: 0, duration: 0.2 }, at - 0.15 < 0 ? at : at - 0.15);
      if (o.dem === false) tl.fromTo(x.num, { opacity: 0, scale: 1.3, filter: B(8) }, { opacity: 1, scale: 1, filter: B(0), duration: 0.12, ease: "power3.in" }, at);
      else {
        tl.fromTo(x.num, { filter: B(8) }, { filter: B(0), duration: 0.3, ease: "power2.out" }, at);
        playSteps(tl, x.ns, at, o.dur ?? 0.75, "none");
      }
      const land = at + (o.dem === false ? 0.12 : o.dur ?? 0.75);
      if (x.u) tl.fromTo(x.u, { opacity: 0, x: -0.4 * fs }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, at + 0.15);
      if (x.s) tl.fromTo(x.s.l, { opacity: 0, clipPath: WIPE[0] }, { opacity: 1, clipPath: WIPE[1], duration: 0.45, ease: "power1.inOut" }, land);
      return land + 0.45;
    },
  };

  P["so-dem"] = {
    vi: "Số đếm + đơn vị", use: "Thông số theo dòng (10 tầng / 50 phòng, Móng chờ 16 tầng, 31 tầng nổi): số đếm lên tô màu, đơn vị trắng hiện sau; mỗi dòng một màu, vào theo lời.", from: ME,
    // đo: số đếm 8→10 trong 0,3 s · đơn vị +0,15 s · dòng 2 vào sau ~0,45–0,9 s (theo lời), màu khác dòng 1
    sample: { rows: [{ n: 10, u: "tầng" }, { n: 50, u: "phòng" }] },
    build(r, o) {
      const rows = (o.rows || []).map((R, i) => {
        const row = el("span", "ln row"); r.appendChild(row);
        if (R.k) row.appendChild(el("span", "rk", R.k));
        const num = el("span", "num grad"); row.appendChild(num);
        const cs = i % 2 ? [o.c3 ?? "#7ef0c8", o.c4 ?? "#20a676"] : [o.c ?? "#ffd166", o.c2 ?? "#e8a01a"];
        num.style.setProperty("--c", R.c ?? cs[0]); num.style.setProperty("--c2", R.c2 ?? cs[1]);
        const dec = decOf(R.n);
        const ns = steps(num, countVals(R.n, R.from ?? Math.max(0, Math.round(R.n * 0.8)), dec, 8).map((v) => fmtVi(v, dec)));
        const u = el("span", "u", R.u || ""); row.appendChild(u);
        return { row, num, ns, u, at: R.at };
      });
      return { rows };
    },
    in(tl, x, at, o, fs) {
      let end = at;
      x.rows.forEach((R, i) => {
        const t = R.at ?? at + i * (o.step ?? 0.6);
        tl.fromTo(R.row, { opacity: 0, filter: B(6) }, { opacity: 1, filter: B(0), duration: 0.2 }, t);
        playSteps(tl, R.ns, t, 0.3, "none");
        tl.fromTo(R.u, { opacity: 0, x: -0.15 * fs }, { opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }, t + 0.15);
        end = t + 0.45;
      });
      return end;
    },
  };

  P["cap-dong"] = {
    vi: "Cặp dòng hoa + viết tay", use: "Hai ba tiêu chí song song (VỊ TRÍ Ấn Tượng / QUY MÔ Lý Tưởng): chữ hoa vàng + chữ viết tay trắng mỗi dòng; dòng sau vào theo lời.", from: ME,
    // đo: chữ hoa nhòe→nét 0,3 s · viết tay trượt từ phải +0,3 s · dòng 2 sau 0,6 s
    sample: { rows: [{ hoa: "VỊ TRÍ", viet: "Ấn Tượng" }, { hoa: "QUY MÔ", viet: "Lý Tưởng" }] },
    build(r, o) {
      return { rows: (o.rows || []).map((R) => {
        const row = el("span", "ln row"); r.appendChild(row);
        const h = el("span", "hoa grad"); row.appendChild(h); chars(h, R.hoa);
        const v = el("span", "viet", R.viet); row.appendChild(v);
        return { row, h, v, at: R.at };
      }) };
    },
    in(tl, x, at, o, fs) {
      let end = at;
      x.rows.forEach((R, i) => {
        const t = R.at ?? at + i * (o.step ?? 0.6);
        tl.fromTo(R.h, { opacity: 0, filter: B(8) }, { opacity: 1, filter: B(0), duration: 0.3, ease: "power2.out" }, t);
        tl.fromTo(R.v, { opacity: 0, x: 0.3 * fs }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t + 0.3);
        end = t + 0.6;
      });
      return end;
    },
  };

  P["phoi-canh"] = {
    vi: "Chữ phối cảnh", use: "Chữ nằm nghiêng theo mặt phẳng trong cảnh (mặt bàn, sàn, giường) và trôi theo máy: VỐN BAN ĐẦU chỉ từ 1,3 TỶ, thanh toán sớm 12%. Vai dòng: thuong · nho · so (vàng, to). noi:true thì thành khối nổi.", from: ME,
    // đo: hiện cùng cú cắt, phóng 0,92→1 trong 0,2 s · xoay ~−16° · trôi theo máy suốt lúc đứng (bám chuyển động)
    sample: { lines: [{ t: "VỐN BAN ĐẦU" }, { parts: [{ t: "chỉ từ", v: "nho" }, { t: "1,3 TỶ", v: "so" }] }], goc: -16 },
    build(r, o) {
      const pc = el("span", "pc"); r.appendChild(pc);
      (o.lines || []).forEach((L) => {
        const row = el("span", "ln row"); pc.appendChild(row);
        (L.parts || [L]).forEach((p, j) => {
          const v = p.v || "thuong", s = el("span", "pt v-" + v); row.appendChild(s);
          if (j) s.style.marginLeft = ".2em";
          if (o.noi) extrude(s, p.t, "", 0.06 * (o.size || 120), o.sau || "#2a1d08"); else s.textContent = p.t;
        });
      });
      return { pc };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.pc, { opacity: 0, scale: 0.92, rotation: o.goc ?? -16, skewX: o.xien ?? -6, filter: B(6) },
        { opacity: 1, scale: 1, rotation: o.goc ?? -16, skewX: o.xien ?? -6, filter: B(0), duration: 0.2, ease: "power2.out" }, at);
      const [dx, dy] = o.troi ?? [-0.25, 0.08]; // trôi theo máy (tỷ lệ cỡ chữ) suốt lúc đứng
      tl.fromTo(x.pc, { x: 0, y: 0 }, { x: dx * fs, y: dy * fs, duration: Math.max(0.5, (o.hold ?? 2) - 0.2), ease: "none", immediateRender: false }, at + 0.2);
      return at + 0.2;
    },
  };

  P["noi-khoi"] = {
    vi: "Nổi khối 3D", use: "Tên địa danh / cam kết cần chắc nịch (HỘI AN, SỞ HỮU LÂU DÀI, MỞ BÁN): chữ hoa có độ dày 3D đặc (không nhòe), mặt chữ sáng; tone vang | bang (xanh băng) | trang. goc ≠ 0 để nằm theo mặt phẳng.", from: ME,
    // đo: bật 0,85→1,04→1 trong 0,3 s cùng cú cắt · độ dày ~6% cỡ chữ
    sample: { m: "HỘI AN", tone: "bang" },
    build(r, o) {
      const tone = o.tone || "vang";
      r.classList.add("tone-" + tone);
      const sau = o.sau ?? { vang: "#6b4206", bang: "#1d6b86", trang: "#4a5560" }[tone];
      const m = el("span", "ln m"); r.appendChild(m);
      const x = extrude(m, o.m, "", (o.size || 160) * 0.06, sau);
      const s = o.s ? line(r, "s", o.s, false) : null;
      return { m, x, s };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m, { opacity: 0, scale: 0.85, rotation: o.goc ?? 0, skewX: o.xien ?? 0, filter: B(6) }, { opacity: 1, scale: 1.04, rotation: o.goc ?? 0, skewX: o.xien ?? 0, filter: B(0), duration: 0.18, ease: "power2.out" }, at);
      tl.fromTo(x.m, { scale: 1.04 }, { scale: 1, duration: 0.12, ease: "power1.inOut", immediateRender: false }, at + 0.18);
      if (x.s) tl.fromTo(x.s.l, { opacity: 0, y: 0.15 * fs }, { opacity: 1, y: 0, duration: 0.25 }, at + 0.2);
      return at + 0.45;
    },
  };

  P["so-chen"] = {
    vi: "Số chen giữa câu", use: "Ưu đãi một con số (Miễn phí quản lí 1 năm, thanh toán 3%): số vàng to gấp ~2,5 lần kẹp giữa chữ nhỏ trước và sau; có thể nghiêng theo mặt phẳng (goc).", from: ME,
    // đo: chữ nhỏ vào trước · số rơi từ trên 0,25 s nhòe→nét · chữ sau +0,15 s
    sample: { truoc: "Miễn phí|quản lí", so: "1", sau: "năm" },
    build(r, o) {
      const pc = el("span", "pc row"); r.appendChild(pc);
      const a = el("span", "nho truoc"); pc.appendChild(a);
      (o.truoc || "").split("|").forEach((t) => a.appendChild(el("span", "d", t)));
      const so = el("span", "so grad"); pc.appendChild(so); chars(so, o.so);
      const b = el("span", "nho sau", o.sau || ""); pc.appendChild(b);
      return { pc, a, so, b };
    },
    in(tl, x, at, o, fs) {
      if (o.goc) gsap.set(x.pc, { rotation: o.goc, skewX: o.xien ?? 0 });
      tl.fromTo(x.a, { opacity: 0, x: -0.2 * fs }, { opacity: 1, x: 0, duration: 0.22 }, at);
      tl.fromTo(x.so, { opacity: 0, y: -0.35 * fs, filter: B(8) }, { opacity: 1, y: 0, filter: B(0), duration: 0.25, ease: "power3.out" }, at + 0.1);
      tl.fromTo(x.b, { opacity: 0, x: 0.2 * fs }, { opacity: 1, x: 0, duration: 0.22 }, at + 0.25);
      return at + 0.5;
    },
  };

  P["pill-xep"] = {
    vi: "Pill xếp chồng", use: "Thông số ngắn dán cạnh công trình (31 TẦNG NỔI / 3 TẦNG HẦM): pill cam viền vàng, chữ trắng hoa, xếp dọc căn trái, dòng sau trượt lên từ dưới theo lời. Đặt top thấp (dải dưới).", from: ME,
    // đo: pill trượt lên + mở mặt nạ 0,25 s · pill sau cách ~1 s (theo lời)
    sample: { items: [{ t: "31 TẦNG NỔI" }, { t: "3 TẦNG HẦM" }] },
    build(r, o) {
      return { items: (o.items || []).map((it) => { const p = el("span", "ln pill", it.t); r.appendChild(p); return { p, at: it.at }; }) };
    },
    in(tl, x, at, o, fs) {
      let end = at;
      x.items.forEach((it, i) => {
        const t = it.at ?? at + i * (o.step ?? 0.5);
        tl.fromTo(it.p, { opacity: 0, y: 0.6 * fs, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.25, ease: "power3.out" }, t);
        end = t + 0.25;
      });
      return end;
    },
  };

  P["nhan-ban-do"] = {
    vi: "Nhãn bản đồ", use: "Tên dự án / điểm trên bản đồ, ảnh vệ tinh (TÊN DỰ ÁN): thẻ vàng chữ đen nghiêng nhẹ + ghim đỏ nhún bên dưới. Đặt đúng chỗ bằng top; MAP.md lo phần bản đồ.", from: ME,
    // đo: thẻ bật 0,6→1 (back.out) 0,25 s · ghim rơi + nhún 0,35 s · cả cụm nghiêng −6°
    sample: { m: "TÊN DỰ ÁN" },
    build(r, o) {
      const tag = el("span", "ln tag", o.m); r.appendChild(tag);
      const pin = el("span", "pin"); r.appendChild(pin);
      pin.innerHTML = '<svg viewBox="0 0 24 34" width="100%" height="100%"><path d="M12 33C12 33 2 19 2 12a10 10 0 0 1 20 0c0 7-10 21-10 21z" fill="#e2262f"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>';
      return { tag, pin };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.tag, { opacity: 0, scale: 0.6, rotation: o.goc ?? -6 }, { opacity: 1, scale: 1, rotation: o.goc ?? -6, duration: 0.25, ease: "back.out(2)" }, at);
      tl.fromTo(x.pin, { opacity: 0, y: -0.8 * fs }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.in" }, at + 0.1);
      tl.fromTo(x.pin, { y: 0 }, { y: -0.12 * fs, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, at + 0.35);
      return at + 0.55;
    },
  };

  P["chu-gian"] = {
    vi: "Chữ giãn", use: "Tên dự án / loại sản phẩm / hạng mục (SKY VILLA, PENTHOUSE, LÀM VIỆC · HỌC TẬP · GIẢI TRÍ): chữ hoa co khoảng cách từ rất rộng về chuẩn trong lúc nhòe→nét, rồi một vệt sáng quét ngang. Màu theo c (trắng mặc định).", from: ME,
    // đo: khoảng cách chữ 0,6em→0,06em + nhòe 10→0 trong 0,3 s · vệt sáng quét 0,45 s sau 0,5 s
    sample: { m: "SKY VILLA" },
    build(r, o) {
      if (o.mau) r.classList.add("mau");
      const m = line(r, "m", o.m, false);
      const sw = el("span", "sweep"); m.l.appendChild(sw);
      const s = o.s ? line(r, "s", o.s, false) : null;
      return { m, sw, s };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m.l, { opacity: 0, letterSpacing: "0.6em", filter: B(10) }, { opacity: 1, letterSpacing: (o.gian ?? -0.01) + "em", filter: B(0), duration: 0.32, ease: "power3.out" }, at);
      tl.fromTo(x.sw, { opacity: 0, xPercent: -120 }, { opacity: 1, xPercent: 120, duration: 0.45, ease: "power1.inOut" }, at + 0.5);
      tl.fromTo(x.sw, { opacity: 1 }, { opacity: 0, duration: 0.1, immediateRender: false }, at + 0.95);
      if (x.s) tl.fromTo(x.s.l, { opacity: 0, y: 0.1 * fs }, { opacity: 1, y: 0, duration: 0.25 }, at + 0.25);
      return at + 0.5;
    },
  };

  P["logo-ghep"] = {
    vi: "Logo ghép", use: "Tên dự án dạng logo (Lumi Riverside 5 · Second Home): chữ tròn đậm sáng + chữ viết tay vắt ngang nửa dưới + số vàng + dòng phụ màu. Dùng 2–3 lần mỗi video, giữ lâu qua nhiều cảnh.", from: ME,
    // đo: chữ chính nhòe→nét 0,25 s · viết tay mở dần trái→phải 0,5 s · số bật +0,6 s · dòng phụ +0,8 s
    sample: { m: "Lumi", s: "Riverside", so: "5", sub: "Second Home" },
    build(r, o) {
      const box = el("span", "lg"); r.appendChild(box);
      const m = el("span", "lg-m grad"); box.appendChild(m); chars(m, o.m);
      const s = el("span", "lg-s", o.s || ""); box.appendChild(s);
      const so = o.so ? el("span", "lg-so", o.so) : null; if (so) box.appendChild(so);
      const sub = o.sub ? line(r, "sub", o.sub, false) : null;
      return { m, s, so, sub };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m, { opacity: 0, scale: 1.1, filter: B(10) }, { opacity: 1, scale: 1, filter: B(0), duration: 0.25, ease: "power2.out" }, at);
      tl.fromTo(x.s, { opacity: 1, clipPath: WIPE[0] }, { opacity: 1, clipPath: WIPE[1], duration: 0.5, ease: "power1.inOut" }, at + 0.15); // chỉ mở theo chiều ngang: dấu, nét móc trên dưới không bị cắt
      if (x.so) tl.fromTo(x.so, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, at + 0.6);
      if (x.sub) tl.fromTo(x.sub.l, { opacity: 0, y: 0.12 * fs }, { opacity: 1, y: 0, duration: 0.25 }, at + 0.8);
      return at + 1.05;
    },
  };

  P["poster-serif"] = {
    vi: "Poster serif", use: "Đoạn tiện ích sang trọng trên nền sáng (TIỆN ÍCH xa hoa · CHO CHỦ NHÂN TINH HOA): serif hoa mảnh màu mực, chữ viết tay vắt qua, dòng chú giãn rộng. Màu mực theo c (mặc định nâu vàng); chỉ đặt trên nền sáng.", from: ME,
    // đo: serif dâng 0,4 s · viết tay mở dần 0,5 s · dòng chú giãn +0,5 s
    sample: { m: "TIỆN ÍCH", s: "xa hoa", sub: "CHO CHỦ NHÂN TINH HOA" },
    build(r, o) {
      if (o.c2) r.style.setProperty("--ink2", o.c2); // màu chữ viết tay (gốc: xanh navy)
      const m = line(r, "m", o.m, false);
      const s = o.s ? line(r, "s", o.s, false) : null;
      const sub = o.sub ? line(r, "sub", o.sub, false) : null;
      return { m, s, sub };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.m.l, { opacity: 0, y: 0.25 * fs }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, at);
      if (x.s) tl.fromTo(x.s.l, { opacity: 1, clipPath: WIPE[0] }, { opacity: 1, clipPath: WIPE[1], duration: 0.5, ease: "power1.inOut" }, at + 0.25);
      if (x.sub) tl.fromTo(x.sub.l, { opacity: 0, letterSpacing: "0.5em" }, { opacity: 1, letterSpacing: "0.22em", duration: 0.5, ease: "power2.out" }, at + 0.5);
      return at + 1;
    },
  };

  P["so-thu-tu"] = {
    vi: "Số thứ tự", use: "Liệt kê lợi thế đánh số (1 mặt bằng THƯƠNG MẠI / 2 luồng Tiếp Cận): số trắng rất lớn bên trái, bên phải là dòng nhỏ + dòng chính (vàng kim loại hoặc viết tay). Mỗi mục vào theo lời.", from: ME,
    // đo: số nhòe→nét 0,15 s · dòng nhỏ +0,14 s · dòng chính trượt +0,3 s (0,3 s)
    sample: { rows: [{ n: "1", nho: "một mặt bằng", lon: "THƯƠNG MẠI" }, { n: "2", nho: "luồng", lon: "Tiếp Cận", viet: true }] },
    build(r, o) {
      return { rows: (o.rows || []).map((R) => {
        const row = el("span", "ln row"); r.appendChild(row);
        const n = el("span", "n", R.n); row.appendChild(n);
        const col = el("span", "col"); row.appendChild(col);
        const a = el("span", "nho", R.nho || ""); col.appendChild(a);
        const b = el("span", R.viet ? "lon viet" : "lon grad"); col.appendChild(b);
        if (R.viet) b.textContent = R.lon; else chars(b, R.lon);
        return { row, n, a, b, at: R.at };
      }) };
    },
    in(tl, x, at, o, fs) {
      let end = at;
      x.rows.forEach((R, i) => {
        const t = R.at ?? at + i * (o.step ?? 0.8);
        tl.fromTo(R.n, { opacity: 0, filter: B(10), scale: 1.15 }, { opacity: 1, filter: B(0), scale: 1, duration: 0.15, ease: "power2.out" }, t);
        tl.fromTo(R.a, { opacity: 0 }, { opacity: 1, duration: 0.15 }, t + 0.14);
        tl.fromTo(R.b, { opacity: 0, x: -0.25 * fs, filter: B(6) }, { opacity: 1, x: 0, filter: B(0), duration: 0.3, ease: "power3.out" }, t + 0.3);
        end = t + 0.6;
      });
      return end;
    },
  };

  P["khung-sdt"] = {
    vi: "Khung số điện thoại", use: "CTA cuối video: số điện thoại vàng đậm trong khung viền vàng bo góc, khung kẻ ra từ giữa rồi từng nhóm số hiện. Đặt 1/3 dưới (top ≈ 1150).", from: ME,
    // đo: khung mở ngang từ giữa 0,3 s · các nhóm số hiện lần lượt 0,08 s/nhóm
    sample: { m: "0900.000.000" },
    build(r, o) {
      const box = el("span", "ln box"); r.appendChild(box);
      const gs = (o.m || "").split(/([.\s])/).filter(Boolean).map((t) => { const s = el("span", "g", t); box.appendChild(s); return s; });
      return { box, gs };
    },
    in(tl, x, at, o, fs) {
      tl.fromTo(x.box, { opacity: 0, clipPath: "inset(0 50% 0 50%)" }, { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 0.3, ease: "power2.out" }, at);
      tl.fromTo(x.gs, { opacity: 0, y: 0.15 * fs }, { opacity: 1, y: 0, duration: 0.15, stagger: 0.08 }, at + 0.2);
      return at + 0.2 + 0.08 * x.gs.length + 0.15;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
