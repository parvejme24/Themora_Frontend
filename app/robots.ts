import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/preview/", "/checkout/", "/purchase/", "/billing/", "/login", "/register", "/forget"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
