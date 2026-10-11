# I027 晶泰 v3 冻结研究与活动模型整合合同

截止2026-10-09，S032/02228.HK，现价6.985HKD。formal与pending字节相同，模型SHA256 `568d9b080ee8f5bba0889d8b6c2eac10134bbce668d61f4cf498a37e97468b83`；版本 `xtalpi-v3-sevenIndicationDemand-NetRightsSensitivity-UnallocatedClinical`。正文SHA256 `9d2deda32477155291bba4f61f9295b654614d2bd8d3c167bf13fb071c0c63ce`，16,053有效汉字、81段、重复及近重复0。该释放为此发行人的研究、计算及适配器一致版本，不代表全项目文件验收。

## 活动接口与结果

native `tools/xtalpi_native.mjs` SHA256 `3ac3d5797441981833e16ea85509edcf897b974ad45901f3962f761af1df3d02`；workbook `tools/xtalpi_workbook.mjs` SHA256 `540cf983e831683ac332f754d13f350559b39d476396252dca83c72eeb31cf62`。接口导出不变：initializeXtalpiBridge、calculateXtalpiAnnual、calculateXtalpiHorizon、setXtalpiAtomic、xtalpiCases，以及buildXtalpiWorkbook、xtalpiSheets。父builder须传 `recognitionColumn:'U'`，9张活动表，原子由setXtalpiAtomic应用。金额CNYbn、股数bn、EPS CNY、目标和股息HKD、FX为HKDperCNY 1.1。

四期得分46.2/53.3/59.2/65.3。年底悲/基/乐3.143250/4.740176499/6.368116196HKD；25/50/25期望4.747929799HKD，回报−32.026774535%。半年1.397000/2.828547763/5.928409806；一年0/.627324368/5.320784251；三年0/.801700855/6.501252055；五年0/1.023520566/7.937106366。2027-10-07为一年锁定目标日。市场识别价和有限现金内在值分开，不保证一年收敛。

## 核验

独立805,506 checks、13敏感性；adapter86,860 checks、2,996 atoms、每情景1,017 signatures，无Excel错误；body121。peer经济1,601、正文183、技术57，事实/BIO20 checks均PASS，绑定上述冻结版本。43行证据、7活动适应症、36观察、56需求字段及21峰销复算通过。9表+4细节PNG已生成；共享原布局及v3关键权益、估值、现金、风险和费用变化已视觉复查。

## 模型边界必须保留

7活动为XTN004 IBS/IBD、ALX001 IBD、ALX002 SLE/RA、ALX005 MG/ITP，峰销各自按患者×价格×份额计算，无旧聚合峰值摊分。中国与潜在海外可支付需求采用单一研究合计，未逐地区拆分，不能称完整地区rNPV已验收。公开自研和全资Ailux支持ownership1研究假设，但未证实无负担净商业权益；0/50/100敏感性费用不变。未知里程碑及36观察为0。BIO7.9%是总体一期到批准参考，活动项目概率为研究判断，原件成功率仍null。

原全部临床成本保留未分配，2026–2032 base .111/.154/.210/.252/.272/.257/.214 CNYbn。单药clinical0不能解释为无需成本。2027起+30%及+100%压力分别一年base .586425/.432685，最低现金1.000000/.210127；不与2026起压力混同。

CB已含June现金，正式三情景2027-01-26按101.76%兑付，转股仅敏感性配对增股。经济股数4296294179，preIPO217188943股已发行不重加。租赁现金17.086m、回购50.632139mHKD各扣一次，主席个人增持不扣公司现金。2026H2 OCF全年预算50%代理；minimum含26年末及Jan26债事件，base1.264687695/bull.853528562CNYbn，不称逐日最低。2051有限26年分配无永久平台终值。

父整合须刷新排名、三情景快照、Excel/Word/PDF核心数字及逐页QA，保留上述模型限制与研究假设标签。
