// Lúc khối chữ đã đứng yên — dùng chung cho kt-check và text-ink (nạp vào trang: page.addInitScript(INIT)).
//   quay-vong: mỗi chữ một mốc (giữa nhịp step) · cao-trao: dòng cuối đã vào xong · khối khác: 1,4 s sau khi vào; không quá lúc thoát
function restTimes(c, dur) {
  if (c.p === "quay-vong") return c.o.words.map((w, j) => Math.min(c.at + 0.15 + j * c.o.step + Math.min(0.6, c.o.step - 0.3), c.out - 0.05));
  if (c.p === "cao-trao") return [Math.min(Math.max(c.at, ...c.o.lines.map((L, k) => L.at ?? c.at + k * (c.o.step ?? 0.35))) + 0.7, c.out - 0.05, dur - 0.05)];
  return [Math.min(c.at + 1.4, c.out - 0.05, dur - 0.05)];
}
module.exports = { restTimes, INIT: `window.__restTimes = ${restTimes.toString()};` };
