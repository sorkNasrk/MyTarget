import {simcereCases,simcereFields,simcereLabels,simcereGlobalFields,simcereGlobalLabels,simcereDomesticFields,simcereRoyaltyFields} from './simcere_native.mjs';
export const simcereSheets=['先声资金假设','先声年度假设','先声新药假设','先声风险收入桥','先声年度经营桥'];
export function buildSimcereWorkbook({b,sh,setup,col,modelRows,build}){
 const meta=[],globalRows=[],annualRows=[],assetRows=[],riskRows=[],outputRows=[],manifest=[];
 for(const m of b.models.filter(m=>m.simcereBridge)){
  const bridge=m.simcereBridge,gr=7+globalRows.length;
  globalRows.push([m.code,'活动输入',...simcereGlobalFields.map(()=>null)]);
  for(let c=0;c<3;c++)globalRows.push([m.code,['悲观','基准','乐观'][c],...simcereGlobalFields.map(f=>bridge.globals[c][f])]);
  const p={m,gr,years:[],assets:[]};
  for(const [kind,list]of [['simcereDomestic',bridge.domestic],['simcereRoyalty',bridge.royalty]])for(let groupIndex=0;groupIndex<list.length;groupIndex++){
   const asset=list[groupIndex],ar=7+assetRows.length,isRoyalty=kind==='simcereRoyalty';
   assetRows.push([m.code,isRoyalty?'海外版税':'国内新药',asset.id,asset.segment,asset.stage,'活动输入',...Array(6).fill(null),asset.rights]);
   for(let c=0;c<3;c++)assetRows.push([m.code,isRoyalty?'海外版税':'国内新药',asset.id,asset.segment,asset.stage,['悲观','基准','乐观'][c],asset.start[c],(isRoyalty?asset.peakUSD:asset.peak)[c],asset.success[c],isRoyalty?1:asset.GM[c],isRoyalty?asset.royalty[c]:1,isRoyalty?(Array.isArray(asset.costRate)?asset.costRate[c]:asset.costRate):0,asset.rights]);
   const a={ar,kind,groupIndex,asset,flows:[]};
   for(let i=0;i<bridge.years.length;i++){const r=7+riskRows.length;riskRows.push([m.code,isRoyalty?'海外版税':'国内新药',asset.id,asset.segment,bridge.years[i],...Array(13).fill(null)]);a.flows.push({i,r});}
   p.assets.push(a);
  }
  for(let i=0;i<bridge.years.length;i++){const ar=7+annualRows.length,r=7+outputRows.length;annualRows.push([m.code,bridge.years[i],'活动输入',...simcereFields.map(()=>null)]);for(let c=0;c<3;c++)annualRows.push([m.code,bridge.years[i],['悲观','基准','乐观'][c],...simcereFields.map(f=>bridge.inputs[simcereCases[c]][f][i])]);outputRows.push([m.code,bridge.years[i],...Array(28).fill(null)]);p.years.push({i,ar,r});}
  meta.push(p);
 }
 const g=setup('先声资金假设','先声固定锚与融资分支 CNY十亿 比率小数',['代码','输入层',...simcereGlobalLabels],globalRows);
 const a=setup('先声年度假设','先声年度运营与资金假设 CNY十亿 股数十亿',['代码','年度','输入层',...simcereLabels],annualRows);
 const pa=setup('先声新药假设','临床、上市与商业化假设 最高收入单位由类型区分',['代码','现金流类型','资产','治疗领域','截止日临床阶段','输入层','首个收入年度','高峰收入 国内CNY海外USD十亿','临床商业成功判断','国内毛利率','海外版税率','持续管理成本比例','权利范围'],assetRows);
 const risk=setup('先声风险收入桥','临床风险调整收入 国内产品与海外版税互斥权利',['代码','类型','资产','领域','年度','收入起始年','商业化年龄','收入爬坡','名义高峰十亿','名义收入十亿','临床商业判断','版税率 国内为1','币种转CNY','毛利率','持续管理成本率','风险收入CNY十亿','风险毛利CNY十亿','原币'],riskRows);
 const out=setup('先声年度经营桥','正常经营盈利与现金滚动 PE不再加现金或减债',['代码','年度','正常收入','正常毛利','肿瘤毛利','肿瘤分配费用','肿瘤税前贡献','正常税前盈利','税率','合并正常盈利','肿瘤经济母份额','肿瘤少数贡献','归母正常盈利','摊薄股数','正常EPS CNY','核心经营现金','期初现金','剩余经营现金','剩余资本开支','剩余许可购买','租赁本金','Roche净现金','所选里程碑净现金','分红现金','回购现金','现金赎回','银行净融资','期末现金','银行债','未解除赎回负债'],outputRows);
 for(const p of meta){
  const ref=f=>`'先声资金假设'!${col(2+simcereGlobalFields.indexOf(f))}${p.gr}`;
  for(let j=0;j<simcereGlobalFields.length;j++)g.getRange(col(2+j)+p.gr).formulas=[[`=CHOOSE('假设'!$B$3,${col(2+j)}${p.gr+1},${col(2+j)}${p.gr+2},${col(2+j)}${p.gr+3})`]];
  for(const asset of p.assets){
   const ar=asset.ar,royalty=asset.kind==='simcereRoyalty';
   for(let j=6;j<12;j++)pa.getRange(col(j)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(j)}${ar+1},${col(j)}${ar+2},${col(j)}${ar+3})`]];
   for(const flow of asset.flows){const r=flow.r,rr=k=>`'先声新药假设'!${k}${ar}`;
    // Ramp values are native source assumptions; editing launch/peak/success is supported.
    const ramp=`IF(G${r}<0,0,IF(G${r}<${p.m.simcereBridge.ramp.length},CHOOSE(G${r}+1,${p.m.simcereBridge.ramp.join(',')}),1))`;
    const f={F:`=${rr('G')}`,G:`=E${r}-F${r}`,H:`=${ramp}`,I:`=${rr('H')}`,J:`=H${r}*I${r}`,K:`=${rr('I')}`,L:`=${rr('K')}`,M:royalty?`=${ref('CNYperUSD')}`:'=1',N:`=${rr('J')}`,O:`=${rr('L')}`,P:`=J${r}*K${r}*L${r}*M${r}`,Q:`=P${r}*N${r}*(1-O${r})`};for(const[k,ff]of Object.entries(f))risk.getRange(k+r).formulas=[[ff]];risk.getRange('R'+r).values=[[royalty?'USD':'CNY']];
   }
  }
  for(const y of p.years){
   const {ar,r,i}=y,v=f=>`'先声年度假设'!${col(3+simcereFields.indexOf(f))}${ar}`;
   for(let j=0;j<simcereFields.length;j++)a.getRange(col(3+j)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(3+j)}${ar+1},${col(3+j)}${ar+2},${col(3+j)}${ar+3})`]];
   const riskSum=(column,segment)=>{const rows=p.assets.filter(x=>!segment||x.asset.segment===segment).map(x=>`'先声风险收入桥'!${column}${x.flows[i].r}`);return rows.length?rows.join('+'):'0';};
   const f={C:`=${['neuro','auto','onc','other'].map(v).join('+')}+${riskSum('P')}`,D:`=${['neuro','auto','onc','other'].map(s=>`${v(s)}*${ref(s+'GM')}`).join('+')}+${riskSum('Q')}`,E:`=${v('onc')}*${ref('oncGM')}+${riskSum('Q','onc')}`,F:`=${v('selling')}*${ref('oncSellingFraction')}+${v('admin')}*${ref('oncAdminFraction')}+${v('rd')}*${ref('oncRDFraction')}+${v('impairment')}*${ref('oncImpairmentFraction')}`,G:`=E${r}-F${r}`,H:`=D${r}-${['selling','admin','rd','impairment','interest','redemptionInterest'].map(v).join('-')}`,I:`=${ref('tax')}`,J:`=H${r}*(1-I${r})`,K:`=IF(AND(${ref('redemptionFlag')}=1,B${r}>=${ref('redemptionYear')}),${ref('postRedemptionParentShare')},${v('parentShare')})`,L:`=(1-K${r})*G${r}*(1-I${r})`,M:`=J${r}-L${r}`,N:`=${v('shares')}`,O:`=MAX(0,M${r})/N${r}`,P:`=J${r}+${v('DA')}+${v('SBC')}-${v('NWC')}`,Q:i===0?`=${ref('startCash')}`:`=AB${p.years[i-1].r}`,R:i===0?`=P${r}*${ref('H2CoreOCFFraction')}`:`=P${r}`,S:i===0?`=MAX(0,${v('capex')}-${ref('H1Capex')})`:`=${v('capex')}`,T:i===0?`=MAX(0,${v('licensePurchase')}-${ref('H1LicensePurchase')})`:`=${v('licensePurchase')}`,U:`=${ref('annualLease')}`,V:i===0?`=${ref('RocheGrossUSD')}*${ref('CNYperUSD')}*${ref('RocheNetFactor')}`:'=0',W:`=${v('milestoneCash')}*${ref('milestoneNetFactor')}`,X:i===0?`=${ref('firstDividendCash')}`:`='先声年度假设'!${col(3+simcereFields.indexOf('dividend'))}${p.years[i-1].ar}*N${r}`,Y:`=${v('buyback')}`,Z:`=IF(AND(${ref('redemptionFlag')}=1,B${r}=${ref('redemptionYear')}),${ref('redemptionCash')},0)`,AA:`=${v('bankFunding')}`,AB:`=Q${r}+R${r}-S${r}-T${r}-U${r}+V${r}+W${r}-X${r}-Y${r}-Z${r}+AA${r}`,AC:i===0?`=${ref('startBank')}+AA${r}`:`=AC${p.years[i-1].r}+AA${r}`,AD:`=IF(B${r}<${ref('redemptionYear')},${ref('initialRedemptionLiability')},0)`};
   for(const[k,ff]of Object.entries(f))out.getRange(k+r).formulas=[[ff]];
  }
  for(const x of modelRows.filter(x=>x.m===p.m)){
   const y=p.years.find(y=>p.m.simcereBridge.years[y.i]===x.sc.earningsYear);if(!y)throw Error('Simcere workbook missing earnings year');
   build.getRange('E'+x.br).values=[['先声年度盈利桥']];for(const[k,s]of Object.entries({F:'C',H:'N',I:'O'}))build.getRange(k+x.br).formulas=[[`='先声年度经营桥'!${s}${y.r}`]];
   build.getRange('G'+x.br).formulas=[[`='先声年度经营桥'!M${y.r}/'先声年度经营桥'!C${y.r}`]];
   const n={yearEnd:0,halfYear:0,oneYear:1,threeYear:3,fiveYear:5}[x.h],refs=p.years.slice(0,n).map(y=>`'先声年度假设'!${col(3+simcereFields.indexOf('dividend'))}${y.ar}`);build.getRange('M'+x.br).formulas=[[n?`=(${refs.join('+')})*K${x.br}`:'=0']];
  }
  const x=modelRows.find(x=>x.m===p.m&&x.h==='yearEnd');
  for(let c=0;c<3;c++){
   for(let j=0;j<simcereGlobalFields.length;j++){const field=simcereGlobalFields[j];manifest.push({x,sheet:'先声资金假设',cell:col(2+j)+(p.gr+c+1),kind:'simcereGlobal',field,caseIndex:c,...(field==='redemptionFlag'?{min:0,max:1,integer:true}:field==='redemptionYear'?{min:2026,integer:true}:['neuroGM','autoGM','oncGM','otherGM','tax','postRedemptionParentShare','oncSellingFraction','oncAdminFraction','oncRDFraction','oncImpairmentFraction','H2CoreOCFFraction','RocheNetFactor','milestoneNetFactor'].includes(field)?{min:0,max:1}:{min:0})});}
   for(const y of p.years)for(let j=0;j<simcereFields.length;j++){const field=simcereFields[j];manifest.push({x,sheet:'先声年度假设',cell:col(3+j)+(y.ar+c+1),kind:'simcereAnnual',field,caseIndex:c,index:y.i,...(field==='parentShare'?{min:0,max:1}:field==='shares'?{min:.000001}:field==='bankFunding'?{}:{min:0})});}
   for(const asset of p.assets){const fields=asset.kind==='simcereDomestic'?simcereDomesticFields:simcereRoyaltyFields,columns=asset.kind==='simcereDomestic'?['G','H','I','J']:['G','H','I','K','L'];for(let j=0;j<fields.length;j++){const field=fields[j];manifest.push({x,sheet:'先声新药假设',cell:columns[j]+(asset.ar+c+1),kind:asset.kind,field,caseIndex:c,groupIndex:asset.groupIndex,...(field==='start'?{min:2026,integer:true}:['success','GM','royalty','costRate'].includes(field)?{min:0,max:1}:{min:0})});}}
  }
 }
 for(const s of [g,a,pa,risk,out]){s.getRange('A2').format.font.size=12;s.getRange('C:AD').setNumberFormat('0.000');}pa.getRange('E:E').format.columnWidth=46;pa.getRange('M:M').format.columnWidth=70;pa.getRange('G:G').setNumberFormat('0');risk.getRange('E:G').setNumberFormat('0');out.getRange('B:B').setNumberFormat('0');a.getRange('B:B').setNumberFormat('0');
 return{meta,manifest,signatures(x,c){const p=meta.find(p=>p.m===x.m);if(!p)return[];return [...simcereGlobalFields.map((_,j)=>`'先声资金假设'!${col(2+j)}${p.gr+c+1}`),...p.years.flatMap(y=>simcereFields.map((_,j)=>`'先声年度假设'!${col(3+j)}${y.ar+c+1}`)),...p.assets.flatMap(a=>(a.kind==='simcereDomestic'?['G','H','I','J']:['G','H','I','K','L']).map(k=>`'先声新药假设'!${k}${a.ar+c+1}`))];}};
}
