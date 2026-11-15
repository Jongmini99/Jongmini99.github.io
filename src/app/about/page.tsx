import type { Metadata } from "next";
import { RedirectToHome } from "@/components/layout/RedirectToHome";

export const metadata: Metadata = { title: "소개", robots: { index: false } };

/** 소개는 홈 한 페이지(#about)로 통합되었다. 예전 주소는 그쪽으로 이동시킨다. */
export default function AboutRedirect() {
  return <RedirectToHome section="about" label="소개" />;
}
