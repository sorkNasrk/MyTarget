"""Read-only checks of the shared research model, XLSX and document target tables."""
import hashlib, json, re
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph
from openpyxl import load_workbook

ROOT=Path(__file__).resolve().parents[1]
B=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'))
ALL_MODELS=B['models']+B.get('conditionedModels',[])
M=json.loads((ROOT/'qa/document_manifest.json').read_text(encoding='utf-8'))
W=json.loads((ROOT/'qa/workbook_manifest.json').read_text(encoding='utf-8'))
errors=[];checks=0;covered=set()
def check(actual,expected,context):
    global checks
    checks+=1
    if actual!=expected: errors.append({'context':context,'actual':actual,'expected':expected})
def num(v):return '—' if v is None else f'{v:,.2f}'
def pct(v):return '—' if v is None else f'{v:+.2%}'
check(M['fingerprint'],B['fingerprint'],'DOCX manifest fingerprint')
check(W['fingerprint'],B['fingerprint'],'XLSX manifest fingerprint')
book=load_workbook(ROOT/W['file'],read_only=True,data_only=True)
check(book['说明']['B24'].value,B['fingerprint'],'XLSX embedded version')
for file in M['files']:
    d=Document(file)
    check(d.core_properties.subject,'研究数据版本 '+B['fingerprint'],Path(file).name+' core version')
    if Path(file).name.startswith('00_'):
        targets=next(t for t in d.tables if t.cell(0,0).text=='证券/币种')
        check(len(targets.rows)-1,len(B['models']),'overview security target count')
        for row,m in zip(targets.rows[1:],B['models']):
            s=m['scenarios']['yearEnd']
            expected=[m['name']+'\n'+m['code']+' '+m['currency'],num(m['price'])]+[num(x['price'])for x in s['cases']]+[num(s['expectedPrice']),pct(s['expectedPrice']/m['price']-1)]
            check([c.text for c in row.cells],expected,'overview '+m['code'])
        continue
    current=None;table_index=0
    for child in d.element.body.iterchildren():
        if child.tag==qn('w:p'):
            text=Paragraph(child,d).text
            match=re.match(r'^([0-9A-Z.]+) (?:现价|参考价) ',text)
            if match:current=next(m for m in ALL_MODELS if m['code']==match.group(1));table_index=0;covered.add(current['issuerId'])
        elif child.tag==qn('w:tbl') and current:
            t=Table(child,d);header=t.cell(0,0).text
            if current.get('rankEligible') is False:
                if header=='条件参考期限':
                    for row,(h,sc) in zip(t.rows[1:],current.get('conditionalScenarios',{}).items()):
                        prices=sc.get('priceHKD',sc.get('priceCNY',sc.get('priceTargets',[None]*3)))
                        check([c.text for c in row.cells],[B['labels'][h],sc.get('target','待核')]+[num(v)for v in prices],current['code']+' '+h+' conditional reference')
                continue
            # The manuscript may carry its own narrower score table. Compare the
            # generated six-column summary exactly; count one of each per security.
            if header=='期限' and len(t.rows[0].cells)==6 and t.cell(0,1).text=='得分/100' and t.cell(0,2).text in ('样本内梯队','推荐梯队','全榜梯队'):
                for row,h in zip(t.rows[1:],['halfYear','oneYear','threeYear','fiveYear']):
                    sc=current['scenarios'][h]['cases'][1]
                    expected=[B['labels'][h],num(current['scores'][h]['total']),None,num(sc['price']),pct(sc['priceReturn']),pct(sc['totalReturn'])]
                    for i,v in enumerate(expected):
                        if v is not None:check(row.cells[i].text,v,current['code']+' '+h+' score table col '+str(i))
            elif header=='年底情景' and t.cell(0,1).text=='目标价' and t.cell(0,2).text=='涨跌幅' and t.cell(0,3).text=='情景权重':
                for row,c in zip(t.rows[1:],range(3)):
                    sc=current['scenarios']['yearEnd']['cases'][c]
                    check(row.cells[1].text,num(sc['price']),current['code']+' yearEnd price '+str(c))
                    check(row.cells[2].text,pct(sc['priceReturn']),current['code']+' yearEnd return '+str(c))
            elif header=='期限' and t.cell(0,1).text=='悲观价格/涨幅':
                for row,h in zip(t.rows[1:],['halfYear','oneYear','threeYear','fiveYear']):
                    expected=[B['labels'][h]]+[num(sc['price'])+'\n'+pct(sc['priceReturn'])for sc in current['scenarios'][h]['cases']]+[pct(current['scenarios'][h]['cases'][1]['annualized'])]
                    check([c.text for c in row.cells],expected,current['code']+' '+h+' three-case table')
check(len(covered),B['status']['summary']['deepResearchPassed'],'DOCX issuer coverage')
report={'fingerprint':B['fingerprint'],'inputSHA256':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/W['file'],*[Path(f) for f in M['files']]]},'checks':checks,'coveredIssuers':len(covered),'models':len(B['models']),'errors':errors,'passed':not errors,'scope':'model summary tables and embedded versions; manuscript factual verification and latest PDF visual review are separate prerequisites'}
(ROOT/'qa/crossformat_qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
if errors:raise SystemExit(1)
