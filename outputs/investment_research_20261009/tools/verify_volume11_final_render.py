"""Attach exact render and source-preserving verification to the local font audits."""
import datetime
import json
from pathlib import Path

from docx import Document
from fix_final_report_typography import text_snapshot, text_hash
from fix_volume11_xtalpi_h2_font import sha, targets, verify_run

ROOT = Path(__file__).resolve().parents[1]
TAG = 'final92clean'
manifest_path = ROOT / 'qa' / f'report_render_manifest_{TAG}.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
assert [r['index'] for r in manifest['records']] == list(range(13))
for record in manifest['records']:
    assert sha(Path(record['file'])) == record['docxSHA256']
    assert sha(Path(record['pdf'])) == record['pdfSHA256']
    assert len(record['pageImages']) == record['pages']
    for image in record['pageImages']:
        assert sha(Path(image['path'])) == image['sha256']
current = manifest['records'][11]
old = json.loads((ROOT / 'qa/report_render_manifest_final92type.json').read_text(encoding='utf-8'))['records'][11]
intermediate = json.loads((ROOT / 'qa/report_render_manifest_final92final.json').read_text(encoding='utf-8'))['records'][11]
transfer = json.loads((ROOT / 'qa/visual_transfer_final92clean_heading11_audit.json').read_text(encoding='utf-8'))
summary = next(r for r in transfer['summaries'] if r['volume'] == 11)
assert summary['coveredPages'] == 165 and summary['pendingPages'] == 0
document = Document(current['file'])
_, headings = targets(document)
for _, paragraph in headings:
    for run in paragraph.runs:
        verify_run(run)
for audit_name in ['volume11_xtalpi_h2_font_fix.json', 'volume11_xtalpi_source_language_fix.json']:
    audit_path = ROOT / 'qa' / audit_name
    audit = json.loads(audit_path.read_text(encoding='utf-8'))
    assert text_snapshot(Document(audit['backup'])) == text_snapshot(document)
    audit['finalVerifiedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    audit['finalRenderTag'] = TAG
    audit['finalDocxSHA256'] = current['docxSHA256']
    audit['finalPDFSHA256'] = current['pdfSHA256']
    audit['finalTextSHA256'] = text_hash(text_snapshot(document))
    audit['finalParagraphAndTableTextUnchangedFromBackup'] = True
    audit['finalPages'] = current['pages']
    audit['originalTypeChangedPNGs'] = [p['page'] for p in current['pageImages'] if p['sha256'] != old['pageImages'][p['page'] - 1]['sha256']]
    audit['sourceLanguageOnlyChangedPNGs'] = [p['page'] for p in current['pageImages'] if p['sha256'] != intermediate['pageImages'][p['page'] - 1]['sha256']]
    audit['finalVisualReviewCoverage'] = summary
    audit['finalVisualReviewAudit'] = str(ROOT / 'qa/visual_transfer_final92clean_heading11_audit.json')
    audit['all13ManifestDocxPdfAndPNGHashesVerified'] = True
    audit_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'passed': True, 'tag': TAG, 'manifest': str(manifest_path), 'manifestSHA256': sha(manifest_path), 'volume11': summary, 'docxSHA256': current['docxSHA256'], 'pdfSHA256': current['pdfSHA256'], 'textSHA256': text_hash(text_snapshot(document))}, ensure_ascii=False), flush=True)
