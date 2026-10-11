import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
// Links obtained from the manager's visible document-library results.
const items=[{id:'csop7709_prospectus_20261007',publicationDate:'2026-10-07',url:'https://website-api.csopasset.com/cmsApi/downloadPDF?key=upload/pdf/cc247d92-e4f4-46b9-beda-09f3cdccb259.pdf&bucket=csop-pdf-bucket1',discoveryURL:'https://www.csopasset.com/tc/resources/download?id=10&Lid=7&kind=CSOP%20SK%20Hynix%20Daily%20Max%20(2x)%20Leveraged%20Product&from=search'}];
const records=[];
for(const item of items){
 const response=await fetch(item.url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.csopasset.com/'},signal:AbortSignal.timeout(30000)});
 const bytes=Buffer.from(await response.arrayBuffer());
 if(!response.ok||bytes.subarray(0,4).toString()!=='%PDF')throw Error(item.id+' did not return a PDF: '+response.status);
 const localFile='data/product_raw/'+item.id+'.pdf';await fs.writeFile(path.join(root,localFile),bytes);
 records.push({...item,localFile,bytes:bytes.length,retrievedAt:new Date().toISOString(),sourceType:'fund_manager_primary_document',publicationTimeStatus:'official document-library date verified; exact upload time not established'});
}
await fs.writeFile(path.join(root,'data/csop_legal_sources.json'),JSON.stringify(records,null,2));
console.log(JSON.stringify(records));
