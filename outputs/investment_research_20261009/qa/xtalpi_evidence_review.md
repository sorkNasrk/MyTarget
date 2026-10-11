# 晶泰 financialEvidence 来源与口径独立复核

对象：I027 / S032 / 02228.HK；只读审阅`data/xtalpi_model.pending.json`的67个financialEvidence记录。模型仍由负责人持续写入，本记录是指定版本快照的审阅意见，未修改模型、正文或整合脚本。

审阅快照：2026-10-10 17:15:43 UTC（2026-10-11 01:15:43香港时间）；文件最后写入2026-10-10 17:12:21.953 UTC，841,824字节。模型版本`xtalpi-v1-netContract-investmentRecovery-CBJan27`；文件SHA256 `e017c252e0bfe1d5bbfcbba7ea5ab7449be5488c72063b1f943e8a57c344706e`；financialEvidence单独SHA256 `e98936b38725c078025da0e0676c0b1aff70fbe96d4a02095d204dd5d25b3156`。后续改变不自动视为已经本审阅确认。

## 结论及须修正项

1. **10个精确金额首次披露日期过早**：MMF、structuredNotes、listed、PEFunds、unlisted、convertibleInvestments、associates、JV、CBHistoricalPrincipalCNY及CBAccountLiability精确值仅在9月9日完整中报出现，不能统一标为8月19日。8月公告有流动/非流动金融资产总额、权益法投资合计及可转债约数，不能由此宣称分类精确值已公开。上述sourceURL指向9月中报是正确的，firstPublicDate应改为2026-09-09 21:23。
2. **D&A及主要现金流首次日期8月19日正确**：PPE折旧40.051m、ROU折旧19.456m、无形资产摊销7.482m已在8月公告第40页；现金流各项已在第35页。完整中报财务报表注明8月19日董事会批准，不等于所有完整附注8月19日已经对外公开。
3. **两个租赁现金拆分缺少原始证据**：leaseInterestCash2.094m、leasePrincipalCash14.992m未见于8月公告或9月中报。2.094=60.125财务费用−52.960可转债摊销−5.071银行已付现金息，14.992=17.086租赁负债付款−2.094。这只是数值上的反推；财务费用属于权责发生制，银行已付利息属于现金，二者不能无披露依据互相抵扣以确定实际租赁现金利息。建议移出financialVerified/issuer_primary事实区，保留总租赁现金17.086m；如模型必须拆分，用明确研究假设并交代不确定性，不能标为已核验实际数。
4. **计算值和原始披露应分开**：GP225.793m=393.627−167.834；DA66.989m=40.051+19.456+7.482，两个数在两份原件均无直接合计行，应加`derived=true`、公式与原子输入来源。leaseLiability128.056m完整中报有直接合计；该数已可由8月公告的90.436+37.620算出，若firstPublicDate保留8月19日须标为当时可计算的合计。
5. **可转债日期和期间不能统一**：本金HKD2,866m、换股价13.85、换股股数206,931,407及101.76%赎回条款已经1月8日06:50拟发债公告披露，1月28日18:23完成公告确认实际发行。完整中报只是重述。其中CBNonCashInterest应为2026H1费用、CBAccountLiability应为2026-06-30时点、CBHistoricalPrincipalCNY应为2026-01-28发行日的人民币原始入账额、CBNetCash是发行净融资现金（现金流报告期2026H1），不能将它们全部标为2026-01-28/2027-01-26期间累计。
6. **比例币种错误**：CBRedemptionRatio1.0176的unit ratio合理，但currency CNY错误，应null或none，并注明从101.76%换算。CBPriceHKD的HKDperShare / HKD、CBPrincipalHKD的million / HKD正确。SeptTreasury299,000的shares / none当前版本已正确，不存在million错标。
7. **JuneShares首次日期**：4,303,469,679股已在7月7日16:54原月报第2页披露，7月13日17:54修订月报第2页确认。8月业绩公告只提供加权平均股数4,083,861千股，未直接披露6月末法定股数4,303,469,679。建议JuneShares采用7月13日修订月报为活动来源，并保留最早原值7月7日和修订时间两个字段；不能firstPublicDate设8月19日。

## 来源索引

下表索引为本次模型sources和xtalpi_sources的固定位置；实际实现须使用URL/ID，避免来源数组日后增补导致索引改变。

|代号|当前索引|公告时间（香港）|原件|
|---|---:|---|---|
|A|5|2026-08-19 18:09，收盘后|[中期业绩公告](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0819/2026081900919.pdf)|
|I|3|2026-09-09 21:23，收盘后|[2026完整中报](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0909/2026090901145.pdf)|
|S|0|2026-10-06 19:23，收盘后|[九月月报](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/1006/2026100601423.pdf)|
|J|29|2026-01-08 06:50，开盘前|[拟发债及条款公告](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0108/2026010800041.pdf)|
|C|28|2026-01-28 18:23，收盘后|[发债完成公告](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0128/2026012800647.pdf)|
|R|7|2026-07-13 17:54，收盘后|[六月修订月报](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0713/2026071300566.pdf)|
|O|8|2026-07-07 16:54，收盘后|[六月原月报](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0707/2026070700746.pdf)|

I的印刷页码比PDF页码少1；下表全部使用**PDF页码**。A/I的财务表原单位RMB'000，即人民币千元；模型除以1000存为CNY million，此单位转换正确。金额费用和亏损以正数绝对值存入有命名的Expense/Loss字段可以保留，但应另存原始带符号值，避免被当成正利润。

## 67项逐项核验

|metric|当前值/模型单位|8月19日是否已公开|原件位置|处理意见|
|---|---|---|---|---|
|revenue|393.627 CNY m|是|A31/I85|金额、单位、firstPublicDate正确；可加A首次URL|
|drugRevenue|200.109 CNY m|是|A39/I104|正确|
|AI4SRevenue|193.518 CNY m|是|A39/I104|正确|
|CustomerARevenue|129.407 CNY m|是|A39/I104|正确，匿名A不可自行命名|
|pointRevenue|345.375 CNY m|是|A39/I104|正确|
|overTimeRevenue|48.252 CNY m|是|A39/I104|正确|
|COGS|167.834 CNY m|是|A31/I85，原值负167,834千|绝对成本值正确，建议保留原始符号|
|GP|225.793 CNY m|可计算|A31/I85|derived=393.627−167.834，非直接披露合计|
|admin|212.142 CNY m|是|A31/I85|正确，绝对费用值|
|RD|367.838 CNY m|是|A31/I85|正确，绝对费用值|
|selling|48 CNY m|是|A31/I85|正确，48,000千元|
|grants|13.335 CNY m|金额是；全部归类为补助的明细9月才有|A31/46其他收入；I107 Note6补助|保留otherIncome8月首次，grants完整分类首日9月9日，或注明8月MD&A仅说主要变动由补助引起|
|otherGains|135.673 CNY m|是|A40/I107|正确|
|FXLoss|18.734 CNY m|是|A40/I107|绝对损失值正确|
|derivativeLoss|4.72 CNY m|是|A40/I107|绝对损失值正确|
|financialFVGain|154.242 CNY m|是|A40/I107|正确，不能说是已收现金收益|
|financeIncome|91.23 CNY m|是|A31/I85|正确，权责发生制，不等于29.418已收息|
|financeExpenses|60.125 CNY m|是|A31/I85|正确，权责发生制，不等于实际现金利息|
|CBNonCashInterest|52.96 CNY m|是|A47–48/I48/122|金额正确；period改2026H1；非票息，不再扣现金|
|parentLoss|251.901 CNY m|是|A31/I85|正确，归母亏损绝对值|
|groupLoss|224.944 CNY m|是|A31/I85|正确，集团亏损绝对值|
|NCIProfit|26.957 CNY m|是|A31/I85|正确，少数权益盈利|
|groupAdjustedLoss|105.511 CNY m|是|A48/I48|正确，非IFRS集团而非归母口径|
|SBC|66.473 CNY m|是|A48/I48/106|正确，常态SBC不自动剔除经营费用|
|PPEdepreciation|40.051 CNY m|是|A40/I106|正确，第一披露8月19日|
|ROUdepreciation|19.456 CNY m|是|A40/I106|正确，第一披露8月19日|
|intangibleAmortization|7.482 CNY m|是|A40/I106|正确，第一披露8月19日|
|DA|66.989 CNY m|可计算|A40/I106|derived=40.051+19.456+7.482|
|cash|2622.881 CNY m|是|A33/35/I87/117|正确；余额period宜2026-06-30|
|term|3845.317 CNY m|是|A33/I87/117|总额正确，原label bank deposits；币种分类附注9月首次|
|MMF|1253.406 CNY m|否，8月只给流动金融资产总额|I102/114 Note14|firstPublicDate改9月9日；货币基金不是期末现金等价物本项|
|structuredNotes|944.554 CNY m|否|I102/114 Note14|firstPublicDate改9月9日；不能称保证本金现金|
|restricted|5.022 CNY m|是|A33/I87|正确，不进自由现金|
|listed|891.37 CNY m|否|I99/114 Note14|firstPublicDate改9月9日|
|PEFunds|877.692 CNY m|否|I99/114 Note14|firstPublicDate改9月9日|
|unlisted|645.181 CNY m|否|I99/114 Note14|firstPublicDate改9月9日|
|convertibleInvestments|107.344 CNY m|否|I99/114 Note14|firstPublicDate改9月9日；本项投资资产不是公司发债|
|financialNonCurrent|2521.587 CNY m|是|A33/I87/114|合计firstPublicDate8月正确；分类不能提前|
|associates|79.601 CNY m|否，8月只给权益法158.826合计|I112/113 Note13|firstPublicDate改9月9日|
|JV|79.225 CNY m|否|I112/113 Note13|firstPublicDate改9月9日|
|equityParent|9000.002 CNY m|是|A33/I87/89|正确；余额period宜2026-06-30|
|NCIEquity|72.256 CNY m|是|A33/I87/89|正确；余额period宜2026-06-30|
|bankPrincipal|530.1 CNY m|是，MD&A精度0.1m|A48/I120|数值正确；9月明细270.500+24.900+234.700=530.100，保留8月约数精度说明|
|leaseLiability|128.056 CNY m|可计算|A34两行90.436+37.620；I112合计|金额正确；若first8月标derived，直接合计9月|
|OCF|−399.238 CNY m|是|A35/I91|带符号流出正确|
|termInterestCash|29.418 CNY m|是|A35/I91|数值正确；原label银行存款收取利息，未限定只长期/定期，建议bankDepositInterestReceivedCash|
|bankInterestCash|5.071 CNY m|是|A35/I92|绝对现金支付正确；不代表权责银行费用|
|PPEcashCapex|49.787 CNY m|是|A35/I91|正确；不与MD&A资本开支57.2m混同|
|intangibleCashCapex|18.659 CNY m|是|A35/I91|正确；与PPE现金付款合计68.446m|
|leaseCash|17.086 CNY m|是|A35/I92|融资活动租赁负债付款正确；不是全租赁现金23.203m|
|leaseInterestCash|2.094 CNY m|否，9月也无直接值|未找到对应附注|不得列issuer verified cash；可能混用费用与现金反推|
|leasePrincipalCash|14.992 CNY m|否，9月也无直接值|未找到对应附注|不得列issuer verified cash；17.086−未经证实2.094不是证实本金|
|CBNetCash|2512.33 CNY m|是|A35/I92/122|金额和first8月正确；period改发行日现金/2026H1现金流|
|CBHistoricalPrincipalCNY|2535.837 CNY m|否|I122 Note21|first改9月9日；period发行日2026-01-28；非未来港币兑付换算|
|CBAccountLiability|2460.33 CNY m|精确值否；8月约2460.3m|I120/122；A48约数|精确first改9月9日；period2026-06-30|
|CBPrincipalHKD|2866 HKD m|更早1月已有|J2/9，C2确认；A49/I121|first条款1月8日，实际发行为1月28日；保留两日期|
|CBRedemptionRatio|1.0176 ratio，当前currency CNY|更早1月已有|J13；I121|currency改none/null；由101.76%÷100，first1月8日|
|CBPriceHKD|13.85 HKD/share|8月未重列精确换股价；1月已有|J2/11/16；I50/121|金额单位正确；first改1月8日，不是8月|
|CBConversionShares|206931407 shares|8月未列；1月已有|J2/16；I50|股份单位正确；first改1月8日；有原文approximate说明|
|JuneShares|4303469679 shares|8月公告未直接列期末法定股数；7月已有|O2；R2；I51|活动来源用R；first原值7月7日，修订确认7月13日；period2026-06-30|
|SeptExTreasuryShares|4301176179 shares|不适用，9月30日快照|S2|快照时间10月6日及单位正确；同数9月24日已知但不代替期末日期|
|SeptTreasury|299000 shares|不适用，9月30日快照|S2；9月7日翌日披露初始取得|当前units正确；9月30日快照first10月6日可保留，另存取得9月7日|
|PostOptions|10505590 shares|不适用，9月30日快照|S3|数值、单位及月报来源正确；未行使额度不是已发行新股|
|Scheme2026Options|35649130 shares|不适用|S3|正确，月末未行使余额；668,920新增已9月23日公告，最终余额与变动分开|
|PostRSU|11746712 shares|不适用|S7|正确，可能发行/转出量，不等于本月新发|
|Scheme2026RSU|9134712 shares|不适用|S7|正确，可能发行/转出量，不等于本月新发|
|PreIssuedOptions|217188943 shares|不适用|S3–4|单位数值正确，但为期权数；相关股份已发行至平台，不能再加同数量新股|

## 金融资产和现金流分类的附加边界

I114 Note14列示非流动FVTPL=891.370上市+877.692私募基金+645.181非上市+107.344可转债投资=2521.587m；流动FVTPL=1253.406货币基金+944.554结构票据+0结构存款=2197.960m。非流动和流动合计4719.547m。上市为Level1，其余主要Level3（I99）；不能把货币基金和结构票据都当作可随时按账面赎回的现金。完整中报9月公开这些分类不意味着6月末资产当时不存在，只意味着8月市场信息集不能使用未披露分类。

I117 Note17银行存款3845.317m按币种拆分为美元1168.328、港币2661.989、人民币15.000m，单位都是人民币千元转换后的人民币金额，不能认为2661.989是港币原币m。现金2622.881m构成银行现金1917.468、初始期限三个月内存款686.356、金融机构余额19.057m。币种及构成详细拆分首次9月，并未进入本次67项中单独记录。

A35现金流全表首次8月公开：OCF−399.238、ICF−2180.887、FCF融资+2676.811，净增加96.686；期初2573.066加96.686减汇率46.871=期末2622.881m。买入金融资产1372.644、卖出1320.602、定存配置3425.082、到期1421.320m不是经营费用；不能把定存新增全当烧钱。leaseCash17.086m在融资现金流，另短租6.117m已计经营开支，总租赁现金23.203m由I112直接说明；融资/经营租赁拆分的这一级能够核验，更细本金/利息两项不能核验。

CB发行日人民币净款2512.330m、发行本金原值2535.837m、交易成本23.507m、初始负债2453.183m与权益59.147m，后续非现金费用52.960m、汇兑−45.813m，6月账面负债2460.330m（I122）。这些精确拆分首9月，净融资现金2512.330m例外已在A35公开。到期实际现金责任是未转本金HKD2866m×101.76%=HKD2916.4416m；不能用6月人民币账面2460.330m代替兑付金额，也不能净款再加进6月现金。J原始条款和C实际完成日期应保留，Offering Circular正文日期1月23日并不等于其港交所首次公开日1月29日12:06。

## 建议的字段修复方式

避免统一正则推定来源。按metric设置`sourceURL`/`publicationDate`和`firstPublicSourceURL`/`firstPublicDate`；若来源是更晚的完整重述，两组日期分别保留。原金额增加`reportedValue`、`reportedUnit=RMB thousand`、`normalizationDivisor=1000`、`valueSignConvention`。比率和股数币种设null。时点和流量分别用`periodEnd`及`periodStart/End`；债券合同另存`issueDate`、`maturityDate`、`conversionWindow`。

计算字段增加`derived=true`及`formula`，不能声称合计值有原始披露行；未披露租赁现金拆分用`sourceType=research_assumption`及`verified=false`，不得继续放在financialVerified。模板应核验每项firstPublicDate对应的URL确实支持该值、精度和分类，不能仅核验当前sourceURL存在。

审阅状态：67项完成逐项来源对照；至少10个首次披露日期、1个比例币种、2个无直接来源的租赁现金事实标签需修正，另有计算值、债券期间、6月股数及来源精度需要明确。此记录不宣称后续模型修复或全报告验收已经通过。

## 写入后的并发状态观察

2026-10-10 17:19:02.463 UTC再读模型：文件SHA256 `e1abea5586c12c7f1cd45944b47c6dbc27391d84d3be76dd530b7c9620f6cc7a`，financialEvidence SHA256 `5385584c08345196bbc960f6040fd27531b9a78bb661e945c78d344739b0b1dc`，66项。负责人已删除leaseInterestCash及leasePrincipalCash，新增leaseCashReported17.086m。原67项审阅不是此新版本的覆盖验收；新增leaseCashReported值直接对应A35/I92，可核验。再读时MMF等firstPublicDate、比例币种、计算标志尚未修改，已将意见发给负责人，不自行改动其文件。本审阅记录的JSON语法、67个独立metric、现金流和可转债桥自检通过；与活动模型的行数不同是并发修改被识别，不能误报为模型计算失败。
