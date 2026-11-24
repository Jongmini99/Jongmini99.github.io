"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { z } from "zod";
import type { VideoSchema } from "@/content/schema";
import { MediaPlaceholder } from "@/components/ui/Media";
import { parseYouTubeId, youTubeEmbedUrl, youTubeThumbnailUrl } from "@/lib/youtube";
import { PLAY_TRAILER_EVENT } from "@/components/project/TrailerButton";

type Video = z.infer<typeof VideoSchema>;

/**
 * 클릭 전까지 iframe을 로드하지 않는 YouTube 재생 영역 (성능·개인정보).
 * 부모가 relative + 비율(aspect-video)을 정해 주면 그 안을 꽉 채운다.
 */
export function YouTubeFrame({
  video,
  thumbnail = "hq",
  listenPlayEvent,
}: {
  video: Video;
  thumbnail?: "hq" | "maxres";
  /** true면 히어로 트레일러 버튼의 재생 요청(PLAY_TRAILER_EVENT)을 받아 바로 재생하고 플레이어로 포커스를 옮긴다 */
  listenPlayEvent?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [focusOnLoad, setFocusOnLoad] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const id = parseYouTubeId(video.youtubeUrl);

  useEffect(() => {
    if (!listenPlayEvent) return;
    const play = () => {
      setActive(true);
      setFocusOnLoad(true);
    };
    window.addEventListener(PLAY_TRAILER_EVENT, play);
    return () => window.removeEventListener(PLAY_TRAILER_EVENT, play);
  }, [listenPlayEvent]);

  useEffect(() => {
    if (active && focusOnLoad) frameRef.current?.focus({ preventScroll: true });
  }, [active, focusOnLoad]);

  if (!id) return null;

  return active ? (
          <iframe
            ref={frameRef}
            src={`${youTubeEmbedUrl(id)}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
  ) : (
    <button type="button" onClick={() => setActive(true)} className="group absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={youTubeThumbnailUrl(id, thumbnail)} alt="" loading="lazy" className="size-full object-cover opacity-80" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent-solid text-accent-fg transition-colors duration-150 group-hover:bg-accent-solid-hover">
          <Play className="size-7 translate-x-0.5" aria-hidden="true" fill="currentColor" />
        </span>
      </span>
      <span className="sr-only">영상 재생: {video.title}</span>
    </button>
  );
}

function LiteYouTube({ video }: { video: Video }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-video overflow-hidden rounded-card border border-line bg-surface">
        <YouTubeFrame video={video} />
      </div>
      <figcaption>
        <span className="font-semibold text-fg">{video.title}</span>
        {video.description && <span className="mt-0.5 block text-sm text-fg-subtle">{video.description}</span>}
      </figcaption>
    </figure>
  );
}

export function Videos({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return (
      <div className="aspect-video max-w-2xl overflow-hidden rounded-card border border-line">
        <MediaPlaceholder label="플레이 영상 준비 중" />
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {videos.map((v, i) => (
        <LiteYouTube key={`${v.youtubeUrl}-${i}`} video={v} />
      ))}
    </div>
  );
}
