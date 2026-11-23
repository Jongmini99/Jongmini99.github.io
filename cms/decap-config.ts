/**
 * Decap CMS 설정 생성기
 *
 * public/admin/config.yml 을 이 파일에서 생성한다 (scripts/prepare-cms.ts).
 * - 콘텐츠 스키마(src/content/schema.ts)와 필드 구성을 맞춰야 한다.
 *   필드를 추가/변경하면 두 파일을 함께 수정한다. 불일치는 빌드 시 zod 검증에서 드러난다.
 * - JSON은 YAML 1.2의 부분집합이므로 config.yml 은 JSON 형식으로 출력한다.
 *
 * 환경 변수 (CI: 저장소 Variables)
 * - DECAP_REPO            : "owner/repo" (기본: GITHUB_REPOSITORY → Jongmini99/Jongmini99.github.io)
 * - DECAP_BRANCH          : 기본 main
 * - DECAP_OAUTH_BASE_URL  : OAuth 프록시(Cloudflare Worker) 주소. 예: https://decap-oauth.<account>.workers.dev
 * - NEXT_PUBLIC_SITE_URL  : 사이트 주소 (관리자 화면의 "사이트 보기" 링크)
 */
import { ICON_OPTIONS } from "../src/components/ui/Icon";

type Field = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/* 필드 헬퍼                                                            */
/* ------------------------------------------------------------------ */

const SLUG_PATTERN = ["^[a-z0-9]+(?:-[a-z0-9]+)*$", "영문 소문자, 숫자, 하이픈(-)만 사용 (예: zombie-project-x)"];
const YM_PATTERN = ["^\\d{4}-(0[1-9]|1[0-2])$", "YYYY-MM 형식 (예: 2023-03)"];
const URL_PATTERN = ["^https?://.+", "http:// 또는 https:// 로 시작하는 주소"];
const YOUTUBE_PATTERN = ["^https?://(www\\.|m\\.)?(youtube\\.com|youtu\\.be|youtube-nocookie\\.com)/.+", "YouTube 영상 주소"];

const req = (f: Field): Field => ({ required: true, ...f });
const opt = (f: Field): Field => ({ ...f, required: false });

const string = (name: string, label: string, extra: Field = {}): Field => req({ name, label, widget: "string", ...extra });
const text = (name: string, label: string, extra: Field = {}): Field => req({ name, label, widget: "text", ...extra });
const markdown = (name: string, label: string, extra: Field = {}): Field =>
  req({
    name,
    label,
    widget: "markdown",
    modes: ["rich_text", "raw"],
    buttons: ["bold", "italic", "link", "heading-three", "heading-four", "bulleted-list", "numbered-list", "code"],
    editor_components: [],
    ...extra,
  });
const bool = (name: string, label: string, def: boolean, extra: Field = {}): Field => ({ name, label, widget: "boolean", default: def, required: false, ...extra });
const number = (name: string, label: string, extra: Field = {}): Field => req({ name, label, widget: "number", value_type: "int", ...extra });
const url = (name: string, label: string, extra: Field = {}): Field => string(name, label, { pattern: URL_PATTERN, ...extra });
const select = (name: string, label: string, options: Array<string | { label: string; value: string }>, extra: Field = {}): Field =>
  req({ name, label, widget: "select", options, ...extra });
const icon = (name = "icon", label = "아이콘"): Field =>
  opt(select(name, label, ICON_OPTIONS, { hint: "선택하지 않으면 아이콘 없이 표시됩니다." }));
const stringList = (name: string, label: string, extra: Field = {}): Field =>
  opt({ name, label, widget: "list", field: string("item", "항목"), default: [], ...extra });

/** 이미지 { src, alt, caption } */
const image = (name: string, label: string, { required = false, altRequired = false, hint }: { required?: boolean; altRequired?: boolean; hint?: string } = {}): Field => ({
  name,
  label,
  widget: "object",
  required,
  collapsed: !required,
  hint,
  summary: "{{fields.alt}}",
  fields: [
    { name: "src", label: "이미지 파일", widget: "image", required, choose_url: false },
    string("alt", "대체 텍스트 (이미지 설명)", {
      required: altRequired,
      hint: "화면을 볼 수 없는 사용자를 위한 설명입니다. 예: 좀비 진영 전투 장면",
    }),
    opt(string("caption", "캡션")),
  ],
});

const link = (): Field[] => [string("label", "표시 이름"), url("url", "주소"), opt(string("description", "설명"))];

/* ------------------------------------------------------------------ */
/* 프로젝트 상세 섹션                                                     */
/* ------------------------------------------------------------------ */

const sectionCommon = (): Field[] => [
  string("title", "섹션 제목"),
  string("id", "섹션 ID (목차 링크용)", {
    pattern: SLUG_PATTERN,
    hint: "영문 소문자·하이픈. 프로젝트 안에서 중복되면 안 됩니다. 예: core-systems",
  }),
  opt(string("eyebrow", "영문 소제목", { hint: "예: OVERVIEW, CORE SYSTEM" })),
  bool("visible", "페이지에 표시", true),
  select(
    "width",
    "데스크톱 폭",
    [
      { label: "전체 폭", value: "full" },
      { label: "절반 폭 (다음 '절반' 섹션과 나란히)", value: "half" },
    ],
    { default: "full" },
  ),
  opt(markdown("intro", "섹션 소개 문단", { hint: "1~2문장 권장. 도표로 보여 줄 수 있는 내용은 글로 반복하지 않습니다." })),
  {
    name: "figures",
    label: "섹션 도표 이미지 (제목 아래 크게 표시)",
    widget: "list",
    required: false,
    default: [],
    summary: "{{fields.alt}}",
    hint: "구조도·플로우차트·전후 비교 화면 등. 2개면 나란히 표시됩니다. 갤러리에 같은 이미지가 있으면 미디어 탭에서는 자동으로 빠집니다.",
    fields: image("x", "", { required: true, altRequired: true }).fields,
  },
];

const sectionType = (name: string, label: string, extra: Field[] = [], hint?: string): Field => ({
  name,
  label,
  widget: "object",
  summary: `{{fields.title}}  ·  ${label}{{fields.visible | ternary('', '  (숨김)')}}`,
  hint,
  fields: [...sectionCommon(), ...extra],
});

const SECTION_TYPES: Field[] = [
  sectionType("richText", "본문 (텍스트 + 이미지)", [markdown("body", "본문"), image("image", "옆에 표시할 이미지 (선택)")]),
  sectionType("bulletList", "목록", [stringList("items", "목록 항목")]),
  sectionType("flow", "흐름 도표 (문제 → 조치 → 결과)", [
    {
      name: "steps",
      label: "단계 (마지막 단계가 강조됨)",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.label}}: {{fields.text}}",
      fields: [string("label", "단계 이름", { hint: "예: 문제 / 조치 / 결과, v1.1" }), string("text", "한 줄 설명")],
    },
  ]),
  sectionType("cards", "카드 묶음 (핵심 시스템 등)", [
    {
      name: "items",
      label: "카드",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.title}}",
      fields: [string("title", "카드 제목"), icon(), stringList("bullets", "요점 목록"), opt(markdown("body", "추가 설명")), image("image", "카드 이미지 (선택)")],
    },
  ]),
  sectionType("infoTable", "정보 표", [
    { name: "rows", label: "행", widget: "list", required: false, default: [], summary: "{{fields.label}}: {{fields.value}}", fields: [string("label", "항목명"), string("value", "값")] },
  ]),
  sectionType("comparison", "대비 카드 (A vs B)", [
    {
      name: "items",
      label: "대비 항목 (처음 2개가 VS로 표시)",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.label}}",
      fields: [string("label", "이름"), opt(text("description", "설명")), image("image", "배경 이미지 (선택)")],
    },
  ]),
  sectionType("projectInfo", "개발 정보 (자동: 플랫폼·기간·팀 등)", [], "프로젝트 기본 정보 필드를 표로 보여 줍니다."),
  sectionType("roles", "담당 역할 (자동: '담당 역할' 필드)"),
  sectionType("technologies", "기술 구현 (자동: '사용 기술' + 구현 내용)", [stringList("items", "구현 내용")]),
  sectionType("media", "미디어 (자동: 갤러리 + 영상 탭)"),
  sectionType("gallery", "이미지 갤러리 (자동)"),
  sectionType("videos", "플레이 영상 (자동)"),
  sectionType("documents", "기획 문서 (자동)"),
  sectionType("achievements", "주요 성과 (자동)"),
  sectionType("links", "외부 링크 (자동)"),
];

/** 새 프로젝트 생성 시 기본으로 채워지는 섹션 템플릿 (요청서의 공통 구조) */
const DEFAULT_SECTIONS = [
  { type: "richText", id: "overview", title: "프로젝트 개요", visible: true, width: "full", body: "프로젝트 개요를 입력하세요." },
  { type: "projectInfo", id: "development-info", title: "개발 정보", visible: true, width: "half" },
  { type: "roles", id: "roles", title: "담당 역할 및 기여", visible: true, width: "half" },
  { type: "comparison", id: "core-gameplay", title: "게임 소개 및 핵심 플레이", visible: false, width: "full", items: [] },
  { type: "cards", id: "core-systems", title: "핵심 시스템 설계", visible: true, width: "full", items: [] },
  { type: "technologies", id: "technical", title: "기술 구현", visible: true, width: "half", items: [] },
  { type: "achievements", id: "achievements", title: "주요 성과", visible: true, width: "half" },
  { type: "media", id: "media", title: "미디어", visible: true, width: "full" },
  { type: "documents", id: "documents", title: "기획 문서 및 자료", visible: true, width: "half" },
  { type: "links", id: "links", title: "외부 링크", visible: true, width: "half" },
];

/* ------------------------------------------------------------------ */
/* 컬렉션                                                               */
/* ------------------------------------------------------------------ */

const projects: Field = {
  name: "projects",
  label: "프로젝트",
  label_singular: "프로젝트",
  description: "프로젝트 추가·수정·삭제. 노출 순서는 '노출 순서' 숫자(작을수록 먼저)로 정합니다. 저장 후 1~3분 뒤 사이트에 반영됩니다.",
  folder: "content/projects",
  extension: "json",
  format: "json",
  create: true,
  delete: true,
  slug: "{{fields.slug}}",
  identifier_field: "title",
  summary: "{{displayOrder}}. {{title}}{{published | ternary('', '  [비공개]')}}{{featured | ternary('  ★대표', '')}}",
  sortable_fields: ["displayOrder", "title"],
  view_filters: [
    { label: "공개", field: "published", pattern: true },
    { label: "비공개", field: "published", pattern: false },
    { label: "대표 프로젝트", field: "featured", pattern: true },
  ],
  editor: { preview: false },
  fields: [
    string("title", "프로젝트명"),
    opt(string("subtitle", "부제 (한 줄 소개)")),
    text("description", "목록용 짧은 소개"),
    string("slug", "주소용 이름 (slug)", { pattern: SLUG_PATTERN, hint: "상세 페이지 주소가 됩니다: /projects/<slug>/" }),
    string("id", "고유 ID", { pattern: SLUG_PATTERN, hint: "처음 만들 때 slug와 같게 입력하고 이후에는 바꾸지 마세요." }),

    bool("published", "공개", false, { hint: "끄면 목록과 상세 페이지가 생성되지 않습니다." }),
    bool("featured", "대표 프로젝트 (메인 노출)", false),
    number("displayOrder", "노출 순서", { default: 100, hint: "작은 숫자가 먼저 표시됩니다. 예: 10, 20, 30" }),

    string("genre", "장르"),
    string("platform", "플랫폼"),
    {
      name: "developmentPeriod",
      label: "개발 기간 (선택)",
      widget: "object",
      required: false,
      collapsed: false,
      hint: "기획 문서처럼 기간 표시가 필요 없으면 시작·종료를 모두 비워 두세요. 종료만 입력할 수는 없습니다.",
      fields: [opt(string("start", "시작 (YYYY-MM)", { pattern: YM_PATTERN })), opt(string("end", "종료 (YYYY-MM, 비우면 '진행 중')", { pattern: YM_PATTERN }))],
    },
    opt(string("developmentType", "개발 형태", { hint: "예: 팀 프로젝트" })),
    opt(number("teamSize", "참여 인원 (명)", { min: 1 })),
    opt(string("teamComposition", "팀 구성", { hint: "예: PM 2명 / 기획·개발 2명 / 아트 2명" })),
    stringList("roles", "담당 역할"),
    stringList("technologies", "사용 기술", { hint: "Unity, C#, Lua 등은 로고 아이콘이 자동 표시됩니다." }),
    opt(
      select(
        "track",
        "홈 프로젝트 분류",
        [
          { label: "게임 기획 & 프로토타입", value: "game" },
          { label: "기획서 & 역기획·분석", value: "document" },
        ],
        { hint: "홈 '프로젝트' 영역에서 묶여 표시될 분류입니다. 비우면 분류 없이 아래쪽에 표시됩니다." },
      ),
    ),
    {
      name: "keyTakeaways",
      label: "카드 3단 요약 (선택)",
      widget: "object",
      required: false,
      collapsed: true,
      hint: "프로젝트 카드 겉면에 표시됩니다. 세 칸을 모두 채우거나 모두 비워 두세요. 각 한 문장 권장.",
      fields: [
        opt(text("problem", "기획 의도 / 문제")),
        opt(text("solution", "구현 / 해결")),
        opt(text("result", "검증 결과")),
      ],
    },

    image("thumbnail", "대표 이미지 (카드용)", { hint: "프로젝트 타일. 권장 1200×800 (3:2)." }),
    image("heroImage", "상세 헤더 / 홈 대표 키아트", { hint: "권장 1920×1080 (16:9). 비우면 대표 이미지를 사용합니다." }),
    {
      name: "gallery",
      label: "이미지 갤러리",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.alt}}",
      hint: "드래그하여 순서를 바꿀 수 있습니다.",
      fields: image("x", "", { required: true, altRequired: true }).fields,
    },
    {
      name: "videos",
      label: "플레이 영상 (YouTube)",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.title}}",
      fields: [string("title", "영상 제목"), string("youtubeUrl", "YouTube 주소", { pattern: YOUTUBE_PATTERN }), opt(string("description", "설명"))],
    },
    {
      name: "documents",
      label: "기획 문서 / 다운로드 자료",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.title}}",
      fields: [
        string("title", "문서 제목"),
        req({ name: "file", label: "파일 (PDF 등)", widget: "file", media_folder: "/public/uploads/documents", public_folder: "/uploads/documents", choose_url: false }),
        opt(string("description", "설명")),
      ],
    },
    { name: "externalLinks", label: "외부 링크", widget: "list", required: false, default: [], summary: "{{fields.label}}", fields: link() },
    {
      name: "achievements",
      label: "주요 성과",
      widget: "list",
      required: false,
      default: [],
      summary: "{{fields.date}} {{fields.title}}",
      fields: [string("title", "성과"), opt(string("date", "시기", { hint: "예: 2024" })), opt(text("description", "설명"))],
    },
    {
      name: "sections",
      label: "상세 페이지 섹션",
      widget: "list",
      required: false,
      typeKey: "type",
      types: SECTION_TYPES,
      default: DEFAULT_SECTIONS,
      hint: "섹션 추가·삭제, 드래그로 순서 변경, '페이지에 표시' 끄기로 숨김. '(자동)' 섹션은 위의 프로젝트 정보 필드를 표시합니다.",
    },
  ],
};

const AWARD_CATEGORIES = [
  { label: "수상", value: "award" },
  { label: "출시", value: "release" },
  { label: "전시", value: "exhibition" },
  { label: "경력", value: "career" },
  { label: "기타", value: "other" },
];

const site: Field = {
  name: "site",
  label: "사이트 정보",
  description: "자기소개, 기술 스택, 경력, 수상, 연락처",
  editor: { preview: false },
  files: [
    {
      name: "profile",
      label: "자기소개",
      file: "content/site/profile.json",
      fields: [
        string("name", "이름"),
        opt(string("roleTitle", "영문 직함", { hint: "예: System & Technical Game Designer" })),
        text("headline", "메인 소개 문구", { hint: "줄바꿈은 데스크톱 화면에서 그대로 유지됩니다." }),
        opt(text("summary", "자기소개", { hint: "줄바꿈은 데스크톱 화면에서 그대로 유지됩니다." })),
        stringList("targetRoles", "목표 직무"),
        image("heroImage", "메인 히어로 비주얼 (선택)", { hint: "홈 첫 화면 오른쪽 프로필 사진 카드. 권장 900×1200 (3:4) 세로 사진." }),
        {
          name: "coreStrengths",
          label: "핵심 강점 (소개 섹션 카드)",
          widget: "list",
          required: false,
          default: [],
          summary: "{{fields.title}}",
          hint: "3개 권장. 비우면 표시되지 않습니다.",
          fields: [string("title", "강점"), opt(string("subtitle", "한 줄 요약")), text("description", "설명 (1문장 권장)"), stringList("keywords", "키워드 배지"), icon()],
        },
        {
          name: "gamerMetrics",
          label: "게임 플레이 지표 (티어·플레이 시간)",
          widget: "list",
          required: false,
          default: [],
          summary: "{{fields.game}} — {{fields.metric}}",
          hint: "확인 가능한 실제 기록만 입력하세요. 비우면 표시되지 않습니다.",
          fields: [string("game", "게임명"), string("metric", "지표", { hint: "예: 마스터 550pt, 1,000시간 이상 플레이" }), opt(string("description", "설명"))],
        },
        {
          name: "activities",
          label: "기획 활동 (동아리·테스터·행사 등)",
          widget: "list",
          required: false,
          default: [],
          summary: "{{fields.title}}",
          hint: "홈 '기획 활동' 섹션에 표시됩니다. 비우면 섹션이 숨겨집니다.",
          fields: [
            string("title", "활동명"),
            string("role", "역할 / 내용"),
            opt(string("organization", "기관·행사")),
            opt(string("period", "시기", { hint: "자유 형식. 예: 2023, 2023 · 2024" })),
            opt(text("description", "설명")),
            stringList("tags", "태그"),
          ],
        },
      ],
    },
    {
      name: "skills",
      label: "기술 스택",
      file: "content/site/skills.json",
      fields: [
        {
          name: "groups",
          label: "기술 분류",
          widget: "list",
          required: false,
          summary: "{{fields.name}}",
          fields: [
            string("name", "분류명"),
            {
              name: "items",
              label: "기술",
              widget: "list",
              required: false,
              summary: "{{fields.name}}",
              fields: [string("name", "기술명"), icon(), bool("highlight", "메인 화면 배지로 표시", false)],
            },
          ],
        },
      ],
    },
    {
      name: "career",
      label: "경력",
      file: "content/site/career.json",
      fields: [
        {
          name: "items",
          label: "경력",
          widget: "list",
          required: false,
          summary: "{{fields.title}} {{fields.period}}",
          fields: [string("title", "직무 / 경력명"), opt(string("organization", "회사·기관")), opt(string("period", "기간", { hint: "자유 형식. 예: 약 2년, 2021.03 ~ 2023.02" })), opt(text("description", "설명"))],
        },
      ],
    },
    {
      name: "awards",
      label: "수상 · 출시 · 전시",
      file: "content/site/awards.json",
      fields: [
        {
          name: "items",
          label: "이력",
          widget: "list",
          required: false,
          summary: "{{fields.title}}",
          fields: [
            string("title", "내용"),
            select("category", "분류", AWARD_CATEGORIES, { default: "other" }),
            opt(string("date", "시기")),
            opt(text("description", "설명")),
            opt(url("url", "관련 링크")),
            bool("highlight", "메인 '주요 성과'에 표시", false),
          ],
        },
      ],
    },
    {
      name: "contact",
      label: "연락처 · 이력서",
      file: "content/site/contact.json",
      fields: [
        opt(string("email", "이메일", { pattern: ["^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", "올바른 이메일 형식"] })),
        opt(url("github", "GitHub 주소")),
        opt({ name: "resume", label: "이력서 파일 (PDF)", widget: "file", media_folder: "/public/uploads/resume", public_folder: "/uploads/resume", choose_url: false, hint: "새 파일을 올리면 교체됩니다." }),
        { name: "links", label: "기타 외부 링크", widget: "list", required: false, summary: "{{fields.label}}", fields: link() },
      ],
    },
    {
      name: "settings",
      label: "사이트 설정 (SEO)",
      file: "content/site/settings.json",
      fields: [string("siteTitle", "사이트 제목"), text("siteDescription", "사이트 설명 (검색 결과용)"), opt({ name: "ogImage", label: "공유 미리보기 이미지", widget: "image", choose_url: false })],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 최상위 설정                                                          */
/* ------------------------------------------------------------------ */

export function buildDecapConfig(env: NodeJS.ProcessEnv = process.env) {
  const repo = env.DECAP_REPO || env.GITHUB_REPOSITORY || "Jongmini99/Jongmini99.github.io";
  const oauthBase = env.DECAP_OAUTH_BASE_URL?.replace(/\/+$/, "");
  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

  return {
    locale: "ko",
    backend: {
      name: "github",
      repo,
      branch: env.DECAP_BRANCH || "main",
      ...(oauthBase ? { base_url: oauthBase, auth_endpoint: "auth" } : {}),
      // 공개 저장소에 필요한 최소 권한. 비공개 저장소라면 "repo"로 변경 (Worker의 ALLOWED_SCOPES도 함께)
      auth_scope: "public_repo",
      commit_messages: {
        create: "content: {{collection}} '{{slug}}' 생성",
        update: "content: {{collection}} '{{slug}}' 수정",
        delete: "content: {{collection}} '{{slug}}' 삭제",
        uploadMedia: "media: {{path}} 업로드",
        deleteMedia: "media: {{path}} 삭제",
      },
    },
    // localhost에서만 사용됨: `npm run cms:local` 로 decap-server 실행 시 로컬 파일에 직접 저장
    local_backend: true,
    media_folder: "public/uploads/images",
    public_folder: "/uploads/images",
    ...(siteUrl ? { site_url: siteUrl, display_url: siteUrl } : {}),
    show_preview_links: false,
    search: true,
    collections: [projects, site],
  };
}
