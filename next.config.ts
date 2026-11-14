import type { NextConfig } from "next";

/**
 * GitHub Pages 정적 배포 설정
 *
 * - NEXT_PUBLIC_BASE_PATH: 프로젝트 사이트(https://<user>.github.io/<repo>)일 때 "/<repo>".
 *   사용자 사이트(https://<user>.github.io)일 때는 빈 문자열.
 *   CI에서는 actions/configure-pages 의 base_path 출력값이 자동 주입된다.
 * - trailingSlash: 모든 경로를 "<route>/index.html"로 내보내 새로고침·직접 URL 접근 시 404를 방지한다.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
