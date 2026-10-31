export type FitProfile={degree?:string;destination?:string;studyLanguage?:string;subject?:string};
export type FitProgramme={degree?:string;country?:string;language?:string;subject?:string};
export type FitCheck={name:string;status:'match'|'different'|'unknown';requested:string;available:string|null};
export function preferenceFit(p:FitProgramme,profile:FitProfile,reviewRequired=false){
 const checks:FitCheck[]=[];
 for(const [name,requested,available] of [['Degree',profile.degree,p.degree],['Destination',profile.destination,p.country],['Teaching language',profile.studyLanguage,p.language],['Subject',profile.subject,p.subject]] as const){if(!requested)continue;const unknown=reviewRequired||!available||available.toLowerCase()==='unknown';checks.push({name,requested,available:unknown?null:available,status:unknown?'unknown':requested.toLowerCase()===available.toLowerCase()?'match':'different'})}
 const assessed=checks.filter(c=>c.status!=='unknown').length;const matched=checks.filter(c=>c.status==='match').length;
 return {score:assessed&&assessed===checks.length?Math.round(matched/assessed*100):null,matched,assessed,unknown:checks.length-assessed,checks,description:'Preference fit only; not an admission probability. A score is withheld when any stated preference is unknown.'};
}
