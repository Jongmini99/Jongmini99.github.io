# Phase 5 검증 보고 (2026-11-14)

대상: https://jongmini99.github.io (실제 배포본)

## 결과 요약

| 항목 | 방법 | 결과 |
|---|---|---|
| 타입 검사 | `tsc --noEmit` (CI 포함) | 통과 |
| 린트 | ESLint (next core-web-vitals, typescript) | 통과 |
| 콘텐츠 검증 | zod 스키마, 잘못된 값 주입 테스트 | 통과 / 오류 시 빌드 중단 확인 |
| 빌드·배포 | GitHub Actions (검증 → 빌드 → Pages) | 통과 |
| 라우팅 | 직접 URL, 새로고침, 슬래시 없는 주소(301), 없는 주소(404) | 통과 |
| basePath | `/portfolio` 프로젝트 사이트 빌드 | 통과 |
| 반응형 | 390 / 768 / 1440px, 가로 넘침 검사 | 통과 (넘침 0) |
| 접근성 | axe-core WCAG 2.1 AA + best-practice, 5개 페이지 × 2개 폭 | 위반 0건 |
| 키보드 | 본문 바로가기, 메뉴, 목차, 미디어 탭(←/→), 라이트박스(Esc), 모바일 메뉴 Esc·포커스 복귀 | 통과 |
| 모션 최소화 | `prefers-reduced-motion: reduce` 환경 | 전환·부드러운 스크롤 비활성화 |
| 성능 | 홈 471KB / 상세 532KB 전송, LCP 0.1~0.7초 (측정 환경 기준) | 양호 |

## 관리자 저장 기능

| 시나리오 | 결과 |
|---|---|
| 로컬 백엔드(decap-server): 텍스트 수정·프로젝트 저장·이미지 업로드 | 파일 반영, 데이터 보존, 스키마 통과 |
| **GitHub 백엔드(실제 사이트 /admin)**: 비공개 프로젝트 생성 | 커밋 생성 → Actions 성공 → 비공개라 페이지 미생성(404) |
| GitHub 백엔드: 프로젝트 삭제 | 커밋 생성 → Actions 성공 → 원상 복구 |
| 신규 공개 프로젝트 → 상세 페이지 자동 생성, displayOrder 정렬 | 빌드에서 생성 확인 |

> GitHub 백엔드 검증은 GitHub CLI 토큰을 브라우저에 임시 주입해 수행했다.
> 일반 로그인(OAuth)은 Cloudflare Worker 배포 후 사용 가능하다 — `docs/CMS_SETUP.md`.

## 보안 점검

| 항목 | 결과 |
|---|---|
| 저장소 이력·배포 산출물의 비밀정보 | 없음 |
| OAuth Client Secret 위치 | Cloudflare Worker Secret 전용 (저장소·사이트에 없음) |
| OAuth 프록시 | state(CSRF) 검증, 허용 출처로만 토큰 전달, 허용 scope 제한, CSP nonce, no-store — 테스트 5종 CI 실행 |
| 토큰 권한 | `public_repo` 최소 권한 |
| XSS | Markdown 원시 HTML 미렌더링, `dangerouslySetInnerHTML` 미사용 |
| 외부 링크 | 전부 `rel="noopener noreferrer"` |
| 운영 의존성 취약점 (`npm audit --omit=dev`) | 0건 |
| 개발 의존성 취약점 | decap-cms / decap-server 하위 의존성 (관리자 본인 브라우저·로컬 도구 한정, 위험 낮음). 최신 버전 사용 중이며 Dependabot으로 추적 |
| 저장소 보안 설정 | Dependabot 알림·보안 업데이트, 비밀정보 스캔·푸시 차단 활성화 |
| 관리자 페이지 노출 | `noindex`, robots `Disallow: /admin/`. 화면은 공개되지만 저장은 저장소 쓰기 권한자만 가능 |

## 알려진 제약

- GitHub Pages는 응답 헤더(CSP 등)를 설정할 수 없다.
- 저장 후 반영까지 1~3분(빌드 시간).
- Next.js 16 정적 내보내기의 프리페치 경로 불일치를 `scripts/fix-export-prefetch.mjs`로 보정 중 (Next.js 수정 시 제거 가능).

## Phase 6 디자인 점검 (2026-11-15)

다크 디자인은 Phase 2에서 함께 구현했다. 실제 배포본을 1440px·390px 전체 화면으로 캡처해 시안과 대조하고 아래를 보정했다.

- 역할 목록(구분선 목록)이 줄바꿈될 때 다음 줄 맨 앞에 구분선이 남던 문제 수정
- 홈 "Featured Project" 제목과 "전체 프로젝트" 링크 세로 정렬 수정

보정 후 반응형·접근성(axe 위반 0)·키보드 점검을 다시 실행해 모두 통과했다.
