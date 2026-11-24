"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "./nav";
import { buttonClass } from "@/components/ui/Button";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";
import type { Contact } from "@/content/schema";
import { ContactDialog } from "./ContactDialog";

const normalize = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

/** 현재 메뉴 판정: 페이지 경로 기준 (홈 → 소개, /projects/… → 프로젝트) */
function activeState(pathname: string, item: NavItem): "page" | undefined {
  const path = normalize(pathname);
  return path === item.match || (item.match !== "/" && path.startsWith(`${item.match}/`)) ? "page" : undefined;
}

export function HeaderNav({ resume, contact }: { resume?: string; contact: Contact }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 페이지 이동 시 모바일 메뉴 닫기
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Esc 닫기 + 포커스 관리
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const resumeButton = resume && (
    <a href={withBasePath(resume)} download className={buttonClass({ variant: "outline", size: "sm" })}>
      <Download className="size-4" aria-hidden="true" />
      포트폴리오 PDF
    </a>
  );

  return (
    <>
      {/* 데스크톱 메뉴: 페이지 단위(소개 / 프로젝트). 홈 안의 섹션 이동은 오른쪽 점 내비게이션(SectionSpy)이 맡는다 */}
      <nav aria-label="주요 메뉴" className="absolute left-1/2 hidden h-full -translate-x-1/2 lg:block">
        <ul className="flex h-full items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const current = activeState(pathname, item);
            return (
              <li key={item.href} className="h-full">
                <Link
                  href={item.href}
                  aria-current={current}
                  className={cx(
                    "relative flex h-full items-center px-4 text-[0.95rem] transition-colors duration-150",
                    current ? "font-semibold text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {item.label}
                  {current && <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-0.5 bg-accent" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden lg:block">{resumeButton}</div>
        {/* 연락하기: 작은 버튼 → 연락처 대화상자 (모든 화면 크기) */}
        <ContactDialog contact={contact} onOpen={() => setOpen(false)} />

        {/* 모바일 토글 */}
        <button
        ref={toggleRef}
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-control text-fg hover:bg-surface lg:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        <span className="sr-only">{open ? "메뉴 닫기" : "메뉴 열기"}</span>
      </button>
      </div>

      {/* 모바일 패널 */}
      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-bg/95 backdrop-blur-md lg:hidden"
      >
        <nav aria-label="주요 메뉴" className="mx-auto max-w-(--container-content) px-4 py-4 sm:px-6">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const current = activeState(pathname, item);
              const active = current !== undefined;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current}
                    onClick={() => setOpen(false)}
                    className={cx(
                      "flex h-12 items-center rounded-control px-3",
                      active ? "bg-accent-soft font-semibold text-fg" : "text-fg-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {resumeButton && <div className="mt-4 border-t border-line pt-4">{resumeButton}</div>}
        </nav>
      </div>
    </>
  );
}
