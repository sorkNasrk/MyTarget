import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {resolveTargetDate,hkCalendarSources,nominalTargets} from './target_dates.mjs';
const root=path.resolve(import.meta.dirname,'..');
const discovery=JSON.parse(await fs.readFile(path.join(root,'data/calendar_primary_discovery.json'),'utf8'));
for(const id of ['hkex_hours','hk_gov_2026','hk_gov_2027'])assert.equal(discovery.find(x=>x.id===id)?.status,200,id);
assert(discovery.find(x=>x.id==='hkex_hours').text.includes('excluding public holidays'));
assert(discovery.find(x=>x.id==='hk_gov_2027').text.includes('Chung Yeung Festival 8 October Friday'));
const cases=[['2027-10-09','HKEX','2027-10-07'],['2027-04-09','HKEX','2027-04-09'],['2026-12-31','HKEX','2026-12-31'],['2027-03-29','HKEX','2027-03-25'],['2027-02-09','HKEX','2027-02-05'],['2029-10-09','HKEX',null],['2031-10-09','HKEX',null],['2027-10-09','SSE',null]];
for(const [date,market,expected] of cases)assert.equal(resolveTargetDate(date,market).actualDate,expected,date+'/'+market);
assert.equal(resolveTargetDate('2026-12-31','HKEX').session,'half-day');
assert.throws(()=>resolveTargetDate('2027-02-30','HKEX'));
const b=JSON.parse(await fs.readFile(path.join(root,'data/research_bundle.json'),'utf8'));
const hk=b.models.filter(m=>m.currency==='HKD');
for(const m of hk){assert.equal(m.scenarios.oneYear.target,'2027-10-07',m.code);assert.equal(m.scenarios.oneYear.targetDateResolution.nominalDate,'2027-10-09',m.code);}
const conditionalHK=(b.conditionedModels??[]).filter(m=>m.currency==='HKD');
for(const m of conditionalHK){assert.equal(m.conditionalScenarios.oneYear.target,'2027-10-07',m.code);assert.equal(m.conditionalScenarios.oneYear.targetDateResolution.nominalDate,'2027-10-09',m.code);assert.equal(m.rankEligible,false,m.code);}
const combinations=new Map();let modelHorizonChecks=0,conditionalHorizonChecks=0;
for(const [models,scenarioField] of [[b.models,'scenarios'],[b.conditionedModels??[],'conditionalScenarios']])for(const m of models){
 const market=m.code.endsWith('.HK')?'HKEX':m.code.endsWith('.SH')?'SSE':m.code.endsWith('.SZ')?'SZSE':null;
 assert(market,'Unsupported calendar market '+m.code);
 for(const [h,s] of Object.entries(m[scenarioField])){
  const resolution=resolveTargetDate(nominalTargets[h],market);
  assert.deepEqual(s.targetDateResolution,resolution,m.code+'/'+h+' source and resolution');
  assert.equal(s.target,resolution.actualDate??resolution.nominalDate,m.code+'/'+h+' target');
  if(resolution.actualDate===null){assert.match(resolution.calendarStatus,/尚未核验.*待核/);assert.equal(resolution.sources,undefined);}
  else for(const source of resolution.sources){assert(source.url);assert((source.publicationDate??source.publicationMonth)<='2026-10-09');}
  const key=market+'/'+h,combination=combinations.get(key)??{horizon:h,...resolution,modelRows:0,conditionalRows:0};
  combination[scenarioField==='scenarios'?'modelRows':'conditionalRows']++;combinations.set(key,combination);
  if(scenarioField==='scenarios')modelHorizonChecks++;else conditionalHorizonChecks++;
 }
}
const marketTargetCombinations=[...combinations.values()],resolvedCombinations=marketTargetCombinations.filter(x=>x.actualDate!==null).length;
await fs.writeFile(path.join(root,'qa/calendar_qa.json'),JSON.stringify({passed:true,knownCases:cases.length,issuerSecurityChecks:hk.length,conditionalHKChecks:conditionalHK.length,modelHorizonChecks,conditionalHorizonChecks,marketTargetCombinations,resolvedCombinations,unresolvedCombinations:marketTargetCombinations.length-resolvedCombinations,calendarSources:hkCalendarSources,fingerprint:b.fingerprint,unverifiedCalendarsExplicitlyUnresolved:true,scope:'All markets and target horizons actually used; stored citations and cutoff dates agree. A null actualDate is unresolved, not an official trading-day claim.'},null,2));
console.log(JSON.stringify({passed:true,knownCases:cases.length,issuerSecurityChecks:hk.length,modelHorizonChecks,conditionalHorizonChecks,marketTargetCombinations:marketTargetCombinations.length,resolvedCombinations}));
