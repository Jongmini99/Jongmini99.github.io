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

function SectionBody({ section, project }: { section: Section; project: Project }) {
  switch (section.type) {
    case "richText":
      return <RichTextBlock section={section} />;
    case "bulletList":
      return <BulletListBlock section={section} />;
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
      return <Gallery images={project.gallery} label={`${project.title} 이미지 갤러리`} />;
    case "videos":
      return <Videos videos={project.videos} />;
    case "media":
      return (
        <MediaTabs
          label={`${project.title} 미디어`}
          tabs={[
            {
              key: "images",
              label: "이미지 갤러리",
              icon: "image",
              count: project.gallery.length,
              panel: <Gallery images={project.gallery} label={`${project.title} 이미지 갤러리`} />,
            },
            { key: "videos", label: "플레이 영상", icon: "video", count: project.videos.length, panel: <Videos videos={project.videos} /> },
          ]}
        />
      );
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
