import {assessOfficial,type OfficialProfile} from './official-assessment';
import {needsSourceReview} from './source-health';
export function safeAssessment(id:string,checked:string,p:OfficialProfile){
 const assessment=assessOfficial(id,p);const reviewRequired=needsSourceReview(id,checked);
 if(!reviewRequired)return {...assessment,reviewRequired};
 return {...assessment,reviewRequired,checks:assessment.checks.map(c=>({...c,status:'unknown' as const,detail:'Source requires review before this requirement can be assessed.'})),tuition:null,tuitionDescription:'Unknown — source requires review.',scholarship:'Unknown — source requires review.'};
}
