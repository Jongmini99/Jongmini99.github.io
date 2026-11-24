import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublishedProjects, getVisibleSections } from "@/content/loaders";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectPipeline } from "@/components/project/ProjectPipeline";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { ProjectTocDesktop, ProjectTocMobile } from "@/components/sections/ProjectToc";
import { buildToc, groupSections } from "@/components/sections/structure";
import { Container } from "@/components/layout/Container";

type Params = { slug: string };

/** 공개 프로젝트마다 정적 페이지 생성. 관리자에서 프로젝트를 추가하면 다음 빌드에서 자동 생성된다. */
export const dynamicParams = false;

/** 공개 프로젝트가 하나도 없을 때도 정적 내보내기가 실패하지 않도록 하는 자리표시 slug */
const EMPTY_SENTINEL = "__none__";

export function generateStaticParams(): Params[] {
  const projects = getPublishedProjects();
  return projects.length > 0 ? projects.map((p) => ({ slug: p.slug })) : [{ slug: EMPTY_SENTINEL }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const image = project.thumbnail ?? project.heroImage;
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      ...(image ? { images: [{ url: image.src.replace(/^\//, ""), alt: image.alt }] } : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const sections = getVisibleSections(project);
  const toc = buildToc(sections);
  const rows = groupSections(sections);

  return (
    <article data-toc-page>
      <ProjectHeader project={project} />
      {project.pipeline && <ProjectPipeline pipeline={project.pipeline} />}
      {toc.length > 0 && <ProjectTocMobile entries={toc} />}

      <Container className="grid gap-10 py-10 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-12 lg:py-14">
        <aside className="hidden lg:block">{toc.length > 0 && <ProjectTocDesktop entries={toc} />}</aside>

        <div className="flex min-w-0 flex-col gap-14">
          {rows.map((row) =>
            row.kind === "full" ? (
              <SectionRenderer key={row.section.id} section={row.section} project={project} />
            ) : (
              <div key={row.sections[0].id} className="grid gap-14 md:grid-cols-2 md:gap-6">
                {row.sections.map((s) => (
                  <SectionRenderer key={s.id} section={s} project={project} />
                ))}
              </div>
            ),
          )}
        </div>
      </Container>
    </article>
  );
}
