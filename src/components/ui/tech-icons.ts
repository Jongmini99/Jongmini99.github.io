/**
 * 기술 이름 → 아이콘 키 추론 (프로젝트 technologies 는 문자열 배열이므로).
 * 사이트 기술 스택(skills.json)은 아이콘 키를 직접 지정할 수 있다.
 */
const MAP: Record<string, string> = {
  unity: "unity",
  "c#": "csharp",
  lua: "lua",
  "ms-sql": "mssql",
  mssql: "mssql",
  jira: "jira",
  confluence: "confluence",
};

export function techIcon(name: string): string | undefined {
  return MAP[name.trim().toLowerCase()];
}
