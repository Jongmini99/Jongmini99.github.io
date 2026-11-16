import type { Project } from "../content/schema";

/** "2023-03" → "2023.03" */
export function formatYearMonth(ym: string): string {
  return ym.replace("-", ".");
}

type Period = Project["developmentPeriod"];

/** 개발 기간 표시: "2023.03 ~ 2023.07" / 종료일 없으면 "2023.03 ~ 진행 중" / 기간 미입력 시 undefined */
export function formatPeriod(period: NonNullable<Period>): string;
export function formatPeriod(period: Period): string | undefined;
export function formatPeriod(period: Period): string | undefined {
  if (!period) return undefined;
  return `${formatYearMonth(period.start)} ~ ${period.end ? formatYearMonth(period.end) : "진행 중"}`;
}
