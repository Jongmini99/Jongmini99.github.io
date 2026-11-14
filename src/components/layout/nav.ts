/** 사이트 내비게이션 정의. 메뉴 변경은 이 파일만 수정한다. */
export type NavItem = { label: string; href: string; /** 활성 판정 기준 경로 (앵커 링크는 없음) */ match?: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/", match: "/" },
  { label: "프로젝트", href: "/projects/", match: "/projects" },
  { label: "소개", href: "/about/", match: "/about" },
  { label: "이력 및 성과", href: "/about/#career" },
  { label: "연락하기", href: "/contact/", match: "/contact" },
];
