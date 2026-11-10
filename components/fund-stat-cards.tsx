import { Ban, CheckCircle2, Globe2, Gauge, HelpCircle, Store } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChannelKey, FundRecord } from "@/lib/types"

export function FundStatCards({ funds, channel }: { funds: FundRecord[]; channel: ChannelKey }) {
  const quotes = funds.map((fund) => fund.channels[channel])
  const open = quotes.filter((quote) => quote.status === "open").length
  const paused = quotes.filter((quote) => quote.status === "paused").length
  const limited = quotes.filter((quote) => quote.statusText.includes("限大额")).length
  const unknown = quotes.filter((quote) => quote.status === "unknown").length

  const cards =
    channel === "distribution"
      ? [
          { title: "QDII/海外基金", value: funds.length, icon: Globe2, hint: "默认识别范围" },
          { title: "开放申购", value: open, icon: CheckCircle2, hint: "含限大额基金" },
          { title: "限大额", value: limited, icon: Gauge, hint: "可申购但有单日上限" },
          { title: "暂停申购", value: paused, icon: Ban, hint: "当前不可申购" },
        ]
      : [
          { title: "直销已收录", value: quotes.length - unknown, icon: Store, hint: "人工核实过直销口径" },
          { title: "直销可申购", value: open, icon: CheckCircle2, hint: "含限大额基金" },
          { title: "直销暂停", value: paused, icon: Ban, hint: "官方平台暂停申购" },
          { title: "待核实", value: unknown, icon: HelpCircle, hint: "尚未核对基金公司直销" },
        ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString("zh-CN")}</div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
