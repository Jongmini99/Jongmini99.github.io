"use client";

import { useEffect } from "react";

/**
 * 페이지에 들어오면 맨 위로 스크롤한다 (주소에 #섹션이 있으면 그 위치를 유지).
 * Next.js는 새 페이지 본문의 시작점을 화면 맨 위에 맞추는데, 고정 헤더가 그 위를 덮어
 * 상세 페이지의 '프로젝트 목록으로' 링크가 가려지는 문제를 막는다.
 */
export function ScrollToTopOnEnter() {
  useEffect(() => {
    if (window.location.hash) return;
    // Next.js의 페이지 전환 스크롤이 끝난 다음 프레임에 실행
    const id = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}
