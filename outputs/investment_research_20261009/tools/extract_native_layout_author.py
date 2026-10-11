"""Read only target text and existing heights for a compact Artifact Tool format donor."""
import json, re, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
NS = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
notes = [('映恩年度经营桥','AS',42,30),('再鼎年度经营桥','AP',50,30),('财务原值','F',52,23),('财务原值','G',66,23),('财务原值','J',110,23)]
headers = [('金山经营及权益假设','AC',22),('亚盛资金假设','U',27),('亚盛资金假设','AA',28),('亚盛资金假设','AB',28),('亚盛资金假设','AF',28),('阅文经营现金假设','I',24),('阅文经营现金假设','Y',26)]
output=[]
with zipfile.ZipFile(ROOT/'qa/risk_npv_layout_fix/preserved_final_notes.xlsx') as z:
    strings=[''.join(s.itertext()) for s in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    names=[s.attrib['name'] for s in ET.fromstring(z.read('xl/workbook.xml')).findall('m:sheets/m:sheet',NS)]
    for name in dict.fromkeys(n[0] for n in notes+headers):
        tree=ET.fromstring(z.read(f'xl/worksheets/sheet{names.index(name)+1}.xml'))
        rows=tree.findall('m:sheetData/m:row',NS);last=max(int(r.attrib['r']) for r in rows)
        defaults=tree.find('m:sheetFormatPr',NS)
        default_height=float(defaults.attrib.get('defaultRowHeight',15)) if defaults is not None else 15
        heights={int(r.attrib['r']):float(r.attrib.get('ht',default_height)) for r in rows}
        columns=[]
        for _,col,width,minimum in [n for n in notes if n[0]==name]:
            values={}
            for c in tree.findall('m:sheetData/m:row/m:c',NS):
                if re.sub(r'\d','',c.attrib['r'])!=col:continue
                row=int(re.sub(r'\D','',c.attrib['r']));v=c.find('m:v',NS)
                if row<7 or v is None:continue
                if c.attrib.get('t')=='s':values[row]=strings[int(v.text)]
                elif c.attrib.get('t')=='str':values[row]=v.text or ''
            columns.append({'column':col,'width':width,'minimum':minimum,'values':[[values.get(r,'')] for r in range(7,last+1)]})
        output.append({'sheet':name,'lastRow':last,'heights':heights,'columns':columns,'headers':[{'column':c,'width':w} for n,c,w in headers if n==name]})
file=ROOT/'qa/risk_npv_layout_fix/native_layout_author_input.json'
file.write_text(json.dumps(output,ensure_ascii=False),encoding='utf-8')
print(json.dumps({'output':str(file),'sheets':len(output),'textColumns':sum(len(s['columns']) for s in output)}))
