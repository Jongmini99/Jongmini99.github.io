"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CirclePlay, Image as ImageIcon } from "lucide-react";
import { cx } from "@/lib/cx";

type Tab = { key: string; label: string; icon: "image" | "video"; count: number; panel: ReactNode };

/**
 * WAI-ARIA Tabs 패턴: ←/→/Home/End로 탭 이동(자동 활성화), Tab으로 패널 진입.
 */
export function MediaTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    const target = map[e.key];
    if (target !== undefined) {
      e.preventDefault();
      focusTab(target);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label={label} className="inline-flex w-fit gap-1 rounded-control border border-line bg-surface p-1">
        {tabs.map((t, i) => {
          const Icon = t.icon === "image" ? ImageIcon : CirclePlay;
          const isSel = i === selected;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${i}`}
              aria-selected={isSel}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={isSel ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx(
                "inline-flex h-9 items-center gap-2 rounded-[0.35rem] px-3.5 text-sm font-medium transition-colors duration-150",
                isSel ? "bg-accent-soft text-accent-text" : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {t.label}
              <span className="font-display text-xs text-fg-subtle">{t.count}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== selected}
          tabIndex={0}
          className="rounded-card"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
