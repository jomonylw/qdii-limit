"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { FundStatusBadge } from "@/components/fund-status-badge"
import { LimitBadge } from "@/components/limit-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FundRecord } from "@/lib/types"

function getRegionLabel(region: FundRecord["regionCategory"]) {
  const labels: Record<FundRecord["regionCategory"], string> = {
    us: "美国",
    hongkong: "香港",
    "china-offshore": "中国离岸",
    global: "全球",
    "asia-pacific": "亚太",
    japan: "日本",
    india: "印度",
    vietnam: "越南",
    germany: "德国",
    europe: "欧洲/英国",
    emerging: "新兴市场",
    "other-region": "其他地区",
  }
  return labels[region]
}

function getThemeLabel(theme: FundRecord["themeCategory"]) {
  const labels: Record<FundRecord["themeCategory"], string> = {
    nasdaq100: "纳指100",
    sp500: "标普500",
    "hangseng-tech": "恒生科技",
    hangseng: "恒生指数",
    hongkong: "港股",
    "hongkong-tech": "港股科技",
    "hongkong-biotech": "港股医药",
    "china-internet": "中国互联网",
    biotech: "生物科技",
    "us-tech": "美股科技",
    us: "美股",
    japan: "日本",
    india: "印度",
    vietnam: "越南",
    germany: "德国",
    global: "全球/境外",
    commodity: "商品/能源",
    reits: "REITs",
    bond: "债券",
    "other-qdii": "其他QDII",
  }
  return labels[theme]
}

function SortButton({
  label,
  column,
}: {
  label: string
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" }
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )
}

function getFundDetailUrl(code: string) {
  return `https://fund.eastmoney.com/${code}.html`
}

const linkClassName =
  "underline-offset-4 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400"

function getSortableSubscribeAmount(fund: FundRecord) {
  if (fund.subscribeStatus === "暂停申购") return -1
  return fund.maxSubscribeAmount ?? -1
}

const columns: ColumnDef<FundRecord>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => <SortButton label="代码" column={column} />,
    cell: ({ row }) => (
      <a
        href={getFundDetailUrl(row.original.code)}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300 ${linkClassName}`}
      >
        {row.original.code}
      </a>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortButton label="基金简称" column={column} />,
    cell: ({ row }) => (
      <div className="min-w-[260px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={getFundDetailUrl(row.original.code)}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium ${linkClassName}`}
          >
            {row.original.name}
          </a>
          <Badge variant="secondary" className="shrink-0">
            {getRegionLabel(row.original.regionCategory)}
          </Badge>
          <Badge variant="outline" className="shrink-0">
            {getThemeLabel(row.original.themeCategory)}
          </Badge>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortButton label="基金类型" column={column} />,
    cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.original.type}</span>,
  },
  {
    accessorKey: "subscribeStatus",
    header: ({ column }) => <SortButton label="申购状态" column={column} />,
    cell: ({ row }) => <FundStatusBadge status={row.original.subscribeStatus} />,
  },
  {
    accessorKey: "maxSubscribeAmount",
    header: ({ column }) => <SortButton label="日累计限额" column={column} />,
    cell: ({ row }) => <LimitBadge fund={row.original} />,
    sortingFn: (a, b) => getSortableSubscribeAmount(a.original) - getSortableSubscribeAmount(b.original),
  },
  {
    accessorKey: "date",
    header: ({ column }) => <SortButton label="日期" column={column} />,
    cell: ({ row }) => <span>{row.original.date}</span>,
  },
]

export function FundTable({ funds }: { funds: FundRecord[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "maxSubscribeAmount", desc: true }])

  const table = useReactTable({
    data: funds,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  })

  return (
    <div>
      <div className="overflow-hidden bg-white/60 dark:bg-slate-950/40">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                    <div className="font-medium text-slate-700 dark:text-slate-200">没有匹配的基金</div>
                    <div className="text-sm">尝试清空主题、切换地区或查看全部状态。</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="tabular-nums">
          第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1} 页 · 共{" "}
          {funds.length.toLocaleString("zh-CN")} 条
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg bg-white/80 dark:bg-slate-950/60"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg bg-white/80 dark:bg-slate-950/60"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}
