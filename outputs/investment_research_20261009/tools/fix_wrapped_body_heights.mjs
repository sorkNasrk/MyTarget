import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(import.meta.dirname, '..');
const base = path.join(root, 'qa/risk_npv_layout_fix');
const wb = Workbook.create();
for (const [name, columns, last] of [
  ['发行人', ['H'], 98],
  ['先声新药假设', ['M'], 38],
  ['绿叶新品假设', ['D', 'J'], 38],
  ['条件估值参考', ['O'], 21],
]) {
  const sheet = wb.worksheets.add(name);
  for (const column of columns) {
    sheet.getRange(`${column}7:${column}${last}`).values = [['Height authoring only']];
    sheet.getRange(`${column}7:${column}${last}`).format.rowHeight = 48;
  }
}
wb.recalculate();
const output = await SpreadsheetFile.exportXlsx(wb);
const file = path.join(base, 'wrapped_body_heights.xlsx');
await output.save(file);
console.log(JSON.stringify({ output: file }));
