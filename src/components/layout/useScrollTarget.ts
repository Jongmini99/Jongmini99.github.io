"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 스크롤이 이 시간(ms) 동안 멈추면 이동이 끝난 것으로 본다 */
const IDLE_MS = 200;
/** 이동이 끝나지 않는 경우를 대비한 최대 고정 시간(ms) */
const MAX_MS = 2500;

/**
 * 메뉴·점 내비게이션 클릭으로 섹션을 이동하는 동안 현재 위치 표시를 목표 섹션에 고정한다.
 * 부드러운 스크롤 중 지나가는 섹션(대표 프로젝트 등)이 잠깐씩 현재 위치로 잡혀 표시가 튀는 것을 막는다.
 * 스크롤이 멈추거나(IDLE_MS) 사용자가 직접 스크롤·키 입력을 하면 고정을 풀고 다시 스크롤 위치를 따른다.
 */
export function useScrollTarget(): [string | null, (id: string) => void] {
  const [target, setTarget] = useState<string | null>(null);
  const release = useRef<(() => void) | null>(null);

  const lock = useCallback((id: string) => {
    release.current?.();
    setTarget(id);

    let idle = 0;
    const cleanup = () => {
      window.clearTimeout(idle);
      window.clearTimeout(max);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      release.current = null;
    };
    const unlock = () => {
      cleanup();
      setTarget(null);
    };
    const arm = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(unlock, IDLE_MS);
    };
    const max = window.setTimeout(unlock, MAX_MS);

    window.addEventListener("scroll", arm, { passive: true });
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    arm();
    release.current = cleanup;
  }, []);

  useEffect(() => () => release.current?.(), []);

  return [target, lock];
}
