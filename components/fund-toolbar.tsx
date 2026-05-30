"use client"

import { Check, Filter, RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RegionCategory, ThemeCategory } from "@/lib/types"

const REGION_OPTIONS: Array<{ value: RegionCategory; label: string }> = [
  { value: "us", label: "美国" },
  { value: "hongkong", label: "香港" },
  { value: "china-offshore", label: "中国离岸" },
  { value: "global", label: "全球" },
  { value: "asia-pacific", label: "亚太" },
  { value: "japan", label: "日本" },
  { value: "india", label: "印度" },
  { value: "vietnam", label: "越南" },
  { value: "germany", label: "德国" },
  { value: "europe", label: "欧洲/英国" },
  { value: "emerging", label: "新兴市场" },
  { value: "other-region", label: "其他地区" },
]

const THEME_OPTIONS: Array<{ value: ThemeCategory; label: string }> = [
  { value: "nasdaq100", label: "纳指100" },
  { value: "sp500", label: "标普500" },
  { value: "hangseng-tech", label: "恒生科技" },
  { value: "hangseng", label: "恒生指数" },
  { value: "hongkong", label: "港股" },
  { value: "hongkong-tech", label: "港股科技" },
  { value: "hongkong-biotech", label: "港股医药" },
  { value: "china-internet", label: "中国互联网" },
  { value: "biotech", label: "生物科技" },
  { value: "us-tech", label: "美股科技" },
  { value: "us", label: "美股" },
  { value: "japan", label: "日本" },
  { value: "india", label: "印度" },
  { value: "vietnam", label: "越南" },
  { value: "germany", label: "德国" },
  { value: "global", label: "全球/境外" },
  { value: "commodity", label: "商品/能源" },
  { value: "reits", label: "REITs" },
  { value: "bond", label: "债券" },
  { value: "other-qdii", label: "其他 QDII" },
]

function getRegionSummary(regions: RegionCategory[]) {
  if (regions.length === 0) return "全部地区"
  if (regions.length === 1) return REGION_OPTIONS.find((option) => option.value === regions[0])?.label ?? "已选 1 个地区"
  return `已选 ${regions.length} 个地区`
}

function getThemeSummary(themes: ThemeCategory[]) {
  if (themes.length === 0) return "全部主题"
  if (themes.length === 1) return THEME_OPTIONS.find((option) => option.value === themes[0])?.label ?? "已选 1 个主题"
  return `已选 ${themes.length} 个主题`
}

export type FundToolbarState = {
  query: string
  regions: RegionCategory[]
  themes: ThemeCategory[]
  status: string
  limit: string
}

export function FundToolbar({ state, availableThemes, loading, onChange, onRefresh }: {
  state: FundToolbarState
  availableThemes: ThemeCategory[]
  loading: boolean
  onChange: (next: Partial<FundToolbarState>) => void
  onRefresh: () => void
}) {
  const availableThemeSet = new Set(availableThemes)
  const visibleThemeOptions = THEME_OPTIONS.filter((option) => availableThemeSet.has(option.value))

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={state.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="搜索基金代码、名称、类型"
            className="pl-9"
          />
        </div>
        <Button type="button" onClick={onRefresh} disabled={loading} className="gap-2">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
          刷新
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="justify-start font-normal">
              {getRegionSummary(state.regions)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-72 max-w-96 p-0">
            <div className="max-h-80 overflow-y-auto p-1">
              <DropdownMenuItem onSelect={(event) => { event.preventDefault(); onChange({ regions: [] }) }}>
                <span className="flex h-4 w-4 items-center justify-center">
                  {state.regions.length === 0 ? <Check className="h-4 w-4" /> : null}
                </span>
                全部地区
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {REGION_OPTIONS.map((option) => {
                const checked = state.regions.includes(option.value)
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={(event) => {
                      event.preventDefault()
                      onChange({
                        regions: checked
                          ? state.regions.filter((region) => region !== option.value)
                          : [...state.regions, option.value],
                      })
                    }}
                  >
                    <span className="flex h-4 w-4 items-center justify-center">
                      {checked ? <Check className="h-4 w-4" /> : null}
                    </span>
                    {option.label}
                  </DropdownMenuItem>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="justify-start font-normal">
              {getThemeSummary(state.themes)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-72 max-w-96 p-0">
            <div className="max-h-80 overflow-y-auto p-1">
            <DropdownMenuItem onSelect={(event) => { event.preventDefault(); onChange({ themes: [] }) }}>
              <span className="flex h-4 w-4 items-center justify-center">
                {state.themes.length === 0 ? <Check className="h-4 w-4" /> : null}
              </span>
              全部主题
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {visibleThemeOptions.map((option) => {
              const checked = state.themes.includes(option.value)
              return (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={(event) => {
                    event.preventDefault()
                    onChange({
                      themes: checked
                        ? state.themes.filter((theme) => theme !== option.value)
                        : [...state.themes, option.value],
                    })
                  }}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {checked ? <Check className="h-4 w-4" /> : null}
                  </span>
                  {option.label}
                </DropdownMenuItem>
              )
            })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={state.status} onValueChange={(value) => onChange({ status: value })}>
          <SelectTrigger><SelectValue placeholder="申购状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="open">开放申购</SelectItem>
            <SelectItem value="paused">暂停申购</SelectItem>
          </SelectContent>
        </Select>

        <Select value={state.limit} onValueChange={(value) => onChange({ limit: value })}>
          <SelectTrigger><SelectValue placeholder="限额" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部限额</SelectItem>
            <SelectItem value="low">低限额</SelectItem>
            <SelectItem value="medium">中限额</SelectItem>
            <SelectItem value="high">高限额</SelectItem>
            <SelectItem value="none">无限额</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </div>
  )
}
