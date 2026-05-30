import { FundDashboard } from "@/components/fund-dashboard"

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "QDII 基金申购限额查询 | QDII Limit Monitor",
    "description": "快速查看、检索和监控 QDII 与海外基金的最新申购限额及状态。支持美国纳指 100、标普 500、港股科技、中概互联网等地区和主题的精准多选联动筛选。",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5/JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "featureList": [
      "QDII 基金申购状态实时查看（开放申购 / 暂停申购）",
      "日累计申购额度智能等级划分与降序排列",
      "国家或投向地区多维多选筛选",
      "主题分类多维多选筛选",
      "国家与主题联动自动过滤无效项",
      "点击直达东方财富基金详情查看实时数据"
    ]
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "QDII 基金申购限额是什么？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "QDII 基金申购限额是指基金公司为了保护持有人利益、应对外汇额度紧张或控制基金规模，对投资者单日累计申购该基金的最大金额做出的限制。超出限制的申购申请可能会被拒绝。"
        }
      },
      {
        "@type": "Question",
        "name": "本工具中的暂停申购状态是如何判断的？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "本工具从东方财富接口拉取原始状态。为降低理财理解成本，我们将其归一化。当基金的日累计限制金额为 0 元，或者日累计限制金额小于其起购金额时，系统会自动判定该基金处于“暂停申购”状态。"
        }
      },
      {
        "@type": "Question",
        "name": "地区与主题联动筛选是什么意思？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "在工具栏中，当您选择了特定的国家/地区（例如“美国”），主题筛选下拉框中将只会显示投向美国的主题（例如纳指 100、标普 500）。如果之前所选的主题在新区域中不存在，系统会自动剔除，避免出现交叉筛选结果为空白的情况。"
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FundDashboard />
    </>
  )
}
