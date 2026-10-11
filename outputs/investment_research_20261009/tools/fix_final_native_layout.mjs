import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';
import { nativeNoteFormats, nativeHeaderWidths } from './core_layout_extensions.mjs';

const root = path.resolve(import.meta.dirname, '..');
const base = path.join(root, 'qa/risk_npv_layout_fix');
const input = path.join(base, 'preserved_final_notes.xlsx');
const wb = Workbook.create();
const authorData = JSON.parse(await fs.readFile(path.join(base,'native_layout_author_input.json'),'utf8'));
// Previous native-note edits are already present in input. Only append newly found repairs.
for (const data of authorData) {
  const name = data.sheet;
  const sheet = wb.worksheets.add(name);
  const last = data.lastRow;
  for (const [r, height] of Object.entries(data.heights)) sheet.getRange(`A${r}`).format.rowHeight = height;
  for (const {column,width,minimum,values} of data.columns) {
  sheet.getRange(`${column}:${column}`).format.columnWidth = width;
  const range = sheet.getRange(`${column}7:${column}${last}`);
  range.values = values;
  range.format.font = { name:'Microsoft YaHei', size:10 };
  const old = Array.from({ length: last }, (_, i) => data.heights[i+1] ?? 23);
  range.format.wrapText = true;
  range.format.horizontalAlignment = 'left';
  range.format.verticalAlignment = 'top';
  range.format.autofitRows();
  for (let r = 7; r <= last; r++) {
    const row = sheet.getRange(`A${r}`);
    row.format.rowHeight = Math.max(row.format.rowHeight ?? 23, old[r - 1], minimum);
  }
  console.log(JSON.stringify({ formatted: name, column, last }));
  }
  for (const {column,width} of data.headers) sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}
wb.recalculate();
const inspection = await wb.inspect({kind:'table',range:'再鼎年度经营桥!AP6:AP14',include:'values,formulas',tableMaxRows:9,tableMaxCols:1,maxChars:2500});
await fs.writeFile(path.join(base,'native_final_inspection.ndjson'),inspection.ndjson);
const output = path.join(base, 'native_final_artifact.xlsx');
await (await SpreadsheetFile.exportXlsx(wb)).save(output);
const hash = crypto.createHash('sha256').update(await fs.readFile(input)).digest('hex');
await fs.writeFile(path.join(base,'native_final_artifact.json'),JSON.stringify({input,inputSha256:hash,output,addedNotes:nativeNoteFormats.slice(6),headers:nativeHeaderWidths},null,2));
console.log(JSON.stringify({output,inputSha256:hash}));
