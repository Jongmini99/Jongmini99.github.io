"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Mail, Phone, X } from "lucide-react";
import type { Contact } from "@/content/schema";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * 상단 바의 작은 "연락하기" 버튼 + 연락처 대화상자(<dialog>).
 * - Esc로 닫고, 닫으면 버튼으로 포커스가 돌아간다 (네이티브 dialog 동작)
 * - 주소가 #contact 이면 자동으로 연다 (예전 /contact/ 주소 호환)
 * - 메일 주소는 누르면 클립보드에 복사된다
 */
export function ContactDialog({ contact, className, onOpen }: { contact: Contact; className?: string; onOpen?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rows = [
    contact.phone && { label: "TEL", value: contact.phone, href: `tel:${contact.phone.replace(/[^0-9+]/g, "")}`, icon: <Phone className="size-5" /> },
    contact.email && { label: "E-mail", value: contact.email, icon: <Mail className="size-5" />, copy: true },
    contact.github && {
      label: "GitHub",
      value: contact.github.replace(/^https?:\/\//, ""),
      href: contact.github,
      icon: <Icon name="github" className="size-5" />,
      external: true,
    },
  ].filter((r) => !!r) as { label: string; value: string; href?: string; icon: React.ReactNode; external?: boolean; copy?: boolean }[];

  // 메일 주소 복사: 성공하면 2초간 "복사됨" 표시
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 API를 쓸 수 없는 환경(비보안 컨텍스트 등) 대비
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      dialogRef.current?.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
  };

  const open = () => {
    onOpen?.();
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  };

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === "#contact" && !dialogRef.current?.open) dialogRef.current?.showModal();
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const onClose = () => {
    if (window.location.hash === "#contact") history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  return (
    <>
      <button type="button" onClick={open} aria-haspopup="dialog" className={cx(buttonClass({ variant: "outline", size: "sm" }), className)}>
        <Mail className="size-4" aria-hidden="true" />
        연락하기
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="contact-dialog-title"
        onClose={onClose}
        onClick={(e) => {
          // 바깥(배경) 클릭 시 닫기
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card border border-line bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 id="contact-dialog-title" className="text-2xl font-bold tracking-[-0.03em] text-fg">
                연락하기
              </h2>
              <p className="text-fg-muted">채용 및 협업 관련 문의를 환영합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface-raised hover:text-fg"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">닫기</span>
            </button>
          </div>

          {/* 연락 수단 3개: 전화 · 메일 · GitHub */}
          <ul className="flex flex-col gap-2">
            {rows.map((r) => {
              const rowClass =
                "group flex w-full items-center gap-4 rounded-card border border-line bg-bg/40 px-4 py-3.5 text-left transition-colors duration-150 hover:border-accent/60";
              const body = (
                <>
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    {r.icon}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-semibold text-fg-muted">{r.label}</span>
                    <span className="truncate font-display font-semibold text-fg">{r.value}</span>
                  </span>
                </>
              );
              return (
                <li key={r.label}>
                  {r.copy ? (
                    <button type="button" onClick={() => copy(r.value)} className={rowClass}>
                      {body}
                      <span className={cx("ml-auto flex shrink-0 items-center gap-1.5 text-xs font-semibold", copied ? "text-accent-text" : "text-fg-muted group-hover:text-accent-text")}>
                        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                        {copied ? "복사됨" : "복사"}
                      </span>
                    </button>
                  ) : (
                    <a href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={rowClass}>
                      {body}
                      {r.external && (
                        <>
                          <ArrowUpRight className="ml-auto size-5 shrink-0 text-fg-muted group-hover:text-accent-text" aria-hidden="true" />
                          <span className="sr-only">(새 창)</span>
                        </>
                      )}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          {/* 복사 결과 안내 (스크린 리더) */}
          <p role="status" aria-live="polite" className="sr-only">
            {copied ? "메일 주소를 복사했습니다." : ""}
          </p>
        </div>
      </dialog>
    </>
  );
}
