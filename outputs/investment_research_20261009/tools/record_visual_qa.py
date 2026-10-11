"""Append only pages actually opened at original resolution to visual QA log."""
import argparse, datetime, hashlib, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--tag',required=True)
p.add_argument('--volume',type=int,required=True)
p.add_argument('--reviewer',default='integration')
p.add_argument('--pages',required=True,help='Comma-separated actual viewed pages/ranges')
p.add_argument('--note',default='Chinese glyphs, table borders, wrapping, charts, margins, headings and footer checked; no clipping or overlap observed')
p.add_argument('--result',default='pass',choices=['pass','issue'])
a=p.parse_args()
manifest=json.loads((ROOT/'qa'/f'report_render_manifest_{a.tag}.json').read_text(encoding='utf-8'))
volume=next(r for r in manifest['records'] if r['index']==a.volume)
pages=set()
for chunk in a.pages.split(','):
    bounds=[int(x) for x in chunk.split('-')]
    pages.update(range(bounds[0],bounds[-1]+1))
assert pages and min(pages)>0 and max(pages)<=volume['pages']
assert re.fullmatch(r'[a-zA-Z0-9_]+',a.reviewer),'Reviewer must be a simple identifier'
dst=ROOT/'qa'/f'visual_review_{a.tag}_{a.reviewer}.json'
data=json.loads(dst.read_text(encoding='utf-8')) if dst.exists() else {'reviewer':a.reviewer,'method':'Every recorded page opened through view_image with detail original; no contact-sheet substitution','records':[]}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for page in sorted(pages):
    original=next(x for x in volume['pageImages'] if x['page']==page)
    file=Path(original['path'])
    digest=hashlib.sha256(file.read_bytes()).hexdigest()
    assert digest==original['sha256'],'Rendered image changed after inspection'
    record={'tag':a.tag,'fingerprint':manifest['fingerprint'],'volume':a.volume,'page':page,'path':str(file),'sha256':digest,'result':a.result,'note':a.note,'openedAtOriginalResolution':True,'recordedAt':now}
    data['records']=[r for r in data['records'] if not(r['volume']==a.volume and r['page']==page and r['sha256']==digest)]+[record]
data['records'].sort(key=lambda r:(r['volume'],r['page']))
dst.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'saved':str(dst),'reviewed':len(data['records']),'addedPages':sorted(pages)},ensure_ascii=False))
