import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** 영문 소제목: 기울어진 강조 막대 + 넓은 자간 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("flex items-center gap-3 font-display text-eyebrow font-semibold uppercase text-accent-text", className)}>
      <span aria-hidden="true" className="h-3.5 w-1 shrink-0 -skew-x-[20deg] rounded-[1px] bg-accent" />
      {children}
    </p>
  );
}

type HeadingProps = {
  eyebrow?: string;
  title: string;
  id?: string;
  as?: "h2" | "h3";
  className?: string;
  size?: "lg" | "md";
};

/** 섹션 제목 묶음. id는 aria-labelledby 연결용 */
export function SectionHeading({ eyebrow, title, id, as: Tag = "h2", className, size = "lg" }: HeadingProps) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag id={id} className={cx("font-bold tracking-tight text-fg", size === "lg" ? "text-2xl sm:text-[1.75rem]" : "text-xl")}>
        {title}
      </Tag>
    </div>
  );
}
