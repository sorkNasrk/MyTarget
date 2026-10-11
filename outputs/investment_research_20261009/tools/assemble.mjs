import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {applyWorkbookInputs} from './workbook_inputs.mjs';
import {financialRows} from './financial_metadata.mjs';
import {normalizePublication} from './publication_metadata.mjs';
import {initializeSOTP,calculateSOTP} from './genscript_sotp.mjs';
import {normalizeFiniteAssets} from './finite_assets.mjs';
import {initializeSegmentCashBridge} from './pharmaron_native.mjs';
import {initializeSimcereBridge} from './simcere_native.mjs';
import {initializeFosun} from './fosun_bridge.mjs';
import {initializeLuyeBridge} from './luye_native.mjs';
import {initializeTigermed} from './tigermed_bridge.mjs';
import {initializeNormalProfit} from './normal_profit_native.mjs';
import {initializeHutchmedBridge} from './hutchmed_native.mjs';
import {initializeInnocareBridge} from './innocare_native.mjs';
import {initializeHuahongBridge} from './huahong_native.mjs';
import {initializeEverestBridge} from './everest_native.mjs';
import {initializeXDBridge} from './xd_native.mjs';
import {initializeKingsoftBridge} from './kingsoft_native.mjs';
import {initializeAscentageBridge} from './ascentage_native.mjs';
import {initializeYuewenBridge} from './yuewen_native.mjs';
import {initializeHightideBridge} from './hightide_native.mjs';
import {initializeTongchengBridge} from './tongcheng_native.mjs';
import {initializeDualityBridge} from './duality_native.mjs';
import {initializeLiautoBridge} from './liauto_native.mjs';
import {initializeZaiBridge} from './zai_native.mjs';
import {initializeXpengBridge} from './xpeng_native.mjs';
import {initializeHaierSmartBridge} from './haier_smart_native.mjs';
import {initializeNioBridge} from './nio_native.mjs';
import {initializeBydeBridge} from './byde_native.mjs';
import {initializeLepuBridge} from './lepu_native.mjs';
import {initializeMinimaxBridge} from './minimax_native.mjs';
import {initializeCgnBridge} from './cgn_native.mjs';
import {initializeJunshiBridge} from './junshi_native.mjs';
import {initializeZhipuBridge} from './zhipu_native.mjs';
import {initializeEastbuyBridge} from './eastbuy_native.mjs';
import {initializeUbtechBridge} from './ubtech_native.mjs';
import {initializeSensetimeBridge} from './sensetime_native.mjs';
import {initializeCansinoBridge} from './cansino_native.mjs';
import {initializeHorizonBridge} from './horizon_native.mjs';
import {initializeGrandPharmaBridge} from './grand_pharma_native.mjs';
import {initializeZhonganBridge} from './zhongan_native.mjs';
import {initializeInsilicoBridge} from './insilico_native.mjs';
import {initializeXtalpiBridge} from './xtalpi_native.mjs';
import {resolveTargetDate,nominalTargets} from './target_dates.mjs';
import {rebaseCalendarModels,rebaseConditionalCalendar} from './calendar_rebase.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=async f=>JSON.parse(await fs.readFile(path.join(root,f),'utf8'));
const universe=await read('data/universe.json');
const market=await read('data/market_snapshot_locked.json');
// Index identifiers are provider routing labels, not exchange currency evidence.
for(const code of ['987018.SZ','931787.CSI']){
 const security=universe.securities.find(s=>s.code===code),quote=market.securities.find(s=>s.code===code);
 const sourceURL=code==='987018.SZ'?'https://www.cnindex.com.cn/docs/gz_987018.pdf':'https://www.csindex.com.cn/csindex-home/indexInfo/index-basic-info/931787';
 for(const item of [security,quote]){item.currency='HKD';item.valueUnit='index points';item.currencyEvidence={sourceURL,sourceType:'index_provider_primary',note:'港元计价指数，非人民币股票价格；原代码后缀仅保留为数据供应商路由'};}
}
// Latest human scope excludes the seven products; the raw universe remains archived.
universe.excludedSecurityIds=universe.securities.filter(s=>s.type!=='股票').map(s=>s.securityId);
universe.securities=universe.securities.filter(s=>s.type==='股票');
market.securities=market.securities.filter(s=>universe.securities.some(u=>u.securityId===s.securityId));
universe.scope={issuers:92,stockSecurities:96,excludedProducts:7,revision:'2026-10-11 human request'};
const weights={halfYear:[25,30,15,10,10,10],oneYear:[25,15,25,15,10,10],threeYear:[25,5,35,20,5,10],fiveYear:[20,0,40,20,5,15]};
const labels={yearEnd:'2026年底',halfYear:'半年',oneYear:'一年',threeYear:'三年',fiveYear:'五年'};
const years={yearEnd:0,halfYear:0.5,oneYear:1,threeYear:3,fiveYear:5};
const models=[];const conditionedModels=[];const audits=[];
let integrationGate={withheldIssuerIds:[]};try{integrationGate=await read('data/model_integration_gate.json');}catch{}
let releaseRegistry=null;try{releaseRegistry=await read('data/model_release_registry.json');}catch{}
for(const file of (await fs.readdir(path.join(root,'data'))).filter(f=>f.endsWith('_model.json'))){
  const source=await read('data/'+file);
  if(releaseRegistry&&!releaseRegistry.approvedIssuerIds.includes(source.issuerId))continue;
  if(integrationGate.withheldIssuerIds.includes(source.issuerId))continue;
  const listingSet=source.listings??(source.securities&&source.scores?.A?source.securities.map(s=>{
    const key=s.currency==='CNY'?'A':'H';
    return {...s,scenarios:Object.fromEntries(Object.entries(source.scenarios).map(([h,sc])=>[h,{target:h==='yearEnd'?'2026-12-31':({halfYear:'2027-04-09',oneYear:'2027-10-09',threeYear:'2029-10-09',fiveYear:'2031-10-09'})[h],epsCNY:sc.eps,PE:sc['PE'+key],priceHKD:sc[key],cumulativeCashDividendHKD:sc.div.map(d=>d*(key==='H'?source.fx.HKDperCNY:1))}])),scores:source.scores[key]};
  }):[source]);
  for(const m of listingSet){
    const merged=listingSet.length>1?{...source,...m}:m;
    const security=universe.securities.find(s=>s.code===merged.code);
    if(!security)throw new Error('Unknown code '+merged.code);
    if(security.issuerId!==merged.issuerId)throw new Error('Issuer mismatch '+merged.code);
    if([...models,...conditionedModels].some(x=>x.code===merged.code))throw new Error('Duplicate model '+merged.code);
    const quote=market.securities.find(s=>s.securityId===security.securityId);
    const basePrice=merged.price??merged.priceHKD??merged.priceCNY;
    if(Math.abs(basePrice-quote.price)>1e-6)throw new Error('Price mismatch '+merged.code);
    const nativeSOTP=!!merged.scenarios?.yearEnd?.inputs?.lsgRevenue;
    const reportedEarningsCurrency=merged.earningsCurrency??(merged.issuerId==='I024'?'USD':merged.scenarios?.yearEnd?.epsHKD?'HKD':merged.scenarios?.yearEnd?.epsUSD||nativeSOTP?'USD':'CNY');
    const earningsCurrency=reportedEarningsCurrency==='RMB'?'CNY':reportedEarningsCurrency;
    const fx=earningsCurrency===security.currency?1:earningsCurrency==='USD'?(security.currency==='CNY'?merged.fx?.CNYperUSD:merged.fx?.HKDperUSD):earningsCurrency==='HKD'?merged.fx?.CNYperHKD:(merged.fx?.HKDperCNY??merged.fx?.HKDperRMB??merged.assumptions?.fxHKDperCNY??merged.assumptions?.HKDperCNY??1.10);
    if(!Number.isFinite(fx))throw Error('Missing earnings currency conversion '+merged.code);
    const row={...merged,securityId:security.securityId,sector:security.sector,currency:security.currency,price:basePrice,earningsCurrency,fxValue:fx,modelFile:'data/'+file,scenarios:{},scores:{}};
    if(merged.rankEligible===false&&merged.valuationConditioned){
      if(Object.keys(merged.scenarios??{}).length)throw Error('Conditioned issuer must not publish formal scenarios '+merged.code);
      row.rankEligible=false;row.scenarios={};row.scores={};row.basePriceValid=merged.basePriceValid??quote.tradableOnAsOf!==false;
      row.referencePrice=merged.referencePrice??basePrice;row.referencePriceDate=merged.referencePriceDate??quote.priceDate;
      conditionedModels.push(row);audits.push({code:merged.code,modelFile:'data/'+file,formulaCheck:'conditional model independent QA only',priceCheck:row.basePriceValid?'valid observed quote':'historical reference only',scoreCheck:'excluded; no scores or expected price'});continue;
    }
    if(row.operatingBridge?.yearEnd?.coreRevenue){row.operatingBridge=structuredClone(row.operatingBridge);for(const h of Object.keys(labels))row.operatingBridge[h].ownerProfitShare??=[1,1,1];}
    if(row.operatingBridge?.yearEnd?.smartphoneAIoTEBIT){
      row.operatingBridge=structuredClone(row.operatingBridge);
      for(const h of Object.keys(labels)){
        const op=row.operatingBridge[h];op.commerceEBITA=op.smartphoneAIoTEBIT;op.cloudComputeEBITA=op.newBusinessEBIT;op.labsEBITA=[0,0,0];op.otherCorporateEliminationEBITA=[0,0,0];op.afterTaxInterestAssociatesNet=op.afterTaxOther;
      }
      row.operatingBridge.columnLabels=['手机AIoT正常EBIT','汽车AI正常EBIT','无第三分部','无第四分部'];
    }
    if(source.scenarios?.yearEnd?.productRevenueUSDbn){
      row.productOperatingBridge=Object.fromEntries(Object.entries(source.scenarios).map(([h,s])=>[h,{productRevenueUSDbn:structuredClone(s.productRevenueUSDbn),grossMargin:s.gm,researchCostUSDbn:s.rd,sellingAdminUSDbn:s.sga,taxRate:s.tax,dilutedSharesBn:s.shares}]));
    }
    for(const [key,s] of Object.entries(merged.scenarios??{})){
      const prices=s.priceHKD??s.priceCNY??s.prices??s.price??s.targetPrices??s.cases?.map(c=>c.price);
      if(!prices?.every(Number.isFinite))throw new Error('Invalid scenario '+merged.code+' '+key);
      const div=s.cumulativeCashDividendHKD??s.cumulativeCashDividendCNY??s.dividend??s.cases?.map(c=>c.dividend)??[0,0,0];
      const eps=s['eps'+earningsCurrency]??s.epsRMB??s.epsCNY??s.epsUSD??s.cases?.map(c=>c.eps);
      const computed=prices.map((p,i)=>({price:p,dividend:div[i],priceReturn:p/basePrice-1,totalReturn:(p+div[i])/basePrice-1,annualized:years[key]>=3?((p+div[i])/basePrice)**(1/years[key])-1:null,eps:eps?.[i]??null,PE:s.PE?.[i]??s.cases?.[i]?.PE??null,PS:s.cases?.[i]?.PS??null,condition:s.conditions?.[i]??s.cases?.[i]?.condition??s.cases?.[i]?.conditions??''}));
      if(eps&&s.PE){for(let i=0;i<3;i++){
        let expected=eps[i]*s.PE[i]*row.fxValue;
        if(s.excessNetCashCNYbn)expected+=s.excessNetCashCNYbn[i]/s.dilutedSharesBn[i]*row.fxValue;
        if(s.excessNetCashUSDbn)expected+=s.excessNetCashUSDbn[i]/s.dilutedSharesBn[i]*row.fxValue*(s.cashPremiumApplies?s.AsharePremiumAssumption[i]:1);
        if(s.strategyInvestmentValueCNYbn)expected+=s.strategyInvestmentValueCNYbn[i]/s.dilutedSharesBn[i]*row.fxValue;
        if(s.royaltyRNpv)expected+=s.royaltyRNpv[i].totalPV_CNYbn/s.dilutedSharesBn[i]*row.fxValue;
        if(s.pipelineRNpv)expected+=s.pipelineRNpv[i].totalPV_CNYbn/s.dilutedSharesBn[i]*row.fxValue;
        if(merged.operatingBridge?.[key]?.coreRevenue){const op=merged.operatingBridge[key];expected=(Math.max(0,eps[i])*s.PE[i]+(op.newRevenue[i]*op.newEVSales[i]+op.netDistributableTreasury[i]-op.transitionFundingPV[i])/op.dilutedShares[i])*row.fxValue;}
        if(merged.operatingBridge?.oneTimePenaltyReserveCNYbillion)expected-=merged.operatingBridge.oneTimePenaltyReserveCNYbillion/merged.operatingBridge[key].dilutedShares[i]*row.fxValue;
        const recognition=s.marketRecognitionFactor??s.recognitionFactor;
        if(recognition)expected=basePrice+(expected-basePrice)*recognition[i];
        if(Math.abs(expected-prices[i])>0.011)throw new Error('Formula mismatch '+merged.code+' '+key);
      }}
      const candidateTarget=s.target??s.targetDate;
      const modelTarget=/^20\d{2}-\d{2}-\d{2}$/.test(candidateTarget??'')?candidateTarget:nominalTargets[key];
      row.scenarios[key]={...s,target:modelTarget,targetDateResolution:resolveTargetDate(nominalTargets[key],security.code.endsWith('.HK')?'HKEX':security.code.endsWith('.SH')?'SSE':'SZSE'),label:labels[key],years:years[key],cases:computed,expectedPrice:prices[0]*.25+prices[1]*.5+prices[2]*.25,defensivePrice:prices[0]*.4+prices[1]*.5+prices[2]*.1,positivePrice:prices[0]*.1+prices[1]*.5+prices[2]*.4};
      if(s.coreRevenueUSDbn&&source.scenarios?.[key]?.normalOperatingNetMargin)row.scenarios[key].coreNetMargin=source.scenarios[key].normalOperatingNetMargin;
    }
    for(const [key,sc] of Object.entries(merged.scores??{})){
      const total=sc.dimensions.reduce((a,v,i)=>a+v*weights[key][i]/5,0);
      if(Math.abs(total-sc.total)>1e-6)throw new Error('Score mismatch '+merged.code+' '+key);
      row.scores[key]={...sc,weights:weights[key],total};
    }
    if(initializeSOTP(row))for(const [h,s]of Object.entries(row.scenarios))for(let c=0;c<3;c++){const computed=calculateSOTP(row,h,c);if(Math.abs(computed.price-s.cases[c].price)>1e-8)throw Error('Native SOTP mismatch '+row.code+' '+h+' '+c);}
    initializeSegmentCashBridge(row);
    initializeSimcereBridge(row);
    initializeFosun(row);
    initializeLuyeBridge(row);
    initializeTigermed(row);
    initializeNormalProfit(row);
    initializeHutchmedBridge(row);
    if(row.issuerId==='I041')initializeInnocareBridge(row);
    initializeHuahongBridge(row);
    if(row.issuerId==='I040')initializeEverestBridge(row);
    initializeXDBridge(row);
    if(row.issuerId==='I091')initializeKingsoftBridge(row);
    if(row.issuerId==='I021')initializeAscentageBridge(row);
    if(row.issuerId==='I079')initializeYuewenBridge(row);
    if(row.issuerId==='I037')initializeHightideBridge(row);
    if(row.issuerId==='I086')initializeTongchengBridge(row);
    if(row.issuerId==='I020')initializeDualityBridge(row);
    if(row.issuerId==='I084')initializeLiautoBridge(row);
    if(row.issuerId==='I039')initializeZaiBridge(row);
    if(row.issuerId==='I085')initializeXpengBridge(row);
    if(row.issuerId==='I068')initializeHaierSmartBridge(row);
    if(row.issuerId==='I088')initializeNioBridge(row);
    if(row.issuerId==='I081')initializeBydeBridge(row);
    if(row.issuerId==='I026')initializeLepuBridge(row);
    if(row.issuerId==='I054')initializeMinimaxBridge(row);
    if(row.issuerId==='I057')initializeCgnBridge(row);
    if(row.issuerId==='I046')initializeJunshiBridge(row);
    if(row.issuerId==='I055')initializeZhipuBridge(row);
    if(row.issuerId==='I058')initializeEastbuyBridge(row);
    if(row.issuerId==='I059')initializeUbtechBridge(row);
    if(row.issuerId==='I089')initializeSensetimeBridge(row);
    if(row.issuerId==='I042')initializeCansinoBridge(row);
    if(row.issuerId==='I062')initializeHorizonBridge(row);
    if(row.issuerId==='I032')initializeGrandPharmaBridge(row);
    if(row.issuerId==='I083')initializeZhonganBridge(row);
    if(row.issuerId==='I008')initializeInsilicoBridge(row);
    if(row.issuerId==='I027')initializeXtalpiBridge(row);
    models.push(row);audits.push({code:merged.code,modelFile:'data/'+file,formulaCheck:'pass',priceCheck:'pass',scoreCheck:'pass'});
  }
}
for(const m of models.filter(m=>m.rNPVAssumptions))for(const s of Object.values(m.scenarios)){
 const assumption=m.rNPVAssumptions;
 if(s.components[0].assets){
  normalizeFiniteAssets(m,s);
  continue;
 }
 s.purePipeline=true;s.equityFloorZero=s.components.some(p=>p.preFloorEquityCNYbn!=null);s.coreRevenueCNYbn=[0,0,0];s.coreNetMargin=[0,0,0];s.dilutedSharesBn=s.components.map(v=>v.dilutedSharesBn);s.excessNetCashCNYbn=s.components.map(v=>v.netCashCNYbn);s.futureResearchReserveCNYbn=s.components.map(v=>v.futureDevelopmentAndCorporateReserveCNYbn);s.cashBridgeAnchor={USDCNYAssumption:assumption.CNYperUSD};if(s.components.every(p=>Number.isFinite(p.marketRecognitionFactor)))s.marketRecognitionFactor=s.components.map(p=>p.marketRecognitionFactor);
 s.pipelineRNpv=s.components.map((p,c)=>({
  groups:p.components.map(g=>({id:g.assetId,name:g.drug+' '+g.indication,currency:g.salesCurrency,successAssumption:g.successJudgment,netEconomicCashMarginAssumption:g.royaltyOrFCFMargin*(['royalty','prospectiveRoyalty'].includes(g.kind)?1-g.royaltyTaxRate:1),parentEconomicShareAssumption:1,stage:g.stage,PV_CNYbn:g.rNPVCNYbn,annualCashflows:g.cashFlows.map(f=>({cashDate:f.cashDate,yearsACT36525:f.discountExponent,salesBn:f.salesBn,currency:f.currency,riskAdjustedParentNetCashCNYbn:f.afterTaxCashCNYbn,PV_CNYbn:f.pvCNYbn,pastAtTarget:!f.included}))})),
  milestones:p.milestoneComponents?p.milestoneComponents.map(f=>({id:f.id,cashDate:f.cashDate,yearsACT36525:f.discountExponent,grossAmount:f.expectedGrossBn,currency:f.currency,success:1,taxFactor:1-f.taxRate,parentFactor:1,PV_CNYbn:f.pvCNYbn,alreadyPastAtTarget:!f.included})):[{cashDate:'2030-12-31',yearsACT36525:(Date.parse('2030-12-31')-Date.parse(s.target))/86400000/365.25,grossUSD:p.milestoneExpectedUSDbn,success:1,PV_CNYbn:p.milestonePVCNYbn,alreadyPastAtTarget:s.target>='2030-12-31'}],
  milestoneTaxFactor:1,milestoneParentFactor:1,totalPV_CNYbn:p.assetPVCNYbn+p.milestonePVCNYbn,discountRate:assumption.discountRate[c],limitation:assumption.milestone}));
 for(let c=0;c<3;c++){s.cases[c].eps=0;s.cases[c].PE=0;let expected=(s.pipelineRNpv[c].totalPV_CNYbn+s.excessNetCashCNYbn[c]-s.futureResearchReserveCNYbn[c])/s.dilutedSharesBn[c]*m.fxValue;if(s.equityFloorZero)expected=Math.max(0,expected);const factor=s.marketRecognitionFactor?.[c]??s.recognitionFactor?.[c]??1;expected=m.price+(expected-m.price)*factor;if(Math.abs(expected-s.cases[c].price)>1e-7)throw Error('Pure asset rNPV normalization mismatch '+m.code);}
}
for(const m of models)for(const s of Object.values(m.scenarios))if(s.pipelineRNpv){
 for(let g=0;g<s.pipelineRNpv[0].groups.length;g++){
  const dates=[...new Set(s.pipelineRNpv.flatMap(p=>p.groups[g].annualCashflows.map(f=>f.cashDate)))].sort();
  for(const p of s.pipelineRNpv){const group=p.groups[g];group.annualCashflows=dates.map(date=>group.annualCashflows.find(f=>f.cashDate===date)??{cashDate:date,yearsACT36525:(Date.parse(date)-Date.parse(s.target))/86400000/365.25,salesBn:0,currency:group.currency,riskAdjustedParentNetCashCNYbn:0,PV_CNYbn:0,pastAtTarget:date<=s.target,forecastZeroBeforeScenarioLaunch:true});}
 }
 const milestoneKeys=[...new Map(s.pipelineRNpv.flatMap(p=>p.milestones.map(f=>[(f.id??'')+'|'+f.cashDate,{id:f.id,cashDate:f.cashDate,currency:f.currency??'USD'}]))).values()].sort((a,b)=>a.cashDate.localeCompare(b.cashDate)||(a.id??'').localeCompare(b.id??''));
 for(const p of s.pipelineRNpv)p.milestones=milestoneKeys.map(k=>{const f=p.milestones.find(f=>f.cashDate===k.cashDate&&f.id===k.id)??{...k,yearsACT36525:(Date.parse(k.cashDate)-Date.parse(s.target))/86400000/365.25,grossAmount:0,success:0,PV_CNYbn:0,alreadyPastAtTarget:k.cashDate<=s.target,zeroMilestoneScenario:true};return {...f,currency:f.currency??'USD',grossAmount:f.grossAmount??f.grossUSD??0,taxFactor:f.taxFactor??p.milestoneTaxFactor??.8,parentFactor:f.parentFactor??p.milestoneParentFactor??.9};});
}
for(const m of models.filter(m=>m.scenarios.yearEnd?.royaltyRNpv)){
 const s0=m.scenarios.yearEnd,royalties=s0.royaltyRNpv.map(r=>r.royaltyAssumptions);
 const g={salesYears:Array.from({length:16},(_,i)=>2028+i),royaltyRate:royalties.map(r=>r.royaltyRate),royaltyTax:royalties.map(r=>1-r.postTaxAndServicingFactor),WACC:royalties.map(r=>r.discountRate),parentEconomicShare:royalties.map(r=>r.parentEconomicShareAssumption)};
 g.salesUSDbn=Object.fromEntries(['lung','nonLung'].map(type=>[type,s0.royaltyRNpv.map(r=>g.salesYears.map(y=>r.annualCashflows.find(f=>f.cashDate.startsWith(String(y)))?.[type==='lung'?'lungSalesUSDbn':'otherSalesUSDbn']??0))]));
 m.globalRoyaltyModel=g;
 for(const s of Object.values(m.scenarios)){
  s.targetValuationDate=s.target;s.targetValuationYear=Number(s.target.slice(0,4));s.CNYperUSD=7;
  s.discountExponentsACT36525=g.salesYears.map(y=>(Date.parse(y+'-12-31')-Date.parse(s.target))/86400000/365.25);
  s.cashFlowsIncluded=s.discountExponentsACT36525.map(v=>v>0);
  s.coreRevenueCNYbn=s.coreProductRevenueCNYbn;
  s.components=s.royaltyRNpv.map((r,c)=>({domesticCoreProfitCNYbn:s.coreNetProfitCNYbn[c],domesticPE:s.PE[c],netCashCNYbn:s.excessNetCashCNYbn[c],futureCentralResearchCostReserveCNYbn:0,dilutedSharesBn:s.dilutedSharesBn[c],lungApprovalAndCommercialSuccess:r.royaltyAssumptions.lungSuccess,nonLungApprovalAndCommercialSuccess:r.royaltyAssumptions.otherSuccess}));
  s.milestones=s.royaltyRNpv.map(r=>r.milestoneAssumptions.map(f=>({...f,included:!f.alreadyReceivedOrPast})));
 }
}
const calendarAudit=rebaseCalendarModels(models);
calendarAudit.conditionalRecords=rebaseConditionalCalendar(conditionedModels);
const workbookInputs=await applyWorkbookInputs(root,models,years,{forceCodes:calendarAudit.recalculateCodes});
for(const entry of calendarAudit.records){const m=models.find(m=>m.code===entry.code);entry.rebasedPrices=m.scenarios[entry.horizon].cases.map(c=>c.price);}
await fs.writeFile(path.join(root,'qa/calendar_rebase_audit.json'),JSON.stringify(calendarAudit,null,2));
const rankings={};
for(const key of Object.keys(weights)){
  const sorted=models.filter(m=>m.rankEligible!==false&&m.scenarios[key]&&m.scores[key]).sort((a,b)=>{
   const difference=b.scores[key].total-a.scores[key].total;
   const scoreOrder=Math.abs(difference)<1e-9?0:difference;
   return scoreOrder||b.scenarios[key].cases[1].totalReturn-a.scenarios[key].cases[1].totalReturn||b.scenarios[key].cases[0].priceReturn-a.scenarios[key].cases[0].priceReturn||a.code.localeCompare(b.code);
  });
  let tier=0,tierTop=null;const companies=new Set();
  rankings[key]=sorted.map((m,i)=>{const score=m.scores[key].total;if(tierTop===null||tierTop-score>=3){tier++;tierTop=score;}const distinct=!companies.has(m.issuerId);if(distinct)companies.add(m.issuerId);return{rank:i+1,issuerId:m.issuerId,securityId:m.securityId,code:m.code,name:m.name,score,tier:'第'+tier+'梯队',distinctCompany:distinct,topTenDistinct:distinct&&companies.size<=10,basePrice:m.price,baseTarget:m.scenarios[key].cases[1].price,baseReturn:m.scenarios[key].cases[1].priceReturn,baseTotalReturn:m.scenarios[key].cases[1].totalReturn,bearReturn:m.scenarios[key].cases[0].priceReturn};});
}
const status=await read('data/research_status.json');
const allResearchModels=[...models,...conditionedModels];
for(const c of status.companies){const model=allResearchModels.find(x=>x.issuerId===c.issuerId);if(!model)continue;const file=path.join(root,model.deepResearchFile??'');let hanzi=0;try{const txt=await fs.readFile(file,'utf8');let source=false;const body=txt.split(/\r?\n/).filter((line)=>{if(/^#{1,6}\s*(来源|资料来源|主要来源)/.test(line))source=true;return !source&&!/^(#|\||>|- |---)/.test(line)&&!/^(价格基准|证券与价格基准|研究版本|编制日期|数据截止)/.test(line)&&!/https?:\/\//.test(line);}).join('\n');hanzi=(body.match(/[\u3400-\u9fff]/g)??[]).length;}catch{}
  c.status=hanzi>=10000?'正文完成，待文档验收':'正文待补齐';c.effectiveHanCharacters=hanzi;c.valuationStatus=model.rankEligible===false?'暂不排名；融资或复牌条件参考估值':'情景模型初版已复算';c.sourceStatus='已核验输入见来源表；缺失与转述逐项标记';c.modelVersion=model.modelVersion;c.modelFile=model.modelFile;c.deepResearchFile=model.deepResearchFile;c.updatedAt=new Date().toISOString();
}
const integratedIds=new Set(allResearchModels.map(x=>x.issuerId));
status.scope={securities:96,issuers:92,excludedProducts:7};
const integratedBodyCount=status.companies.filter(c=>integratedIds.has(c.issuerId)&&c.effectiveHanCharacters>=10000).length;
status.version='research-v0.1';status.summary={issuerModels:integratedIds.size,securityModels:allResearchModels.length,rankedSecurityModels:models.length,conditionedSecurityModels:conditionedModels.length,deepResearchPassed:integratedBodyCount,remainingDeepResearch:92-integratedBodyCount,withheldManuscripts:status.companies.filter(c=>!integratedIds.has(c.issuerId)&&c.effectiveHanCharacters>=10000).map(c=>({issuerId:c.issuerId,effectiveHanCharacters:c.effectiveHanCharacters,reason:'模型暂缓接入，正文保留待模型修订同步'}))};
await fs.writeFile(path.join(root,'data/research_status.json'),JSON.stringify(status,null,2));
const sources=[];const p=await read('data/pharma_structured.json');const t=await read('data/tech_primary_verified.json');
for(const c of p.companies)for(const f of c.financials)sources.push({...f,issuerId:c.issuerId,code:c.code,name:c.name});
for(const f of t.records)sources.push(...financialRows(f,f,{currency:'CNY',unit:'million'}));
const brokers=[];for(const c of p.companies)for(const b of c.brokerTargets??[])if(b.verified)brokers.push({...b,issuerId:c.issuerId,code:c.code,name:c.name});
for(const m of allResearchModels){
 const financial=m.financialVerified??m.anchor;
 const explicitMetrics=new Set((m.financialEvidence??[]).map(f=>f.metric));
 if(financial)sources.push(...financialRows(financial,m).filter(f=>!explicitMetrics.has(f.metric)));
 if(m.latestPeriod)sources.push(...financialRows(m.latestPeriod,m).filter(f=>!explicitMetrics.has(f.metric)));
 for(const f of m.financialEvidence??[])if(typeof f.value==='number'&&f.sourceURL)sources.push({...f,issuerId:m.issuerId,code:m.code,name:m.name,sourceType:f.sourceType??'issuer_disclosure_primary_content',note:[f.note,f.firstPublicDate?'首度公开日期 '+f.firstPublicDate:null,f.publicationTimeStatus].filter(Boolean).join('；')});
}
const uniqueSources=new Map();for(const s of sources){const key=[s.issuerId,s.metric,s.period,s.currency,s.unit,s.sourceURL].join('|');if(!uniqueSources.has(key))uniqueSources.set(key,s);}sources.splice(0,sources.length,...uniqueSources.values());
const extra=await fs.readdir(path.join(root,'data'));
if(extra.includes('tech_broker_verified.json')){const ts=await read('data/tech_broker_verified.json');brokers.push(...(ts.records??ts.targets??[]));}
for(const m of allResearchModels)for(const b of m.brokerTargets??[])if(b.verified){const targetSecurity=universe.securities.find(s=>s.securityId===b.securityId),code=targetSecurity?.code??(b.securityId==='ONC_ADS'?'ONC.US (ADR)':b.code??m.code);if(!brokers.some(x=>x.code===code&&x.institution===b.institution&&x.publicationDate===b.publicationDate&&x.currency===b.currency))brokers.push({...b,issuerId:m.issuerId,code,name:m.name});}
const newest=new Map();for(const b of brokers){const key=b.code+'|'+b.institution+'|'+b.currency;const old=newest.get(key);if(!old||b.publicationDate>old.publicationDate)newest.set(key,b);}
const institutions={'花旗':'Citi','高盛':'Goldman Sachs','摩根大通':'JPMorgan','大和':'Daiwa','富瑞':'Jefferies','汇丰研究':'HSBC','美银证券':'Bank of America','BofA Securities':'Bank of America','摩根士丹利':'Morgan Stanley','野村':'Nomura','大华继显':'UOB Kay Hian','里昂':'CLSA','麦格理':'Macquarie','星展':'DBS'};
const finalBrokers=new Map();
for(const original of newest.values()){
  const item={...original,institution:institutions[original.institution]??original.institution};
  const actual=universe.securities.find(s=>s.code===item.code);
  if((actual?.name==='百济神州'||item.name==='百济神州')&&item.currency==='USD'){item.referenceCode=item.code;item.code='ONC.US (ADR)';const related=models.find(m=>m.issuerId===item.issuerId&&m.ADSratioEvidence);if(related){item.ordinaryRatio=related.ADSratioEvidence.ratio;item.ADSratioSource=related.ADSratioEvidence.sourceURL;item.derivedHKDPriceAssumption=item.targetPrice/item.ordinaryRatio*related.fx.HKDperUSD;item.securityMatch='ADR原目标；1ADS=13普通股，换算值为研究假设，非机构港股目标';}else item.securityMatch='发行人关联ADR；未取得ADS比率，禁止直接用于A/H目标';}
  if(actual?.name==='药明康德'&&item.currency==='CNY'&&item.code.endsWith('.HK')){item.referenceCode=item.code;item.code='603259.SH';item.securityMatch='正文明确A股目标，映射上海证券';}
  item.ageDays=Math.round((Date.parse(universe.asOf)-Date.parse(item.publicationDate.slice(0,10)))/86400000);
  item.recency=item.ageDays<=90?'近90日':'超过90日，旧目标';
  const key=item.code+'|'+item.institution+'|'+item.currency;const old=finalBrokers.get(key);if(!old||item.publicationDate>old.publicationDate)finalBrokers.set(key,item);
}
for(const s of sources){
 const owner=allResearchModels.find(m=>m.issuerId===s.issuerId);
 const matching=(owner?.sources??[]).find(p=>(p.sourceURL??p.url)===s.sourceURL);
 if(matching){
  const existing=s.firstPublicDate??s.publicationDate;
  if(!/^20\d{2}-\d{2}-\d{2}/.test(existing??'')){
   s.publicationDateOriginal??=s.publicationDate;
   s.publicationDate=matching.publicationDateTimeHK??matching.publicationDate??matching.published??matching.publicationTime??s.publicationDate;
   if(matching.publicationTime)s.sourcePublicationTime=matching.publicationTime;
   if(matching.firstPublicDate)s.firstPublicDate=matching.firstPublicDate;
   if(matching.publicationTimeStatus)s.publicationTimeStatus=matching.publicationTimeStatus;
   s.publicationEvidenceNote='精确同URL来源记录日期；保留原文件及财报期间';
  }
 }
 normalizePublication(s,universe.asOf);
 s.firstPublicDate??=null;s.publicationTimeStatus??='精确发布时间未核验';
 const date=s.firstPublicDate??s.publicationDate;
 s.cutoffStatus??=/^20\d{2}-\d{2}-\d{2}/.test(date??'')?(date.slice(0,10)>universe.asOf?'晚于截止日，不作为截止日输入':date.slice(0,10)===universe.asOf?'截止日公开，需结合发布时间判断收盘前后':'截止日前日期，盘中时分未核'):'公开日期缺失待核';
}
for(const m of allResearchModels.filter(m=>m.volumeMetricsUsable===false)){
 const q=market.securities.find(q=>q.code===m.code);
 q.rawLockedTechnicalForAudit??=structuredClone(q.technical);
 q.rawLockedRelativeStrengthForAudit??=structuredClone(q.relativeStrength);
 if(m.technical)q.technical=structuredClone(m.technical);
 if(m.weeklyTechnical)q.weeklyTechnical=structuredClone(m.weeklyTechnical);
 if(m.relativeStrength)q.relativeStrength=structuredClone(m.relativeStrength);
 q.lastVolumeShares=null;q.volumeMetricsUsable=false;q.volumeChartsPermitted=false;
 q.warnings=[...new Set([...(q.warnings??[]),'成交量单位未完成交叉核验，量图及量能指标不作为分析输入；原锁版字段仅留审计'])];
}
const bundle={asOf:universe.asOf,version:'research-v0.1',createdAt:new Date().toISOString(),universe,market,models,conditionedModels,rankings,status,sources,brokers:[...finalBrokers.values()],weights,labels,years,audits,limitations:[status.summary.remainingDeepResearch?'阶段研究尚有公司未接入':'92家公司96股票已覆盖；内容和文件须分别验收','尚未完成基本面和估值模型的股票暂不形成推荐分数或目标价','FX逐模型区分CNY/USD/HKD；换算率为研究假设，未冒充核验即期汇率','未来交易所日历未完全发布：名义目标日和实际交易日需最终核验']};
bundle.workbookInputs=workbookInputs;
const manuscriptHashes=[];for(const c of status.companies)if(c.deepResearchFile){let body;try{body=await fs.readFile(path.join(root,c.deepResearchFile),'utf8');}catch{continue;}manuscriptHashes.push([c.issuerId,createHash('sha256').update(body).digest('hex')]);}
bundle.fingerprint=createHash('sha256').update(JSON.stringify({marketVersion:market.lockedMethodVersion,prices:market.securities.map(s=>[s.code,s.price,s.priceDate]),technicalCorrections:market.securities.filter(s=>s.volumeMetricsUsable===false).map(s=>[s.code,s.technical,s.relativeStrength,s.volumeChartsPermitted]),models:allResearchModels.map(m=>({code:m.code,version:m.modelVersion,earningsCurrency:m.earningsCurrency,fxValue:m.fxValue,scenarios:m.scenarios,conditionalScenarios:m.conditionalScenarios,scores:m.scores})),sources,brokers:bundle.brokers,body:status.companies.map(c=>[c.issuerId,c.effectiveHanCharacters]),manuscriptHashes})).digest('hex').slice(0,16);
await fs.writeFile(path.join(root,'data/research_bundle.json'),JSON.stringify(bundle,null,2));
await fs.writeFile(path.join(root,'qa/model_audit.json'),JSON.stringify({version:bundle.version,createdAt:bundle.createdAt,audits,status:status.summary},null,2));
console.log(JSON.stringify({models:models.length,status:status.summary,sources:sources.length,brokers:newest.size}));
