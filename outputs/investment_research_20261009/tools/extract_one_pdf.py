import sys
from pathlib import Path
import pypdfium2 as pdfium

file=Path(sys.argv[1])
pdf=pdfium.PdfDocument(str(file))
pages=[]
for i in range(len(pdf)):
    page=pdf[i]
    textpage=page.get_textpage()
    pages.append(f'\n[PDF PAGE {i+1}]\n'+textpage.get_text_range())
    textpage.close()
    page.close()
file.with_suffix('.pdfium.txt').write_text('\n'.join(pages),encoding='utf-8')
print(f'{file.name}: {len(pdf)} pages')
pdf.close()
