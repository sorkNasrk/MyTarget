import ast, copy, hashlib, importlib.util, json, os, sys, tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
build=ROOT/'tools/build_reports.py'
source=build.read_text(encoding='utf-8')
ast.parse(source)
spec=importlib.util.spec_from_file_location('report_scope_build',build)
module=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=module
spec.loader.exec_module(module)
B=module.B
checks=[]
def write_json_atomic(destination,data):
    """Replace generated metadata atomically, including when an old file is open."""
    descriptor,name=tempfile.mkstemp(prefix=destination.stem+'_',suffix='.tmp',dir=destination.parent)
    os.close(descriptor)
    temporary=Path(name)
    try:
        temporary.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        os.replace(temporary,destination)
    finally:
        if temporary.exists():temporary.unlink()
def check(name,condition,details=None):
    checks.append({'name':name,'passed':bool(condition),'details':details})

check('Python syntax parses',True)
check('Confidence label presentation faithfully maps three labels',module.display_confidence({'a':'high','b':'medium','c':'low'})=={'a':'高','b':'中','c':'低'})
check('Confidence presentation leaves numeric evidence unchanged',module.display_confidence({'value':3.5,'reason':'中等可信；现金237.06亿元'})=={'value':3.5,'reason':'中等可信；现金237.06亿元'})
check('Evidence table fields display in Chinese',list(map(module.display_evidence_field,['fundamentals','technical','valuation','institutionTargets']))==['基本面','量价','估值','机构目标'])
check('Evidence table alternate field names display in Chinese',list(map(module.display_evidence_field,['primaryFundamentals','brokerTargets']))==['基本面主源','机构目标'])
check('Unknown evidence field is preserved',module.display_evidence_field('specialClinicalEvidence')=='specialClinicalEvidence')
check('Compound numeric price cells break between prices',module.display_table_text('2.13/37.50/103.52')=='2.13 / 37.50 / 103.52' and module.display_table_text('0.38/37.25/119.48')=='0.38 / 37.25 / 119.48')
check('Plain numeric and source cells keep exact display text',module.display_table_text('103.52')=='103.52' and module.display_table_text('https://example.test/source.pdf')=='https://example.test/source.pdf')
insilico_note,insilico_headers=module.conditional_presentation({'issuerId':'I008'})
check('Insilico unfinanced plan presentation distinguishes funding pressure from fair price','未融资完整计划的现金压力参考' in insilico_note and '0值不是近期期望价或清算价' in insilico_note and '融资、存续或复牌条件成立后' not in insilico_note)
check('Insilico conditional table labels all three cases cash pressure',insilico_headers[2:]==['悲观现金压力参考','基准现金压力参考','乐观现金压力参考'])
check('Other conditional presentation retains financing or resumption basis','融资、存续或复牌条件成立后的估值参考' in module.conditional_presentation({'issuerId':'I009'})[0])
check('Scope securities all stocks',all(s['type']=='股票' for s in module.coverage_state()['stocks']))
check('Current stock scope counts',module.coverage_state()['issuers']==92 and module.coverage_state()['securities']==96)
groups=module.volume_groups()
flat=[iid for group in groups for iid in group]
check('Current groups have no issuer duplicates',len(set(flat))==len(flat))
check('Current group sizes stay within prescribed volumes',all(len(g)<=module.VOLUME_SIZES[i] for i,g in enumerate(groups)))
check('Volume schedule equals 92',sum(module.VOLUME_SIZES)==92 and module.VOLUME_SIZES==[8]*8+[7]*4)
complete=copy.deepcopy(B)
ids={s['issuerId'] for s in complete['universe']['securities'] if s['type']=='股票'}
existing={m['issuerId'] for m in complete['models']+complete.get('conditionedModels',[])}
for iid in ids-existing:
    security=next(s for s in complete['universe']['securities'] if s['issuerId']==iid)
    complete['models'].append({'issuerId':iid,'code':security['code'],'scores':{}})
for company in complete['status']['companies']:
    if company['issuerId'] in ids:company['effectiveHanCharacters']=max(10000,company.get('effectiveHanCharacters',0))
complete['status']['summary'].update({'issuerModels':92,'securityModels':96,'deepResearchPassed':92,'remainingDeepResearch':0})
check('Complete fixture activates full coverage wording',module.coverage_state(complete)['complete'])
complete_text=module.research_scope_text(complete)
check('Complete wording removes pending companies',not any(t in complete_text for t in ['待补齐','尚在编制','未完成','剩余']))
check('Complete groups have exact 8x8 plus 4x7',list(map(len,module.volume_groups(complete)))==[8]*8+[7]*4)
check('Complete grouping covers all issuers once',len(set(iid for group in module.volume_groups(complete) for iid in group))==92)
method=module.stock_market_method()
check('Market method has no separate product research',not any(t in method for t in ['103项','ETF','07709','159502','杠杆','## 指数基准与适用范围']))
leaders=[]
presentation=[]
for horizon in module.HORIZONS:
    ranking=[r for r in B['rankings'][horizon] if r['topTenDistinct']]
    check(horizon+' has ten distinct company leaders',len(ranking)==10 and len({r['issuerId'] for r in ranking})==10)
    for r in ranking:
        model=next(m for m in B['models'] if m['code']==r['code'])
        rows=module.score_dimension_details(model,horizon)
        check(horizon+' '+r['code']+' six score dimensions preserved',len(rows)==6 and [x['score'] for x in rows]==model['scores'][horizon]['dimensions'])
        check(horizon+' '+r['code']+' weights sum to 100',sum(x['weight'] for x in rows)==100)
        leaders.append({'horizon':horizon,'code':r['code'],'name':r['name'],'reasonCount':sum(bool(x['reason']) for x in rows)})
for model in B['models']:
    for horizon in module.HORIZONS:
        rows=module.score_dimension_details(model,horizon)
        check(horizon+' '+model['code']+' all six display reasons nonempty',len(rows)==6 and all(isinstance(r['reason'],str) and r['reason'].strip() for r in rows))
        check(horizon+' '+model['code']+' display scores and weights unchanged',[r['score'] for r in rows]==model['scores'][horizon]['dimensions'] and [r['weight'] for r in rows]==B['weights'][horizon])
        presentation.append({'issuerId':model['issuerId'],'securityId':model['securityId'],'code':model['code'],'name':model['name'],'horizon':horizon,'rows':rows})
presentation_data={'fingerprint':B['fingerprint'],'createdAt':B['createdAt'],'buildSourceSHA256':hashlib.sha256(source.encode()).hexdigest(),'purpose':'Shared Chinese score evidence presentation for DOCX and Excel; numeric model scores unchanged; sourceBasis distinguishes issuer prose summaries','securities':len(B['models']),'horizons':module.HORIZONS,'rows':presentation}
write_json_atomic(ROOT/'data/score_presentation.json',presentation_data)
report={'createdAt':B['createdAt'],'fingerprintObserved':B.get('fingerprint'),'buildSourceSHA256':hashlib.sha256(source.encode()).hexdigest(),'scope':'read-only report-builder syntax and data structure; no DOCX rebuild or visual QA claimed','checks':len(checks),'passed':all(x['passed'] for x in checks),'details':checks,'leaders':leaders,'currentCoverage':module.coverage_state()['summary'],'currentGroups':groups,'completeFixtureGroups':module.volume_groups(complete)}
write_json_atomic(ROOT/'qa/report_scope_audit.json',report)
print(json.dumps({'checks':report['checks'],'passed':report['passed'],'failures':[x for x in checks if not x['passed']],'missingStructuredReasons':[r for r in leaders if r['reasonCount']==0]},ensure_ascii=False))
if not report['passed']:sys.exit(1)
