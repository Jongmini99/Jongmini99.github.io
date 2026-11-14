import type { ReactNode } from "react";
import type { Section } from "@/content/schema";
import { SectionHeading } from "@/components/ui/Typography";
import { Markdown } from "@/components/ui/Markdown";
import { Inbox } from "lucide-react";

/** 모든 상세 섹션의 공통 틀: 앵커 id, 제목, 소개 문단 */
export function SectionShell({ section, children, aside }: { section: Section; children?: ReactNode; aside?: ReactNode }) {
  const headingId = `${section.id}-heading`;
  return (
    <section id={section.id} aria-labelledby={headingId} className="flex h-full flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} id={headingId} />
        {aside}
      </div>
      {section.intro && <Markdown>{section.intro}</Markdown>}
      {children}
    </section>
  );
}

/** 데이터 미등록 상태 (관리자에서 추가 예정인 항목) */
export function EmptyState({ children = "등록된 자료가 없습니다." }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-dashed border-line-strong px-5 py-6 text-sm text-fg-subtle">
      <Inbox className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
      <p>{children}</p>
    </div>
  );
}
