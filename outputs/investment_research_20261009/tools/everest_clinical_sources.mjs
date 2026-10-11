import fs from 'node:fs/promises';
const root='G:/MyTarget/outputs/investment_research_20261009';let out=[];try{out=JSON.parse(await fs.readFile(root+'/data/everest_clinical_sources.json','utf8'));}catch{}
for(const q of ['TITLE:"NefIgArd" AND FIRST_PDATE:[2023-01-01 TO 2024-12-31]','TITLE:"Etrasimod as induction and maintenance"','etripamil RAPID Lancet PSVT','NefIgArd 12.8 years modelling dialysis']){
 const search='https://www.ebi.ac.uk/europepmc/webservices/rest/search?query='+encodeURIComponent(q)+'&format=json&pageSize=5',r=await(await fetch(search)).json();
 for(const a of r.resultList.result.filter(x=>x.firstPublicationDate<='2026-10-09')){const u='https://www.ebi.ac.uk/europepmc/webservices/rest/search?query='+encodeURIComponent('EXT_ID:'+a.id+' AND SRC:'+a.source)+'&format=json&resultType=core',d=await(await fetch(u)).json(),x=d.resultList.result[0];out=out.filter(y=>y.id!==x.id);out.push({id:x.id,title:x.title,firstPublicationDate:x.firstPublicationDate,doi:x.doi,url:x.doi?'https://doi.org/'+x.doi:'https://europepmc.org/article/'+x.source+'/'+x.id,sourceURL:u,abstract:x.abstractText,authors:x.authorString,journal:x.journalInfo?.journal?.title});}
}
await fs.writeFile(root+'/data/everest_clinical_sources.json',JSON.stringify(out,null,2));console.log(out.map(x=>({title:x.title,date:x.firstPublicationDate,url:x.url,abstract:x.abstract})));
