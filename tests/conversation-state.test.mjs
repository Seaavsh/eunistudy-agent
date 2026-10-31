import {test} from 'node:test';import assert from 'node:assert/strict';
import {conversationFacts,needsBetterQuestion,nextQuestion,confirmProfile} from '../lib/conversation-state.ts';
import {assessOfficial} from '../lib/official-assessment.ts';
const a=text=>({role:'assistant',text}),u=text=>({role:'user',text});
test('reported conversation remembers bachelor, split GPA, TOEFL, budget and currency',()=>{
 const h=[u('master'),a('What subject would you like to study?'),u('computer engineering'),a('Which destination country?'),u('germany'),a('What is your prior education background, and what was your GPA and its scale?'),u('18.14'),a('What was your GPA and what scale was it measured on?'),u('18.14 / 20'),a('What is your English language test score?'),u('TOFEL 98'),a('What is your budget, including currency, and which intake are you targeting?'),u('12000'),a('Which intake are you targeting?'),u('fall'),a('What is the currency for your budget?'),u('euro'),a('What is your prior education level?')];
 const f=conversationFacts(h,'bachelor computer science',{});
 assert.deepEqual([f.degree,f.subject,f.destination,f.gpa,f.gpaScale,f.languageTest,f.languageScore,f.budget,f.currency,f.intake,f.priorEducation],['Master','Computer Engineering','Germany','18.14','20','TOEFL','98','12000','EUR','Fall','Bachelor']);
 assert.equal(needsBetterQuestion('What is your prior education level, such as High school?',f),true);
 assert.equal(nextQuestion(f),'What teaching language do you prefer?');
});
test('standalone bachelor means intended degree when opening, prior degree after education question',()=>{
 assert.equal(conversationFacts([],'bachelor',{}).degree,'Bachelor');
 const f=conversationFacts([a('What is your prior education level?')],'bachelor',{degree:'Master'});
 assert.equal(f.priorEducation,'Bachelor');assert.equal(f.degree,'Master');
});
test('missing GPA scale stays missing and can be supplied separately',()=>{
 const h=[a('What is your GPA and its scale?'),u('18.14'),a('What is the maximum value on your GPA scale?')];
 assert.equal(conversationFacts(h.slice(0,2),'hello',{}).gpaScale,undefined);
 const f=conversationFacts(h,'20',{});assert.equal(f.gpa,'18.14');assert.equal(f.gpaScale,'20');
});
test('TOEFL is never compared to IELTS requirement',()=>{
 const check=assessOfficial('de-saarland-math-cs-msc',{languageTest:'TOEFL',languageScore:'98'}).checks[0];assert.equal(check.status,'unknown');
 assert.equal(assessOfficial('de-saarland-math-cs-msc',{languageTest:'IELTS',languageScore:'7'}).checks[0].status,'met');
});
test('unknown values are not guessed and completed answers are not re-asked',()=>{
 const f=conversationFacts([a('What is your budget?')],'12000',{});assert.equal(f.currency,undefined);assert.equal(f.budget,'12000');
 assert.equal(needsBetterQuestion('What currency is your budget in?',f),false);
 assert.equal(needsBetterQuestion('What is your GPA?',{gpa:'18.14',gpaScale:'20'}),true);
});
import {canRecommend} from '../lib/conversation-state.ts';
test('early intake does not produce recommendations',()=>{
 const f=conversationFacts([u('master computer engineering'),a('Which country are you considering, and what is your prior education?')],'germany. bachelor computer science',{});
 assert.equal(f.degree,'Master');assert.equal(f.priorEducation,'Bachelor');assert.equal(f.destination,'Germany');
 assert.equal(canRecommend(f,'germany. bachelor computer science'),false);
 assert.equal(nextQuestion(f),'What was your GPA or grade?');
});
test('recommendation stage waits for all intake questions',()=>{
 const full={degree:'Master',subject:'Computing',destination:'Germany',priorEducation:'Bachelor',gpa:'18.14',gpaScale:'20',languageTest:'TOEFL',languageScore:'98',budget:'12000',currency:'EUR',intake:'Fall',studyLanguage:'English'};
 assert.equal(canRecommend(full,'yes'),true);
 assert.equal(canRecommend({...full,currency:'',gpaScale:'',intake:'',studyLanguage:''},'yes'),false);
 assert.equal(canRecommend({...full,languageScore:'150'},'yes'),false);
 assert.equal(canRecommend({...full,gpa:'25'},'yes'),false);
 assert.equal(canRecommend({...full,languageTest:'Other'},'yes'),false);
 assert.equal(canRecommend({},'show me university options'),true);
 assert.equal(canRecommend({},'What universities can I apply to?'),true);
 assert.equal(canRecommend({},'Can I see programmes?'),true);
 assert.equal(canRecommend({},'germany. bachelor computer science'),false);
 for(const key of Object.keys(full))assert.equal(canRecommend({...full,[key]:''},'yes'),false,`${key} must be confirmed`);
});
test('reported complete conversation allows search after profile confirmation',()=>{
 const turns=[u('master'),a('What subject would you like to study?'),u('computer science'),a('Which country would you like to study in?'),u('germany'),a('What is your highest completed education level?'),u('bachelor computer'),a('What was your GPA or grade?'),u('18 out of 20'),a('Do you have a language test result, such as IELTS or TOEFL?'),u('toefl 98'),a('What is your annual budget?'),u('12000 euro'),a('Which intake are you targeting?'),u('fall'),a('What teaching language do you prefer?'),u('english')];
 const f=conversationFacts(turns,'confirm',{});
 assert.deepEqual([f.degree,f.subject,f.destination,f.priorEducation,f.gpa,f.gpaScale,f.languageTest,f.languageScore,f.budget,f.currency,f.intake,f.studyLanguage],['Master','Computer Science','Germany','Bachelor','18','20','TOEFL','98','12000','EUR','Fall','English']);
 const accepted=confirmProfile('confirm',{},f);
 assert.equal(accepted.confirmed,true);
 assert.equal(accepted.profile.degree,'Master');
 assert.equal(canRecommend(accepted.profile,'confirm'),true);
 assert.equal(confirmProfile('no',{},f).confirmed,false);
});
test('explicit taught-in-English language is extracted in a complete profile',()=>{const f=conversationFacts([], 'I want a master in Computer Engineering in Germany, taught in English.',{});assert.equal(f.studyLanguage,'English')});
