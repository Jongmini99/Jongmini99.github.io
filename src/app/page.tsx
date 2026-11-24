import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import {
  getAwards,
  getCareer,
  getContact,
  getFeaturedProjects,
  getFileSizeLabel,
  getProfile,
  getPublishedProjects,
  getSkills,
} from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/Typography";
import { TechBadge } from "@/components/ui/Badge";
import { MediaImage } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { FeaturedBand, TrackedProjects } from "@/components/project/ProjectCards";
import {
  AchievementGrid,
  ActivitiesGrid,
  AwardShowcase,
  CareerTimeline,
  ContactActions,
  GamerEmblems,
  HeroProofBadges,
} from "@/components/profile/ProfileBlocks";

/**
 * 홈 — 한 페이지에서 전체 내용을 확인한다.
 *
 * 앞 3화면(데스크톱에서 화면 단위로 스크롤이 맞춰짐): 첫인상을 결정하는 구간
 *   ① 히어로(#top): 한 줄 소개·자기소개·성과 배지·도구 아이콘·사진
 *   ② 대표 프로젝트(#featured): 한 줄 소개·핵심 성과·영상·AI 작업 흐름
 *   ③ 수상(#award): 상장 + 프로젝트 키아트
 * 그 아래는 일반 스크롤: 프로젝트(#projects) → 게임 기획을 위한 경험(#experience) → 이력 및 성과(#career) → 연락하기(#contact)
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
  const proofBadges = awards.items.filter((a) => a.highlight);
  const topAward = awards.items.find((a) => a.category === "award" && a.highlight);
  const topAwardProject = topAward?.projectSlug ? projects.find((p) => p.slug === topAward.projectSlug) : undefined;
  const hasExperience = profile.gamerMetrics.length > 0 || profile.activities.length > 0;
  const resumeSize = getFileSizeLabel(contact.resume);
  const resumeLabel = `포트폴리오 PDF 다운로드${resumeSize ? ` (${resumeSize})` : ""}`;

  return (
    <div data-snap-home>
      {/* ---------------- ① Hero ---------------- */}
      <section
        id="top"
        aria-labelledby="hero-title"
        className="relative flex items-center overflow-hidden lg:min-h-[calc(100svh-var(--spacing-header))] lg:snap-start"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_70%_45%,black,transparent_65%)] bg-size-[56px_56px]" />
          <div className="absolute top-1/2 right-[-10%] size-[44rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <Container className="relative grid items-center gap-14 py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 lg:py-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1 id="hero-title" className="max-w-3xl text-display font-bold tracking-[-0.05em] text-balance text-fg md:whitespace-pre-line">
                {profile.headline}
              </h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-2xl font-bold tracking-[-0.03em] text-accent-text">{profile.name}</span>
                {profile.targetRoles.length > 0 && (
                  <>
                    <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong sm:block" />
                    <span className="w-full text-lg text-fg-muted sm:w-auto">{profile.targetRoles.join(" / ")}</span>
                  </>
                )}
              </p>
            </div>
            {/* 줄바꿈은 넓은 화면에서만 유지 (좁은 화면에서는 자연스럽게 흐르도록) */}
            {profile.summary && (
              <p className="max-w-xl text-[1.05rem] leading-[1.85] text-fg-muted md:whitespace-pre-line">{profile.summary}</p>
            )}
            <HeroProofBadges items={proofBadges} />
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={featured ? "/#featured" : "/#projects"} variant="primary">
                {featured ? "대표 프로젝트 보기" : "프로젝트 보기"}
                <ArrowDown className="size-4" aria-hidden="true" />
              </ButtonLink>
              {contact.resume ? (
                <ButtonLink href={contact.resume} variant="outline" download>
                  <Download className="size-4" aria-hidden="true" />
                  {resumeLabel}
                </ButtonLink>
              ) : (
                <ButtonLink href="/#contact" variant="outline">
                  연락하기
                </ButtonLink>
              )}
            </div>
            {heroSkills.length > 0 && (
              <ul aria-label="사용 도구" className="flex flex-wrap gap-2">
                {heroSkills.map((s) => (
                  <li key={s.name}>
                    <TechBadge name={s.name} icon={s.icon} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 히어로 비주얼: 3:4 프로필 사진 카드 */}
          {profile.heroImage && (
            <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-[24rem]">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.22),transparent_70%)] blur-2xl"
              />
              <div className="relative aspect-[3/4] overflow-hidden rounded-card border border-line shadow-[0_30px_80px_rgb(0_0_0/0.45)] motion-safe:animate-[float_3.5s_ease-in-out_infinite]">
                <MediaImage image={profile.heroImage} priority fallbackAlt={`${profile.name} 프로필 사진`} />
              </div>
            </div>
          )}
        </Container>

      </section>

      {/* ---------------- ② 대표 프로젝트 ---------------- */}
      {featured && <FeaturedBand project={featured} id="featured" />}

      {/* ---------------- ③ 수상 ---------------- */}
      {topAward && <AwardShowcase award={topAward} project={topAwardProject} id="award" />}

      {/* ④~⑦은 하나의 스냅 영역: 진입할 때만 고정되고 안에서는 자유 스크롤 */}
      <div data-snap-tail className="lg:snap-start">
        {/* ---------------- ④ 프로젝트 ---------------- */}
        <section id="projects" aria-labelledby="projects-title" className="py-section">
          <Container className="flex flex-col gap-14">
            <SectionTitle
              title="참여한 프로젝트"
              id="projects-title"
              description="카드마다 문제 → 해결 → 결과를 정리했습니다."
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
              <TrackedProjects projects={projects} />
            ) : (
              <p className="text-fg-subtle">공개된 프로젝트가 없습니다.</p>
            )}
          </Container>
        </section>

        {/* ---------------- ⑤ 게임 기획을 위한 경험 ---------------- */}
        {hasExperience && (
          <section id="experience" aria-labelledby="experience-title" className="bg-bg-alt py-section">
            <Container className="flex flex-col gap-16">
              <SectionTitle title="게임 기획을 위한 경험" id="experience-title" description="많이 플레이하고, 직접 만들고, 현장을 찾아다녔습니다." />
              {profile.gamerMetrics.length > 0 && (
                <div className="flex flex-col gap-6">
                  <h3 id="gamer-metrics-title" className="text-xl font-bold tracking-[-0.02em] text-fg">
                    최상위권 플레이 경험
                  </h3>
                  <GamerEmblems items={profile.gamerMetrics} labelledBy="gamer-metrics-title" />
                </div>
              )}
              {profile.activities.length > 0 && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-fg">만들고 경험하는 현장</h3>
                  <ActivitiesGrid items={profile.activities} />
                </div>
              )}
            </Container>
          </section>
        )}

        {/* ---------------- ⑥ 이력 및 성과 ---------------- */}
        <section id="career" aria-labelledby="career-title" className="py-section">
          <Container className="flex flex-col gap-14">
            <SectionTitle title="이력 및 성과" id="career-title" />
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
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

        {/* ---------------- ⑦ 연락하기 ---------------- */}
        <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-bg-alt py-section">
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[-20rem] left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
          <Container className="relative flex flex-col items-center gap-6 text-center">
            <h2 id="contact-title" className="text-title font-semibold tracking-[-0.04em] text-fg">
              연락하기
            </h2>
            <p className="max-w-md leading-[1.8] text-fg-muted">채용 및 협업 관련 문의를 환영합니다.</p>
            <ContactActions contact={contact} resumeLabel={resumeLabel} className="justify-center pt-2" />
            {contact.email && (
              <p className="font-display text-sm text-fg-muted">
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
      </div>
    </div>
  );
}
