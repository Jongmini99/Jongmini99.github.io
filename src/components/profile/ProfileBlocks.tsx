/**
 * 사이트 정보(프로필·성과·연락처) 표시 블록 — 홈 한 페이지 섹션에서 사용
 */
import { Download, Mail } from "lucide-react";
import type { Awards, Career, Contact, Profile, Skills } from "@/content/schema";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag, TechBadge } from "@/components/ui/Badge";
import { cx } from "@/lib/cx";

const CATEGORY_ICON: Record<Awards["items"][number]["category"], string> = {
  award: "trophy",
  release: "rocket",
  exhibition: "gamepad",
  career: "briefcase",
  other: "award",
};

export const CATEGORY_LABEL: Record<Awards["items"][number]["category"], string> = {
  award: "수상",
  release: "출시",
  exhibition: "전시",
  career: "경력",
  other: "기타",
};

/** 수상·출시·전시 카드 그리드 */
export function AchievementGrid({ items }: { items: Awards["items"] }) {
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

/** 핵심 강점 카드 그리드 (데스크톱 3열, 모바일 1열) */
export function CoreStrengthsGrid({ items }: { items: Profile["coreStrengths"] }) {
  if (items.length === 0) return null;
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {items.map((s, i) => (
        <li key={s.title} className="flex min-w-0 flex-col gap-4 rounded-card border border-line bg-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-inner bg-accent-soft text-accent-text">
              <Icon name={s.icon ?? "sparkles"} className="size-5" />
            </span>
            <span aria-hidden="true" className="font-display text-sm font-semibold text-fg-subtle">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg leading-snug font-bold tracking-[-0.02em] text-fg">{s.title}</h3>
            {s.subtitle && <p className="text-sm font-semibold text-accent-text">{s.subtitle}</p>}
          </div>
          <p className="text-[0.95rem] leading-[1.8] text-fg-muted">{s.description}</p>
        </li>
      ))}
    </ol>
  );
}

/** 게임 플레이 지표 배지 — 폭에 따라 자연스럽게 줄바꿈 (390px에서 1~2열) */
export function GamerMetrics({ items, labelledBy }: { items: Profile["gamerMetrics"]; labelledBy?: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-labelledby={labelledBy} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => (
        <li key={`${m.game}-${m.metric}`} className="flex min-w-0 flex-col gap-1 rounded-inner border border-line bg-surface px-4 py-3.5">
          <span className="text-sm font-semibold break-keep text-fg">{m.game}</span>
          <span className="text-lg font-bold tracking-[-0.02em] text-accent-text">{m.metric}</span>
          {m.description && <span className="text-xs text-fg-muted">{m.description}</span>}
        </li>
      ))}
    </ul>
  );
}

/** 기획 활동 카드 그리드 (sm 이상 2열) */
export function ActivitiesGrid({ items }: { items: Profile["activities"] }) {
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
            <h3 className="text-lg leading-snug font-bold tracking-[-0.02em] text-fg">{a.title}</h3>
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

/** 연락 버튼 묶음. 값이 없는 항목은 표시하지 않는다. */
export function ContactActions({ contact, resumeLabel, className }: { contact: Contact; resumeLabel?: string; className?: string }) {
  const hasAny = contact.email || contact.github || contact.resume;
  if (!hasAny) return <p className="text-sm text-fg-subtle">연락처 정보를 준비 중입니다.</p>;
  return (
    <div className={cx("flex flex-wrap gap-3", className)}>
      {contact.email && (
        <ButtonLink href={`mailto:${contact.email}`} variant="primary">
          <Mail className="size-5" aria-hidden="true" />
          이메일로 연락하기
        </ButtonLink>
      )}
      {contact.github && (
        <ButtonLink href={contact.github} variant="outline">
          <Icon name="github" className="size-5" />
          GitHub
        </ButtonLink>
      )}
      {contact.resume && (
        <ButtonLink href={contact.resume} variant="outline" download>
          <Download className="size-5" aria-hidden="true" />
          {resumeLabel ?? "포트폴리오 PDF 다운로드"}
        </ButtonLink>
      )}
    </div>
  );
}

/** 기술 스택 그룹 */
export function SkillGroups({ skills, className }: { skills: Skills; className?: string }) {
  return (
    <div className={cx("grid gap-4", className)}>
      {skills.groups.map((g) => (
        <div key={g.name} className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-fg-muted">{g.name}</h3>
          <ul className="flex flex-wrap gap-2">
            {g.items.map((s) => (
              <li key={s.name}>
                <TechBadge name={s.name} icon={s.icon} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
