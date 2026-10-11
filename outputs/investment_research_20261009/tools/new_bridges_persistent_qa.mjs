import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
import {applyWorkbookInputs} from './workbook_inputs.mjs';
import {calculateInnocareHorizon} from './innocare_native.mjs';
import {calculateHuahongHorizon} from './huahong_native.mjs';
import {calculateEverestHorizon} from './everest_native.mjs';
import {calculateXDHorizon} from './xd_native.mjs';
import {calculateKingsoftHorizon} from './kingsoft_native.mjs';
import {calculateYuewenHorizon} from './yuewen_native.mjs';
import {calculateAscentageHorizon} from './ascentage_native.mjs';
import {calculateHightideHorizon} from './hightide_native.mjs';
import {calculateTongchengHorizon} from './tongcheng_native.mjs';
import {calculateDualityHorizon} from './duality_native.mjs';
import {calculateLiautoHorizon} from './liauto_native.mjs';
import {calculateZaiHorizon} from './zai_native.mjs';
import {calculateXpengHorizon} from './xpeng_native.mjs';
import {calculateHaierSmartHorizon} from './haier_smart_native.mjs';
import {calculateNioHorizon} from './nio_native.mjs';
import {calculateBydeHorizon} from './byde_native.mjs';
import {calculateLepuHorizon} from './lepu_native.mjs';
import {calculateMinimaxHorizon} from './minimax_native.mjs';
import {calculateCgnHorizon} from './cgn_native.mjs';
import {calculateJunshiHorizon} from './junshi_native.mjs';
import {calculateZhipuHorizon} from './zhipu_native.mjs';
import {calculateEastbuyHorizon} from './eastbuy_native.mjs';
import {calculateUbtechHorizon} from './ubtech_native.mjs';
import {calculateSensetimeHorizon} from './sensetime_native.mjs';
import {calculateCansinoHorizon} from './cansino_native.mjs';
import {calculateHorizonHorizon} from './horizon_native.mjs';
import {calculateGrandPharmaHorizon} from './grand_pharma_native.mjs';
import {calculateZhonganHorizon} from './zhongan_native.mjs';
import {calculateInsilicoHorizon} from './insilico_native.mjs';
import {calculateXtalpiHorizon} from './xtalpi_native.mjs';
const root=path.resolve(import.meta.dirname,'..');
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'data/workbook_input_manifest.json'),'utf8')).inputs;
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'deliverables/证券研究总表_初版.xlsx')));
const active=wb.worksheets.getItem('活动估值'),selector=wb.worksheets.getItem('假设').getRange('B3'),snap=wb.worksheets.getItem('情景快照');
const checks=[];function eq(label,a,e){const tolerance=Math.max(1e-6,Math.abs(e)*1e-9);if(!Number.isFinite(a)||!Number.isFinite(e)||Math.abs(a-e)>tolerance)throw Error(label+' '+a+' expected '+e);checks.push(label);}
const nativeCalculators={I041:calculateInnocareHorizon,I071:calculateHuahongHorizon,I040:calculateEverestHorizon,I060:calculateXDHorizon,I091:calculateKingsoftHorizon,I079:calculateYuewenHorizon,I021:calculateAscentageHorizon,I037:calculateHightideHorizon,I086:calculateTongchengHorizon,I020:calculateDualityHorizon,I084:calculateLiautoHorizon,I039:calculateZaiHorizon,I085:calculateXpengHorizon,I068:calculateHaierSmartHorizon,I088:calculateNioHorizon,I081:calculateBydeHorizon,I026:calculateLepuHorizon,I054:calculateMinimaxHorizon,I057:calculateCgnHorizon,I046:calculateJunshiHorizon,I055:calculateZhipuHorizon};
nativeCalculators.I058=calculateEastbuyHorizon;
nativeCalculators.I059=calculateUbtechHorizon;
nativeCalculators.I089=calculateSensetimeHorizon;
nativeCalculators.I042=calculateCansinoHorizon;
nativeCalculators.I062=calculateHorizonHorizon;
nativeCalculators.I032=calculateGrandPharmaHorizon;
nativeCalculators.I083=calculateZhonganHorizon;
if(b.models.some(m=>m.issuerId==='I008'))nativeCalculators.I008=calculateInsilicoHorizon;
if(b.models.some(m=>m.issuerId==='I027'))nativeCalculators.I027=calculateXtalpiHorizon;
const calc=(m,h,c)=>nativeCalculators[m.issuerId](m,h,c);
let activeRows=[];
function recalculate(){wb.recalculate();activeRows=active.getRange('A7:U'+(6+b.models.length*5)).values;}
const ar=(m,h)=>activeRows.find(r=>r[0]===m.code&&r[2]===b.labels[h]);
const models=b.models.filter(m=>Object.hasOwn(nativeCalculators,m.issuerId));if(models.length!==Object.keys(nativeCalculators).length)throw Error('Native bridge coverage mismatch');
const fxBridges={I041:'innocareBridge',I040:'everestBridge',I021:'ascentageBridge',I020:'dualityBridge',I039:'zaiBridge',I068:'haierSmartBridge',I081:'bydeBridge',I026:'lepuBridge',I057:'cgnBridge',I046:'junshiBridge',I058:'eastbuyBridge'};
fxBridges.I089='sensetimeBridge';
fxBridges.I042='cansinoBridge';
fxBridges.I032='grandPharmaBridge';
fxBridges.I008='insilicoBridge';
fxBridges.I027='xtalpiBridge';
for(let c=0;c<3;c++){
 selector.values=[[c+1]];recalculate();
 for(const m of models)for(const h of Object.keys(m.scenarios)){
  const v=calc(m,h,c),r=ar(m,h),bridge=fxBridges[m.issuerId];
  eq('Price '+m.code+'/'+h+'/'+c,r[11],v.price);eq('Dividend '+m.code+'/'+h+'/'+c,r[12],v.dividend);eq('Return '+m.code+'/'+h+'/'+c,r[14],(v.price+v.dividend)/m.price-1);
  eq('FX '+m.code+'/'+h+'/'+c,r[10],bridge?m[bridge].globals[c].FX:m.issuerId==='I037'?m.hightideBridge.cases[c].globals.FX:v.FX);
  if(['I060','I079','I086'].includes(m.issuerId))eq('Native PE '+h+'/'+c,r[9],v.PE);
  else if(['I068','I081','I057','I058','I032'].includes(m.issuerId))eq('Native assumption PE '+h+'/'+c,r[9],m.scenarios[h].cases[c].PE);
  else if(m.issuerId==='I083')eq('Native PB '+h+'/'+c,r[9],v.PB);
  else if(['I084','I085','I088','I054','I055','I059','I062'].includes(m.issuerId))eq('Native EVSales '+h+'/'+c,r[9],v.EVSales);
  else if(m.issuerId==='I089')eq('Native PS '+h+'/'+c,r[9],m.scenarios[h].cases[c].PS);
  else if(m.issuerId==='I091'){if(!String(r[9]).includes('SOTP'))throw Error('Wrong Kingsoft generic PE');}
  else if(typeof r[9]==='number')throw Error('Wrong generic PE path');
 }
 console.log('Baseline scenario '+c+' passed');
}
selector.values=[[2]];recalculate();
const allTests=[
 {iid:'I041',kind:'innocareGlobal',field:'FX',caseIndex:1,delta:-.05},
 {iid:'I041',kind:'innocareGlobal',field:'zenasRecovery',caseIndex:1,delta:-.10},
 {iid:'I041',kind:'innocareGlobal',field:'bankAnchor',caseIndex:1,delta:.05},
 {iid:'I041',kind:'innocareAnnual',field:'RD',index:3,caseIndex:1,delta:.1},
 {iid:'I041',kind:'innocareAnnual',field:'GM.orel',index:0,caseIndex:1,delta:-.02},
 {iid:'I041',kind:'innocareAnnual',field:'dividend',index:1,caseIndex:1,delta:.02},
 {iid:'I041',kind:'innocareAsset',field:'p',groupIndex:2,caseIndex:1,delta:-.05},
 {iid:'I041',kind:'innocareCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I041',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 {iid:'I071',kind:'huahongGlobal',field:'acquisitionNetAdjustmentUSD',caseIndex:1,delta:-.08},
 {iid:'I071',kind:'huahongGlobal',field:'FX',caseIndex:1,delta:-.4},
 {iid:'I071',kind:'huahongHorizon',field:'allCosts',horizon:'yearEnd',caseIndex:1,delta:.1},
 {iid:'I071',kind:'huahongHorizon',field:'JVRevenue',horizon:'oneYear',caseIndex:1,delta:.2},
 {iid:'I071',kind:'huahongHorizon',field:'netEquityFinance',horizon:'oneYear',caseIndex:1,delta:.5},
 {iid:'I071',kind:'huahongHorizon',field:'PB',horizon:'oneYear',caseIndex:1,delta:-.25},
 {iid:'I071',kind:'huahongHorizon',field:'dividend',horizon:'threeYear',caseIndex:1,delta:.1},
 {iid:'I040',kind:'everestGlobal',field:'FX',caseIndex:1,delta:-.05},
 {iid:'I040',kind:'everestGlobal',field:'acquisitionFace',caseIndex:1,delta:.1},
 {iid:'I040',kind:'everestGlobal',field:'upfrontNetFactor',caseIndex:1,delta:-.05},
 {iid:'I040',kind:'everestGlobal',field:'H1LicenseCash',caseIndex:1,delta:-.04},
 {iid:'I040',kind:'everestGlobal',field:'acquisitionPay2028USD',caseIndex:1,delta:.01},
 {iid:'I040',kind:'everestAnnual',field:'licensePay',index:3,caseIndex:1,delta:.1},
 {iid:'I040',kind:'everestAnnual',field:'RD',index:2,caseIndex:1,delta:.1},
 {iid:'I040',kind:'everestAnnual',field:'dividend',index:0,caseIndex:1,delta:.03},
 {iid:'I040',kind:'everestAsset',field:'p',groupIndex:2,caseIndex:1,delta:-.02},
 {iid:'I040',kind:'everestCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I040',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 ...[['gameGross',-.03],['RD',.1],['associateProfit',.03],['minority',.03],['knownPendingCancel',.003],['additionalBuybackHKDbn',.08],['FX',-.05],['dividend',.05],['PE',-2]].map(([field,delta])=>({iid:'I060',kind:'xdHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['officeRD',.1],['officeParent',-.02],['gameSBC',.02],['KCGroupStakeNAV',-.2],['KCParentWithinGroup',-.05],['holdingDiscount',.03],['additionalBuybackHKDbn',.08],['FX',-.05],['dividend',.05],['annualParentNWC',.03]].map(([field,delta])=>({iid:'I091',kind:'kingsoftHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['RD',.1],['minorityProfit',.02],['ipGross',-.03],['completedAcquisitionCash',.05],['postJuneCashDelta',-.05],['cashAccumulationYears',.1],['capitalCash',.03],['pendingCancel',.001],['extraBuybackHKDbn',.05],['FX',-.05],['dividend',.05],['otherAssocNAV',-.01]].map(([field,delta])=>({iid:'I079',kind:'yuewenHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.05],['distributionReserve',.1],['distributionRate',-.05],['bankAnchor',.1],['issueNetFactor',-.02]].map(([field,delta])=>({iid:'I021',kind:'ascentageGlobal',field,caseIndex:1,delta})),
 ...[['issueGross',.1,2],['issuePx',-2,2],['RD',.1,3],['employeeShares',.001,2]].map(([field,delta,index])=>({iid:'I021',kind:'ascentageAnnual',field,index,caseIndex:1,delta})),
 {iid:'I021',kind:'ascentageAsset',field:'p',groupIndex:8,caseIndex:1,delta:-.02},
 {iid:'I021',kind:'ascentageCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I021',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 ...[['FX',-.05],['knownAugustNet',-.01],['financialRecovery',-.05],['distributionReserve',.01],['distributionRate',-.05]].map(([field,delta])=>({iid:'I037',kind:'hightideGlobal',field,caseIndex:1,delta})),
 ...[['issueGross',.02,2],['issuePriceHKD',-.1,2],['platformRD',.01,3],['employeeShares',.001,2]].map(([field,delta,index])=>({iid:'I037',kind:'hightideAnnual',field,index,caseIndex:1,delta})),
 {iid:'I037',kind:'hightideDrug',field:'successRate',groupIndex:2,caseIndex:1,delta:-.02},
 {iid:'I037',kind:'hightideDevelopment',groupIndex:2,index:3,caseIndex:1,delta:.01},
 ...[['FX',-.05],['didaParentFraction',-.02],['didaSpecialDividendHKDbn',.01],['didaAcceptedSharesBn',.01],['cashAnchor',-.1],['annualDebtInterest',.03],['extraBuybackHKDbn',.05],['normalDilution',.01],['dividend',.05],['PE',-2]].map(([field,delta])=>({iid:'I086',kind:'tongchengHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.05],['USShare',-.05],['distributionRate',-.05],['bankAnchor',.1]].map(([field,delta])=>({iid:'I020',kind:'dualityGlobal',field,caseIndex:1,delta})),
 ...[['issueGross',.1,2],['issuePx',-2,2],['RD',.1,3],['USRD',.05,3]].map(([field,delta,index])=>({iid:'I020',kind:'dualityAnnual',field,index,caseIndex:1,delta})),
 {iid:'I020',kind:'dualityAsset',field:'p',groupIndex:8,caseIndex:1,delta:-.02},
 {iid:'I020',kind:'dualityCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I020',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 ...[['FX',-.05],['vehicleDeliveriesM',-.02],['vehicleASPThousand',-10],['RD',.1],['capitalCash',.1],['debtPrincipalAnchor',.1],['treasuryReissueSharesBn',.01],['treasurySaleHKD',-2],['normalNewSharesBn',.01],['dividend',.05],['EVSales',-.1]].map(([field,delta])=>({iid:'I084',kind:'liautoHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.1],['restrictedReleaseAmount',-.05],['restrictedReleaseYear',1],['distributionRate',-.05],['rewardBudgetFactor',.02]].map(([field,delta])=>({iid:'I039',kind:'zaiGlobal',field,caseIndex:1,delta})),
 ...[['issueGross',.1,2],['issuePx',-2,2],['RD',.1,3],['employeeShares',.01,3]].map(([field,delta,index])=>({iid:'I039',kind:'zaiAnnual',field,index,caseIndex:1,delta})),
 {iid:'I039',kind:'zaiAsset',field:'p',groupIndex:7,caseIndex:1,delta:-.02},
 {iid:'I039',kind:'zaiCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I039',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 ...[['FX',-.05],['vehicleDeliveriesM',-.02],['coreRD',.1],['coreCapitalCash',.1],['debtAnchor',.1],['robotExternalPreferredCash',.1],['robotClaimYears',1],['robotRecourseWeight',.05],['normalNewSharesBn',.01],['dividend',.05],['EVSales',-.1]].map(([field,delta])=>({iid:'I085',kind:'xpengHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.05],['CNYperEUR',.1],['DRepurchaseEURperShare',.1],['startCash',-.1],['startBank',.1],['startShares',.01],['H1LeaseCashPayment',.01],['H1LeaseInterest',.01]].map(([field,delta])=>({iid:'I068',kind:'haierSmartGlobal',field,caseIndex:1,delta})),
 ...[['china',-1,1],['minority',.1,2],['leaseCashPayment',.1,1],['leaseInterest',.05,1],['knownDBuybackSharesBn',.001,0],['employeeNewShares',.01,2],['payout',.02,2]].map(([field,delta,index])=>({iid:'I068',kind:'haierSmartAnnual',field,index,caseIndex:1,delta})),
 {iid:'I068',kind:'assumption',field:'PE',horizon:'oneYear',caseIndex:1,delta:-1},
 {iid:'I068',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05},
 ...[['FX',-.05],['vehicleDeliveriesM',-.02],['RD',.1],['capitalCash',.1],['RNCIAnchor',.1],['postJuneRedeemableInflow',.1],['RNCIRollRate',.01],['remainingChinaBuybackCash',.1],['ChinaBuybackClaimReduction',.1],['powerExternalCash',.1],['powerNewExternalMinority',.02],['chipIncentiveMinority',.01],['normalNewSharesBn',.01],['dividend',.05],['EVSales',-.1]].map(([field,delta])=>({iid:'I088',kind:'nioHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.05],['startCash',-.1],['startProducts',-.1],['startBank',.1],['startShares',.01],['H1LeaseInterest',.01]].map(([field,delta])=>({iid:'I081',kind:'bydeGlobal',field,caseIndex:1,delta})),
 ...[['server',-1,1],['serverGM',-.02,1],['RD',.1,2],['leaseCash',.1,1],['leaseInterest',.01,1],['newEmployeeShares',.01,2],['payout',.02,2]].map(([field,delta,index])=>({iid:'I081',kind:'bydeAnnual',field,index,caseIndex:1,delta})),
 {iid:'I081',kind:'assumption',field:'PE',horizon:'oneYear',caseIndex:1,delta:-1},
 {iid:'I081',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05},
 ...[['FX',-.05],['startCash',-.1],['bankAnchor',.1],['financialRecovery',-.05],['PD1ConsiderationRate',.01],['CMGownership',-.05],['distributionRate',-.05],['distributionStart',1]].map(([field,delta])=>({iid:'I026',kind:'lepuGlobal',field,caseIndex:1,delta})),
 ...[['issueGross',.1,2],['issuePx',-.2,2],['RD',.1,3],['employeeShares',.01,3]].map(([field,delta,index])=>({iid:'I026',kind:'lepuAnnual',field,index,caseIndex:1,delta})),
 {iid:'I026',kind:'lepuAsset',field:'p',groupIndex:2,caseIndex:1,delta:-.02},
 {iid:'I026',kind:'lepuCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I026',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 ...[['FX',-.1],['enterpriseARRRecognition',-.05],['RDCloud',.01],['leaseCash',.01],['julyEquityNetHKD',-.1],['operatingReserve',.1],['futureAwardSharesM',1],['bondConversionPriceHKD',-5],['bondConvertFraction',.1],['EVSales',-1],['dividend',.01]].map(([field,delta])=>({iid:'I054',kind:'minimaxHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.05],['CNYperUSD',.1],['startBank',.1],['startRelated',.1],['knownInterimCashUSD',.01],['minimumCash',.01]].map(([field,delta])=>({iid:'I057',kind:'cgnGlobal',field,caseIndex:1,delta})),
 ...[['windTWh',-.1,1],['windTariffCNY',-.01,1],['bankRate',.001,1],['relatedRepay',.01,1],['maxEquityUSD',.01,1],['payout',.02,2],['employeeShares',.001,2]].map(([field,delta,index])=>({iid:'I057',kind:'cgnAnnual',field,index,caseIndex:1,delta})),
 {iid:'I057',kind:'assumption',field:'PE',horizon:'oneYear',caseIndex:1,delta:-1},
 {iid:'I057',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05},
 ...[['FX',-.05],['bond3Rate',.001],['bankRate',.001],['receivableRecovery',-.05],['distributionRate',-.05]].map(([field,delta])=>({iid:'I046',kind:'junshiGlobal',field,caseIndex:1,delta})),
 ...[['RD',.1,3],['bondPay',.1,3],['issueGross',.1,2],['employeeShares',.01,2]].map(([field,delta,index])=>({iid:'I046',kind:'junshiAnnual',field,index,caseIndex:1,delta})),
 {iid:'I046',kind:'junshiAsset',field:'p',groupIndex:1,caseIndex:1,delta:-.01},
 {iid:'I046',kind:'junshiCurve',index:3,caseIndex:0,delta:-.05},
 {iid:'I046',kind:'assumption',field:'marketRecognitionFactor',horizon:'oneYear',caseIndex:1,delta:-.1},
 ...[['FX',-.05],['ARRRecognition',-.05],['RDCompute',.01],['leaseCash',.01],['septemberBondNetUSD',-.1],['bondSettlementFactor',.01],['bondFullConversionSharesM',1],['bondConvertFraction',.1],['operatingReserve',.1],['futureAwardSharesM',1],['EVSales',-1],['dividend',.01]].map(([field,delta])=>({iid:'I055',kind:'zhipuHorizon',field,horizon:'oneYear',caseIndex:1,delta})),
 ...[['FX',-.05],['startLiquidity',-.1],['startShares',.01],['knownOptionCash',.01]].map(([field,delta])=>({iid:'I058',kind:'eastbuyGlobal',field,caseIndex:1,delta})),
 ...[['privateGMV',-.1,1],['SBC',.01,2],['ROUdep',.01,1],['leaseCash',.01,1],['optionShares',.001,1],['buybackCNY',.01,2],['payout',.02,2],['NCIProfit',.01,2]].map(([field,delta,index])=>({iid:'I058',kind:'eastbuyAnnual',field,index,caseIndex:1,delta})),
 {iid:'I058',kind:'assumption',field:'PE',horizon:'oneYear',caseIndex:1,delta:-1},
 {iid:'I058',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05}
];
allTests.push(...[['FX',-.05],['humanoidUnits',100],['humanoidASP',-.01],['centralRD',.1],['bankInterestFull',.01],['capitalCashExInterest',.1],['UqiOwnership',-.05],['FengOwnership',-.05],['FengNetCapital',.1],['futureIssuePriceHKD',-1],['trustToDeliverFraction',.05],['dividend',.01]].map(([field,delta])=>({iid:'I059',kind:'ubtechHorizon',field,horizon:'oneYear',caseIndex:1,delta})));
allTests.push(...[['FX',-.05],['inaccessibleLiquid',.1],['startPreferredMEA',.1],['startPreferredAmortized',.01],['startLP',.1],['portfolioRecovery',-.05],['minimumLiquid',.1]].map(([field,delta])=>({iid:'I089',kind:'sensetimeGlobal',field,caseIndex:1,delta})),...[['genRevenue',.1,1],['cashRD',.1,1],['newAwards',.01,2],['financeHKDPrice',-.05,2],['portfolioSale',-.05,3]].map(([field,delta,index])=>({iid:'I089',kind:'sensetimeAnnual',field,index,caseIndex:1,delta})),{iid:'I089',kind:'assumption',field:'PS',horizon:'oneYear',caseIndex:1,delta:-.1},{iid:'I089',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05});
allTests.push(...[['FX',-.05],['bankAnchor',.1],['distributionRate',-.05],['discount',.01],['pneumoCannibalRate',.05]].map(([field,delta])=>({iid:'I042',kind:'cansinoGlobal',field,caseIndex:1,delta})),...[['RD',.1,2],['issueGross',.1,1],['employeeShares',.01,1]].map(([field,delta,index])=>({iid:'I042',kind:'cansinoAnnual',field,index,caseIndex:1,delta})),{iid:'I042',kind:'cansinoAsset',field:'p',groupIndex:2,caseIndex:1,delta:-.05},{iid:'I042',kind:'cansinoCurve',index:3,caseIndex:0,delta:-.05},{iid:'I042',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05});
allTests.push(...[['FX',-.05],['fullRD',.1],['productASP',-1],['CARIADPaidUSD',.01],['bondConvertFraction',-.05],['bondPrincipalUSD',.01],['bondFullConversionSharesM',1],['futureAssociateInjection',.1],['futureIssuePriceHKD',-.1],['treasuryDeliverSharesM',1],['dividend',.01]].map(([field,delta])=>({iid:'I062',kind:'horizonHorizon',field,horizon:'oneYear',caseIndex:1,delta})));
allTests.push(...[['FX',-.05],['startCash',-.1],['startDebt',.1],['startLegalShares',.01]].map(([field,delta])=>({iid:'I032',kind:'grandPharmaGlobal',field,caseIndex:1,delta})),{iid:'I032',kind:'assumption',field:'PE',horizon:'oneYear',caseIndex:1,delta:-1});
allTests.push(...[['FX',-.05],['Y27combinedRatio',.02],['Y27normalYield',-.01],['Y27JVImpair',.1],['futureEquityNet',.1],['newAwardSharesM',1],['PB',-.1],['dividend',.01]].map(([field,delta])=>({iid:'I083',kind:'zhonganHorizon',field,horizon:'oneYear',caseIndex:1,delta})));
allTests.push(...[['FX',-.1],['CBNetCash',-.01],['CBPrincipal',.01],['CBConversionPrice',-1],['CBConversionFraction',.1],['knownOptions',.001]].map(([field,delta])=>({iid:'I008',kind:'insilicoGlobal',field,caseIndex:1,delta})),{iid:'I008',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05});
allTests.push(...[['FX',-.05],['startCash',-.1],['startBond',.1],['knownH2BuybackCNY',.01],['CBRedemptionFactor',.01],['preOptionExerciseCNY',.01]].map(([field,delta])=>({iid:'I027',kind:'xtalpiGlobal',field,caseIndex:1,delta})),{iid:'I027',kind:'xtalpiAnnual',field:'clinicalUnallocated',index:2,caseIndex:1,delta:.1},{iid:'I027',kind:'assumption',field:'marketRecognitionFactor',horizon:'yearEnd',caseIndex:1,delta:-.05});
for(const [iid,prefix,key]of [['I008','insilico','insilicoBridge'],['I027','xtalpi','xtalpiBridge']]){
 const model=models.find(m=>m.issuerId===iid);if(!model)continue;
 const groupIndex=model[key].assets.findIndex(a=>a.eligibleAtCutoff===1&&a.p[1]>0&&a.peak[1]>0);
 if(groupIndex<0)throw Error('No eligible modeled asset for rights/clinical sensitivity '+iid);
 allTests.push(...[['peak',-.001],['p',-.005],['netRate',-.01],['ownership',-.1]].map(([field,delta])=>({iid,kind:prefix+'Asset',field,groupIndex,caseIndex:1,delta})),{iid,kind:prefix+'Clinical',field:'clinical',groupIndex,index:2,caseIndex:1,delta:.001});
}
const focus=process.argv.find(x=>x.startsWith('--focus='))?.slice(8).split(',');
const tests=focus?allTests.filter(t=>focus.includes(t.iid)):allTests;
const sandbox=path.join(root,'qa/new_bridges_persistent_test_'+b.fingerprint+'_'+(focus??['all']).join('_'));await fs.mkdir(path.join(sandbox,'data'),{recursive:true});
for(const t of tests){const m=models.find(m=>m.issuerId===t.iid),item=manifest.find(x=>x.code===m.code&&Object.entries(t).filter(([k])=>!['iid','delta'].includes(k)).every(([k,v])=>x[k]===v));if(!item)throw Error('Missing edit '+JSON.stringify(t));const value=item.originalValue+t.delta;
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[value]];await fs.writeFile(path.join(sandbox,'data/workbook_overrides.json'),JSON.stringify({records:[{...item,value}]}));const clone=structuredClone(b.models);await applyWorkbookInputs(sandbox,clone,b.years);const changed=clone.find(x=>x.code===m.code),cases=['innocareCurve','everestCurve','ascentageCurve','dualityCurve','zaiCurve'].includes(t.kind)?[0,1,2]:[t.caseIndex];
 for(const c of (['lepuCurve','junshiCurve','cansinoCurve'].includes(t.kind)?[0,1,2]:cases)){selector.values=[[c+1]];recalculate();const snapshotRows=snap.getRange('A7:T'+(6+b.models.length*15)).values;for(const h of Object.keys(m.scenarios)){const v=calc(changed,h,c),r=ar(m,h);eq('Edited price '+t.field+'/'+h+'/'+c,r[11],v.price);eq('Persistent price '+t.field+'/'+h+'/'+c,r[11],changed.scenarios[h].cases[c].price);eq('Edited dividend '+t.field+'/'+h+'/'+c,r[12],changed.scenarios[h].cases[c].dividend);eq('Edited total '+t.field+'/'+h+'/'+c,r[14],changed.scenarios[h].cases[c].totalReturn);
 const changedOutput=Math.abs(v.price-m.scenarios[h].cases[c].price)>1e-7||Math.abs(v.dividend-m.scenarios[h].cases[c].dividend)>1e-7,stored=snapshotRows.find(r=>r[0]===m.code&&r[2]===b.labels[h]&&r[3]===['悲观','基准','乐观'][c]);if(changedOutput&&stored[19]!=='待刷新')throw Error('Changed output lacks stale mark '+JSON.stringify(t)+' '+h);}}
 wb.worksheets.getItem(item.sheet).getRange(item.cell).values=[[item.originalValue]];selector.values=[[2]];recalculate();console.log('Persistent edit '+t.iid+'/'+t.kind+'/'+(t.field??t.index)+' passed');
}
const restoredSnapshots=snap.getRange('A7:T'+(6+b.models.length*15)).values;
for(const m of models){const generic=manifest.filter(x=>x.code===m.code&&x.kind==='assumption'&&x.field!=='marketRecognitionFactor'&&!(m.issuerId==='I089'&&x.field==='PS')&&!(['I068','I081','I057','I058','I032'].includes(m.issuerId)&&x.field==='PE'));if(generic.length)throw Error('Duplicate generic edit path '+m.code);const rows=restoredSnapshots.filter(r=>r[0]===m.code);if(rows.some(r=>r[19]!=='已刷新'))throw Error('Restoration stale '+m.code);}
await fs.writeFile(path.join(root,focus?'qa/focused_bridges_persistent_qa_'+b.fingerprint+'_'+focus.join('_')+'.json':'qa/new_bridges_persistent_qa_'+b.fingerprint+'.json'),JSON.stringify({passed:true,fingerprint:b.fingerprint,checks:checks.length,edits:tests.length,editedIssuers:focus??models.map(m=>m.issuerId),issuers:models.map(m=>m.issuerId),sourceWorkbookUnchanged:true,scope:`All ${models.length} native bridge outputs match saved workbook; atomic persistent dispatch, FX, recognition once, stale markers and restoration are checked for selected issuers. Earlier input changes retain their fingerprinted independent evidence. Financial counterexamples remain in issuer QA.`},null,2));console.log(JSON.stringify({passed:true,checks:checks.length,edits:tests.length}));
