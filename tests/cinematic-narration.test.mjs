// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {countries,languages} from '../src/countries.mjs';
import {cinematicNarrationFor,narrationFor} from '../src/narration.mjs';
import {evidenceFor} from '../src/guide.mjs';

test('all 195 destinations retain localized M49 narration and source-scoped extensions',()=>{
 for(const {code} of countries)for(const locale of languages){
  const b=narrationFor(code,locale),n=cinematicNarrationFor(code,locale);
  assert.ok(n.text.startsWith(b.text));assert.equal(n.language,b.language);assert.equal(n.source,b.source);
  assert.equal(n.extended,['it','en'].includes(locale));
  assert.ok(n.facts.every(f=>f.language===n.language&&f.source.startsWith('https://')&&n.text.includes(f.text)));
  assert.equal(new Set(n.facts.map(f=>f.id)).size,n.facts.length);
  if(!n.extended){assert.equal(n.text,b.text);assert.deepEqual(n.facts,[]);}
 }
 assert.equal(cinematicNarrationFor('XX'),null);
});
test('Italy combines sourced landforms and river with clearly dated WDI observations',()=>{
 const n=cinematicNarrationFor('IT','it');
 assert.match(n.text,/Monviso/);assert.match(n.text,/Banca Mondiale, anno 2024/);
 assert.deepEqual(n.facts.map(f=>f.id),['it-orography','it-hydrology','wdi-SP.POP.TOTL','wdi-SP.URB.TOTL.IN.ZS','wdi-AG.LND.FRST.ZS']);
 assert.ok(n.facts.every(f=>f.review==='source-checked-not-independent'));
});
test('France does not inherit Italy facts; absent Vatican observations stay absent',()=>{
 const n=cinematicNarrationFor('FR','en');
 assert.match(n.text,/68,551,653/);assert.match(n.text,/reference year 2024/);
 assert.deepEqual(n.facts.filter(f=>!f.id.startsWith('wdi-')).map(f=>f.id),['fr-orography','fr-hydrology']);assert.match(n.text,/Pyrenees/);
 const va=cinematicNarrationFor('VA','it');assert.deepEqual(va.facts,[]);assert.equal(va.text,narrationFor('VA','it').text);
});
test('guide M49 evidence remains uncontaminated by narrative statistics',()=>{
 const input={code:'FR',language:'en',question:'statistical region'};
 const region=evidenceFor(input).find(f=>f.id==='region');
 assert.equal(region.text,narrationFor('FR','en').text);assert.ok(!region.text.includes('68,551,653'));
});
