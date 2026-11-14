"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocEntry } from "./structure";
import { cx } from "@/lib/cx";

/** 화면 상단 기준으로 현재 읽고 있는 섹션 id 추적 */
function useActiveId(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const first = ids.find((id) => visible.get(id));
        if (first) setActive(first);
      },
      // 헤더 아래 ~ 화면 40% 지점 사이에 들어온 섹션을 현재 섹션으로 판단
      { rootMargin: "-80px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocList({ entries, activeId, onNavigate }: { entries: TocEntry[]; activeId?: string; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-0.5 text-sm">
      {entries.map((e) => {
        const childActive = e.children.some((c) => c.id === activeId);
        const isActive = e.id === activeId;
        return (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              className={cx(
                "flex items-center rounded-control border-l-2 px-3 py-2 transition-colors duration-150",
                isActive || childActive
                  ? "border-accent bg-accent-soft font-semibold text-fg"
                  : "border-transparent text-fg-muted hover:bg-surface hover:text-fg",
              )}
            >
              {e.title}
            </a>
            {e.children.length > 0 && (
              <ul className="mt-0.5 mb-1 flex flex-col gap-0.5 pl-5">
                {e.children.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      onClick={onNavigate}
                      aria-current={c.id === activeId ? "location" : undefined}
                      className={cx(
                        "flex items-center gap-2 rounded-control px-3 py-1.5 text-[0.8125rem] transition-colors duration-150",
                        c.id === activeId ? "text-accent-text" : "text-fg-subtle hover:text-fg",
                      )}
                    >
                      <span aria-hidden="true" className="size-1 rounded-full bg-current" />
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** 데스크톱: 좌측 고정 목차 */
export function ProjectTocDesktop({ entries }: { entries: TocEntry[] }) {
  const ids = useMemo(() => entries.flatMap((e) => [e.id, ...e.children.map((c) => c.id)]), [entries]);
  const activeId = useActiveId(ids);
  return (
    <nav aria-label="프로젝트 목차" className="sticky top-[calc(var(--spacing-header)+1.5rem)] max-h-[calc(100dvh-var(--spacing-header)-3rem)] overflow-y-auto pr-2">
      <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-fg-subtle">프로젝트 내비게이션</p>
      <TocList entries={entries} activeId={activeId} />
    </nav>
  );
}

/** 모바일·태블릿: 헤더 아래 고정되는 접이식 목차 */
export function ProjectTocMobile({ entries }: { entries: TocEntry[] }) {
  const ids = useMemo(() => entries.flatMap((e) => [e.id, ...e.children.map((c) => c.id)]), [entries]);
  const activeId = useActiveId(ids);
  const [open, setOpen] = useState(false);
  const activeTitle =
    entries.find((e) => e.id === activeId)?.title ??
    entries.find((e) => e.children.some((c) => c.id === activeId))?.title ??
    entries[0]?.title;

  return (
    <nav aria-label="프로젝트 목차" className="sticky top-header z-30 border-b border-line bg-bg/95 backdrop-blur-md lg:hidden">
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group mx-auto max-w-(--container-content) px-4 sm:px-6">
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-fg-subtle">목차</span>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <span className="truncate font-semibold text-fg">{activeTitle}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-fg-muted transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="max-h-[60dvh] overflow-y-auto pb-4">
          <TocList entries={entries} activeId={activeId} onNavigate={() => setOpen(false)} />
        </div>
      </details>
    </nav>
  );
}
