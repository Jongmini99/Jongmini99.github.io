/**
 * 관리자 페이지(/admin) 준비 — dev/build 전에 실행된다.
 * 1) Decap CMS 번들(node_modules/decap-cms/dist)을 public/admin/decap/ 으로 복사
 *    (외부 CDN 스크립트를 쓰지 않고, package-lock 으로 버전을 고정한다)
 * 2) cms/decap-config.ts → public/admin/config.yml 생성
 * 생성물은 .gitignore 대상이다.
 */
import fs from "node:fs";
import path from "node:path";
import { buildDecapConfig } from "../cms/decap-config";

const root = process.cwd();
const src = path.join(root, "node_modules", "decap-cms", "dist");
const dest = path.join(root, "public", "admin", "decap");

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

let count = 0;
for (const f of fs.readdirSync(src)) {
  // 소스맵과 'cms.js' 변형(중복 번들)은 제외
  const isDecapBundle = f === "decap-cms.js" || f.endsWith(".decap-cms.js") || f.endsWith(".wasm");
  if (!isDecapBundle) continue;
  fs.copyFileSync(path.join(src, f), path.join(dest, f));
  count++;
}

const config = buildDecapConfig();
fs.writeFileSync(
  path.join(root, "public", "admin", "config.yml"),
  `# 자동 생성 파일 — 수정은 cms/decap-config.ts 에서 하세요. (JSON은 유효한 YAML입니다)\n${JSON.stringify(config, null, 2)}\n`,
);

const oauth = (config.backend as { base_url?: string }).base_url;
console.log(`✔ Decap CMS 준비: 번들 ${count}개 복사, config.yml 생성 (repo: ${config.backend.repo}, OAuth: ${oauth ?? "미설정"})`);
