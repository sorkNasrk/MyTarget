import fs from 'node:fs/promises';
import path from 'node:path';
import {calculateSOTP} from './genscript_sotp.mjs';
import {calculateRecipientResidual} from './finite_assets.mjs';
import {calculateSegmentHorizon} from './pharmaron_native.mjs';
import {calculateSimcereHorizon,simcereCases} from './simcere_native.mjs';
import {calculateFosun} from './fosun_bridge.mjs';
import {calculateLuyeHorizon,luyeCases,setLuyeAnnualValue} from './luye_native.mjs';
import {calculateTigermed} from './tigermed_bridge.mjs';
import {calculateNormalProfit,setNormalInput} from './normal_profit_native.mjs';
import {calculateHutchmedHorizon,setHutchmedAtomic} from './hutchmed_native.mjs';
import {calculateInnocareHorizon,calculateInnocareAnnual,setInnocareAtomic} from './innocare_native.mjs';
import {calculateHuahongHorizon,setHuahongAtomic} from './huahong_native.mjs';
import {calculateEverestHorizon,calculateEverestAnnual,setEverestAtomic} from './everest_native.mjs';
import {calculateXDHorizon,setXDAtomic} from './xd_native.mjs';
import {calculateKingsoftHorizon,setKingsoftAtomic} from './kingsoft_native.mjs';
import {calculateAscentageHorizon,calculateAscentageAnnual,setAscentageAtomic} from './ascentage_native.mjs';
import {calculateYuewenHorizon,setYuewenAtomic} from './yuewen_native.mjs';
import {calculateHightideHorizon,calculateHightideAnnual,setHightideAtomic} from './hightide_native.mjs';
import {calculateTongchengHorizon,setTongchengAtomic} from './tongcheng_native.mjs';
import {calculateDualityHorizon,calculateDualityAnnual,setDualityAtomic} from './duality_native.mjs';
import {calculateLiautoHorizon,setLiautoAtomic} from './liauto_native.mjs';
import {calculateZaiHorizon,calculateZaiAnnual,setZaiAtomic} from './zai_native.mjs';
import {calculateXpengHorizon,setXpengAtomic} from './xpeng_native.mjs';
import {calculateHaierSmartHorizon,calculateHaierSmartAnnual,setHaierSmartAtomic} from './haier_smart_native.mjs';
import {calculateNioHorizon,setNioAtomic} from './nio_native.mjs';
import {calculateBydeAnnual,calculateBydeHorizon,setBydeAtomic} from './byde_native.mjs';
import {calculateLepuAnnual,calculateLepuHorizon,setLepuAtomic} from './lepu_native.mjs';
import {calculateMinimaxHorizon,setMinimaxAtomic} from './minimax_native.mjs';
import {calculateCgnAnnual,calculateCgnHorizon,setCgnAtomic} from './cgn_native.mjs';
import {calculateJunshiAnnual,calculateJunshiHorizon,setJunshiAtomic} from './junshi_native.mjs';
import {calculateZhipuHorizon,setZhipuAtomic} from './zhipu_native.mjs';
import {calculateEastbuyAnnual,calculateEastbuyHorizon,setEastbuyAtomic} from './eastbuy_native.mjs';
import {calculateUbtechHorizon,setUbtechAtomic} from './ubtech_native.mjs';
import {calculateSensetimeAnnual,calculateSensetimeHorizon,setSensetimeAtomic} from './sensetime_native.mjs';
import {calculateCansinoAnnual,calculateCansinoHorizon,setCansinoAtomic} from './cansino_native.mjs';
import {calculateHorizonHorizon,setHorizonAtomic} from './horizon_native.mjs';
import {calculateGrandPharmaAnnual,calculateGrandPharmaHorizon,setGrandPharmaAtomic} from './grand_pharma_native.mjs';
import {calculateZhonganHorizon,setZhonganAtomic} from './zhongan_native.mjs';
import {calculateInsilicoAnnual,calculateInsilicoHorizon,setInsilicoAtomic} from './insilico_native.mjs';
import {calculateXtalpiAnnual,calculateXtalpiHorizon,setXtalpiAtomic} from './xtalpi_native.mjs';
export async function applyWorkbookInputs(root,models,years,{forceCodes=[]}={}){
 let saved;try{saved=JSON.parse(await fs.readFile(path.join(root,'data/workbook_overrides.json'),'utf8'));}catch{saved={records:[]};}
 let applied=0;
 for(const record of saved.records){
  const m=models.find(x=>x.code===record.code);if(!m)continue;
  if(record.sourceModelVersion!==m.modelVersion)throw new Error('Workbook override requires review after model version change: '+record.code);
  const s=m.scenarios[record.horizon],c=record.caseIndex;
  if(record.kind==='score'){m.scores[record.horizon].dimensions[record.index]=record.value;applied++;continue;}
  if(!s)throw new Error('Unknown override horizon '+record.horizon);
  if(record.kind==='assumption'){
   if(['eps','PE','PS','dividend'].includes(record.field)){s.cases[c][record.field]=record.value;if(record.field==='eps')for(const other of models.filter(o=>o.issuerId===m.issuerId&&o.earningsCurrency===m.earningsCurrency))other.scenarios[record.horizon].cases[c].eps=record.value;}
   else if(record.field==='fx'){s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=record.value;}
   else {s[record.field]??=[null,null,null];s[record.field][c]=record.value;if(['coreRevenueCNYbn','coreNetMargin','dilutedSharesBn','excessNetCashCNYbn','excessNetCashUSDbn'].includes(record.field))for(const other of models.filter(o=>o.issuerId===m.issuerId&&o.earningsCurrency===m.earningsCurrency&&o.scenarios[record.horizon]?.[record.field]))other.scenarios[record.horizon][record.field][c]=record.value;}
  }else if(record.kind==='segmentAnnual'){
   m.segmentCashBridge.inputs[['bear','base','bull'][c]][record.field][record.index]=record.value;
  }else if(record.kind==='segmentGlobal'){
   m.segmentCashBridge.globals[c][record.field]=record.value;
  }else if(record.kind==='simcereAnnual'){
   m.simcereBridge.inputs[simcereCases[c]][record.field][record.index]=record.value;
  }else if(record.kind==='simcereGlobal'){
   m.simcereBridge.globals[c][record.field]=record.value;
  }else if(['simcereDomestic','simcereRoyalty'].includes(record.kind)){
   const asset=m.simcereBridge[record.kind==='simcereDomestic'?'domestic':'royalty'][record.groupIndex];
   if(!Array.isArray(asset[record.field]))asset[record.field]=[asset[record.field],asset[record.field],asset[record.field]];
   asset[record.field][c]=record.value;
  }else if(record.kind==='luyeAnnual'){
   setLuyeAnnualValue(m.luyeBridge.inputs[luyeCases[c]],record.field,record.index,record.value);
  }else if(record.kind==='luyeGlobal'){
   m.luyeBridge.globals[c][record.field]=record.value;
  }else if(record.kind==='luyeAsset'){
   m.luyeBridge.assets[record.groupIndex][record.field][c]=record.value;
  }else if(record.kind.startsWith('hutchmed')){
   setHutchmedAtomic(m,record);
  }else if(record.kind.startsWith('innocare')){
   setInnocareAtomic(m,record);
  }else if(record.kind.startsWith('huahong')){
   setHuahongAtomic(m,record);
  }else if(record.kind.startsWith('everest')){
   setEverestAtomic(m,record);
  }else if(record.kind==='xdHorizon'){
   setXDAtomic(m,record);
  }else if(record.kind==='kingsoftHorizon'){
   setKingsoftAtomic(m,record);
  }else if(record.kind==='yuewenHorizon'){
   setYuewenAtomic(m,record);
  }else if(record.kind==='tongchengHorizon'){
   setTongchengAtomic(m,record);
  }else if(record.kind==='liautoHorizon'){
   setLiautoAtomic(m,record);
  }else if(record.kind==='xpengHorizon'){
   setXpengAtomic(m,record);
  }else if(record.kind==='nioHorizon'){
   setNioAtomic(m,record);
  }else if(record.kind.startsWith('eastbuy')){
   setEastbuyAtomic(m,record);
  }else if(record.kind==='zhipuHorizon'){
   setZhipuAtomic(m,record);
  }else if(record.kind==='ubtechHorizon'){
   setUbtechAtomic(m,record);
  }else if(record.kind.startsWith('sensetime')){
   setSensetimeAtomic(m,record);
  }else if(record.kind.startsWith('cansino')){
   setCansinoAtomic(m,record);
  }else if(record.kind.startsWith('grandPharma')){
   setGrandPharmaAtomic(m,record);
  }else if(record.kind==='zhonganHorizon'){
   setZhonganAtomic(m,record);
  }else if(record.kind.startsWith('insilico')){
   setInsilicoAtomic(m,record);
  }else if(record.kind.startsWith('xtalpi')){
   setXtalpiAtomic(m,record);
  }else if(record.kind==='horizonHorizon'){
   setHorizonAtomic(m,record);
  }else if(record.kind.startsWith('junshi')){
   setJunshiAtomic(m,record);
  }else if(record.kind==='minimaxHorizon'){
   setMinimaxAtomic(m,record);
  }else if(record.kind.startsWith('cgn')){
   setCgnAtomic(m,record);
  }else if(record.kind.startsWith('byde')){
   setBydeAtomic(m,record);
  }else if(record.kind.startsWith('lepu')){
   setLepuAtomic(m,record);
  }else if(record.kind.startsWith('duality')){
   setDualityAtomic(m,record);
  }else if(record.kind.startsWith('zai')){
   setZaiAtomic(m,record);
  }else if(record.kind.startsWith('haierSmart')){
   setHaierSmartAtomic(m,record);
  }else if(record.kind.startsWith('hightide')){
   setHightideAtomic(m,record);
  }else if(record.kind.startsWith('ascentage')){
   setAscentageAtomic(m,record);
  }else if(record.kind==='normalProfitPrimitive'){
   setNormalInput(m,record.horizon,c,record.field,record.value);
  }else if(record.kind==='tigerPrimitive'){
   m.nativeInputs[record.horizon].rows[c][record.field]=record.value;
  }else if(record.kind==='fosunPrimitive'){
   m.nativeInputs[record.horizon].rows[c][record.field]=record.value;
  }else if(record.kind==='bridge'){
   if(['effectiveTaxRate','oneTimePenaltyReserveCNYbillion'].includes(record.field)){
    s.bridgeOverrides??=[{},{},{}];s.bridgeOverrides[c][record.field]=record.value;
   }else m.operatingBridge[record.horizon][record.field][c]=record.value;
  }else if(record.kind==='productBridge'){
   for(const other of models.filter(o=>o.issuerId===m.issuerId&&o.productOperatingBridge)){
    const op=other.productOperatingBridge[record.horizon];
    if(record.product)op.productRevenueUSDbn[record.product][c]=record.value;
    else op[record.field][c]=record.value;
   }
  }else if(record.kind==='sotp'){
   s.inputs[record.field][c]=record.value;
  }else if(record.kind==='sotpPipelineParameter'){
   if(record.groupIndex!=null)s.sotpPipeline[c].groups[record.groupIndex][record.field]=record.value;
   else s.sotpPipeline[c][record.field]=record.value;
  }else if(record.kind==='sotpPipelineSales'){
   s.sotpPipeline[c].groups[record.groupIndex].annualCashflows[record.index].grossDrugSalesUSDbn=record.value;
  }else if(record.kind==='drug'){
   if(record.component)s.components[c][record.field]=record.value;
   else {s.drugOverrides??=[{},{},{}];s.drugOverrides[c][record.field]=record.value;}
  }else if(record.kind==='sales'){
   s.salesOverrides??={};s.salesOverrides[record.type]??=structuredClone(m.globalRoyaltyModel.salesUSDbn[record.type]);s.salesOverrides[record.type][c][record.index]=record.value;
  }else if(record.kind==='milestone'){
   if(!s.milestones?.[c]?.[record.index])throw new Error('Unknown milestone override '+record.code);
   s.milestones[c][record.index][record.field]=record.value;
  }else if(record.kind==='pipelineParameter'){
   const pv=s.pipelineRNpv[c];
   if(record.groupIndex!=null)pv.groups[record.groupIndex][record.field]=record.value;
   else {pv.overrides??={};pv.overrides[record.field]=record.value;}
  }else if(record.kind==='pipelineSales'){
   s.pipelineRNpv[c].groups[record.groupIndex].annualCashflows[record.index].salesBn=record.value;
  }else if(record.kind==='pipelineCost'){
   s.pipelineRNpv[c].groups[record.groupIndex].annualCashflows[record.index].directCostCNYbn=record.value;
  }else if(record.kind==='pipelineMilestone'){
   s.pipelineRNpv[c].milestones[record.index][record.field]=record.value;
  }else if(record.kind==='recipientParameter'){
   s.recipientResidual[c][record.field]=record.value;
  }else if(record.kind==='recipientCost'){
   s.recipientResidual[c].annualCashflows[record.index][record.field]=record.value;
  }else throw new Error('Unknown workbook override kind '+record.kind);
  applied++;
 }
 const sharedFields=['eps','coreRevenueCNYbn','coreNetMargin','dilutedSharesBn','excessNetCashCNYbn','excessNetCashUSDbn'];
 for(const m of models.filter(m=>forceCodes.includes(m.code)||saved.records.some(r=>r.code===m.code||((r.kind==='productBridge'||r.kind==='assumption'&&sharedFields.includes(r.field))&&models.find(o=>o.code===r.code)?.issuerId===m.issuerId)))){
  for(const [h,s] of Object.entries(m.scenarios)){
   for(let c=0;c<3;c++){
    const k=s.cases[c],fx=s.fxCases?.[c]??m.fxValue;
    if(m.xtalpiBridge){
     const v=calculateXtalpiHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.xtalpiBridge.calculated??={};m.xtalpiBridge.calculated[['bear','base','bull'][c]]=calculateXtalpiAnnual(m,c);
     for(const field of ['epsCNY','coreRevenueCNYbn','coreNetMargin','dilutedSharesBn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;s.dilutedSharesBn[c]=v.dilutedSharesBn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.xtalpiBridge.globals[c].FX;
    }else if(m.zhonganBridge){
     const v=calculateZhonganHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.insilicoBridge){
     const v=calculateInsilicoHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.insilicoBridge.calculated??={};m.insilicoBridge.calculated[['bear','base','bull'][c]]=calculateInsilicoAnnual(m,c);
     for(const field of ['epsUSD','coreRevenueUSDbn','coreNetMargin','dilutedSharesBn'])s[field]??=Array(3).fill(null);
     s.epsUSD[c]=v.eps;s.coreRevenueUSDbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;s.dilutedSharesBn[c]=v.dilutedSharesBn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.insilicoBridge.globals[c].FX;
    }else if(m.cansinoBridge){
     const v=calculateCansinoHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.cansinoBridge.calculated??={};m.cansinoBridge.calculated[['bear','base','bull'][c]]=calculateCansinoAnnual(m,c);
     for(const field of ['epsCNY','coreRevenueCNYbn','coreNetMargin','dilutedSharesBn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;s.dilutedSharesBn[c]=v.dilutedSharesBn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.cansinoBridge.globals[c].FX;
    }else if(m.grandPharmaBridge){
     const v=calculateGrandPharmaHorizon(m,h,c);k.eps=v.eps;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.grandPharmaBridge.calculated??={};m.grandPharmaBridge.calculated[['bear','base','bull'][c]]=calculateGrandPharmaAnnual(m,c);
     for(const field of ['epsHKD','coreRevenueHKDbn','coreNetMargin','dilutedSharesBn'])s[field]??=Array(3).fill(null);
     s.epsHKD[c]=v.eps;s.coreRevenueHKDbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;s.dilutedSharesBn[c]=v.dilutedSharesBn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.grandPharmaBridge.globals[c].FX;
    }else if(m.horizonBridge){
     const v=calculateHorizonHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsRMB','normalRevenueRMB','normalParentProfitRMB','dilutedSharesM','cashOperatingProxyRMB'])s[field]??=Array(3).fill(null);
     s.epsRMB[c]=v.eps;s.normalRevenueRMB[c]=v.revenueRMB;s.normalParentProfitRMB[c]=v.parentProfitRMB;s.dilutedSharesM[c]=v.sharesM;s.cashOperatingProxyRMB[c]=v.cashAnnualRMB;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.sensetimeBridge){
     const v=calculateSensetimeHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=0;
     m.sensetimeBridge.calculated??={};m.sensetimeBridge.calculated[['bear','base','bull'][c]]=calculateSensetimeAnnual(m,c);
     for(const field of ['epsCNY','coreRevenueCNYbn','coreNetMargin','dilutedSharesBn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;s.dilutedSharesBn[c]=v.dilutedSharesBn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.sensetimeBridge.globals[c].FX;
    }else if(m.eastbuyBridge){
     const v=calculateEastbuyHorizon(m,h,c);k.eps=v.eps;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.eastbuyBridge.calculated??={};m.eastbuyBridge.calculated[['bear','base','bull'][c]]=calculateEastbuyAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.eastbuyBridge.globals[c].FX;
    }else if(m.junshiBridge){
     const v=calculateJunshiHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.junshiBridge.calculated??={};m.junshiBridge.calculated[['bear','base','bull'][c]]=calculateJunshiAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.revenue?v.normalProfit/v.revenue:0;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.junshiBridge.globals[c].FX;
    }else if(m.ubtechBridge){
     const v=calculateUbtechHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsRMB','normalRevenueRMB','normalParentProfitRMB','dilutedSharesM','cashOperatingProxyRMB'])s[field]??=Array(3).fill(null);
     s.epsRMB[c]=v.eps;s.normalRevenueRMB[c]=v.revenueRMB;s.normalParentProfitRMB[c]=v.parentProfitRMB;s.dilutedSharesM[c]=v.sharesM;s.cashOperatingProxyRMB[c]=v.cashAnnualRMB;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.zhipuBridge){
     const v=calculateZhipuHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsRMB','normalRevenueRMB','normalParentProfitRMB','dilutedSharesM','cashOperatingProxyRMB'])s[field]??=Array(3).fill(null);
     s.epsRMB[c]=v.eps;s.normalRevenueRMB[c]=v.revenueRMB;s.normalParentProfitRMB[c]=v.parentProfitRMB;s.dilutedSharesM[c]=v.sharesM;s.cashOperatingProxyRMB[c]=v.cashAnnualRMB;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.cgnBridge){
     const v=calculateCgnHorizon(m,h,c);k.eps=v.eps;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.cgnBridge.calculated??={};m.cgnBridge.calculated[['bear','base','bull'][c]]=calculateCgnAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsUSD','coreRevenueUSDbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsUSD[c]=v.eps;s.coreRevenueUSDbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.cgnBridge.globals[c].FX;
    }else if(m.minimaxBridge){
     const v=calculateMinimaxHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsUSD','normalRevenueUSD','normalParentProfitUSD','dilutedSharesM','cashOperatingProxyUSD'])s[field]??=Array(3).fill(null);
     s.epsUSD[c]=v.eps;s.normalRevenueUSD[c]=v.revenueUSD;s.normalParentProfitUSD[c]=v.parentProfitUSD;s.dilutedSharesM[c]=v.sharesM;s.cashOperatingProxyUSD[c]=v.cashAnnualUSD;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.bydeBridge){
     const v=calculateBydeHorizon(m,h,c);k.eps=v.eps;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.bydeBridge.calculated??={};m.bydeBridge.calculated[['bear','base','bull'][c]]=calculateBydeAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.bydeBridge.globals[c].FX;
    }else if(m.lepuBridge){
     const v=calculateLepuHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.lepuBridge.calculated??={};m.lepuBridge.calculated[['bear','base','bull'][c]]=calculateLepuAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.revenue?v.normalProfit/v.revenue:0;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.lepuBridge.globals[c].FX;
    }else if(m.nioBridge){
     const v=calculateNioHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsCNY','normalRevenueCNYbn','normalParentProfitCNYbn','dilutedSharesBn','cashOperatingProxyCNYbn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.normalRevenueCNYbn[c]=v.revenueCNYbn;s.normalParentProfitCNYbn[c]=v.parentNormalProfitCNYbn;s.dilutedSharesBn[c]=v.dilutedSharesBn;s.cashOperatingProxyCNYbn[c]=v.cashOperatingProxyCNYbn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.haierSmartBridge){
     const v=calculateHaierSmartHorizon(m,h,c);k.eps=v.eps;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.haierSmartBridge.calculated??={};m.haierSmartBridge.calculated[['bear','base','bull'][c]]=calculateHaierSmartAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalNetMargin;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.haierSmartBridge.globals[c].FX;
    }else if(m.zaiBridge){
     const v=calculateZaiHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.zaiBridge.calculated??={};m.zaiBridge.calculated[['bear','base','bull'][c]]=calculateZaiAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsUSD','coreRevenueUSDbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsUSD[c]=v.eps;s.coreRevenueUSDbn[c]=v.revenue;s.coreNetMargin[c]=v.revenue?v.normalProfit/v.revenue:0;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.zaiBridge.globals[c].FX;
    }else if(m.xpengBridge){
     const v=calculateXpengHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsCNY','normalRevenueCNYbn','normalParentProfitCNYbn','dilutedSharesBn','cashOperatingProxyCNYbn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.normalRevenueCNYbn[c]=v.revenueCNYbn;s.normalParentProfitCNYbn[c]=v.parentNormalProfitCNYbn;s.dilutedSharesBn[c]=v.dilutedSharesBn;s.cashOperatingProxyCNYbn[c]=v.cashOperatingProxyCNYbn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.liautoBridge){
     const v=calculateLiautoHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsCNY','normalRevenueCNYbn','normalParentProfitCNYbn','dilutedSharesBn','cashOperatingProxyCNYbn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.normalRevenueCNYbn[c]=v.revenueCNYbn;s.normalParentProfitCNYbn[c]=v.parentNormalProfitCNYbn;s.dilutedSharesBn[c]=v.dilutedSharesBn;s.cashOperatingProxyCNYbn[c]=v.cashOperatingProxyCNYbn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.tongchengBridge){
     const v=calculateTongchengHorizon(m,h,c);k.eps=v.eps;k.PE=v.PE;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsCNY','normalRevenueCNYbn','normalParentProfitCNYbn','dilutedSharesBn','cashOperatingProxyCNYbn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.normalRevenueCNYbn[c]=v.revenueCNYbn;s.normalParentProfitCNYbn[c]=v.parentNormalProfitCNYbn;s.dilutedSharesBn[c]=v.dilutedSharesBn;s.cashOperatingProxyCNYbn[c]=v.cashOperatingProxyCNYbn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.dualityBridge){
     const v=calculateDualityHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.dualityBridge.calculated??={};m.dualityBridge.calculated[['bear','base','bull'][c]]=calculateDualityAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.revenue?v.normalProfit/v.revenue:0;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.dualityBridge.globals[c].FX;
    }else if(m.hightideBridge){
     const v=calculateHightideHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     m.hightideBridge.calculated??={};m.hightideBridge.calculated[['pessimistic','base','optimistic'][c]]=calculateHightideAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.targetShares;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.revenue?v.normalProfit/v.revenue:0;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.hightideBridge.cases[c].globals.FX;
    }else if(m.yuewenBridge){
     const v=calculateYuewenHorizon(m,h,c);k.eps=v.eps;k.PE=v.PE;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsCNY','normalRevenueCNYbn','normalParentProfitCNYbn','dilutedSharesBn','cashOperatingProxyCNYbn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.normalRevenueCNYbn[c]=v.revenueCNYbn;s.normalParentProfitCNYbn[c]=v.parentNormalProfitCNYbn;s.dilutedSharesBn[c]=v.dilutedSharesBn;s.cashOperatingProxyCNYbn[c]=v.cashOperatingProxyCNYbn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.kingsoftBridge){
     const v=calculateKingsoftHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     for(const field of ['epsCNY','normalRevenueCNYbn','normalParentProfitCNYbn','dilutedSharesBn','cashOperatingProxyCNYbn','SOTPValueCNYbn'])s[field]??=Array(3).fill(null);
     s.epsCNY[c]=v.eps;s.normalRevenueCNYbn[c]=v.revenueCNYbn;s.normalParentProfitCNYbn[c]=v.parentNormalProfitCNYbn;s.dilutedSharesBn[c]=v.dilutedSharesBn;s.cashOperatingProxyCNYbn[c]=v.cashOperatingProxyCNYbn;s.SOTPValueCNYbn[c]=v.SOTPValueCNYbn;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.ascentageBridge){
     const v=calculateAscentageHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.ascentageBridge.calculated??={};m.ascentageBridge.calculated[['bear','base','bull'][c]]=calculateAscentageAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.ascentageBridge.globals[c].FX;
    }else if(m.xdBridge){
     const v=calculateXDHorizon(m,h,c);k.eps=v.eps;k.PE=v.PE;k.price=v.price;k.dividend=v.dividend;
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.everestBridge){
     const v=calculateEverestHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.everestBridge.calculated??={};m.everestBridge.calculated[['bear','base','bull'][c]]=calculateEverestAnnual(m,c);
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.everestBridge.globals[c].FX;
    }else if(m.huahongBridge){
     const v=calculateHuahongHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.price;k.dividend=v.dividend;
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsUSD[c]=v.eps;s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=v.FX;
    }else if(m.innocareBridge){
     const v=calculateInnocareHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     const rows=calculateInnocareAnnual(m,c);
     m.innocareBridge.calculated??={};m.innocareBridge.calculated[['bear','base','bull'][c]]=rows;
     for(const field of ['dilutedSharesBn','epsCNY','coreRevenueCNYbn','coreNetMargin'])s[field]??=Array(3).fill(null);
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsCNY[c]=v.eps;s.coreRevenueCNYbn[c]=v.revenue;s.coreNetMargin[c]=v.normalProfit/v.revenue;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.innocareBridge.globals[c].FX;
    }else if(m.hutchmedBridge){
     const v=calculateHutchmedHorizon(m,h,c);k.eps=v.eps;k.PE=null;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.hutchmedBridge.calculated??={};m.hutchmedBridge.calculated[['bear','base','bull'][c]]=v.rows;
     s.dilutedSharesBn[c]=v.dilutedSharesBn;s.epsUSD[c]=v.eps;
     s.fxCases??=[m.fxValue,m.fxValue,m.fxValue];s.fxCases[c]=m.hutchmedBridge.globals[c].FX;
    }else if(m.segmentCashBridge){
     const calculated=calculateSegmentHorizon(m,h,c);k.eps=calculated.eps;k.price=calculated.price;k.dividend=calculated.dividend;
     m.segmentCashBridge.calculated??={};m.segmentCashBridge.calculated[['bear','base','bull'][c]]=calculated.rows;
     const r=calculated.rows.find(r=>r.year===s.earningsYear);s.coreRevenueCNYbn[c]=r.revenueCNYbn;s.coreNetMargin[c]=r.parentNormalProfitCNYbn/r.revenueCNYbn;s.dilutedSharesBn[c]=r.dilutedSharesBn;
    }else if(m.simcereBridge){
     const calculated=calculateSimcereHorizon(m,h,c);k.eps=calculated.eps;k.price=calculated.intrinsicPrice;k.dividend=calculated.dividend;
     m.simcereBridge.calculated??={};m.simcereBridge.calculated[simcereCases[c]]=calculated.rows;
     const r=calculated.rows.find(r=>r.year===s.earningsYear);s.coreRevenueCNYbn[c]=r.coreRevenueCNYbn;s.coreNetMargin[c]=r.coreNetProfitCNYbn/r.coreRevenueCNYbn;s.dilutedSharesBn[c]=r.dilutedSharesBn;
    }else if(m.luyeBridge){
     const v=calculateLuyeHorizon(m,h,c);k.eps=v.eps;k.price=v.intrinsicPrice;k.dividend=v.dividend;
     m.luyeBridge.calculated??={};m.luyeBridge.calculated[luyeCases[c]]=v.rows;
     const r=v.rows.find(r=>r.year===s.earningsYear);s.coreRevenueCNYbn[c]=r.revenueCNYbn;s.coreNetMargin[c]=r.parentNormalProfitCNYbn/r.revenueCNYbn;s.dilutedSharesBn[c]=r.dilutedSharesBn;
    }else if(m.normalProfitBridge){
     const v=calculateNormalProfit(m,h,c);k.eps=v.eps;k.price=v.price;
    }else if(m.tigermedBridge){
     const v=calculateTigermed(m,h,c);k.eps=v.eps;k.price=v.price;
    }else if(m.fosunBridge){
     const v=calculateFosun(m,h,c);k.eps=v.eps;k.price=v.price;
    }else if(m.sotpBridge){
     k.price=calculateSOTP(m,h,c).price;
    }else if(m.globalRoyaltyModel){
     const g=m.globalRoyaltyModel,p=s.components[c],o=s.drugOverrides?.[c]??{};
     let pv=0;
     for(const type of ['lung','nonLung'])for(let i=0;i<g.salesYears.length;i++){
      if(!s.cashFlowsIncluded[i])continue;
      const sales=s.salesOverrides?.[type]?.[c]?.[i]??g.salesUSDbn[type][c][i];
      const success=type==='lung'?p.lungApprovalAndCommercialSuccess:p.nonLungApprovalAndCommercialSuccess;
      pv+=sales*(o.royaltyRate??g.royaltyRate[c])*(1-(o.royaltyTax??g.royaltyTax[c]))*success*(o.parentEconomicShare??g.parentEconomicShare?.[c]??1)/(1+(o.WACC??g.WACC[c]))**s.discountExponentsACT36525[i]*(o.CNYperUSD??s.CNYperUSD);
     }
     if(s.milestones)for(const f of s.milestones[c])if(f.included)pv+=f.grossUSDbn*f.successWeight*.8*(o.parentEconomicShare??g.parentEconomicShare?.[c]??1)*(o.CNYperUSD??s.CNYperUSD)/(1+(o.WACC??g.WACC[c]))**f.yearsACT36525;
     k.price=(p.domesticCoreProfitCNYbn*p.domesticPE+pv+p.netCashCNYbn-p.futureCentralResearchCostReserveCNYbn)/p.dilutedSharesBn*(o.fx??fx);
    }else{
     if(s.pipelineRNpv){
      const pv=s.pipelineRNpv[c],usd=pv.overrides?.CNYperUSD??s.cashBridgeAnchor.USDCNYAssumption,discount=pv.overrides?.discountRate??pv.discountRate;
      let total=0;
      for(const g of pv.groups){let gp=0;for(const f of g.annualCashflows){f.riskAdjustedParentNetCashCNYbn=f.salesBn*g.successAssumption*g.netEconomicCashMarginAssumption*g.parentEconomicShareAssumption*(g.currency==='USD'?usd:1)-(f.directCostCNYbn??0);f.PV_CNYbn=f.pastAtTarget?0:f.riskAdjustedParentNetCashCNYbn*(f.targetYearRemainingFraction??1)/(1+discount)**f.yearsACT36525;gp+=f.PV_CNYbn;}g.PV_CNYbn=gp;total+=gp;}
      let milestonePV=0;for(const f of pv.milestones){f.netRiskAdjustedParentCashCNYbn=(f.grossAmount??f.grossUSD)*f.success*((f.currency??'USD')==='USD'?usd:1)*(f.taxFactor??pv.overrides?.milestoneTaxFactor??pv.milestoneTaxFactor??.8)*(f.parentFactor??pv.overrides?.milestoneParentFactor??pv.milestoneParentFactor??.9);f.PV_CNYbn=f.alreadyPastAtTarget?0:f.netRiskAdjustedParentCashCNYbn/(1+discount)**f.yearsACT36525;milestonePV+=f.PV_CNYbn;}
      pv.milestonePV_CNYbn=milestonePV;pv.totalPV_CNYbn=total+milestonePV;
     }
     if(m.productOperatingBridge){
      const op=m.productOperatingBridge[h],revenue=Object.values(op.productRevenueUSDbn).reduce((a,v)=>a+v[c],0);
      k.eps=(revenue*op.grossMargin[c]-op.researchCostUSDbn[c]-op.sellingAdminUSDbn[c])*(1-op.taxRate[c])/op.dilutedSharesBn[c];
      s.dilutedSharesBn[c]=op.dilutedSharesBn[c];s.coreRevenueUSDbn[c]=revenue;s.coreNetMargin[c]=k.eps*op.dilutedSharesBn[c]/revenue;
     }else if(m.operatingBridge){
      const op=m.operatingBridge[h],ov=s.bridgeOverrides?.[c]??{};
      const ebit=op.infraRevenue||op.adRevenue?0:op.retailRevenue?op.retailRevenue[c]*op.retailEBITMargin[c]+op.logisticsRevenue[c]*op.logisticsEBITMargin[c]-op.newBusinessLoss[c]-op.corporateCost[c]:op.coreRevenue?op.coreRevenue[c]*op.coreEBITMargin[c]-op.corporateCost[c]:op.PRCRevenue?op.PRCRevenue[c]*op.PRCEBITMargin[c]+op.overseasRevenue[c]*op.overseasEBITMargin[c]-op.corporateCost[c]+op.normalOther[c]:op.powerRevenue?['power','storage','materials','other'].reduce((a,f)=>a+op[f+'Revenue'][c]*op[f+'EBITMargin'][c],0):op.domesticUnits?(op.domesticUnits[c]*op.domesticProfitPerVehicle[c]+op.overseasUnits[c]*op.overseasProfitPerVehicle[c])/1000+op.otherOwnerProfit[c]:op.revenue?op.revenue[c]*(op.adjustedEBITMargin??op.EBITMargin)[c]:['commerceEBITA','cloudComputeEBITA','labsEBITA','otherCorporateEliminationEBITA'].reduce((a,f)=>a+op[f][c],0);
      let businessEBIT=ebit;
      if(op.infraRevenue)businessEBIT=['infra','applications','aiNativeMarketing','legacy','other'].reduce((a,p)=>a+op[p+'Revenue'][c]*op[p+'ContributionMargin'][c],0)-op.corporateCost[c]+op.iqiyiOwnerOperatingContribution[c];
      if(op.adRevenue)businessEBIT=op.adRevenue[c]*op.adContributionMargin[c]+op.liveRevenue[c]*op.liveContributionMargin[c]+op.otherExKlingRevenue[c]*op.otherContributionMargin[c]-op.corporateCost[c]+(op.klingRevenue[c]*op.klingContributionMargin[c]-op.klingFixedRD[c])*op.klingOwnerShare[c];
      const precision=10**(m.operatingBridge.epsRoundingDecimals??2);
      const profit=op.domesticUnits?businessEBIT:op.adRevenue?(businessEBIT+op.normalNetFinanceAssociates[c])*(1-(ov.effectiveTaxRate??m.operatingBridge.effectiveTaxRate))-op.epsNumeratorReserve[c]:op.ownerProfitShare?(businessEBIT+((op.normalNetFinanceAssociates??op.netFinancialAssociates)?.[c]??0))*(1-(ov.effectiveTaxRate??m.operatingBridge.effectiveTaxRate))*op.ownerProfitShare[c]-(op.epsNumeratorReserve?.[c]??0):businessEBIT*(1-(ov.effectiveTaxRate??m.operatingBridge.effectiveTaxRate))+op.afterTaxInterestAssociatesNet[c];
      k.eps=Math.round(profit/op.dilutedShares[c]*precision)/precision;
     }else if(s.coreRevenueCNYbn)k.eps=s.coreRevenueCNYbn[c]*s.coreNetMargin[c]/s.dilutedSharesBn[c];
     k.price=k.eps*k.PE*fx;
     if(m.operatingBridge?.[h]?.coreRevenue){const op=m.operatingBridge[h];k.price=(Math.max(0,k.eps)*k.PE+(op.newRevenue[c]*op.newEVSales[c]+op.netDistributableTreasury[c]-op.transitionFundingPV[c])/op.dilutedShares[c])*fx;}
     if(s.excessNetCashCNYbn)k.price+=s.excessNetCashCNYbn[c]/s.dilutedSharesBn[c]*fx;
     if(s.excessNetCashUSDbn)k.price+=s.excessNetCashUSDbn[c]/s.dilutedSharesBn[c]*fx*(s.cashPremiumApplies?s.AsharePremiumAssumption[c]:1);
     if(s.strategyInvestmentValueCNYbn)k.price+=s.strategyInvestmentValueCNYbn[c]/s.dilutedSharesBn[c]*fx;
     if(s.pipelineRNpv)k.price+=s.pipelineRNpv[c].totalPV_CNYbn/s.dilutedSharesBn[c]*fx;
     if(s.recipientResidual)k.price+=calculateRecipientResidual(s,c)/s.dilutedSharesBn[c]*fx;
     if(s.futureResearchReserveCNYbn)k.price-=s.futureResearchReserveCNYbn[c]/s.dilutedSharesBn[c]*fx;
     if(m.operatingBridge){const reserve=s.bridgeOverrides?.[c]?.oneTimePenaltyReserveCNYbillion??m.operatingBridge.oneTimePenaltyReserveCNYbillion??0;k.price=Math.round((k.price-reserve/m.operatingBridge[h].dilutedShares[c]*fx)*100)/100;}
    }
    if(s.equityFloorZero)k.price=Math.max(0,k.price);
    if(Number.isInteger(m.targetPriceRoundingDecimals)){const precision=10**m.targetPriceRoundingDecimals;k.price=Math.round(k.price*precision)/precision;}
    const recognition=s.marketRecognitionFactor??s.recognitionFactor;if(recognition){s.intrinsicPrices??=[null,null,null];s.intrinsicPrices[c]=k.price;k.price=m.price+(k.price-m.price)*recognition[c];}
    k.priceReturn=k.price/m.price-1;k.totalReturn=(k.price+k.dividend)/m.price-1;k.annualized=years[h]>=3?(1+k.totalReturn)**(1/years[h])-1:null;
   }
   s.expectedPrice=s.cases[0].price*.25+s.cases[1].price*.5+s.cases[2].price*.25;
   s.defensivePrice=s.cases[0].price*.4+s.cases[1].price*.5+s.cases[2].price*.1;
   s.positivePrice=s.cases[0].price*.1+s.cases[1].price*.5+s.cases[2].price*.4;
  }
  for(const s of Object.values(m.scores))s.total=s.dimensions.reduce((a,v,i)=>a+v*s.weights[i]/5,0);
 }
 return {...saved,applied};
}
