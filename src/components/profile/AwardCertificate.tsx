"use client";

import { useRef } from "react";
import { Trophy, X } from "lucide-react";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type Props = {
  title: string;
  /** 카드 아래 짧은 표시 (예: 분류 이름 "수상") */
  label: string;
  date?: string;
  image: { src: string; alt?: string };
  className?: string;
};

/**
 * 히어로 프로필 사진 모서리에 겹쳐 놓는 작은 상장 카드.
 * 누르면 라이트박스(<dialog>, Esc 닫기)로 상장을 크게 보여 준다.
 */
export function AwardCertificate({ title, label, date, image, className }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const alt = image.alt ?? `${title} 상장`;
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={cx(
          "group flex w-28 flex-col overflow-hidden rounded-xl border border-line-strong bg-surface text-left shadow-[0_20px_50px_rgb(0_0_0/0.55)] sm:w-32",
          "transition-[transform,border-color] duration-200 hover:border-accent motion-safe:-rotate-3 motion-safe:hover:rotate-0",
          className,
        )}
      >
        <span className="block aspect-[3/4] overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath(image.src)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        </span>
        <span className="flex items-center gap-1.5 bg-accent-solid px-2 py-1.5 text-[0.7rem] leading-tight font-bold text-accent-fg">
          <Trophy className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {label}
            {date && <span className="block font-display font-medium opacity-90">{date}</span>}
          </span>
        </span>
        <span className="sr-only">{`${title} 상장 크게 보기`}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`${title} 상장`}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-[92dvh] w-[min(92vw,40rem)] bg-transparent p-0 text-fg backdrop:bg-black/85"
      >
        <figure className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <figcaption className="text-sm font-semibold text-fg">
              {title}
              {date && <span className="ml-2 font-display font-medium text-fg-muted">{date}</span>}
            </figcaption>
            <button
              type="button"
              onClick={close}
              autoFocus
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-bg/80 text-fg transition-colors duration-150 hover:border-accent hover:text-accent-text"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">닫기</span>
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath(image.src)} alt={alt} className="max-h-[80dvh] w-full rounded-card object-contain" />
        </figure>
      </dialog>
    </>
  );
}
