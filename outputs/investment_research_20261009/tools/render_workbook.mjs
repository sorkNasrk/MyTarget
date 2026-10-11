import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'..');
const qa=JSON.parse(await fs.readFile(path.join(root,'qa/workbook_qa.json'),'utf8'));
const bundle=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'deliverables/证券研究总表_初版.xlsx')));
const dest=path.join(root,'qa/workbook_render_'+bundle.fingerprint);await fs.mkdir(dest,{recursive:true});
const rows=[];
const col=n=>{let x=n+1,s='';while(x){x--;s=String.fromCharCode(65+x%26)+s;x=Math.floor(x/26);}return s;};
const ranges={'总览':['A1:D26'],'年度经营资金桥':['A1:M13','N6:Z13'],'转债资金假设':['A1:I10','J6:Q10'],'年度分部假设':['A1:M14','N6:Y14'],'先声资金假设':['A1:J10','K6:T10','U6:AA10'],'先声年度假设':['A1:L14','M6:X14'],'先声新药假设':['A1:F14','G6:M14'],'先声风险收入桥':['A1:J14','K6:R14'],'先声年度经营桥':['A1:K13','L6:U13','V6:AD13'],'复星经营假设':['A1:L14','M6:V14'],'复星经营桥':['A1:L11'],'财务原值':['A1:H14','K6:M14'],'机构目标':['A1:K15'],'行情与技术':['A1:L14','M6:AA14','AB6:AN14'],'说明':['A1:B25']};
Object.assign(ranges,{
 '风险净现值':['A1:L14','M6:X14','Y6:AJ14','AK6:AO14'],
 '管线现金流':['A1:L14','M6:X14','Y6:AJ14','AK6:AV14'],
 '假设':['A1:L14','M6:X14','Y6:Y14'],
 '经营假设':['A1:L14','M6:X14','Y6:AJ14','AK6:AV14','AW6:BH14'],
 '情景快照':['A1:L14','M6:V14','W6:X14','Y6:Z14','AA6:AB14','AC6:AD14','AE6:AF14','AG6:AH14','AI6:AJ14','AK6:AL14','AM6:AN14','AO6:AP14'],
 '评分':['A1:L14','M6:Q14','R6:W14'],
 '行情与技术':['A1:L14','M6:AA14','AB6:AK14','AL6:AN14'],
 '绿叶资金假设':['A1:J10','K6:T10','U6:AD10'],
 '绿叶年度假设':['A1:L14','M6:X14','Y6:AK14'],
 '绿叶新品假设':['A1:F14','G6:J14'],
 '绿叶风险收入桥':['A1:G14','H6:M14'],
 '绿叶年度经营桥':['A1:J13','K6:T13','U6:AD13','AE6:AM13'],
 '绿叶估值桥':['A1:G11','H6:M11'],
 '泰格经营假设':['A1:L14','M6:X14'],
 '泰格经营桥':['A1:L11'],
 '舜宇经营假设':['A1:K14','L6:Q14'],
 '舜宇经营桥':['A1:L11'],
 'ASMPT经营假设':['A1:M14'],
 'ASMPT经营桥':['A1:L11'],
 '昭衍经营假设':['A1:L14','M6:V14'],
 '昭衍经营桥':['A1:L11'],
 '康哲经营假设':['A1:L14','M6:R14'],
 '康哲经营桥':['A1:L11'],
 '和黄资金假设':['A1:J10','K6:T10','U6:Y10'],
 '和黄年度假设':['A1:L14','M6:X14','Y6:AH14'],
 '和黄新品假设':['A1:H14','I6:J14'],
 '和黄爬坡假设':['A1:D14'],
 '和黄风险收入桥':['A1:G14','H6:M14'],
 '和黄年度经营桥':['A1:J13','K6:T13','U6:AD13','AE6:AK13'],
 '和黄FCFF折现桥':['A1:I14'],
 '和黄估值桥':['A1:J11','K6:R11'],
 '诺诚资金假设':['A1:J10','K6:T10','U6:AC10'],
 '诺诚年度假设':['A1:L14','M6:X14','Y6:AF14'],
 '诺诚新品假设':['A1:H14','I6:J14'],
 '诺诚爬坡假设':['A1:D14'],
 '诺诚风险收入桥':['A1:G14','H6:M14'],
 '诺诚年度经营桥':['A1:J13','K6:T13','U6:AD13','AE6:AM13'],
 '诺诚FCFF折现桥':['A1:I14'],
 '诺诚估值桥':['A1:J11','K6:S11'],
 '同辐经营假设':['A1:L14','M6:V14','W6:AE14'],
 '同辐经营桥':['A1:L11'],
 '华虹权益假设':['A1:J10'],
 '华虹期限假设':['A1:K14','L6:T14'],
 '华虹正常经营桥':['A1:J11','K6:T11','U6:AB11'],
 '华虹净资产PB桥':['A1:J11','K6:T11','U6:AC11'],
 '天使经营假设':['A1:L14','M6:W14'],
 '天使经营桥':['A1:L11'],
 '云顶资金假设':['A1:J10','K6:T10','U6:AN10'],
 '云顶年度假设':['A1:L14','M6:X14','Y6:AF14'],
 '云顶新品假设':['A1:H14','I6:J14'],
 '云顶爬坡假设':['A1:D14'],
 '云顶风险收入桥':['A1:G14','H6:M14'],
 '云顶年度经营桥':['A1:J13','K6:T13','U6:AD13','AE6:AO13'],
 '云顶FCFF折现桥':['A1:I14'],
 '云顶估值桥':['A1:J11','K6:T11'],
 '心动经营假设':['A1:L14','M6:X14','Y6:AD14'],
 '心动正常利润桥':['A1:J11','K6:T11','U6:AE11'],
 '心动股本PE桥':['A1:L11','M6:AA11'],
 '金山经营及权益假设':['A1:L14','M6:X14','Y6:AJ14','AK6:AR14'],
 '金山正常利润桥':['A1:L11','M6:X11','Y6:AK11'],
 '金山归母SOTP桥':['A1:L11','M6:AC11'],
 '亚盛资金假设':['A1:J10','K6:T10','U6:AH10'],
 '亚盛年度假设':['A1:L14','M6:X14','Y6:AA14'],
 '亚盛新品假设':['A1:H14','I6:J14'],
 '亚盛爬坡假设':['A1:D14'],
 '亚盛风险收入桥':['A1:G14','H6:M14'],
 '亚盛年度经营桥':['A1:J13','K6:T13','U6:AD13','AE6:AS13'],
 '亚盛现金折现桥':['A1:L14'],
 '亚盛估值桥':['A1:L11','M6:W11'],
 '阅文经营现金假设':['A1:L14','M6:X14','Y6:AL14'],
 '阅文正常利润桥':['A1:L11','M6:X11','Y6:AE11'],
 '阅文现金权益桥':['A1:L11','M6:X11','Y6:AE11'],
 '君圣泰资金假设':['A1:L10','M6:X10'],
 '君圣泰年度假设':['A1:M14'],
 '君圣泰药物假设':['A1:M14'],
 '君圣泰开发假设':['A1:E14'],
 '君圣泰风险收入':['A1:K14'],
 '君圣泰经营资金':['A1:J13','K6:T13','U6:AD13','AE6:AN13'],
 '君圣泰股东现金流':['A1:M14'],
 '君圣泰估值':['A1:O11'],
 '同程经营资本假设':['A1:L14','M6:X14','Y6:AJ14','AK6:AW14'],
 '同程正常利润桥':['A1:L11','M6:X11','Y6:AF11'],
 '同程现金债务桥':['A1:L11','M6:X11','Y6:AE11'],
 '同程每股估值桥':['A1:J11','K6:S11'],
 '映恩资金假设':['A1:L10','M6:X10','Y6:AJ10'],
 '映恩年度假设':['A1:L14','M6:Y14'],
 '映恩新品假设':['A1:H14','I6:J14'],
 '映恩爬坡假设':['A1:D14'],
 '映恩风险收入桥':['A1:G14','H6:M14'],
 '映恩年度经营桥':['A1:J13','K6:T13','U6:AD13','AE6:AS13'],
 '映恩现金折现桥':['A1:L14'],
 '映恩估值桥':['A1:L11','M6:W11'],
 '条件估值参考':['A1:I15','J6:M15','N6:R15'],
 '理想经营资本假设':['A1:L14','M6:X14','Y6:AK14'],
 '理想量价利润桥':['A1:J11','K6:U11'],
 '理想现金股数桥':['A1:L11','M6:AA11'],
 '理想经营估值桥':['A1:O11']
});
for(let i=0;i<qa.sheets.length;i++){
 const name=qa.sheets[i];
 const header=wb.worksheets.getItem(name).getRange('A6:ZZ6').values[0];
 const width=header.reduce((n,v,j)=>v!==null&&v!==''?j+1:n,1);
 const views=ranges[name]??Array.from({length:Math.ceil(width/12)},(_,j)=>`${col(j*12)}${j?6:1}:${col(Math.min(width-1,j*12+11))}14`);
 if(name==='数据 >>')continue;
 for(let j=0;j<views.length;j++){
  const range=views[j],file=path.join(dest,String(i+1).padStart(2,'0')+'_'+name.replace(/[<>:"/\\|?*]/g,'_')+'_'+(j+1)+'.png');
  const img=await wb.render({sheetName:name,range,scale:1.5,format:'png'});await fs.writeFile(file,new Uint8Array(await img.arrayBuffer()));rows.push({sheet:name,range,file,status:'待视觉核验'});
 }
 if(i%10===0)console.log(JSON.stringify({renderedSheets:i+1,images:rows.length,currentSheet:name}));
}
await fs.writeFile(path.join(root,'qa/workbook_render_manifest_'+bundle.fingerprint+'.json'),JSON.stringify({fingerprint:bundle.fingerprint,rows,scope:'每个工作表可见样本与新增宽资金桥全部列；全行数值和公式另独立核验'},null,2));console.log(JSON.stringify({images:rows.length,fingerprint:bundle.fingerprint}));
