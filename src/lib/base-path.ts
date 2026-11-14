/**
 * GitHub Pages 프로젝트 사이트(/repo-name) 대응.
 *
 * next/link 의 <Link>와 next/navigation 은 basePath를 자동으로 붙이므로 이 함수가 필요 없다.
 * CMS가 저장한 "/uploads/..." 같은 정적 파일 경로를 <img src>, <a href download>에
 * 직접 쓸 때만 withBasePath()로 감싼다.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export function withBasePath(path: string): string;
export function withBasePath(path: string | undefined): string | undefined;
export function withBasePath(path: string | undefined): string | undefined {
  if (!path) return path;
  // 외부 URL, 프로토콜 상대 URL, data/mailto/tel, 앵커는 그대로 둔다.
  if (/^([a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (BASE_PATH && normalized.startsWith(`${BASE_PATH}/`)) return normalized;
  return `${BASE_PATH}${normalized}`;
}

/** sitemap/OG 등 절대 URL이 필요한 곳에서 사용. CI에서 NEXT_PUBLIC_SITE_URL 주입. */
export function absoluteUrl(path = "/"): string | undefined {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (!site) return undefined;
  // configure-pages 의 base_url 은 이미 basePath 를 포함한다.
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${site}${normalized}`;
}
