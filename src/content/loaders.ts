/**
 * 콘텐츠 로더 — 빌드 시점(서버 컴포넌트 / generateStaticParams)에서만 사용한다.
 * 클라이언트 컴포넌트에서 import 하지 않는다 (node:fs 사용).
 *
 * UI는 이 모듈의 함수만 통해 데이터를 얻는다. 저장 형식(JSON 파일)이 바뀌어도
 * 이 파일만 수정하면 페이지·컴포넌트는 영향을 받지 않는다.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  ProjectSchema,
  SITE_FILES,
  type Project,
  type Settings,
  type Profile,
  type Skills,
  type Career,
  type Awards,
  type Contact,
} from "./schema";

export const CONTENT_DIR = path.join(process.cwd(), "content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const SITE_DIR = path.join(CONTENT_DIR, "site");

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`[content] ${path.relative(process.cwd(), file)}\n${detail}`);
    this.name = "ContentError";
  }
}

function readJson(file: string): unknown {
  let raw: string;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    throw new ContentError(file, "파일을 읽을 수 없습니다.");
  }
  try {
    return JSON.parse(raw.replace(/^﻿/, ""));
  } catch (e) {
    throw new ContentError(file, `JSON 형식 오류: ${(e as Error).message}`);
  }
}

function parseFile<T extends z.ZodType>(file: string, schema: T): z.infer<T> {
  const result = schema.safeParse(readJson(file));
  if (!result.success) throw new ContentError(file, z.prettifyError(result.error));
  return result.data;
}

/* ------------------------------------------------------------------ */
/* 프로젝트                                                             */
/* ------------------------------------------------------------------ */

let projectsCache: Project[] | null = null;

/** 공개 여부와 관계없이 모든 프로젝트 (검증 포함). displayOrder → title 순 정렬 */
export function getAllProjects(): Project[] {
  if (projectsCache && process.env.NODE_ENV === "production") return projectsCache;

  const files = fs.existsSync(PROJECTS_DIR)
    ? fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json")).sort()
    : [];

  const projects = files.map((f) => parseFile(path.join(PROJECTS_DIR, f), ProjectSchema));

  // 프로젝트 간 고유성 검사
  for (const key of ["id", "slug"] as const) {
    const seen = new Map<string, string>();
    projects.forEach((p, i) => {
      const prev = seen.get(p[key]);
      if (prev) {
        throw new ContentError(path.join(PROJECTS_DIR, files[i]!), `${key} "${p[key]}"가 ${prev}와 중복됩니다.`);
      }
      seen.set(p[key], files[i]!);
    });
  }

  projects.sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title, "ko"));
  projectsCache = projects;
  return projects;
}

/** 공개된 프로젝트만 */
export function getPublishedProjects(): Project[] {
  return getAllProjects().filter((p) => p.published);
}

/** 공개 + 대표 프로젝트 */
export function getFeaturedProjects(): Project[] {
  return getPublishedProjects().filter((p) => p.featured);
}

/** 공개된 프로젝트 중 slug로 조회. 비공개면 undefined (상세 페이지가 생성되지 않음) */
export function getProjectBySlug(slug: string): Project | undefined {
  return getPublishedProjects().find((p) => p.slug === slug);
}

/** 상세 섹션 중 표시 대상만 */
export function getVisibleSections(project: Project): Project["sections"] {
  return project.sections.filter((s) => s.visible);
}

/* ------------------------------------------------------------------ */
/* 사이트 정보                                                          */
/* ------------------------------------------------------------------ */

type SiteKey = keyof typeof SITE_FILES;

type SiteData = { [K in SiteKey]: z.infer<(typeof SITE_FILES)[K]> };

function getSite<K extends SiteKey>(key: K): SiteData[K] {
  const schema: z.ZodType = SITE_FILES[key];
  return parseFile(path.join(SITE_DIR, `${key}.json`), schema) as SiteData[K];
}

export const getSettings = (): Settings => getSite("settings");
export const getProfile = (): Profile => getSite("profile");
export const getSkills = (): Skills => getSite("skills");
export const getCareer = (): Career => getSite("career");
export const getAwards = (): Awards => getSite("awards");
export const getContact = (): Contact => getSite("contact");

/** 모든 콘텐츠를 한 번에 검증 (scripts/validate-content.ts, CI에서 사용) */
export function validateAllContent(): { projects: number; siteFiles: number } {
  const projects = getAllProjects();
  (Object.keys(SITE_FILES) as SiteKey[]).forEach((k) => getSite(k));
  return { projects: projects.length, siteFiles: Object.keys(SITE_FILES).length };
}

/* ------------------------------------------------------------------ */
/* 다운로드 파일                                                        */
/* ------------------------------------------------------------------ */

/**
 * 사이트 내부 파일("/uploads/...")의 용량 표기 (예: "18.8MB"). 외부 URL이거나 파일이 없으면 undefined.
 * 파일을 교체해도 빌드 시점에 자동으로 다시 계산된다.
 */
export function getFileSizeLabel(mediaPath: string | undefined): string | undefined {
  if (!mediaPath || !mediaPath.startsWith("/")) return undefined;
  const file = path.join(process.cwd(), "public", ...decodeURI(mediaPath).split("/").filter(Boolean));
  try {
    const bytes = fs.statSync(file).size;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`;
    return `${Math.max(1, Math.round(bytes / 1_000))}KB`;
  } catch {
    return undefined;
  }
}
