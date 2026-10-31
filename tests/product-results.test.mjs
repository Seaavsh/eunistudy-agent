import {test} from 'node:test';import assert from 'node:assert/strict';
import {subjectMatches} from '../lib/subject-matching.ts';import {automaticBudget} from '../lib/automatic-budget.ts';import {conversationFacts} from '../lib/conversation-state.ts';
test('computer engineering is preserved and prior computer science degree does not overwrite it',()=>{
 const f=conversationFacts([{role:'user',text:'master computer engineering'},{role:'assistant',text:'Which country would you like to study in?'},{role:'user',text:'germany'},{role:'assistant',text:'What is your highest completed education level?'}],'bachelor computer science',{});
 assert.equal(f.subject,'Computer Engineering');assert.equal(f.priorEducation,'Bachelor');
 assert.equal(subjectMatches('Computer Science',f.subject),false);assert.equal(subjectMatches('Mathematics and Computer Science',f.subject),false);assert.equal(subjectMatches('Computer Engineering',f.subject),true);assert.equal(subjectMatches('Ingegneria Informatica',f.subject),true);
});
test('Paderborn calculation avoids double-counting semester fees and does not assume scholarship',()=>{
 const p=automaticBudget('Paderborn University',0,'12000','EUR',null);assert.equal(p.low,15222.3);assert.equal(p.high,15822.3);assert.equal(p.gapLow,3222.3);assert.equal(p.gapHigh,3822.3);assert.equal(p.livingLow,1160);assert.equal(p.feesLow,702.3);
});
test('unverified tuition is explicitly excluded from baseline and missing exchange rates are not invented',()=>{
 const p=automaticBudget('Another German University',null,'12000','USD',null);assert.equal(p.tuitionIncluded,false);assert.equal(p.gapLow,null);assert.equal(p.convertedLow,null);
});
import {subjectRelation} from '../lib/subject-matching.ts';
test('engineering discovery distinguishes exact and related subjects',()=>{
 assert.equal(subjectRelation('Computer Engineering','Computer Engineering'),'exact');
 assert.equal(subjectRelation('Informatik','Computer Engineering'),'related');
 assert.equal(subjectRelation('Embedded Systems','Computer Engineering'),'related');
 assert.equal(subjectRelation('Business Administration','Computer Engineering'),'none');
});
test('engineering related results exclude teacher training and bioinformatics',()=>{assert.equal(subjectRelation('Berufspädagogik Elektrotechnik Lehramt','Computer Engineering'),'none');assert.equal(subjectRelation('Bioinformatik','Computer Engineering'),'none')});
