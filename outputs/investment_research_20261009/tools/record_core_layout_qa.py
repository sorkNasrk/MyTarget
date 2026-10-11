"""Append an explicitly reviewed saved-file render; never infer unseen passes."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'qa/risk_npv_layout_fix'
p = argparse.ArgumentParser()
p.add_argument('--files', required=True)
p.add_argument('--reviewer', required=True)
p.add_argument('--result', choices=['pass', 'issue'], default='pass')
p.add_argument('--note', required=True)
a = p.parse_args()
record_file = BASE / f'final_visual_{a.reviewer}.json'
data = json.loads(record_file.read_text(encoding='utf-8')) if record_file.exists() else {'reviewer': a.reviewer, 'method': 'Actual view_image detail original review of saved preserved workbook', 'records': []}
for name in a.files.split(','):
    file = BASE / 'final_renders' / name
    assert file.is_file(), file
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    width, height = Image.open(file).size
    record = {'file': str(file.resolve()), 'sha256': digest, 'width': width, 'height': height, 'openedAtOriginalResolution': True, 'result': a.result, 'note': a.note, 'at': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    data['records'] = [r for r in data['records'] if r['file'] != record['file']] + [record]
record_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'file': str(record_file), 'records': len(data['records'])}, ensure_ascii=False))
