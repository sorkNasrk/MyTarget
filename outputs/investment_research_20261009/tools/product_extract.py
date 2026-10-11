import json
from pathlib import Path
import pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parents[1]
for file in (ROOT/'data/product_raw').glob('*.pdf'):
    dest=file.with_suffix('.pdfium.txt')
    if dest.exists():continue
    try:
        pdf=pdfium.PdfDocument(file)
        pages=[]
        for i in range(len(pdf)):
            page=pdf[i];text=page.get_textpage();pages.append(f'\n=== PDF PAGE {i+1} ===\n'+text.get_text_range());text.close();page.close()
        dest.write_text('\n'.join(pages),encoding='utf-8');print(file.name,len(pdf))
        pdf.close()
    except Exception as exc:print(file.name,str(exc))
