import type { ClassificationScope, ClassificationSource, RegionCategory, ThemeCategory, TradingForm } from "@/lib/types"

const OVERSEAS_KEYWORDS = [
  "QDII",
  "纳斯达克",
  "纳指",
  "NASDAQ",
  "Nasdaq",
  "标普",
  "美国",
  "全球",
  "境外",
  "恒生",
  "香港",
]
const OVERSEAS_THEME_KEYWORDS = OVERSEAS_KEYWORDS.filter(
  (keyword) => keyword.toLowerCase() !== "qdii" && keyword !== "标普",
)
const NASDAQ_100_KEYWORDS = ["纳斯达克100", "纳指100", "NASDAQ100", "Nasdaq100", "NASDAQ 100", "Nasdaq 100"]

export function includesAnyKeyword(value: string, keywords: string[]) {
  const normalized = value.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
}

export function isQdiiLike(name: string, type: string) {
  return type.toLowerCase().includes("qdii") || name.toLowerCase().includes("qdii")
}

export function getClassificationSources(name: string, type: string): ClassificationSource[] {
  const sources: ClassificationSource[] = []
  if (type.toLowerCase().includes("qdii")) sources.push("type-qdii")
  if (type.includes("海外")) sources.push("type-overseas")
  if (name.toLowerCase().includes("qdii")) sources.push("name-qdii")
  return sources
}

export function getClassificationScope(name: string, type: string): ClassificationScope {
  if (isNasdaqLike(name)) return "nasdaq"
  const sources = getClassificationSources(name, type)
  if (sources.some((source) => source === "type-qdii" || source === "type-overseas" || source === "name-qdii"))
    return "strong"
  return "supplemental"
}

export function isOverseasLike(name: string, type: string) {
  return getClassificationSources(name, type).length > 0
}

export function isNasdaqLike(name: string) {
  return includesAnyKeyword(name, NASDAQ_100_KEYWORDS)
}

export function getRegionCategory(name: string, type: string): RegionCategory {
  const text = `${name} ${type}`

  if (includesAnyKeyword(text, ["日本", "日经"])) return "japan"
  if (text.includes("印度")) return "india"
  if (text.includes("越南")) return "vietnam"
  if (includesAnyKeyword(text, ["德国", "DAX"])) return "germany"
  if (includesAnyKeyword(text, ["欧洲", "英国", "富时100", "FTSE 100"])) return "europe"
  if (includesAnyKeyword(text, ["新兴市场"])) return "emerging"
  if (includesAnyKeyword(text, ["恒生", "香港", "港股", "H股"])) return "hongkong"
  if (
    includesAnyKeyword(text, [
      "中国互联网",
      "中概",
      "中国互联",
      "大中华",
      "中国世纪",
      "中国中小盘",
      "海外中国",
      "港美互联",
    ])
  )
    return "china-offshore"
  if (includesAnyKeyword(text, ["亚太", "亚洲"])) return "asia-pacific"
  if (
    isNasdaqLike(name) ||
    includesAnyKeyword(text, ["标普500", "S&P 500", "S&P500", "SP500", "道琼斯", "美国", "美股", "纳斯达克", "纳指"])
  )
    return "us"
  if (includesAnyKeyword(text, ["全球", "境外", "海外"])) return "global"
  return "other-region"
}

export function getThemeCategory(name: string, type: string): ThemeCategory {
  const text = `${name} ${type}`

  if (isNasdaqLike(name)) return "nasdaq100"
  if (includesAnyKeyword(text, ["标普500", "S&P 500", "S&P500", "SP500"])) return "sp500"
  if (
    includesAnyKeyword(text, [
      "美元债",
      "债券",
      "债基",
      "债",
      "高收益",
      "收益债",
      "信用债",
      "国债",
      "政府债",
      "公司债",
      "企业债",
      "投资级",
      "短债",
      "中短债",
      "固收",
      "票据",
      "亚洲债",
      "全球债",
      "海外债",
      "新兴市场债",
    ])
  )
    return "bond"
  if (includesAnyKeyword(text, ["恒生科技", "恒科"])) return "hangseng-tech"
  if (includesAnyKeyword(text, ["恒生指数", "恒生中国企业", "H股", "恒生"])) return "hangseng"
  if (includesAnyKeyword(text, ["香港科技", "港股科技", "中证香港科技"])) return "hongkong-tech"
  if (
    includesAnyKeyword(text, [
      "港股创新药",
      "香港创新药",
      "港股医药",
      "香港医药",
      "港股医疗",
      "香港医疗",
      "港股生物",
      "香港生物",
    ])
  )
    return "hongkong-biotech"
  if (
    includesAnyKeyword(text, [
      "港股互联网",
      "香港互联网",
      "海外中国互联网",
      "中国互联网",
      "中概互联网",
      "中概股",
      "中国互联",
      "中概互联",
    ])
  )
    return "china-internet"
  if (includesAnyKeyword(text, ["生物科技", "生物医药", "医疗保健", "医疗健康", "医药", "医疗", "创新药"]))
    return "biotech"
  if (includesAnyKeyword(text, ["纳斯达克精选", "美国科技", "全球科技", "科技", "半导体", "芯片"])) return "us-tech"
  if (includesAnyKeyword(text, ["香港", "港股通", "港股"])) return "hongkong"
  if (includesAnyKeyword(text, ["日本", "日经"])) return "japan"
  if (text.includes("印度")) return "india"
  if (text.includes("越南")) return "vietnam"
  if (includesAnyKeyword(text, ["德国", "DAX"])) return "germany"
  if (includesAnyKeyword(text, ["黄金", "原油", "石油", "油气", "能源", "天然气", "商品", "有色", "资源"]))
    return "commodity"
  if (includesAnyKeyword(text, ["REIT", "REITs", "REITS", "房地产信托"])) return "reits"
  if (includesAnyKeyword(text, ["美国", "美股"])) return "us"
  if (includesAnyKeyword(text, ["全球", "境外", "亚太", "新兴市场"])) return "global"
  return "other-qdii"
}

export function getTradingForm(name: string): TradingForm {
  if (name.includes("ETF联接") || name.includes("联接")) return "etf-link"
  if (name.includes("LOF")) return "lof"
  if (name.includes("ETF") && !name.includes("联接")) return "exchange-etf"
  if (name.includes("美元") || name.includes("现汇") || name.includes("现钞")) return "off-exchange"
  return "off-exchange"
}

export function isOffExchangeLike(name: string) {
  return getTradingForm(name) !== "exchange-etf"
}

export function detectShareClass(name: string): "人民币" | "美元" | "现汇" | "现钞" | "其他" {
  if (name.includes("现汇")) return "现汇"
  if (name.includes("现钞")) return "现钞"
  if (name.includes("美元")) return "美元"
  if (name.includes("人民币")) return "人民币"
  return "其他"
}
