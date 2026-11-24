"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { z } from "zod";
import type { ImageSchema } from "@/content/schema";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type Image = z.infer<typeof ImageSchema>;

const iconBtn =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-bg/80 text-fg " +
  "transition-colors duration-150 hover:border-accent hover:text-accent-text disabled:opacity-30";

/** 캡션 "제목 — 설명"을 제목과 설명으로 나눈다 */
function splitCaption(caption: string | undefined, fallback: string) {
  const [title, ...rest] = (caption ?? fallback).split(" — ");
  return { title: title!, description: rest.join(" — ") || undefined };
}

/**
 * 홈 이미지 카드 (AI 게임 제작 파이프라인 도표·AI 업무 자동화·현업 실무 경험) (세로 카드: 위 큰 도표 + 아래 제목·설명).
 * 도표 글씨가 작아 카드를 누르면 라이트박스로 크게 보여 준다 (←/→ 이동, Esc 닫기).
 */
const GRID = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;
const ASPECT = { video: "aspect-video", portrait: "aspect-[4/5]" } as const;

export function WorkflowCards({
  figures,
  label,
  columns = 2,
  aspect = "video",
  numberPrefix,
}: {
  figures: Image[];
  label: string;
  /** 데스크톱 열 수 */
  columns?: keyof typeof GRID;
  /** 썸네일 비율 (portrait: 세로 이미지, 위쪽 기준으로 자름) */
  aspect?: keyof typeof ASPECT;
  /** 번호 앞 접두어 (예: "AI" → "AI · 01") */
  numberPrefix?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const open = (i: number) => {
    setCurrent(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = (dir: 1 | -1) => setCurrent((c) => (c === null ? c : (c + dir + figures.length) % figures.length));
  const active = current === null ? null : figures[current];
  const activeText = active ? splitCaption(active.caption, label) : null;

  return (
    <>
      <ul className={cx("grid gap-5", GRID[columns])}>
        {figures.map((f, i) => {
          const { title, description } = splitCaption(f.caption, label);
          return (
            <li key={f.src} className="min-w-0">
              <button
                type="button"
                onClick={() => open(i)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-band-line bg-bg/40 text-left transition-colors duration-150 hover:border-accent/60"
              >
                <span className={cx("relative block w-full overflow-hidden border-b border-band-line", ASPECT[aspect])}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={withBasePath(f.src)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover object-top motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-1.5 p-4 sm:p-5">
                  <span className="text-lg leading-snug font-bold text-fg">
                    <span className="mr-2 font-display text-accent-text">
                      {numberPrefix && `${numberPrefix} · `}
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {title}
                  </span>
                  {description && <span className="text-[0.95rem] leading-snug break-keep text-fg-muted">{description}</span>}
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-fg-muted group-hover:text-accent-text">
                    <Maximize2 className="size-4" aria-hidden="true" />
                    크게 보기
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${label} 크게 보기`}
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto max-h-[94dvh] w-[min(94vw,96rem)] bg-transparent p-0 text-fg backdrop:bg-black/85"
      >
        {active && activeText && (
          <figure className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <figcaption className="min-w-0 text-sm font-semibold text-fg" aria-live="polite">
                {activeText.title}
                <span className="ml-2 font-display font-medium text-fg-muted">
                  {current! + 1} / {figures.length}
                </span>
              </figcaption>
              <button type="button" onClick={close} className={iconBtn} autoFocus>
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">닫기</span>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(active.src)} alt={active.alt ?? activeText.title} className="max-h-[80dvh] w-full rounded-card object-contain" />
            {figures.length > 1 && (
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => step(-1)} className={iconBtn}>
                  <ChevronLeft className="size-5" aria-hidden="true" />
                  <span className="sr-only">이전 도표</span>
                </button>
                <button type="button" onClick={() => step(1)} className={iconBtn}>
                  <ChevronRight className="size-5" aria-hidden="true" />
                  <span className="sr-only">다음 도표</span>
                </button>
              </div>
            )}
          </figure>
        )}
      </dialog>
    </>
  );
}
