import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),base='https://www.hsi.com.hk';
const urls=[
 ['hsi_details_enhk',base+'/api/wsit-hsi-ddoc-ea-public-website-proxy/v1/product-data/pub/series/metadata/v2?data=details&language=en-hk&seriesCode=hstech'],
 ['hsi_values_enhk',base+'/api/wsit-hsi-ddoc-ea-public-website-proxy/v1/product-data/pub/series/metadata/v2?data=values&language=en-hk&seriesCode=hstech'],
 ['hsi_methodology_enhk',base+'/content/dam/wpb/hsil/index/methodologies/en_hk/hstech/IM_hstech.pdf'],
 ['hsi_brochure_enhk',base+'/content/dam/wpb/hsil/index/brochure/en_hk/hstech/hstech.pdf'],
 ['hsi_daily_reports',base+'/api/wsit-hsi-ddoc-ea-public-website-proxy/v1/product-data/pub/series/metadata/v2?data=dailyReport&seriesCode=hstech'],
 ['hsi_top10',base+'/api/wsit-hsi-ddoc-ea-public-website-proxy/v1/product-data/pub/constituent/metadata/v2?data=top10&indexCode=02083.00&language=en-hk'],
 ['hsi_history',base+'/api/wsit-hsi-ddoc-ea-public-website-proxy/v1/product-data/pub/indexes/metadata/v2?data=valueHistoryPub&indexCodes=02083.00&language=en-hk']
];
const records=await Promise.allSettled(urls.map(async([id,url])=>{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':base+'/'},signal:AbortSignal.timeout(25000)});const buf=Buffer.from(await r.arrayBuffer()),isPdf=buf.subarray(0,5).toString()==='%PDF-',file='data/product_raw/'+id+(isPdf?'.pdf':'.json');await fs.writeFile(path.join(root,file),buf);return{id,url,status:r.status,bytes:buf.length,file,isPdf,text:isPdf?null:buf.toString().slice(0,20000)};}));
await fs.writeFile(path.join(root,'data/hsi_primary_sources.json'),JSON.stringify(records,null,2));for(const r of records)console.log(JSON.stringify(r));
