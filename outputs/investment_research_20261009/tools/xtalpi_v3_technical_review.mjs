import fs from 'node:fs';
const source=new URL('./xtalpi_v2_technical_review.mjs',import.meta.url);
const code=fs.readFileSync(source,'utf8').replaceAll("'v2 model preserves","'v3 model preserves").replaceAll("/qa/xtalpi_v2_technical_review.json","/qa/xtalpi_v3_technical_review.json");
await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(code));
