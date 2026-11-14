# 관리자 CMS 설정 가이드

관리자 페이지: `https://jongmini99.github.io/admin/`

## 구조

```
/admin (Decap CMS, 정적 페이지)
  │ 로그인 → 팝업
  ▼
Cloudflare Worker (cms/oauth-worker)  ← GitHub Client Secret은 여기에만 저장
  │ GitHub OAuth (권한: public_repo)
  ▼
GitHub 저장소에 커밋 (content/*.json, public/uploads/*)
  │
  ▼
GitHub Actions → 검증 → 빌드 → GitHub Pages 배포 (1~3분)
```

- **누가 수정할 수 있나**: 이 저장소에 쓰기 권한이 있는 GitHub 계정만 저장(커밋)할 수 있습니다.
- **비용**: Cloudflare Workers 무료 플랜(일 10만 요청), GitHub Pages·Actions 무료(공개 저장소).
- **비밀값 위치**: GitHub Client Secret은 Cloudflare Worker Secret에만 있습니다. 저장소·사이트 코드에는 없습니다.

## 최초 1회 설정 (약 15분)

### 1. Cloudflare Worker 배포

1. https://dash.cloudflare.com/sign-up 에서 무료 가입 (이메일 인증 필요)
2. 터미널에서:
   ```bash
   cd cms/oauth-worker
   npx wrangler login        # 브라우저에서 Cloudflare 로그인·허용
   npx wrangler deploy       # 처음 배포 시 workers.dev 하위 도메인 등록을 물을 수 있음
   ```
3. 출력된 주소를 기록합니다. 예: `https://decap-oauth.<내-하위도메인>.workers.dev`

### 2. GitHub OAuth App 생성

1. https://github.com/settings/applications/new
2. 입력값
   | 항목 | 값 |
   |---|---|
   | Application name | 허종민 포트폴리오 CMS |
   | Homepage URL | `https://jongmini99.github.io` |
   | Authorization callback URL | `https://decap-oauth.<내-하위도메인>.workers.dev/callback` |
3. **Register application** → **Client ID** 복사 → **Generate a new client secret** → Secret 복사 (한 번만 보임)

### 3. Worker에 비밀값 등록

```bash
cd cms/oauth-worker
npx wrangler secret put GITHUB_CLIENT_ID       # 붙여넣기
npx wrangler secret put GITHUB_CLIENT_SECRET   # 붙여넣기
```

> Secret은 채팅·이슈·커밋 등 다른 곳에 붙여넣지 마세요.

### 4. 사이트에 Worker 주소 연결

Worker 주소는 비밀값이 아니므로 저장소 **Variables**에 저장합니다.

```bash
gh variable set DECAP_OAUTH_BASE_URL --repo Jongmini99/Jongmini99.github.io --body "https://decap-oauth.<내-하위도메인>.workers.dev"
gh workflow run "Deploy to GitHub Pages" --repo Jongmini99/Jongmini99.github.io
```

(또는 GitHub 저장소 → Settings → Secrets and variables → Actions → Variables 탭)

### 5. 로그인 확인

`https://jongmini99.github.io/admin/` → **GitHub로 로그인** → 권한 승인 → 컬렉션 화면이 보이면 완료.

## 사용법

| 작업 | 위치 |
|---|---|
| 프로젝트 추가 | 프로젝트 → **＋ 프로젝트** (기본 섹션 템플릿이 채워짐, '공개'를 켜야 사이트에 노출) |
| 프로젝트 순서 | 각 프로젝트의 **노출 순서** 숫자 (작을수록 먼저) |
| 대표 프로젝트 | **대표 프로젝트 (메인 노출)** 켜기 |
| 섹션 추가·삭제·순서·숨김 | 프로젝트 → **상세 페이지 섹션** (드래그로 순서, '페이지에 표시' 끄기로 숨김) |
| 이미지 | 대표/헤더 이미지, 이미지 갤러리 (드래그로 순서) |
| 영상 | 플레이 영상 → YouTube 주소 |
| 기획 문서 | 기획 문서 / 다운로드 자료 → PDF 업로드 (`/uploads/documents/`) |
| 자기소개·기술·경력·수상·연락처·이력서 | 사이트 정보 |

**저장 후 반영**: 1~3분. 진행 상황은 저장소 **Actions** 탭에서 볼 수 있습니다.
**빌드가 실패하면** 사이트는 이전 상태로 유지됩니다(깨진 페이지가 배포되지 않음). Actions 로그의 "Validate content" 단계에 어느 파일·필드가 문제인지 한글로 표시됩니다.

**이미지 권장**: 업로드 전 가로 1600px 이하, 500KB 이하로 줄여 주세요. 영상 파일은 올리지 말고 YouTube 링크를 사용하세요.

## 로컬에서 편집 (선택)

GitHub 로그인 없이 내 PC의 파일을 직접 수정합니다.

```bash
npm run cms:local     # 터미널 1: decap-server (localhost:8081)
npm run dev           # 터미널 2: http://localhost:3000/admin/index.html
```

변경사항은 로컬 파일에만 저장되므로 직접 커밋·푸시해야 합니다.

## 보안 메모

- 토큰 권한은 `public_repo`(공개 저장소 쓰기)로 제한됩니다. 저장소를 비공개로 바꾸면 `cms/decap-config.ts`의 `auth_scope`와 Worker의 `ALLOWED_SCOPES`를 `repo`로 함께 변경해야 하며, Pages 사용에 GitHub Pro가 필요합니다.
- Worker는 `ALLOWED_ORIGINS`(기본 `https://jongmini99.github.io`)로만 토큰을 전달합니다. 사이트 주소가 바뀌면 `wrangler.toml`을 수정 후 다시 배포하세요.
- 로그인 토큰은 관리자 브라우저(localStorage)에 저장됩니다. 공용 PC에서는 사용 후 로그아웃하세요.
- Client Secret이 유출되었다면 GitHub OAuth App에서 Secret을 재발급하고 3단계를 다시 실행하세요.
