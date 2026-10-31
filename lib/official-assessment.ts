export type OfficialProfile={degree?:string;priorEducation?:string;languageTest?:string;languageScore?:string;budget?:string;currency?:string};
export function assessOfficial(id:string,p:OfficialProfile){
 const checks:{name:string;status:'met'|'not met'|'unknown';detail:string}[]=[];
 if(id==='de-paderborn-ce-msc'){
  checks.push({name:'Prior degree',status:p.priorEducation==='Bachelor'?'met':'unknown',detail:'Bachelor degree reported; comparability and curriculum are assessed separately.'});
  checks.push({name:'Required coursework',status:'unknown',detail:'University review requires Computer Science 30 credits, Electrical Engineering 30, Mathematics 15 and thesis 12. A Computer Science degree title alone does not establish the electrical-engineering requirement.'});
  checks.push({name:'Language certificate',status:'unknown',detail:'Review the accepted English certificates and any required section scores against the current programme rules.'});
  checks.push({name:'GRE or exemption',status:'unknown',detail:'GRE or a qualifying academic-performance exemption must be checked against current programme rules.'});
 }else if(id==='de-saarland-math-cs-msc'){
  const score=(p.languageTest&&p.languageTest!=='IELTS')||p.languageScore==='' ||p.languageScore===undefined?null:Number(p.languageScore);
  checks.push({name:'IELTS',status:score===null||!Number.isFinite(score)||score<0||score>9?'unknown':score>=7?'met':'not met',detail:'IELTS 7.0 is one stated English qualification; alternatives are accepted.'});
  checks.push({name:'Academic background',status:'unknown',detail:'Mathematics and computer science background requires review.'});
 }else if(id==='de-saarland-cs-msc'){checks.push({name:'Academic background',status:'unknown',detail:'A relevant bachelor’s degree or equivalent is evaluated by the university.'});checks.push({name:'English C1',status:'unknown',detail:'English C1 and an accepted certificate are required; a medium-of-instruction letter is not accepted.'});}else if(id==='it-padua-data-msc'){checks.push({name:'Academic background',status:'unknown',detail:'Mathematics, probability, computing coursework and grades are reviewed individually.'});checks.push({name:'English B2',status:'unknown',detail:'English B2 in reading and listening is required.'});}else if(id==='it-polimi-cs-msc'){checks.push({name:'Academic and English requirements',status:'unknown',detail:'A bachelor’s degree, minimum grade average and English proficiency are required; specific equivalence requires review.'});}else if(id==='it-bologna-ai-msc'){
  checks.push({name:'Degree',status:p.priorEducation==='Bachelor'?'unknown':p.priorEducation?'not met':'unknown',detail:'A relevant bachelor’s degree or suitable foreign qualification is assessed by the university.'});
  checks.push({name:'English B2',status:'unknown',detail:'English B2 is required; accepted evidence must be checked against the current call.'});
 }else{checks.push({name:'Admission requirements',status:'unknown',detail:'Programme-specific requirements have not yet been structured.'})}
 const tuition=['de-saarland-math-cs-msc','de-saarland-cs-msc','de-paderborn-ce-msc'].includes(id)?0:null;
 return {checks,tuition,currency:'EUR',tuitionDescription:tuition===0?'No tuition fee; semester fee not included.':'Unknown',annualTotal:null,budgetResult:'Unknown — full fees and living costs are not available',scholarship:id==='de-paderborn-ce-msc'?'Deutschlandstipendium through Studienfonds OWL: competitive funding opportunity; no award assumed.':id==='it-padua-data-msc'?'Scholarships and fee waivers available; eligibility and value unknown.':'Unknown',admissionProbability:null};
}

