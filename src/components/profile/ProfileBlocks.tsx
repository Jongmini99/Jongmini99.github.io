/**
 * 사이트 정보(프로필·성과·연락처) 표시 블록 — Home/About/Contact에서 공용
 */
import { Download, Mail } from "lucide-react";
import type { Awards, Contact, Skills } from "@/content/schema";
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

/** 주요 성과 가로 목록 (메인) */
export function HighlightList({ items }: { items: Awards["items"] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-line">
      {items.map((a, i) => (
        <li key={i} className="flex items-start gap-3 md:px-6 md:first:pl-0">
          <span className="mt-0.5 text-fg-muted">
            <Icon name={CATEGORY_ICON[a.category]} className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="sr-only">{CATEGORY_LABEL[a.category]}:</p>
            <p className="text-[0.95rem] leading-snug font-medium text-fg">{a.title}</p>
            {a.date && <p className="mt-1 font-display text-xs text-fg-subtle">{a.date}</p>}
          </div>
        </li>
      ))}
    </ul>
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
export function SkillGroups({ skills }: { skills: Skills }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {skills.groups.map((g) => (
        <div key={g.name} className="rounded-card border border-line bg-surface p-5">
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
