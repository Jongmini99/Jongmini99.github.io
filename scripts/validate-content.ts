/**
 * content/ 폴더의 모든 JSON을 스키마로 검증한다.
 * 사용: npm run validate:content  (CI에서 빌드 전에 실행)
 */
import { validateAllContent, ContentError } from "../src/content/loaders";

try {
  const { projects, siteFiles } = validateAllContent();
  console.log(`✔ 콘텐츠 검증 통과 — 프로젝트 ${projects}개, 사이트 정보 파일 ${siteFiles}개`);
} catch (e) {
  if (e instanceof ContentError) {
    console.error(`✖ 콘텐츠 검증 실패\n${e.message}`);
    process.exit(1);
  }
  throw e;
}
