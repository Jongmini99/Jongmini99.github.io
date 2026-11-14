/**
 * 아이콘 레지스트리
 * CMS에는 아이콘 "키"(예: unity, crosshair)만 저장하고, 실제 그래픽은 여기서 결정한다.
 * 알 수 없는 키는 아무것도 렌더링하지 않는다 (콘텐츠 오류가 화면을 깨뜨리지 않도록).
 * 사용 가능한 키 목록은 ICON_KEYS 이며, CMS 설정의 select 옵션과 맞춘다.
 */
import {
  Award,
  Biohazard,
  Box,
  Briefcase,
  CalendarCheck,
  ChartColumn,
  CodeXml,
  Coins,
  Crosshair,
  Database,
  FileText,
  Gamepad2,
  Layers,
  Link,
  Mail,
  Monitor,
  Rocket,
  Shield,
  Sparkles,
  SquareKanban,
  Swords,
  Target,
  Trophy,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { siConfluence, siGithub, siJira, siLua, siSteam, siUnity, siYoutube, type SimpleIcon } from "simple-icons";

const UI_ICONS = {
  award: Award,
  biohazard: Biohazard,
  box: Box,
  briefcase: Briefcase,
  "calendar-check": CalendarCheck,
  chart: ChartColumn,
  code: CodeXml,
  coins: Coins,
  crosshair: Crosshair,
  database: Database,
  file: FileText,
  gamepad: Gamepad2,
  layers: Layers,
  link: Link,
  mail: Mail,
  monitor: Monitor,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  kanban: SquareKanban,
  swords: Swords,
  target: Target,
  trophy: Trophy,
  users: Users,
  workflow: Workflow,
} satisfies Record<string, LucideIcon>;

const BRAND_ICONS = {
  unity: siUnity,
  lua: siLua,
  github: siGithub,
  youtube: siYoutube,
  steam: siSteam,
  jira: siJira,
  confluence: siConfluence,
} satisfies Record<string, SimpleIcon>;

/** 공식 로고를 쓸 수 없는 기술은 텍스트 모노그램으로 표시 */
const MONOGRAMS: Record<string, string> = {
  csharp: "C#",
  mssql: "SQL",
};

export const ICON_KEYS = [...Object.keys(UI_ICONS), ...Object.keys(BRAND_ICONS), ...Object.keys(MONOGRAMS)];

/** CMS 선택 목록에 표시할 이름 (없으면 키 그대로 표시) */
const ICON_LABELS: Record<string, string> = {
  award: "메달", biohazard: "생물재해(좀비)", box: "상자", briefcase: "서류가방(경력)", "calendar-check": "일정 관리",
  chart: "막대 차트(성장·경제)", code: "코드", coins: "코인(재화)", crosshair: "조준점(전투)", database: "데이터베이스",
  file: "문서", gamepad: "게임패드", layers: "레이어(시스템)", link: "링크", mail: "메일", monitor: "모니터",
  rocket: "로켓(출시)", shield: "방패", sparkles: "반짝임(AI)", kanban: "칸반(협업)", swords: "검(무기)",
  target: "타깃", trophy: "트로피(수상)", users: "사람들(팀)", workflow: "워크플로",
  unity: "Unity 로고", lua: "Lua 로고", github: "GitHub 로고", youtube: "YouTube 로고", steam: "Steam 로고",
  jira: "Jira 로고", confluence: "Confluence 로고", csharp: "C# (텍스트)", mssql: "SQL (텍스트)",
};

export const ICON_OPTIONS = ICON_KEYS.map((value) => ({ value, label: `${ICON_LABELS[value] ?? value} — ${value}` }));

export function hasIcon(name: string | undefined): boolean {
  return !!name && ICON_KEYS.includes(name);
}

type IconProps = {
  name: string | undefined;
  className?: string;
};

/** 장식용 아이콘 (aria-hidden). 의미 전달은 항상 인접 텍스트가 담당한다. */
export function Icon({ name, className = "size-5" }: IconProps) {
  if (!name) return null;

  if (name in UI_ICONS) {
    const Cmp = UI_ICONS[name as keyof typeof UI_ICONS];
    return <Cmp className={className} aria-hidden="true" strokeWidth={1.75} />;
  }

  if (name in BRAND_ICONS) {
    const icon = BRAND_ICONS[name as keyof typeof BRAND_ICONS];
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
        <path d={icon.path} />
      </svg>
    );
  }

  const mono = MONOGRAMS[name];
  if (mono) {
    return (
      <span
        aria-hidden="true"
        className={`${className} inline-flex shrink-0 items-center justify-center rounded-[0.3rem] border border-current font-display text-[0.55em] leading-none font-bold`}
      >
        {mono}
      </span>
    );
  }

  return null;
}
