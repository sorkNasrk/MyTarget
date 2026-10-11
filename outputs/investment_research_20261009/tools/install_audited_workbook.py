"""Install only an audited formatting candidate, preserving an exact backup."""
import datetime, hashlib, json, shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'qa/risk_npv_layout_fix'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
bundle=read(ROOT/'data/research_bundle.json')
audit=read(BASE/'preserved_native_final_integrity.json')
integration=read(BASE/'layout_integration.json')
render=read(BASE/'final_render_manifest.json')
main=read(ROOT/'qa'/f'workbook_render_manifest_{bundle["fingerprint"]}.json')
candidate=Path(render['input'])
destination=ROOT/'deliverables/证券研究总表_初版.xlsx'
backup=BASE/'original_before_release.xlsx'
assert audit['preservedExceptAuthorizedFormatting'] and integration['passed'] and integration.get('appliedAt')
assert audit['afterSha256']==integration['candidateSha256']==render['inputSha256']==sha(candidate)
assert main['layoutCandidateSha256']==sha(candidate)
assert integration['allChangedSheetOriginalRangesRendered'] and not integration['missingChangedSheetSavedRanges']
assert len(audit['sheetXmlHashes'])==233
if sha(destination)!=sha(candidate):
    assert sha(destination)==audit['beforeSha256'], 'Original workbook unexpectedly changed'
    if backup.exists():assert sha(backup)==audit['beforeSha256']
    else:shutil.copy2(destination,backup)
    shutil.copy2(candidate,destination)
assert sha(destination)==audit['afterSha256']
evidence=[BASE/'preserved_native_final_integrity.json',BASE/'layout_integration.json',BASE/'final_render_manifest.json',ROOT/'qa'/f'workbook_render_manifest_{bundle["fingerprint"]}.json']
q={'passed':True,'fingerprint':bundle['fingerprint'],'file':str(destination),'fileSHA256':sha(destination),
   'beforeSHA256':audit['beforeSha256'],'backup':str(backup),'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
   'preservedExceptAuthorizedFormatting':True,'allChangedSheetOriginalRangesRendered':True,
   'changedSheets':sum(not x['byteIdentical'] for x in audit['sheetXmlHashes']),'sheets':233,
   'evidenceSHA256':{p.relative_to(ROOT).as_posix():sha(p) for p in evidence},
   'scope':'Only authorized display formats and widths/heights changed. All cell values, formula text and caches, source inputs and native parts retained; final numeric and visual QA remain separate gates.'}
(ROOT/'qa/workbook_layout_release.json').write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(q,ensure_ascii=False))
