import Link from "next/link";
import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";
import type { Project } from "@/content/schema";
import { MediaImage } from "@/components/ui/Media";
import { DividedList } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { formatPeriod } from "@/lib/format";
import { cx } from "@/lib/cx";

const href = (p: Project) => `/projects/${p.slug}/`;

/**
 * 홈 강조 섹션: 대표 프로젝트를 네이비 배경 위에 크게 소개한다.
 * 이미지는 상세 헤더 이미지 → 대표 이미지 → 플레이스홀더 순.
 */
export function FeaturedBand({ project, id }: { project: Project; id: string }) {
  const image = project.heroImage ?? project.thumbnail;
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="relative overflow-hidden bg-band py-section">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[30rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-24 -bottom-40 size-[34rem] rounded-full bg-accent/10 blur-3xl" />
      </div>
      <Container className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-semibold tracking-wide text-accent-text">{project.platform}</p>
            <h2 id={headingId} className="text-display font-bold tracking-[-0.05em] text-fg">
              {project.title}
            </h2>
            <p className="text-xl font-semibold tracking-[-0.02em] text-fg sm:text-2xl">
              <span className="text-accent-text">{project.genre}</span>
              {project.developmentType && <span className="text-fg-muted"> · {project.developmentType}</span>}
            </p>
          </div>
          {(project.subtitle || project.description) && (
            <p className="max-w-xl leading-[1.85] text-fg-muted">{project.subtitle ?? project.description}</p>
          )}
          {project.achievements.length > 0 && (
            <ul aria-label="주요 성과" className="flex flex-col gap-2">
              {project.achievements.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[0.95rem] text-fg">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
                  <span>
                    {a.title}
                    {a.date && <span className="ml-2 font-display text-sm text-fg-muted">{a.date}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {project.roles.length > 0 && (
            <div className="border-t border-band-line pt-5">
              <p className="sr-only">담당 역할</p>
              <DividedList items={project.roles} />
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <ButtonLink href={href(project)} variant="primary">
              프로젝트 상세 보기
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            {project.externalLinks.slice(0, 2).map((l) => (
              <ButtonLink key={l.url} href={l.url} variant="outline" showExternalIcon>
                {l.label}
              </ButtonLink>
            ))}
          </div>
        </div>

        <div className="block overflow-hidden rounded-card border border-band-line shadow-[0_28px_65px_rgb(0_0_0/0.45)] transition-transform duration-300 motion-safe:lg:rotate-[1.5deg] motion-safe:lg:hover:rotate-0">
          <div className="aspect-video">
            <MediaImage image={image} decorative placeholderLabel="대표 이미지 준비 중" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * 프로젝트 이미지 타일: 이미지 위에 플랫폼 배지와 제목·기간을 얹는다.
 * 카드 전체 클릭 영역은 제목 링크의 ::after 로 확장 — 링크는 하나만 존재한다.
 */
export function ProjectTile({ project, wide, headingLevel = "h3" }: { project: Project; wide?: boolean; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article
      className={cx(
        "group relative isolate overflow-hidden rounded-card border border-line bg-surface",
        "transition-[transform,border-color] duration-200 focus-within:border-accent hover:border-accent/60 motion-safe:hover:-translate-y-1",
      )}
    >
      <div className={cx("aspect-[3/2]", wide && "md:aspect-[21/9]")}>
        <MediaImage
          image={project.thumbnail}
          decorative
          placeholderLabel="대표 이미지 준비 중"
          className="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-5 sm:p-6">
        <span className="inline-flex w-fit items-center rounded-md border border-white/20 bg-bg/70 px-2.5 py-1 text-xs font-bold text-fg backdrop-blur-sm">
          {project.platform}
        </span>
        <H className="text-xl font-bold tracking-[-0.03em] text-fg sm:text-2xl">
          <Link href={href(project)} className="outline-none after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
          {project.developmentPeriod && (
            <span className="ml-2 align-middle font-display text-sm font-medium tracking-normal whitespace-nowrap text-fg-muted">
              {formatPeriod(project.developmentPeriod)}
            </span>
          )}
        </H>
        <p className={cx("text-sm text-fg-muted", !wide && "line-clamp-1")}>{project.genre} — {project.description}</p>
      </div>
      <ArrowUpRight
        aria-hidden="true"
        className="absolute top-5 right-5 size-9 rounded-full bg-bg/70 p-2 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
      />
    </article>
  );
}

/** 프로젝트 수에 맞춘 타일 그리드 (1개: 넓게, 2개: 2열, 3개 이상: 3열) */
export function ProjectGrid({ projects, headingLevel }: { projects: Project[]; headingLevel?: "h2" | "h3" }) {
  const n = projects.length;
  return (
    <ul className={cx("grid gap-5", n === 2 && "md:grid-cols-2", n >= 3 && "md:grid-cols-2 lg:grid-cols-3")}>
      {projects.map((p) => (
        <li key={p.id}>
          <ProjectTile project={p} wide={n === 1} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
