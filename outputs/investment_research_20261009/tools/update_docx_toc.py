"""Use LibreOffice's native Writer layout engine to update TOCs before rendering."""
import sys, subprocess, time, tempfile, json
from pathlib import Path
import uno
from com.sun.star.beans import PropertyValue

ROOT=Path(__file__).resolve().parents[1]
def prop(name,value):
    p=PropertyValue();p.Name=name;p.Value=value;return p
profile=Path(tempfile.mkdtemp(prefix='research_lo_'))
port=20449
process=subprocess.Popen([r'C:\Program Files\LibreOffice\program\soffice.exe',
    '-env:UserInstallation='+profile.as_uri(),'--headless','--invisible','--norestore',
    f'--accept=socket,host=localhost,port={port};urp;StarOffice.ComponentContext'],
    creationflags=subprocess.CREATE_NO_WINDOW,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    local=uno.getComponentContext();resolver=local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver',local)
    remote=None
    for _ in range(50):
        try:remote=resolver.resolve(f'uno:socket,host=localhost,port={port};urp;StarOffice.ComponentContext');break
        except Exception:time.sleep(.2)
    if remote is None:raise RuntimeError('LibreOffice UNO connection unavailable')
    desktop=remote.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop',remote)
    files=[Path(x).resolve() for x in sys.argv[1:]] or sorted((ROOT/'deliverables').glob('*.docx'))
    records=[]
    for file in files:
        doc=desktop.loadComponentFromURL(file.as_uri(),'_blank',0,(prop('Hidden',True),prop('ReadOnly',False),prop('UpdateDocMode',3)))
        indexes=doc.getDocumentIndexes()
        styles=doc.StyleFamilies.getByName('ParagraphStyles')
        for name in ['Contents 1','Contents 2','Contents 3']:
            if styles.hasByName(name):
                style=styles.getByName(name);style.CharHeight=9;style.CharHeightAsian=9;style.ParaTopMargin=0;style.ParaBottomMargin=0;style.ParaKeepTogether=False
        if indexes.getCount()==0:
            index=doc.createInstance('com.sun.star.text.ContentIndex')
            index.CreateFromOutline=True;index.Level=2 if file.name.startswith('00_') else 1;index.Title=''
            search=doc.createSearchDescriptor();search.SearchString='[研究目录生成位置]';found=doc.findFirst(search)
            if found is None:raise RuntimeError('TOC position marker missing: '+file.name)
            found.String='';doc.getText().insertTextContent(found,index,False)
            indexes=doc.getDocumentIndexes()
        for i in range(indexes.getCount()):indexes.getByIndex(i).update()
        doc.refresh()
        for i in range(indexes.getCount()):indexes.getByIndex(i).update()
        doc.storeAsURL(file.as_uri(),(prop('FilterName','Office Open XML Text'),prop('Overwrite',True)))
        # Read headings and their Writer-calculated pages for independent QA.
        cursor=doc.getCurrentController().getViewCursor();enum=doc.getText().createEnumeration();headings=[]
        while enum.hasMoreElements():
            paragraph=enum.nextElement()
            if paragraph.supportsService('com.sun.star.text.Paragraph') and paragraph.ParaStyleName.startswith('Heading'):
                cursor.gotoRange(paragraph.getStart(),False);headings.append({'text':paragraph.String,'page':cursor.getPage()})
        records.append({'file':str(file),'indexes':indexes.getCount(),'headings':headings})
        doc.close(True)
    (ROOT/'qa/toc_audit.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps([{'file':r['file'],'indexes':r['indexes'],'headings':len(r['headings'])}for r in records],ensure_ascii=False))
    desktop.terminate()
finally:
    if process.poll() is None:process.terminate()
