/**
 * 아이콘 레지스트리
 * 콘텐츠 JSON에는 아이콘 "키"(예: unity, crosshair)만 저장하고, 실제 그래픽은 여기서 결정한다.
 * 알 수 없는 키는 아무것도 렌더링하지 않는다 (콘텐츠 오류가 화면을 깨뜨리지 않도록).
 * 사용 가능한 키 목록은 ICON_KEYS 이다.
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
