// Khung từng ký tự chữ chính của các khối chữ-sau-đối-tượng (window.__kt có `behind`), lúc khối đã đứng (at + 1,1 s).
//   node scripts/fx/behind-rects.cjs build/<v>/index.html <composition-id>   → JSON ra stdout (dùng bởi behind-check.py)
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.resolve("node_modules/playwright"));
const OPT = "/opt/pw-browsers/chromium"; // máy cloud; không có thì dùng Chromium của Playwright
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (fs.existsSync(OPT) ? OPT : undefined) });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.addInitScript(() => { window.__timelines = {}; });
  await p.goto("file://" + path.resolve(process.argv[2]));
  await p.waitForFunction(() => window.__kt && window.__kt.length, null, { timeout: 20000 });
  await p.waitForTimeout(800);
  const r = await p.evaluate((comp) => {
    const tl = window.__timelines[comp];
    return window.__kt.filter((c) => c.behind).map((c) => {
      tl.seek(Math.min(c.at + 1.1, c.out - 0.05), false);
      const chars = [...c.h.parts.m.querySelectorAll(".ch")].filter((e) => e.textContent.trim()).map((e) => {
        const q = e.getBoundingClientRect(), fs = parseFloat(getComputedStyle(e).fontSize);
        return [e.textContent, q.left, q.top + 0.24 * fs, q.right, q.bottom - 0.08 * fs]; // bỏ đệm trên/dưới của .ch (giữ dấu) → vùng chữ thật
      });
      return { behind: c.behind, at: c.at, out: c.out, m: c.o.m, chars };
    });
  }, process.argv[3]);
  console.log(JSON.stringify(r));
  await b.close();
})();
