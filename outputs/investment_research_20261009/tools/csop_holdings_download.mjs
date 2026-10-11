import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const url='https://website-api.csopasset.com/cmsApi/Holdings/product/list/download?fundId=HK-CHSU';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.csopasset.com/'},signal:AbortSignal.timeout(20000)});
const bytes=Buffer.from(await response.arrayBuffer()),type=response.headers.get('content-type');
const report={url,status:response.status,contentType:type,bytes:bytes.length,retrievedAt:new Date().toISOString(),sourceType:'fund_manager_primary_visible_download_link',saved:false};
if(response.ok&&!/html|json/.test(type??'')){const ext=type?.includes('pdf')?'pdf':bytes.subarray(0,2).toString()==='PK'?'xlsx':'csv';report.localFile='data/product_raw/csop3442_holdings.'+ext;await fs.writeFile(path.join(root,report.localFile),bytes);report.saved=true;}
await fs.writeFile(path.join(root,'qa/csop_holdings_download.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
