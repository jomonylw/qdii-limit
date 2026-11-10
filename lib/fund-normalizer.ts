import { buildDirectQuote } from "@/lib/direct-sales"
import { detectFundCompany } from "@/lib/fund-company"
import {
  buildSubscribeState,
  formatLimitDisplay,
  getLimitLevel,
  parseAmount,
} from "@/lib/fund-format"
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
import type { ChannelQuote, FundRecord } from "@/lib/types"

export function normalizeFund(row: string[]): FundRecord {
  const code = row[0] ?? ""
  const name = row[1] ?? ""
  const type = row[2] ?? ""
  const rawSubscribeStatus = row[5] ?? ""
  const minSubscribeAmount = parseAmount(row[8])
  const maxSubscribeAmount = parseAmount(row[9])

  const { subscribeStatus, statusGroup, limitDisclosed } = buildSubscribeState(
    rawSubscribeStatus,
    maxSubscribeAmount,
    minSubscribeAmount,
  )
  const limitLevel = getLimitLevel(maxSubscribeAmount, subscribeStatus, limitDisclosed)
  const formattedLimit = formatLimitDisplay(maxSubscribeAmount, subscribeStatus, limitDisclosed)
  const fundCompany = detectFundCompany(name)

  const distributionQuote: ChannelQuote = {
    channel: "distribution",
    channelLabel: "代销",
    status: statusGroup === "open" ? "open" : "paused",
    statusText: subscribeStatus,
    dailyLimit: maxSubscribeAmount,
    currency: "CNY",
    limitDisclosed,
    limitText: formattedLimit,
    limitLevel,
    sourceLabel: "天天基金（东方财富）公开接口",
    sourceUrl: code ? `https://fund.eastmoney.com/${code}.html` : null,
    updatedAt: null,
    note: "代销口径，支付宝 / 理财通等平台的单日额度以对应平台页面为准",
  }

  const base: Omit<FundRecord, "channels"> = {
    code,
    name,
    type,
    nav: row[3] ?? "",
    date: row[4] ?? "",
    subscribeStatus,
    statusGroup,
    redeemStatus: row[6] ?? "",
    nextOpenDate: row[7] ?? "",
    minSubscribeAmount,
    maxSubscribeAmount,
    limitDisclosed,
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
    limitLevel,
    formattedLimit,
    fundCompany,
  }

  return {
    ...base,
    channels: {
      distribution: distributionQuote,
      direct: buildDirectQuote(base, fundCompany),
    },
  }
}

export function normalizeFunds(rows: string[][]): FundRecord[] {
  return rows.map(normalizeFund).filter((fund) => fund.code && fund.name)
}
