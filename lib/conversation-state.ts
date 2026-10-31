export type Turn={role:'user'|'assistant';text:string};
type Fields=Record<string,string>;
// Extract only explicit answers; short ambiguous answers require the preceding question.
export function conversationFacts(history:Turn[], message:string, confirmed:Fields):Fields {
 const facts:Fields={...confirmed};
 const turns=[...history,{role:'user' as const,text:message}];
 let question='';
 for(const turn of turns){
  if(turn.role==='assistant'){question=turn.text.toLowerCase();continue}
  const s=turn.text.trim().toLowerCase();
  const educationQuestion=(facts.degree==='Master'&&/\bbachelor/.test(s)&&!/want|pursu|apply|intend|field of study/.test(s))||/prior education|education background|education level|previous (?:degree|education)|highest (?:degree|qualification)/.test(question);
  if(/\b(master(?:s|'s)?|msc|m\.sc)\b/.test(s)&&(!educationQuestion||/want|study|pursu|apply|intend/.test(s)))facts.degree='Master';
  if(/\b(bachelor(?:s|'s)?|bsc|b\.sc)\b/.test(s)){
   if(educationQuestion||(facts.degree==='Master'&&!/want|pursu|apply|intend/.test(s))||/\b(have|completed|graduated|hold|earned|previous|prior|already|finished)\b/.test(s))facts.priorEducation='Bachelor';
   else if(!facts.degree||/want|study|pursu|apply|intend/.test(s))facts.degree='Bachelor';
  }
  if(/\b(high school|secondary school)\b/.test(s)&&(educationQuestion||/completed|graduated|finished/.test(s)))facts.priorEducation='High school';
  if(/\b(computer engineering|ingegneria informatica)\b/.test(s)&&(!educationQuestion||/want|study|pursu|apply|field of study/.test(s)))facts.subject='Computer Engineering';
  else if(/\b(computer science)\b/.test(s)&&(!educationQuestion||/want|study|pursu|apply|field of study/.test(s)))facts.subject='Computer Science';
  else if(/\b(computer|computing|software|informatics|data science|artificial intelligence)\b/.test(s)&&(!educationQuestion||/want|study|pursu|apply/.test(s)))facts.subject='Computing';
  else if(/\bengineering\b/.test(s)&&(!educationQuestion||/want|study|pursu|apply/.test(s)))facts.subject='Engineering';
  else if(/\b(business|management|finance)\b/.test(s)&&(!educationQuestion||/want|study|pursu|apply/.test(s)))facts.subject='Business';
  if(/\bgermany\b/.test(s))facts.destination='Germany'; else if(/\bitaly\b/.test(s))facts.destination='Italy'; else if(/\bcanada\b/.test(s))facts.destination='Canada'; else if(/\bnetherlands\b/.test(s))facts.destination='Netherlands';
  const pair=s.match(/\b(\d+(?:\.\d+)?)\s*(?:\/|out of)\s*(4|5|20|100)\b/);
  if(pair&&(/gpa|grade|scale/.test(question+' '+s))){facts.gpa=pair[1];facts.gpaScale=pair[2]}
  else if(/^\d+(?:\.\d+)?$/.test(s)&&/gpa|grade|scale/.test(question)){
   if(/scale/.test(question)&&facts.gpa&&/^(4|5|20|100)$/.test(s)&&!/what (?:was|is) your gpa and/.test(question))facts.gpaScale=s;
   else if(!facts.gpa||!/scale/.test(question))facts.gpa=s;
   else if(/^(4|5|20|100)$/.test(s))facts.gpaScale=s;
  }
  const test=s.match(/\b(ielts|toefl|tofel)\b\s*(?:score|is|:)?\s*(\d+(?:\.\d+)?)/);
  if(test){facts.languageTest=test[1]==='ielts'?'IELTS':'TOEFL';facts.languageScore=test[2]}
  if(/\b(euro|euros|eur|€)\b|€/.test(s))facts.currency='EUR'; else if(/\b(cad|canadian dollars?)\b/.test(s))facts.currency='CAD'; else if(/\b(usd|us dollars?)\b/.test(s))facts.currency='USD';
  const amount=s.match(/\b(\d[\d,]*(?:\.\d+)?)\s*(?:eur|euros?|cad|usd|dollars?)\b/);
  if(amount&&/budget|afford|spend|year|cost/.test(s+' '+question))facts.budget=amount[1].replaceAll(',','');
  else if(/^\d[\d,]*(?:\.\d+)?$/.test(s)&&/budget|how much.*(?:spend|afford)/.test(question)&&!/gpa|grade|ielts|toefl/.test(question))facts.budget=s.replaceAll(',','');
  if(/\b(fall|autumn)\b/.test(s))facts.intake='Fall';
  if(/\benglish\b/.test(s)&&/teach|taught|language of instruction|study in english/.test(s+' '+question))facts.studyLanguage='English';
  else if(/\bgerman\b/.test(s)&&/teach|taught|language of instruction|study in german/.test(s+' '+question))facts.studyLanguage='German';
  else if(/\bitalian\b/.test(s)&&/teach|taught|language of instruction|study in italian/.test(s+' '+question))facts.studyLanguage='Italian';
 }
 return facts;
}
export function needsBetterQuestion(answer:string,facts:Fields):boolean {
 const questions=answer.split(/(?<=[?])/).filter(s=>s.includes('?'));
 return questions.some(q=>{
  const t=q.toLowerCase();
  if(/prior education|education background|education level|previous degree|highest qualification/.test(t)&&facts.priorEducation)return true;
  if(/\bgpa\b|grading scale/.test(t)&&facts.gpa&&facts.gpaScale)return true;
  if(/\b(?:ielts|toefl|english (?:language )?test)\b/.test(t)&&facts.languageTest&&facts.languageScore)return true;
  if(/\bcurrency\b/.test(t)&&facts.currency)return true;
  if(/\bintake\b/.test(t)&&facts.intake)return true;
  if(/\bdestination\b|which country/.test(t)&&facts.destination)return true;
  if(/what subject|which subject|field of study/.test(t)&&facts.subject)return true;
  return false;
 });
}
export function nextQuestion(facts:Fields):string {
 if(!facts.degree)return 'Which degree level are you interested in?';
 if(!facts.subject)return 'What subject would you like to study?';
 if(!facts.destination)return 'Which country would you like to study in?';
 if(!facts.priorEducation)return 'What is your highest completed education level?';
 if(!facts.gpa)return 'What was your GPA or grade?';
 if(!facts.gpaScale)return 'What is the maximum value on your GPA scale?';
 if(!facts.languageTest||!facts.languageScore)return 'Do you have a language test result, such as IELTS or TOEFL?';
 if(!facts.budget)return 'What is your annual budget?';
 if(!facts.currency)return 'What currency is your annual budget in?';
 if(!facts.intake)return 'Which intake are you targeting?';
 if(!facts.studyLanguage)return 'What teaching language do you prefer?';
 return 'What would you like to explore next?';
}

// Recommendations use confirmed profile fields, never unconfirmed extraction.
export function canRecommend(profile:Fields,message:string):boolean {
 if(/\b(?:show|browse|list|find|recommend|suggest)\b.{0,45}\b(?:universit(?:y|ies)|program(?:me)?s?|courses?|options)\b/i.test(message))return true;
 const required=['degree','subject','destination','priorEducation','gpa','gpaScale','languageTest','languageScore','budget','currency','intake','studyLanguage'];
 if(!required.every(k=>profile[k]))return false;
 const g=Number(profile.gpa),scale=Number(profile.gpaScale),score=Number(profile.languageScore),budget=Number(profile.budget);
 return Number.isFinite(g)&&g>=0&&['4','5','20','100'].includes(profile.gpaScale)&&g<=scale&&Number.isFinite(budget)&&budget>0&&Number.isFinite(score)&&score>=0&&((profile.languageTest==='IELTS'&&score<=9)||(profile.languageTest==='TOEFL'&&score<=120));
}
