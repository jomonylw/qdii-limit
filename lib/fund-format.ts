import type { LimitLevel } from "@/lib/types"

export function parseAmount(value: string | undefined): number | null {
  if (value == null || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function formatAmount(value: number | null): string {
  if (value == null) return "未知"
  if (value === 0) return "0 元限额"
  if (value === 0.01) return "近零限额（0.01 元）"
  if (value >= 100000000) return "无限额/极高"
  if (value >= 10000) {
    const wan = value / 10000
    return `${Number.isInteger(wan) ? wan.toFixed(0) : wan.toFixed(2)} 万元`
  }
  return `${value.toLocaleString("zh-CN")} 元`
}

export function normalizeSubscribeStatus(
  rawStatus: string,
  maxAmount: number | null,
  minAmount: number | null,
): "开放申购" | "暂停申购" {
  if (rawStatus.includes("暂停")) return "暂停申购"
  if (maxAmount == null) return rawStatus === "开放申购" ? "开放申购" : "暂停申购"
  if (maxAmount === 0) return "暂停申购"
  if (minAmount != null && maxAmount < minAmount) return "暂停申购"
  return "开放申购"
}

export function formatLimitDisplay(maxAmount: number | null, subscribeStatus: string): string {
  if (subscribeStatus.includes("暂停")) return "暂停申购"

  return formatAmount(maxAmount)
}

export function getLimitLevel(maxAmount: number | null, subscribeStatus: string): LimitLevel {
  if (subscribeStatus.includes("暂停")) return "paused"
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
