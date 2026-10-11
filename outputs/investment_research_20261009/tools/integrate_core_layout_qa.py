"""Replace repaired workbook views while preserving indices and exact-SHA review evidence."""
import argparse, datetime, hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'qa/risk_npv_layout_fix'
p = argparse.ArgumentParser()
p.add_argument('--apply', action='store_true')
a = p.parse_args()
bundle = json.loads((ROOT / 'data/research_bundle.json').read_text(encoding='utf-8'))
finger = bundle['fingerprint']
main_file = ROOT / 'qa' / f'workbook_render_manifest_{finger}.json'
main = json.loads(main_file.read_text(encoding='utf-8'))
final = json.loads((BASE / 'final_render_manifest.json').read_text(encoding='utf-8'))
evidence = []
for file in BASE.glob('final_visual_*.json'):
    report = json.loads(file.read_text(encoding='utf-8'))
    for r in report.get('records', []): evidence.append(dict(r, evidenceFile=str(file)))
def sha(file): return hashlib.sha256(Path(file).read_bytes()).hexdigest()
valid = {}
pending = []
for view in final['rows']:
    if view.get('evidenceOnly'): continue
    digest = sha(view['file'])
    matches = [r for r in evidence if r['file'] == view['file'] and r['sha256'] == digest and r.get('openedAtOriginalResolution')]
    good = [r for r in matches if r['result'] == 'pass']
    if not good or any(r['result'] == 'issue' for r in matches): pending.append(view)
    else: valid[(view['sheet'], view['range'])] = good[-1]

# A repaired range may have been split to keep every original column legible.
split = {
    ('情景快照', 'M6:X14'): 'M6:V14',
    ('情景快照', 'Y6:AJ14'): 'Y6:Z14',
    ('情景快照', 'AK6:AP14'): 'AK6:AL14',
    ('评分', 'M6:W14'): 'M6:Q14',
    ('行情与技术', 'AB6:AN14'): 'AB6:AK14',
    ('条件估值参考', 'J6:R15'): 'J6:M15',
}
rows = [dict(v) for v in main['rows']]
replaced, appended, used = [], [], set()
records = []
def record(view, idx):
    r = valid[(view['sheet'], view['range'])]
    return {**r, 'view': idx, 'sheet': view['sheet'], 'range': view['range'], 'note': r['note'] + ' Exact SHA evidence linked to installed formatting-only workbook view.'}
for idx, old in enumerate(rows, 1):
    key = (old['sheet'], old['range'])
    desired = split.get(key, old['range'])
    match = next((v for v in final['rows'] if not v.get('evidenceOnly') and v['sheet'] == old['sheet'] and v['range'] == desired), None)
    if match:
        used.add((match['sheet'], match['range']))
        rows[idx-1] = {**match, 'status': '已原图视觉核验' if (match['sheet'], match['range']) in valid else '待视觉核验', 'replacesRange': old['range']}
        replaced.append({'view': idx, 'sheet': old['sheet'], 'beforeRange': old['range'], 'afterRange': match['range'], 'beforeFile': old['file'], 'afterFile': match['file']})
        if (match['sheet'], match['range']) in valid: records.append(record(match, idx))
for view in final['rows']:
    if view.get('evidenceOnly'): continue
    key = (view['sheet'], view['range'])
    if key in used: continue
    rows.append({**view, 'status': '已原图视觉核验' if key in valid else '待视觉核验'})
    appended.append({'view': len(rows), **view})
    if key in valid: records.append(record(view, len(rows)))
summary = {'fingerprint': finger, 'savedCandidate': final['input'], 'candidateSha256': sha(final['input']), 'viewsBefore': len(main['rows']), 'viewsAfter': len(rows), 'affectedViews': len(final['rows']), 'actualOriginalEvidenceViews': len(valid), 'pending': pending, 'replaced': replaced, 'appended': appended, 'passed': not pending}
if final.get('preservationAudit'):
    audit_file = Path(final['preservationAudit'])
    if not audit_file.is_absolute(): audit_file = ROOT / audit_file
    audit = json.loads(audit_file.read_text(encoding='utf-8'))
    assert audit['preservedExceptAuthorizedFormatting'], 'Preservation audit failed'
    assert audit['afterSha256'] == summary['candidateSha256'], 'Candidate differs from audited file'
    assert final['inputSha256'] == summary['candidateSha256'], 'Render input differs from candidate'
    hashes = {r['sheet']: r for r in audit['sheetXmlHashes']}
    rendered = {(r['sheet'], r.get('sourceViewIndex')) for r in final['rows']}
    missing_saved = [{'view': i, 'sheet': v['sheet'], 'range': v['range']} for i,v in enumerate(main['rows'],1) if not hashes[v['sheet']]['byteIdentical'] and (v['sheet'], i) not in rendered]
    for r in final['rows']:
        assert r['inputSha256'] == summary['candidateSha256'], 'Stale candidate render'
        assert r['currentXmlSha256'] == hashes[r['sheet']]['currentXmlSha256'], 'Stale sheet render'
    summary['missingChangedSheetSavedRanges'] = missing_saved
    summary['allChangedSheetOriginalRangesRendered'] = not missing_saved
    summary['passed'] = summary['passed'] and not missing_saved
if a.apply:
    assert not pending, 'Cannot integrate unreviwed views'
    assert summary['passed'], 'Candidate render coverage incomplete'
    main.update(rows=rows, layoutCandidateSha256=summary['candidateSha256'], layoutEvidence='qa/risk_npv_layout_fix/layout_integration.json')
    main_file.write_text(json.dumps(main, ensure_ascii=False, indent=2), encoding='utf-8')
    output = ROOT / 'qa' / f'workbook_visual_{finger}_layout_release.json'
    output.write_text(json.dumps({'fingerprint': finger, 'reviewer': 'layout_release', 'method': 'Actual original-resolution review; exact-SHA prior evidence inherited only when matching current saved-candidate render', 'records': records}, ensure_ascii=False, indent=2), encoding='utf-8')
    summary['appliedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
(BASE / 'layout_integration.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k not in ('replaced','appended')}, ensure_ascii=False))
