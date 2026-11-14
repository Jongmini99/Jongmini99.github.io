"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { z } from "zod";
import type { ImageSchema } from "@/content/schema";
import { MediaPlaceholder } from "@/components/ui/Media";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type Image = z.infer<typeof ImageSchema>;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const iconBtn =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-bg/80 text-fg " +
  "transition-colors duration-150 hover:border-accent hover:text-accent-text disabled:opacity-30 disabled:hover:border-line-strong";

/**
 * 이미지 갤러리: 가로 스크롤(scroll-snap) + 이전/다음 버튼 + 라이트박스(<dialog>).
 * - 키보드: Tab으로 각 이미지 포커스, Enter로 확대, 라이트박스 안에서 ←/→ 이동, Esc 닫기
 * - reduced-motion: 즉시 스크롤
 */
export function Gallery({ images, label }: { images: Image[]; label: string }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges, images.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const open = (i: number) => {
    setCurrent(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = (dir: 1 | -1) => setCurrent((c) => (c === null ? c : (c + dir + images.length) % images.length));

  if (images.length === 0) {
    return (
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label={`${label} (준비 중)`}>
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={cx("aspect-video overflow-hidden rounded-card border border-line", i >= 2 && "hidden md:block")}>
            <MediaPlaceholder label="이미지 준비 중" />
          </li>
        ))}
      </ul>
    );
  }

  const active = current !== null ? images[current] : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button type="button" className={cx(iconBtn, "hidden sm:inline-flex")} onClick={() => scrollByPage(-1)} disabled={edges.start}>
          <ChevronLeft className="size-5" aria-hidden="true" />
          <span className="sr-only">이전 이미지들</span>
        </button>
        <ul
          ref={scrollerRef}
          onScroll={updateEdges}
          aria-label={label}
          className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]"
        >
          {images.map((img, i) => (
            <li key={`${img.src}-${i}`} className="w-[78%] shrink-0 snap-start sm:w-[calc(50%-0.375rem)] lg:w-[calc(25%-0.5625rem)]">
              <button
                type="button"
                onClick={() => open(i)}
                className="block aspect-video w-full overflow-hidden rounded-card border border-line transition-colors duration-150 hover:border-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBasePath(img.src)} alt={img.alt ?? img.caption ?? `${label} ${i + 1}`} loading="lazy" decoding="async" className="size-full object-cover" />
                <span className="sr-only"> — 크게 보기</span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={cx(iconBtn, "hidden sm:inline-flex")} onClick={() => scrollByPage(1)} disabled={edges.end}>
          <ChevronRight className="size-5" aria-hidden="true" />
          <span className="sr-only">다음 이미지들</span>
        </button>
      </div>
      <p className="text-xs text-fg-subtle">총 {images.length}장 · 이미지를 선택하면 크게 볼 수 있습니다.</p>

      <dialog
        ref={dialogRef}
        aria-label="이미지 크게 보기"
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto max-h-[92dvh] w-[min(92vw,72rem)] bg-transparent p-0 text-fg backdrop:bg-black/85"
      >
        {active && (
          <figure className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-fg-muted" aria-live="polite">
                {current! + 1} / {images.length}
              </p>
              <button type="button" onClick={close} className={iconBtn} autoFocus>
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">닫기</span>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(active.src)} alt={active.alt ?? active.caption ?? `${label} ${current! + 1}`} className="max-h-[74dvh] w-full rounded-card object-contain" />
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => step(-1)} className={iconBtn} disabled={images.length < 2}>
                <ChevronLeft className="size-5" aria-hidden="true" />
                <span className="sr-only">이전 이미지</span>
              </button>
              <figcaption className="text-center text-sm text-fg-muted">{active.caption ?? active.alt}</figcaption>
              <button type="button" onClick={() => step(1)} className={iconBtn} disabled={images.length < 2}>
                <ChevronRight className="size-5" aria-hidden="true" />
                <span className="sr-only">다음 이미지</span>
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </div>
  );
}
