import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
import { applyCoreLayoutFormat, coreLayoutRanges } from './core_layout_format.mjs';

const root = path.resolve(import.meta.dirname, '..');
const input = path.join(root, 'deliverables/证券研究总表_初版.xlsx');
const qaDir = path.join(root, 'qa/risk_npv_layout_fix');
await fs.mkdir(qaDir, { recursive: true });
const sourceBytes = await fs.readFile(input);
const sourceSha256 = crypto.createHash('sha256').update(sourceBytes).digest('hex');
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const views = {
  '风险净现值': ['Y6:AJ14', 'AK6:AO14'],
  '管线现金流': ['A1:L14', 'M6:X14', 'Y6:AJ14', 'AK6:AV14'],
  '许可受让方现金流': ['A1:L14', 'M6:R14'],
  '假设': ['A1:L14', 'M6:X14', 'Y6:Y14'],
  '经营假设': ['A1:L14', 'M6:X14', 'Y6:AJ14', 'AK6:AV14', 'AW6:BH14'],
  '情景快照': ['A1:L14', 'M6:V14', 'W6:X14', 'Y6:Z14', 'AA6:AB14', 'AC6:AD14', 'AE6:AF14', 'AG6:AH14', 'AI6:AJ14', 'AK6:AL14', 'AM6:AN14', 'AO6:AP14'],
  '行情与技术': ['A1:L14', 'M6:AA14', 'AB6:AK14', 'AL6:AN14'],
  '发行人': ['A1:I14'],
  '机构目标': ['A1:K15'],
  '条件估值参考': ['A1:I15', 'J6:M15', 'N6:R15'],
  '先声新药假设': ['A1:F14', 'G6:M14'],
  '绿叶新品假设': ['A1:F14', 'G6:J14'],
};
const snapshot = () => Object.fromEntries(Object.keys(coreLayoutRanges).map(name => {
  const sheet = wb.worksheets.getItem(name);
  return [name, { values: sheet.getUsedRange().values, formulas: sheet.getUsedRange().formulas }];
}));
const before = snapshot();
applyCoreLayoutFormat(wb);
wb.recalculate();
const after = snapshot();
const recalculatedCaches = [];
for (const name of Object.keys(before)) {
  const a = before[name], b = after[name];
  if (JSON.stringify(a.formulas) !== JSON.stringify(b.formulas)) throw new Error('Layout edit changed formulas: ' + name);
  for (let r = 0; r < a.values.length; r++) for (let c = 0; c < a.values[r].length; c++) {
    if (JSON.stringify(a.values[r][c]) === JSON.stringify(b.values[r][c])) continue;
    if (!a.formulas[r]?.[c]) throw new Error(`Layout edit changed input ${name} row ${r + 1} col ${c + 1}`);
    recalculatedCaches.push({ sheet: name, row: r + 1, col: c + 1 });
  }
}
const inspection = await wb.inspect({ kind: 'table', range: '风险净现值!AD6:AO14', include: 'values,formulas', tableMaxRows: 9, tableMaxCols: 12, maxChars: 8000 });
await fs.writeFile(path.join(qaDir, 'artifact_inspection.ndjson'), inspection.ndjson);
const renders = [];
for (const [name, ranges] of Object.entries(views)) {
  for (let j = 0; j < ranges.length; j++) {
    const file = path.join(qaDir, `${name}_${j + 1}.png`);
    const img = await wb.render({ sheetName: name, range: ranges[j], scale: 1.5, format: 'png' });
    await fs.writeFile(file, new Uint8Array(await img.arrayBuffer()));
    renders.push({ sheet: name, range: ranges[j], file });
  }
  console.log(JSON.stringify({ rendered: name, images: renders.length }));
}
const candidate = path.join(qaDir, 'candidate.xlsx');
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(candidate);
const report = { source: input, sourceSha256, candidate, scope: coreLayoutRanges, formulasAndNonformulaValuesIdentical: true, recalculatedCaches, renders };
await fs.writeFile(path.join(qaDir, 'artifact_edit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ sourceSha256, candidate, editedSheets: Object.keys(coreLayoutRanges).length, renderedImages: renders.length, recalculatedCaches: recalculatedCaches.length }));
