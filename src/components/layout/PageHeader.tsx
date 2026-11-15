import type { ReactNode } from "react";
import { Container } from "./Container";
import { Eyebrow } from "@/components/ui/Typography";

/** 서브 페이지 상단 제목 영역 */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-linear-to-b from-band/60 to-transparent">
      <Container className="relative flex flex-col gap-4 py-14 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-title font-semibold tracking-[-0.04em] text-fg">{title}</h1>
        {children && <div className="max-w-2xl text-fg-muted">{children}</div>}
      </Container>
    </div>
  );
}
