import {segmentFields,segmentLabels,segmentGlobalFields,segmentGlobalLabels} from './pharmaron_native.mjs';
const cases=['bear','base','bull'];
export function buildSegmentWorkbook({b,wb,sh,setup,col,modelRows,build,a}){
 const meta=[],annual=[],globals=[],cash=[],manifest=[];
 for(const m of b.models.filter(m=>m.segmentCashBridge)){
  const native=m.segmentCashBridge,grow=7+globals.length;
  globals.push([m.code,'活动输入',...segmentGlobalFields.map(()=>null)]);
  for(let c=0;c<3;c++)globals.push([m.code,['悲观','基准','乐观'][c],...segmentGlobalFields.map(f=>native.globals[c][f])]);
  const years=[];
  for(let i=0;i<native.years.length;i++){
   const ar=7+annual.length,rr=7+cash.length;
   annual.push([m.code,native.years[i],'活动输入',...segmentFields.map(()=>null)]);
   for(let c=0;c<3;c++)annual.push([m.code,native.years[i],['悲观','基准','乐观'][c],...segmentFields.map(f=>native.inputs[cases[c]][f][i])]);
   cash.push([m.code,native.years[i],...Array(24).fill(null)]);years.push({i,ar,rr});
  }
  meta.push({m,grow,years});
 }
 const g=setup('转债资金假设','经营资金桥固定锚及转债互斥结算 CNY十亿 股数十亿',['代码','输入层',...segmentGlobalLabels],globals);
 const ai=setup('年度分部假设','分部经营与年度资金假设 CNY十亿 比率小数 股数十亿',['代码','年度','输入层',...segmentLabels],annual);
 const out=setup('年度经营资金桥','年度盈利与资金滚动 现金债验证与PE估值分开',['代码','年度','合计收入','毛利','税前正常利润','合并正常利润','归母正常利润','摊薄股数','EPS CNY','年度经营现金','FCF租赁前','期初现金','剩余经营现金','剩余资本开支','租赁本金','股权投资','分红现金','转债净募资','转债现金偿还','银行净融资','期末现金','银行债','未偿转债','净债','转股增量股数','结算状态'],cash);
 for(const p of meta){
  const gr=p.grow,ref=f=>`'转债资金假设'!${col(2+segmentGlobalFields.indexOf(f))}${gr}`;
  for(let j=0;j<segmentGlobalFields.length;j++)g.getRange(col(2+j)+gr).formulas=[[`=CHOOSE('假设'!$B$3,${col(2+j)}${gr+1},${col(2+j)}${gr+2},${col(2+j)}${gr+3})`]];
  for(const y of p.years){
   const {ar,rr:r,i}=y,v=f=>`'年度分部假设'!${col(3+segmentFields.indexOf(f))}${ar}`;
   for(let j=0;j<segmentFields.length;j++)ai.getRange(col(3+j)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(3+j)}${ar+1},${col(3+j)}${ar+2},${col(3+j)}${ar+3})`]];
   const f={C:`=${v('lab')}+${v('cdmo')}+${v('clinical')}+${ref('otherRevenue')}`,D:`=${v('lab')}*${v('labGM')}+${v('cdmo')}*${v('cdmoGM')}+${v('clinical')}*${v('clinicalGM')}+${ref('otherRevenue')}*${ref('otherGM')}`,E:`=D${r}-${['selling','admin','rd','impairment','fxloss','bankInterest'].map(v).join('-')}`,F:`=E${r}*(1-${v('tax')})`,G:`=F${r}+${v('minorityAdd')}`,H:`=${v('normalShares')}+Y${r}`,I:`=G${r}/H${r}`,J:`=F${r}+${v('DandA')}+${v('SBCcashAdj')}-${v('nwcCash')}`,K:`=J${r}-${v('capex')}`,L:i===0?`=${ref('startCash')}`:`=U${p.years[i-1].rr}`,M:i===0?`=J${r}-(${ref('H1OCF')}-${ref('H1Interest')})`:`=J${r}`,N:i===0?`=${v('capex')}-${ref('H1Capex')}`:`=${v('capex')}`,O:`=${ref(i===0?'firstLease':'annualLease')}`,P:i===0?`=${v('investment')}-${ref('H1Investment')}`:`=${v('investment')}`,Q:i===0?`=${ref('declaredDividendCash')}`:`='年度分部假设'!${col(3+segmentFields.indexOf('annualDividend'))}${p.years[i-1].ar}*H${r}`,R:i===0?`=${ref('cbNetProceeds')}`:'=0',S:`=IF(AND(B${r}=2027,${ref('convert')}=0),${ref('cbFace')},0)`,T:`=${v('bankNetFunding')}`,U:`=L${r}+M${r}-N${r}-O${r}-P${r}-Q${r}+R${r}-S${r}+T${r}`,V:i===0?`=${ref('startBank')}+T${r}`:`=V${p.years[i-1].rr}+T${r}`,W:`=IF(B${r}=2026,${ref('cbFace')},0)`,X:`=V${r}+W${r}-U${r}`,Y:`=IF(AND(B${r}>=2027,${ref('convert')}=1),${ref('cbShares')},0)`,Z:`=IF(B${r}=2026,"尚未到期",IF(${ref('convert')}=1,"转股不偿现金","现金偿还不转股"))`};
   for(const[k,ff]of Object.entries(f))out.getRange(k+r).formulas=[[ff]];
  }
  for(const x of modelRows.filter(x=>x.m===p.m)){
   const year=p.years.find(y=>p.m.segmentCashBridge.years[y.i]===x.sc.earningsYear);if(!year)throw Error('Segment workbook earnings year missing');
   build.getRange('E'+x.br).values=[['年度分部盈利桥']];
   for(const[k,s]of Object.entries({F:'C',H:'H',I:'I'}))build.getRange(k+x.br).formulas=[[`='年度经营资金桥'!${s}${year.rr}`]];
   build.getRange('G'+x.br).formulas=[[`='年度经营资金桥'!G${year.rr}/'年度经营资金桥'!C${year.rr}`]];
   const n={yearEnd:0,halfYear:0,oneYear:1,threeYear:3,fiveYear:5}[x.h],divRefs=p.years.slice(0,n).map(y=>`'年度分部假设'!${col(3+segmentFields.indexOf('annualDividend'))}${y.ar}`);
   build.getRange('M'+x.br).formulas=[[n?`=(${divRefs.join('+')})*K${x.br}`:'=0']];
  }
  const x=modelRows.find(x=>x.m===p.m&&x.h==='yearEnd');
  for(let c=0;c<3;c++){
   for(let j=0;j<segmentGlobalFields.length;j++)manifest.push({x,sheet:'转债资金假设',cell:col(2+j)+(gr+c+1),kind:'segmentGlobal',field:segmentGlobalFields[j],caseIndex:c,...(segmentGlobalFields[j]==='convert'?{min:0,max:1,integer:true}:{})});
   for(const y of p.years)for(let j=0;j<segmentFields.length;j++)manifest.push({x,sheet:'年度分部假设',cell:col(3+j)+(y.ar+c+1),kind:'segmentAnnual',field:segmentFields[j],caseIndex:c,index:y.i});
  }
 }
 out.getRange('C:Y').setNumberFormat('0.000');ai.getRange('D:Y').setNumberFormat('0.000');g.getRange('C:Q').setNumberFormat('0.000');
 for(const s of [g,ai,out])s.getRange('A2').format.font.size=12;
 g.getRange('B:B').format.columnWidth=14;out.getRange('Z:Z').format.columnWidth=26;
 return {meta,manifest,signatures(x,c){const p=meta.find(p=>p.m===x.m);if(!p)return [];return [...segmentGlobalFields.map((_,j)=>`'转债资金假设'!${col(2+j)}${p.grow+c+1}`),...p.years.flatMap(y=>segmentFields.map((_,j)=>`'年度分部假设'!${col(3+j)}${y.ar+c+1}`))];}};
}
