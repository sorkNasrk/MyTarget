"""Read-only layout inventory of the original core sheets."""
import json
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def column_number(label):
    result = 0
    for letter in label:
        result = result * 26 + ord(letter) - 64
    return result

with zipfile.ZipFile(ROOT / 'deliverables/证券研究总表_初版.xlsx') as archive:
    strings = [''.join(si.itertext()) for si in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
    sheets = ET.fromstring(archive.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)
    output = []
    for index, sheet in enumerate(sheets[:40], 1):
        tree = ET.fromstring(archive.read(f'xl/worksheets/sheet{index}.xml'))
        cols = {i: node.attrib.get('width') for node in tree.findall('m:cols/m:col', NS) for i in range(int(node.attrib['min']), int(node.attrib['max']) + 1)}
        header = tree.find('m:sheetData/m:row[@r="6"]', NS)
        missing = []
        for cell in list(header) if header is not None else []:
            label = ''.join(c for c in cell.attrib['r'] if c.isalpha())
            if column_number(label) in cols:
                continue
            value = cell.find('m:v', NS)
            text = strings[int(value.text)] if cell.attrib.get('t') == 's' and value is not None else (value.text if value is not None else '')
            if text:
                missing.append({'column': label, 'header': text})
        if missing:
            output.append({'sheet': sheet.attrib['name'], 'columnsWithoutExplicitWidth': missing})
print(json.dumps(output, ensure_ascii=False))
with zipfile.ZipFile(ROOT / 'deliverables/证券研究总表_初版.xlsx') as archive:
    for index, columns in [(26, ['X', 'Y']), (32, ['W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP']), (35, ['AL', 'AM', 'AN']), (36, ['H']), (38, ['J', 'K'])]:
        tree = ET.fromstring(archive.read(f'xl/worksheets/sheet{index}.xml'))
        counts = {column: [] for column in columns}
        for cell in tree.findall('m:sheetData/m:row/m:c', NS):
            label = ''.join(c for c in cell.attrib['r'] if c.isalpha())
            if label not in counts or int(''.join(c for c in cell.attrib['r'] if c.isdigit())) < 7:
                continue
            value = cell.find('m:v', NS)
            text = strings[int(value.text)] if cell.attrib.get('t') == 's' and value is not None else (value.text if cell.attrib.get('t') == 'str' and value is not None else '')
            if text:
                counts[label].append(len(text))
        print(json.dumps({'sheet': sheets[index-1].attrib['name'], 'textMaxLengths': {c: max(v) if v else 0 for c, v in counts.items()}}, ensure_ascii=False))
