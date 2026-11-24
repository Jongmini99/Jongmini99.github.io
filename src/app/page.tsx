import { Fragment } from "react";
import type { z } from "zod";
import type { ShowcaseSectionSchema } from "@/content/schema";
import { WorkflowCards } from "@/components/project/WorkflowCards";
import { ProjectOriginTracker } from "@/components/project/ProjectOrigin";
import { ArrowDown, ArrowRight, Download } from "lucide-react";
import {
  getAwards,
  getContact,
  getFeaturedProjects,
  getFileSizeLabel,
  getProfile,
  getPublishedProjects,
} from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { SectionIntro, SectionTitle } from "@/components/ui/Typography";
import { MediaImage } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import {
  FeaturedBand,
  FeaturedPipeline,
  ProjectGrid,
  TRACKS,
} from "@/components/project/ProjectCards";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";
import { withBasePath } from "@/lib/base-path";
import { SectionSpy, type SpyItem } from "@/components/layout/SectionSpy";
import {
  ActivitiesGrid,
  GamerEmblems,
  CATEGORY_LABEL,
  HeroProofBadges,
} from "@/components/profile/ProfileBlocks";
import { AwardCertificate } from "@/components/profile/AwardCertificate";
import { TrailerButton } from "@/components/project/TrailerButton";

/**
 * 홈 — 한 페이지에서 전체 내용을 확인한다.
 *
 * 데스크톱에서는 모든 섹션이 한 화면에 맞춰지고 화면 단위로 스크롤된다 (One Scroll - One Section).
 * 앞 2화면: 첫인상을 결정하는 구간
 *   ① 히어로(#top): 한 줄 소개·자기소개·나의 강점·성과 배지·사진 + 상장 카드
 *   ② 대표 프로젝트(#featured): 한 줄 소개·핵심 성과·영상
 *   ②-2 AI 게임 제작 파이프라인(#featured-pipeline): 대표 프로젝트의 작업 흐름 도표
 * 그 아래도 한 화면 = 한 섹션: 프로젝트(#projects AI / #projects-game 기획·개발 / #projects-document 문서) →
 *   경험(#experience 플레이 / #experience-field 현장)
 * 연락하기는 섹션 없이 상단 바의 작은 버튼(연락처 대화상자)으로 제공한다.
 * 섹션 id는 상단 메뉴(nav.ts)의 앵커와 맞춘다.
 */

/** 데스크톱에서 한 화면(헤더 제외)을 채우고 화면 단위로 스냅되는 섹션 */
const SLIDE =
  "relative flex items-center py-section lg:min-h-[calc(100svh-var(--spacing-header))] lg:snap-start lg:py-8";

/** 제목 일부(accent)를 강조색으로 */
function AccentTitle({ title, accent }: { title: string; accent?: string }) {
  const i = accent ? title.indexOf(accent) : -1;
  if (!accent || i < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, i)}
      <span className="text-accent-text">{accent}</span>
      {title.slice(i + accent.length)}
    </>
  );
}

/** 머리말: 상위 섹션 이름 작게 + 강조 제목 + 소개 문단 */
function IntroTitle({
  parent,
  id,
  intro,
  fallback,
}: {
  parent?: string;
  id: string;
  intro?: { title: string; titleAccent?: string; intro?: string };
  fallback: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {parent && (
        <p className="text-sm font-semibold text-fg-muted">{parent}</p>
      )}
      <h2
        id={id}
        className="text-3xl font-bold tracking-[-0.04em] break-keep text-fg sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
      >
        <AccentTitle
          title={intro?.title ?? fallback}
          accent={intro?.titleAccent}
        />
      </h2>
      {intro?.intro && <SectionIntro text={intro.intro} />}
    </div>
  );
}

type ShowcaseSectionData = z.infer<typeof ShowcaseSectionSchema>;

/** 이미지 카드 화면 (AI 업무 자동화·현업 실무 경험): 머리말 + 카드. 카드를 누르면 크게 보기 */
function ShowcaseSection({
  id,
  data,
  fallback,
  columns,
  aspect,
  numberPrefix,
  className,
}: {
  id: string;
  data: ShowcaseSectionData;
  fallback: string;
  columns: 3 | 4;
  aspect?: "video" | "portrait";
  numberPrefix?: string;
  className?: string;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cx(SLIDE, className)}
    >
      <Container className="flex w-full flex-col gap-8 [@media(max-height:56rem)]:lg:gap-6">
        <IntroTitle id={headingId} intro={data} fallback={fallback} />
        <WorkflowCards
          figures={data.items}
          label={data.title}
          columns={columns}
          aspect={aspect}
          numberPrefix={numberPrefix}
        />
      </Container>
    </section>
  );
}

export default function HomePage() {
  const profile = getProfile();
  const projects = getPublishedProjects();
  const featured = getFeaturedProjects()[0];
  const hasPipeline = !!featured?.sections.some(
    (s) =>
      s.type === "flow" &&
      s.visible &&
      (s.figures.length > 0 || s.steps.length > 0),
  );
  const awards = getAwards();
  const contact = getContact();
  const proofBadges = awards.items.filter((a) => a.highlight);
  const play = profile.playShowcase;
  const topAward = awards.items.find(
    (a) => a.category === "award" && a.highlight,
  );
  // 프로젝트는 분류(track)별로 한 화면씩. 분류 없는 프로젝트는 마지막 화면에 붙인다.
  const projectSlides: {
    key: string;
    title: string;
    description?: string;
    items: typeof projects;
  }[] = TRACKS.map((t) => ({
    key: t.key,
    title: t.title,
    description: t.description,
    items: projects.filter((p) => p.track === t.key),
  })).filter((g) => g.items.length > 0);
  const untracked = projects.filter((p) => !p.track);
  const lastSlide = projectSlides.at(-1);
  if (untracked.length > 0) {
    if (lastSlide) lastSlide.items.push(...untracked);
    else projectSlides.push({ key: "all", title: "", items: untracked });
  }
  const aiAutomation = profile.aiAutomation?.items.length
    ? profile.aiAutomation
    : undefined;
  const fieldWork = profile.fieldWork?.items.length
    ? profile.fieldWork
    : undefined;
  // 오른쪽 점 내비게이션(Scrollspy) 항목: 화면(섹션) 순서와 같다
  const spyItems: SpyItem[] = [
    { id: "top", label: "소개" },
    ...(featured ? [{ id: "featured", label: "대표 프로젝트" }] : []),
    ...(featured && hasPipeline
      ? [{ id: "featured-pipeline", label: "AI 게임 제작 파이프라인" }]
      : []),
    ...(projectSlides.length > 0
      ? projectSlides.flatMap((slide, i) => [
          {
            id: i === 0 ? "projects" : `projects-${slide.key}`,
            label: slide.title || "참여한 프로젝트",
          },
          ...(slide.key === "ai" && aiAutomation
            ? [{ id: "ai-automation", label: "AI 업무 자동화" }]
            : []),
        ])
      : [{ id: "projects", label: "참여한 프로젝트" }]),
    ...(fieldWork ? [{ id: "career-field", label: "현업 실무 경험" }] : []),
    ...(profile.gamerMetrics.length > 0
      ? [{ id: "experience", label: "최상위권 플레이 경험" }]
      : []),
    ...(profile.activities.length > 0
      ? [
          {
            id:
              profile.gamerMetrics.length > 0
                ? "experience-field"
                : "experience",
            label: "만들고 경험하는 현장",
          },
        ]
      : []),
  ];
  const resumeSize = getFileSizeLabel(contact.resume);
  const resumeLabel = `포트폴리오 PDF 다운로드${resumeSize ? ` (${resumeSize})` : ""}`;

  return (
    <>
      <SectionSpy items={spyItems} />
      <ProjectOriginTracker from="home" />
      <div data-snap-home>
        {/* ---------------- ① Hero ---------------- */}
        <section
          id="top"
          aria-labelledby="hero-title"
          className="relative flex items-center overflow-hidden lg:min-h-[calc(100svh-var(--spacing-header))] lg:snap-start"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_70%_45%,black,transparent_65%)] bg-size-[56px_56px]" />
            <div className="absolute top-1/2 right-[-10%] size-[44rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <Container className="relative grid items-center gap-14 py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 lg:py-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h1
                  id="hero-title"
                  className="max-w-3xl text-display font-bold tracking-[-0.05em] text-balance text-fg whitespace-pre-line"
                >
                  {/* **강조** 구간은 포인트 색으로 표시 */}
                  {profile.headline.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <span key={i} className="text-accent-text">
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </h1>
              </div>
              {/* 줄바꿈은 넓은 화면에서만 유지 (좁은 화면에서는 자연스럽게 흐르도록) */}
              {profile.summary && (
                <p className="max-w-2xl text-[1.05rem] leading-[1.85] break-keep text-fg-muted md:whitespace-pre-line">
                  {profile.summary}
                </p>
              )}
              {profile.coreStrengths.length > 0 && (
                <section
                  aria-labelledby="strengths-title"
                  className="flex flex-col gap-3"
                >
                  <h2
                    id="strengths-title"
                    className="text-base font-bold text-fg"
                  >
                    나의 강점
                  </h2>
                  <ol className="flex flex-col gap-2.5">
                    {profile.coreStrengths.map((s, i) => (
                      <li key={s.title} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="w-6 shrink-0 font-display text-sm leading-6 font-semibold text-accent-text"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <h3 className="text-[0.98rem] leading-6 font-semibold text-fg">
                            {s.title}
                          </h3>
                          <p className="text-sm break-keep text-fg-muted">
                            {s.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <HeroProofBadges items={proofBadges} />
              <div className="flex flex-wrap gap-3">
                {/* 대표 프로젝트에 트레일러가 있으면: 이동하면서 바로 재생 (스크롤과 다른 동작이라 버튼으로 둔다) */}
                {featured?.videos[0] ? (
                  <TrailerButton targetId="featured">
                    AI 프로젝트 트레일러 보기
                  </TrailerButton>
                ) : (
                  <ButtonLink
                    href={featured ? "/#featured" : "/#projects"}
                    variant="primary"
                  >
                    {featured ? "대표 프로젝트 보기" : "프로젝트 보기"}
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </ButtonLink>
                )}
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
            </div>

            {/* 히어로 비주얼: 3:4 프로필 사진 카드 */}
            {profile.heroImage && (
              <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-[24rem]">
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.22),transparent_70%)] blur-2xl"
                />
                <div className="relative aspect-[3/4] overflow-hidden rounded-card border border-line shadow-[0_30px_80px_rgb(0_0_0/0.45)] motion-safe:animate-[float_3.5s_ease-in-out_infinite]">
                  <MediaImage
                    image={profile.heroImage}
                    priority
                    fallbackAlt={`${profile.name} 프로필 사진`}
                  />
                </div>
                {/* 수상 증빙: 사진 왼쪽 아래에 겹친 작은 상장 (누르면 크게 보기) */}
                {topAward?.image && (
                  <AwardCertificate
                    title={topAward.title}
                    label={CATEGORY_LABEL[topAward.category]}
                    date={topAward.date}
                    image={topAward.image}
                    className="absolute -bottom-6 -left-4 z-10 sm:-left-10 lg:-left-16"
                  />
                )}
              </div>
            )}
          </Container>
        </section>

        {/* ---------------- ② 대표 프로젝트 ---------------- */}
        {featured && <FeaturedBand project={featured} id="featured" />}
        {featured && (
          <FeaturedPipeline project={featured} id="featured-pipeline" />
        )}

        {/* ---------------- ④ 프로젝트: 분류별로 한 화면씩 ---------------- */}
        {projectSlides.map((slide, i) => {
          const first = i === 0;
          const headingId = first
            ? "projects-title"
            : `projects-${slide.key}-title`;
          return (
            <Fragment key={slide.key}>
              <section
                id={first ? "projects" : `projects-${slide.key}`}
                aria-labelledby={headingId}
                className={SLIDE}
              >
                <Container className="flex w-full flex-col gap-8 [@media(max-height:56rem)]:lg:gap-6">
                  <SectionTitle
                    title={slide.title || "참여한 프로젝트"}
                    id={headingId}
                    description={slide.description}
                    aside={
                      first ? (
                        <ButtonLink
                          href="/projects/"
                          variant="outline"
                          size="sm"
                        >
                          전체 프로젝트
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </ButtonLink>
                      ) : undefined
                    }
                  />
                  <ProjectGrid
                    projects={slide.items}
                    awards={awards.items}
                    headingLevel="h3"
                    compact
                  />
                </Container>
              </section>
              {/* ④-1 AI 업무 자동화: AI 프로젝트 화면 바로 다음 */}
              {slide.key === "ai" && aiAutomation && (
                <ShowcaseSection
                  id="ai-automation"
                  data={aiAutomation}
                  fallback="AI 업무 자동화"
                  columns={3}
                  numberPrefix="AI"
                />
              )}
            </Fragment>
          );
        })}
        {projectSlides.length === 0 && (
          <section
            id="projects"
            aria-labelledby="projects-title"
            className={SLIDE}
          >
            <Container className="flex w-full flex-col gap-8">
              <SectionTitle title="참여한 프로젝트" id="projects-title" />
              <p className="text-fg-subtle">공개된 프로젝트가 없습니다.</p>
            </Container>
          </section>
        )}

        {/* ---------------- ④-2 현업 실무 경험: 프로젝트 화면들 다음 ---------------- */}
        {fieldWork && (
          <ShowcaseSection
            id="career-field"
            data={fieldWork}
            fallback="현업 실무 경험"
            columns={4}
            aspect="portrait"
          />
        )}

        {/* ---------------- ⑤ 게임 디자인을 위한 경험: 플레이 / 현장 한 화면씩 ---------------- */}
        {profile.gamerMetrics.length > 0 && (
          <section
            id="experience"
            aria-labelledby="experience-title"
            className={cx(SLIDE, "bg-bg-alt")}
          >
            <Container className="flex w-full flex-col gap-8 [@media(max-height:56rem)]:lg:gap-6">
              <IntroTitle
                parent="게임 디자인을 위한 경험"
                id="experience-title"
                intro={play}
                fallback="최상위권 플레이 경험"
              />
              <div
                className={cx(
                  "grid gap-10",
                  play?.steam &&
                    "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12",
                )}
              >
                <div className="flex flex-col gap-6">
                  <h3
                    id="gamer-metrics-title"
                    className="self-start rounded-full border border-line-strong px-4 py-1.5 text-base font-semibold text-fg"
                  >
                    {play?.gamesLabel ?? "최상위권 플레이 경험"}
                  </h3>
                  <GamerEmblems
                    items={profile.gamerMetrics}
                    labelledBy="gamer-metrics-title"
                  />
                </div>
                {play?.steam && (
                  <div className="flex min-w-0 flex-col gap-6">
                    {/* Steam 플레이 경험: 아이콘 + 플레이한 게임 수를 따로 강조 */}
                    <h3 className="flex items-center gap-3 self-start rounded-full border border-line-strong py-1 pr-5 pl-1 text-fg">
                      <span
                        aria-hidden="true"
                        className="flex size-9 items-center justify-center rounded-full bg-surface-raised"
                      >
                        <Icon name="steam" className="size-5" />
                      </span>
                      <span className="text-base font-semibold">Steam</span>
                      <span className="text-lg font-bold tracking-[-0.02em] text-accent-text">
                        {play.steam.metric}
                      </span>
                    </h3>
                    <figure className="flex flex-col gap-2">
                      <a
                        href={withBasePath(play.steam.image.src)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-card border border-line-strong transition-colors duration-150 hover:border-accent/60"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={withBasePath(play.steam.image.src)}
                          alt={play.steam.image.alt ?? play.steam.metric}
                          loading="lazy"
                          decoding="async"
                          width={1682}
                          height={1112}
                          className="h-auto w-full"
                        />
                        <span className="sr-only">(원본 이미지 새 창)</span>
                      </a>
                      {play.steam.label && (
                        <figcaption className="text-sm text-fg-muted">
                          {play.steam.label}
                        </figcaption>
                      )}
                    </figure>
                  </div>
                )}
              </div>
            </Container>
          </section>
        )}
        {profile.activities.length > 0 && (
          <section
            id={
              profile.gamerMetrics.length > 0
                ? "experience-field"
                : "experience"
            }
            aria-labelledby="experience-field-title"
            className={cx(SLIDE, "bg-bg-alt")}
          >
            <Container className="flex w-full flex-col gap-8 [@media(max-height:56rem)]:lg:gap-6">
              <IntroTitle
                parent="게임 디자인을 위한 경험"
                id="experience-field-title"
                intro={profile.activityIntro}
                fallback="만들고 경험하는 현장"
              />
              <ActivitiesGrid items={profile.activities} headingLevel="h3" />
            </Container>
          </section>
        )}
      </div>
    </>
  );
}
