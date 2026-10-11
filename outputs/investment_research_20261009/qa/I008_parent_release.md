# I008 英矽 v3 条件研究冻结整合合同

截止2026-10-09，I008/S008/03696.HK，现价49HKD。版本insilico-v3-perIndicationDemand-ConditionalFunding-UnallocatedClinical，formal/pending相同SHA256 `3d3b8f4f60d56ebb9e985a6f7f505dd3d62bb99e2398754cf9ff69218efee0ba`；正文 `16cae2aa082e306954a47c757d1249b7fc2bb1f70eadba8dc9c068dddd581e7a`。15585有效汉字、105段、重复/近重复0。此释放只批准条件研究完整展示，不批准可交易基准、正式目标或排名，不代表全项目验收。

## 必须使用条件分支

`valuationConditioned:true`，`rankEligible:false`、rankingEligible false、formalTargetAvailable false。正式 `scores/scenarios/horizons` 皆空对象。诊断分数在diagnosticScores、原未融资压力在conditionalScenarios/conditionalHorizons，价格及短期识别混合值不能进入正式目标、上涨空间、年底期望或四榜。原expectedPrice语义已删除，算术权重只存rawStressWeightedReferenceHKD及rawStressWeightedReturnPct。四期诊断53.0/57.9/62.4/66.2仅观察维度。

## 原子桥

native `tools/insilico_native.mjs` SHA256 `9fb1f14263b0023bbbc8aa87f43b0b06c4db82c45bf5c0f9197657b7639b6f53`，原接口initializeInsilicoBridge/calculateInsilicoAnnual/calculateInsilicoHorizon/setInsilicoAtomic/insilicoCases保持，horizon自动用conditionalScenarios。workbook `tools/insilico_workbook.mjs` SHA256 `c05d1c799983a64e24e9b83bda9b6dc6e4032f113093f41e132121178dea5434`，9表，父builder如接条件modelRows须用conditionalScenarios及recognitionColumn U。金额USDbn、股数bn、EPS USD，FX7.8HKD/USD，CB换股固定7.8394。

## 核验与边界

独立1,286,935 checks（31输入变更、13敏感性），含67资产/32需求、零gate、全部费用、权益六快照、两融资、两现金尾部及成本+30/+100独立复算。adapter59,780 checks，4,307 atoms、每场景1,454 signatures，无Excel错误。正文180，peer经济13,147、正文473、来源447、技术92均PASS并绑定上述最终模型/body/native；专门事实复查也通过body16ca，原0136模型仅摘要元数据后变，最终经济来源已重绑定3d3b。9表+4detail PNG全视觉检查；长ID/换行/年份显示修复后关键表重新看。

正式不排名原因：完整未融资计划2030现金转负，26年min−.895074151USDbn。2027-09-01偿债事件现金proxy却为.434319057USDbn，不能将未来缺口当2027清算。900mUSD@30及分期400m@25/500m@20融资研究虽正年度现金，却价格远高保守内在、需未来临床/市场证据，非经济自洽基准。融资未宣布、不作正式情景，股数/费用代价已计；项目stop/go和权利转让净成本仍需补齐。

32具名适应症患者×价格×份额独立峰销，35观察零gate；公开自研ownership1为研究不等无负担净权益，50%Hygtia/Fosun保持，权益敏感性乘原收益且全成本不变。原全部9组临床预算保留未分配，单药0费用不等无费用，+30%连乐观资金路径失败。未地域拆分的需求是中国加潜在海外可支付研究合计，同分子风险相关；MAT2A池排除GBM，T2D非肥胖延伸未验证。现金End2051是有限经济测试，US已知专利不套全球，2042硬截与首商5年压力均费用不变。

Nature128筛选/71随机/55完成12周、16退出；registry59overall/49末次FVC不同，ITT/MAR插补不代表全随机有效测量，TEAE主要、FVC次要、肝伤停药及无power已披露。III实际2026-09-09、预计2029-10-30完成晚于三年目标，47地点仅12recruiting。US oral主动inactive非监管hold。H1经济cash85.255m、H2option43.88738622mHKD、CB301.6m净款/305m本金各不重复。外资100/71/85/84.5新闻目标独立保留，JPM2027Dec不当12个月/年底。

父负责条件models注册、brokerTargets纳入、同源Word/PDF与逐页检查。不要恢复压力值为正式目标；资金/项目选择自洽模型的未完成项必须列在总报告。
