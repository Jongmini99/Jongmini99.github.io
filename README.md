# 허종민 포트폴리오

> 작업 규칙은 [CLAUDE.md](CLAUDE.md)를 따른다.

시스템 / 테크니컬 게임 기획자 포트폴리오. Next.js(App Router) 정적 내보내기 → GitHub Pages.

## 구조

| 경로 | 역할 |
|---|---|
| `content/` | **콘텐츠 (관리자 CMS가 수정)**. `projects/*.json`, `site/*.json` |
| `src/content/schema.ts` | 콘텐츠 스키마 (zod) — 타입의 단일 출처 |
| `src/content/loaders.ts` | 콘텐츠 로더 — 페이지는 이 함수로만 데이터를 읽는다 |
| `src/styles/tokens.css` | 디자인 토큰 (색상·타이포·여백·형태) |
| `src/components/ui` · `layout` · `sections` | UI 컴포넌트 (디자인 교체 대상) |
| `src/app/` | 라우트 |
| `public/uploads/` | CMS 업로드 이미지·문서·이력서 |
| `public/admin/` | 관리자 CMS 진입 페이지 (`/admin/`) |
| `cms/decap-config.ts` | 관리자 CMS 필드 구성 → 빌드 시 `config.yml` 생성 |
| `cms/oauth-worker/` | GitHub OAuth 프록시 (Cloudflare Worker) |
| `docs/` | `CMS_SETUP.md`(관리자 설정·사용법), `DEPLOY.md`(배포) |
| `.github/workflows/deploy.yml` | 검증 → 빌드 → Pages 배포 |

## 명령어

```bash
npm run dev               # 개발 서버
npm run validate:content  # 콘텐츠 스키마 검증
npm run typecheck
npm run lint
npm run build             # out/ 정적 내보내기
npm run check             # 위 검사 전체
npm run audit             # 가로 넘침 + 접근성 점검 (npx serve out -l 4173 실행 중일 때)
```

프로젝트 사이트(`/<repo>`)로 빌드를 확인하려면 `NEXT_PUBLIC_BASE_PATH=/<repo> npm run build`.

## Antigravity (Gemini)

Gemini 모델은 Orca에 연결된 Antigravity CLI(`agy`)로 사용한다. 프로젝트 지침은 `GEMINI.md` → `CLAUDE.md`.
실행·읽기 전용 검토 방법은 [Antigravity 사용 안내](docs/ANTIGRAVITY.md)를 참조한다.

## 디자인 구조

- **토큰** `src/styles/tokens.css`: 색상·폰트·반경·여백. 컴포넌트에서 `#hex` 직접 사용 금지 → `bg-surface`, `text-fg-muted`, `border-line`, `text-accent-text` 등 토큰 유틸리티만 사용.
- **UI 기본 요소** `src/components/ui`: Button, Card, Badge, Typography(Eyebrow/SectionHeading), Media(이미지/플레이스홀더), Markdown, Icon.
- **아이콘** `src/components/ui/Icon.tsx`: CMS에는 아이콘 키만 저장 (`crosshair`, `chart`, `biohazard`, `swords`, `unity`, `lua`, `csharp` …). 알 수 없는 키는 무시.
- **섹션** `src/components/sections`: `SectionRenderer`가 섹션 `type`별 블록을 선택. 섹션 `width: half` 두 개가 연속되면 데스크톱에서 2열.
- **폰트**: Pretendard(dynamic subset) + Inter를 npm 패키지에서 번들링 (외부 폰트 서버 호출 없음).
- **접근성**: 본문 바로가기, `aria-current` 메뉴/목차, WAI-ARIA 탭(←/→), `<dialog>` 라이트박스(Esc), `prefers-reduced-motion` 시 전환·부드러운 스크롤 비활성화.

## 빌드 후처리

`scripts/fix-export-prefetch.mjs` — Next.js 16 정적 내보내기에서 세그먼트 프리페치 파일 경로가
클라이언트 요청 경로와 다른 문제(정적 호스팅에서 404)를 보정한다. `npm run build`에 포함되어 있다.

## 콘텐츠 규칙

- 비워 둔 선택 필드는 UI에서 숨겨진다. 확인되지 않은 정보는 입력하지 않는다.
- 업로드 파일 경로는 `/uploads/...` 형식으로 저장되며 basePath는 `withBasePath()`가 자동 처리한다.
- 스키마 검증에 실패하면 CI 빌드가 중단되어 배포되지 않는다.
