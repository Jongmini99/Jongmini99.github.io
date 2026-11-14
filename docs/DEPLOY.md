# 배포 가이드 (GitHub Pages)

## 자동 배포

`main` 브랜치에 push(관리자 CMS 저장 포함)하면 `.github/workflows/deploy.yml`이 실행됩니다.

1. 콘텐츠 검증 (`npm run validate:content`) — 스키마 오류 시 중단
2. 타입 검사 / 린트
3. 빌드 (`npm run build`) — CMS 번들·설정 생성 → Next.js 정적 내보내기 → 프리페치 경로 보정
4. 산출물 확인 (index, 404, admin)
5. GitHub Pages 배포

Pull Request는 1~4단계만 수행합니다.

## 저장소 설정 (최초 1회, 완료됨)

- Settings → Pages → Source: **GitHub Actions**
- (CMS 사용 시) Settings → Secrets and variables → Actions → Variables: `DECAP_OAUTH_BASE_URL`

## 사이트 주소 형태

| 저장소 이름 | 주소 | basePath |
|---|---|---|
| `Jongmini99.github.io` (현재) | `https://jongmini99.github.io/` | 없음 |
| 그 외 (예: `portfolio`) | `https://jongmini99.github.io/portfolio/` | `/portfolio` (자동) |

basePath는 `actions/configure-pages`가 자동으로 넘겨 주므로 코드 수정이 필요 없습니다.
단, 프로젝트 사이트로 바꾸면 Worker의 `ALLOWED_ORIGINS`는 그대로(`https://jongmini99.github.io`) 두면 됩니다.

## 로컬 확인

```bash
npm run check                                   # 검증 + 타입 + 린트 + 빌드
NEXT_PUBLIC_BASE_PATH=/portfolio npm run build  # 프로젝트 사이트 경로 확인
```

## 라우팅

`trailingSlash: true`로 모든 페이지를 `경로/index.html`로 내보내므로 새로고침·직접 URL 접근이 동작합니다.
존재하지 않는 경로는 `404.html`이 표시됩니다.
