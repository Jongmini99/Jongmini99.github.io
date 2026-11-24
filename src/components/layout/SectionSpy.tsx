"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";

export type SpyItem = { id: string; label: string };

/**
 * 홈 오른쪽 세로 점 내비게이션 (Scrollspy).
 * - 화면 세로 중앙에 걸친 섹션을 현재 위치로 표시 (aria-current="location")
 * - 점을 누르면 해당 화면으로 이동, 마우스·키보드 포커스 시 섹션 이름 표시
 * - 데스크톱(한 화면 = 한 섹션 구조)에서만 보인다
 */
export function SectionSpy({ items }: { items: SpyItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="홈 섹션 이동" className="fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 lg:block">
      <ol className="flex flex-col items-end gap-1">
        {items.map((item, i) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className="group relative flex h-7 items-center justify-end gap-3 pl-3 outline-none"
              >
                <span
                  className={cx(
                    "pointer-events-none rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold whitespace-nowrap text-fg shadow-lg",
                    "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity motion-safe:duration-150",
                  )}
                >
                  <span className="mr-1.5 font-display text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cx(
                    "block w-2.5 rounded-full motion-safe:transition-all motion-safe:duration-200",
                    current ? "h-6 bg-accent" : "h-2.5 bg-line-strong group-hover:bg-fg-muted",
                    "group-focus-visible:ring-2 group-focus-visible:ring-focus group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-bg",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
