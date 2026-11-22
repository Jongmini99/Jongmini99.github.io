/**
 * 섹션 타입 → 컴포넌트 레지스트리.
 * 새 섹션 타입 추가: schema.ts 에 타입 추가 → 블록 컴포넌트 작성 → 아래 switch 에 한 줄 추가.
 */
import type { Project, Section } from "@/content/schema";
import { SectionShell } from "./SectionShell";
import {
  AchievementsBlock,
  BulletListBlock,
  CardsBlock,
  ComparisonBlock,
  DocumentsBlock,
  FlowBlock,
  InfoTableBlock,
  LinksBlock,
  ProjectInfoBlock,
  RichTextBlock,
  RolesBlock,
  TechnologiesBlock,
} from "./blocks";
import { Gallery } from "./Gallery";
import { Videos } from "./Videos";
import { MediaTabs } from "./MediaTabs";
import { galleryRemainder } from "./SectionFigures";

function SectionBody({ section, project }: { section: Section; project: Project }) {
  // 섹션 도표로 이미 보여 준 이미지는 갤러리에서 뺀다.
  const gallery = galleryRemainder(project.gallery, project.sections);
  switch (section.type) {
    case "richText":
      return <RichTextBlock section={section} />;
    case "bulletList":
      return <BulletListBlock section={section} />;
    case "flow":
      return <FlowBlock section={section} />;
    case "cards":
      return <CardsBlock section={section} />;
    case "infoTable":
      return <InfoTableBlock section={section} />;
    case "comparison":
      return <ComparisonBlock section={section} />;
    case "projectInfo":
      return <ProjectInfoBlock project={project} />;
    case "roles":
      return <RolesBlock project={project} />;
    case "technologies":
      return <TechnologiesBlock section={section} project={project} />;
    case "gallery":
      return <Gallery images={gallery} label={`${project.title} 이미지 갤러리`} />;
    case "videos":
      return <Videos videos={project.videos} />;
    case "media": {
      const tabs = [
        {
          key: "images",
          label: "이미지 갤러리",
          icon: "image" as const,
          count: gallery.length,
          panel: <Gallery images={gallery} label={`${project.title} 이미지 갤러리`} />,
        },
        { key: "videos", label: "플레이 영상", icon: "video" as const, count: project.videos.length, panel: <Videos videos={project.videos} /> },
      ].filter((t) => t.count > 0);
      if (tabs.length === 0) return <Gallery images={[]} label={`${project.title} 이미지 갤러리`} />;
      return <MediaTabs label={`${project.title} 미디어`} tabs={tabs} />;
    }
    case "documents":
      return <DocumentsBlock project={project} />;
    case "achievements":
      return <AchievementsBlock project={project} />;
    case "links":
      return <LinksBlock project={project} />;
    default: {
      // 새 타입을 schema에 추가하고 여기서 처리하지 않으면 타입 오류로 알려 준다.
      const unhandled: never = section;
      return unhandled;
    }
  }
}

export function SectionRenderer({ section, project }: { section: Section; project: Project }) {
  return (
    <SectionShell section={section}>
      <SectionBody section={section} project={project} />
    </SectionShell>
  );
}
