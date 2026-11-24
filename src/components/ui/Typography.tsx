import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** 영문 소제목: 기울어진 강조 막대 + 넓은 자간 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "flex items-center gap-3 font-display text-eyebrow font-semibold uppercase text-accent-text",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-3.5 w-1 shrink-0 -skew-x-[20deg] rounded-[1px] bg-accent"
      />
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
 * 섹션 설명 문단: 제목 아래에 둔다. 줄바꿈(\n)마다 문단을 나눠 넓은 화면에서 줄 단위로 읽히게 한다.
 * 홈 전체 섹션 머리(SectionTitle·경험·파이프라인)가 같은 설명 스타일을 쓴다.
 */
export function SectionIntro({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-1 break-keep text-fg-muted lg:text-[1.0625rem]",
        className,
      )}
    >
      {text.split("\n").map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

/**
 * 홈 섹션 머리: (작은 상위 라벨) + 큰 제목 + 그 아래 설명. 넓은 화면에서는 버튼(aside)만 오른쪽 아래에 둔다.
 */
export function SectionTitle({
  label,
  title,
  id,
  description,
  aside,
  className,
}: {
  /** 제목 위 작은 상위 라벨 (한국어) */
  label?: string;
  title: string;
  id: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">
        {label && (
          <p className="text-sm font-semibold text-fg-muted">{label}</p>
        )}
        <h2
          id={id}
          className="text-title font-semibold tracking-[-0.04em] text-fg"
        >
          {title}
        </h2>
        {description && <SectionIntro text={description} />}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

/** 섹션 제목 묶음. id는 aria-labelledby 연결용 */
export function SectionHeading({
  eyebrow,
  title,
  id,
  as: Tag = "h2",
  className,
  size = "lg",
}: HeadingProps) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag
        id={id}
        className={cx(
          "font-bold tracking-[-0.03em] text-fg",
          size === "lg" ? "text-2xl sm:text-[2rem]" : "text-xl",
        )}
      >
        {title}
      </Tag>
    </div>
  );
}
