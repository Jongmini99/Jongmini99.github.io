import Link from "next/link";
import { ChevronRight, Calendar, Gamepad2, Layers, User, Users } from "lucide-react";
import type { Project } from "@/content/schema";
import { MediaImage } from "@/components/ui/Media";
import { ProjectBackLink } from "./ProjectOrigin";
import { PlayBuildButton, PlayBuildNote } from "./PlayBuild";
import { PlayLinkButton } from "./PlayLink";
import { MediaShowcase } from "./MediaShowcase";
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
    project.roleSummary || project.roles.length > 0
      ? { icon: User, label: "담당 역할", value: project.roleSummary ?? project.roles.join(" · "), wide: true }
      : null,
  ].filter((m) => m !== null);

  // 영상·스크린샷이 있는 게임·AI 프로젝트: 스팀 상점 페이지처럼 왼쪽 미디어 + 오른쪽 정보
  if (project.track !== "document" && (project.videos.length > 0 || project.gallery.length > 0)) {
    return (
      <header className="relative overflow-hidden border-b border-line bg-bg-alt">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-32 size-[32rem] rounded-full bg-accent/10 blur-3xl" />
        </div>
        <Container className="relative flex flex-col gap-6 pt-8 pb-10 sm:pt-10">
          <div className="flex flex-col gap-3">
            <Breadcrumb title={project.title} />
            <ProjectBackLink slug={project.slug} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-10">
            <MediaShowcase videos={project.videos} images={project.gallery} title={project.title} />

            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-col gap-3">
                <h1 className="text-[clamp(1.9rem,1.4rem+1.6vw,2.75rem)] leading-[1.15] font-bold tracking-[-0.04em] text-balance text-fg">
                  {project.title}
                </h1>
                <p className="text-lg font-semibold text-accent-text">{project.genre}</p>
                {project.subtitle && <p className="border-l-2 border-accent pl-4 text-base text-fg-muted">{project.subtitle}</p>}
              </div>

              <dl aria-label="프로젝트 정보" className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface/70">
                {meta.map((m) => (
                  <div key={m.label} className="flex items-start gap-3 px-4 py-3">
                    <m.icon className="mt-0.5 size-5 shrink-0 text-fg-muted" aria-hidden="true" strokeWidth={1.5} />
                    <dt className="w-16 shrink-0 text-sm text-fg-muted">{m.label}</dt>
                    <dd className="min-w-0 text-sm font-semibold text-fg">{m.value}</dd>
                  </div>
                ))}
              </dl>

              {project.playUrl && <PlayLinkButton url={project.playUrl} className="self-start" />}
              {project.playBuild && (
                <div className="flex flex-col items-start gap-3">
                  <PlayBuildButton build={project.playBuild} idPrefix="project" variant="primary" />
                  <PlayBuildNote build={project.playBuild} idPrefix="project" showNote />
                </div>
              )}
            </div>
          </div>
        </Container>
      </header>
    );
  }

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
        <div className="flex flex-col gap-3">
          <Breadcrumb title={project.title} />
          <ProjectBackLink slug={project.slug} />
        </div>

        <div className="flex max-w-xl flex-col gap-4 pt-8 pb-4 sm:pt-16 sm:pb-8">
          <h1 className="text-display font-bold tracking-[-0.05em] text-fg">{project.title}</h1>
          <p className="text-xl font-semibold text-accent-text">{project.genre}</p>
          {project.subtitle && <p className="border-l-2 border-accent pl-4 text-lg text-fg-muted">{project.subtitle}</p>}
          {project.playUrl && (
            <div className="pt-2">
              <PlayLinkButton url={project.playUrl} />
            </div>
          )}
          {project.playBuild && (
            <div className="flex flex-col items-start gap-3 pt-2">
              <PlayBuildButton build={project.playBuild} idPrefix="project" variant="primary" />
              <PlayBuildNote build={project.playBuild} idPrefix="project" showNote />
            </div>
          )}
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

/** 현재 위치: 소개 › 프로젝트 › 이 프로젝트 */
function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="현재 위치">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
        <li>
          <Link href="/#top" className="hover:text-fg">
            소개
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3.5" />
        </li>
        <li>
          <Link href="/projects/" className="hover:text-fg">
            프로젝트
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3.5" />
        </li>
        <li aria-current="page" className="font-semibold text-fg">
          {title}
        </li>
      </ol>
    </nav>
  );
}
