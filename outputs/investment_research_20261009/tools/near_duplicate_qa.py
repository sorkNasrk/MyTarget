import collections,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
B=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'))
paragraphs=[]; seen=set()
for m in B['models']+B.get('conditionedModels',[]):
    if m['issuerId'] in seen:continue
    seen.add(m['issuerId']);file=ROOT/m.get('deepResearchFile','research/__pending__')
    if not file.exists():continue
    sources=False
    for lineno,line in enumerate(file.read_text(encoding='utf-8').splitlines(),1):
        if re.match(r'^#{1,6}\s*(来源|资料来源|主要来源)',line):sources=True
        if sources or line.startswith(('#','|','>','- ','---')) or re.search('https?://',line) or re.match(r'^(价格基准|证券与价格基准|研究版本|编制日期|数据截止)',line):continue
        han=''.join(re.findall(r'[\u3400-\u9fff]',line))
        if len(han)<120:continue
        grams={han[i:i+7]for i in range(len(han)-6)}
        paragraphs.append({'issuerId':m['issuerId'],'name':m['name'],'file':str(file),'line':lineno,'han':han,'grams':grams})
inverted=collections.defaultdict(list)
for i,p in enumerate(paragraphs):
    for g in p['grams']:inverted[g].append(i)
candidates=collections.Counter()
for ids in inverted.values():
    if len(ids)>25:continue
    for j,a in enumerate(ids):
        for b in ids[j+1:]:candidates[(a,b)]+=1
matches=[]
for (a,b),common in candidates.items():
    pa,pb=paragraphs[a],paragraphs[b];x,y=len(pa['grams']),len(pb['grams'])
    if common<40 or common/min(x,y)<.30:continue
    overlap=len(pa['grams']&pb['grams']);containment=overlap/min(x,y);jaccard=overlap/(x+y-overlap)
    if containment<.45 and jaccard<.30:continue
    matches.append({'a':{k:pa[k]for k in ['issuerId','name','file','line']},'b':{k:pb[k]for k in ['issuerId','name','file','line']},'lengthA':len(pa['han']),'lengthB':len(pb['han']),'containment':round(containment,4),'jaccard':round(jaccard,4),'sampleA':pa['han'][:250],'sampleB':pb['han'][:250],'reviewStatus':'待人工判别共同事实、框架重复与凑字'})
matches.sort(key=lambda v:(-v['containment'],-v['jaccard']))
result={'asOf':B['asOf'],'bundleCreatedAt':B['createdAt'],'paragraphs':len(paragraphs),'companies':len(seen),'method':'7字词面shingle筛查；同义复述需人工审核，不声称是完整语义检测','matches':matches,'status':'人工复核候选后确认'}
(ROOT/'qa/near_duplicate_qa.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'paragraphs':len(paragraphs),'companies':len(seen),'candidates':len(matches),'top':matches[:10]},ensure_ascii=False))
