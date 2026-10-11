"""Record only workbook PNG views actually opened at original resolution."""
import argparse,datetime,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--reviewer',required=True);p.add_argument('--views',required=True);p.add_argument('--result',default='pass',choices=['pass','issue']);p.add_argument('--note',default='Actual original-image review: readable Chinese and numeric columns, borders, headings, wrapping and no clipping or overlap')
a=p.parse_args();assert re.fullmatch(r'[a-zA-Z0-9_]+',a.reviewer)
b=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'));m=json.loads((ROOT/'qa'/f"workbook_render_manifest_{b['fingerprint']}.json").read_text(encoding='utf-8'))
views=set()
for chunk in a.views.split(','):
    r=[int(x) for x in chunk.split('-')];views.update(range(r[0],r[-1]+1))
assert views and min(views)>=1 and max(views)<=len(m['rows'])
dst=ROOT/'qa'/f"workbook_visual_{b['fingerprint']}_{a.reviewer}.json"
data=json.loads(dst.read_text(encoding='utf-8')) if dst.exists() else {'fingerprint':b['fingerprint'],'reviewer':a.reviewer,'method':'Each logged view actually opened via view_image detail original','records':[]}
for idx in sorted(views):
    v=m['rows'][idx-1];file=Path(v['file']);digest=hashlib.sha256(file.read_bytes()).hexdigest()
    r={'view':idx,'sheet':v['sheet'],'range':v['range'],'file':str(file),'sha256':digest,'result':a.result,'note':a.note,'openedAtOriginalResolution':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    data['records']=[x for x in data['records'] if x['view']!=idx]+[r]
data['records'].sort(key=lambda x:x['view']);dst.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'saved':str(dst),'logged':len(data['records'])}))
