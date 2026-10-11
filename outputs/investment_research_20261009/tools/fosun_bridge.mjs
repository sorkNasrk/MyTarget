export const fosunFields=['pharma','devices','services','other','license','cost','taxes','selling','admin','RD','finance','otherIncome','associate','otherInvestment','creditLoss','assetLoss','taxRate','minority','shares'];
export const fosunLabels=['制药外部收入','器械诊断收入','医疗服务收入','其他收入','许可收入子集不加总','销售成本','税金附加','销售费用','行政费用','费用研发','净融资费用','正常其他收益','联营合营贡献','正常其他投资贡献','信用损失','资产损失','税率','少数损益','经济摊薄股数'];
export function calculateFosun(m,h,c){const r=m.nativeInputs[h].rows[c],revenue=r.pharma+r.devices+r.services+r.other,operating=revenue-r.cost-r.taxes-r.selling-r.admin-r.RD+r.otherIncome+r.associate+r.otherInvestment-r.creditLoss-r.assetLoss,pretax=operating-r.finance,total=pretax*(1-r.taxRate),parent=total-r.minority,eps=parent/r.shares;return{revenue,operating,pretax,total,parent,eps,price:eps*m.scenarios[h].cases[c].PE*(m.scenarios[h].fxCases?.[c]??m.fxValue)};}
export function initializeFosun(m){if(m.issuerId!=='I043'||!m.nativeInputs)return false;m.fosunBridge=true;for(const[h,s]of Object.entries(m.scenarios))for(let c=0;c<3;c++){const v=calculateFosun(m,h,c);if(Math.abs(v.eps-s.cases[c].eps)>1e-9||Math.abs(v.price-s.cases[c].price)>1e-9)throw Error('Fosun native adapter mismatch '+h+' '+c);}return true;}
export function buildFosunWorkbook({setup,col,modelRows,build}){
 const meta=[],inputs=[],outputs=[],manifest=[];
 for(const x of modelRows.filter(x=>x.m.fosunBridge)){
  const ar=7+inputs.length,r=7+outputs.length;inputs.push([x.m.code,x.sc.label,'活动输入',...fosunFields.map(()=>null)]);for(let c=0;c<3;c++)inputs.push([x.m.code,x.sc.label,['悲观','基准','乐观'][c],...fosunFields.map(f=>x.m.nativeInputs[x.h].rows[c][f])]);outputs.push([x.m.code,x.sc.label,...Array(10).fill(null)]);meta.push({...x,ar,r});
 }
 const a=setup('复星经营假设','复星正常利润假设 CNY十亿 股数十亿',['代码','期限','输入层',...fosunLabels],inputs);
 const out=setup('复星经营桥','复星分部收入、费用、联营与少数归属',['代码','期限','收入','毛利','核心费用后经营利润','正常税前盈利','税率','合并正常利润','少数损益','归母正常利润','摊薄股数','EPS CNY'],outputs);
 for(const x of meta){const {ar,r}=x,v=f=>`'复星经营假设'!${col(3+fosunFields.indexOf(f))}${ar}`;for(let j=0;j<fosunFields.length;j++)a.getRange(col(3+j)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${col(3+j)}${ar+1},${col(3+j)}${ar+2},${col(3+j)}${ar+3})`]];
  const f={C:`=${['pharma','devices','services','other'].map(v).join('+')}`,D:`=C${r}-${v('cost')}`,E:`=D${r}-${['taxes','selling','admin','RD'].map(v).join('-')}+${['otherIncome','associate','otherInvestment'].map(v).join('+')}-${v('creditLoss')}-${v('assetLoss')}`,F:`=E${r}-${v('finance')}`,G:`=${v('taxRate')}`,H:`=F${r}*(1-G${r})`,I:`=${v('minority')}`,J:`=H${r}-I${r}`,K:`=${v('shares')}`,L:`=J${r}/K${r}`};for(const[k,ff]of Object.entries(f))out.getRange(k+r).formulas=[[ff]];build.getRange('E'+x.br).values=[['复星正常利润桥']];for(const[k,s]of Object.entries({F:'C',H:'K',I:'L'}))build.getRange(k+x.br).formulas=[[`='复星经营桥'!${s}${r}`]];build.getRange('G'+x.br).formulas=[[`='复星经营桥'!J${r}/'复星经营桥'!C${r}`]];
  for(let c=0;c<3;c++)for(let j=0;j<fosunFields.length;j++){const field=fosunFields[j];manifest.push({x,sheet:'复星经营假设',cell:col(3+j)+(ar+c+1),kind:'fosunPrimitive',field,caseIndex:c,...(field==='taxRate'?{min:0,max:1}:field==='shares'?{min:.000001}:{})});}
 }
 a.getRange('D:V').setNumberFormat('0.000');out.getRange('C:L').setNumberFormat('0.000');a.getRange('T:T').setNumberFormat('0.00%');out.getRange('G:G').setNumberFormat('0.00%');
 return{meta,manifest,signatures(x,c){const p=meta.find(p=>p.m===x.m&&p.h===x.h);return p?fosunFields.map((_,j)=>`'复星经营假设'!${col(3+j)}${p.ar+c+1}`):[];}};
}
