import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {resolveTargetDate,hkCalendarSources} from './target_dates.mjs';
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
await fs.writeFile(path.join(root,'qa/calendar_qa.json'),JSON.stringify({passed:true,knownCases:cases.length,issuerSecurityChecks:hk.length,conditionalHKChecks:conditionalHK.length,calendarSources:hkCalendarSources,fingerprint:b.fingerprint,unpublishedCalendarsExplicitlyUnresolved:true},null,2));
console.log(JSON.stringify({passed:true,knownCases:cases.length,issuerSecurityChecks:hk.length}));
