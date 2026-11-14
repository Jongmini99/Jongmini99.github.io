import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

type CardProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** hover 시 테두리 강조 (클릭 가능한 카드) */
  interactive?: boolean;
  padded?: boolean;
};

export function Card({ as: Tag = "div", className, children, interactive, padded = true }: CardProps) {
  return (
    <Tag
      className={cx(
        "relative rounded-card border border-line bg-surface",
        padded && "p-5 sm:p-6",
        interactive && "transition-colors duration-150 hover:border-accent/60 focus-within:border-accent/60",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
