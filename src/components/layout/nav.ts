/** 사이트 상단 메뉴 정의 (페이지 단위). 메뉴 변경은 이 파일만 수정한다. */
export type NavItem = {
  label: string;
  href: string;
  /** 이 경로(또는 그 하위 경로)에 있을 때 현재 메뉴로 표시 */
  match: string;
};

/** 홈 안의 섹션 이동은 오른쪽 점 내비게이션(SectionSpy)이 맡는다 (2026-11-25) */
export const NAV_ITEMS: NavItem[] = [
  { label: "소개", href: "/#top", match: "/" },
  { label: "프로젝트", href: "/projects/", match: "/projects" },
];
