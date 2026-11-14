import type { ReactNode } from "react";
import { Container } from "./Container";
import { Eyebrow } from "@/components/ui/Typography";

/** 서브 페이지 상단 제목 영역 */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-linear-to-b from-surface/50 to-transparent">
      <Container className="flex flex-col gap-4 py-12 sm:py-16">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">{title}</h1>
        {children && <div className="max-w-2xl text-fg-muted">{children}</div>}
      </Container>
    </div>
  );
}
