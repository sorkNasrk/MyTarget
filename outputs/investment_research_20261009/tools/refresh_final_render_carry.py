"""Refresh final92final carried records after sequential final source-9 rerender."""
import datetime
import json
from pathlib import Path
from fix_volume11_xtalpi_h2_font import sha

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'qa/report_render_manifest_final92final.json'
SOURCE = ROOT / 'qa/report_render_manifest_final92source.json'
BACKUP = ROOT / 'qa/report_render_manifest_final92final_before_carry_refresh.json'
assert not BACKUP.exists()
current = json.loads(TARGET.read_text(encoding='utf-8'))
source = json.loads(SOURCE.read_text(encoding='utf-8'))
assert current['fingerprint'] == source['fingerprint']
record11 = next(r for r in current['records'] if r['index'] == 11)
records = sorted([r for r in source['records'] if r['index'] != 11] + [record11], key=lambda r: r['index'])
assert [r['index'] for r in records] == list(range(13))
for record in records:
    assert sha(Path(record['file'])) == record['docxSHA256'], record['index']
    assert sha(Path(record['pdf'])) == record['pdfSHA256'], record['index']
    assert len(record['pageImages']) == record['pages']
    for image in record['pageImages']:
        assert sha(Path(image['path'])) == image['sha256']
BACKUP.write_bytes(TARGET.read_bytes())
current['records'] = records
current['carryRefresh'] = {'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'sourceManifest': str(SOURCE), 'sourceManifestSHA256': sha(SOURCE), 'retainedFreshVolume': 11, 'allCurrentDocxPdfAndPngHashesVerified': True}
TARGET.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'manifest': str(TARGET), 'passed': True, 'record9DocxSHA256': records[9]['docxSHA256'], 'record11DocxSHA256': records[11]['docxSHA256']}, ensure_ascii=False), flush=True)
