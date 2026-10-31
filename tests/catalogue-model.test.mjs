import {test} from 'node:test';import assert from 'node:assert/strict';import {evidence,normaliseOfficial} from '../lib/catalogue-model.ts';
const now=new Date('2026-10-31T00:00:00Z');
test('missing values remain unknown',()=>{assert.equal(evidence(null,'https://example.org','2026-10-31',now).status,'unknown');assert.equal(evidence('unknown','https://example.org','2026-10-31',now).value,null)});
test('old or future evidence cannot appear fresh',()=>{assert.equal(evidence('test','https://example.org','2025-01-01',now).status,'stale');assert.equal(evidence('test','https://example.org','2027-01-01',now).status,'unknown')});
test('normalised programme preserves sources and does not invent absent fields',()=>{const p=normaliseOfficial({id:'p1',title:'Example',source:'https://example.org',checked:'2026-10-31'},now);assert.equal(p.title.status,'verified');assert.equal(p.title.source,'https://example.org');assert.equal(p.tuition.value,null);assert.equal(p.scholarships.status,'unknown')});
