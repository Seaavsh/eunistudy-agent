import {test} from 'node:test';import assert from 'node:assert/strict';import {preferenceFit} from '../lib/preference-fit.ts';
test('scores known preferences and reports unknown separately',()=>{const r=preferenceFit({degree:'Master',country:'Italy',language:'Unknown'},{degree:'Master',destination:'Germany',studyLanguage:'English'});assert.equal(r.score,null);assert.equal(r.assessed,2);assert.equal(r.unknown,1)});
test('missing preferences and stale sources produce no score',()=>{assert.equal(preferenceFit({degree:'Master'},{}).score,null);assert.equal(preferenceFit({degree:'Master'},{degree:'Master'},true).score,null)});
test('language mismatches are distinct from admissions',()=>{const r=preferenceFit({language:'Italian'},{studyLanguage:'English'});assert.equal(r.score,0);assert.equal(r.checks[0].status,'different')});

test('unknown subject withholds the score',()=>{const r=preferenceFit({degree:'Master',country:'Italy'},{degree:'Master',destination:'Italy',subject:'Business'});assert.equal(r.score,null);assert.equal(r.unknown,1)});
