import { NextRequest } from "next/server"

import { buildFundsResponse, fetchEastmoneyFunds } from "@/lib/eastmoney"
import type { FundsApiResponse } from "@/lib/types"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sort = searchParams.get("sort") ?? "fcode,asc"
  const fetchedAt = new Date().toISOString()

  try {
    const { raw, funds, overseasFunds } = await fetchEastmoneyFunds({ sort })
    const body: FundsApiResponse = buildFundsResponse({ raw, funds, overseasFunds, fetchedAt })

    return Response.json(body, {
      headers: {
        "Cache-Control": "s-maxage=21600, stale-while-revalidate=43200",
      },
    })
  } catch (error) {
    const body: FundsApiResponse = {
      ok: false,
      source: "eastmoney",
      fetchedAt,
      total: 0,
      filteredTotal: 0,
      record: 0,
      pages: 0,
      showday: [],
      funds: [],
      error: error instanceof Error ? error.message : "未知错误",
    }

    return Response.json(body, { status: 502 })
  }
}
