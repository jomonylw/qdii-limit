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

      {/* SEO & Search Agent Friendly Semantic Context Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/40">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
            QDII 基金申购限额与状态指南 (FAQ)
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                1. 什么是 QDII 基金申购限额？
              </h3>
              <p className="leading-relaxed">
                QDII (Qualified Domestic Institutional Investor) 基金允许境内投资者配置海外资产。
                由于外汇额度紧缺或市场剧烈波动，基金公司会设定<strong>日累计申购限额</strong>。
                每日超出该额度的买入申请将被确认为失败。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                2. 申购状态归一化规则
              </h3>
              <p className="leading-relaxed">
                为极简呈现，本工具仅保留<strong>“开放申购”</strong>与<strong>“暂停申购”</strong>。
                如果官方公布的累计限额为 0 元、或者小于起购金额，系统将直接显示为暂停申购，帮助您快速过滤无法买入的标的。
              </p>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                3. 精准多选联动筛选
              </h3>
              <p className="leading-relaxed">
                我们支持按国家/地区（如美国、香港、日本、越南等）和投资主题（如纳指 100、标普 500、互联网、生物医药、海外债券等）多选筛选。
                地区与主题具备智能联动，只展示有效的交叉组合。
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
            <p>
              <strong>免责声明：</strong>
              本站提供的数据来自东方财富基金公开接口进行清洗与归并展示，数据存在一定时延。结果仅供个人学术研究与参考，不构成任何申购、赎回或投资策略建议。理财有风险，投资需谨慎。
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
