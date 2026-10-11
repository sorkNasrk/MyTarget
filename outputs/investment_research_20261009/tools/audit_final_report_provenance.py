"""Audit final pagination-only correction against frozen report economics."""
import argparse, collections, datetime, hashlib, json, re
from pathlib import Path
from pypdf import PdfReader
from docx import Document
from docx.oxml.ns import qn

ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def body(path):
    pages=PdfReader(path).pages
    text=''.join(p.extract_text() or '' for p in pages[2:])
    text=re.sub(r'\s+','',text)
    text=re.sub(r'医药与科技证券研究\|价格基准2026-10-09\|初版','',text)
    text=re.sub(r'研究假设可更新[•·]?\d+','',text)
    return text.replace('中（公开转述，期限多数null）','中（公开转述，目标期限多数未披露）').replace('中（公开新闻转述，期限null）','中（公开新闻转述，目标期限未披露）').replace('中（公开新闻转述，目标期限缺失null）','中（公开新闻转述，目标期限未披露）')

def source_text(path):
    document=Document(path)
    return {
        'paragraphs':[p.text for p in document.paragraphs],
        'tableParagraphs':[''.join(t.text or '' for t in node.iter(qn('w:t')))
            for table in document.tables for node in table._tbl.iter(qn('w:p'))],
    }

def physical_body_parts(path):
    """The fixed template body is between y=50 and y=740 on 612x792pt pages.

    Exclude headers/footers by position, rather than a digit-consuming footer
    regex which can consume a body year when extraction order changes.
    Isolate the audited 13pt Heading2 text from other body text.
    """
    ordinary,headings=[],[]
    for page in PdfReader(path).pages[2:]:
        assert tuple(float(x) for x in page.mediabox)==(0.0,0.0,612.0,792.0)
        def visit(text,cm,tm,font,size):
            if 50<tm[5]<740:
                (headings if size==13 else ordinary).append(text)
        page.extract_text(visitor_text=visit)
    return tuple(re.sub(r'\s+','',''.join(parts)) for parts in (ordinary,headings))

def verify_heading_font_correction(old,current):
    """Strict proof of the known H2 glyph-order repairs; no broad normalization."""
    typography=read('qa/final_report_typography_fix.json')
    volume=current['index']
    record=next(x for x in typography['records'] if x['index']==volume)
    assert typography['passed'] and record['paragraphAndTableTextUnchanged']
    assert sha(record['backup'])==record['beforeSHA256']==old['docxSHA256']
    exact_source=source_text(record['backup'])==source_text(current['file'])
    before_ordinary,before_h2=physical_body_parts(old['pdf'])
    after_ordinary,after_h2=physical_body_parts(current['pdf'])
    doc=Document(current['file'])
    heading_list=[p.text for p in doc.paragraphs if p.style.name=='Heading 2']
    tail_counts={9:3,11:23,12:len(heading_list)}
    tail_count=tail_counts[volume]
    expected_h2=re.sub(r'\s+','',''.join(heading_list[-tail_count:]))
    before_tail=before_h2[-len(expected_h2):]
    after_tail=after_h2[-len(expected_h2):]
    prefix_unchanged=before_h2[:-len(expected_h2)]==after_h2[:-len(expected_h2)]
    evidence={
        'frozenDOCXBackupSHA256':sha(record['backup']),
        'sourceParagraphAndTableTextExactlyUnchanged':exact_source,
        'nonHeadingPDFBodyTextExactlyUnchanged':before_ordinary==after_ordinary,
        'headingGlyphCountsExactlyPreserved':collections.Counter(before_h2)==collections.Counter(after_h2),
        'unmodifiedHeadingPrefixExactlyUnchanged':prefix_unchanged,
        'currentCorrectedPDFHeadingOrderExactlyMatchesDOCX':after_tail==expected_h2,
        'oldCorrectedPDFHeadingOrderMatchedDOCX':before_tail==expected_h2,
        'correctedTailHeadingCount':tail_count,'correctedHeadingTexts':heading_list[-tail_count:],
        'nonHeadingCharacters':len(after_ordinary),'headingCharacters':len(after_h2),
        'method':'Physical body bounds on fixed Letter template; 13pt Heading2 isolated. Frozen DOCX text exact; nonheading PDF sequence exact; heading glyph counts preserved, untouched heading prefix exact and corrected PDF heading tail exactly matches DOCX.',
        'ordinaryBodySHA256':hashlib.sha256(after_ordinary.encode('utf-8')).hexdigest(),
        'currentHeadingSHA256':hashlib.sha256(after_h2.encode('utf-8')).hexdigest(),
    }
    passed=all(evidence[k] for k in ['sourceParagraphAndTableTextExactlyUnchanged',
        'nonHeadingPDFBodyTextExactlyUnchanged','headingGlyphCountsExactlyPreserved',
        'unmodifiedHeadingPrefixExactlyUnchanged','currentCorrectedPDFHeadingOrderExactlyMatchesDOCX'])
    return passed,evidence

parser=argparse.ArgumentParser();parser.add_argument('--tag',default='final92ready');a=parser.parse_args()
assert re.fullmatch(r'[a-zA-Z0-9_]+',a.tag),'Render tag must be a simple identifier'
old=read('qa/report_render_manifest_final92charts.json')
new=read(f'qa/report_render_manifest_{a.tag}.json')
b=read('data/research_bundle.json')
assert old['fingerprint']==new['fingerprint']==b['fingerprint']
records=[]
for n in new['records']:
    o=next(x for x in old['records'] if x['index']==n['index'])
    assert sha(n['file'])==n['docxSHA256'] and sha(n['pdf'])==n['pdfSHA256']
    identical=sha(o['pdf'])==n['pdfSHA256']
    normalized=body(o['pdf'])==body(n['pdf']) if not identical else True
    font_evidence=None
    if n['index'] in [9,11,12] and not normalized:
        normalized,font_evidence=verify_heading_font_correction(o,n)
    records.append({'volume':n['index'],'beforePages':o['pages'],'afterPages':n['pages'],
        'PDFBytesUnchanged':identical,'bodyTextExcludingTOCHeadersAndFootersUnchanged':normalized,
        'headingFontCorrectionEvidence':font_evidence,
        'sourceDOCXSHA256':n['docxSHA256'],'sameSourcePDFSHA256':n['pdfSHA256']})
q={'fingerprint':b['fingerprint'],'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
   'passed':len(records)==13 and all(x['bodyTextExcludingTOCHeadersAndFootersUnchanged'] for x in records),
   'finalRenderTag':a.tag,
   'change':'Volume2 final Midea source paragraph compacted; one bibliography-only page removed, TOC and subsequent page numbers updated. Volume3 Kingdee H1 source paragraph font compacted to keep link label together. Volumes1/5/6 missing broker horizon labels translated from literal null to readable Chinese; three exact before/after labels normalized in body comparison and independently recorded. Final typography corrections use explicit Chinese heading fonts and compact source paragraphs; all body text is compared against the frozen source. No research economics, model, or source inputs changed.',
   'presentationReplacementAudit':'qa/volume6_confidence_label_fix.json',
   'otherPresentationReplacementAudit':'qa/other_confidence_label_fix.json',
   'priorLayoutAudit':'qa/layout_provenance_final92charts.json','records':records}
(ROOT/'qa/final_report_provenance.json').write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':q['passed'],'records':records},ensure_ascii=False))
assert q['passed']
