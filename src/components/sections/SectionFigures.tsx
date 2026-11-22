import { Maximize2 } from "lucide-react";
import type { Section } from "@/content/schema";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

/**
 * 섹션 도표: 구조도·플로우차트·전후 비교 이미지를 잘라내지 않고 원본 비율로 크게 보여 준다.
 * 도표 속 작은 글씨를 읽을 수 있도록 이미지를 누르면 원본을 새 창으로 연다.
 */
export function SectionFigures({ figures, title }: { figures: Section["figures"]; title: string }) {
  if (figures.length === 0) return null;
  return (
    <div className={cx("grid items-start gap-4", figures.length >= 2 && "md:grid-cols-2")}>
      {figures.map((f, i) => (
        <figure key={f.src + i} className="flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface">
          <a
            href={withBasePath(f.src)}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block bg-bg-alt outline-offset-[-3px]"
          >
            {/* 정적 내보내기 환경이므로 일반 img 사용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath(f.src)}
              alt={f.alt ?? f.caption ?? title}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
            <span
              aria-hidden="true"
              className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-bg/80 text-fg opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Maximize2 className="size-4" />
            </span>
            <span className="sr-only"> (원본 이미지 새 창으로 보기)</span>
          </a>
          {f.caption && <figcaption className="border-t border-line px-4 py-2.5 text-sm text-fg-muted">{f.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

/** 섹션 도표로 이미 보여 준 이미지는 갤러리(미디어 탭)에서 제외한다. */
export function galleryRemainder<T extends { src: string }>(gallery: T[], sections: Section[]): T[] {
  const used = new Set(sections.filter((s) => s.visible).flatMap((s) => s.figures.map((f) => f.src)));
  return gallery.filter((g) => !used.has(g.src));
}
