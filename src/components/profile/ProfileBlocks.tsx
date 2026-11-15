/**
 * 사이트 정보(프로필·성과·연락처) 표시 블록 — 홈 한 페이지 섹션에서 사용
 */
import { Download, Mail } from "lucide-react";
import type { Awards, Career, Contact, Skills } from "@/content/schema";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TechBadge } from "@/components/ui/Badge";
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

/** 연락 버튼 묶음. 값이 없는 항목은 표시하지 않는다. */
export function ContactActions({ contact, className }: { contact: Contact; className?: string }) {
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
          이력서 다운로드
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
