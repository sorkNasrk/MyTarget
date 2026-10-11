import {nominalTargets,resolveTargetDate} from './target_dates.mjs';
const exponent=(date,target)=>(Date.parse(date)-Date.parse(target))/86400000/365.25;
function fraction(date,target){const year=+date.slice(0,4),targetYear=+target.slice(0,4);return year<targetYear?0:year>targetYear?1:(Date.parse((year+1)+'-01-01')-Date.parse(target))/(Date.parse((year+1)+'-01-01')-Date.parse(year+'-01-01'));}
export function rebaseCalendarModels(models){
 const records=[],recalculateCodes=[];
 for(const m of models){const market=m.code.endsWith('.HK')?'HKEX':m.code.endsWith('.SH')?'SSE':'SZSE';
  for(const [h,s] of Object.entries(m.scenarios)){
   const resolution=resolveTargetDate(nominalTargets[h],market);s.targetDateResolution=resolution;
   if(!resolution.actualDate||s.target===resolution.actualDate)continue;
   const old=s.target,next=resolution.actualDate,record={code:m.code,horizon:h,nominalDate:nominalTargets[h],oldModelDate:old,actualDate:next,oldPrices:s.cases.map(c=>c.price),calendarSources:resolution.sources};
   s.target=next;s.targetValuationDate=next;
   const dynamic=!!(m.hutchmedBridge||m.innocareBridge||m.everestBridge||m.ascentageBridge||m.hightideBridge||m.dualityBridge||m.zaiBridge||m.haierSmartBridge||m.bydeBridge||m.lepuBridge||m.cgnBridge||m.junshiBridge||m.eastbuyBridge||m.sotpBridge||s.pipelineRNpv||m.globalRoyaltyModel);
   if(dynamic||m.sensetimeBridge||m.cansinoBridge||m.grandPharmaBridge||m.insilicoBridge||m.xtalpiBridge){
    for(const p of s.sotpPipeline??[])for(const g of p.groups)for(const f of g.annualCashflows){f.yearsACT36525=exponent(f.cashDate,next);f.included=f.cashDate>next;}
    for(const p of s.pipelineRNpv??[]){for(const g of p.groups)for(const f of g.annualCashflows){f.yearsACT36525=exponent(f.cashDate,next);f.pastAtTarget=f.cashDate<=next;if(f.targetYearRemainingFraction!=null)f.targetYearRemainingFraction=fraction(f.cashDate,next);}
     for(const f of p.milestones){f.yearsACT36525=exponent(f.cashDate,next);f.alreadyPastAtTarget=f.cashDate<=next;}
    }
    for(const p of s.recipientResidual??[])for(const f of p.annualCashflows){f.yearsACT36525=exponent(f.cashDate,next);if(f.targetYearRemainingFraction!=null)f.targetYearRemainingFraction=fraction(f.cashDate,next);}
    if(m.globalRoyaltyModel){s.discountExponentsACT36525=m.globalRoyaltyModel.salesYears.map(y=>exponent(y+'-12-31',next));s.cashFlowsIncluded=s.discountExponentsACT36525.map(v=>v>0);for(const items of s.milestones??[])for(const f of items){f.yearsACT36525=exponent(f.cashDate,next);f.included=f.cashDate>next;}}
    recalculateCodes.push(m.code);record.recalculation='全部未来现金流ACT折现、目标年比例及目标现金/股数按实际日重算；经营假设不变';
   }else record.recalculation='经营情景及期限估值输入为独立研究假设，不按相差日数插值；实际日期已修订';
   s.calendarRebase={oldModelDate:old,actualDate:next,recalculation:record.recalculation};records.push(record);
  }
 }
 return{version:'calendar-rebase-v1',asOf:'2026-10-09',records,recalculateCodes:[...new Set(recalculateCodes)],unresolved:'SSE/SZSE目标年度日历及HKEX2029/2031尚待对应年度公告，未填造实际交易日'};
}
export function rebaseConditionalCalendar(models){
 const records=[];
 for(const m of models){const market=m.code.endsWith('.HK')?'HKEX':m.code.endsWith('.SH')?'SSE':'SZSE';
  for(const [h,s] of Object.entries(m.conditionalScenarios??{})){
   const resolution=resolveTargetDate(nominalTargets[h],market);s.targetDateResolution=resolution;
   if(!resolution.actualDate||s.target===resolution.actualDate)continue;
   const old=s.target;s.target=resolution.actualDate;
   s.calendarRebase={oldModelDate:old,actualDate:s.target,recalculation:'条件经营盈利按独立年度假设估值，未按一日差机械插值；不产生正式涨幅、期望价或排名'};
   records.push({code:m.code,horizon:h,...s.calendarRebase});
  }
 }
 return records;
}
