import { Ban, CheckCircle2, Globe2, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FundRecord } from "@/lib/types"

export function FundStatCards({ funds }: { funds: FundRecord[] }) {
  const open = funds.filter((fund) => fund.subscribeStatus === "开放申购").length
  const paused = funds.filter((fund) => fund.subscribeStatus === "暂停申购").length
  const nasdaq = funds.filter((fund) => fund.isNasdaqLike).length

  const cards = [
    { title: "QDII/海外基金", value: funds.length, icon: Globe2, hint: "默认识别范围" },
    { title: "开放申购", value: open, icon: CheckCircle2, hint: "当前可申购" },
    { title: "暂停申购", value: paused, icon: Ban, hint: "当前不可申购" },
    { title: "纳指相关", value: nasdaq, icon: TrendingUp, hint: "名称命中纳指关键词" },
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
