import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/icon.svg", "/og.png"],
      disallow: ["/api/"],
    },
    sitemap: "https://qdii-limit.vercel.app/sitemap.xml",
  }
}
