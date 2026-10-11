import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/MyTarget/outputs/investment_research_20261009';
const paths={pending:'data/insilico_model.pending.json',body:'research/I008_deep.md',evidence:'qa/insilico_per_asset_evidence.json',assumptions:'data/insilico_per_drug_assumptions.json',patents:'qa/insilico_32_active_patent_terms.json',nature:'data/pharma_raw/insilico_nature_20250603.html',ct2:'data/pharma_raw/NCT05938920_api_20261011.json',ct3:'data/pharma_raw/NCT07687459_api_20261011.json'};
const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(root+'/'+p)])),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),signatures=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,sha(v)]));
const m=JSON.parse(raw.pending),ev=JSON.parse(raw.evidence),a=JSON.parse(raw.assumptions),pt=JSON.parse(raw.patents),ct2=JSON.parse(raw.ct2),ct3=JSON.parse(raw.ct3),checks=[],add=(name,pass,detail=null)=>checks.push({name,pass:!!pass,detail});
add('evidence register issuer security and cutoff identity',ev.issuerId==='I008'&&ev.securityId==='S008'&&ev.cutoff==='2026-10-09');
add('67 records 49 named18 unnamed remain distinct from unique drugs',ev.rows.length===67&&ev.rows.filter(x=>x.nameStatus==='issuer_named').length===49&&ev.counts.unnamedOrContractRows===18);
add('28 catalog references retained',ev.sourceCatalog.length===28);
const catalog=[];
for(const s of ev.sourceCatalog){
 const date=s.publicationDateTimeHK.slice(0,10),knownTime=/\d{2}:\d{2}$/.test(s.publicationDateTimeHK),time=s.publicationDateTimeHK.slice(-5),exists=fs.existsSync(s.rawFile),buffer=exists?fs.readFileSync(s.rawFile):null;
 add(s.sourceId+' cutoff publication date',/^\d{4}-\d{2}-\d{2}$/.test(date)&&date<='2026-10-09');
 add(s.sourceId+' primary source URL and period',/^https:\/\//.test(s.url)&&typeof s.reportPeriod==='string'&&s.reportPeriod.length>0);
 add(s.sourceId+' local source artifact exists',exists);
 add(s.sourceId+' afterclose flag uses disclosed time only',knownTime?s.afterClose===(time>='16:10'):s.afterClose===null);
 if(s.rawSHA256)add(s.sourceId+' raw artifact hash matches register',exists&&sha(buffer)===s.rawSHA256);
 catalog.push({id:s.sourceId,url:s.url,publicationDateTimeHK:s.publicationDateTimeHK,afterClose:s.afterClose,rawFile:s.rawFile,rawSHA256:buffer?sha(buffer):null});
}
for(const r of ev.rows){
 add(r.assetIndicationId+' original disclosed identity and indication retained',m.insilicoBridge.assets.some(x=>x.id===r.assetIndicationId&&x.drug===r.drugName&&x.indication===r.indication&&x.territory===r.territory));
 add(r.assetIndicationId+' unreported commercial fact columns remain null',['exactNetRoyaltyRate','exactNetAssetOwnership','currentDilutedEquityStake','successProbability','peakRevenue','commercialLaunchYear'].every(k=>r[k]===null));
 add(r.assetIndicationId+' evidence references catalog source consistently',r.evidence.every(x=>{const s=ev.sourceCatalog.find(z=>z.sourceId===x.sourceId);return s&&s.url===x.sourceURL&&s.publicationDateTimeHK===x.publicationDateTimeHK&&s.afterClose===x.afterClose&&x.sourceCutoffEligible===true;}));
}
const known=m.insilicoBridge.assets.filter(x=>x.eligibleAtCutoff!==0),demand=[...a.rows,...(a.earlyRows??[])];
add('32 active transparent demand rows match model once',known.length===32&&demand.length===32&&new Set(demand.map(x=>x.id)).size===32&&demand.every(x=>known.some(z=>z.id===x.id)));
add('research geographical policy does not assert complete regional budget',/China/.test(a.geographicResearchPolicy??'')||/中国/.test(a.geographicResearchPolicy??''));
add('overlap and molecular correlation policy retained',!!a.overlapPolicy&&!!a.correlationPolicy);
const s2=ct2.protocolSection.statusModule,s3=ct3.protocolSection.statusModule;
add('CT2 was publicly updated before cutoff',s2.lastUpdatePostDateStruct.date==='2025-12-11');
add('CT2 actual randomized enrollment71 safety primary FVC secondary',ct2.protocolSection.designModule.enrollmentInfo.count===71&&ct2.protocolSection.designModule.enrollmentInfo.type==='ACTUAL'&&ct2.protocolSection.outcomesModule.primaryOutcomes[0].measure.includes('Adverse Event')&&ct2.protocolSection.outcomesModule.secondaryOutcomes.some(x=>x.measure.includes('FVC')));
add('CT3 publicly updated20260917 before cutoff',s3.lastUpdatePostDateStruct.date==='2026-09-17');
add('CT3 actual start20260909 recruiting',s3.startDateStruct.date==='2026-09-09'&&s3.startDateStruct.type==='ACTUAL'&&s3.overallStatus==='RECRUITING');
add('CT3 primary completion remains estimated20291030 after three target',s3.primaryCompletionDateStruct.date==='2029-10-30'&&s3.primaryCompletionDateStruct.type==='ESTIMATED'&&s3.primaryCompletionDateStruct.date>(m.conditionalScenarios??m.scenarios).threeYear.target);
add('CT3 estimated32047 sites52week FVC primary',ct3.protocolSection.designModule.enrollmentInfo.count===320&&ct3.protocolSection.designModule.enrollmentInfo.type==='ESTIMATED'&&ct3.protocolSection.contactsLocationsModule.locations.length===47&&ct3.protocolSection.outcomesModule.primaryOutcomes[0].measure.includes('52 weeks'));
add('patent mapping bound to model verbatim',JSON.stringify(m.patentTerms)===JSON.stringify(pt));
const financial=m.financialEvidence??[];
for(const r of financial){add(r.metric+' metadata has unitcurrencyperioddateURL',Number.isFinite(r.value)&&typeof r.unit==='string'&&typeof r.currency==='string'&&typeof r.period==='string'&&typeof r.publicationDate==='string'&&/^https:\/\//.test(r.sourceURL));add(r.metric+' first publication cutoff eligible',(r.firstPublicDate??r.publicationDate).slice(0,10)<='2026-10-09');}
add('body version paired to current conditional model',raw.body.toString('utf8').includes(m.modelVersion));
const report={issuerId:'I008',securityId:'S008',reviewDate:'2026-10-11',modelVersion:m.modelVersion,signatures,status:checks.every(x=>x.pass)?'PASS source metadata identity and cutoff consistency':'FAIL',checksCount:checks.length,failures:checks.filter(x=>!x.pass),catalog,checks,limits:['Source existence and identity checks do not independently verify every clinical or financial claim; separate fact review binds Nature registry and patent excerpts','Patient counts, net prices, uptake, probabilities and cash tails are research assumptions; exact global legal rights and development financing remain unresolved','32 active indication/territory records and35 observations are not67 independent drugs','No formal target valuation or official ranking is released by this source review; final native integrated Excel and document rendering are separate']};
fs.writeFileSync(root+'/qa/insilico_v3_source_review.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks:checks.length,signatures,failures:report.failures},null,2));
