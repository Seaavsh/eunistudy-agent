import test from 'node:test';
import assert from 'node:assert/strict';
import { assess, programs, examples, emptyProfile, convert } from '../lib/data.ts';
const p=programs.find(p=>p.country==='Germany'&&p.degree==='Master'&&p.subject==='Computing');
test('catalog contains 24 universities and 48 programs',()=>{assert.equal(programs.length,48);assert.equal(new Set(programs.map(x=>x.university)).size,24)});
test('deterministic eligible score and costs',()=>{const a=assess(p,examples.Mina,null);assert.equal(a.score,assess(p,examples.Mina,null).score);assert.equal(a.score,null);assert.equal(a.total,p.tuition+12*p.living+p.fees+p.oneTime)});
test('missing profile and failed requirement do not produce a score',()=>{assert.equal(assess(p,emptyProfile,null).score,null);assert.equal(assess(p,{...examples.Mina,languageScore:'4'},null).score,null);assert.ok(assess(p,{...examples.Mina,gpa:'5'},null).missing.length)});
test('currency conversions require known rates',()=>{const rates={base:'EUR',date:'2026-01-01',rates:{EUR:1,CAD:1.5,USD:1.2}};assert.equal(convert(100,'EUR','CAD',rates),150);assert.equal(convert(100,'EUR','CAD',null),null);assert.equal(convert(100,'EUR','EUR',null),100)});
