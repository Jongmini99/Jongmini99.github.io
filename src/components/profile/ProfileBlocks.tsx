/**
 * 사이트 정보(프로필·성과·연락처) 표시 블록 — 홈 한 페이지 섹션에서 사용
 */
import { ArrowRight } from "lucide-react";
import type { Awards, Career, Profile, Project } from "@/content/schema";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, hasIcon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/Media";
import { Tag } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type AwardItem = Awards["items"][number];

const CATEGORY_ICON: Record<AwardItem["category"], string> = {
  award: "trophy",
  release: "rocket",
  exhibition: "gamepad",
  career: "briefcase",
  other: "award",
};

export const CATEGORY_LABEL: Record<AwardItem["category"], string> = {
  award: "수상",
  release: "출시",
  exhibition: "전시",
  career: "경력",
  other: "기타",
};

/** 히어로 성과 배지: highlight 표시된 수상·출시·경력을 아이콘 알약으로 한 줄에 보여 준다. */
export function HeroProofBadges({ items }: { items: AwardItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label="주요 성과" className="flex flex-wrap gap-2.5">
      {items.map((a) => (
        <li
          key={a.title}
          className="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/70 py-1.5 pr-4 pl-1.5 text-[0.95rem] font-semibold text-fg"
        >
          <span
            className={cx(
              "flex size-8 items-center justify-center rounded-full",
              a.category === "award" ? "bg-accent-solid text-accent-fg" : "bg-surface-raised text-accent-text",
            )}
          >
            <Icon name={CATEGORY_ICON[a.category]} className="size-4" />
          </span>
          <span>
            <span className="sr-only">{CATEGORY_LABEL[a.category]}: </span>
            {a.title}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** 수상·출시·전시 카드 그리드 */
export function AchievementGrid({ items }: { items: AwardItem[] }) {
  if (items.length === 0) return <p className="text-sm text-fg-subtle">등록된 이력이 없습니다.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((a, i) => {
        const title = a.url ? (
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
            {a.title}
            <span className="sr-only"> (새 창)</span>
          </a>
        ) : (
          a.title
        );
        return (
          <li key={i} className="flex gap-4 rounded-card border border-line bg-surface p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-inner bg-accent-soft text-accent-text">
              <Icon name={CATEGORY_ICON[a.category]} className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="flex items-center gap-2 text-xs font-semibold text-fg-subtle">
                <span>{CATEGORY_LABEL[a.category]}</span>
                {a.date && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-display">{a.date}</span>
                  </>
                )}
              </p>
              <p className="leading-snug font-semibold text-fg">{title}</p>
              {a.description && <p className="text-sm text-fg-muted">{a.description}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 홈 수상 화면: 상장 이미지 + 관련 프로젝트 키아트를 겹쳐 보여 주고, 수상명을 크게 강조한다.
 * 상장 이미지가 없으면 프로젝트 키아트만, 둘 다 없으면 플레이스홀더를 보여 준다.
 */
export function AwardShowcase({ award, project, id }: { award: AwardItem; project?: Project; id: string }) {
  const headingId = `${id}-title`;
  const keyart = project?.heroImage ?? project?.thumbnail;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="relative flex items-center overflow-hidden bg-bg-alt py-section lg:min-h-[calc(100svh-var(--spacing-header))] lg:snap-start lg:py-12"
    >
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-[-10%] size-[40rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      <Container className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
        {/* 상장 + 키아트 콜라주 */}
        <div className="relative mx-auto w-full max-w-[20rem] pb-16 sm:max-w-[22rem] lg:max-w-[21rem]">
          <div className="aspect-[3/4] overflow-hidden rounded-card border border-line-strong bg-surface shadow-[0_30px_80px_rgb(0_0_0/0.45)] motion-safe:lg:-rotate-2">
            <MediaImage image={award.image ?? keyart} fallbackAlt={`${award.title} 상장`} placeholderLabel="상장 이미지 준비 중" />
          </div>
          {award.image && keyart && (
            <div className="absolute right-[-12%] bottom-0 w-[72%] overflow-hidden rounded-card border border-line-strong shadow-[0_24px_60px_rgb(0_0_0/0.55)] motion-safe:lg:rotate-2">
              <div className="aspect-video">
                <MediaImage image={keyart} decorative />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-7">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-solid text-accent-fg shadow-[0_12px_40px_rgb(37_99_235/0.35)]">
            <Icon name="trophy" className="size-8" />
          </span>
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-lg font-semibold text-accent-text">
              <span>{CATEGORY_LABEL[award.category]}</span>
              {award.date && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-display">{award.date}</span>
                </>
              )}
            </p>
            <h2 id={headingId} className="text-title font-bold tracking-[-0.04em] text-balance text-fg">
              {award.title}
            </h2>
          </div>
          {project && (
            <div className="flex flex-col gap-4">
              <p className="text-xl font-semibold tracking-[-0.02em] text-fg">
                「{project.title}」 <span className="font-normal text-fg-muted">· {project.genre}</span>
              </p>
              {project.keyTakeaways && (
                <ul className="flex flex-col gap-2.5 text-lg text-fg-muted">
                  {(["problem", "solution", "result"] as const).map((k) => (
                    <li key={k} className="flex items-start gap-3">
                      <span aria-hidden="true" className={cx("mt-2.5 size-1.5 shrink-0 rounded-full", k === "result" ? "bg-accent" : "bg-fg-subtle")} />
                      <span className={cx(k === "result" && "font-semibold text-fg")}>{project.keyTakeaways![k]}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-2">
                <ButtonLink href={`/projects/${project.slug}/`} variant="primary">
                  {project.title} 자세히 보기
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/** 경력 타임라인 */
export function CareerTimeline({ items }: { items: Career["items"] }) {
  if (items.length === 0) return <p className="text-sm text-fg-subtle">등록된 경력이 없습니다.</p>;
  return (
    <ol className="flex flex-col">
      {items.map((c, i) => (
        <li key={i} className="relative border-l border-line-strong pb-8 pl-6 last:pb-0">
          <span aria-hidden="true" className="absolute top-1.5 -left-[5px] size-[9px] rounded-full bg-accent ring-4 ring-accent-soft" />
          {c.period && <p className="font-display text-sm text-accent-text">{c.period}</p>}
          <p className="mt-1 text-lg font-semibold text-fg">
            {c.title}
            {c.organization && <span className="font-normal text-fg-muted"> · {c.organization}</span>}
          </p>
          {c.description && <p className="mt-1 text-sm leading-relaxed text-fg-muted">{c.description}</p>}
        </li>
      ))}
    </ol>
  );
}

/**
 * 플레이 지표: 공식 티어 엠블럼(있으면) → 게임 로고 아이콘 → 게임 이름 머리글자 순으로 시각화하고
 * 티어 이름을 크게 보여 준다. 글보다 엠블럼으로 먼저 읽히도록 한다.
 */
export function GamerEmblems({ items, labelledBy }: { items: Profile["gamerMetrics"]; labelledBy?: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-labelledby={labelledBy} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => (
        <li key={`${m.game}-${m.metric}`} className="flex min-w-0 flex-col items-center gap-3 rounded-card border border-line bg-surface px-4 py-6 text-center lg:py-5">
          <span aria-hidden="true" className="flex size-20 items-center justify-center">
            {m.emblem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={withBasePath(m.emblem.src)} alt="" loading="lazy" decoding="async" className="size-20 object-contain" />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-full bg-surface-raised text-fg">
                {hasIcon(m.icon) ? <Icon name={m.icon} className="size-8" /> : <span className="text-xl font-bold">{m.game.slice(0, 1)}</span>}
              </span>
            )}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-[-0.02em] text-accent-text">{m.metric}</span>
            <span className="text-sm font-semibold break-keep text-fg">{m.game}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** 기획을 위한 활동 카드 그리드 (sm 이상 2열) */
export function ActivitiesGrid({ items, headingLevel = "h4" }: { items: Profile["activities"]; headingLevel?: "h3" | "h4" }) {
  const H = headingLevel;
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.title} className="flex min-w-0 flex-col gap-3 rounded-card border border-line bg-surface p-6">
          <div className="flex flex-col gap-1">
            {(a.period || a.organization) && (
              <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-fg-subtle">
                {a.period && <span className="font-display">{a.period}</span>}
                {a.period && a.organization && <span aria-hidden="true">·</span>}
                {a.organization && <span>{a.organization}</span>}
              </p>
            )}
            <H className="text-lg leading-snug font-bold tracking-[-0.02em] text-fg">{a.title}</H>
            <p className="text-sm font-semibold text-accent-text">{a.role}</p>
          </div>
          {a.description && <p className="text-[0.95rem] leading-[1.75] text-fg-muted">{a.description}</p>}
          {a.tags.length > 0 && (
            <ul aria-label="태그" className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {a.tags.map((t) => (
                <li key={t}>
                  <Tag>{t}</Tag>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
