"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, Mail, Phone, X } from "lucide-react";
import type { Contact } from "@/content/schema";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * 상단 바의 작은 "연락하기" 버튼 + 연락처 대화상자(<dialog>).
 * - Esc로 닫고, 닫으면 버튼으로 포커스가 돌아간다 (네이티브 dialog 동작)
 * - 주소가 #contact 이면 자동으로 연다 (예전 /contact/ 주소 호환)
 */
export function ContactDialog({ contact, className, onOpen }: { contact: Contact; className?: string; onOpen?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rows = [
    contact.phone && { label: "TEL", value: contact.phone, href: `tel:${contact.phone.replace(/[^0-9+]/g, "")}`, icon: <Phone className="size-5" /> },
    contact.email && { label: "E-mail", value: contact.email, href: `mailto:${contact.email}`, icon: <Mail className="size-5" /> },
    contact.github && {
      label: "GitHub",
      value: contact.github.replace(/^https?:\/\//, ""),
      href: contact.github,
      icon: <Icon name="github" className="size-5" />,
      external: true,
    },
  ].filter((r) => !!r) as { label: string; value: string; href: string; icon: React.ReactNode; external?: boolean }[];

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
            {rows.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-card border border-line bg-bg/40 px-4 py-3.5 transition-colors duration-150 hover:border-accent/60"
                >
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    {r.icon}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-semibold text-fg-muted">{r.label}</span>
                    <span className="truncate font-display font-semibold text-fg">{r.value}</span>
                  </span>
                  {r.external && (
                    <>
                      <ArrowUpRight className="ml-auto size-5 shrink-0 text-fg-muted group-hover:text-accent-text" aria-hidden="true" />
                      <span className="sr-only">(새 창)</span>
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
