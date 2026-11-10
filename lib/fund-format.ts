import type { LimitLevel, StatusGroup, SubscribeStatus } from "@/lib/types"

export function parseAmount(value: string | undefined): number | null {
  if (value == null || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function formatAmount(value: number | null): string {
  if (value == null) return "未知"
  if (value === 0) return "未设限额"
  if (value === 0.01) return "近零限额（0.01 元）"
  if (value >= 100000000) return "无限额/极高"
  if (value >= 10000) {
    const wan = value / 10000
    return `${Number.isInteger(wan) ? wan.toFixed(0) : wan.toFixed(2)} 万元`
  }
  return `${value.toLocaleString("zh-CN")} 元`
}

export type SubscribeState = {
  subscribeStatus: SubscribeStatus
  statusGroup: StatusGroup
  /** 数据源是否明确给出了单日限额数值 */
  limitDisclosed: boolean
}

const PAUSED_PATTERN = /暂停|封闭|认购|终止|未开放|停止/
const LIMITED_PATTERN = /限大额|限购|限制大额/
const OPEN_PATTERN = /开放/

/**
 * 申购状态以数据源披露的交易状态为准。
 *
 * 重要：东方财富接口里「日累计限定金额 = 0」并不代表暂停申购，
 * 它同时出现在「开放申购」和「限大额」的基金上（表示该字段未披露数值）。
 * 早期版本把 maxAmount === 0 直接判成暂停申购，导致大量可申购基金被误标。
 */
export function buildSubscribeState(
  rawStatus: string,
  maxAmount: number | null,
  minAmount: number | null,
): SubscribeState {
  const raw = (rawStatus ?? "").trim()

  if (PAUSED_PATTERN.test(raw)) {
    return { subscribeStatus: "暂停申购", statusGroup: "paused", limitDisclosed: false }
  }

  const hasLimit = maxAmount != null && maxAmount > 0
  const limitDisclosed = hasLimit && (minAmount == null || maxAmount >= minAmount)

  if (LIMITED_PATTERN.test(raw)) {
    return { subscribeStatus: "限大额", statusGroup: "open", limitDisclosed: limitDisclosed && hasLimit }
  }

  if (OPEN_PATTERN.test(raw)) {
    return { subscribeStatus: "开放申购", statusGroup: "open", limitDisclosed: limitDisclosed && hasLimit }
  }

  // 状态字段缺失时，退回到限额字段推断
  if (hasLimit && (minAmount == null || maxAmount >= minAmount)) {
    return { subscribeStatus: "限大额", statusGroup: "open", limitDisclosed: true }
  }

  return { subscribeStatus: "暂停申购", statusGroup: "paused", limitDisclosed: false }
}

export function formatLimitDisplay(
  maxAmount: number | null,
  subscribeStatus: SubscribeStatus,
  limitDisclosed = true,
): string {
  if (subscribeStatus === "暂停申购") return "暂停申购"
  if (!limitDisclosed) {
    return subscribeStatus === "限大额" ? "限大额（额度未披露）" : "未设限额"
  }
  return formatAmount(maxAmount)
}

export function getLimitLevel(
  maxAmount: number | null,
  subscribeStatus: SubscribeStatus,
  limitDisclosed = true,
): LimitLevel {
  if (subscribeStatus === "暂停申购") return "paused"
  if (!limitDisclosed) return subscribeStatus === "限大额" ? "unknown" : "none"
  if (maxAmount == null) return "unknown"
  if (maxAmount <= 1000) return "low"
  if (maxAmount <= 10000) return "medium"
  if (maxAmount < 100000000) return "high"
  return "none"
}

export function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch {
    return value
  }
}
