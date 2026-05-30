import { normalizeFunds } from "@/lib/fund-normalizer"
import type { EastmoneyRawResponse, FundRecord } from "@/lib/types"

const EASTMONEY_URL = "https://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx"

export type FetchEastmoneyOptions = {
  refresh?: boolean
  sort?: string
}

function buildUrl(sort = "fcode,asc") {
  const url = new URL(EASTMONEY_URL)
  url.searchParams.set("t", "8")
  url.searchParams.set("page", "1,50000")
  url.searchParams.set("js", "reData")
  url.searchParams.set("sort", sort)
  return url.toString()
}

function parseEastmoneyText(text: string): EastmoneyRawResponse {
  const objectText = text
    .replace(/^\s*var\s+reData\s*=\s*/, "")
    .replace(/^\s*reData\s*=\s*/, "")
    .replace(/\s*;\s*$/, "")
    .trim()

  const fn = new Function(`return (${objectText});`)
  const data = fn() as EastmoneyRawResponse

  if (!data || !Array.isArray(data.datas)) {
    throw new Error("东方财富返回结构异常：缺少 datas 数组")
  }

  return data
}

export async function fetchEastmoneyFunds(options: FetchEastmoneyOptions = {}) {
  // 东方财富全量响应超过 2MB，不能放入 Next.js Data Cache。
  // 这里始终使用 no-store 拉源，缓存交给 /api/funds 的 Cache-Control 处理，
  // Vercel 可缓存过滤后的 Route Handler 响应，避免缓存原始大文本导致告警。
  const response = await fetch(buildUrl(options.sort), { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`东方财富接口请求失败：${response.status}`)
  }

  const text = await response.text()
  const raw = parseEastmoneyText(text)
  const funds = normalizeFunds(raw.datas)
  const overseasFunds = funds.filter((fund) => fund.isOverseasLike)

  return {
    raw,
    funds,
    overseasFunds,
  }
}

export function buildFundsResponse(params: {
  raw: EastmoneyRawResponse
  funds: FundRecord[]
  overseasFunds: FundRecord[]
  fetchedAt?: string
}) {
  return {
    ok: true as const,
    source: "eastmoney" as const,
    fetchedAt: params.fetchedAt ?? new Date().toISOString(),
    total: params.funds.length,
    filteredTotal: params.overseasFunds.length,
    record: Number(params.raw.record) || params.funds.length,
    pages: Number(params.raw.pages) || 0,
    showday: params.raw.showday ?? [],
    funds: params.overseasFunds,
  }
}
