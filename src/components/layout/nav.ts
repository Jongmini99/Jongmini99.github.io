/** 사이트 내비게이션 정의. 메뉴 변경은 이 파일만 수정한다. */
export type NavItem = {
  label: string;
  href: string;
  /** 홈 한 페이지 안의 섹션 id (스크롤 위치로 현재 메뉴 표시) */
  section?: string;
  /** 다른 페이지에서 활성으로 볼 경로 (예: 프로젝트 상세) */
  match?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "프로젝트", href: "/#featured", section: "projects", match: "/projects" },
  { label: "수상", href: "/#award", section: "award" },
  { label: "경험", href: "/#experience", section: "experience" },
  { label: "이력 및 성과", href: "/#career", section: "career" },
  { label: "연락하기", href: "/#contact", section: "contact" },
];

/** 홈에서 스크롤 위치 추적 대상 (대표 프로젝트 화면은 '프로젝트' 메뉴로 표시) */
export const SECTION_TO_NAV: Record<string, string> = {
  featured: "projects",
  award: "award",
  projects: "projects",
  experience: "experience",
  career: "career",
  contact: "contact",
};
