// Emit an apply_patch document; root applies it with the editing tool.
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const changes=new Map();
for(const m of b.models){
 const s=m.scenarios.oneYear,rebase=s.calendarRebase;if(!rebase)continue;
 const audit=JSON.parse(await fs.readFile(path.join(root,'qa/calendar_rebase_audit.json'),'utf8')).records.find(x=>x.code===m.code&&x.horizon==='oneYear');
 const replacements=new Map([['2027-10-08','2027-10-07'],['2027-10-09，休市取此前交易日','2027-10-07（名义2027-10-09）'],['2027年10月8日','2027年10月7日'],['已前移十月八日','已按重阳节假期与周末前移十月七日'],['此前10月8日','此前10月7日'],['十月八日当天','十月七日当天']]);
 if(audit){
  for(let c=0;c<3;c++)for(let digits=2;digits<=4;digits++){
   const oldReturn=100*(audit.oldPrices[c]/m.price-1),newReturn=100*s.cases[c].priceReturn;
   const oldTotal=100*((audit.oldPrices[c]+s.cases[c].dividend)/m.price-1),newTotal=100*s.cases[c].totalReturn;
   for(const [a,z]of [[oldReturn,newReturn],[oldTotal,newTotal]])if(a.toFixed(digits)!==z.toFixed(digits))replacements.set(a.toFixed(digits)+'%',z.toFixed(digits)+'%');
  }
  const oldExpected=audit.oldPrices[0]*.25+audit.oldPrices[1]*.5+audit.oldPrices[2]*.25;
  for(let digits=2;digits<=4;digits++)if(oldExpected.toFixed(digits)!==s.expectedPrice.toFixed(digits))replacements.set(oldExpected.toFixed(digits),s.expectedPrice.toFixed(digits));
 }
 if(audit)for(let c=0;c<3;c++)for(let digits=2;digits<=6;digits++){const old=audit.oldPrices[c].toFixed(digits),next=s.cases[c].price.toFixed(digits);if(old!==next)replacements.set(old,next);}
 const file=path.join(root,m.deepResearchFile),text=changes.get(file)??await fs.readFile(file,'utf8');
 const lines=text.split(/\r?\n/),out=lines.map(line=>{if(!/一年|2027|目标现金按年度/.test(line))return line;if(line.startsWith('|一年2027-10-09'))line=line.replace('|一年2027-10-09','|一年2027-10-07');for(const[a,z]of replacements){if(/^-?\d/.test(a))line=line.replace(new RegExp('(?<![\\d.])'+a.replaceAll('.','\\.')+'(?![\\d.])','g'),z);else line=line.replaceAll(a,z);}return line;});
 if(lines.join('\n')!==out.join('\n'))changes.set(file,out.join('\n'));
}
const manualFiles=['research/robot_deep.md','research/microport_deep.md','research/liauto_deep.md','research/tongcheng_deep.md'];
for(const rel of manualFiles){const file=path.join(root,rel),old=changes.get(file)??await fs.readFile(file,'utf8');const next=old.replaceAll('2027年10月8日','2027年10月7日').replaceAll('2027-10-09，休市取此前交易日','2027-10-07（名义2027-10-09）').replaceAll('2027年10月8日此前港股交易日','2027年10月7日此前港股交易日');if(next!==old)changes.set(file,next);}
let patch='*** Begin Patch\n';
for(const [file,next]of changes){const old=await fs.readFile(file,'utf8'),a=old.split(/\r?\n/),z=next.split(/\r?\n/);if(a.length!==z.length)throw Error('Mechanical patch line mismatch');patch+='*** Update File: '+file.replaceAll('\\','/')+'\n';for(let i=0;i<a.length;i++)if(a[i]!==z[i])patch+='@@\n-'+a[i]+'\n+'+z[i]+'\n';}
patch+='*** End Patch';process.stdout.write(patch);
