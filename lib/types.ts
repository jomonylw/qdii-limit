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
  | "tech"
  | "hongkong-tech"
  | "hongkong-biotech"
  | "china-internet"
  | "biotech"
  | "bond"
  | "commodity"
  | "reits"
  | "other-qdii"
export type TradingForm = "etf-link" | "lof" | "exchange-etf" | "off-exchange" | "unknown"
export type ClassificationSource = "type-qdii" | "type-overseas" | "name-qdii" | "name-keyword"

/** 申购状态：以基金公开披露的交易状态为准 */
export type SubscribeStatus = "开放申购" | "限大额" | "暂停申购"
/** 状态分组，用于筛选与统计 */
export type StatusGroup = "open" | "paused"

/** 销售渠道：代销（第三方平台） / 直销（基金公司自有平台） */
export type ChannelKey = "distribution" | "direct"
export type ChannelStatus = "open" | "paused" | "unknown"
export type CurrencyCode = "CNY" | "USD"

export type ChannelQuote = {
  channel: ChannelKey
  channelLabel: string
  status: ChannelStatus
  statusText: string
  /** 单日累计申购上限（原币种），null 表示未披露或无限额 */
  dailyLimit: number | null
  currency: CurrencyCode
  /** 限额是否由数据源明确给出 */
  limitDisclosed: boolean
  limitText: string
  limitLevel: LimitLevel
  /** 数据来源说明，例如「天天基金公开接口」 */
  sourceLabel: string
  sourceUrl: string | null
  /** 数据快照时间，ISO 字符串 */
  updatedAt: string | null
  note: string | null
}

export type FundCompany = {
  id: string
  name: string
  short: string
}

export type FundRecord = {
  code: string
  name: string
  type: string
  nav: string
  date: string
  subscribeStatus: SubscribeStatus
  statusGroup: StatusGroup
  redeemStatus: string
  nextOpenDate: string
  minSubscribeAmount: number | null
  maxSubscribeAmount: number | null
  limitDisclosed: boolean
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
  fundCompany: FundCompany | null
  channels: Record<ChannelKey, ChannelQuote>
}

export type ChannelSummary = {
  total: number
  open: number
  paused: number
  limited: number
  unknown: number
  recorded: number
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
  directSales: {
    /** 已收录直销数据的基金数量 */
    recorded: number
    /** 直销数据集最后更新时间 */
    updatedAt: string | null
  }
  error?: string
}

export type EastmoneyRawResponse = {
  datas: string[][]
  record: string
  pages: string
  curpage: string
  showday?: string[]
}
