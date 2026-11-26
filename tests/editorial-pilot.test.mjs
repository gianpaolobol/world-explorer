// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {countries,languages} from '../src/countries.mjs';
import {disciplines,pilotEvidence,pilotSelection} from '../src/editorial-pilot.mjs';
import {answerGuide,evidenceFor} from '../src/guide.mjs';
const input={code:'IT',language:'it',question:'orografia'};
test('pilot covers the twelve disciplines once with unique IDs and explicit source-check status',()=>{
 const a=pilotEvidence('IT','it');assert.equal(a.length,12);
 assert.deepEqual(a.map(x=>x.discipline),disciplines);
 assert.equal(new Set(a.map(x=>x.id)).size,12);
 for(const x of a){assert.match(x.source,/^https:\/\//);assert.ok(x.label&&x.text);assert.equal(x.checked,'2026-11-26');assert.equal(x.review,'source-checked-not-independent');}
});
test('pilot never transfers Italian evidence to any other country',()=>{
 for(const c of countries.filter(c=>c.code!=='IT'))for(const language of languages){assert.ok(pilotEvidence(c.code,language).every(f=>!f.id.startsWith('it-')));if(c.code!=='FR')assert.deepEqual(pilotEvidence(c.code,language),[]);assert.deepEqual(pilotSelection({code:c.code,language,question:'popolazione'}),[]);}
});
test('both supported pilot languages have complete distinct texts, others disclose English fallback',()=>{
 const it=pilotEvidence('IT','it'),en=pilotEvidence('IT','en');
 for(let i=0;i<12;i++){assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].source,en[i].source);assert.equal(it[i].period,en[i].period);}
 for(const l of languages.filter(l=>l!=='it'&&l!=='en'))assert.deepEqual(pilotEvidence('IT',l),en);
});
test('all twelve Italian and English exact topic queries return the corresponding fact without a model',async()=>{
 const it=['territorio','orografia','idrografia','oceanografia','geologia','clima','biogeografia','capitale','popolazione','economia','città','storia'];
 const en=['physical geography','orography','hydrology','oceanography','geology','climatology','biogeography','capital','population','economy','urban geography','historical geography'];
 for(const [language,questions] of [['it',it],['en',en]])for(let i=0;i<questions.length;i++){
  const r=await answerGuide({...input,language,question:questions[i]});
  assert.equal(r.status,'evidence');assert.equal(r.evidence.length,1);assert.equal(r.evidence[0].discipline,disciplines[i]);
 }
});
test('historical population and climate facts preserve reference periods and scope',async()=>{
 const p=(await answerGuide({...input,question:'Qual è la popolazione?'})).evidence[0];
 assert.equal(p.period,'2024-12-31');assert.match(p.text,/58\.943\.464/);
 const c=(await answerGuide({...input,question:'clima'})).evidence[0];
 assert.equal(c.period,'2023');assert.match(c.text,/capoluoghi regionali/);
});
test('unsupported questions abstain rather than reuse dated facts for unrelated periods or countries',async()=>{
 for(const q of ['popolazione 2030','popolazione di Francia','capitale della Francia','previsioni clima 2050','__proto__','constructor'])assert.equal((await answerGuide({...input,question:q})).status,'insufficient');
 assert.equal((await answerGuide({...input,code:'FR',question:'capitale 1800'})).status,'insufficient');
});
test('model cannot select an Italian pilot ID for a different country or inject a URL',async()=>{
 const a=await answerGuide({...input,code:'FR',question:'capitale 1800'},async()=> '{"ids":["it-political"]}');
 assert.equal(a.mode,'fallback');assert.equal(a.status,'insufficient');
 const b=await answerGuide(input,async()=> '{"ids":["it-orography"],"url":"https://bad.test"}');
 assert.equal(b.mode,'fallback');assert.equal(b.evidence[0].id,'it-orography');
 assert.equal(evidenceFor(input).length,18);
});


test('France corpus has twelve disciplines, scoped bilingual facts and explicit review status',async()=>{
 const it=pilotEvidence('FR','it'),en=pilotEvidence('FR','en');
 assert.equal(it.length,12);assert.deepEqual([...new Set(it.map(f=>f.discipline))].sort(),[...disciplines].sort());
 assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
 for(let i=0;i<it.length;i++){assert.ok(it[i].id.startsWith('fr-'));assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].source,en[i].source);assert.match(it[i].source,/^https:\/\//);assert.equal(it[i].review,'source-checked-not-independent');}
 for(const [language,questions] of [['it',['orografia','idrografia','geologia','biogeografia','popolazione 2026','storia','territorio','oceanografia','clima','capitale','economia 2024','città']],['en',['orography','hydrology','geology','biogeography','population 2026','historical geography','physical geography','oceanography','climatology','capital','economy 2024','urban geography']]])for(let i=0;i<questions.length;i++){const a=await answerGuide({code:'FR',language,question:questions[i]});assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);}
 assert.equal((await answerGuide({code:'FR',language:'it',question:'popolazione 2026'})).evidence[0].period,'2026-01-01');
 assert.equal((await answerGuide({code:'FR',language:'it',question:'popolazione'})).evidence[0].id,'wdi-SP.POP.TOTL');
 assert.equal((await answerGuide({code:'DE',language:'it',question:'geologia'})).status,'insufficient');
 assert.deepEqual(pilotEvidence('FR','fr'),en);
});

test('France dated economic and urban evidence retain explicit geographical and temporal scope',async()=>{
 const g=await answerGuide({code:'FR',language:'it',question:'economia 2024'});assert.equal(g.evidence[0].period,'2024');assert.equal(g.evidence[0].checked,'2026-11-27');assert.match(g.evidence[0].text,/2\.919,9/);
 const u=await answerGuide({code:'FR',language:'en',question:'urban geography'});assert.equal(u.evidence[0].period,'2023');assert.match(u.evidence[0].text,/2,103,778.*11,013,774/);
 assert.equal((await answerGuide({code:'FR',language:'en',question:'economy 2030'})).status,'insufficient');
});
