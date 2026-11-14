import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-150 " +
  "disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  outline: "border border-line-strong bg-surface/40 text-fg hover:border-accent hover:bg-surface",
  ghost: "text-fg-muted hover:bg-surface hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
};

export function buttonClass({ variant = "outline", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cx(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** 파일 다운로드 링크 (사이트 내부 정적 파일) */
  download?: boolean;
  /** "새 창" 안내 아이콘 표시 여부. 외부 URL은 자동으로 새 창 */
  showExternalIcon?: boolean;
  "aria-label"?: string;
};

const isExternal = (href: string) => /^(https?:)?\/\//.test(href);
const isSpecial = (href: string) => /^(mailto|tel):/.test(href);

/**
 * 내부 페이지 → next/link (basePath 자동)
 * 외부 URL → 새 창 + rel=noopener
 * 정적 파일(/uploads/...) → withBasePath 적용한 <a>
 */
export function ButtonLink({ href, children, variant, size, className, download, showExternalIcon, ...rest }: ButtonLinkProps) {
  const cls = buttonClass({ variant, size, className });

  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
        {showExternalIcon && <ArrowUpRight className="size-4" aria-hidden="true" />}
        <span className="sr-only">(새 창)</span>
      </a>
    );
  }
  if (isSpecial(href)) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  if (download || href.startsWith("/uploads/")) {
    return (
      <a href={withBasePath(href)} download={download || undefined} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
