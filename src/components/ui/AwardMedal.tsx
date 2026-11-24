import { cx } from "@/lib/cx";

/** 물결 테두리(12개 굴곡) 메달 외곽선: 중심 (50,46), 기본 반지름 40, 굴곡 깊이 3 */
const SEAL_PATH = (() => {
  const n = 120;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = 40 + 3 * Math.cos(12 * t);
    pts.push(
      `${(50 + r * Math.sin(t)).toFixed(2)},${(46 - r * Math.cos(t)).toFixed(2)}`,
    );
  }
  return `M${pts.join("L")}Z`;
})();

/** 다섯 꼭짓점 별 (중심 50,48) */
const STAR_PATH = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const t = (i / 10) * Math.PI * 2;
    const r = i % 2 === 0 ? 15 : 6.5;
    pts.push(
      `${(50 + r * Math.sin(t)).toFixed(2)},${(48 - r * Math.cos(t)).toFixed(2)}`,
    );
  }
  return `M${pts.join("L")}Z`;
})();

/**
 * 수상 메달 아이콘 (장식용 SVG): 금색 물결 테두리 + 어두운 원판 + 왕관·별 + 빨간 리본 두 갈래.
 * 의미는 옆/아래의 수상 문구가 전달하므로 스크린 리더에서는 숨긴다.
 */
export function AwardMedal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      aria-hidden="true"
      focusable="false"
      className={cx("h-auto", className)}
    >
      {/* 리본 (메달 뒤) */}
      <path
        d="M33 70 L18 112 L29 106 L36 117 L48 76 Z"
        className="fill-award-ribbon"
      />
      <path
        d="M67 70 L82 112 L71 106 L64 117 L52 76 Z"
        className="fill-award-ribbon-deep"
      />
      {/* 메달 */}
      <path d={SEAL_PATH} className="fill-award-gold" />
      <circle cx="50" cy="46" r="33" className="fill-award-gold-deep" />
      <circle cx="50" cy="46" r="30" className="fill-bg" />
      <circle
        cx="50"
        cy="46"
        r="26.5"
        fill="none"
        strokeWidth="1"
        className="stroke-award-gold/60"
      />
      {/* 왕관 */}
      <path
        d="M41 32 L41 25 L45.5 28.5 L50 23 L54.5 28.5 L59 25 L59 32 Z"
        className="fill-award-gold"
      />
      {/* 별 */}
      <path
        d={STAR_PATH}
        transform="translate(0 4)"
        className="fill-award-gold"
      />
    </svg>
  );
}
