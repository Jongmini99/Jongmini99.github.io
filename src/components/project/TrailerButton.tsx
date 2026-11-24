"use client";

import { Play } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

/** 대표 프로젝트 트레일러 재생 요청 이벤트 (YouTubeFrame이 listenPlayEvent로 받는다) */
export const PLAY_TRAILER_EVENT = "portfolio:play-trailer";

/**
 * 히어로의 트레일러 버튼: 대표 프로젝트 화면으로 이동하면서 트레일러를 바로 재생한다.
 * 스크립트가 없으면 href(#featured) 이동만 한다.
 */
export function TrailerButton({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      className={buttonClass({ variant: "primary" })}
      onClick={(e) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        history.replaceState(null, "", `#${targetId}`);
        window.dispatchEvent(new CustomEvent(PLAY_TRAILER_EVENT));
      }}
    >
      <Play className="size-4" aria-hidden="true" fill="currentColor" />
      {children}
    </a>
  );
}
