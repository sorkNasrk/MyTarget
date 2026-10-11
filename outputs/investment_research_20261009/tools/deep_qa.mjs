import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';
const files=process.argv.slice(2).length?process.argv.slice(2):['I034'];
for(const id of files){
 const file=`research/${id}_deep.md`,text=await fs.readFile(root+'/'+file,'utf8');
 const paragraphs=text.split(/\r?\n\s*\r?\n/);
 const accepted=paragraphs.filter(p=>!p.trim().startsWith('#')&&!p.trim().startsWith('|')&&!p.trim().startsWith('-')&&!p.includes('研究基准：')&&!p.includes('来源与复核记录'));
 const sourceIndex=accepted.findIndex(p=>/^- 原中报/.test(p));
 const body=accepted.slice(0,sourceIndex<0?accepted.length:sourceIndex).join('\n\n');
 const count=(body.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g)||[]).length;
 const norm=accepted.map(p=>p.replace(/[^\u3400-\u4dbf\u4e00-\u9fff]/g,''));
 const duplicates=[];for(let i=0;i<norm.length;i++)if(norm[i].length>=60)for(let j=0;j<i;j++)if(norm[i]===norm[j])duplicates.push({paragraph1:j+1,paragraph2:i+1,characters:norm[i].length});
 const result={issuerId:id,file,checkedAt:new Date().toISOString(),method:'仅正文非标题、非表格、非列表段落；剔除研究基准元数据，来源列表不纳入；只计CJK统一及扩展A汉字',effectiveChineseCharacters:count,minimum:10000,passed:count>=10000&&duplicates.length===0,exactDuplicateParagraphs:duplicates,similarityReview:'仅逐段完全重复检测；同义重复仍须编辑人工审阅',modelConsistency:'情景与量价数值须独立核对模型'};
 await fs.writeFile(root+`/data/${id}_deep_qa.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
