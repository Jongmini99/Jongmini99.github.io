import type { Metadata } from "next";
import { RedirectToHome } from "@/components/layout/RedirectToHome";

export const metadata: Metadata = { title: "연락하기", robots: { index: false } };

/** 연락하기는 상단 바의 연락처 대화상자로 옮겨졌다. 예전 주소는 홈(/#contact)으로 보내 대화상자를 연다. */
export default function ContactRedirect() {
  return <RedirectToHome section="contact" label="연락하기" />;
}
