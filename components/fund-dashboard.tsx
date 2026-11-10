"use client"

import * as React from "react"
import { CircleAlert, Clock, Globe2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/theme-toggle"
import { FundChannelTabs } from "@/components/fund-channel-tabs"
import { FundStatCards } from "@/components/fund-stat-cards"
import { FundTable } from "@/components/fund-table"
import { FundToolbar, type FundToolbarState } from "@/components/fund-toolbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/fund-format"
import type { ChannelKey, FundRecord, FundsApiResponse, ThemeCategory } from "@/lib/types"

const defaultToolbar: FundToolbarState = {
  query: "",
  regions: ["us"],
  themes: ["nasdaq100"],
  status: "all",
  limit: "all",
  form: "off-exchange",
}

function filterFunds(funds: FundRecord[], state: FundToolbarState, channel: ChannelKey) {
  const query = state.query.trim().toLowerCase()

  return funds.filter((fund) => {
    if (query) {
      const haystack = `${fund.code} ${fund.name} ${fund.type} ${fund.fundCompany?.name ?? ""}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }

    const quote = fund.channels[channel]

    if (state.status === "open" && quote.status !== "open") return false
    if (state.status === "limited" && !quote.statusText.includes("限大额")) return false
    if (state.status === "paused" && quote.status !== "paused") return false

    if (state.regions.length > 0 && !state.regions.includes(fund.regionCategory)) return false

    if (state.themes.length > 0 && !state.themes.includes(fund.themeCategory)) return false

    if (state.limit !== "all" && quote.limitLevel !== state.limit) return false

    if (state.form === "off-exchange" && fund.tradingForm === "exchange-etf") return false
    if (state.form !== "all" && state.form !== "off-exchange" && fund.tradingForm !== state.form) return false

    return true
  })
}

function getAvailableThemes(funds: FundRecord[], regions: FundToolbarState["regions"]): ThemeCategory[] {
  const regionMatchedFunds = regions.length > 0 ? funds.filter((fund) => regions.includes(fund.regionCategory)) : funds
  return Array.from(new Set(regionMatchedFunds.map((fund) => fund.themeCategory)))
}

function reconcileThemes(themes: ThemeCategory[], availableThemes: ThemeCategory[]) {
  if (themes.length === 0) return []
  const availableThemeSet = new Set(availableThemes)
  const nextThemes = themes.filter((theme) => availableThemeSet.has(theme))
  return nextThemes.length > 0 ? nextThemes : []
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-20" />
      <Skeleton className="h-[520px]" />
    </div>
  )
}

const CHANNEL_NOTE: Record<ChannelKey, string> = {
  distribution:
    "代销口径来自东方财富（天天基金）公开接口，仅用于基金发现、基础状态和额度参考；支付宝、理财通等平台的单日额度以对应平台页面为准。",
  direct:
    "直销额度没有统一公开接口，目前按基金公司官网 / 官方 APP 人工核实录入，未核实的显示「待核实」；点击核实入口可直达基金公司信息页。",
}

export function FundDashboard() {
  const [data, setData] = React.useState<FundsApiResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [toolbar, setToolbar] = React.useState<FundToolbarState>(defaultToolbar)
  const [channel, setChannel] = React.useState<ChannelKey>("distribution")

  const loadFunds = React.useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/funds")
      const json = (await response.json()) as FundsApiResponse
      if (!response.ok || !json.ok) throw new Error(json.error ?? "数据加载失败")
      setData(json)
      if (refresh) toast.success("数据已重新加载")
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "数据加载失败"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    void loadFunds(false)
  }, [loadFunds])

  const funds = React.useMemo(() => data?.funds ?? [], [data?.funds])
  const availableThemes = React.useMemo(() => getAvailableThemes(funds, toolbar.regions), [funds, toolbar.regions])
  const updateToolbar = React.useCallback(
    (next: Partial<FundToolbarState>) => {
      setToolbar((current) => {
        const merged = { ...current, ...next }
        if (next.regions || next.themes) {
          const nextAvailableThemes = getAvailableThemes(funds, merged.regions)
          return { ...merged, themes: reconcileThemes(merged.themes, nextAvailableThemes) }
        }
        return merged
      })
    },
    [funds],
  )
  const filteredFunds = React.useMemo(() => filterFunds(funds, toolbar, channel), [funds, toolbar, channel])
  const directRecorded = data?.directSales.recorded ?? 0

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit gap-2 bg-white dark:bg-slate-950">
                <Globe2 className="h-3.5 w-3.5" />
                QDII Limit Monitor
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 md:text-4xl">
                  QDII 基金限额看板
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  通过公开全量基金接口自动发现 QDII 与海外基金，按代销 / 直销两条渠道分别查看申购状态与单日限额，支持地区、主题和交易形态筛选。
                </p>
              </div>
            </div>
            <ThemeToggle className="shrink-0 md:hidden" />
          </div>
          <div className="flex flex-col items-start gap-3 text-sm text-slate-500 dark:text-slate-400 md:items-end">
            <ThemeToggle className="hidden md:inline-flex" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              最后更新：{data ? formatDateTime(data.fetchedAt) : "-"}
            </div>
          </div>
        </header>

        {error ? (
          <Alert variant="destructive">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>数据加载失败</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => loadFunds(true)} className="w-fit gap-2">
                <RefreshCw className="h-4 w-4" />
                重试
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <FundChannelTabs
              value={channel}
              distributionCount={funds.length}
              directRecorded={directRecorded}
              directTotal={funds.length}
              onChange={setChannel}
            />
            <FundStatCards funds={filteredFunds} channel={channel} />
            <FundToolbar
              state={toolbar}
              availableThemes={availableThemes}
              loading={refreshing}
              onChange={updateToolbar}
              onRefresh={() => loadFunds(true)}
            />
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
              <CardContent className="p-0">
                <div className="flex flex-col gap-2 border-b border-slate-200/80 px-4 py-4 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                      {channel === "distribution" ? "代销渠道列表" : "直销渠道列表"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      当前筛选 {filteredFunds.length.toLocaleString("zh-CN")} 条
                    </p>
                  </div>
                  <p className="max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {CHANNEL_NOTE[channel]}
                  </p>
                </div>
                <FundTable funds={filteredFunds} channel={channel} />
              </CardContent>
            </Card>
          </>
        )}

        <footer className="border-t border-slate-200/70 pt-4 text-center text-xs leading-6 text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
          <span>QDII Limit Monitor</span>
        </footer>
      </div>
    </main>
  )
}
