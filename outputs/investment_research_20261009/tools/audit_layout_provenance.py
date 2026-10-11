"""Record layout-only rebuild provenance without rewriting frozen model metadata."""
import argparse, datetime, hashlib, json, re, sys
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def text_hash(path):
    text=''.join(page.extract_text() or '' for page in PdfReader(path).pages)
    return hashlib.sha256(re.sub(r'\s+','',text).encode('utf-8')).hexdigest()

parser=argparse.ArgumentParser()
parser.add_argument('--from-tag',required=True)
parser.add_argument('--to-tag',required=True)
args=parser.parse_args()
assert all(re.fullmatch(r'[a-zA-Z0-9_]+',tag) for tag in (args.from_tag,args.to_tag))
bundle=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'))
scores=json.loads((ROOT/'data/score_presentation.json').read_text(encoding='utf-8'))
old=json.loads((ROOT/'qa'/f'report_render_manifest_{args.from_tag}.json').read_text(encoding='utf-8'))
new=json.loads((ROOT/'qa'/f'report_render_manifest_{args.to_tag}.json').read_text(encoding='utf-8'))
assert old['fingerprint']==new['fingerprint']==bundle['fingerprint']==scores['fingerprint']
before={r['index']:r for r in old['records']}
records=[]
for record in sorted(new['records'],key=lambda r:r['index']):
    previous=before[record['index']]
    file=Path(record['file']);pdf=Path(record['pdf'])
    assert sha(file)==record['docxSHA256'] and sha(pdf)==record['pdfSHA256']
    old_hash=text_hash(Path(previous['pdf']));new_hash=text_hash(pdf)
    records.append({'volume':record['index'],'pagesBefore':previous['pages'],'pagesAfter':record['pages'],
                    'normalizedPDFTextSHA256Before':old_hash,'normalizedPDFTextSHA256After':new_hash,
                    'normalizedPDFTextUnchanged':old_hash==new_hash,'docxSHA256':record['docxSHA256'],
                    'pdfSHA256':record['pdfSHA256']})
result={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fromTag':args.from_tag,'toTag':args.to_tag,
        'fingerprint':bundle['fingerprint'],'currentLayoutHelperSHA256':sha(ROOT/'tools/build_reports.py'),
        'frozenScoreBuildSourceSHA256':scores['buildSourceSHA256'],
        'provenanceMeaning':'Frozen score metadata retains its score-generation source hash. Current helper hash records later presentation-only layout changes; model and content fingerprints remain unchanged.',
        'layoutChanges':['Numeric tokens in three narrow parameter tables placed on separate lines (final92layout).',
                         'Daily and weekly moving-average legends moved above axes, with title padding and four columns (final92charts).'],
        'sourceSnapshots':[{'path':str(p),'sha256':sha(p)} for p in [ROOT/'data/research_bundle.json',ROOT/'data/score_presentation.json']+sorted((ROOT/'research').rglob('*.md'))],
        'records':records,'passed':len(records)==13 and all(r['normalizedPDFTextUnchanged'] and r['pagesBefore']==r['pagesAfter'] for r in records)}
output=ROOT/'qa'/f'layout_provenance_{args.to_tag}.json'
output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':result['passed'],'volumes':len(records),'textDifferences':[r['volume'] for r in records if not r['normalizedPDFTextUnchanged']],'output':str(output)},ensure_ascii=False))
if not result['passed']:sys.exit(1)
