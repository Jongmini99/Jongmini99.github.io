import Link from "next/link";
import { ChevronLeft, Calendar, Gamepad2, Layers, User, Users } from "lucide-react";
import type { Project } from "@/content/schema";
import { MediaImage } from "@/components/ui/Media";
import { Container } from "@/components/layout/Container";
import { formatPeriod } from "@/lib/format";
import { cx } from "@/lib/cx";

/** 상세 페이지 헤더: 대표 이미지 + 제목 + 메타 정보 띠 */
export function ProjectHeader({ project }: { project: Project }) {
  const image = project.heroImage ?? project.thumbnail;
  const meta = [
    { icon: Layers, label: "플랫폼", value: project.platform },
    { icon: Gamepad2, label: "장르", value: project.genre },
    project.developmentPeriod ? { icon: Calendar, label: "개발 기간", value: formatPeriod(project.developmentPeriod) } : null,
    project.teamSize ? { icon: Users, label: "팀 규모", value: `${project.teamSize}명` } : null,
    project.roles.length > 0 ? { icon: User, label: "담당 역할", value: project.roles.join(" · "), wide: true } : null,
  ].filter((m) => m !== null);

  return (
    <header className="relative overflow-hidden border-b border-line">
      {/* 배경 이미지: 오른쪽에 배치하고 왼쪽으로 그라데이션 */}
      {/* 이미지 미등록 시 모바일에서는 텍스트와 겹치지 않도록 플레이스홀더를 숨긴다 */}
      <div className={cx("absolute inset-0 lg:left-[35%]", !image && "hidden lg:block")}>
        <MediaImage image={image} decorative priority placeholderLabel="헤더 이미지 준비 중" className="opacity-90" />
        <div className="absolute inset-0 bg-linear-to-r from-bg via-bg/70 to-bg/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent" aria-hidden="true" />
      </div>

      <Container className="relative flex flex-col gap-8 pt-8 pb-8 sm:pt-10">
        <Link href="/projects/" className="inline-flex w-fit items-center gap-1 text-sm text-fg-muted hover:text-fg">
          <ChevronLeft className="size-4" aria-hidden="true" />
          프로젝트 목록으로
        </Link>

        <div className="flex max-w-xl flex-col gap-4 pt-8 pb-4 sm:pt-16 sm:pb-8">
          <h1 className="text-display font-bold tracking-[-0.05em] text-fg">{project.title}</h1>
          <p className="text-xl font-semibold text-accent-text">{project.genre}</p>
          {project.subtitle && <p className="border-l-2 border-accent pl-4 text-lg text-fg-muted">{project.subtitle}</p>}
        </div>

        <ul aria-label="프로젝트 정보" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,auto))_minmax(0,1fr)]">
          {meta.map((m) => (
            <li
              key={m.label}
              className={cx(
                "flex items-center gap-3 rounded-card border border-line bg-surface/85 px-4 py-3 backdrop-blur-sm",
                "wide" in m && m.wide && "col-span-2 sm:col-span-4 lg:col-span-1",
              )}
            >
              <m.icon className="size-5 shrink-0 text-fg-muted" aria-hidden="true" strokeWidth={1.5} />
              <p className="flex min-w-0 flex-col">
                <span className="text-xs text-fg-subtle">
                  {m.label}
                  <span className="sr-only">:</span>
                </span>
                <span className="text-sm font-semibold text-fg">{m.value}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </header>
  );
}
