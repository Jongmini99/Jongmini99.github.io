import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import {
  getAwards,
  getCareer,
  getContact,
  getFeaturedProjects,
  getProfile,
  getPublishedProjects,
  getSkills,
} from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/Typography";
import { Tag, TechBadge } from "@/components/ui/Badge";
import { MediaImage } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { FeaturedBand, ProjectGrid } from "@/components/project/ProjectCards";
import { AchievementGrid, CareerTimeline, ContactActions, SkillGroups } from "@/components/profile/ProfileBlocks";

/**
 * 홈 — 한 페이지에서 전체 내용을 확인한다.
 * 히어로 → 대표 프로젝트(강조) → 프로젝트 → 소개 → 이력 및 성과 → 연락하기
 * 섹션 id는 상단 메뉴(nav.ts)의 앵커와 맞춘다.
 */
export default function HomePage() {
  const profile = getProfile();
  const skills = getSkills();
  const projects = getPublishedProjects();
  const featured = getFeaturedProjects()[0];
  const career = getCareer();
  const awards = getAwards();
  const contact = getContact();
  const heroSkills = skills.groups.flatMap((g) => g.items).filter((s) => s.highlight);

  return (
    <>
      {/* ---------------- ① Hero ---------------- */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_70%_45%,black,transparent_65%)] bg-size-[56px_56px]" />
          <div className="absolute top-1/2 right-[-10%] size-[44rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:min-h-[46rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:py-24">
          <div className="flex flex-col gap-7">
            <h1 id="hero-title" className="max-w-3xl text-display font-bold tracking-[-0.05em] text-balance text-fg">
              {profile.headline}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-2xl font-bold tracking-[-0.03em] text-accent-text">{profile.name}</span>
              {profile.targetRoles.length > 0 && (
                <>
                  <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong sm:block" />
                  <span className="w-full text-fg-muted sm:w-auto">{profile.targetRoles.join(" / ")}</span>
                </>
              )}
            </p>
            {/* 줄바꿈은 넓은 화면에서만 유지 (좁은 화면에서는 자연스럽게 흐르도록) */}
            {profile.summary && (
              <p className="max-w-xl text-[1.05rem] leading-[1.9] text-fg-muted md:whitespace-pre-line">{profile.summary}</p>
            )}
            {heroSkills.length > 0 && (
              <ul aria-label="핵심 기술 스택" className="flex flex-wrap gap-2.5">
                {heroSkills.map((s) => (
                  <li key={s.name}>
                    <TechBadge name={s.name} icon={s.icon} size="sm" />
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href="/#projects" variant="primary">
                프로젝트 보기
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              {contact.resume ? (
                <ButtonLink href={contact.resume} variant="outline" download>
                  <Download className="size-4" aria-hidden="true" />
                  이력서 다운로드
                </ButtonLink>
              ) : (
                <ButtonLink href="/#contact" variant="outline">
                  연락하기
                </ButtonLink>
              )}
            </div>
          </div>

          {/* 히어로 비주얼: 원형 빛 배경 위에 이미지를 띄운다 */}
          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-[32rem]">
            <div className="absolute inset-[4%] rounded-full border border-dashed border-line-strong/70" />
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(96_165_250/0.35),rgb(30_41_70/0.6)_55%,rgb(19_26_42/0.9))] shadow-[inset_-24px_-30px_60px_rgb(0_0_0/0.35),0_30px_80px_rgb(59_130_246/0.18)]" />
            {profile.heroImage && (
              <div className="absolute inset-[6%] motion-safe:animate-[float_6s_ease-in-out_infinite]">
                <MediaImage
                  image={profile.heroImage}
                  decorative
                  priority
                  className="object-contain drop-shadow-[0_24px_24px_rgb(0_0_0/0.35)]"
                />
              </div>
            )}
          </div>
        </Container>

        <a
          href={featured ? "#featured" : "#projects"}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 font-display text-[0.65rem] font-semibold tracking-[0.25em] text-fg-subtle hover:text-fg lg:flex"
        >
          SCROLL
          <ArrowDown className="size-3.5 motion-safe:animate-bounce" aria-hidden="true" />
          <span className="sr-only">— 다음 섹션으로 이동</span>
        </a>
      </section>

      {/* ---------------- ② 대표 프로젝트 (강조 섹션) ---------------- */}
      {featured && <FeaturedBand project={featured} id="featured" />}

      {/* ---------------- ③ 프로젝트 ---------------- */}
      <section id="projects" aria-labelledby="projects-title" className="bg-bg-alt py-section">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            title="참여한 프로젝트"
            id="projects-title"
            description="기획부터 구현까지 참여한 게임 프로젝트입니다."
            aside={
              projects.length > 0 && (
                <ButtonLink href="/projects/" variant="outline" size="sm">
                  전체 프로젝트
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              )
            }
          />
          {projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <p className="text-fg-subtle">공개된 프로젝트가 없습니다.</p>
          )}
        </Container>
      </section>

      {/* ---------------- ④ 소개 ---------------- */}
      <section id="about" aria-labelledby="about-title" className="py-section">
        <Container className="flex flex-col gap-12">
          <SectionTitle title="자기소개" id="about-title" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
            <div className="flex flex-col gap-6">
              <p className="text-2xl leading-snug font-semibold tracking-[-0.03em] text-fg">{profile.headline}</p>
              {profile.summary && (
                <p className="text-[1.05rem] leading-[1.9] whitespace-pre-line text-fg-muted">{profile.summary}</p>
              )}
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
            </div>
            {skills.groups.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold tracking-wide text-fg-subtle">기술 스택</h3>
                <SkillGroups skills={skills} />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ---------------- ⑤ 이력 및 성과 ---------------- */}
      <section id="career" aria-labelledby="career-title" className="bg-bg-alt py-section">
        <Container className="flex flex-col gap-12">
          <SectionTitle title="이력 및 성과" id="career-title" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold tracking-wide text-fg-subtle">경력</h3>
              <CareerTimeline items={career.items} />
            </div>
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-semibold tracking-wide text-fg-subtle">수상 · 출시 · 전시</h3>
              <AchievementGrid items={awards.items} />
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- ⑥ 연락하기 ---------------- */}
      <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-section">
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-20rem] left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <Container className="relative flex flex-col items-center gap-6 text-center">
          <h2 id="contact-title" className="text-title font-semibold tracking-[-0.04em] text-fg">
            연락하기
          </h2>
          <p className="max-w-md leading-[1.8] text-fg-muted">채용 및 협업 관련 문의를 환영합니다.</p>
          <ContactActions contact={contact} className="justify-center pt-2" />
          {contact.email && (
            <p className="font-display text-sm text-fg-subtle">
              <a href={`mailto:${contact.email}`} className="underline-offset-4 hover:text-fg hover:underline">
                {contact.email}
              </a>
            </p>
          )}
          {contact.links.length > 0 && (
            <ul aria-label="외부 링크" className="mt-6 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-2">
              {contact.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4 transition-colors duration-150 hover:border-accent/60"
                  >
                    <span>
                      <span className="block font-semibold text-fg">{l.label}</span>
                      {l.description && <span className="text-sm text-fg-subtle">{l.description}</span>}
                    </span>
                    <ArrowUpRight className="size-5 text-fg-muted group-hover:text-accent-text" aria-hidden="true" />
                    <span className="sr-only">(새 창)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
