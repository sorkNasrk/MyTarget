"""Read-only evidence inventory for economic-rights and finite-cash-flow notes."""
import argparse, json, re, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
p = argparse.ArgumentParser()
p.add_argument('input', nargs='?', default=str(ROOT / 'qa/risk_npv_layout_fix/preserved_final_notes.xlsx'))
p.add_argument('--output', default=str(ROOT / 'qa/risk_npv_layout_fix/native_notes_inventory.json'))
a = p.parse_args()
file = Path(a.input)
rows = []
with zipfile.ZipFile(file) as archive:
    string_data = archive.read('xl/sharedStrings.xml') if 'xl/sharedStrings.xml' in archive.namelist() else None
    strings = [''.join(s.itertext()) for s in ET.fromstring(string_data)] if string_data else []
    styles = list(ET.fromstring(archive.read('xl/styles.xml')).find('m:cellXfs', NS))
    sheets = ET.fromstring(archive.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)
    def value(cell):
        if cell.attrib.get('t') == 'inlineStr':
            item = cell.find('m:is', NS)
            return ''.join(item.itertext()) if item is not None else ''
        item = cell.find('m:v', NS)
        if item is None: return ''
        if cell.attrib.get('t') == 's': return strings[int(item.text)]
        return item.text or '' if cell.attrib.get('t') in ('str', 'inlineStr') else ''
    for index, sheet in enumerate(sheets, 1):
        tree = ET.fromstring(archive.read(f'xl/worksheets/sheet{index}.xml'))
        columns = {i: float(c.attrib.get('width', 8.43)) for c in tree.findall('m:cols/m:col', NS) for i in range(int(c.attrib['min']), int(c.attrib['max']) + 1)}
        header = tree.find('m:sheetData/m:row[@r="6"]', NS)
        if header is None: continue
        body = {}
        height = {int(r.attrib['r']): float(r.attrib.get('ht', 15)) for r in tree.findall('m:sheetData/m:row', NS)}
        for c in tree.findall('m:sheetData/m:row/m:c', NS):
            if int(re.sub(r'\D', '', c.attrib['r'])) >= 7:
                body.setdefault(re.sub(r'\d', '', c.attrib['r']), []).append(c)
        for cell in header:
            label = value(cell)
            if not label: continue
            column = re.sub(r'\d', '', cell.attrib['r'])
            number = 0
            for c in column: number = number * 26 + ord(c) - 64
            values = []
            nowrap = []
            for c in body.get(column, []):
                text = value(c)
                if not text: continue
                values.append(text)
                alignment = styles[int(c.attrib.get('s', '0'))].find('m:alignment', NS)
                if alignment is None or alignment.attrib.get('wrapText') != '1': nowrap.append(c.attrib['r'])
            note = any(term in label for term in ['权利', '权属', '范围', '终值', '权益口径', '说明', '提示', '限制', '备注'])
            if values and (note or columns.get(number, 8.43) <= 30 and nowrap and max(map(len, values)) >= 22):
                row_heights = [height[int(re.sub(r'\D', '', c.attrib['r']))] for c in body.get(column, []) if value(c)]
                rows.append({'sheet': sheet.attrib['name'], 'column': column, 'header': label, 'isNote': note, 'width': columns.get(number, 8.43), 'lastRow': max(height), 'minHeight': min(row_heights), 'maxTextLength': max(map(len, values)), 'samples': sorted(set(values), key=len, reverse=True)[:3], 'nowrapCells': len(nowrap), 'textCells': len(values)})
output = Path(a.output)
output.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'input': str(file), 'inventory': str(output), 'count': len(rows), 'unwrappedNotes': [r for r in rows if r['isNote'] and r['nowrapCells']]}, ensure_ascii=False))
