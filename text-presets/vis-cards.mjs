// vis-cards.mjs — thẻ chữ 2 tầng bám lời người nói (HyperFrames + GSAP).
// Học từ bộ QUY TẮC TEXT của AI MASTER (master-video): kicker chữ thường + headline IN HOA gradient,
// từng từ nảy lò xo đúng nhịp lời, kiểu phụ "blink" và "rise", cắt cứng khi thoát.
// Khác bản gốc: không phải phụ đề đủ chữ (TALKING-HEAD luật 1: không phụ đề chạy) mà là CHỮ CHỐT bám lời,
// font/màu lấy theo video, vị trí theo vùng chữ chốt của TALKING-HEAD.
//
// Dùng trong build.mjs của một video:
//   import { planCards, cardsHtml, cardsJs, CARDS_CSS, CARDS_RUNTIME } from "../../text-presets/vis-cards.mjs";
//   const plan = planCards(cards, transcript.chunks);           // tính mốc từng từ, báo cảnh báo
//   html += cardsHtml(plan, { top: 300, size: 104, theme });    // đặt trong .stage
//   js   += cardsJs(plan);                                      // thêm vào timeline `tl`
//   css  += CARDS_CSS; cuối <body>: CARDS_RUNTIME (đo bề rộng dòng cho gradient liền)
//
// cards: [{ chunk: 3, kicker: "mua nhà để", head: "ĐƯỢC Ở LẠI", anim: "pop"|"blink"|"rise" }]
//   chunk = chỉ số cụm trong transcript.json mà thẻ bám vào. kicker/head phải là các từ có thật trong cụm đó, đúng thứ tự
//   (khớp không phân biệt hoa thường, dấu câu). Từ chỉ để hiển thị, không có trong lời: thêm "~" ở đầu ("~TỶ").

const FPS = 30;
const F = 1 / FPS;

// ---------- lò xo (đo từ mẫu, đơn vị frame) ----------
function springYs(omega, zeta, amp, frames) {
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const ys = [];
  for (let t = 0; t <= frames; t++) {
    const e = Math.exp(-zeta * omega * t);
    ys.push(+(amp * e * (Math.cos(wd * t) + (zeta * omega / wd) * Math.sin(wd * t))).toFixed(2));
  }
  ys.push(0);
  return ys;
}
const POP = { omega: 0.555, zeta: 0.43, amp: 0.531, lead: 3, frames: 16 };
const RISE = { omega: 0.405, zeta: 0.32, amp: 0.87, lead: 4.25, frames: 36 };

// ---------- khớp từ với lời ----------
const norm = (w) => w.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}%]/gu, "");
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean);

function wordTimes(chunk) {
  // transcript chỉ có mốc cụm → chia đều theo số tiếng (tiếng Việt: 1 từ ≈ 1 âm tiết). Lùi 2 frame cho chắc không trễ lời.
  const ws = words(chunk.text), n = ws.length, d = chunk.end - chunk.start;
  return ws.map((w, i) => ({ w: norm(w), t: Math.max(0, chunk.start + (d * i) / n - 2 * F) }));
}

export function planCards(cards, chunks, opts = {}) {
  const warn = [];
  const plan = cards.map((c, ci) => {
    const ch = chunks.find((x) => x.i === c.chunk);
    if (!ch) { warn.push(`Thẻ ${ci}: không có cụm ${c.chunk}`); return null; }
    const wt = wordTimes(ch);
    let cur = 0;
    const match = (line) => words(line).map((raw) => {
      if (raw.startsWith("~")) return { text: raw.slice(1), t: null };
      const k = norm(raw);
      const j = wt.findIndex((x, idx) => idx >= cur && x.w === k);
      if (j < 0) { warn.push(`Thẻ ${ci}: "${raw}" không có trong cụm ${c.chunk}`); return { text: raw, t: null }; }
      cur = j + 1;
      return { text: raw, t: wt[j].t };
    });
    const K = c.kicker ? match(c.kicker) : [];
    const H = c.head ? match(c.head) : [];
    if (K.length === 1 || H.length === 1) warn.push(`Thẻ ${ci}: có dòng chỉ 1 từ — gộp lại (quy tắc tối thiểu 2 từ)`);
    // điền mốc cho từ "~" theo từ đứng trước / sau
    for (const L of [K, H]) L.forEach((w, i) => { if (w.t == null) w.t = (L[i - 1] && L[i - 1].t) ?? (L[i + 1] && L[i + 1].t) ?? ch.start; });
    // nhịp đều 3 frame, không từ nào hiện sau lời: dòng bắt đầu = min(t_i − 3i frame)
    const lineStart = (L) => Math.min(...L.map((w, i) => w.t - 3 * i * F));
    let kStart = K.length ? lineStart(K) : null;
    let hStart = H.length ? lineStart(H) : null;
    const anim = c.anim || "pop";
    if (anim !== "pop" && H.length) hStart = Math.min(...H.map((w) => w.t)); // blink/rise: cả dòng hiện ở từ đầu tiên
    if (K.length && H.length) {
      const kEnd = kStart + 3 * (K.length - 1) * F;
      if (hStart < kEnd + 3 * F) kStart -= kEnd + 3 * F - hStart; // kéo kicker sớm lên, không đẩy headline trễ đi
    }
    const lastWord = Math.max(...[...K, ...H].map((w) => w.t));
    return { ...c, id: c.id || `vc${ci}`, anim, K, H, kStart, hStart, start: Math.min(kStart ?? 1e9, hStart ?? 1e9), minEnd: lastWord + 9 * F };
  }).filter(Boolean);
  // thoát: cắt cứng, chừa 1 frame trống trước thẻ sau; hai thẻ không bao giờ cùng hiện
  plan.forEach((c, i) => {
    const next = plan[i + 1];
    const want = c.hold != null ? c.start + c.hold : Math.max(c.minEnd, c.start + (opts.minHold ?? 1.6));
    c.end = next ? Math.min(want, next.start - 2 * F) : want;
    if (c.end < c.minEnd) warn.push(`Thẻ ${i}: giữ chưa đủ 9 frame sau từ cuối vì thẻ sau tới sớm — kéo thẻ sau trễ hơn hoặc gộp thẻ`);
  });
  // phân bổ kiểu phụ
  plan.forEach((c, i) => {
    if (i === 0 && c.anim !== "pop") warn.push("Thẻ đầu tiên phải là pop");
    if (i > 0 && c.anim !== "pop" && plan[i - 1].anim === c.anim) warn.push(`Thẻ ${i - 1} và ${i} cùng kiểu ${c.anim} liền nhau`);
  });
  const alt = plan.filter((c) => c.anim !== "pop").length;
  if (plan.length >= 4 && (alt < plan.length / 5 || alt > plan.length / 2.5)) warn.push(`Kiểu phụ đang ${alt}/${plan.length} thẻ — nên khoảng 1/3–1/4`);
  if (warn.length && !opts.quiet) console.warn("[vis-cards] " + warn.join("\n[vis-cards] "));
  return { cards: plan, warn };
}

// ---------- HTML / CSS ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
export function cardsHtml(plan, o = {}) {
  const th = { kicker: "#F5F7FA", c1: "#3FB4FF", c2: "#96FAFC", glow: "#2896FF", ...(o.theme || {}) };
  const size = o.size || 96, top = o.top ?? 300, left = o.left ?? 540;
  const style = `--vc-size:${size}px;--vc-k:${th.kicker};--vc-c1:${th.c1};--vc-c2:${th.c2};--vc-glow:${th.glow};` +
    (th.display ? `--vc-display:${th.display.replace(/"/g, "'")};` : "") + (th.sans ? `--vc-sans:${th.sans.replace(/"/g, "'")};` : ""); // nằm trong style="…": đổi nháy kép
  return plan.cards.map((c) => {
    const k = c.K.length ? `<div class="vc-k">${c.K.map((w) => `<span class="w">${esc(w.text)}</span>`).join(" ")}</div>` : "";
    const h = c.H.length ? `<div class="vc-h"><span class="vc-hl">${c.H.map((w) => `<span class="w">${esc(w.text.toUpperCase())}</span>`).join(" ")}</span></div>` : "";
    return `<div class="vc-pos" style="left:${left}px;top:${(c.dy || 0) + top}px;${style}"><div id="${c.id}" class="vc">${k}${h}</div></div>`;
  }).join("\n");
}

export const CARDS_CSS = `
.vc-pos{position:absolute;transform:translateX(-50%);}
.vc{display:flex;font-synthesis-weight:none;flex-direction:column;align-items:center;opacity:0;white-space:nowrap;}
.vc .w{display:inline-block;}
.vc-k{font-family:var(--vc-sans,var(--vc-display,"Be Vietnam Pro",sans-serif));font-weight:500;font-size:calc(var(--vc-size)*.72);line-height:1.32;color:var(--vc-k);letter-spacing:-.02em;
  filter:drop-shadow(0 0 7px rgba(0,0,0,.85)) drop-shadow(0 0 10px rgba(255,255,255,.18));}
.vc-h{font-family:var(--vc-display,"Be Vietnam Pro",sans-serif);font-weight:800;font-size:var(--vc-size);line-height:1.32;letter-spacing:-.02em;margin-top:-.08em;
  filter:drop-shadow(0 0 7px rgba(0,0,0,.85)) drop-shadow(0 0 14px color-mix(in srgb,var(--vc-glow) 60%,transparent));}
.vc-h .w{background:linear-gradient(90deg,var(--vc-c1) 0%,var(--vc-c2) 45%,var(--vc-c1) 100%);background-size:var(--lw,100%) 100%;
  background-position:calc(-1*var(--x,0px)) 0;-webkit-background-clip:text;background-clip:text;color:transparent;
  padding:.3em .02em .16em;margin:-.3em -.02em -.16em;}
`;

// Chạy cuối <body>, trước khi dựng timeline:
// 1) đo vị trí từng từ để gradient chạy liền cả dòng;
// 2) ôm sát kicker vào headline (như preset BĐS): đo viền mực thật của từng ký tự, chỉ xét ký tự headline nằm ngay
//    dưới kicker; dưới không có dấu thì xuống sát đầu chữ, có dấu thì dừng ngay trên dấu, không để chân chữ (g, p, y)
//    của kicker chạm dấu headline. Khe = max(12% cỡ kicker, 5% cỡ headline). Đo sau khi font nạp, gỡ tạm transform.
export const CARDS_RUNTIME = `<script>(function(){
document.querySelectorAll('.vc-hl').forEach(function(l){var lw=l.offsetWidth;l.querySelectorAll('.w').forEach(function(w){w.style.setProperty('--lw',lw+'px');w.style.setProperty('--x',w.offsetLeft+'px');});});
var C=document.createElement('canvas').getContext('2d');
var SEG=window.Intl&&Intl.Segmenter?new Intl.Segmenter('vi',{granularity:'grapheme'}):null;
function gr(s){return SEG?Array.from(SEG.segment(s),function(x){return x.segment;}):Array.from(s);}
function ink(line){var out=[];line.querySelectorAll('.w').forEach(function(w){var n=w.firstChild;if(!n||n.nodeType!==3)return;var cs=getComputedStyle(w);
  C.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;var fa=C.measureText('H').fontBoundingBoxAscent,i=0;
  gr(n.data).forEach(function(g){var r=document.createRange();r.setStart(n,i);r.setEnd(n,i+g.length);i+=g.length;if(!g.trim())return;
    var b=r.getBoundingClientRect(),m=C.measureText(g);out.push({l:b.left,r:b.right,top:b.top+fa-m.actualBoundingBoxAscent,bot:b.top+fa+m.actualBoundingBoxDescent});});});return out;}
function snug(){document.querySelectorAll('.vc').forEach(function(vc){var k=vc.querySelector('.vc-k'),h=vc.querySelector('.vc-h');if(!k||!h)return;
  var els=[vc.parentNode,vc].concat(Array.from(vc.querySelectorAll('*'))),sv=els.map(function(e){return e.style.transform;});
  els.forEach(function(e){e.style.transform=e===vc.parentNode?'translateX(-50%)':'none';});h.style.marginTop='';
  try{var K=ink(k),H=ink(h);if(!K.length||!H.length)return;
    var kb=Math.max.apply(null,K.map(function(c){return c.bot;})),kl=Math.min.apply(null,K.map(function(c){return c.l;})),kr=Math.max.apply(null,K.map(function(c){return c.r;}));
    var U=H.filter(function(c){return c.r>kl&&c.l<kr;});if(!U.length)U=H;
    var ht=Math.min.apply(null,U.map(function(c){return c.top;}));
    var kfs=parseFloat(getComputedStyle(k).fontSize),hfs=parseFloat(getComputedStyle(h).fontSize),gap=Math.max(.12*kfs,.05*hfs);
    h.style.marginTop=(parseFloat(getComputedStyle(h).marginTop)+kb+gap-ht)/hfs+'em';
  }finally{els.forEach(function(e,i){e.style.transform=sv[i];});}});}
var fams=[];document.querySelectorAll('.vc-k .w,.vc-h .w').forEach(function(w){var cs=getComputedStyle(w),f=cs.fontStyle+' '+cs.fontWeight+' 1em '+cs.fontFamily;if(fams.indexOf(f)<0)fams.push(f);});
snug();if(document.fonts)Promise.all(fams.map(function(f){return document.fonts.load(f);})).then(snug);
})();</script>`;

// ---------- GSAP ----------
const r3 = (x) => +x.toFixed(3);
function springTween(sel, t0, sp, sign, sizeExpr) {
  const ys = springYs(sp.omega, sp.zeta, sp.amp, sp.frames);
  const kf = ys.map((y) => `{y:${sign}*${y}*${sizeExpr},duration:${r3(F)},ease:"none"}`).join(",");
  return `tl.fromTo(${sel},{y:${sign}*${ys[0]}*${sizeExpr}},{keyframes:[${kf}],immediateRender:false},${r3(t0 - sp.lead * F)});\n` +
    `tl.fromTo(${sel},{opacity:0},{opacity:1,duration:${r3(2 * F)},ease:"none"},${r3(t0 - F)});\n`;
}
export function cardsJs(plan) {
  let js = "";
  for (const c of plan.cards) {
    const root = `#${c.id}`, S = `parseFloat(getComputedStyle(document.querySelector("${root}")).getPropertyValue("--vc-size")||getComputedStyle(document.querySelector("${root}").parentNode).getPropertyValue("--vc-size"))`;
    js += `{const S_${c.id}=${S};\n`;
    js += `tl.fromTo("${root}",{opacity:0},{opacity:1,duration:0.001},${r3(c.start - 4 * F)});\n`;
    js += `gsap.set("${root} .w",{opacity:0});\n`;
    c.K.forEach((w, i) => { js += springTween(`"${root} .vc-k .w:nth-child(${i + 1})"`, c.kStart + 3 * i * F, POP, -1, `S_${c.id}`); });
    if (c.H.length) {
      if (c.anim === "pop") c.H.forEach((w, i) => { js += springTween(`"${root} .vc-h .w:nth-child(${i + 1})"`, c.hStart + 3 * i * F, POP, 1, `S_${c.id}`); });
      else if (c.anim === "rise") js += springTween(`"${root} .vc-h .w"`, c.hStart, RISE, 1, `S_${c.id}`);
      else if (c.anim === "blink") {
        const t = c.hStart, s = `"${root} .vc-h .w"`;
        js += `tl.fromTo(${s},{opacity:0},{opacity:1,duration:0.001,immediateRender:false},${r3(t)});\n`;
        js += `tl.fromTo(${s},{opacity:1},{opacity:0,duration:0.001,immediateRender:false},${r3(t + F)});\n`;
        js += `tl.fromTo(${s},{opacity:0},{opacity:1,duration:0.001,immediateRender:false},${r3(t + 2 * F)});\n`;
      }
    }
    js += `tl.to("${root}",{opacity:0,duration:0.001},${r3(c.end)});}\n`; // cắt cứng
  }
  return js;
}
