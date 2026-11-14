import { getAwards, getContact, getFeaturedProjects, getProfile, getSkills } from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Typography";
import { TechBadge } from "@/components/ui/Badge";
import { MediaImage } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { FeaturedProjectCard } from "@/components/project/ProjectCards";
import { ContactActions, HighlightList } from "@/components/profile/ProfileBlocks";

export default function HomePage() {
  const profile = getProfile();
  const skills = getSkills();
  const featured = getFeaturedProjects();
  const highlights = getAwards().items.filter((a) => a.highlight);
  const contact = getContact();
  const heroSkills = skills.groups.flatMap((g) => g.items).filter((s) => s.highlight);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="absolute inset-0">
          {profile.heroImage ? (
            <div className="absolute inset-y-0 right-0 w-full opacity-60 lg:w-[62%]">
              <MediaImage image={profile.heroImage} decorative priority />
            </div>
          ) : (
            // 배경 이미지 미등록 시: 장식용 그리드 패턴
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_75%_40%,black,transparent_70%)] bg-size-[56px_56px]" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-bg via-bg/80 to-transparent" />
          <div className="absolute -top-40 right-0 size-[36rem] rounded-full bg-accent/10 blur-3xl" />
        </div>

        <Container className="relative flex flex-col gap-7 py-16 sm:py-24 lg:py-28">
          {profile.roleTitle && <Eyebrow>{profile.roleTitle}</Eyebrow>}
          <h1 id="hero-title" className="max-w-3xl text-display font-extrabold tracking-tight text-fg">
            {profile.headline}
          </h1>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-2xl font-bold text-fg">{profile.name}</span>
            {profile.targetRoles.length > 0 && (
              <>
                <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong sm:block" />
                <span className="w-full text-fg-muted sm:w-auto">{profile.targetRoles.join(" / ")}</span>
              </>
            )}
          </p>
          {/* 줄바꿈은 넓은 화면에서만 유지 (좁은 화면에서는 자연스럽게 흐르도록) */}
          {profile.summary && <p className="max-w-2xl text-[1.05rem] leading-[1.8] text-fg-muted md:whitespace-pre-line">{profile.summary}</p>}
          {heroSkills.length > 0 && (
            <ul aria-label="핵심 기술 스택" className="flex flex-wrap gap-2.5">
              {heroSkills.map((s) => (
                <li key={s.name}>
                  <TechBadge name={s.name} icon={s.icon} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* ---------------- Featured project ---------------- */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-title">
          <Container className="flex flex-col gap-5 pt-14 sm:pt-16">
            <div className="flex items-end justify-between gap-4">
              <h2 id="featured-title">
                <Eyebrow>Featured Project</Eyebrow>
              </h2>
              <ButtonLink href="/projects/" variant="ghost" size="sm">
                전체 프로젝트
              </ButtonLink>
            </div>
            <div className="flex flex-col gap-5">
              {featured.map((p) => (
                <FeaturedProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------------- Highlights & Contact ---------------- */}
      <Container className="flex flex-col gap-12 pt-14 sm:pt-16">
        {highlights.length > 0 && (
          <section aria-labelledby="highlights-title" className="flex flex-col gap-5">
            <h2 id="highlights-title" className="flex items-center gap-3 border-b border-line pb-4 text-lg font-bold text-fg">
              <span aria-hidden="true" className="h-3.5 w-1 -skew-x-[20deg] bg-accent" />
              주요 성과
            </h2>
            <HighlightList items={highlights} />
          </section>
        )}
        <section aria-labelledby="contact-title" className="flex flex-col gap-5">
          <h2 id="contact-title" className="border-b border-line pb-4">
            <Eyebrow>Contact</Eyebrow>
          </h2>
          <ContactActions contact={contact} />
        </section>
      </Container>
    </>
  );
}
