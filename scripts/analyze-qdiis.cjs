const fs = require('fs')
const vm = require('vm')

const EAST = 'https://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx?t=8&page=1,50000&js=reData&sort=fcode,asc'
const overseasKeywords = ['QDII', '纳斯达克', '纳指', 'NASDAQ', 'Nasdaq', '标普', '美国', '全球', '境外', '恒生', '香港']
const nasdaqKeywords = ['纳斯达克', '纳指', 'NASDAQ', 'Nasdaq', '纳斯达克100', 'NASDAQ100']

function parseAmount(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatAmount(value) {
  if (value == null) return '未知'
  if (value === 0 || value === 0.01) return '需结合状态'
  if (value >= 100000000) return '无限额/极高'
  if (value >= 10000) {
    const wan = value / 10000
    return `${Number.isInteger(wan) ? wan.toFixed(0) : wan.toFixed(2)} 万元`
  }
  return `${value.toLocaleString('zh-CN')} 元`
}

function includesAny(value, keywords) {
  const lower = String(value || '').toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()))
}

function isQdiiLike(name, type) {
  return String(type).toLowerCase().includes('qdii') || String(name).toLowerCase().includes('qdii')
}

function isOverseasLike(name, type) {
  return isQdiiLike(name, type) || String(type).includes('海外') || includesAny(name, overseasKeywords)
}

function reason(fund) {
  const reasons = []
  if (String(fund.type).toLowerCase().includes('qdii')) reasons.push('type:QDII')
  if (String(fund.type).includes('海外')) reasons.push('type:海外')
  if (String(fund.name).toLowerCase().includes('qdii')) reasons.push('name:QDII')
  for (const keyword of overseasKeywords) {
    if (String(fund.name).toLowerCase().includes(keyword.toLowerCase())) reasons.push(`name:${keyword}`)
  }
  return [...new Set(reasons)].join(', ')
}

function esc(value) {
  return String(value ?? '').replaceAll('|', '\\|')
}

async function main() {
  fs.mkdirSync('reports', { recursive: true })

  const res = await fetch(EAST, { cache: 'no-store' })
  if (!res.ok) throw new Error(`fetch failed ${res.status}`)

  const text = await res.text()
  const objectText = text
    .replace(/^\s*var\s+reData\s*=\s*/, '')
    .replace(/^\s*reData\s*=\s*/, '')
    .replace(/\s*;\s*$/, '')
    .trim()
  const raw = vm.runInNewContext(`(${objectText})`)

  const all = raw.datas
    .map((row) => {
      const max = parseAmount(row[9])
      const fund = {
        code: row[0] || '',
        name: row[1] || '',
        type: row[2] || '',
        subscribeStatus: row[5] || '',
        max,
        formattedLimit: formatAmount(max),
      }
      fund.isOverseasLike = isOverseasLike(fund.name, fund.type)
      return fund
    })
    .filter((fund) => fund.code && fund.name)

  const funds = all.filter((fund) => fund.isOverseasLike)
  const typeCounts = new Map()
  const reasonCounts = new Map()
  const weakKeywordSamples = []

  for (const fund of funds) {
    typeCounts.set(fund.type, (typeCounts.get(fund.type) || 0) + 1)
    for (const item of reason(fund).split(', ').filter(Boolean)) {
      reasonCounts.set(item, (reasonCounts.get(item) || 0) + 1)
    }

    const strongTypeSignal = /qdii/i.test(fund.type) || fund.type.includes('海外')
    const qdiiNameSignal = /qdii/i.test(fund.name)
    if (!strongTypeSignal && !qdiiNameSignal) weakKeywordSamples.push(fund)
  }

  const strong = funds.filter((fund) => /qdii/i.test(fund.type) || fund.type.includes('海外') || /qdii/i.test(fund.name))
  const supplemental = funds.filter((fund) => !(/qdii/i.test(fund.type) || fund.type.includes('海外') || /qdii/i.test(fund.name)))
  const nasdaq = funds.filter((fund) => includesAny(fund.name, nasdaqKeywords))

  const lines = []
  lines.push('# 当前 QDII/海外基金简称与基金类型')
  lines.push('')
  lines.push(`生成时间：${new Date().toISOString()}`)
  lines.push(`源记录：${raw.record}`)
  lines.push(`当前分类输出数量：${funds.length}`)
  lines.push('')
  lines.push('| 序号 | 代码 | 基金简称 | 基金类型 | 申购状态 | 日累计限额 | 分类命中原因 |')
  lines.push('|---:|---|---|---|---|---:|---|')
  funds.forEach((fund, index) => {
    lines.push(`| ${index + 1} | ${fund.code} | ${esc(fund.name)} | ${esc(fund.type)} | ${esc(fund.subscribeStatus)} | ${esc(fund.formattedLimit)} | ${esc(reason(fund))} |`)
  })
  fs.writeFileSync('reports/qdii_current_classification.md', lines.join('\n'))

  const report = []
  report.push('# QDII/海外基金当前分类规则研究')
  report.push('')
  report.push(`生成时间：${new Date().toISOString()}`)
  report.push(`源记录：${raw.record}`)
  report.push(`当前分类输出：${funds.length} 条`)
  report.push(`强 QDII/海外信号：${strong.length} 条`)
  report.push(`仅名称海外关键词补充：${supplemental.length} 条`)
  report.push(`纳指相关：${nasdaq.length} 条`)
  report.push('')
  report.push('## 1. 基金类型分布')
  report.push('')
  report.push('| 基金类型 | 数量 |')
  report.push('|---|---:|')
  ;[...typeCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .forEach(([type, count]) => report.push(`| ${esc(type || '(空)')} | ${count} |`))
  report.push('')
  report.push('## 2. 分类命中原因分布')
  report.push('')
  report.push('| 命中原因 | 数量 |')
  report.push('|---|---:|')
  ;[...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .forEach(([item, count]) => report.push(`| ${esc(item)} | ${count} |`))
  report.push('')
  report.push('## 3. 仅靠名称关键词命中的样本')
  report.push('')
  report.push('这类记录说明：如果只看基金类型字段，会漏掉部分海外主题；但如果名称关键词过宽，也可能纳入不是严格 QDII 的产品。')
  report.push('')
  report.push('| 代码 | 基金简称 | 基金类型 | 命中原因 |')
  report.push('|---|---|---|---|')
  weakKeywordSamples.slice(0, 160).forEach((fund) => {
    report.push(`| ${fund.code} | ${esc(fund.name)} | ${esc(fund.type)} | ${esc(reason(fund))} |`)
  })
  report.push('')
  report.push('## 4. 合理性判断')
  report.push('')
  report.push('当前规则的优点：')
  report.push('')
  report.push('- 能覆盖基金类型中明确写有 `QDII`、`海外` 的产品。')
  report.push('- 能补充覆盖部分类型字段未写 QDII/海外、但名称明显是海外主题的产品。')
  report.push('- 对纳指场景有较好召回，因为名称关键词可以直接命中纳斯达克/纳指/NASDAQ。')
  report.push('')
  report.push('当前规则的问题：')
  report.push('')
  report.push('- `香港`、`恒生`、`全球`、`美国` 等关键词属于宽泛海外主题，不等同于官方 QDII 标识。')
  report.push('- 默认列表如果直接混合强信号与弱关键词补充，会让用户误以为所有基金都是严格 QDII。')
  report.push('- 仅靠名称中的 `全球`、`香港` 可能纳入一些投资主题相关但分类不是 QDII/海外的基金，需要单独标识为“海外主题补充”。')
  report.push('')
  report.push('## 5. 建议优化规则')
  report.push('')
  report.push('建议把当前一个布尔值 `isOverseasLike` 拆成三层分类：')
  report.push('')
  report.push('| 层级 | 规则 | UI 标签 | 用途 |')
  report.push('|---|---|---|---|')
  report.push('| 强 QDII/海外 | 基金类型包含 `QDII` 或 `海外`，或简称包含 `QDII` | QDII/海外 | 默认可信主集合 |')
  report.push('| 海外主题补充 | 简称命中 `纳斯达克`、`纳指`、`NASDAQ`、`标普`、`恒生`、`香港`、`美国`、`全球`、`境外` | 海外主题 | 召回补充，但需区别展示 |')
  report.push('| 纳指专用 | 简称命中 `纳斯达克`、`纳指`、`NASDAQ`，并结合 `联接`、`A/C`、`人民币/美元` | 纳指 | 纳指100限额专用筛选 |')
  report.push('')
  report.push('推荐默认页面：展示强 QDII/海外 + 纳指专用明显命中项；将宽泛海外主题补充作为可选筛选，或在表格中单独用标签显示。')
  fs.writeFileSync('reports/qdii_classification_analysis.md', report.join('\n'))

  console.log(JSON.stringify({ ok: true, record: raw.record, funds: funds.length, strong: strong.length, supplemental: supplemental.length, nasdaq: nasdaq.length, typeCount: typeCounts.size }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
