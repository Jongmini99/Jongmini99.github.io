import { Play } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/** 웹 플레이 페이지로 이동하는 '플레이하기' 버튼 (새 창, 상세 헤더) */
export function PlayLinkButton({ url, className }: { url: string; className?: string }) {
  return (
    <ButtonLink href={url} variant="primary" className={className}>
      <Play className="size-4" aria-hidden="true" />
      플레이하기
    </ButtonLink>
  );
}
