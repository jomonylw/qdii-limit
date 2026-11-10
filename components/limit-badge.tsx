import { AlertTriangle, CheckCircle2, Gauge, HelpCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ChannelQuote, LimitLevel } from "@/lib/types"

export function LimitLevelBadge({ level, text }: { level: LimitLevel; text: string }) {
  switch (level) {
    case "low":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {text}
        </Badge>
      )
    case "medium":
      return (
        <Badge variant="warning" className="gap-1">
          <Gauge className="h-3 w-3" />
          {text}
        </Badge>
      )
    case "high":
      return (
        <Badge variant="info" className="gap-1">
          <Gauge className="h-3 w-3" />
          {text}
        </Badge>
      )
    case "none":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {text}
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1 border-dashed text-slate-500 dark:text-slate-400">
          <HelpCircle className="h-3 w-3" />
          {text}
        </Badge>
      )
  }
}

export function ChannelLimitBadge({ quote }: { quote: ChannelQuote }) {
  return <LimitLevelBadge level={quote.limitLevel} text={quote.limitText} />
}
