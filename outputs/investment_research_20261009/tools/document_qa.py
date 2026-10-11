import json, re, shutil
import argparse
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
records=[]
parser=argparse.ArgumentParser();parser.add_argument('--prefix',default='render_*');args=parser.parse_args()
for folder in sorted((ROOT/'qa').glob(args.prefix)):
    pages=sorted(folder.glob('page-*.png'),key=lambda p:int(re.search(r'page-(\d+)',p.name).group(1)))
    if not pages:continue
    for offset in range(0,len(pages),9):
        items=pages[offset:offset+9];canvas=Image.new('RGB',(1080,3*540),'#DCE2E7');draw=ImageDraw.Draw(canvas)
        for i,p in enumerate(items):
            im=Image.open(p).convert('RGB');im.thumbnail((350,495));x=(i%3)*360+(360-im.width)//2;y=(i//3)*540+25
            canvas.paste(im,(x,y));draw.text(((i%3)*360+10,(i//3)*540+6),p.name,fill='black')
        canvas.save(folder/f'contact-{offset//9+1}.png')
    pdfs=list(folder.glob('*.pdf'))
    if not pdfs:continue
    pdf=pdfs[0];reader=PdfReader(pdf)
    pagechecks=[]
    for i,page in enumerate(reader.pages,1):
        txt=page.extract_text() or ''
        pagechecks.append({'page':i,'textCharacters':len(txt),'replacementGlyphs':txt.count('\ufffd'),'hasHeader':'价格基准' in txt,'renderPNG':(folder/f'page-{i}.png').exists()})
    records.append({'folder':str(folder),'pdf':str(pdf),'pages':len(reader.pages),'allPNG':len(pages)==len(reader.pages),'pageChecks':pagechecks,'visualStatus':'待逐页联系表审查'})
(ROOT/'qa'/('document_render_audit_'+args.prefix.replace('*','').rstrip('_')+'.json')).write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{'folder':r['folder'],'pages':r['pages']}for r in records],ensure_ascii=False))
