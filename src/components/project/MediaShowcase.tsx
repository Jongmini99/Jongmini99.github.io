"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from "lucide-react";
import type { z } from "zod";
import type { ImageSchema, VideoSchema } from "@/content/schema";
import { withBasePath } from "@/lib/base-path";
import { parseYouTubeId, youTubeEmbedUrl, youTubeThumbnailUrl } from "@/lib/youtube";
import { cx } from "@/lib/cx";

type Video = z.infer<typeof VideoSchema>;
type Image = z.infer<typeof ImageSchema>;
type Item =
  | { kind: "video"; video: Video; id: string; label: string }
  | { kind: "image"; image: Image; label: string };

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMotionSnapshot = () => window.matchMedia(MOTION_QUERY).matches;

const arrowBtn =
  "absolute top-1/2 z-10 hidden size-11 sm:inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white " +
  "transition-colors duration-150 hover:bg-accent-solid";

const iconBtn =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-bg/80 text-fg " +
  "transition-colors duration-150 hover:border-accent hover:text-accent-text";

/**
 * 상세 헤더 미디어 쇼케이스 (스팀 상점 페이지 방식).
 * 큰 화면 1개 + 아래 썸네일 줄. 영상이 먼저 오고, 첫 영상은 소리 없이 자동 재생한다
 * (동작 줄이기 설정이면 자동 재생하지 않음). 썸네일 줄에서 ←/→로 이동, 이미지는 눌러서 크게 보기(Esc 닫기).
 */
export function MediaShowcase({ videos, images, title }: { videos: Video[]; images: Image[]; title: string }) {
  const items: Item[] = [
    ...videos.flatMap((v): Item[] => {
      const id = parseYouTubeId(v.youtubeUrl);
      return id ? [{ kind: "video", video: v, id, label: `영상: ${v.title}` }] : [];
    }),
    ...images.map((img, i): Item => ({ kind: "image", image: img, label: img.alt ?? img.caption ?? `${title} 스크린샷 ${i + 1}` })),
  ];

  const [index, setIndex] = useState(0);
  /** 사용자가 고른 재생 상태. undefined = 아직 조작 전 (첫 영상 자동 재생 대상) */
  const [userPlaying, setUserPlaying] = useState<boolean | undefined>(undefined);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionSnapshot, () => true);
  const playing: null | "auto" | "user" =
    userPlaying === undefined ? (index === 0 && !reducedMotion ? "auto" : null) : userPlaying ? "user" : null;
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);

  const current = items[index];
  if (!current) return null;

  const select = (i: number, focus = false) => {
    const next = (i + items.length) % items.length;
    setIndex(next);
    setUserPlaying(items[next]?.kind === "video");
    const el = thumbRefs.current[next];
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    if (focus) el?.focus({ preventScroll: true });
  };

  const imageItems = items.filter((it): it is Extract<Item, { kind: "image" }> => it.kind === "image");

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* 큰 화면 */}
      <div className="relative aspect-video overflow-hidden rounded-card border border-line bg-black">
        {current.kind === "video" ? (
          playing ? (
            <iframe
              key={`${current.id}-${playing}`}
              src={`${youTubeEmbedUrl(current.id)}?autoplay=1&rel=0&playsinline=1${playing === "auto" ? "&mute=1" : ""}`}
              title={current.video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <button type="button" onClick={() => setUserPlaying(true)} className="group absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youTubeThumbnailUrl(current.id, "maxres")} alt="" className="size-full object-cover opacity-85" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent-solid text-accent-fg transition-colors duration-150 group-hover:bg-accent-solid-hover">
                  <Play className="size-7 translate-x-0.5" aria-hidden="true" fill="currentColor" />
                </span>
              </span>
              <span className="sr-only">영상 재생: {current.video.title}</span>
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              setZoomed(true);
              dialogRef.current?.showModal();
            }}
            className="group absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(current.image.src)} alt={current.label} className="size-full object-contain" />
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className="size-3.5" aria-hidden="true" />
              크게 보기
            </span>
          </button>
        )}

        {items.length > 1 && (
          <>
            <button type="button" onClick={() => select(index - 1)} className={cx(arrowBtn, "left-3")}>
              <ChevronLeft className="size-6" aria-hidden="true" />
              <span className="sr-only">이전 미디어</span>
            </button>
            <button type="button" onClick={() => select(index + 1)} className={cx(arrowBtn, "right-3")}>
              <ChevronRight className="size-6" aria-hidden="true" />
              <span className="sr-only">다음 미디어</span>
            </button>
          </>
        )}
      </div>

      <p className="min-h-5 truncate text-sm text-fg-muted" aria-live="polite">
        <span className="font-display text-fg-muted">
          {index + 1} / {items.length}
        </span>
        {"  "}
        {current.kind === "video" ? current.video.title : (current.image.caption ?? current.image.alt ?? "")}
      </p>

      {/* 썸네일 줄 */}
      {items.length > 1 && (
        <ul
          aria-label={`${title} 미디어 목록 (←/→로 이동)`}
          className="relative flex min-w-0 snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              select(index + 1, true);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              select(index - 1, true);
            }
          }}
        >
          {items.map((it, i) => (
            <li key={i} className="w-[30%] shrink-0 snap-start sm:w-[22%] lg:w-[18%]">
              <button
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                type="button"
                aria-current={i === index ? "true" : undefined}
                tabIndex={i === index ? 0 : -1}
                onClick={() => select(i)}
                className={cx(
                  "relative block aspect-video w-full overflow-hidden rounded-lg border-2 transition-colors duration-150",
                  i === index ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.kind === "video" ? youTubeThumbnailUrl(it.id, "hq") : withBasePath(it.image.src)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
                {it.kind === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white">
                      <Play className="size-4 translate-x-px" aria-hidden="true" fill="currentColor" />
                    </span>
                  </span>
                )}
                <span className="sr-only">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 이미지 크게 보기 */}
      <dialog
        ref={dialogRef}
        aria-label="이미지 크게 보기"
        onClose={() => setZoomed(false)}
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        onKeyDown={(e) => {
          if (current.kind !== "image" || imageItems.length < 2) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const pos = imageItems.indexOf(current);
            const next = imageItems[(pos + (e.key === "ArrowRight" ? 1 : -1) + imageItems.length) % imageItems.length];
            if (next) select(items.indexOf(next));
          }
        }}
        className="m-auto max-h-[92dvh] w-[min(92vw,96rem)] bg-transparent p-0 text-fg backdrop:bg-black/85"
      >
        {zoomed && current.kind === "image" && (
          <figure className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <figcaption className="text-sm text-fg-muted">{current.image.caption ?? current.image.alt}</figcaption>
              <button type="button" onClick={() => dialogRef.current?.close()} className={iconBtn} autoFocus>
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">닫기</span>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(current.image.src)} alt={current.label} className="max-h-[80dvh] w-full rounded-card object-contain" />
          </figure>
        )}
      </dialog>
    </div>
  );
}
