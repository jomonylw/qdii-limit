export type LimitLevel = "none" | "low" | "medium" | "high" | "unknown" | "paused"
export type ClassificationScope = "strong" | "supplemental" | "nasdaq"
export type RegionCategory =
  | "us"
  | "hongkong"
  | "china-offshore"
  | "global"
  | "asia-pacific"
  | "japan"
  | "india"
  | "vietnam"
  | "germany"
  | "europe"
  | "emerging"
  | "other-region"
export type ThemeCategory =
  | "nasdaq100"
  | "sp500"
  | "hangseng-tech"
  | "hangseng"
  | "hongkong"
  | "hongkong-tech"
  | "hongkong-biotech"
  | "china-internet"
  | "biotech"
  | "us-tech"
  | "us"
  | "japan"
  | "india"
  | "vietnam"
  | "germany"
  | "global"
  | "commodity"
  | "reits"
  | "bond"
  | "other-qdii"
export type TradingForm = "etf-link" | "lof" | "exchange-etf" | "off-exchange" | "unknown"
export type ClassificationSource = "type-qdii" | "type-overseas" | "name-qdii" | "name-keyword"

export type FundRecord = {
  code: string
  name: string
  type: string
  nav: string
  date: string
  subscribeStatus: string
  redeemStatus: string
  nextOpenDate: string
  minSubscribeAmount: number | null
  maxSubscribeAmount: number | null
  rawFee: string
  buyStatusCode: string
  feeText: string
  isQdiiLike: boolean
  isOverseasLike: boolean
  isNasdaqLike: boolean
  isOffExchangeLike: boolean
  classificationScope: ClassificationScope
  regionCategory: RegionCategory
  themeCategory: ThemeCategory
  tradingForm: TradingForm
  classificationSources: ClassificationSource[]
  shareClass: "人民币" | "美元" | "现汇" | "现钞" | "其他"
  limitLevel: LimitLevel
  formattedLimit: string
}

export type FundsApiResponse = {
  ok: boolean
  source: "eastmoney"
  fetchedAt: string
  total: number
  filteredTotal: number
  record: number
  pages: number
  showday: string[]
  funds: FundRecord[]
  error?: string
}

export type EastmoneyRawResponse = {
  datas: string[][]
  record: string
  pages: string
  curpage: string
  showday?: string[]
}
