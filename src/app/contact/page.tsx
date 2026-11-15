import type { Metadata } from "next";
import { RedirectToHome } from "@/components/layout/RedirectToHome";

export const metadata: Metadata = { title: "연락하기", robots: { index: false } };

/** 연락하기는 홈 한 페이지(#contact)로 통합되었다. 예전 주소는 그쪽으로 이동시킨다. */
export default function ContactRedirect() {
  return <RedirectToHome section="contact" label="연락하기" />;
}
