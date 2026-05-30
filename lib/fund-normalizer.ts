import { parseAmount, formatLimitDisplay, getLimitLevel, normalizeSubscribeStatus } from "@/lib/fund-format"
import {
  detectShareClass,
  getClassificationScope,
  getClassificationSources,
  getRegionCategory,
  getThemeCategory,
  getTradingForm,
  isNasdaqLike,
  isOffExchangeLike,
  isOverseasLike,
  isQdiiLike,
} from "@/lib/fund-filters"
import type { FundRecord } from "@/lib/types"

export function normalizeFund(row: string[]): FundRecord {
  const code = row[0] ?? ""
  const name = row[1] ?? ""
  const type = row[2] ?? ""
  const rawSubscribeStatus = row[5] ?? ""
  const minSubscribeAmount = parseAmount(row[8])
  const maxSubscribeAmount = parseAmount(row[9])
  const subscribeStatus = normalizeSubscribeStatus(rawSubscribeStatus, maxSubscribeAmount, minSubscribeAmount)

  return {
    code,
    name,
    type,
    nav: row[3] ?? "",
    date: row[4] ?? "",
    subscribeStatus,
    redeemStatus: row[6] ?? "",
    nextOpenDate: row[7] ?? "",
    minSubscribeAmount,
    maxSubscribeAmount,
    rawFee: row[10] ?? "",
    buyStatusCode: row[11] ?? "",
    feeText: row[12] ?? "",
    isQdiiLike: isQdiiLike(name, type),
    isOverseasLike: isOverseasLike(name, type),
    isNasdaqLike: isNasdaqLike(name),
    isOffExchangeLike: isOffExchangeLike(name),
    classificationScope: getClassificationScope(name, type),
    regionCategory: getRegionCategory(name, type),
    themeCategory: getThemeCategory(name, type),
    tradingForm: getTradingForm(name),
    classificationSources: getClassificationSources(name, type),
    shareClass: detectShareClass(name),
    limitLevel: getLimitLevel(maxSubscribeAmount, subscribeStatus),
    formattedLimit: formatLimitDisplay(maxSubscribeAmount, subscribeStatus),
  }
}

export function normalizeFunds(rows: string[][]): FundRecord[] {
  return rows.map(normalizeFund).filter((fund) => fund.code && fund.name)
}
