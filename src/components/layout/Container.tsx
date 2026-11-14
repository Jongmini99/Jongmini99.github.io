import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Container({ as: Tag = "div", className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  return <Tag className={cx("mx-auto w-full max-w-(--container-content) px-4 sm:px-6 lg:px-8", className)}>{children}</Tag>;
}
