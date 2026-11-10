import type { Metadata } from "next"
import Script from "next/script"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

export const metadata: Metadata = {
  title: "QDII 基金分类与申购状态｜QDII Limit Monitor",
  description:
    "自动发现全市场 QDII 与海外基金，查询申购状态和额度，并按纳指100、标普500、地区、主题及交易形态筛选。",
  keywords: [
    "QDII基金",
    "海外基金",
    "申购限额",
    "暂停申购",
    "日累计限额",
    "纳指100",
    "标普500",
    "中概互联",
    "支付宝基金",
    "腾讯理财通",
    "QDII分类",
    "QDII限额查询",
    "限大额",
    "基金直销",
    "基金代销",
    "基金理财",
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
    title: "QDII 基金分类与申购状态｜QDII Limit Monitor",
    description: "自动发现全市场 QDII 与海外基金，支持纳指100、标普500等分类筛选。",
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
    title: "QDII 基金分类与申购状态｜QDII Limit Monitor",
    description: "自动发现全市场 QDII 与海外基金，支持纳指100、标普500等分类筛选。",
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
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-CN4JPPK7XX" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-CN4JPPK7XX');
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
