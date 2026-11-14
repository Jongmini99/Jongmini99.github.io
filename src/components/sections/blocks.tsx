/**
 * 서버 렌더링 섹션 블록. 각 블록은 (section, project) 데이터만 받아 그린다.
 */
import { ArrowUpRight, Award, CodeXml, Download, FileText, Link as LinkIcon } from "lucide-react";
import type { Project, Section } from "@/content/schema";
import { Card } from "@/components/ui/Card";
import { Markdown } from "@/components/ui/Markdown";
import { MediaImage } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";
import { TechBadge } from "@/components/ui/Badge";
import { techIcon } from "@/components/ui/tech-icons";
import { withBasePath } from "@/lib/base-path";
import { formatPeriod } from "@/lib/format";
import { cx } from "@/lib/cx";
import { cardAnchorId } from "./structure";
import { EmptyState } from "./SectionShell";

type Of<T extends Section["type"]> = Extract<Section, { type: T }>;

/* ---------------- 직접 작성 섹션 ---------------- */

export function RichTextBlock({ section }: { section: Of<"richText"> }) {
  return (
    <div className={cx("grid gap-6", section.image && "lg:grid-cols-[1fr_minmax(0,24rem)] lg:items-start")}>
      <Markdown className="text-[1.02rem]">{section.body}</Markdown>
      {section.image && (
        <figure className="overflow-hidden rounded-card border border-line">
          <div className="aspect-video">
            <MediaImage image={section.image} fallbackAlt={section.title} />
          </div>
          {section.image.caption && <figcaption className="px-4 py-2 text-xs text-fg-subtle">{section.image.caption}</figcaption>}
        </figure>
      )}
    </div>
  );
}

export function BulletListBlock({ section }: { section: Of<"bulletList"> }) {
  if (section.items.length === 0) return <EmptyState />;
  return (
    <Card>
      <ul className="flex flex-col gap-2.5 text-fg-muted">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CardsBlock({ section }: { section: Of<"cards"> }) {
  if (section.items.length === 0) return <EmptyState />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {section.items.map((item, i) => (
        <Card key={i} as="article" className="flex flex-col gap-4 overflow-hidden" padded>
          <div id={cardAnchorId(section.id, i)} className="flex items-center gap-3">
            {item.icon && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text">
                <Icon name={item.icon} className="size-5" />
              </span>
            )}
            <h3 className="text-lg font-bold text-fg">{item.title}</h3>
          </div>
          <div className={cx("grid gap-4", item.image && "sm:grid-cols-[1fr_9rem]")}>
            <div className="flex flex-col gap-3">
              <Markdown>{item.body}</Markdown>
              {item.bullets.length > 0 && (
                <ul className="flex flex-col gap-2 text-[0.95rem] text-fg-muted">
                  {item.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-fg-subtle" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {item.image && (
              <div className="aspect-square overflow-hidden rounded-control">
                <MediaImage image={item.image} fallbackAlt={item.title} />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function DefinitionRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <Card padded={false}>
      <dl className="divide-y divide-line">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-4 px-5 py-3.5 sm:px-6">
            <dt className="text-sm text-fg-subtle">{r.label}</dt>
            <dd className="text-[0.95rem] text-fg">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function InfoTableBlock({ section }: { section: Of<"infoTable"> }) {
  if (section.rows.length === 0) return <EmptyState />;
  return <DefinitionRows rows={section.rows} />;
}

export function ComparisonBlock({ section }: { section: Of<"comparison"> }) {
  if (section.items.length === 0) return <EmptyState />;
  const [a, b, ...rest] = section.items;
  const tones = ["accent", "rival"] as const;
  return (
    <div className="flex flex-col gap-4">
      <div className="relative grid gap-4 md:grid-cols-2">
        {[a, b].filter((x) => !!x).map((item, i) => {
          const tone = tones[i] ?? "accent";
          return (
            <Card
              key={i}
              padded={false}
              className={cx(
                "flex min-h-44 flex-col justify-end overflow-hidden",
                tone === "accent" ? "bg-linear-to-br from-accent-soft to-surface" : "bg-linear-to-bl from-rival-soft to-surface",
              )}
            >
              {item.image && (
                <div className="absolute inset-0 opacity-40">
                  <MediaImage image={item.image} decorative />
                </div>
              )}
              <div className="relative p-5 sm:p-6">
                <h3 className={cx("text-lg font-bold", tone === "accent" ? "text-accent-text" : "text-rival-text")}>{item.label}</h3>
                {item.description && <p className="mt-1.5 text-fg-muted">{item.description}</p>}
              </div>
            </Card>
          );
        })}
        {b && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 hidden size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-bg font-display text-lg font-extrabold italic text-fg md:flex"
          >
            VS
          </span>
        )}
      </div>
      {rest.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {rest.map((item, i) => (
            <Card key={i}>
              <h3 className="font-bold text-fg">{item.label}</h3>
              {item.description && <p className="mt-1.5 text-fg-muted">{item.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- 프로젝트 공통 필드 섹션 ---------------- */

export function ProjectInfoBlock({ project }: { project: Project }) {
  const rows = [
    { label: "플랫폼", value: project.platform },
    { label: "장르", value: project.genre },
    { label: "개발 기간", value: formatPeriod(project.developmentPeriod) },
    project.developmentType && { label: "개발 형태", value: project.developmentType },
    project.teamSize && { label: "참여 인원", value: `${project.teamSize}명` },
    project.teamComposition && { label: "팀 구성", value: project.teamComposition },
    project.technologies.length > 0 && { label: "사용 기술", value: project.technologies.join(", ") },
  ].filter((r): r is { label: string; value: string } => !!r);
  return <DefinitionRows rows={rows} />;
}

export function RolesBlock({ project }: { project: Project }) {
  if (project.roles.length === 0) return <EmptyState />;
  return (
    <Card className="h-full">
      <ol className="flex flex-col gap-3">
        {project.roles.map((role, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-xs font-bold text-accent-text">
              {i + 1}
            </span>
            <span className="text-fg">{role}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function TechnologiesBlock({ section, project }: { section: Of<"technologies">; project: Project }) {
  if (section.items.length === 0 && project.technologies.length === 0) return <EmptyState />;
  return (
    <Card className="flex h-full flex-col gap-4">
      {project.technologies.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="사용 기술">
          {project.technologies.map((t) => (
            <li key={t}>
              <TechBadge name={t} icon={techIcon(t)} size="sm" />
            </li>
          ))}
        </ul>
      )}
      {section.items.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-control border border-line bg-bg/40 px-4 py-3 text-fg">
              <CodeXml className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function AchievementsBlock({ project }: { project: Project }) {
  if (project.achievements.length === 0) return <EmptyState />;
  return (
    <Card className="h-full">
      <ul className="flex flex-col gap-4">
        {project.achievements.map((a, i) => (
          <li key={i} className="flex gap-3">
            <Award className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden="true" />
            <div>
              <p className="font-semibold text-fg">
                {a.date && <span className="mr-2 font-display text-accent-text">{a.date}</span>}
                {a.title}
              </p>
              {a.description && <p className="mt-1 text-sm text-fg-muted">{a.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function fileExt(path: string): string {
  return path.split("?")[0]!.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE";
}

export function DocumentsBlock({ project }: { project: Project }) {
  if (project.documents.length === 0) return <EmptyState>기획 문서는 준비 중입니다.</EmptyState>;
  return (
    <ul className="flex flex-col gap-3">
      {project.documents.map((d, i) => (
        <li key={i}>
          <a
            href={withBasePath(d.file)}
            download
            className="group flex items-center gap-4 rounded-card border border-line bg-surface px-5 py-4 transition-colors duration-150 hover:border-accent/60"
          >
            <FileText className="size-6 shrink-0 text-fg-muted" aria-hidden="true" strokeWidth={1.5} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-fg">{d.title}</span>
              {d.description && <span className="mt-0.5 block text-sm text-fg-subtle">{d.description}</span>}
            </span>
            <span className="rounded bg-surface-raised px-2 py-0.5 font-display text-xs font-semibold text-fg-muted">{fileExt(d.file)}</span>
            <Download className="size-5 shrink-0 text-fg-muted group-hover:text-accent-text" aria-hidden="true" />
            <span className="sr-only">다운로드</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LinksBlock({ project }: { project: Project }) {
  if (project.externalLinks.length === 0) return <EmptyState>외부 링크는 준비 중입니다.</EmptyState>;
  return (
    <ul className="flex flex-col gap-3">
      {project.externalLinks.map((l, i) => (
        <li key={i}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-card border border-line bg-surface px-5 py-4 transition-colors duration-150 hover:border-accent/60"
          >
            <LinkIcon className="size-5 shrink-0 text-fg-muted" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-fg">{l.label}</span>
              {l.description && <span className="mt-0.5 block text-sm text-fg-subtle">{l.description}</span>}
            </span>
            <ArrowUpRight className="size-5 shrink-0 text-fg-muted group-hover:text-accent-text" aria-hidden="true" />
            <span className="sr-only">(새 창)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
