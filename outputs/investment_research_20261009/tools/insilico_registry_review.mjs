import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='G:/MyTarget/outputs/investment_research_20261009';
const cutoff='2026-10-09';
const ids=['NCT05938920','NCT07687459'];
const results=[];
for(const id of ids){
 const url='https://clinicaltrials.gov/api/v2/studies/'+id,res=await fetch(url);
 if(!res.ok)throw Error(id+' HTTP '+res.status);
 const text=await res.text(),m=JSON.parse(text),p=m.protocolSection,s=p.statusModule;
 const last=s.lastUpdatePostDateStruct.date;
 await fs.writeFile(root+'/data/pharma_raw/'+id+'_api_20261011.json',text+'\n');
 results.push({nctId:id,sourceURL:url,recordURL:'https://clinicaltrials.gov/study/'+id,downloadDate:'2026-10-11',rawFile:'data/pharma_raw/'+id+'_api_20261011.json',rawSHA256:crypto.createHash('sha256').update(text+'\n').digest('hex'),latestPublicUpdate:last,cutoffEligible:last<=cutoff,sourceInterpretation:'Sponsor-submitted public registry. Actual downloaded date later than cutoff; only records last posted by cutoff may support locked research.',studyId:p.identificationModule.orgStudyIdInfo.id,title:p.identificationModule.officialTitle,status:s.overallStatus,start:s.startDateStruct,primaryCompletion:s.primaryCompletionDateStruct,completion:s.completionDateStruct,firstPosted:s.studyFirstPostDateStruct,resultsFirstPosted:s.resultsFirstPostDateStruct??null,sponsor:p.sponsorCollaboratorsModule.leadSponsor,enrollment:p.designModule.enrollmentInfo,phase:p.designModule.phases,randomization:p.designModule.designInfo,primaryOutcomes:p.outcomesModule.primaryOutcomes,secondaryOutcomes:p.outcomesModule.secondaryOutcomes,locations:p.contactsLocationsModule.locations.map(x=>({facility:x.facility,status:x.status??null,country:x.country})),hasResults:m.hasResults,resultsSummary:m.resultsSection?{participantFlow:m.resultsSection.participantFlowModule,outcomeTitles:m.resultsSection.outcomeMeasuresModule.outcomeMeasures.map(x=>({type:x.type,title:x.title,populationDescription:x.populationDescription,groups:x.groups,denoms:x.denoms,units:x.unitOfMeasure}))}:null});
}
const doc={issuerId:'I008',cutoff,version:'insilico-clinical-registry-review-v1',results};
await fs.writeFile(root+'/qa/insilico_clinical_registry_review.json',JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify({version:doc.version,results:results.map(x=>({...x,locationsCount:x.locations.length,locations:undefined,resultsSummary:x.resultsSummary?{participantFlow:x.resultsSummary.participantFlow,outcomeTitles:x.resultsSummary.outcomeTitles}:null}))},null,2));
