# 晶泰控股：证据元数据最终复核

复核范围仅为 `data/xtalpi_model.pending.json` 的 `financialEvidence` 与 `sources`。本轮按 metric 对照，不按旧数组下标；来源按 URL 对照。未修改模型、公司正文或整合脚本，未重新下载或通读 PDF 全文。依据前轮已完成的原始 PDF 审阅、回购审阅、已保存港交所标题与来源元数据进行复查。

## 固定快照与结论

- 证券：I027 / S032 / 02228.HK；信息截止日：2026-10-09。
- 指定最终模型 SHA256：`fe716e37550d1a8f9c39c528888a4a68ccf8fd1f88ff5be42d7281149e1bd219`。
- Evidence SHA256：`b0a86c69ddc4fbd8d3cd7c94a1f2929b0ffb6c943be35c3669f82bdbe8d41716`。
- Sources SHA256：`e4dae928afc49d5b0960d50296ea5ec16d59e96c9efac7787f6f9c8564c082f4`。
- 观察时点：2026-10-10T17:25:57.625Z；文件修改时点：2026-10-10T17:25:27.894Z；880095 字节。
- 版本：`xtalpi-v1-netContract-investmentRecovery-CBJan27-H2LeaseTotal`。
- 66 个独立 metric、66 项 financialVerified、83 个来源。逐项数值、首次公开日期/URL、当前来源日期/URL与 PDF 页码匹配前轮独立审阅；无实质未解决证据问题。
- 留存两项不影响经济金额的原千元浮点尾数：CustomerARevenue 为 129407.00000000001、leaseLiability 为 128056.00000000001。原文相应为整数 129407、128056；模型百万元金额正确。

结论适用于以上固定快照，不自动覆盖后续文件版本，也不构成正文、Excel、适配器、排名或全套 27 文件的验收结论。

## 本轮修正的核验结果

1. 10 个此前被回溯到八月的精确值现在均以 2026-09-09 21:23 完整中报为首次来源：MMF、structuredNotes、listed、PEFunds、unlisted、convertibleInvestments、associates、JV、CBHistoricalPrincipalCNY、CBAccountLiability。grants 的完整政府补助分类亦使用九月附注。八月已披露的折旧、现金流与其他财务总额保留八月首次日期。
2. GP、DA、leaseLiability、bankPrincipal 已明确 derived 与公式。bankPrincipal 是 234.700 + 24.900 + 270.500 = 530.100 百万元；八月管理层讨论只给到 530.1 百万元。不能把精确分类的披露时间倒推到董事会批准日。
3. 未获原文支持的 leaseInterestCash2.094 与 leasePrincipalCash14.992 已从 evidence 和 financialVerified 移除。leaseCashReported17.086 为 leaseCash 的明确别名，附 aliasOf、derived=false、收盘后标记和不再扣减说明。两者只代表同一融资租赁付款事实。
4. CBPrincipalHKD 原始单位已改为 HKD million，原始值2866、除数1。发行人可转债合同本金、历史发行日人民币会计金额2535.837、六月账面负债2460.330、净融资现金2512.330与101.76%赎回比例分别保存，未混用。
5. 原始费用、损失及现金流支出的括号负号已保留在 reportedValue。模型以正数表示费用/损失/支出绝对值，使用 signConvention 明示；经营现金流仍保留净流出的负号。此次元数据修正没有改变原已核实经营金额。
6. 可转债条款首次来源为 2026-01-08 06:50；实际发行完成2026-01-28 18:23另有来源。当前四项合同 period 已写明条款、发行与到期日，无所述“本金period2026H1”遗留错误。CBNonCashInterest与CBNetCash为2026H1；历史本金人民币金额为发行日；账面负债为六月末。
7. JuneShares 首值来自2026-07-07 16:54月报，2026-07-13 17:54修订确认单列；不能替换成EPS加权平均股数。九月末股数/库存/期权/RSU快照仍来自2026-10-06 19:23九月月报，保留六月与九月的真实时点。
8. 83 个来源与138条保存的港交所标题按 URL 对照，正式标题、时间与原始来源元数据全部一致；均有 publicationDateTimeHK、session与afterClose；无重复URL、无超截止日、均为港交所发行人原始来源。新增七份翌日披露表已全部纳入。

## 并发版本记录

前轮67项原始审阅：`e017c252e0bfe1d5bbfcbba7ea5ab7449be5488c72063b1f943e8a57c344706e`；删除无证据拆分、添加总额别名后的66项版本：`e1abea5586c12c7f1cd45944b47c6dbc27391d84d3be76dd530b7c9620f6cc7a`；首次日期与来源修正后的版本：`f904e43021a6caf1b137822f33498123947c9f9c4266ec3f297b346febeabc88`；追加七来源但尚有单位/负号/会话字段待修的版本：`cdeb246e14ff74d0626e4da60bd65d1c10ba8a82996575df87f300800454d9b5`；本次指定最终版：`fe716e37550d1a8f9c39c528888a4a68ccf8fd1f88ff5be42d7281149e1bd219`。67→66项是删除两项、增加一项别名的净变化，不是漏审；65项共同metric数值未变。

## 逐 metric 对照

A=2026-08-19业绩公告；I=2026-09-09完整中报；S=2026-10-06九月月报；J=2026-01-08可转债拟发行条款；O=2026-07-07六月月报。所有页码为实际PDF页。完整来源URL、原始单位、负号、公式与检查标记见同名JSON。

| Metric | 模型值 | 币种/单位 | 期间 | 首次来源/时间 | 当前PDF页 | 计算值 | 复核 |
|---|---:|---|---|---|---|---|---|
| revenue | 393.627 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| drugRevenue | 200.109 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I104 | 否 | 通过 |
| AI4SRevenue | 193.518 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I104 | 否 | 通过 |
| CustomerARevenue | 129.407 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I104 | 否 | 通过；原千元浮点尾数 |
| pointRevenue | 345.375 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I104 | 否 | 通过 |
| overTimeRevenue | 48.252 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I104 | 否 | 通过 |
| COGS | 167.834 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| GP | 225.793 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 是 | 通过 |
| admin | 212.142 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| RD | 367.838 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| selling | 48 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| grants | 13.335 | CNY/million | 2026H1 | I：2026-09-09 21:23 | I107 | 否 | 通过 |
| otherGains | 135.673 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I107 | 否 | 通过 |
| FXLoss | 18.734 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I107 | 否 | 通过 |
| derivativeLoss | 4.72 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I107 | 否 | 通过 |
| financialFVGain | 154.242 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I107 | 否 | 通过 |
| financeIncome | 91.23 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| financeExpenses | 60.125 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| CBNonCashInterest | 52.96 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I122 | 否 | 通过 |
| parentLoss | 251.901 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| groupLoss | 224.944 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| NCIProfit | 26.957 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I85 | 否 | 通过 |
| groupAdjustedLoss | 105.511 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I48 | 否 | 通过 |
| SBC | 66.473 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I106 | 否 | 通过 |
| PPEdepreciation | 40.051 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I106 | 否 | 通过 |
| ROUdepreciation | 19.456 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I106 | 否 | 通过 |
| intangibleAmortization | 7.482 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I106 | 否 | 通过 |
| DA | 66.989 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I106 | 是 | 通过 |
| cash | 2622.881 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I117 | 否 | 通过 |
| term | 3845.317 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I117 | 否 | 通过 |
| MMF | 1253.406 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I114 | 否 | 通过 |
| structuredNotes | 944.554 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I114 | 否 | 通过 |
| restricted | 5.022 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I87 | 否 | 通过 |
| listed | 891.37 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I114 | 否 | 通过 |
| PEFunds | 877.692 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I114 | 否 | 通过 |
| unlisted | 645.181 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I114 | 否 | 通过 |
| convertibleInvestments | 107.344 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I114 | 否 | 通过 |
| financialNonCurrent | 2521.587 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I114 | 否 | 通过 |
| associates | 79.601 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I112 | 否 | 通过 |
| JV | 79.225 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I112 | 否 | 通过 |
| equityParent | 9000.002 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I87 | 否 | 通过 |
| NCIEquity | 72.256 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I87 | 否 | 通过 |
| bankPrincipal | 530.1 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I120 | 是 | 通过 |
| leaseLiability | 128.056 | CNY/million | 2026-06-30 | A：2026-08-19 18:09 | I112 | 是 | 通过；原千元浮点尾数 |
| OCF | -399.238 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I91 | 否 | 通过 |
| termInterestCash | 29.418 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I91 | 否 | 通过 |
| bankInterestCash | 5.071 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I92 | 否 | 通过 |
| PPEcashCapex | 49.787 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I91 | 否 | 通过 |
| intangibleCashCapex | 18.659 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I91 | 否 | 通过 |
| leaseCash | 17.086 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I92 | 否 | 通过 |
| leaseCashReported | 17.086 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I92 | 否；别名 | 通过 |
| CBNetCash | 2512.33 | CNY/million | 2026H1 | A：2026-08-19 18:09 | I122 | 否 | 通过 |
| CBHistoricalPrincipalCNY | 2535.837 | CNY/million | 2026-01-28 | I：2026-09-09 21:23 | I122 | 否 | 通过 |
| CBAccountLiability | 2460.33 | CNY/million | 2026-06-30 | I：2026-09-09 21:23 | I122 | 否 | 通过 |
| CBPrincipalHKD | 2866 | HKD/million | 2026-01-08 terms; issued 2026-01-28, maturity 2027-01-26 | J：2026-01-08 06:50 | I121 | 否 | 通过 |
| CBRedemptionRatio | 1.0176 | none/ratio | 2026-01-08 terms; issued 2026-01-28, maturity 2027-01-26 | J：2026-01-08 06:50 | I121 | 否 | 通过 |
| CBPriceHKD | 13.85 | HKD/HKDperShare | 2026-01-08 terms; issued 2026-01-28, maturity 2027-01-26 | J：2026-01-08 06:50 | I121 | 否 | 通过 |
| CBConversionShares | 206931407 | none/shares | 2026-01-08 terms; issued 2026-01-28, maturity 2027-01-26 | J：2026-01-08 06:50 | I50 | 否 | 通过 |
| JuneShares | 4303469679 | none/shares | 2026-06-30 | O：2026-07-07 16:54 | I51 | 否 | 通过 |
| SeptExTreasuryShares | 4301176179 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S2 | 否 | 通过 |
| SeptTreasury | 299000 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S2 | 否 | 通过 |
| PostOptions | 10505590 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S3 | 否 | 通过 |
| Scheme2026Options | 35649130 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S3 | 否 | 通过 |
| PostRSU | 11746712 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S7 | 否 | 通过 |
| Scheme2026RSU | 9134712 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S7 | 否 | 通过 |
| PreIssuedOptions | 217188943 | none/shares | 2026-09-30 | S：2026-10-06 19:23 | S3 | 否 | 通过 |

## 限制与后续记录

本次使用已完成原文审阅作为事实基线，没有重复下载PDF或重做公司经济模型。可考虑把复合合同 period 拆成结构化条款日、发行日、到期日，以便后续程序处理；这是可选字段改善，当前时点事实已正确。下次修元数据时可把两个 reportedValue 的浮点尾数整理为原文整数，归一化百万元值无需变化。若模型哈希变化，应重新核验受影响字段并另留快照，不能把此结果自动扩展至新版本。

