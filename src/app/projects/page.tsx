import type { Metadata } from "next";
import { getPublishedProjects } from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectGrid } from "@/components/project/ProjectCards";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "게임 시스템 기획 및 테크니컬 기획 프로젝트 목록",
};

export default function ProjectsPage() {
  const projects = getPublishedProjects();
  return (
    <>
      <PageHeader eyebrow="Projects" title="프로젝트">
        <p>기획부터 구현까지 참여한 게임 프로젝트입니다.</p>
      </PageHeader>
      <Container className="py-14 sm:py-16">
        {projects.length === 0 ? (
          <p className="text-fg-subtle">공개된 프로젝트가 없습니다.</p>
        ) : (
          <ProjectGrid projects={projects} headingLevel="h2" />
        )}
      </Container>
    </>
  );
}
