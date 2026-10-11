"""Scan full DOCX/PDF text for untranslated evidence-confidence labels."""
import argparse, datetime, hashlib, json, re, sys, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PATTERN=re.compile(r'\b(?:high|medium|low)\b|null',re.I)
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def findings(text):
    # URLs contain source identifiers, not displayed confidence ratings.
    cleaned=re.sub(r'https?://\S+','',text)
    return [{'label':m.group(0),'context':cleaned[max(0,m.start()-70):m.end()+70]} for m in PATTERN.finditer(cleaned)]

def inspect_docx(path):
    hits=[]
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if not name.startswith('word/') or not name.endswith('.xml'):continue
            root=ET.fromstring(archive.read(name))
            for index,paragraph in enumerate(root.findall('.//w:p',NS),1):
                text=''.join(t.text or '' for t in paragraph.findall('.//w:t',NS))
                hits.extend({'part':name,'paragraph':index,**hit} for hit in findings(text))
    return {'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'type':'DOCX','findings':hits,'passed':not hits}

def inspect_pdf(path):
    from pypdf import PdfReader
    hits=[]
    reader=PdfReader(path)
    for page_index,page in enumerate(reader.pages,1):
        hits.extend({'page':page_index,**hit} for hit in findings(page.extract_text() or ''))
    return {'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'type':'PDF','pages':len(reader.pages),'findings':hits,'passed':not hits}

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--tag',help='Also scan PDFs in the named render manifest')
    args=parser.parse_args()
    bundle=json.loads((ROOT/'data/research_bundle.json').read_text(encoding='utf-8'))
    records=[inspect_docx(p) for p in sorted((ROOT/'deliverables').glob('*.docx'))]
    if args.tag:
        manifest=json.loads((ROOT/'qa'/f'report_render_manifest_{args.tag}.json').read_text(encoding='utf-8'))
        assert manifest['fingerprint']==bundle['fingerprint'],'Render manifest does not match active research fingerprint'
        for entry in manifest['records']:
            pdf=entry.get('pdf') or entry.get('pdfPath')
            if isinstance(pdf,dict):pdf=pdf.get('path')
            assert pdf,'Missing PDF path in render manifest'
            records.append(inspect_pdf(Path(pdf)))
    report={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fingerprint':bundle['fingerprint'],'method':'Full paragraph text in every word XML part and, when requested, every PDF page; standalone English high/medium/low labels scanned; URL identifiers excluded','records':records,'passed':len(records)>=13 and all(r['passed'] for r in records)}
    destination=ROOT/'qa'/('document_label_audit_'+args.tag+'.json' if args.tag else 'document_label_audit.json')
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'passed':report['passed'],'files':len(records),'findings':sum(len(r['findings']) for r in records),'report':str(destination)},ensure_ascii=False))
    if not report['passed']:sys.exit(1)
