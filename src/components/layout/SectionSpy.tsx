"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { useScrollTarget } from "./useScrollTarget";

export type SpyItem = { id: string; label: string };

/**
 * 홈 오른쪽 세로 점 내비게이션 (Scrollspy).
 * - 화면 세로 중앙에 걸친 섹션을 현재 위치로 표시 (aria-current="location")
 * - 현재 섹션은 점 옆에 표시: 1600px 이상 번호+이름, 1344px 이상 번호만 (본문을 가리지 않는 범위)
 * - 점을 누르면 해당 화면으로 이동, 마우스·키보드 포커스 시 다른 섹션 이름도 표시
 * - 데스크톱(한 화면 = 한 섹션 구조)에서만 보인다
 */
export function SectionSpy({ items }: { items: SpyItem[] }) {
  const [observed, setActive] = useState<string | null>(items[0]?.id ?? null);
  // 점을 눌러 이동하는 동안은 지나가는 섹션 대신 목표 섹션을 현재 위치로 표시
  const [target, lockTarget] = useScrollTarget();
  const active = target ?? observed;

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
                onClick={() => lockTarget(item.id)}
                className="group relative flex h-7 items-center justify-end gap-3 pl-3 outline-none"
              >
                {/*
                  현재 섹션 표시 (본문을 가리지 않도록 화면 폭에 따라 단계 조절)
                  - 1600px 이상: 번호 + 섹션 이름 항상 표시 (본문 옆 여백이 충분)
                  - 1344~1599px: 번호만 표시
                  - 그보다 좁으면 점만. 마우스·키보드 포커스 시에는 항상 이름까지 표시
                */}
                {/* 스크린 리더용 이름 (눈에 보이는 표시는 화면 폭에 따라 숨겨질 수 있음) */}
                <span className="sr-only">{`${i + 1}. ${item.label}`}</span>
                <span
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-lg",
                    "group-hover:inline-flex group-focus-visible:inline-flex",
                    current ? "hidden border-accent/40 bg-surface/90 text-fg backdrop-blur-sm min-[84rem]:inline-flex" : "hidden border-line bg-surface text-fg",
                  )}
                >
                  <span className="font-display text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={cx(
                      "ml-1.5 group-hover:inline group-focus-visible:inline",
                      current ? "hidden min-[100rem]:inline" : "hidden",
                    )}
                  >
                    {item.label}
                  </span>
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
