import Link from "next/link";
import { ArrowRight, Calendar, Users } from "lucide-react";
import type { Project } from "@/content/schema";
import { MediaImage } from "@/components/ui/Media";
import { DividedList, Tag } from "@/components/ui/Badge";
import { formatPeriod } from "@/lib/format";

const href = (p: Project) => `/projects/${p.slug}/`;

/**
 * 메인 대표 프로젝트 카드 (가로형).
 * 카드 전체 클릭 영역은 제목 링크의 ::after 로 확장 — 링크는 하나만 존재한다.
 */
export function FeaturedProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group relative grid overflow-hidden rounded-card border border-line bg-surface transition-colors duration-150 focus-within:border-accent hover:border-accent/60 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="aspect-video md:aspect-auto md:min-h-60">
        <MediaImage image={project.thumbnail} decorative placeholderLabel="대표 이미지 준비 중" />
      </div>
      <div className="relative flex flex-col gap-4 p-6 sm:p-8">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-display font-semibold uppercase tracking-wide text-accent-text">{project.platform}</span>
          <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
          <span className="text-fg-muted">{project.genre}</span>
        </p>
        <H className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          <Link href={href(project)} className="outline-none after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </H>
        <p className="text-fg-muted">{project.subtitle ?? project.description}</p>
        {project.roles.length > 0 && <DividedList items={project.roles} className="mt-auto pt-2" />}
        <span className="inline-flex items-center gap-2 self-end text-sm font-semibold text-accent-text">
          프로젝트 상세보기
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

/** 프로젝트 목록 카드 (세로형) */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors duration-150 focus-within:border-accent hover:border-accent/60">
      <div className="aspect-video">
        <MediaImage image={project.thumbnail} decorative placeholderLabel="대표 이미지 준비 중" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap gap-2">
          <Tag tone="accent">{project.genre}</Tag>
          <Tag>{project.platform}</Tag>
        </div>
        <h2 className="text-2xl font-bold text-fg">
          <Link href={href(project)} className="outline-none after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </h2>
        <p className="text-fg-muted">{project.description}</p>
        <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg-muted">
          <div className="flex items-center gap-1.5">
            <dt>
              <Calendar className="size-4" aria-hidden="true" />
              <span className="sr-only">개발 기간</span>
            </dt>
            <dd>{formatPeriod(project.developmentPeriod)}</dd>
          </div>
          {project.teamSize && (
            <div className="flex items-center gap-1.5">
              <dt>
                <Users className="size-4" aria-hidden="true" />
                <span className="sr-only">참여 인원</span>
              </dt>
              <dd>{project.teamSize}명</dd>
            </div>
          )}
        </dl>
        {project.roles.length > 0 && (
          <div className="mt-auto border-t border-line pt-4">
            <p className="sr-only">담당 역할</p>
            <DividedList items={project.roles} />
          </div>
        )}
      </div>
    </article>
  );
}
