"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

/**
 * 프로젝트 상세로 들어온 곳(홈 섹션 / 프로젝트 목록)을 기억했다가 상세 페이지의 돌아가기 링크에 쓴다.
 * 같은 탭 안에서만 유지(sessionStorage). 저장소를 못 쓰면 기본값(프로젝트 목록)으로 동작한다.
 */
const KEY = "project-origin";
type Origin = { slug: string; from: "home" | "list"; section?: string };

const slugOf = (href: string) => href.match(/\/projects\/([^/?#]+)/)?.[1];

/** 홈·목록 페이지에 둔다: 프로젝트 상세 링크를 누르면 출발 위치를 기록 */
export function ProjectOriginTracker({ from }: { from: Origin["from"] }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const slug = a ? slugOf(a.getAttribute("href") ?? "") : undefined;
      if (!a || !slug) return;
      const section =
        from === "home" ? a.closest("section[id]")?.id : undefined;
      try {
        sessionStorage.setItem(
          KEY,
          JSON.stringify({ slug, from, section } satisfies Origin),
        );
      } catch {}
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [from]);
  return null;
}

/** 상세 페이지 돌아가기: 홈 카드에서 왔으면 홈의 그 화면으로, 아니면 프로젝트 목록으로 */
export function ProjectBackLink({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState<Origin | null>(null);
  useEffect(() => {
    try {
      const o = JSON.parse(
        sessionStorage.getItem(KEY) ?? "null",
      ) as Origin | null;
      // 저장소 값을 읽는 일은 화면 그리기 뒤에만 가능하다 (정적 HTML은 기본값으로 생성)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (o?.slug === slug && o.from === "home") setOrigin(o);
    } catch {}
  }, [slug]);
  const home = origin !== null;
  return (
    <Link
      href={home ? `/#${origin.section ?? "top"}` : "/projects/"}
      className="inline-flex w-fit items-center gap-1 text-sm text-fg-muted hover:text-fg"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      {home ? "소개로 돌아가기" : "프로젝트 목록으로"}
    </Link>
  );
}
