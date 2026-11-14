/**
 * OAuth 프록시 동작 테스트 (Cloudflare 배포 없이 Node에서 실행)
 * 실행: node cms/oauth-worker/test.mjs
 */
import assert from "node:assert/strict";
import worker from "./src/index.js";

const env = {
  GITHUB_CLIENT_ID: "test-client-id",
  GITHUB_CLIENT_SECRET: "test-client-secret",
  ALLOWED_ORIGINS: "https://jongmini99.github.io",
  ALLOWED_SCOPES: "public_repo",
};
const BASE = "https://decap-oauth.example.workers.dev";
const get = (path, headers = {}) => worker.fetch(new Request(BASE + path, { headers }), env);

let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log(`  ✔ ${name}`);
};

await test("/auth → GitHub 인증 화면으로 리다이렉트 + state 쿠키", async () => {
  const res = await get("/auth?provider=github&scope=public_repo");
  assert.equal(res.status, 302);
  const loc = new URL(res.headers.get("Location"));
  assert.equal(loc.origin + loc.pathname, "https://github.com/login/oauth/authorize");
  assert.equal(loc.searchParams.get("client_id"), "test-client-id");
  assert.equal(loc.searchParams.get("scope"), "public_repo");
  assert.equal(loc.searchParams.get("redirect_uri"), `${BASE}/callback`);
  const cookie = res.headers.get("Set-Cookie");
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
  assert.ok(cookie.includes(loc.searchParams.get("state")));
  assert.ok(!res.headers.get("Location").includes("test-client-secret"), "secret 노출 금지");
});

await test("허용되지 않은 scope(repo) 거부", async () => {
  const res = await get("/auth?provider=github&scope=repo");
  assert.equal(res.status, 400);
});

await test("state 불일치 시 토큰 교환하지 않음 (CSRF 방지)", async () => {
  let called = false;
  const orig = globalThis.fetch;
  globalThis.fetch = async () => ((called = true), new Response("{}"));
  const res = await get("/callback?code=abc&state=attacker", { Cookie: "decap_oauth_state=real" });
  globalThis.fetch = orig;
  assert.equal(res.status, 400);
  assert.equal(called, false);
});

await test("정상 콜백: 토큰 교환 → 허용 출처로만 전달하는 페이지", async () => {
  const orig = globalThis.fetch;
  let body;
  globalThis.fetch = async (_url, init) => {
    body = JSON.parse(init.body);
    return new Response(JSON.stringify({ access_token: "gho_TESTTOKEN</script>" }), { headers: { "Content-Type": "application/json" } });
  };
  const res = await get("/callback?code=abc&state=s1", { Cookie: "decap_oauth_state=s1" });
  globalThis.fetch = orig;
  assert.equal(res.status, 200);
  assert.equal(body.client_secret, "test-client-secret");
  const html = await res.text();
  assert.ok(html.includes('["https://jongmini99.github.io"]'), "허용 출처 목록 포함");
  assert.equal(html.split("</script>").length - 1, 1, "</script>는 닫는 태그 하나만 존재해야 함 (토큰 내 삽입 차단)");
  // 페이지의 스크립트를 실제로 평가해 메시지가 원래 토큰을 그대로 복원하는지 확인
  const script = html.split(/<script[^>]*>/)[1].split("</script>")[0];
  const posted = [];
  const listeners = [];
  const fakeWindow = { opener: { postMessage: (m, o) => posted.push([m, o]) }, addEventListener: (_t, fn) => listeners.push(fn), close() {} };
  new Function("window", "setTimeout", script)(fakeWindow, () => {});
  assert.deepEqual(posted[0], ["authorizing:github", "*"]);
  listeners[0]({ origin: "https://evil.example" });
  assert.equal(posted.length, 1, "허용되지 않은 출처에는 토큰을 보내지 않음");
  listeners[0]({ origin: "https://jongmini99.github.io" });
  assert.equal(posted[1][1], "https://jongmini99.github.io");
  assert.equal(JSON.parse(posted[1][0].replace("authorization:github:success:", "")).token, "gho_TESTTOKEN</script>");
  assert.ok(!html.includes("test-client-secret"), "secret 노출 금지");
  assert.match(res.headers.get("Content-Security-Policy"), /script-src 'nonce-/);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
});

await test("설정 누락 시 500 (비밀값 없이 동작하지 않음)", async () => {
  const res = await worker.fetch(new Request(BASE + "/auth"), {});
  assert.equal(res.status, 500);
});

console.log(`✔ OAuth 프록시 테스트 ${passed}개 통과`);
