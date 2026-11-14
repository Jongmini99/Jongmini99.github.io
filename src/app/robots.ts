import type { MetadataRoute } from "next";
import { absoluteUrl, BASE_PATH } from "@/lib/base-path";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [`${BASE_PATH}/admin/`] }],
    ...(sitemap ? { sitemap } : {}),
  };
}
