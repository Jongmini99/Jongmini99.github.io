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

/**
 * 홈 섹션 머리: 영문 라벨 + 큰 제목, 넓은 화면에서는 설명/버튼을 오른쪽에 둔다.
 */
export function SectionTitle({
  eyebrow,
  title,
  id,
  description,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  id: string;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-4">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-title font-semibold tracking-[-0.04em] text-fg">
          {title}
        </h2>
      </div>
      {(description || aside) && (
        <div className="flex flex-col items-start gap-4 md:items-end md:text-right">
          {description && <p className="max-w-md leading-[1.8] text-fg-muted">{description}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}

/** 섹션 제목 묶음. id는 aria-labelledby 연결용 */
export function SectionHeading({ eyebrow, title, id, as: Tag = "h2", className, size = "lg" }: HeadingProps) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag id={id} className={cx("font-bold tracking-[-0.03em] text-fg", size === "lg" ? "text-2xl sm:text-[2rem]" : "text-xl")}>
        {title}
      </Tag>
    </div>
  );
}
