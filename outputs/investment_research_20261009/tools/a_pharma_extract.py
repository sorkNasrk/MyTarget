import sys
from pathlib import Path
import pypdfium2 as pdfium
base=Path('G:/MyTarget/outputs/investment_research_20261009')
for name in sys.argv[1:]:
    source=base/name
    pdf=pdfium.PdfDocument(str(source))
    text=[]
    for i in range(len(pdf)):
        page=pdf[i]
        tp=page.get_textpage()
        text.append(f'\n[PDF PAGE {i+1}]\n'+tp.get_text_range())
        tp.close()
        page.close()
    target=source.with_suffix('.pdfium.txt')
    target.write_text('\n'.join(text),encoding='utf8')
    print(str(target),len(pdf),'pages',sum(map(len,text)),'chars')
    pdf.close()
