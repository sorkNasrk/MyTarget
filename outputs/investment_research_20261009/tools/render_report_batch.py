"""Sequential bundled DOCX rendering with reproducible source/output hashes."""
import argparse, datetime, hashlib, json, os, re, subprocess, sys
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
RENDER=Path(r'C:\Users\happyelements\.codex\plugins\cache\openai-primary-runtime\documents\26.1007.11041\skills\documents\render_docx.py')
def sha(file):return hashlib.sha256(file.read_bytes()).hexdigest()

parser=argparse.ArgumentParser()
parser.add_argument('--tag',default='stock91')
parser.add_argument('--start',type=int,default=0)
parser.add_argument('--end',type=int,default=12)
parser.add_argument('--carry-from-tag',help='Reuse unchanged volume records in a fresh render manifest')
args=parser.parse_args()
manifest=json.loads((ROOT/'qa/document_manifest.json').read_text(encoding='utf-8'))
files=[Path(p) for p in manifest['files']]
assert len(files)==13,'Expected one overview and 12 company volumes'
result_path=ROOT/'qa'/f'report_render_manifest_{args.tag}.json'
records=[]
if result_path.exists():
    prior=json.loads(result_path.read_text(encoding='utf-8'))
    if prior['fingerprint']==manifest['fingerprint']:records=prior['records']
elif args.carry_from_tag:
    assert re.fullmatch(r'[a-zA-Z0-9_]+',args.carry_from_tag),'Source tag must be a simple identifier'
    prior=json.loads((ROOT/'qa'/f'report_render_manifest_{args.carry_from_tag}.json').read_text(encoding='utf-8'))
    assert prior['fingerprint']==manifest['fingerprint'],'Cannot carry volumes across model versions'
    records=prior['records']
environment=os.environ.copy()
environment['PYTHONUTF8']='1'
environment['PATH']=os.pathsep.join([r'C:\Program Files\LibreOffice\program',r'C:\Users\happyelements\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin',environment.get('PATH','')])
for index in range(args.start,args.end+1):
    file=files[index]
    render_dir=ROOT/'qa'/f'render_{args.tag}_{index:02d}'
    log=ROOT/'qa'/f'render_{args.tag}_{index:02d}.log'
    before=sha(file)
    completed=next((r for r in records if r['index']==index and r['docxSHA256']==before and r['status']=='rendered'),None)
    if completed and Path(completed['pdf']).exists() and sha(Path(completed['pdf']))==completed['pdfSHA256']:
        print(json.dumps({'skippedVerifiedRender':index,'pages':completed['pages']},ensure_ascii=False),flush=True)
        continue
    print(json.dumps({'renderStarted':index,'file':str(file),'fingerprint':manifest['fingerprint']},ensure_ascii=False),flush=True)
    command=[sys.executable,str(RENDER),str(file),'--output_dir',str(render_dir),'--emit_pdf']
    with log.open('w',encoding='utf-8') as output:
        outcome=subprocess.run(command,env=environment,stdout=output,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW if sys.platform=='win32' else 0)
    if outcome.returncode:raise RuntimeError(f'Render failed index {index}; see {log}')
    assert sha(file)==before,'DOCX changed while rendering; abort to avoid stale manifest'
    pdf=render_dir/(file.stem+'.pdf')
    pages=len(PdfReader(pdf).pages)
    pngs=sorted(render_dir.glob('page-*.png'),key=lambda p:int(re.search(r'page-(\d+)',p.name)[1]))
    assert len(pngs)==pages,'PNG and PDF page counts differ'
    record={'index':index,'file':str(file),'fingerprint':manifest['fingerprint'],'docxSHA256':before,'pdf':str(pdf),'pdfSHA256':sha(pdf),'renderDir':str(render_dir),'pages':pages,'pageImages':[{'page':i+1,'path':str(p),'sha256':sha(p)} for i,p in enumerate(pngs)],'status':'rendered','visualQA':'not yet inspected','renderedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'renderer':str(RENDER),'log':str(log)}
    records=[r for r in records if r['index']!=index]+[record]
    result_path.write_text(json.dumps({'fingerprint':manifest['fingerprint'],'status':'rendered pages need 100 percent original-image visual QA','records':sorted(records,key=lambda r:r['index'])},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'renderCompleted':index,'pages':pages,'docxSHA256':before,'pdfSHA256':record['pdfSHA256']},ensure_ascii=False),flush=True)
