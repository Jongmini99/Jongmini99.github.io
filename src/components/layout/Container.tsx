import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * wide: 큰 모니터(1536px 이상)에서 폭을 넓힌다. 홈 한 화면 섹션용.
 * 오른쪽 점 내비게이션과 겹치지 않도록 화면 폭 - 20rem을 넘지 않고, 낮은 화면(울트라와이드)에서 카드가 넘치지 않도록 화면 높이의 1.6배도 넘지 않는다 (1536px 이하에서는 기본 폭과 같음).
 */
const WIDE =
  "2xl:max-w-[min(86rem,calc(100vw_-_20rem),160vh)] min-[140rem]:max-w-[min(94rem,calc(100vw_-_20rem),160vh)]";

export function Container({
  as: Tag = "div",
  className,
  wide,
  children,
}: {
  as?: ElementType;
  className?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Tag className={cx("mx-auto w-full max-w-(--container-content) px-4 sm:px-6 lg:px-8", wide && WIDE, className)}>
      {children}
    </Tag>
  );
}
