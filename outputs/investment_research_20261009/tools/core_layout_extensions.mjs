// Additional native text display repairs; values and source line breaks stay untouched.
export const nativeNoteFormats = [
  ['诺诚风险收入桥', 'M', 46, 48],
  ['诺诚估值桥', 'S', 36, 30],
  ['云顶风险收入桥', 'M', 46, 48],
  ['亚盛风险收入桥', 'M', 64, 48],
  ['映恩风险收入桥', 'M', 70, 48],
  ['亚盛年度经营桥', 'AS', 42, 30],
  ['映恩年度经营桥', 'AS', 42, 30],
  ['再鼎年度经营桥', 'AP', 50, 30],
  ['财务原值', 'F', 52, 23],
  ['财务原值', 'G', 66, 23],
  ['财务原值', 'J', 110, 23],
];

export const nativeHeaderWidths = [
  ['金山经营及权益假设', 'AC', 22],
  ['亚盛资金假设', 'U', 27],
  ['亚盛资金假设', 'AA', 28],
  ['亚盛资金假设', 'AB', 28],
  ['亚盛资金假设', 'AF', 28],
  ['阅文经营现金假设', 'I', 24],
  ['阅文经营现金假设', 'Y', 26],
];

export function applyNativeLayoutExtensions(wb) {
  for (const [name, column, width, minimum] of nativeNoteFormats) {
    const sheet = wb.worksheets.getItem(name);
    const last = sheet.getUsedRange().values.length;
    sheet.getRange(`${column}:${column}`).format.columnWidth = width;
    const range = sheet.getRange(`${column}7:${column}${Math.max(7, last)}`);
    const old = Array.from({ length: last }, (_, i) => sheet.getRange(`A${i + 1}`).format.rowHeight ?? 23);
    range.format.wrapText = true;
    range.format.horizontalAlignment = 'left';
    range.format.verticalAlignment = 'top';
    range.format.autofitRows();
    for (let r = 7; r <= last; r++) {
      const row = sheet.getRange(`A${r}`);
      row.format.rowHeight = Math.max(row.format.rowHeight ?? 23, old[r - 1], minimum);
    }
  }
  for (const [name, column, width] of nativeHeaderWidths) {
    wb.worksheets.getItem(name).getRange(`${column}:${column}`).format.columnWidth = width;
  }
}
