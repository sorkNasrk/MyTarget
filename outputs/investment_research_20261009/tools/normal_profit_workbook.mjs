import {normalConfigs,normalInputs} from './normal_profit_native.mjs';
export function buildNormalProfitWorkbook({setup,col,modelRows,build}){
 const meta=[],manifest=[];
 for(const[iid,cfg]of Object.entries(normalConfigs)){
  const inputs=[],outputs=[],local=[];
  for(const x of modelRows.filter(x=>x.m.issuerId===iid)){
   const ar=7+inputs.length,r=7+outputs.length;inputs.push([x.m.code,x.sc.label,'活动输入',...cfg.fields.map(()=>null)]);for(let c=0;c<3;c++){const v=normalInputs(x.m,x.h,c);inputs.push([x.m.code,x.sc.label,['悲观','基准','乐观'][c],...cfg.fields.map(f=>v[f])]);}outputs.push([x.m.code,x.sc.label,...Array(10).fill(null)]);local.push({...x,assumptionRow:x.ar,ar,r,cfg});
  }
  if(!local.length)continue;
  const an=cfg.prefix+'经营假设',on=cfg.prefix+'经营桥',a=setup(an,'正常盈利原子输入 '+cfg.currency+'十亿 股数十亿 比率小数',['代码','期限','输入层',...cfg.labels],inputs),out=setup(on,'正常经营盈利与税后归属 '+cfg.currency+'十亿 不加入一次性收益',['代码','期限','收入','毛利','正常经营利润','正常税前基数','正常税额','归属正常利润','经济股数十亿','EPS '+cfg.currency,'PE倍','目标价本币'],outputs);
  for(const x of local){const{ar,r}=x,v=f=>`'${an}'!${col(3+cfg.fields.indexOf(f))}${ar}`;for(let j=0;j<cfg.fields.length;j++)a.getRange(col(3+j)+ar).formulas=[[`=CHOOSE('假设'!$B$3,${[1,2,3].map(c=>col(3+j)+(ar+c)).join(',')})`]];
   let f;if(cfg.regionalAtomic){f={C:`=${v('CNRevenue')}+${v('globalRevenue')}`,D:`=C${r}-${v('CNCost')}-${v('globalCost')}`,E:`=D${r}-${['selling','admin','RD','creditLoss'].map(v).join('-')}+${['otherIncome','FV','FX','disposal'].map(v).join('+')}-${v('otherExpenses')}`,F:`=E${r}+${v('financeIncome')}-${v('financeCost')}+${v('equityMethod')}`,G:`=MAX(0,F${r}-${v('equityMethod')})*${v('taxRate')}+${v('taxAdjustment')}`,H:`=F${r}-G${r}-${v('minority')}`};}
   else if(cfg.atomicSegments){f={C:`=${cfg.atomicSegments.map(k=>v(k+'Revenue')).join('+')}`,D:`=C${r}-${cfg.atomicSegments.map(k=>v(k+'Cost')).join('-')}`,E:`=D${r}-${['businessTaxes','selling','admin','RD','finance'].map(v).join('-')}+${['otherIncome','equityMethod','investmentOther'].map(v).join('+')}-${v('creditLoss')}-${v('assetLoss')}+${v('FV')}+${v('disposal')}`,F:`=E${r}+${v('nonopIn')}-${v('nonopOut')}`,G:`=MAX(0,F${r}-${v('equityMethod')})*${v('taxRate')}+${v('taxAdjustment')}`,H:`=F${r}-G${r}-${v('minority')}`};}
   else if(cfg.segments){f={C:`=${cfg.segments.map(v).join('+')}`,D:`=${cfg.segments.map(k=>v(k)+'*'+v(k+'Gross')).join('+')}`,E:`=D${r}-${['RD','selling','admin'].map(v).join('-')}`,F:`=E${r}`,G:`=E${r}*${v('taxRate')}`,H:`=E${r}-G${r}+${v('afterTaxNet')}`};}
   else if(cfg.equityMethodTax)f={C:`=${v('direct')}+${v('promotion')}`,D:`=C${r}-${v('cost')}`,E:`=D${r}-${['selling','admin','RD'].map(v).join('-')}+${v('otherIncome')}-${v('impairment')}`,F:`=E${r}-${v('finance')}+${v('associate')}+${v('JV')}`,G:`=MAX(0,F${r}-${v('associate')}-${v('JV')})*${v('taxRate')}+${v('taxAdjustment')}`,H:`=F${r}-G${r}-${v('minority')}`};
   else f={C:`=${['nonclinical','clinical','modelSupply'].map(v).join('+')}`,D:`=C${r}-${['serviceCost','clinicalCost','modelCost'].map(v).join('-')}`,E:`=D${r}-${['taxes','selling','admin','RD'].map(v).join('-')}+${v('otherIncome')}+${v('normalInvestment')}-${v('creditLoss')}-${v('assetLoss')}`,F:`=E${r}-${v('finance')}`,G:`=MAX(0,F${r})*${v('taxRate')}+${v('taxAdjustment')}`,H:`=F${r}-G${r}-${v('minority')}`};
   Object.assign(f,{I:`=${v('shares')}`,J:cfg.epsDecimals==null?`=H${r}/I${r}`:`=ROUND(H${r}/I${r},${cfg.epsDecimals})`,K:`='假设'!F${x.assumptionRow}`,L:`=J${r}*K${r}*'假设'!G${x.assumptionRow}`});for(const[k,ff]of Object.entries(f))out.getRange(k+r).formulas=[[ff]];
   build.getRange('E'+x.br).values=[[cfg.prefix+'正常盈利桥']];for(const[k,ff]of Object.entries({F:`='${on}'!C${r}`,G:`='${on}'!H${r}/'${on}'!C${r}`,H:`='${on}'!I${r}`,I:`='${on}'!J${r}`,L:`='${on}'!L${r}`}))build.getRange(k+x.br).formulas=[[ff]];
   for(let c=0;c<3;c++)for(let j=0;j<cfg.fields.length;j++){const field=cfg.fields[j];manifest.push({x,sheet:an,cell:col(3+j)+(ar+c+1),kind:'normalProfitPrimitive',field,caseIndex:c,...(/Gross$|taxRate/.test(field)?{min:0,max:1}:field==='shares'?{min:.000001}:{})});}
  }
  a.getRange('D:V').setNumberFormat('0.000');out.getRange('C:J').setNumberFormat('0.000');out.getRange('K:L').setNumberFormat('0.00');for(let j=0;j<cfg.fields.length;j++)if(/Gross$|taxRate/.test(cfg.fields[j]))a.getRange(col(3+j)+':'+col(3+j)).setNumberFormat('0.00%');meta.push(...local);
 }
 return{meta,manifest,signatures(x,c){const p=meta.find(p=>p.m===x.m&&p.h===x.h);return p?p.cfg.fields.map((_,j)=>`'${p.cfg.prefix}经营假设'!${col(3+j)}${p.ar+c+1}`):[];}};
}
