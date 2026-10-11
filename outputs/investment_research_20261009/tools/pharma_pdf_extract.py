import json
from pathlib import Path
import pypdfium2 as pdfium

root = Path('G:/MyTarget/outputs/investment_research_20261009')
data = json.loads((root/'data/pharma_reports.json').read_text(encoding='utf-8'))
for company in data:
    for report in company['reports']:
        if 'rawFile' not in report:
            continue
        pdf = pdfium.PdfDocument(str(root/report['rawFile']))
        pages = []
        for index in range(len(pdf)):
            page = pdf[index]
            textpage = page.get_textpage()
            pages.append(f'\n[PDF PAGE {index+1}]\n'+textpage.get_text_range())
            textpage.close()
            page.close()
        text = '\n'.join(pages)
        target = Path(report['rawFile']).with_suffix('.pdfium.txt')
        (root/target).write_text(text, encoding='utf-8')
        report['verifiedTextFile'] = target.as_posix()
        report['pageCount'] = len(pdf)
        report['verifiedTextLength'] = len(text)
        pdf.close()
    print(company['name']+' '+str(len(company['reports'])), flush=True)
(root/'data/pharma_reports.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
