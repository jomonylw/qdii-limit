"use client"

import * as React from "react"
import { CircleAlert, Clock, Globe2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/theme-toggle"
import { FundTable } from "@/components/fund-table"
import { FundToolbar, type FundToolbarState } from "@/components/fund-toolbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/fund-format"
import type { FundRecord, FundsApiResponse, ThemeCategory } from "@/lib/types"

const defaultToolbar: FundToolbarState = {
  query: "",
  regions: ["us"],
  themes: ["nasdaq100"],
  status: "open",
  limit: "all",
}

function filterFunds(funds: FundRecord[], state: FundToolbarState) {
  const query = state.query.trim().toLowerCase()

  return funds.filter((fund) => {
    if (query) {
      const haystack = `${fund.code} ${fund.name} ${fund.type}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (state.status === "open" && fund.subscribeStatus !== "开放申购") return false
    if (state.status === "paused" && fund.subscribeStatus !== "暂停申购") return false

    if (state.regions.length > 0 && !state.regions.includes(fund.regionCategory)) return false

    if (state.themes.length > 0 && !state.themes.includes(fund.themeCategory)) return false

    if (state.limit !== "all" && fund.limitLevel !== state.limit) return false

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

export function FundDashboard() {
  const [data, setData] = React.useState<FundsApiResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [toolbar, setToolbar] = React.useState<FundToolbarState>(defaultToolbar)

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

  const funds = data?.funds ?? []
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
  const filteredFunds = React.useMemo(() => filterFunds(funds, toolbar), [funds, toolbar])

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
                  追踪可申购 QDII 基金的单日申购额度、地区主题与开放状态。
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
                    <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">基金列表</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      当前筛选 {filteredFunds.length.toLocaleString("zh-CN")} 条
                    </p>
                  </div>
                </div>
                <FundTable funds={filteredFunds} />
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
