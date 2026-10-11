import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(import.meta.dirname, '..');
const wb = Workbook.create();
for (const [name, column, last, width, height] of [
  ['诺诚风险收入桥', 'M', 246, 46, 48],
  ['诺诚估值桥', 'S', 11, 36, 30],
  ['云顶风险收入桥', 'M', 278, 46, 48],
  ['亚盛风险收入桥', 'M', 278, 64, 48],
  ['映恩风险收入桥', 'M', 326, 70, 48],
  ['亚盛年度经营桥', 'AS', 22, 42, 30],
]) {
  const sheet = wb.worksheets.add(name);
  const range = sheet.getRange(`${column}7:${column}${last}`);
  range.values = Array.from({ length: last - 6 }, () => ['Formatting author only']);
  range.format.font = { name: 'Microsoft YaHei', size: 10 };
  range.setNumberFormat('0.000');
  range.format.wrapText = true;
  range.format.horizontalAlignment = 'left';
  range.format.verticalAlignment = 'top';
  range.format.rowHeight = height;
  sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}
wb.recalculate();
const output = await SpreadsheetFile.exportXlsx(wb);
const file = path.join(root, 'qa/risk_npv_layout_fix/secondary_notes_layout.xlsx');
await output.save(file);
console.log(JSON.stringify({ output: file }));
