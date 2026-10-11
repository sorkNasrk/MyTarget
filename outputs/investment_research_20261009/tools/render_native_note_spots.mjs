import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook} from '@oai/artifact-tool';
// Static text display spot checks from the native scanner; final acceptance uses saved-file renders.
const root = path.resolve(import.meta.dirname,'..');
const inventory=JSON.parse(await fs.readFile(path.join(root,'qa/risk_npv_layout_fix/native_notes_inventory_final.json'),'utf8'));
const wb=Workbook.create();
const sh=wb.worksheets.add('Native note spots');
const targets=inventory.filter(r=>['经营桥','机构目标','乐普风险收入桥'].includes(r.sheet)&&r.isNote);
let row=1;
for(const item of targets){
  sh.getRange(`A${row}:A${row+2}`).values=item.samples.map(v=>[v]);
  sh.getRange(`A${row}:A${row+2}`).format.font={name:'Microsoft YaHei',size:10};
  sh.getRange(`A${row}:A${row+2}`).format.rowHeight=23;
  sh.getRange('A:A').format.columnWidth=item.width;
  const img=await wb.render({sheetName:sh.name,range:`A${row}:A${row+2}`,scale:1.5,format:'png'});
  await fs.writeFile(path.join(root,`qa/risk_npv_layout_fix/${item.sheet}_${item.column}_spots.png`),new Uint8Array(await img.arrayBuffer()));
  row+=3;
}
