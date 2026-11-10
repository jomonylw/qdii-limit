# QDII Limit Monitor

QDII Limit Monitor 通过公开全量基金接口自动发现 QDII 与海外基金，不维护基金代码白名单。新基金进入数据源后会自动出现在页面中。

## 功能

- 自动读取全市场基金目录并筛选 QDII / 海外基金。
- 按**代销渠道**与**直销渠道**两条独立列表查看，额度与申购状态分渠道展示。
- 支持纳指 100、标普 500、恒生科技、恒生指数、中国互联网、债券、商品、REITs 等主题。
- 支持美国、香港、全球、日本、印度、越南、欧洲等地区筛选。
- 支持场外基金、ETF 联接、LOF、场内 ETF 等交易形态筛选。
- 支持开放申购、限大额、暂停申购和额度等级筛选。
- 支持基金代码、名称、类型、基金公司搜索。
- 代销列表提供支付宝、腾讯理财通、天天基金三个核实入口。
- 直销列表按证监会披露平台的基金公告核实，展示直销状态、单日限额、依据公告与原文链接。

## 数据口径

### 代销渠道

项目使用东方财富公开全量接口完成基金发现、基础申购状态和限额参考：

```text
https://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx
```

该接口在项目中只作为全市场公开数据源，不代表天天基金购买渠道。支付宝和腾讯理财通是否实际销售、账户能否申购，以对应平台最终页面及受理结果为准。

> 关于「日累计限定金额 = 0」：该字段为 0 时**不代表暂停申购**，它同时出现在「开放申购」和「限大额」的基金上（表示该字段未披露数值）。申购状态一律以接口返回的交易状态字段为准，避免把可申购基金误标成暂停。

### 直销渠道

直销（基金公司官网网上交易 / 官方 APP / 官方微信 / 直销柜台）的状态和额度**没有公开批量接口**，而且经常和代销口径不一样。实测差异举例：

| 基金                   | 直销单日限额 | 代销单日限额 |
| ---------------------- | ------------ | ------------ |
| 大成纳斯达克100ETF联接 | 100 元       | 10 元        |
| 建信纳斯达克100 A/C    | 50 元        | 10 元        |
| 万家纳斯达克100        | 100 元       | 5 元         |
| 天弘纳斯达克100 D      | 100 元       | 未披露       |

这些差异只写在基金公司公告里，所以直销数据单独维护，数据来源是**中国证监会「资本市场统一信息披露平台」公募基金板块**（http://eid.csrc.gov.cn/fund）的基金临时公告，每条都带公告原文链接和公告日期，可回溯。

当前覆盖范围：纳指 100 主题的场外份额，60 个代码 / 17 家基金公司。其余基金显示「待核实」，并给出基金公司信息页入口。

数据存放在 `data/direct-sales.json`，服务运行时读取，改完文件不用重启（按 mtime 自动刷新）：

```json
{
  "schema": 1,
  "updatedAt": "2026-11-09",
  "syncedAt": "2026-11-09T03:00:00.000Z",
  "entries": {
    "022525": {
      "status": "open",
      "dailyLimit": 100,
      "currency": "CNY",
      "platform": "天弘基金直销",
      "url": "http://eid.csrc.gov.cn/fund/disclose/instance_show_pdf_id.do?instanceid=1580423",
      "source": "天弘纳斯达克100指数发起(QDII)A类、C类份额暂停申购及定投业务的公告",
      "updatedAt": "2026-09-18",
      "note": "D 类份额单日 100 元"
    }
  }
}
```

- `status`：`open` 可申购 / `paused` 暂停申购
- `dailyLimit`：单日累计申购上限（原币种），暂停时填 `null`
- `currency`：`CNY` 或 `USD`，缺省人民币
- `auto: true` 表示由定时任务自动解析写入，未人工复核

## 定时同步

定时任务写在代码里，由 `instrumentation.ts` 在服务启动时注册（`lib/scheduler.ts`），**不需要外部 cron**。

- 每天北京时间 **00:00** 执行一次，拉取纳指 100 场外基金的最新临时公告，只处理有更新的基金
- 启动时如果距上次同步超过 20 小时，会在 30 秒后补跑一次
- 定时任务与手动接口共用 `data/.sync.lock` 原子互斥，避免重复抓取和并发写入
- 公告 PDF 用 `python3` + `pypdf` 解析；环境里没有时跳过额度更新并记为待复核
- 只有完整巡检成功才更新最后成功时间；部分网络失败会保留启动补跑机会
- 多份额、多币种或多个有效金额的复杂公告不会自动覆盖，统一写入待复核报告
- 最近一次巡检结果保存在 `data/direct-sales-sync-report.json`，也可通过同步状态接口查看

环境变量：

| 变量                      | 默认 | 说明                                  |
| ------------------------- | ---- | ------------------------------------- |
| `DIRECT_SALES_SYNC`       | 开启 | 设为 `off` 关闭定时任务               |
| `DIRECT_SALES_SYNC_HOUR`  | `0`  | 每天几点执行（北京时间，0-23）        |
| `DIRECT_SALES_SYNC_TOKEN` | 空   | 设置后手动触发接口需带 `x-sync-token` |

手动触发（走运行中的服务，和定时任务共用同一套逻辑）：

```bash
pnpm sync:direct           # 触发一次同步
pnpm sync:direct --status  # 查看数据集状态
```

也可以直接调接口：

```bash
curl -X POST http://127.0.0.1:3000/api/direct-sales/sync
curl http://127.0.0.1:3000/api/direct-sales/sync
```

解析规则：每个基金份额独立查找最新适用公告。公告里出现「直销渠道 / 直销机构 / 直销电子交易平台」的句子取直销额度，只有代销口径时不修改直销数据，都没提则视为全渠道统一限额。同一份公告里出现多个不同金额或币种（例如分份额给不同额度）时不会自动覆盖，只记为待复核，避免把人工核实过的准确值改坏。公告包含未来生效日期时，会等到生效日再更新。

Docker 部署时 `data` 目录挂在 `direct-sales-data` 卷上，容器重建不丢；首次启动用镜像里的 `data.seed` 初始化。

当前 QDII 入选条件为：

- 基金类型包含 `QDII`；或
- 基金类型包含 `海外`；或
- 基金名称包含 `QDII`。

地区、主题和交易形态通过基金名称与类型字段自动分类，不依赖基金代码清单。

## 本地运行

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm start
```

## Docker 部署

```bash
docker compose up -d --build
```

浏览器访问：

```text
http://服务器IP:3000
```

## 主要文件

```text
app/api/funds/route.ts        全量基金接口
components/fund-dashboard.tsx 看板、渠道切换和筛选逻辑
components/fund-channel-tabs.tsx 代销 / 直销渠道切换
components/fund-stat-cards.tsx 按渠道统计的指标卡
components/fund-toolbar.tsx   分类筛选工具栏
components/fund-table.tsx     代销 / 直销两套列表列定义
lib/eastmoney.ts              全量数据获取
lib/fund-normalizer.ts        状态、额度与渠道标准化
lib/fund-format.ts            申购状态判定与额度文案
lib/fund-company.ts           基金公司识别
lib/fund-companies.ts         基金公司静态映射表
lib/direct-sales.ts           直销数据集读取与渠道报价
lib/direct-sales-announcement.ts 公告状态、份额与额度的保守解析
lib/direct-sales-sync.ts      公告抓取、PDF 解析与额度提取
lib/scheduler.ts              进程内定时任务（每天 00:00）
instrumentation.ts            服务启动钩子，注册定时任务
lib/fund-filters.ts           地区、主题、交易形态分类
scripts/sync-direct-sales.mjs 手动触发同步
data/direct-sales.json        直销数据集
data/direct-sales-sync-report.json 最近一次巡检报告（运行时生成）
```

## 注意事项

- 本项目仅用于信息展示与个人研究，不构成投资建议。
- 公开接口、支付宝或腾讯理财通页面结构变化时，需要同步调整解析或跳转方式。
- 平台最终受理结果可能受账户、地区、交易时间和临时额度控制影响。
