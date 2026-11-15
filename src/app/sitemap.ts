import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/content/loaders";
import { absoluteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/projects/", ...getPublishedProjects().map((p) => `/projects/${p.slug}/`)];
  // NEXT_PUBLIC_SITE_URL 이 없으면(로컬 빌드) 절대 URL을 만들 수 없으므로 빈 sitemap
  return paths.flatMap((p) => {
    const url = absoluteUrl(p);
    return url ? [{ url }] : [];
  });
}
