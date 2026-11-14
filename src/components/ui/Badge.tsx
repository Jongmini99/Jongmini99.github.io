import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cx } from "@/lib/cx";

/** 기술 스택 배지 (아이콘 + 이름) */
export function TechBadge({ name, icon, size = "md" }: { name: string; icon?: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-control border border-line-strong bg-surface/60 font-medium text-fg",
        size === "md" ? "h-11 px-4 text-[0.95rem]" : "h-8 px-3 text-sm",
      )}
    >
      <Icon name={icon} className={size === "md" ? "size-5 text-fg" : "size-4 text-fg-muted"} />
      {name}
    </span>
  );
}

/** 작은 텍스트 태그 */
export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "accent" ? "bg-accent-soft text-accent-text" : "bg-surface-raised text-fg-muted",
      )}
    >
      {children}
    </span>
  );
}

/** 구분선(|)으로 이어지는 인라인 목록 — 역할 표시 등 */
/** 구분선 목록. 줄바꿈된 줄 맨 앞의 구분선은 왼쪽 여백 밖으로 밀어 잘라낸다. */
export function DividedList({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cx("overflow-hidden", className)}>
      <ul className="-ml-[1.5625rem] flex flex-wrap items-center gap-y-1 text-sm text-fg-muted">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="flex items-center before:mx-3 before:h-3 before:w-px before:bg-line-strong before:content-['']"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
