# Antigravity(Gemini) 사용 안내

Gemini 모델은 **Orca에 연결된 Antigravity CLI(`agy`)**로 사용한다.
`@google/gemini-cli`(`npm run gemini`)는 Google 개인 계정 로그인이 지원 종료되어
("This client is no longer supported for Gemini Code Assist for individuals") 사용하지 않는다.

## 설치 위치와 인증

- `agy`는 Orca가 관리하는 런타임이다 (`%APPDATA%\orca\agent-runtimes\agy\<버전>\agy`). Orca 설치 시 PATH에 등록된다.
- 로그인은 Orca/Antigravity에서 관리한다. 인증 정보를 저장소·채팅에 남기지 않는다.
- 프로젝트 지침: 루트의 `GEMINI.md`를 자동으로 읽는다. `GEMINI.md`는 `CLAUDE.md`를 직접 읽도록 안내한다.

## 기본 명령

```bash
agy --version
agy models                                   # 사용 가능한 모델 목록 (예: gemini-3.8-flash-high)
agy                                          # 대화형 실행
agy --model gemini-3.8-flash-high --mode plan -p "질문"   # 단일 요청 (plan: 읽기 위주)
```

## 읽기 전용 검토 요청 (포트폴리오 피드백 등)

비대화형(`-p`) 모드에서는 Antigravity가 명령 실행 권한을 요청하면 **자동 거부되어 빈 응답**으로 끝날 수 있다.
저장소에서 `--dangerously-skip-permissions`를 쓰지 않는다. 대신 검토 자료의 **사본 폴더**에서 실행한다.

1. 저장소 밖 임시 폴더에 검토에 필요한 파일만 복사한다 (예: PDF 페이지 이미지, 홈 스크린샷, `content/`, 관련 컴포넌트, 검토 요청 문서).
2. 그 폴더에서 실행한다.
   ```bash
   agy --model gemini-3.8-flash-high --sandbox --dangerously-skip-permissions -p "$(cat PROMPT.md)" > RESULT.md
   ```
3. 결과(`RESULT.md`)를 확인한 뒤 임시 폴더를 삭제한다.

검토 요청 문서에는 "파일을 수정하지 말 것", "사실이 아닌 수치·경력을 제안하지 말 것"을 명시한다.
