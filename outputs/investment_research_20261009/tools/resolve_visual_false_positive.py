"""Preserve the reported issue and append an independently verified correction."""
import datetime, hashlib, json
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
log=ROOT/'qa/visual_review_final92charts_charts_v2c.json'
data=json.loads(log.read_text(encoding='utf-8'))
record=next(r for r in data['records'] if r['volume']==2 and r['page']==120)
manifest=json.loads((ROOT/'qa/report_render_manifest_final92charts.json').read_text(encoding='utf-8'))
volume=next(r for r in manifest['records'] if r['index']==2)
text=PdfReader(volume['pdf']).pages[119].extract_text()
assert '得到十九点二、四十五点五、七十二点六元' in text
assert hashlib.sha256(Path(record['path']).read_bytes()).hexdigest()==record['sha256']
record['independentResolution']={'reviewer':'root','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'originalResult':record['result'],'originalNote':record['note'],
    'evidence':'Root actually reopened original page120. PDF text and manuscript both read 十九点二; 0.8 × 24 = 19.2, matching source model. Initial issue was a glyph misread. No economics or text edits.'}
record['result']='pass'
record['note']='Independent original-image and PDF-text recheck resolves initial numerical false positive; all layout content readable.'
log.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'resolved':120,'volume':2,'noSourceChange':True}))
