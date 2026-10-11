"""Apply Artifact Tool's authored formatting while preserving source cells and native parts."""
import argparse
import copy
import hashlib
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

M = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
NS = {'m': M}
ET.register_namespace('', M)
SCOPES = {
    '风险净现值': [(31, 41)], '管线现金流': [(16, 34), (36, 48)],
    '许可受让方现金流': [(11, 12)], '假设': [(22, 25)],
    '经营假设': [(15, 28), (30, 42), (44, 60)], '情景快照': [(23, 42)],
    '行情与技术': [(38, 40)], '发行人': [(8, 9)], '机构目标': [(10, 11)],
    '条件估值参考': [(14, 18)], '先声新药假设': [(13, 13)], '绿叶新品假设': [(4, 4), (10, 10)],
    '和黄估值桥': [(18, 18)],
    '诺诚风险收入桥': [(13, 13)], '诺诚估值桥': [(19, 19)],
    '云顶风险收入桥': [(13, 13)], '亚盛风险收入桥': [(13, 13)], '映恩风险收入桥': [(13, 13)],
    '亚盛年度经营桥': [(45, 45)],
    '映恩年度经营桥': [(45, 45)], '再鼎年度经营桥': [(42, 42)],
    '财务原值': [(6, 7), (10, 10)],
    '金山经营及权益假设': [(29, 29)],
    '亚盛资金假设': [(21, 21), (27, 28), (32, 32)],
    '阅文经营现金假设': [(9, 9), (25, 25)],
}

def key(node):
    return (node.tag, tuple(sorted(node.attrib.items())), node.text or '', tuple(key(n) for n in node))

def xml_fragment(node):
    fragment = ET.tostring(node, encoding='unicode').replace(f' xmlns="{M}"', '')
    return re.sub(r'<(/?)([A-Za-z][A-Za-z0-9]*)', r'<\1x:\2', fragment)

def col_index(label):
    result = 0
    for ch in label:
        result = result * 26 + ord(ch) - 64
    return result

def within(address, ranges):
    index = col_index(re.sub(r'\d', '', address))
    return any(a <= index <= b for a, b in ranges)

def set_attr(tag, name, value):
    pattern = rf'\s{name}="[^"]*"'
    if re.search(pattern, tag):
        return re.sub(pattern, f' {name}="{value}"', tag, count=1)
    return re.sub(r'(/?>)$', lambda m: f' {name}="{value}"' + m.group(1), tag)

def merge_styles(original, candidate):
    o, c = ET.fromstring(original), ET.fromstring(candidate)
    original_tables = {node.tag.split('}')[-1]: node for node in o}
    candidate_tables = {node.tag.split('}')[-1]: node for node in c}
    additions, maps = {}, {}
    num_table = original_tables.get('numFmts')
    num_lookup = {n.attrib['formatCode']: int(n.attrib['numFmtId']) for n in num_table} if num_table is not None else {}
    next_fmt = max([163, *num_lookup.values()]) + 1
    maps['numFmts'] = {}
    for n in candidate_tables.get('numFmts', []):
        code, old = n.attrib['formatCode'], int(n.attrib['numFmtId'])
        if code not in num_lookup:
            clone = copy.deepcopy(n)
            clone.set('numFmtId', str(next_fmt))
            additions.setdefault('numFmts', []).append(clone)
            num_lookup[code] = next_fmt
            next_fmt += 1
        maps['numFmts'][old] = num_lookup[code]
    for table in ['fonts', 'fills', 'borders', 'cellStyleXfs', 'cellXfs']:
        existing = list(original_tables[table])
        lookup = {key(node): i for i, node in enumerate(existing)}
        mapping = {}
        for i, node in enumerate(candidate_tables[table]):
            clone = copy.deepcopy(node)
            for attr, dependency in [('fontId', 'fonts'), ('fillId', 'fills'), ('borderId', 'borders'), ('xfId', 'cellStyleXfs')]:
                if attr in clone.attrib and dependency in maps:
                    clone.set(attr, str(maps[dependency][int(clone.attrib[attr])]))
            if 'numFmtId' in clone.attrib:
                old = int(clone.attrib['numFmtId'])
                clone.set('numFmtId', str(maps['numFmts'].get(old, old)))
            signature = key(clone)
            if signature not in lookup:
                lookup[signature] = len(existing)
                existing.append(clone)
                additions.setdefault(table, []).append(clone)
            mapping[i] = lookup[signature]
        maps[table] = mapping
    text = original.decode('utf-8')
    for table, nodes in additions.items():
        pattern = rf'<x:{table}\b[^>]*>.*?</x:{table}>'
        found = re.search(pattern, text, re.S)
        appended = ''.join(xml_fragment(n) for n in nodes)
        if found:
            old = found.group()
            count = len(original_tables[table]) + len(nodes)
            updated = re.sub(r'count="\d+"', f'count="{count}"', old, count=1)
            updated = updated.replace(f'</x:{table}>', appended + f'</x:{table}>')
            text = text[:found.start()] + updated + text[found.end():]
        else:
            text = text.replace('<x:fonts', f'<x:{table} count="{len(nodes)}">{appended}</x:{table}><x:fonts', 1)
    return text.encode('utf-8'), maps['cellXfs'], {k: len(v) for k, v in additions.items()}

def patch_sheet(original, candidate, scopes, style_map, heights_only=False, alignment_map=None):
    o, c = original.decode('utf-8'), candidate.decode('utf-8')
    tree = ET.fromstring(candidate)
    candidates = {node.attrib['r']: node for node in tree.findall('m:sheetData/m:row/m:c', NS)}
    style_edits = []
    def patch_cell(match):
        tag = match.group()
        address = re.search(r'\br="([^"]+)"', tag).group(1)
        if not within(address, scopes) or address not in candidates:
            return tag
        current = int(re.search(r'\bs="(\d+)"', tag).group(1)) if re.search(r'\bs="(\d+)"', tag) else 0
        candidate_style = int(candidates[address].attrib.get('s', '0'))
        desired = alignment_map(current, candidate_style) if alignment_map else style_map[candidate_style]
        if current == desired:
            return tag
        style_edits.append(address)
        return set_attr(tag, 's', desired)
    result = o if heights_only else re.sub(r'<x:c\b[^>]*>', patch_cell, o)
    cols = re.search(r'<x:cols\b[^>]*>.*?</x:cols>', c, re.S)
    if cols and not heights_only:
        existing = re.search(r'<x:cols\b[^>]*>.*?</x:cols>', result, re.S)
        if existing:
            old_tree = ET.fromstring(original).find('m:cols', NS)
            new_tree = tree.find('m:cols', NS)
            merged = {}
            for node in old_tree:
                for index in range(int(node.attrib['min']), int(node.attrib['max']) + 1):
                    merged[index] = dict(node.attrib, min=str(index), max=str(index))
            for node in new_tree:
                for index in range(int(node.attrib['min']), int(node.attrib['max']) + 1):
                    if any(a <= index <= b for a, b in scopes):
                        merged[index] = dict(node.attrib, min=str(index), max=str(index))
            payload = '<x:cols>' + ''.join('<x:col ' + ' '.join(f'{k}="{v}"' for k, v in merged[index].items()) + ' />' for index in sorted(merged)) + '</x:cols>'
            result = result[:existing.start()] + payload + result[existing.end():]
    candidate_rows = {r.attrib['r']: r for r in tree.findall('m:sheetData/m:row', NS)}
    height_edits = []
    def patch_row(match):
        tag = match.group()
        index = re.search(r'\br="(\d+)"', tag).group(1)
        if alignment_map and int(index) < 7:
            return tag
        node = candidate_rows.get(index)
        if node is None:
            return tag
        desired = node.attrib.get('ht')
        old = re.search(r'\bht="([^"]+)"', tag)
        if desired is None or old and float(old.group(1)) >= float(desired):
            return tag
        height_edits.append(int(index))
        return set_attr(set_attr(tag, 'ht', desired), 'customHeight', '1')
    result = re.sub(r'<x:row\b[^>]*>', patch_row, result)
    return result.encode('utf-8'), {'styledCells': style_edits, 'rowHeights': height_edits}

def main():
    p = argparse.ArgumentParser()
    p.add_argument('source'); p.add_argument('candidate'); p.add_argument('output'); p.add_argument('--report', required=True)
    p.add_argument('--row-heights-only', action='store_true')
    p.add_argument('--alignment-only', action='store_true', help='Retain each original font/fill/border/number format and overlay authored alignment only')
    a = p.parse_args()
    source, candidate, output = Path(a.source), Path(a.candidate), Path(a.output)
    updates, audit = {}, {}
    with zipfile.ZipFile(source) as original, zipfile.ZipFile(candidate) as edited:
        alignment_map = None
        alignment_additions = []
        if a.alignment_only:
            styles, style_map, added_styles = original.read('xl/styles.xml'), {}, {}
            original_xfs = list(ET.fromstring(styles).find('m:cellXfs', NS))
            candidate_xfs = list(ET.fromstring(edited.read('xl/styles.xml')).find('m:cellXfs', NS))
            lookup = {key(node): i for i, node in enumerate(original_xfs)}
            def alignment_map(old, new):
                clone = copy.deepcopy(original_xfs[old])
                existing_alignment = clone.find('m:alignment', NS)
                if existing_alignment is not None: clone.remove(existing_alignment)
                desired_alignment = candidate_xfs[new].find('m:alignment', NS)
                if desired_alignment is not None: clone.append(copy.deepcopy(desired_alignment))
                signature = key(clone)
                if signature not in lookup:
                    lookup[signature] = len(original_xfs) + len(alignment_additions)
                    alignment_additions.append(clone)
                return lookup[signature]
        elif a.row_heights_only:
            styles, style_map, added_styles = original.read('xl/styles.xml'), {}, {}
        else:
            styles, style_map, added_styles = merge_styles(original.read('xl/styles.xml'), edited.read('xl/styles.xml'))
        if styles != original.read('xl/styles.xml'):
            updates['xl/styles.xml'] = styles
        names = [n.attrib['name'] for n in ET.fromstring(original.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)]
        edited_names = [n.attrib['name'] for n in ET.fromstring(edited.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)]
        for name, scope in SCOPES.items():
            if name not in edited_names:
                continue
            part = f'xl/worksheets/sheet{names.index(name)+1}.xml'
            candidate_part = f'xl/worksheets/sheet{edited_names.index(name)+1}.xml'
            updates[part], audit[name] = patch_sheet(original.read(part), edited.read(candidate_part), scope, style_map, a.row_heights_only, alignment_map)
        if alignment_additions:
            text = styles.decode('utf-8')
            found = re.search(r'<x:cellXfs\b[^>]*>.*?</x:cellXfs>', text, re.S)
            old = found.group()
            updated = re.sub(r'count="\d+"', f'count="{len(original_xfs)+len(alignment_additions)}"', old, count=1)
            updated = updated.replace('</x:cellXfs>', ''.join(xml_fragment(n) for n in alignment_additions) + '</x:cellXfs>')
            updates['xl/styles.xml'] = (text[:found.start()] + updated + text[found.end():]).encode('utf-8')
            added_styles = {'cellXfs': len(alignment_additions)}
        with zipfile.ZipFile(output, 'w') as out:
            for info in original.infolist():
                out.writestr(info, updates.get(info.filename, original.read(info.filename)))
    report = {'source': str(source.resolve()), 'candidate': str(candidate.resolve()), 'output': str(output.resolve()), 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'outputSha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'changedParts': sorted(updates), 'appendedStyles': added_styles, 'formatting': audit}
    Path(a.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'formatting'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
