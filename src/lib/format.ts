import type { Project } from "../content/schema";

/** "2023-03" → "2023.03" */
export function formatYearMonth(ym: string): string {
  return ym.replace("-", ".");
}

/** 개발 기간 표시: "2023.03 ~ 2023.07" / 종료일 없으면 "2023.03 ~ 진행 중" */
export function formatPeriod(period: Project["developmentPeriod"]): string {
  return `${formatYearMonth(period.start)} ~ ${period.end ? formatYearMonth(period.end) : "진행 중"}`;
}
