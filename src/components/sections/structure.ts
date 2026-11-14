/**
 * 섹션 배치·목차 계산 (순수 함수 — UI와 무관하게 테스트 가능)
 */
import type { Section } from "@/content/schema";

export type SectionRow = { kind: "full"; section: Section } | { kind: "pair"; sections: [Section, Section] };

/** 연속된 half 섹션 두 개를 한 행으로 묶는다. 짝이 없는 half는 전체 폭으로 표시. */
export function groupSections(sections: Section[]): SectionRow[] {
  const rows: SectionRow[] = [];
  for (let i = 0; i < sections.length; i++) {
    const cur = sections[i]!;
    const next = sections[i + 1];
    if (cur.width === "half" && next?.width === "half") {
      rows.push({ kind: "pair", sections: [cur, next] });
      i++;
    } else {
      rows.push({ kind: "full", section: cur });
    }
  }
  return rows;
}

/** 카드 섹션의 개별 카드 앵커 id */
export const cardAnchorId = (sectionId: string, index: number) => `${sectionId}-${index + 1}`;

export type TocEntry = { id: string; title: string; children: { id: string; title: string }[] };

export function buildToc(sections: Section[]): TocEntry[] {
  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    children: s.type === "cards" ? s.items.map((c, i) => ({ id: cardAnchorId(s.id, i), title: c.title })) : [],
  }));
}
