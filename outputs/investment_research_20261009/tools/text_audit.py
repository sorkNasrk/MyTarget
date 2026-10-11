import json,re,collections,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
B=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'))
records=[];allparas=collections.defaultdict(list)
all_models=B['models']+B.get('conditionedModels',[])
for iid in sorted(set(m['issuerId'] for m in all_models)):
    m=next(m for m in all_models if m['issuerId']==iid);file=ROOT/m.get('deepResearchFile','research/__pending__')
    if not file.exists():continue
    lines=file.read_text(encoding='utf-8').splitlines();body=[];sources=False
    for line in lines:
        if re.match(r'^#{1,6}\s*(来源|资料来源|主要来源)',line):sources=True
        if sources or line.startswith(('#','|','>','- ','---')) or re.match(r'^(价格基准|证券与价格基准|研究版本|编制日期|数据截止)',line):continue
        if re.search('https?://',line):continue
        if line.strip():body.append(line.strip())
    chinese=[''.join(re.findall(r'[\u3400-\u9fff]',p)) for p in body]
    counts=collections.Counter(chinese)
    exact=[{'count':n,'length':len(p),'sample':p[:80]}for p,n in counts.items() if n>1 and len(p)>60]
    for p in chinese:
        if len(p)>80:allparas[hashlib.sha256(p.encode()).hexdigest()].append({'issuerId':iid,'name':m['name'],'length':len(p),'sample':p[:80]})
    records.append({'issuerId':iid,'name':m['name'],'file':str(file),'effectiveHanziStrict':sum(map(len,chinese)),'paragraphs':len(chinese),'exactDuplicateParagraphs':exact,'characterPass':sum(map(len,chinese))>=10000,'exclusions':'headings, tables, block quotes, source bullets, metadata, URLs and entire source section'})
cross=[v for v in allparas.values() if len(set(x['issuerId'] for x in v))>1]
report={'asOf':B['asOf'],'version':B['version'],'records':records,'crossCompanyExactDuplicates':cross,'passed':all(r['characterPass'] and not r['exactDuplicateParagraphs'] for r in records) and not cross,'remaining':92-len(records),'note':'Exact duplicate detection plus human content review; near-duplicate semantic QA remains separate'}
(ROOT/'qa/text_audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'files':len(records),'passes':sum(r['characterPass'] for r in records),'totalEffectiveHanzi':sum(r['effectiveHanziStrict']for r in records),'duplicates':len(cross),'counts':[(r['name'],r['effectiveHanziStrict'])for r in records]},ensure_ascii=False))
