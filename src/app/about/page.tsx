import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAwards, getCareer, getProfile, getPublishedProjects, getSkills } from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Badge";
import { CATEGORY_LABEL, SkillGroups } from "@/components/profile/ProfileBlocks";
import { formatPeriod } from "@/lib/format";

export const metadata: Metadata = {
  title: "소개",
  description: "시스템 / 테크니컬 게임 기획자 허종민 소개, 기술 스택, 경력 및 수상 이력",
};

export default function AboutPage() {
  const profile = getProfile();
  const skills = getSkills();
  const career = getCareer();
  const awards = getAwards();
  const projects = getPublishedProjects();

  return (
    <>
      <PageHeader eyebrow="About" title={profile.name}>
        <p className="text-lg font-semibold text-fg">{profile.headline}</p>
        {profile.roleTitle && <p className="mt-1 font-display text-sm text-fg-subtle">{profile.roleTitle}</p>}
      </PageHeader>

      <Container className="flex flex-col gap-16 py-12">
        {(profile.summary || profile.targetRoles.length > 0) && (
          <section aria-labelledby="intro-heading" className="flex flex-col gap-5">
            <SectionHeading eyebrow="Introduction" title="자기소개" id="intro-heading" />
            {profile.summary && <p className="max-w-3xl text-[1.05rem] leading-[1.8] whitespace-pre-line text-fg-muted">{profile.summary}</p>}
            {profile.targetRoles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-fg-subtle">목표 직무</span>
                {profile.targetRoles.map((r) => (
                  <Tag key={r} tone="accent">
                    {r}
                  </Tag>
                ))}
              </div>
            )}
          </section>
        )}

        {skills.groups.length > 0 && (
          <section aria-labelledby="skills-heading" className="flex flex-col gap-5">
            <SectionHeading eyebrow="Skills" title="기술 스택" id="skills-heading" />
            <SkillGroups skills={skills} />
          </section>
        )}

        <section id="career" aria-labelledby="career-heading" className="flex flex-col gap-5">
          <SectionHeading eyebrow="Career & Achievements" title="이력 및 성과" id="career-heading" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 font-semibold text-fg">경력</h3>
              {career.items.length === 0 ? (
                <p className="text-sm text-fg-subtle">등록된 경력이 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {career.items.map((c, i) => (
                    <li key={i} className="border-l-2 border-accent pl-4">
                      <p className="font-semibold text-fg">
                        {c.title}
                        {c.organization && <span className="font-normal text-fg-muted"> · {c.organization}</span>}
                      </p>
                      {c.period && <p className="text-sm text-fg-subtle">{c.period}</p>}
                      {c.description && <p className="mt-1 text-sm text-fg-muted">{c.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <h3 className="mb-4 font-semibold text-fg">수상 · 출시 · 전시</h3>
              {awards.items.length === 0 ? (
                <p className="text-sm text-fg-subtle">등록된 이력이 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {awards.items.map((a, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Tag tone={a.category === "award" ? "accent" : "neutral"}>{CATEGORY_LABEL[a.category]}</Tag>
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-fg underline-offset-4 hover:underline">
                          {a.title}
                          <span className="sr-only"> (새 창)</span>
                        </a>
                      ) : (
                        <span className="text-fg">{a.title}</span>
                      )}
                      {a.date && <span className="font-display text-xs text-fg-subtle">{a.date}</span>}
                      {a.description && <span className="w-full text-sm text-fg-muted">{a.description}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </section>

        {projects.length > 0 && (
          <section aria-labelledby="exp-heading" className="flex flex-col gap-5">
            <SectionHeading eyebrow="Experience" title="프로젝트 경험" id="exp-heading" />
            <ul className="flex flex-col gap-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="group flex flex-col gap-1 rounded-card border border-line bg-surface px-5 py-4 transition-colors duration-150 hover:border-accent/60 sm:flex-row sm:items-center sm:gap-6"
                  >
                    <span className="font-semibold text-fg">{p.title}</span>
                    <span className="text-sm text-fg-muted">
                      {p.platform} · {p.genre}
                    </span>
                    <span className="font-display text-sm text-fg-subtle sm:ml-auto">{formatPeriod(p.developmentPeriod)}</span>
                    <ArrowRight className="hidden size-4 text-fg-muted group-hover:text-accent-text sm:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
