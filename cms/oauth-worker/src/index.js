/**
 * Decap CMS ↔ GitHub OAuth 프록시 (Cloudflare Worker, 의존성 없음)
 *
 * 왜 필요한가: GitHub OAuth는 code → token 교환에 Client Secret이 필요하다.
 * GitHub Pages(정적 호스팅)에는 비밀값을 둘 서버가 없으므로 이 Worker가 교환만 대행한다.
 *
 * 흐름
 *   1) /admin 의 Decap이 팝업으로  GET /auth?provider=github&scope=public_repo  를 연다
 *   2) Worker → GitHub 인증 화면으로 리다이렉트 (state 쿠키로 CSRF 방지)
 *   3) GitHub → GET /callback?code&state
 *   4) Worker가 Client Secret으로 토큰 교환 → 팝업이 window.opener(Decap)에 토큰 전달
 *      토큰은 ALLOWED_ORIGINS 에 등록된 사이트 출처로만 전달된다.
 *
 * 환경 설정 (wrangler.toml / Cloudflare 대시보드)
 *   GITHUB_CLIENT_ID      (secret)  GitHub OAuth App Client ID
 *   GITHUB_CLIENT_SECRET  (secret)  GitHub OAuth App Client Secret
 *   ALLOWED_ORIGINS       (var)     토큰을 받을 수 있는 사이트 출처, 쉼표 구분. 예: https://jongmini99.github.io
 *   ALLOWED_SCOPES        (var)     허용 권한, 쉼표 구분. 기본 "public_repo"
 */

const STATE_COOKIE = "decap_oauth_state";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method !== "GET") return text("Method Not Allowed", 405);
      if (url.pathname === "/auth") return handleAuth(url, env);
      if (url.pathname === "/callback") return await handleCallback(request, url, env);
      return text("Decap CMS OAuth proxy", 200);
    } catch (err) {
      console.error(err);
      return text("Internal Error", 500);
    }
  },
};

/* ------------------------------------------------------------------ */

function handleAuth(url, env) {
  assertConfigured(env);
  const provider = url.searchParams.get("provider") ?? "github";
  if (provider !== "github") return text("Unsupported provider", 400);

  const allowedScopes = list(env.ALLOWED_SCOPES || "public_repo");
  const scope = url.searchParams.get("scope") || allowedScopes[0];
  if (!allowedScopes.includes(scope)) return text(`Scope not allowed: ${scope}`, 400);

  const state = randomHex(32);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${url.origin}/callback`);
  authorize.searchParams.set("scope", scope);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${state}; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      "Cache-Control": "no-store",
    },
  });
}

async function handleCallback(request, url, env) {
  assertConfigured(env);
  const clearCookie = `${STATE_COOKIE}=; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readCookie(request.headers.get("Cookie"), STATE_COOKIE);

  if (url.searchParams.get("error")) {
    return resultPage(env, { error: url.searchParams.get("error_description") || url.searchParams.get("error") }, clearCookie);
  }
  if (!code || !state || !expected || !timingSafeEqual(state, expected)) {
    return resultPage(env, { error: "인증 상태(state)가 일치하지 않습니다. 다시 로그인해 주세요." }, clearCookie);
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "decap-oauth-worker" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    return resultPage(env, { error: data.error_description || data.error || "토큰 발급에 실패했습니다." }, clearCookie);
  }
  return resultPage(env, { token: data.access_token }, clearCookie);
}

/* ------------------------------------------------------------------ */

/**
 * Decap CMS 팝업 핸드셰이크:
 *   팝업 → opener: "authorizing:github"
 *   opener → 팝업: (같은 메시지 회신, 이때 opener의 origin 확인)
 *   팝업 → opener: "authorization:github:success:{json}"  (허용된 origin으로만)
 */
function resultPage(env, result, cookie) {
  const allowed = list(env.ALLOWED_ORIGINS || "");
  const status = result.token ? "success" : "error";
  const payload = result.token ? { token: result.token, provider: "github" } : { message: result.error };
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const nonce = randomHex(16);

  // HTML/스크립트 안에 안전하게 삽입 (</script> 탈출 방지)
  // JSON 안의 "<"와 줄 구분 문자(U+2028/2029)를 JS 이스케이프 문자열로 바꿔 </script> 탈출과 구문 오류를 막는다
  const BS = String.fromCharCode(92); // 백슬래시
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  const js = (v) => JSON.stringify(v).split("<").join(BS + "x3c").split(LS).join(BS + "u2028").split(PS).join(BS + "u2029");

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>로그인 처리 중</title></head>
<body><p>${result.token ? "로그인 완료. 이 창은 자동으로 닫힙니다." : "로그인 실패: " + escapeHtml(result.error)}</p>
<script nonce="${nonce}">
(function () {
  var allowed = ${js(allowed)};
  var message = ${js(message)};
  if (!window.opener) return;
  window.addEventListener("message", function (e) {
    if (allowed.indexOf(e.origin) === -1) return;
    window.opener.postMessage(message, e.origin);
    ${result.token ? "setTimeout(function () { window.close(); }, 300);" : ""}
  });
  window.opener.postMessage("authorizing:github", "*");
})();
</script></body></html>`;

  return new Response(html, {
    status: result.token ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": cookie,
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'`,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function assertConfigured(env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) throw new Error("GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not configured");
  if (!env.ALLOWED_ORIGINS) throw new Error("ALLOWED_ORIGINS not configured");
}

function list(v) {
  return String(v)
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

function randomHex(bytes) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function text(body, status) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
