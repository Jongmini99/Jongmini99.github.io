import type { Metadata, Viewport } from "next";
// 폰트는 패키지에서 번들링해 사이트에 포함한다 (외부 폰트 서버 호출 없음)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@fontsource-variable/inter";
import "@/styles/globals.css";
import { getSettings } from "@/content/loaders";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function generateMetadata(): Metadata {
  const settings = getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title: { default: settings.siteTitle, template: `%s | ${settings.siteTitle}` },
    description: settings.siteDescription,
    metadataBase: siteUrl ? new URL(siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`) : undefined,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: settings.siteTitle,
      title: settings.siteTitle,
      description: settings.siteDescription,
      ...(settings.ogImage ? { images: [settings.ogImage.replace(/^\//, "")] } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#101116",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-accent-solid px-4 py-2 font-medium text-accent-fg focus:translate-y-0"
        >
          본문 바로가기
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 pt-header outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
