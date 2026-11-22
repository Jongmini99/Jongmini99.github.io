import Link from "next/link";
import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";
import type { Project, ProjectTrack } from "@/content/schema";
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

type HeadingLevel = "h2" | "h3" | "h4";

const TAKEAWAY_ROWS = [
  { key: "problem", label: "문제" },
  { key: "solution", label: "해결" },
  { key: "result", label: "결과" },
] as const;

/** 카드 3단 요약: 기획 의도/문제 → 구현/해결 → 검증 결과 */
function KeyTakeaways({ takeaways }: { takeaways: NonNullable<Project["keyTakeaways"]> }) {
  return (
    <dl className="flex flex-col gap-2.5 border-t border-line pt-4">
      {TAKEAWAY_ROWS.map(({ key, label }) => (
        <div key={key} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-2">
          <dt
            className={cx(
              "rounded-md px-1.5 py-0.5 text-center text-xs font-bold",
              key === "result" ? "bg-accent-solid text-accent-fg" : "bg-surface-raised text-fg-muted",
            )}
          >
            {label}
          </dt>
          <dd className={cx("text-sm leading-relaxed", key === "result" ? "font-medium text-fg" : "text-fg-muted")}>
            {takeaways[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * 프로젝트 카드: 이미지 + 제목 + 3단 요약(있으면) 또는 짧은 소개.
 * 카드 전체 클릭 영역은 제목 링크의 ::after 로 확장 — 링크는 하나만 존재한다.
 */
export function ProjectTile({ project, wide, headingLevel = "h3" }: { project: Project; wide?: boolean; headingLevel?: HeadingLevel }) {
  const H = headingLevel;
  return (
    <article
      className={cx(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface",
        "transition-[transform,border-color] duration-200 focus-within:border-accent hover:border-accent/60 motion-safe:hover:-translate-y-1",
      )}
    >
      <div className={cx("relative aspect-[16/9] overflow-hidden", wide && "md:aspect-[21/9]")}>
        <MediaImage
          image={project.thumbnail}
          decorative
          placeholderLabel="대표 이미지 준비 중"
          className="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 inline-flex max-w-[calc(100%-2rem)] items-center rounded-md border border-white/20 bg-bg/80 px-2.5 py-1 text-xs font-bold text-fg backdrop-blur-sm">
          {project.platform}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="absolute top-4 right-4 size-9 rounded-full bg-bg/70 p-2 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <H className="text-xl leading-snug font-bold tracking-[-0.03em] text-fg">
            <Link href={href(project)} className="outline-none after:absolute after:inset-0 after:content-['']">
              {project.title}
            </Link>
            {project.developmentPeriod && (
              <span className="ml-2 align-middle font-display text-sm font-medium tracking-normal whitespace-nowrap text-fg-muted">
                {formatPeriod(project.developmentPeriod)}
              </span>
            )}
          </H>
          <p className="text-sm text-accent-text">{project.genre}</p>
        </div>
        {project.keyTakeaways ? (
          <KeyTakeaways takeaways={project.keyTakeaways} />
        ) : (
          <p className="text-sm leading-relaxed text-fg-muted">{project.description}</p>
        )}
      </div>
    </article>
  );
}

/** 프로젝트 수에 맞춘 카드 그리드 (1개: 넓게, 2개: 2열, 3개 이상: 3열) */
export function ProjectGrid({ projects, headingLevel }: { projects: Project[]; headingLevel?: HeadingLevel }) {
  const n = projects.length;
  return (
    <ul className={cx("grid gap-5", n === 2 && "md:grid-cols-2", n >= 3 && "md:grid-cols-2 lg:grid-cols-3")}>
      {projects.map((p) => (
        <li key={p.id} className="min-w-0">
          <ProjectTile project={p} wide={n === 1} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

const TRACKS: { key: ProjectTrack; title: string; description: string }[] = [
  {
    key: "game",
    title: "게임 기획 & 프로토타입",
    description: "직접 기획하고 엔진으로 만들어 보며 플레이로 검증한 게임 프로젝트",
  },
  {
    key: "document",
    title: "기획서 & 역기획·분석",
    description: "시스템 역기획, 지표·BM 분석, 출시 가격 제안 문서",
  },
];

/**
 * 홈 프로젝트 영역: 분류(track)별로 위아래 블록으로 나눠 보여 준다.
 * 분류가 없는 프로젝트는 마지막에 제목 없이 이어서 표시한다.
 */
export function TrackedProjects({ projects, idPrefix = "track" }: { projects: Project[]; idPrefix?: string }) {
  const groups = TRACKS.map((t) => ({ ...t, items: projects.filter((p) => p.track === t.key) })).filter((g) => g.items.length > 0);
  const rest = projects.filter((p) => !p.track);
  if (groups.length === 0) return <ProjectGrid projects={projects} />;
  return (
    <div className="flex flex-col gap-14">
      {groups.map((g, i) => {
        const headingId = `${idPrefix}-${g.key}`;
        return (
          <section key={g.key} aria-labelledby={headingId} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-4">
              <h3 id={headingId} className="flex items-baseline gap-3 text-2xl font-bold tracking-[-0.03em] text-fg">
                <span aria-hidden="true" className="font-display text-base font-semibold text-accent-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {g.title}
              </h3>
              <p className="text-sm text-fg-muted">{g.description}</p>
            </div>
            <ProjectGrid projects={g.items} headingLevel="h4" />
          </section>
        );
      })}
      {rest.length > 0 && <ProjectGrid projects={rest} />}
    </div>
  );
}
