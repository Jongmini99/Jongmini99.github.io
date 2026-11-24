import Link from "next/link";
import type React from "react";
import { ArrowRight, ArrowUpRight, Check, CircleAlert, Sparkles, Trophy, User, Wrench } from "lucide-react";
import type { Project, ProjectTrack } from "@/content/schema";
import { MediaImage } from "@/components/ui/Media";
import { YouTubeFrame } from "@/components/sections/Videos";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { formatPeriod } from "@/lib/format";
import { cx } from "@/lib/cx";
import { withBasePath } from "@/lib/base-path";

const href = (p: Project) => `/projects/${p.slug}/`;

/** 흐름 단계 라벨의 "(본인)" / "(AI)" 표기를 읽어 단계 주체를 구분한다. */
function splitActor(label: string): { name: string; actor?: "human" | "ai" } {
  const m = label.match(/^(.*?)\s*\((본인|AI)\)\s*$/);
  if (!m) return { name: label };
  return { name: m[1]!, actor: m[2] === "AI" ? "ai" : "human" };
}

/**
 * 홈 대표 프로젝트 화면 (첫 화면 다음 두 번째 화면).
 * 제목은 작게, 강조할 내용(한 줄 소개·핵심 성과 불릿·작업 흐름)은 크게 보여 준다.
 * 비주얼은 YouTube 영상(videos 첫 번째, 클릭 시 재생) → 무음 반복 영상(heroVideo) → 상세 헤더 이미지 → 대표 이미지 순.
 * 작업 흐름은 상세 페이지의 첫 흐름 도표(flow) 섹션을 그대로 가져온다.
 */
export function FeaturedBand({ project, id }: { project: Project; id: string }) {
  const image = project.heroImage ?? project.thumbnail;
  const headingId = `${id}-title`;
  const flow = project.sections.find((s): s is Extract<Project["sections"][number], { type: "flow" }> => s.type === "flow" && s.visible);
  const youtube = project.videos[0];
  const video = project.heroVideo;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="relative flex items-center overflow-hidden bg-band py-section lg:min-h-[calc(100svh-var(--spacing-header))] lg:snap-start lg:py-14"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[30rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-24 -bottom-40 size-[34rem] rounded-full bg-accent/10 blur-3xl" />
      </div>
      <Container className="relative flex flex-col gap-10 lg:gap-12">
        {/* 제목 줄: 작게 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="rounded-full bg-accent-solid px-3 py-1 text-sm font-bold text-accent-fg">대표 프로젝트</span>
          <h2 id={headingId} className="text-lg font-bold tracking-[-0.02em] text-fg sm:text-xl">
            {project.title}
          </h2>
          <p className="text-sm text-fg-muted">
            {project.genre}
            {project.developmentPeriod && <span className="font-display"> · {formatPeriod(project.developmentPeriod)}</span>}
          </p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="flex flex-col gap-7">
            {(project.subtitle || project.description) && (
              <p className="text-[clamp(1.75rem,1.2rem+1.8vw,2.6rem)] leading-[1.25] font-bold tracking-[-0.04em] text-balance text-fg">
                {project.subtitle ?? project.description}
              </p>
            )}
            {project.highlights.length > 0 && (
              <ul aria-label="핵심 성과" className="flex flex-col gap-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-lg leading-snug text-fg">
                    <Check className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden="true" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
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

          <div className="overflow-hidden rounded-card border border-band-line shadow-[0_28px_65px_rgb(0_0_0/0.45)]">
            <div className="relative aspect-video bg-surface">
              {youtube ? (
                <YouTubeFrame video={youtube} thumbnail="maxres" />
              ) : video ? (
                <>
                  {/* 동작 줄이기 설정이면 영상 대신 정지 화면을 보여 준다 */}
                  <video
                    className="size-full object-cover motion-reduce:hidden"
                    src={withBasePath(video.src)}
                    poster={video.poster ? withBasePath(video.poster.src) : undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${project.title} 플레이 영상 (소리 없음)`}
                  />
                  <div className="hidden size-full motion-reduce:block">
                    <MediaImage image={video.poster ?? image} decorative />
                  </div>
                </>
              ) : (
                <MediaImage image={image} decorative placeholderLabel="대표 이미지 준비 중" />
              )}
            </div>
          </div>
        </div>

        {/* 작업 흐름: 사람(결정·검증)과 AI(설계·제작·검사)를 구분해 보여 준다 */}
        {flow && flow.steps.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-band-line pt-8">
            <h3 className="text-base font-bold text-fg">{flow.title}</h3>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ "--n": flow.steps.length } as React.CSSProperties}>
              {flow.steps.map((step, i) => {
                const { name, actor } = splitActor(step.label);
                const human = actor === "human";
                return (
                  <li
                    key={i}
                    className={cx(
                      "flex min-w-0 flex-col gap-2 rounded-inner border p-4",
                      human ? "border-accent/60 bg-accent-soft" : "border-band-line bg-bg/40",
                    )}
                  >
                    <p className="flex items-center gap-2">
                      {actor && (
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                            human ? "bg-accent-solid text-accent-fg" : "bg-surface-raised text-fg-muted",
                          )}
                        >
                          {human ? <User className="size-3" aria-hidden="true" /> : <Sparkles className="size-3" aria-hidden="true" />}
                          {human ? "본인" : "AI"}
                        </span>
                      )}
                      <span className="text-sm font-bold text-fg">
                        <span className="sr-only">{i + 1}단계: </span>
                        {name}
                      </span>
                    </p>
                    <p className="text-sm leading-snug text-fg-muted">{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </Container>
    </section>
  );
}

type HeadingLevel = "h2" | "h3" | "h4";

const TAKEAWAY_ROWS = [
  { key: "problem", label: "문제", icon: CircleAlert },
  { key: "solution", label: "해결", icon: Wrench },
  { key: "result", label: "결과", icon: Trophy },
] as const;

/** 카드 3단 요약: 문제 → 해결 → 결과를 세로 단계 도표로 잇는다. 결과 단계 강조. */
function KeyTakeaways({ takeaways }: { takeaways: NonNullable<Project["keyTakeaways"]> }) {
  return (
    <ol aria-label="문제 → 해결 → 결과 요약" className="flex flex-col border-t border-line pt-4">
      {TAKEAWAY_ROWS.map(({ key, label, icon: StepIcon }, i) => {
        const result = key === "result";
        return (
          <li key={key} className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 pb-3 last:pb-0">
            {i < TAKEAWAY_ROWS.length - 1 && (
              <span aria-hidden="true" className="absolute top-7 bottom-0 left-[0.8125rem] w-px bg-line-strong" />
            )}
            <span
              aria-hidden="true"
              className={cx(
                "relative flex size-7 items-center justify-center rounded-full",
                result ? "bg-accent-solid text-accent-fg" : "bg-surface-raised text-fg-muted",
              )}
            >
              <StepIcon className="size-3.5" />
            </span>
            <div className="flex min-w-0 flex-col pt-0.5">
              <p className={cx("text-xs font-bold", result ? "text-accent-text" : "text-fg-subtle")}>{label}</p>
              <p className={cx("text-sm leading-snug", result ? "font-semibold text-fg" : "text-fg-muted")}>{takeaways[key]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * 프로젝트 카드: 이미지 + 제목 + 3단 요약(있으면) 또는 짧은 소개.
 * 카드 전체 클릭 영역은 제목 링크의 ::after 로 확장 — 링크는 하나만 존재한다.
 */
export function ProjectTile({
  project,
  wide,
  compact,
  headingLevel = "h3",
}: {
  project: Project;
  wide?: boolean;
  /** 홈 한 화면 배치용: 여백·글자 크기를 줄인다 (데스크톱만) */
  compact?: boolean;
  headingLevel?: HeadingLevel;
}) {
  const H = headingLevel;
  return (
    <article
      className={cx(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface",
        "transition-[transform,border-color] duration-200 focus-within:border-accent hover:border-accent/60 motion-safe:hover:-translate-y-1",
      )}
    >
      <div className={cx("relative aspect-[16/9] overflow-hidden", wide && "md:aspect-[21/9]", compact && "lg:aspect-[2/1]")}>
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
      <div className={cx("flex flex-1 flex-col gap-4 p-5 sm:p-6", compact && "lg:gap-3 lg:p-5")}>
        <div className="flex flex-col gap-1.5">
          {project.tagline ? (
            /* 한줄 요약을 크게, 프로젝트 이름·기간은 그 위에 작게 */
            <H className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-fg-muted">
                {project.title}
                {project.developmentPeriod && (
                  <span className="ml-2 font-display font-medium whitespace-nowrap">{formatPeriod(project.developmentPeriod)}</span>
                )}
              </span>
              <Link
                href={href(project)}
                className={cx(
                  "text-xl leading-snug font-bold tracking-[-0.03em] text-balance text-fg outline-none after:absolute after:inset-0 after:content-['']",
                  compact && "lg:text-lg",
                )}
              >
                {project.tagline}
              </Link>
            </H>
          ) : (
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
          )}
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
export function ProjectGrid({
  projects,
  headingLevel,
  compact,
}: {
  projects: Project[];
  headingLevel?: HeadingLevel;
  /** 홈 한 화면 배치: 4개면 데스크톱에서 한 줄 4열 */
  compact?: boolean;
}) {
  const n = projects.length;
  return (
    <ul
      className={cx(
        "grid gap-5",
        n === 2 && "md:grid-cols-2",
        n >= 3 && "md:grid-cols-2 lg:grid-cols-3",
        compact && n >= 4 && "lg:grid-cols-4",
      )}
    >
      {projects.map((p) => (
        <li key={p.id} className="min-w-0">
          <ProjectTile project={p} wide={n === 1 && !compact} compact={compact} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

export const TRACKS: { key: ProjectTrack; title: string; description: string }[] = [
  {
    key: "ai",
    title: "AI 프로젝트",
    description: "기획과 검수는 직접 맡고, 구현은 AI와 협업해 만든 프로젝트",
  },
  {
    key: "game",
    title: "기획/개발을 직접 진행한 프로젝트",
    description: "직접 기획하고 엔진으로 개발해 출시·수상까지 이어진 프로젝트",
  },
  {
    key: "document",
    title: "게임 디자인 문서 작성",
    description: "시스템 역기획, 지표·BM 분석, 출시 가격 제안 문서",
  },
];
