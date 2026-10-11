"""Compact final evidence summary without mutating the main workbook manifest."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'qa/risk_npv_layout_fix'
manifest=json.loads((BASE/'final_render_manifest.json').read_text(encoding='utf-8'))
evidence=[]
for file in BASE.glob('final_visual_*.json'):
    for record in json.loads(file.read_text(encoding='utf-8')).get('records',[]): evidence.append(record)
pending=[];passed=[];inherited=[]
for row in manifest['rows']:
    if row.get('evidenceOnly'):continue
    digest=hashlib.sha256(Path(row['file']).read_bytes()).hexdigest()
    records=[r for r in evidence if r['file']==row['file'] and r['sha256']==digest and r.get('openedAtOriginalResolution')]
    if any(r['result']=='pass' for r in records) and not any(r['result']=='issue' for r in records):
        passed.append(row)
    else:pending.append(row)
summary={'candidate':manifest['input'],'candidateSha256':hashlib.sha256(Path(manifest['input']).read_bytes()).hexdigest(),'renderedViews':len(manifest['rows']),'releaseViews':sum(not r.get('evidenceOnly') for r in manifest['rows']),'exactSHAActualOriginalPassViews':len(passed),'pending':pending}
(BASE/'native_final_review_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k!='pending'},ensure_ascii=False))
print(json.dumps([{'sheet':r['sheet'],'range':r['range'],'file':Path(r['file']).name} for r in pending],ensure_ascii=False))
