# CLAUDE.md — 허종민 포트폴리오 공통 작업 지침

이 저장소에서 작업하는 사람과 AI가 공통으로 따르는 규칙이다. 구조·명령어 상세는 `README.md`, 관리자 CMS는 `docs/CMS_SETUP.md`, 배포는 `docs/DEPLOY.md`, 검증 이력은 `docs/VERIFICATION.md`를 본다.

## 1. 프로젝트 개요

- 시스템 / 테크니컬 게임 기획자 허종민의 포트폴리오 사이트
- 운영 주소: https://jongmini99.github.io · 관리자: https://jongmini99.github.io/admin/
- 저장소: `Jongmini99/Jongmini99.github.io` (`main` push → GitHub Actions → GitHub Pages 자동 배포, 1~3분)
- 스택: Next.js 16 (App Router, 정적 내보내기) · React 19 · TypeScript 6.0.3(고정, TS 7은 Next 호환 문제로 보류) · Tailwind CSS v4 · zod 4 · ESLint 9
- CMS: Decap CMS(`/admin`) + GitHub 백엔드. 로그인은 Cloudflare Worker OAuth 프록시 `https://decap-oauth.jongmini99.workers.dev` (`cms/oauth-worker`)

## 2. 작업 방식

1. **승인 후 진행**: 디자인·구조 변경은 페이지별 변경 계획(무엇을, 어디에, 왜)을 먼저 공유하고 승인받은 뒤 작업한다. 단순 수정(문구, 간격, 라벨 제거 등)은 바로 진행한다.
2. **사실을 지어내지 않는다**: 경력·수상·수치·연도·팀 구성 등 확인되지 않은 정보는 입력하지 않고 질문한다. 비워 둔 선택 필드는 UI에서 자동으로 숨겨지므로 빈칸이 정답이다.
3. **임시 이미지는 임시임을 드러낸다**: 실제 게임 자료로 오해될 그래픽을 만들지 않는다. 임시 이미지는 `public/uploads/images/temp/`에 "TEMP IMAGE"와 권장 크기를 표기해 두고, 실제 이미지로 모두 교체되면 폴더째 삭제한다.
4. **작업 전 최신화**: 관리자 CMS 저장도 `main`에 커밋되므로 작업 전 `git pull --rebase --autostash`.
5. **완료 = 배포 확인까지**: 검증 → 커밋·푸시 → Actions 성공 확인 → 운영 주소에서 결과 확인 후 보고한다. 실패·생략한 단계는 그대로 보고한다.
6. **보고는 한국어로**, 바뀐 점·검증 결과·사용자가 할 일을 구분해 짧게 정리한다.

## 3. 개발 환경 (Windows)

- Node.js는 관리자 권한 없이 휴대용으로 설치되어 있다. 셸마다 PATH를 추가한다.
  - Git Bash: `export PATH="/c/Users/shb19/AppData/Local/Programs/node-v26.13.1-win-x64:$PATH"`
  - PowerShell: `$env:Path = "C:\Users\shb19\AppData\Local\Programs\node-v26.13.1-win-x64;" + $env:Path`
- PowerShell은 실행 정책 때문에 `npx`가 막힌다 → **`npx.cmd`** / `npm.cmd`를 쓴다.
- Git Bash에서 `/`로 시작하는 값을 환경변수·인자로 넘기면 Windows 경로로 바뀐다 → 앞에 `MSYS_NO_PATHCONV=1`을 붙인다. (예: `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/portfolio npm run build`)
- 브라우저 점검은 Microsoft Edge 헤드리스를 쓴다 (`scripts/audit-ui.mjs`).

## 4. 명령어

```bash
npm run dev               # 개발 서버 (http://localhost:3000, 관리자 /admin/index.html)
npm run cms:local         # 로컬 CMS 백엔드 (GitHub 로그인 없이 로컬 파일 편집)
npm run check             # 콘텐츠 검증 + 타입 + 린트 + OAuth 테스트 + 빌드 (커밋 전 필수)
npx serve out -l 4173     # 빌드 결과 로컬 서빙
npm run audit             # 가로 넘침 + 접근성 점검 (서빙 중일 때). AUDIT_URL로 운영 주소 점검 가능
```

`npm run check` 출력의 `Error: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not configured`는 "비밀값 없으면 500" 테스트의 정상 로그다.

## 5. 코드 구조 규칙

| 위치 | 규칙 |
|---|---|
| `content/` | 콘텐츠의 유일한 저장소. CMS가 수정하는 JSON. 코드에 콘텐츠를 하드코딩하지 않는다 |
| `src/content/schema.ts` | zod 스키마가 타입의 단일 출처. 필드 추가 시 `cms/decap-config.ts`도 함께 수정 |
| `src/content/loaders.ts` | 페이지는 이 로더로만 데이터를 읽는다 (서버 전용, 클라이언트 컴포넌트에서 import 금지) |
| `cms/decap-config.ts` | CMS 필드 정의 → 빌드 시 `public/admin/config.yml` 자동 생성 (config.yml 직접 수정 금지) |
| `src/styles/tokens.css` | 색상·글꼴·반경·여백 토큰. **컴포넌트에서 `#hex` 직접 사용 금지**, 토큰 유틸리티만 사용 |
| `src/components/ui` | Button, Card, Badge, Typography, Media, Icon 등 기본 요소 — 새 스타일은 여기서 재사용 |
| `src/components/layout/nav.ts` | 메뉴 정의 (홈 섹션 앵커) |
| 정적 파일 경로 | CMS 업로드는 `/uploads/...`로 저장. `<img>`·다운로드 링크는 `withBasePath()`로 감싼다 |
| 외부 링크 | `target="_blank" rel="noopener noreferrer"` + 화면 낭독기용 "(새 창)" |
| 보안 | Markdown 원시 HTML 미렌더링 유지, `dangerouslySetInnerHTML` 사용 금지 |

## 6. 디자인 규칙 (2026-11-16 개편 기준)

- **톤**: 어두운 배경 유지. 배경 `#101116` / 교차 배경 `bg-alt #14161D` / 강조 섹션 `band #131A2A` / 카드 `#1B1D25`
- **포인트 색**: 블루 `#3B82F6`(accent). 어두운 배경 위 강조 글자는 `accent-text #60A5FA`, **흰 글자를 올리는 채운 버튼·배지는 `accent-solid #2563EB`** (accent 위 흰 글자는 대비 3.7:1로 기준 미달)
- **글꼴**: Pretendard + Inter, 패키지 번들 (외부 폰트 서버 호출 금지)
- **형태**: 카드 `rounded-card`(20px), 버튼은 알약형(`rounded-full`), 큰 제목은 좁은 자간(`tracking-[-0.04em]` 내외)
- **라벨**: 섹션 제목 위 **영문 소제목(eyebrow) 라벨을 쓰지 않는다**. 홈 히어로의 영문 직함 라벨도 쓰지 않는다
- **홈 구성 (한 페이지)**: 히어로(`#top`) → 대표 프로젝트 강조(`#featured`) → 프로젝트(`#projects`) → 소개(`#about`) → 이력 및 성과(`#career`) → 연락하기(`#contact`). 섹션 id를 바꾸면 `nav.ts`도 함께 바꾼다
- **상세 페이지**: `/projects/<slug>/`는 CMS 섹션 구조(목차·탭·2열 half 배치)를 유지한다. `/projects/`는 목록 페이지
- `/about/`, `/contact/`는 홈 섹션으로 이동시키는 페이지다 (noindex, sitemap 제외)
- **이미지 권장 크기**: 히어로 비주얼 1200×1200(투명 PNG/WebP) · 대표 키아트/상세 헤더 1920×1080 · 썸네일 1200×800 · 갤러리 1600×900 · 업로드 전 1600px·500KB 이하로 줄이기. 영상은 YouTube 링크

## 7. 접근성·품질 기준 (배포 전 필수)

- `npm run check` 통과
- `npm run audit`: 주요 페이지 × **390 / 768 / 1440px**에서 **가로 넘침 0, axe(WCAG 2.1 AA + best-practice) 위반 0**
- 키보드: 본문 바로가기, 메뉴, 목차, 미디어 탭(←/→), 라이트박스(Esc), 모바일 메뉴(Esc·포커스 복귀) 동작 유지
- `prefers-reduced-motion: reduce`에서 애니메이션·부드러운 스크롤 비활성 (움직임은 `motion-safe:` 사용)
- 장식 요소는 `aria-hidden`, 의미 있는 이미지는 대체 텍스트, 영역은 `aria-labelledby`로 제목 연결
- 디자인 변경 시 1440px·390px 전체 화면 캡처로 확인하고 공유한다 (`AUDIT_SHOTS=폴더 npm run audit`)

알려진 함정:
- 가로 스크롤 영역 안의 `sr-only`(absolute) 요소는 부모에 `relative`가 없으면 스크롤 영역 밖으로 빠져 페이지 가로 넘침을 만든다
- flex 안의 가로 스크롤 목록에는 `min-w-0`이 필요하다
- 흐린 빛 번짐(blur) 배경 위의 `text-fg-subtle`은 대비가 부족할 수 있다 → `text-fg-muted`
- Next.js 16 정적 내보내기의 프리페치 경로 문제를 `scripts/fix-export-prefetch.mjs`로 보정 중 (빌드에 포함, Next 수정 시 제거)

## 8. Git·배포

- 커밋 메시지: 한국어, 접두어 `feat:` 기능 / `fix:` 버그 / `style:` 디자인·표현 / `content:` 콘텐츠(CMS 커밋 형식과 동일) / `docs:` 문서 / `chore:` 기타. 본문에 변경 요점을 목록으로
- 커밋 전 `npm run check`, 디자인 변경 시 `npm run audit`
- 푸시 후 `gh run watch <id> --exit-status`로 배포 성공 확인, 운영 주소에서 결과 확인
- 콘텐츠 스키마 오류는 CI에서 빌드가 중단되어 배포되지 않는다 (사이트는 이전 상태 유지)

## 9. CMS·비밀값

- GitHub OAuth App의 Client Secret은 **Cloudflare Worker Secret에만** 저장한다. 저장소·사이트·채팅·이슈에 붙여넣지 않는다
  - 재등록: `cms/oauth-worker`에서 `npx.cmd wrangler secret put GITHUB_CLIENT_SECRET` (값은 입력창에 직접)
  - 유출 시 GitHub OAuth App에서 재발급 → 위 명령으로 재등록 → 기존 Secret 삭제
- Worker 주소는 비밀값이 아니며 저장소 Variables `DECAP_OAUTH_BASE_URL`에 있다
- Worker 설정: `ALLOWED_ORIGINS=https://jongmini99.github.io`, `ALLOWED_SCOPES=public_repo` (`wrangler.toml`). 사이트 주소가 바뀌면 함께 수정 후 `wrangler deploy`
- 관리자 저장 권한은 저장소 쓰기 권한자에게만 있다. `/admin`은 noindex·robots 차단

## 10. 남은 작업 (2026-11-16 기준)

- [ ] 실제 이미지로 교체: 히어로 비주얼, 대표 키아트, 썸네일, 갤러리 → 교체 후 `public/uploads/images/temp/` 삭제
- [ ] 플레이 영상(YouTube), 기획서 PDF, 이력서 파일, 연락처 이메일 입력
- [ ] (선택) CMS 섹션의 "영문 소제목" 입력 칸 제거 여부 결정
