/**
 * Next.js 16 정적 내보내기 보정 (빌드 후 실행)
 *
 * 문제: next build(output: export)는 세그먼트 프리페치 파일을
 *   out/about/__next.about/__PAGE__.txt  (폴더 구조)
 * 로 생성하지만, 클라이언트 라우터는
 *   /about/__next.about.__PAGE__.txt     (점으로 연결된 파일명)
 * 을 요청한다. 정적 호스팅(GitHub Pages)에서는 rewrite가 없으므로 404가 난다.
 * (페이지 이동은 동작하지만 프리페치 실패 + 콘솔 오류 발생)
 *
 * 해결: "__next.*" 폴더 안의 .txt 파일을 점 연결 파일명으로 복사한다.
 * Next.js가 이 문제를 수정하면 이 스크립트는 아무것도 하지 않거나 제거해도 된다.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] ?? "out");
let copied = 0;

function collectTxt(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return collectTxt(p);
    return e.name.endsWith(".txt") ? [p] : [];
  });
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    if (e.name === "_next") continue;
    if (e.name.startsWith("__next.")) {
      for (const file of collectTxt(full)) {
        const rel = path.relative(full, file).split(path.sep).join(".");
        const target = path.join(dir, `${e.name}.${rel}`);
        if (!fs.existsSync(target)) {
          fs.copyFileSync(file, target);
          copied++;
        }
      }
      continue;
    }
    walk(full);
  }
}

if (!fs.existsSync(OUT)) {
  console.error(`✖ ${OUT} 가 없습니다. next build 후 실행하세요.`);
  process.exit(1);
}
walk(OUT);
console.log(`✔ 프리페치 세그먼트 파일 보정: ${copied}개 생성`);
