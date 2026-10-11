import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const root = path.resolve(import.meta.dirname, '..');
const base = path.join(root, 'qa/risk_npv_layout_fix');
const report = JSON.parse(await fs.readFile(path.join(base, 'artifact_edit.json'), 'utf8'));
const input = path.resolve(process.argv[2] ?? path.join(base, 'preserved_final.xlsx'));
const selected = process.argv[3] ? process.argv[3].split(',') : null;
const integrityFile = process.argv[4];
const integrity = integrityFile ? JSON.parse(await fs.readFile(path.resolve(integrityFile), 'utf8')) : null;
const inputSha256 = crypto.createHash('sha256').update(await fs.readFile(input)).digest('hex');
const sheetHashes = new Map((integrity?.sheetXmlHashes ?? []).map(row => [row.sheet, row]));
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const outputDir = path.join(base, 'final_renders');
await fs.mkdir(outputDir, { recursive: true });
const rows = [];
report.renders.push({ sheet: '和黄估值桥', range: 'A1:J11', file: '和黄估值桥_1.png' }, { sheet: '和黄估值桥', range: 'K6:R11', file: '和黄估值桥_2.png' });
report.renders.push({ sheet: '诺诚风险收入桥', range: 'A1:G14', file: '诺诚风险收入桥_1.png' }, { sheet: '诺诚风险收入桥', range: 'H6:M14', file: '诺诚风险收入桥_2.png' });
report.renders.push({ sheet: '诺诚估值桥', range: 'A1:J11', file: '诺诚估值桥_1.png' }, { sheet: '诺诚估值桥', range: 'K6:S11', file: '诺诚估值桥_2.png' });
for (const sheet of ['云顶风险收入桥', '亚盛风险收入桥', '映恩风险收入桥']) report.renders.push({ sheet, range: 'A1:G14', file: `${sheet}_1.png` }, { sheet, range: 'H6:M14', file: `${sheet}_2.png` });
for (const [index, range] of ['A1:J13', 'K6:T13', 'U6:AD13', 'AE6:AS13'].entries()) report.renders.push({ sheet: '亚盛年度经营桥', range, file: `亚盛年度经营桥_${index + 1}.png` });
if (integrity) {
  const bundle = JSON.parse(await fs.readFile(path.join(root, 'data/research_bundle.json'), 'utf8'));
  const main = JSON.parse(await fs.readFile(path.join(root, `qa/workbook_render_manifest_${bundle.fingerprint}.json`), 'utf8'));
  const splitOriginals = new Set(['情景快照|M6:X14','情景快照|Y6:AJ14','情景快照|AK6:AP14','评分|M6:W14','行情与技术|AB6:AN14','条件估值参考|J6:R15']);
  for (const [index, view] of main.rows.entries()) {
    if (sheetHashes.get(view.sheet)?.byteIdentical !== false) continue;
    const existing = report.renders.find(row => row.sheet === view.sheet && row.range === view.range);
    if (existing) existing.sourceViewIndex = index + 1;
    else report.renders.push({ ...view, sourceViewIndex: index + 1, evidenceOnly: splitOriginals.has(`${view.sheet}|${view.range}`), file: `${view.sheet}_orig_${index + 1}.png` });
  }
  report.renders.push({sheet:'财务原值',range:'I6:J14',file:'财务原值_note_head.png'});
  report.renders.push({sheet:'财务原值',range:'E115:J118',file:'财务原值_longest_note.png'});
  report.renders.push({sheet:'财务原值',range:'E433:J436',file:'财务原值_longest_period.png'});
  report.renders.push({sheet:'财务原值',range:'E4459:J4462',file:'财务原值_longest_unit.png'});
}
report.renders = report.renders.filter((view, index, rows) => rows.findIndex(r => r.sheet === view.sheet && r.range === view.range) === index);
for (let index = 0; index < report.renders.length; index++) {
  const view = report.renders[index];
  if (selected && !selected.includes(view.sheet)) continue;
  const file = path.join(outputDir, path.basename(view.file));
  const img = await wb.render({ sheetName: view.sheet, range: view.range, scale: 1.5, format: 'png' });
  await fs.writeFile(file, new Uint8Array(await img.arrayBuffer()));
  rows.push({ ...view, file, input, inputSha256, ...sheetHashes.get(view.sheet) });
  if (index % 8 === 0) console.log(JSON.stringify({ images: rows.length, sheet: view.sheet }));
}
const score = wb.worksheets.getItem('评分');
if (!selected || selected.includes('评分')) {
for (const [index, range] of ['M6:Q14', 'R6:W14'].entries()) {
  const file = path.join(outputDir, `评分_${index + 1}.png`);
  const img = await wb.render({ sheetName: score.name, range, scale: 1.5, format: 'png' });
  await fs.writeFile(file, new Uint8Array(await img.arrayBuffer()));
  if (!rows.some(row => row.sheet === '评分' && row.range === range)) rows.push({ sheet: '评分', range, file, input, inputSha256, ...sheetHashes.get('评分') });
}
}
const manifestFile = path.join(base, 'final_render_manifest.json');
if (selected) {
  const previous = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
  rows.unshift(...previous.rows.filter(row => !selected.includes(row.sheet)));
}
await fs.writeFile(manifestFile, JSON.stringify({ input, inputSha256, preservationAudit: integrityFile ?? null, rows }, null, 2));
console.log(JSON.stringify({ rendered: rows.length, input }));
