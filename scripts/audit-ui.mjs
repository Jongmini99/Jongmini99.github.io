/**
 * UI 점검: 가로 넘침 + 접근성(axe-core, WCAG 2.1 AA + best-practice)
 *
 * 사용법 (빌드 후):
 *   npx serve out -l 4173          # 다른 터미널
 *   npm run audit                   # 기본: http://localhost:4173, 주요 페이지 × 390/768/1440px
 *   AUDIT_URL=https://jongmini99.github.io npm run audit
 *   AUDIT_PAGES=/,/projects/ AUDIT_WIDTHS=390 npm run audit
 *   (Git Bash에서 /로 시작하는 값을 넘길 때는 MSYS_NO_PATHCONV=1 필요)
 *
 * Microsoft Edge(Windows) 또는 CHROME_PATH 로 지정한 Chromium 계열 브라우저를 헤드리스로 실행한다.
 * 문제가 있으면 종료 코드 1. AUDIT_SHOTS=폴더 를 주면 페이지별 전체 화면 캡처를 저장한다.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BROWSER = process.env.CHROME_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = (process.env.AUDIT_URL ?? "http://localhost:4173").replace(/\/+$/, "");
const PAGES = (process.env.AUDIT_PAGES ?? "/,/projects/,/projects/zombie-project-x/,/about/").split(",");
const WIDTHS = (process.env.AUDIT_WIDTHS ?? "390,768,1440").split(",").map(Number);
const SHOTS = process.env.AUDIT_SHOTS;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9300 + Math.floor(Math.random() * 600);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "audit-"));
const browser = spawn(BROWSER, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], {
  stdio: "ignore",
});

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  await sleep(250);
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
}
if (!wsUrl) throw new Error(`브라우저를 실행할 수 없습니다: ${BROWSER}`);

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const id = ++seq;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

// 가로 넘침: 문서 폭 > 화면 폭이면, 처음으로 화면 밖으로 나간 요소를 보고한다.
const OVERFLOW = `(() => {
  const d = document.documentElement, cw = d.clientWidth;
  const culprits = [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > cw + 1 && el.parentElement.getBoundingClientRect().right <= cw + 1)
    .slice(0, 5)
    .map((el) => el.tagName + '.' + String(el.className).slice(0, 80));
  return { scrollWidth: d.scrollWidth, clientWidth: cw, culprits };
})()`;
const AXE = `axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] } })
  .then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') })))`;

let failures = 0;
for (const page of PAGES) {
  for (const width of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: BASE + page });
    await sleep(3500);
    const landed = await evaluate("location.pathname + location.hash");
    const o = await evaluate(OVERFLOW);
    await evaluate(`${axeSource};0`);
    const violations = await evaluate(AXE);
    const overflow = o.scrollWidth > o.clientWidth;
    const ok = !overflow && violations.length === 0;
    if (!ok) failures++;
    console.log(`${ok ? "✔" : "✖"} ${page} @${width}px → ${landed}  넘침:${overflow ? "있음" : "없음"}  axe:${violations.length}`);
    if (overflow) console.log(`    넘침 원인 후보: ${o.culprits.join(" | ")}`);
    for (const v of violations) console.log(`    [${v.impact}] ${v.id} ×${v.nodes} — ${v.sample}`);

    if (SHOTS) {
      fs.mkdirSync(SHOTS, { recursive: true });
      // 화면 높이(900)는 유지한 채 페이지 전체를 캡처한다.
      // 화면 높이를 페이지 길이로 늘리면 100svh 기준 섹션(홈 앞 3화면)이 함께 늘어나 실제와 다르게 찍힌다.
      const h = Math.min(await evaluate("document.documentElement.scrollHeight"), 12000);
      await evaluate("Promise.all([...document.images].map((i) => (i.loading = 'eager', i.decode().catch(() => {}))))");
      await sleep(800);
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: h, scale: 1 },
      });
      const name = `${page.replace(/\W+/g, "_") || "home"}-${width}.png`;
      fs.writeFileSync(path.join(SHOTS, name), Buffer.from(shot.result.data, "base64"));
    }
  }
}

ws.close();
browser.kill();
console.log(failures === 0 ? "\n✔ UI 점검 통과" : `\n✖ ${failures}건 문제`);
process.exit(failures === 0 ? 0 : 1);
