import { Download } from "lucide-react";
import type { Project } from "@/content/schema";
import { ButtonLink } from "@/components/ui/Button";

type PlayBuildData = NonNullable<Project["playBuild"]>;

/** 플레이 빌드 다운로드 버튼 + 안내 한 줄 (홈 대표 화면·상세 헤더 공용) */
export function PlayBuildButton({
  build,
  idPrefix,
  variant = "outline",
}: {
  build: PlayBuildData;
  idPrefix: string;
  variant?: "primary" | "outline";
}) {
  return (
    <ButtonLink
      href={build.url}
      download
      variant={variant}
      aria-describedby={`${idPrefix}-play-build-note`}
    >
      <Download className="size-4" aria-hidden="true" />
      게임 다운로드
    </ButtonLink>
  );
}

/** 버튼 아래 안내 문구. showNote면 note(보안 경고 대처법 등)까지 표시 */
export function PlayBuildNote({
  build,
  idPrefix,
  showNote = false,
}: {
  build: PlayBuildData;
  idPrefix: string;
  showNote?: boolean;
}) {
  return (
    <p id={`${idPrefix}-play-build-note`} className="text-sm leading-relaxed text-fg-muted">
      {build.platform} · ZIP {build.size} · 압축을 푼 뒤 README.txt를 확인해 주세요.
      {showNote && build.note && (
        <>
          <br />
          {build.note}
        </>
      )}
    </p>
  );
}
