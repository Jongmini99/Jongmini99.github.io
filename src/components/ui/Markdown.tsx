import ReactMarkdown, { type Components } from "react-markdown";
import { cx } from "@/lib/cx";

/**
 * CMS Markdown 렌더러.
 * 원시 HTML은 렌더링하지 않는다(react-markdown 기본 동작) — XSS 방지.
 */
const components: Components = {
  p: ({ children }) => <p className="leading-[1.8]">{children}</p>,
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-accent-text underline underline-offset-4 hover:text-fg"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {external && <span className="sr-only"> (새 창)</span>}
      </a>
    );
  },
  ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5 marker:text-fg-subtle">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  h3: ({ children }) => <h3 className="mt-2 text-lg font-semibold text-fg">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-2 font-semibold text-fg">{children}</h4>,
  code: ({ children }) => <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  img: () => null, // 본문 이미지는 갤러리/이미지 필드로만 등록
};

export function Markdown({ children, className }: { children: string | undefined; className?: string }) {
  if (!children) return null;
  return (
    <div className={cx("flex flex-col gap-4 text-fg-muted", className)}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
