/**
 * 콘텐츠 스키마 — 사이트 데이터 타입의 단일 출처(Single Source of Truth)
 *
 * - content/ 폴더의 JSON(관리자 CMS가 수정)은 빌드 시 이 스키마로 검증된다.
 * - 검증 실패 시 빌드가 중단되어, 잘못된 데이터가 배포되지 않는다.
 * - 필드를 추가할 때는 optional로 추가해 기존 콘텐츠와의 호환성을 유지한다.
 * - CMS 설정(cms/decap-config.ts → public/admin/config.yml 생성)의 필드와 이 스키마를 함께 수정해야 한다.
 */
import { z } from "zod";
import { parseYouTubeId } from "../lib/youtube";

/* ------------------------------------------------------------------ */
/* 공통 원시 타입                                                       */
/* ------------------------------------------------------------------ */

/** CMS는 비워 둔 선택 필드를 "" 또는 null로 저장할 수 있으므로 undefined로 정규화한다. */
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const text = z.string().trim().min(1, "비어 있을 수 없습니다.");
const optionalText = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

/** 빈 배열 기본값 (CMS가 필드를 생략해도 안전하게 처리) */
const list = <T extends z.ZodType>(item: T) =>
  z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(item));

/** 사이트 내부 파일("/uploads/...") 또는 외부 URL */
export const MediaPath = z
  .string()
  .trim()
  .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
    message: '"/"로 시작하는 사이트 내부 경로 또는 http(s) URL이어야 합니다.',
  });
const optionalMedia = z.preprocess(emptyToUndefined, MediaPath.optional());

/** "YYYY-MM" */
export const YearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, '"YYYY-MM" 형식이어야 합니다. 예: 2023-03');

export const Slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.");

/* ------------------------------------------------------------------ */
/* 미디어 / 링크                                                        */
/* ------------------------------------------------------------------ */

export const ImageSchema = z.object({
  src: MediaPath,
  /** 대체 텍스트. CMS 갤러리에서는 필수 입력, 그 외 비어 있으면 UI가 문맥(제목 등)으로 대체한다. */
  alt: optionalText,
  caption: optionalText,
});

/** 선택 이미지: CMS가 비워 둔 { src: "" } 객체도 "이미지 없음"으로 처리 */
const optionalImage = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "object" && !(v as { src?: unknown }).src) return undefined;
  return v;
}, ImageSchema.optional());

export const VideoSchema = z.object({
  title: text,
  youtubeUrl: z.url().refine((v) => parseYouTubeId(v) !== null, {
    message: "유효한 YouTube 영상 URL이 아닙니다.",
  }),
  description: optionalText,
});

export const DocumentSchema = z.object({
  title: text,
  file: MediaPath,
  description: optionalText,
});

export const LinkSchema = z.object({
  label: text,
  url: z.url(),
  description: optionalText,
});

export const AchievementSchema = z.object({
  title: text,
  date: optionalText, // 자유 형식 (예: "2024", "2024.05")
  description: optionalText,
});

/* ------------------------------------------------------------------ */
/* 프로젝트 상세 섹션                                                    */
/* ------------------------------------------------------------------ */

/** 모든 섹션 공통 필드 */
const sectionBase = {
  /** 목차 앵커 및 React key. 프로젝트 내에서 고유해야 한다. */
  id: Slug,
  title: text,
  /** 영문 소제목 (예: OVERVIEW) — 선택 */
  eyebrow: optionalText,
  /** false면 페이지와 목차에서 숨김 */
  visible: z.boolean().default(true),
  /** 섹션 상단 소개 문단 (Markdown) */
  intro: optionalText,
  /** 데스크톱 레이아웃 폭. half는 인접한 half 섹션과 2열로 배치된다. */
  width: z.enum(["full", "half"]).default("full"),
  /** 섹션 도표: 제목·소개 아래에 크게 표시하는 이미지 (구조도·플로우차트·전후 비교 등). 2개면 2열. */
  figures: list(ImageSchema),
};

/** 흐름 도표 한 단계 (예: 문제 → 조치 → 결과, v0 → v1.3) */
export const FlowStepSchema = z.object({
  /** 단계 이름 (짧게: 문제 / 조치 / 결과 / v1.1 등) */
  label: text,
  /** 한 줄 설명 */
  text: text,
});

export const CardItemSchema = z.object({
  title: text,
  body: optionalText, // Markdown
  bullets: list(text),
  /** 아이콘 키 (UI 아이콘 레지스트리에서 해석). 알 수 없는 키는 무시된다. */
  icon: optionalText,
  image: optionalImage,
});

export const SectionSchema = z.discriminatedUnion("type", [
  /* --- 직접 작성하는 콘텐츠 섹션 --- */
  z.object({ ...sectionBase, type: z.literal("richText"), body: text, image: optionalImage }),
  z.object({ ...sectionBase, type: z.literal("bulletList"), items: list(text) }),
  /** 단계를 화살표로 이은 흐름 도표. 마지막 단계가 강조된다. */
  z.object({ ...sectionBase, type: z.literal("flow"), steps: list(FlowStepSchema) }),
  z.object({ ...sectionBase, type: z.literal("cards"), items: list(CardItemSchema) }),
  z.object({
    ...sectionBase,
    type: z.literal("infoTable"),
    rows: list(z.object({ label: text, value: text })),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("comparison"),
    /** 비대칭 구조 등 두 대상의 대비 (예: 인간 진영 vs 좀비 진영) */
    items: list(
      z.object({
        label: text,
        description: optionalText,
        image: optionalImage,
      }),
    ),
  }),

  /* --- 프로젝트 공통 필드를 이 위치에 렌더링하는 섹션 --- */
  z.object({ ...sectionBase, type: z.literal("projectInfo") }),
  z.object({ ...sectionBase, type: z.literal("roles") }),
  /** technologies 배지 + 구현 내용 목록(items) */
  z.object({ ...sectionBase, type: z.literal("technologies"), items: list(text) }),
  z.object({ ...sectionBase, type: z.literal("gallery") }),
  z.object({ ...sectionBase, type: z.literal("videos") }),
  /** gallery + videos 를 탭으로 묶어 표시 */
  z.object({ ...sectionBase, type: z.literal("media") }),
  z.object({ ...sectionBase, type: z.literal("documents") }),
  z.object({ ...sectionBase, type: z.literal("achievements") }),
  z.object({ ...sectionBase, type: z.literal("links") }),
]);

export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section["type"];

/* ------------------------------------------------------------------ */
/* 프로젝트                                                             */
/* ------------------------------------------------------------------ */

/** 홈 프로젝트 영역의 분류: 게임 제작·프로토타입 / 기획서·역기획·BM 분석 */
export const PROJECT_TRACKS = ["game", "document"] as const;
export type ProjectTrack = (typeof PROJECT_TRACKS)[number];

/** 카드 겉면에 노출하는 3단 요약 (기획 의도/문제 → 구현/해결 → 검증 결과) */
export const KeyTakeawaysSchema = z.object({
  problem: text,
  solution: text,
  result: text,
});

/** 3칸이 모두 비어 있으면 "요약 없음"으로 처리 (CMS가 빈 객체를 저장하는 경우) */
const optionalTakeaways = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "object") {
    const { problem, solution, result } = v as Record<string, unknown>;
    if (!problem && !solution && !result) return undefined;
  }
  return v;
}, KeyTakeawaysSchema.optional());

export const ProjectSchema = z
  .object({
    id: Slug,
    slug: Slug,
    title: text,
    subtitle: optionalText,
    /** 목록 카드에 쓰이는 짧은 소개 */
    description: text,
    thumbnail: optionalImage,
    /** 상세 페이지 헤더 이미지. 없으면 thumbnail → 플레이스홀더 순으로 대체 */
    heroImage: optionalImage,
    gallery: list(ImageSchema),
    videos: list(VideoSchema),
    genre: text,
    platform: text,
    /**
     * 개발 기간 (선택). 기획 문서처럼 기간이 의미 없는 항목은 비워 두면 UI에서 숨겨진다.
     * CMS가 비워 둔 { start: "", end: "" } 객체도 "기간 없음"으로 처리한다.
     */
    developmentPeriod: z.preprocess(
      (v) => {
        if (v === null || v === undefined || v === "") return undefined;
        if (typeof v === "object") {
          const { start, end } = v as { start?: unknown; end?: unknown };
          if (!start && !end) return undefined;
        }
        return v;
      },
      z
        .object({
          // 시작 없이 종료만 입력한 경우 형식 오류 대신 원인을 바로 알려 준다.
          start: z
            .string()
            .min(1, { message: "종료만 입력할 수 없습니다. 시작(YYYY-MM)을 입력하거나 종료도 비워 두세요.", abort: true })
            .pipe(YearMonth),
          end: z.preprocess(emptyToUndefined, YearMonth.optional()), // 없으면 "진행 중"
        })
        .optional(),
    ),
    developmentType: optionalText, // 예: 팀 프로젝트
    teamSize: z.preprocess(emptyToUndefined, z.number().int().positive().optional()),
    teamComposition: optionalText, // 예: PM 2명 / 기획·개발 2명 / 아트 2명
    roles: list(text),
    technologies: list(text),
    /** 홈 프로젝트 분류 (선택). 비우면 분류 없는 목록으로 표시 */
    track: z.preprocess(emptyToUndefined, z.enum(PROJECT_TRACKS).optional()),
    /** 카드 3단 요약 (선택) */
    keyTakeaways: optionalTakeaways,
    sections: list(SectionSchema),
    achievements: list(AchievementSchema),
    documents: list(DocumentSchema),
    externalLinks: list(LinkSchema),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
    /** 작을수록 먼저 노출 */
    displayOrder: z.number().int().default(100),
  })
  .superRefine((p, ctx) => {
    const ids = new Set<string>();
    p.sections.forEach((s, i) => {
      if (ids.has(s.id)) {
        ctx.addIssue({ code: "custom", path: ["sections", i, "id"], message: `섹션 id "${s.id}"가 중복됩니다.` });
      }
      ids.add(s.id);
    });
    const period = p.developmentPeriod;
    if (period?.end && period.end < period.start) {
      ctx.addIssue({ code: "custom", path: ["developmentPeriod", "end"], message: "종료일이 시작일보다 빠릅니다." });
    }
  });

export type Project = z.infer<typeof ProjectSchema>;

/* ------------------------------------------------------------------ */
/* 사이트 정보 (content/site/*.json)                                     */
/* ------------------------------------------------------------------ */

export const SettingsSchema = z.object({
  siteTitle: text,
  siteDescription: text,
  /** OG 기본 이미지 (선택) */
  ogImage: optionalMedia,
});

/** 소개 섹션: 핵심 강점 카드 */
export const CoreStrengthSchema = z.object({
  title: text,
  subtitle: optionalText,
  description: text,
  /** 키워드 배지 (설명을 짧게 유지하고 요점은 배지로) */
  keywords: list(text),
  icon: optionalText,
});

/** 소개 섹션: 게임 플레이 지표 (티어·플레이 시간 등) */
export const GamerMetricSchema = z.object({
  game: text,
  /** 예: "마스터 550pt", "1,000시간 이상" */
  metric: text,
  description: optionalText,
});

/** 기획 활동 (동아리·테스터·행사 참관·특강 등) */
export const ActivityItemSchema = z.object({
  title: text,
  role: text,
  organization: optionalText,
  period: optionalText,
  description: optionalText,
  tags: list(text),
});

export const ProfileSchema = z.object({
  name: text,
  /** 영문 직함 (예: System & Technical Game Designer) */
  roleTitle: optionalText,
  /** 메인 한 줄 소개 */
  headline: text,
  /** 자기소개 (Markdown) */
  summary: optionalText,
  targetRoles: list(text),
  /** 메인 히어로 비주얼 (선택) — 첫 화면 오른쪽 원형 영역 */
  heroImage: optionalImage,
  /** 핵심 강점 카드 (비우면 숨김) */
  coreStrengths: list(CoreStrengthSchema),
  /** 게임 플레이 지표 (비우면 숨김) */
  gamerMetrics: list(GamerMetricSchema),
  /** 기획 활동 (비우면 홈 '기획 활동' 섹션 숨김) */
  activities: list(ActivityItemSchema),
});

export const SkillsSchema = z.object({
  groups: list(
    z.object({
      name: text,
      items: list(
        z.object({
          name: text,
          icon: optionalText,
          /** 메인 히어로에 배지로 노출 */
          highlight: z.boolean().default(false),
        }),
      ),
    }),
  ),
});

export const CareerSchema = z.object({
  items: list(
    z.object({
      title: text,
      organization: optionalText,
      period: optionalText, // 자유 형식 (예: "약 2년", "2021.03 ~ 2023.02")
      description: optionalText,
    }),
  ),
});

export const AwardsSchema = z.object({
  items: list(
    z.object({
      title: text,
      category: z.enum(["award", "release", "exhibition", "career", "other"]).default("other"),
      date: optionalText,
      description: optionalText,
      url: optionalUrl,
      /** 메인 "주요 성과"에 노출 */
      highlight: z.boolean().default(false),
    }),
  ),
});

export const ContactSchema = z.object({
  email: z.preprocess(emptyToUndefined, z.email().optional()),
  github: optionalUrl,
  /** 이력서 파일 경로 ("/uploads/resume/...pdf") */
  resume: optionalMedia,
  links: list(LinkSchema),
});

export type Settings = z.infer<typeof SettingsSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type Career = z.infer<typeof CareerSchema>;
export type Awards = z.infer<typeof AwardsSchema>;
export type Contact = z.infer<typeof ContactSchema>;

export const SITE_FILES = {
  settings: SettingsSchema,
  profile: ProfileSchema,
  skills: SkillsSchema,
  career: CareerSchema,
  awards: AwardsSchema,
  contact: ContactSchema,
} as const;
