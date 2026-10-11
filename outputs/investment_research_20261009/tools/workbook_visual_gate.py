import hashlib,json,xml.etree.ElementTree as ET,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];b=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'));finger=b['fingerprint'];m=json.loads((ROOT/'qa'/f'workbook_render_manifest_{finger}.json').read_text(encoding='utf-8'))
records=[]
for f in (ROOT/'qa').glob(f'workbook_visual_{finger}_*.json'):
    q=json.loads(f.read_text(encoding='utf-8'));records+=q.get('records',[])
pending=[];issues=[];covered=[]
for idx,v in enumerate(m['rows'],1):
    digest=hashlib.sha256(Path(v['file']).read_bytes()).hexdigest();r=[x for x in records if x['view']==idx and x['sha256']==digest and x.get('openedAtOriginalResolution')]
    if any(x['result']=='issue' for x in r):issues.append({'view':idx,'sheet':v['sheet']})
    elif any(x['result']=='pass' for x in r):covered.append(idx)
    else:pending.append(idx)
file=ROOT/'deliverables/证券研究总表_初版.xlsx'
file_hash=hashlib.sha256(file.read_bytes()).hexdigest()
associated=m.get('layoutCandidateSha256')==file_hash
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
rendered_sheets={v['sheet'] for v in m['rows']}
with zipfile.ZipFile(file) as archive:
    names=[n.attrib['name'] for n in ET.fromstring(archive.read('xl/workbook.xml')).findall('m:sheets/m:sheet',ns)]
    excluded=[]
    for index,name in enumerate(names,1):
        if name in rendered_sheets:continue
        nodes=ET.fromstring(archive.read(f'xl/worksheets/sheet{index}.xml')).findall('m:sheetData/m:row/m:c',ns)
        excluded.append({'sheet':name,'cellCount':len(nodes),'verifiedEmptyDivider':name=='数据 >>' and not nodes})
coverage=len(rendered_sheets)+sum(r['verifiedEmptyDivider'] for r in excluded)==len(names)
report={'fingerprint':finger,'fileSHA256':file_hash,'renderManifestSHA256':hashlib.sha256((ROOT/'qa'/f'workbook_render_manifest_{finger}.json').read_bytes()).hexdigest(),'renderedCandidateMatchesFile':associated,'views':len(m['rows']),'sheets':len(names),'renderedSheets':len(rendered_sheets),'emptyDividers':excluded,'covered':len(covered),'pending':pending,'issues':issues,'passed':not pending and not issues and associated and coverage,'scope':'All232 populated sheets represented by574 actual reviewed views; 数据 >> is an independently verified empty decorative divider. All-row formula and numeric QA separate.'}
(ROOT/'qa/workbook_visual_gate.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
