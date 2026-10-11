// Targeted display repairs for the original core workbook views.
import { applyNativeLayoutExtensions, nativeNoteFormats, nativeHeaderWidths } from './core_layout_extensions.mjs';
export const coreLayoutRanges = {
  '风险净现值': ['AE:AO'],
  '管线现金流': ['P:AH', 'AJ:AV'],
  '许可受让方现金流': ['K:L'],
  '假设': ['V:Y'],
  '经营假设': ['O:AB', 'AD:AP', 'AR:BH'],
  '情景快照': ['W:AP'],
  '行情与技术': ['AL:AN'],
  '发行人': ['H:I'],
  '机构目标': ['J:K'],
  '条件估值参考': ['N:R'],
  '先声新药假设': ['M:M'],
  '绿叶新品假设': ['D:D', 'J:J'],
  '和黄估值桥': ['R:R'],
};
for (const [sheet, column] of [...nativeNoteFormats, ...nativeHeaderWidths]) {
  coreLayoutRanges[sheet] ??= [];
  if (!coreLayoutRanges[sheet].includes(`${column}:${column}`)) coreLayoutRanges[sheet].push(`${column}:${column}`);
}

export function applyCoreLayoutFormat(wb) {
  const rows = (sheet, columns) => {
    const used = sheet.getUsedRange().values.length;
    return sheet.getRange(`${columns.split(':')[0]}7:${columns.split(':').at(-1)}${Math.max(7, used)}`);
  };
  const width = (sheet, columns, size) => { sheet.getRange(columns).format.columnWidth = size; };
  const wrap = (sheet, columns, size) => {
    width(sheet, columns, size);
    const range = rows(sheet, columns);
    range.format.wrapText = true;
    range.format.horizontalAlignment = 'left';
    range.format.verticalAlignment = 'top';
    const oldHeights = Array.from({ length: sheet.getUsedRange().values.length }, (_, r) => sheet.getRange(`A${r + 1}`).format.rowHeight);
    range.format.autofitRows();
    const last = sheet.getUsedRange().values.length;
    for (let r = 7; r <= last; r++) {
      const row = sheet.getRange(`A${r}`);
      const minimum = Math.max(23, oldHeights[r - 1] ?? 23);
      if (row.format.rowHeight < minimum) row.format.rowHeight = minimum;
    }
  };
  let sheet = wb.worksheets.getItem('风险净现值');
  width(sheet, 'AE:AO', 20);
  sheet = wb.worksheets.getItem('管线现金流');
  for (const columns of ['P:AH', 'AJ:AU']) width(sheet, columns, 20);
  width(sheet, 'AC:AC', 28);
  width(sheet, 'AB:AB', 24);
  wrap(sheet, 'AV:AV', 38);
  sheet = wb.worksheets.getItem('许可受让方现金流');
  width(sheet, 'K:L', 24);
  sheet.getRange('K6:L6').format.wrapText = true;
  sheet = wb.worksheets.getItem('假设');
  width(sheet, 'V:W', 20);
  wrap(sheet, 'X:X', 46);
  wrap(sheet, 'Y:Y', 70);
  sheet = wb.worksheets.getItem('经营假设');
  for (const columns of ['O:AB', 'AD:AP', 'AR:BH']) width(sheet, columns, 20);
  sheet = wb.worksheets.getItem('情景快照');
  wrap(sheet, 'W:AP', 80);
  sheet = wb.worksheets.getItem('行情与技术');
  wrap(sheet, 'AL:AN', 80);
  sheet = wb.worksheets.getItem('发行人');
  wrap(sheet, 'H:H', 56);
  width(sheet, 'I:I', 28);
  rows(sheet, 'I:I').setNumberFormat('yyyy-mm-dd hh:mm');
  sheet = wb.worksheets.getItem('机构目标');
  wrap(sheet, 'J:K', 38);
  sheet = wb.worksheets.getItem('条件估值参考');
  wrap(sheet, 'N:R', 70);
  sheet = wb.worksheets.getItem('先声新药假设');
  wrap(sheet, 'M:M', 70);
  sheet = wb.worksheets.getItem('绿叶新品假设');
  wrap(sheet, 'D:D', 60);
  wrap(sheet, 'J:J', 60);
  sheet = wb.worksheets.getItem('和黄估值桥');
  wrap(sheet, 'R:R', 46);
  applyNativeLayoutExtensions(wb);
}
