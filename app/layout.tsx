import type { Metadata } from "next"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

export const metadata: Metadata = {
  title: "QDII 基金申购限额查询｜QDII Limit Monitor",
  description: "快速查看、检索和监控 QDII 与海外基金的最新申购限额及状态。支持美国纳指 100、标普 500、港股科技、中概互联网等地区和主题的精准多选联动筛选，提供服务端 CDN 高速缓存。",
  keywords: [
    "QDII基金",
    "海外基金",
    "申购限额",
    "暂停申购",
    "日累计限额",
    "纳指100",
    "标普500",
    "中概互联",
    "东方财富基金",
    "QDII限额查询",
    "限大额",
    "基金理财"
  ],
  authors: [{ name: "jomonylw" }],
  creator: "jomonylw",
  publisher: "jomonylw",
  metadataBase: new URL("https://qdii-limit.vercel.app"), // 默认为部署域名占位，可后续替换
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "QDII 基金申购限额查询｜QDII Limit Monitor",
    description: "快速查看、检索和监控 QDII 与海外基金的最新申购限额及状态。支持多选联动筛选与服务端缓存。",
    url: "https://qdii-limit.vercel.app",
    siteName: "QDII Limit Monitor",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "QDII Limit Monitor 基金限额看板",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QDII 基金申购限额查询｜QDII Limit Monitor",
    description: "快速查看、检索和监控 QDII 与海外基金的最新申购限额及状态。支持多选联动筛选与服务端缓存。",
    images: ["/og.png"],
  },
  verification: {
    google: "7HFogv_3jnp93WlOKjh26rw86o8jp4SWJoOzzbrDnAY",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
