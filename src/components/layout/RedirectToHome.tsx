"use client";

import Link from "next/link";
import { useEffect } from "react";
import { withBasePath } from "@/lib/base-path";
import { Container } from "./Container";

/**
 * 홈 한 페이지로 통합된 예전 주소(/about/, /contact/)를 홈의 해당 섹션으로 보낸다.
 * 정적 호스팅이라 서버 리다이렉트 대신 meta refresh + 클라이언트 이동을 함께 쓴다.
 */
export function RedirectToHome({ section, label }: { section: string; label: string }) {
  const target = withBasePath(`/#${section}`);
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return (
    <Container className="py-section">
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <p className="text-fg-muted">
        이 페이지는 홈으로 옮겨졌습니다.{" "}
        <Link href={`/#${section}`} className="text-accent-text underline underline-offset-4">
          {label}(으)로 이동
        </Link>
      </p>
    </Container>
  );
}
