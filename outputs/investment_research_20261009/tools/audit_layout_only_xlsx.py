"""Read-only preservation audit for a formatting-only workbook edit."""
import argparse
import hashlib
import json
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def digest(blob):
    return hashlib.sha256(blob).hexdigest()

def tree_key(node):
    return (node.tag, tuple(sorted(node.attrib.items())), node.text or '', tuple(tree_key(n) for n in node))

def canonical(data):
    return tree_key(ET.fromstring(data))

def without_cols(data):
    node = ET.fromstring(data)
    for child in node.findall('m:cols', NS):
        node.remove(child)
    return tree_key(node)

def expanded_columns(data):
    columns = {}
    for node in ET.fromstring(data).findall('m:cols/m:col', NS):
        for index in range(int(node.attrib['min']), int(node.attrib['max']) + 1):
            columns[index] = {k: v for k, v in node.attrib.items() if k not in ('min', 'max')}
    return columns

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('before')
    parser.add_argument('after')
    parser.add_argument('--report', required=True)
    parser.add_argument('--scoped-formatting', action='store_true')
    args = parser.parse_args()
    before, after = Path(args.before), Path(args.after)
    changed = []
    substantive = []
    column_changes = []
    sheet_hashes = []
    scoped_parts = {}
    if args.scoped_formatting:
        from transplant_core_layout import SCOPES, within
        with zipfile.ZipFile(before) as source:
            names = [n.attrib['name'] for n in ET.fromstring(source.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)]
        scoped_parts = {f'xl/worksheets/sheet{names.index(n)+1}.xml': ranges for n, ranges in SCOPES.items()}
    with zipfile.ZipFile(before) as a, zipfile.ZipFile(after) as b:
        an, bn = set(a.namelist()), set(b.namelist())
        sheet_names = [n.attrib['name'] for n in ET.fromstring(a.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)]
        for index, sheet_name in enumerate(sheet_names, 1):
            part = f'xl/worksheets/sheet{index}.xml'
            original_hash, current_hash = digest(a.read(part)), digest(b.read(part))
            sheet_hashes.append({'sheet': sheet_name, 'part': part, 'originalXmlSha256': original_hash, 'currentXmlSha256': current_hash, 'byteIdentical': original_hash == current_hash})
        for name in sorted(an & bn):
            av, bv = a.read(name), b.read(name)
            if av == bv:
                continue
            changed.append(name)
            if name.endswith('.xml') or name.endswith('.rels'):
                try:
                    if canonical(av) == canonical(bv):
                        continue
                    if args.scoped_formatting and name == 'xl/styles.xml':
                        ast, bst = ET.fromstring(av), ET.fromstring(bv)
                        if len(ast) == len(bst) and all(x.tag == y.tag and [tree_key(n) for n in x] == [tree_key(n) for n in list(y)[:len(x)]] and all(k == 'count' or y.attrib.get(k) == v for k, v in x.attrib.items()) for x, y in zip(ast, bst)):
                            continue
                    if name in scoped_parts:
                        anode, bnode = ET.fromstring(av), ET.fromstring(bv)
                        def strip_targeted_formatting(node):
                            for cols in node.findall('m:cols', NS):
                                node.remove(cols)
                            for row in node.findall('m:sheetData/m:row', NS):
                                row.attrib.pop('ht', None)
                                row.attrib.pop('customHeight', None)
                                for cell in row:
                                    if within(cell.attrib['r'], scoped_parts[name]):
                                        cell.attrib.pop('s', None)
                            return tree_key(node)
                        if strip_targeted_formatting(anode) == strip_targeted_formatting(bnode):
                            ac, bc = expanded_columns(av), expanded_columns(bv)
                            differences = [{'column': i, 'before': ac.get(i), 'after': bc.get(i)} for i in sorted(set(ac) | set(bc)) if ac.get(i) != bc.get(i)]
                            if all(any(x <= d['column'] <= y for x, y in scoped_parts[name]) for d in differences):
                                column_changes.append({'part': name, 'differences': differences})
                                continue
                    if name.startswith('xl/worksheets/sheet') and without_cols(av) == without_cols(bv):
                        ac, bc = expanded_columns(av), expanded_columns(bv)
                        differences = [{'column': i, 'before': ac.get(i), 'after': bc.get(i)} for i in sorted(set(ac) | set(bc)) if ac.get(i) != bc.get(i)]
                        column_changes.append({'part': name, 'differences': differences})
                        continue
                except ET.ParseError:
                    pass
            substantive.append(name)
    report = {
        'before': str(before), 'after': str(after),
        'beforeSha256': digest(before.read_bytes()), 'afterSha256': digest(after.read_bytes()),
        'addedParts': sorted(bn - an), 'removedParts': sorted(an - bn),
        'byteChangedParts': changed, 'nonColumnSemanticChanges': substantive,
        'columnChanges': column_changes,
        'preservedExceptColumnWidths': not (bn - an or an - bn or substantive),
        'preservedExceptAuthorizedFormatting': not (bn - an or an - bn or substantive),
        'scopeIncludesTargetedCellStylesAndRowHeights': args.scoped_formatting,
        'sheetXmlHashes': sheet_hashes,
    }
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('columnChanges','sheetXmlHashes')}, ensure_ascii=False))

if __name__ == '__main__':
    main()
