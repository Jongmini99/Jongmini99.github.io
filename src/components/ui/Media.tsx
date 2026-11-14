import { ImageOff } from "lucide-react";
import type { z } from "zod";
import type { ImageSchema } from "@/content/schema";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type Image = z.infer<typeof ImageSchema>;

/**
 * 이미지 미등록 영역.
 * 실제 게임 자료로 오해되지 않도록 그래픽 없이 패턴 + "준비 중" 문구만 표시한다.
 */
export function MediaPlaceholder({ label = "이미지 준비 중", className }: { label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cx(
        "flex size-full flex-col items-center justify-center gap-2 bg-surface text-fg-subtle",
        "bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgb(255_255_255/0.025)_14px_15px)]",
        className,
      )}
    >
      <ImageOff className="size-6" aria-hidden="true" strokeWidth={1.5} />
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}

type MediaImageProps = {
  image: Image | undefined;
  className?: string;
  placeholderLabel?: string;
  /** 첫 화면 이미지는 eager */
  priority?: boolean;
  /** 장식용이면 alt를 비운다 (인접 텍스트가 같은 정보를 전달할 때) */
  decorative?: boolean;
  /** CMS에서 대체 텍스트를 비워 둔 경우 사용할 문맥 기반 설명 */
  fallbackAlt?: string;
};

/** CMS 이미지 렌더링. 이미지가 없으면 플레이스홀더. 부모가 크기/비율을 정한다. */
export function MediaImage({ image, className, placeholderLabel, priority, decorative, fallbackAlt }: MediaImageProps) {
  if (!image) return <MediaPlaceholder label={placeholderLabel} className={className} />;
  return (
    // 정적 내보내기 환경이므로 next/image 최적화 대신 일반 img 사용
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={withBasePath(image.src)}
      alt={decorative ? "" : (image.alt ?? image.caption ?? fallbackAlt ?? "")}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cx("size-full object-cover", className)}
    />
  );
}
