"""Release files only when current research, numbers, and visual gates pass."""
import argparse,datetime,hashlib,json,re,shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--release',action='store_true');parser.add_argument('--tag',default='final92ready');a=parser.parse_args()
assert re.fullmatch(r'[a-zA-Z0-9_]+',a.tag),'Render tag must be a simple identifier'
b=read('data/research_bundle.json');finger=b['fingerprint'];checks=[]
def check(name,passed,detail=None): checks.append({'name':name,'passed':bool(passed),'detail':detail})
def required(file,predicate=lambda q:q.get('passed') is True):
    try:q=read(file);ok=predicate(q);check(file,ok);return q
    except (OSError,ValueError) as error:check(file,False,str(error));return {}

stocks=[x for x in b['universe']['securities'] if x['type']=='股票'];allmodels=b['models']+b['conditionedModels']
check('92 companies and96 stock securities',len(stocks)==96 and len({x['issuerId'] for x in stocks})==92 and len(allmodels)==96)
check('91 ranked and5 conditional with no formal rank',len(b['models'])==91 and len(b['conditionedModels'])==5)
content=[]
for c in b['status']['companies']:
    text=(ROOT/c['deepResearchFile']).read_text(encoding='utf-8');lines=[];source=False
    for line in text.splitlines():
        if re.match(r'^#{1,6}\s*(来源|资料来源|主要来源)',line):source=True
        if not source and not re.match(r'^(#|\||>|- |---)',line) and not re.match(r'^(价格基准|证券与价格基准|研究版本|编制日期|数据截止)',line) and not re.search(r'https?://',line):lines.append(line)
    count=len(re.findall(r'[\u3400-\u9fff]','\n'.join(lines)))
    content.append({'issuerId':c['issuerId'],'name':c['name'],'effectiveHan':count,'SHA256':sha(ROOT/c['deepResearchFile'])})
    check(c['name']+'10000 effectiveHan',count>=10000 and count==c['effectiveHanCharacters'],count)
prior=required('qa/layout_provenance_final92charts.json')
for entry in prior.get('sourceSnapshots',[]):check('frozen source '+entry['path'],sha(entry['path'])==entry['sha256'])
required('qa/ranking_broker_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
required('qa/calendar_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
workbook=required('qa/workbook_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger and q.get('fileSHA256')==sha(ROOT/'deliverables/证券研究总表_初版.xlsx'))
required('qa/workbook_refresh_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
crossformat=required('qa/crossformat_qa.json',lambda q:q.get('passed') and q.get('coveredIssuers')==92 and q.get('fingerprint')==finger)
for file,digest in crossformat.get('inputSHA256',{}).items():check('crossformat current file '+file,sha(file)==digest)
check('crossformat has workbook and13 DOCX hashes',len(crossformat.get('inputSHA256',{}))==14)
required('qa/near_duplicate_qa.json',lambda q:q.get('companies')==92 and q.get('matches')==[])
required('qa/report_scope_audit.json',lambda q:q.get('passed') and q.get('fingerprintObserved')==finger)
provenance=required('qa/final_report_provenance.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
labels=required(f'qa/document_label_audit_{a.tag}.json')
for record in labels.get('records',[]):check('label audit current file '+record['path'],sha(record['path'])==record['sha256'])
visual=required(f'qa/visual_transfer_{a.tag}.json',lambda q:q.get('passed') and q.get('pendingPages')==0 and q.get('fingerprint')==finger)
wv=required('qa/workbook_visual_gate.json',lambda q:q.get('passed') and q.get('sheets')==233 and q.get('fingerprint')==finger and q.get('fileSHA256')==sha(ROOT/'deliverables/证券研究总表_初版.xlsx') and q.get('renderManifestSHA256')==sha(ROOT/'qa'/f'workbook_render_manifest_{finger}.json'))
layout=required('qa/workbook_layout_release.json',lambda q:q.get('passed') and q.get('fingerprint')==finger and q.get('fileSHA256')==sha(ROOT/'deliverables/证券研究总表_初版.xlsx'))
for file,digest in layout.get('evidenceSHA256',{}).items():check('layout evidence current '+file,sha(ROOT/file)==digest)
for file in ['qa/web_data_qa.json','qa/web_browser_qa.json']:
    webq=required(file,lambda q:q.get('passed') and q.get('fingerprint')==finger and (file.endswith('web_data_qa.json') or q.get('securityOverviewChecks')==96))
    check(file+' four current web input hashes',len(webq.get('inputSHA256',{}))==4 and all(sha(ROOT/p)==digest for p,digest in webq.get('inputSHA256',{}).items()))
    if (ROOT/'qa/final_delivery_manifest.json').exists():
        previous_release=read('qa/final_delivery_manifest.json')
        if previous_release.get('passed') and previous_release.get('fingerprint')==finger:
            check(file+' all27 released downloads verified',webq.get('deliveryChecks',webq.get('downloadChecks'))==27)
required('qa/web_visual_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
if (ROOT/'web/scenario-math.js').exists():
    math=required('qa/web_expectation_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
    check('scenario math current frozen inputs',math.get('helperSHA256')==sha(ROOT/'web/scenario-math.js') and math.get('bundleSHA256')==sha(ROOT/'data/research_bundle.json') and math.get('webDataSHA256')==sha(ROOT/'web/data.js'))
    interaction=required('qa/web_interaction_qa.json',lambda q:q.get('passed') and q.get('fingerprint')==finger)
    check('interactive web five current input hashes',len(interaction.get('inputSHA256',{}))==5 and all(sha(ROOT/p)==digest for p,digest in interaction.get('inputSHA256',{}).items()))
toc=required('qa/toc_audit.json',lambda q:len(q)==13 and all(x['indexes']==1 for x in q))
render=read(f'qa/report_render_manifest_{a.tag}.json');check('13 same-source rendered volumes',len(render['records'])==13 and render['fingerprint']==finger)
for v in render['records']:
    check('DOCX/PDF hash volume'+str(v['index']),sha(v['file'])==v['docxSHA256'] and sha(v['pdf'])==v['pdfSHA256'])
    pr=next((r for r in provenance.get('records',[]) if r['volume']==v['index']),{})
    check('provenance current volume'+str(v['index']),pr.get('sourceDOCXSHA256')==v['docxSHA256'] and pr.get('sameSourcePDFSHA256')==v['pdfSHA256'])
    reviewed={(r['volume'],r['page']):r['sha256'] for r in visual.get('records',[])}
    check('visual hash coverage volume'+str(v['index']),all(reviewed.get((v['index'],p['page']))==p['sha256'] and sha(p['path'])==p['sha256'] for p in v['pageImages']))

passed=all(x['passed'] for x in checks)
q={'fingerprint':finger,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':False,
   'preflightPassed':passed,'scope':'92 companies /96 stock securities; excluded funds, indices and leverage products',
   'effectiveHanTotal':sum(x['effectiveHan'] for x in content),'companies':content,
   'reportPages':sum(v['pages'] for v in render['records']),'finalRenderTag':a.tag,'checks':checks,'files':[],
   'limitations':['Frozen information cutoff2026-10-09; no realtime updates.','Five conditional securities remain unranked.','Unpublished trading calendars unresolved; future dates are model assumptions.','Broker public summaries are distinguished from original reports; judgment scenario weights are not statistical probabilities.']}
if a.release and passed:
    for v in render['records']:
        dest=ROOT/'deliverables'/(Path(v['file']).stem+'.pdf');shutil.copy2(v['pdf'],dest)
        assert sha(dest)==v['pdfSHA256']
    files=sorted((ROOT/'deliverables').glob('*'))
    final=[p for p in files if p.suffix in ('.xlsx','.docx','.pdf')]
    assert len(final)==27 and sum(p.suffix=='.docx' for p in final)==13 and sum(p.suffix=='.pdf' for p in final)==13
    q['files']=[{'name':p.name,'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}for p in final]
    q['passed']=True
    (ROOT/'qa/final_delivery_manifest.json').write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding='utf-8')
    d=read('qa/document_manifest.json');d['status']='完整内容与模型核验通过，逐页原图核验通过，同源PDF已交付';d['finalRenderTag']=a.tag;d['finalDeliveryManifest']='qa/final_delivery_manifest.json'
    (ROOT/'qa/document_manifest.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
else:(ROOT/'qa/final_delivery_preflight.json').write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'preflightPassed':passed,'released':q['passed'],'checks':len(checks),'effectiveHan':q['effectiveHanTotal'],'failed':[x for x in checks if not x['passed']]},ensure_ascii=False))
if a.release and not passed:raise SystemExit(1)
