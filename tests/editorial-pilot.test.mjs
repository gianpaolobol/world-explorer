// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {countries,languages} from '../src/countries.mjs';
import {disciplines,lldcCodes,sidsCodes,euContextCodes,geoscienceCodes,regionalExtensionCodes,landscapeCodes,urbanHistoryCodes,hydrologyCodes,culturalLandscapeCodes,composeEditorialRows,pilotEvidence,pilotSelection,editorialCoverage} from '../src/editorial-pilot.mjs';
import {answerGuide,evidenceFor} from '../src/guide.mjs';
import {snapshot} from '../src/world-statistics-data.mjs';
const input={code:'IT',language:'it',question:'orografia'};
test('pilot covers the twelve disciplines once with unique IDs and explicit source-check status',()=>{
 const a=pilotEvidence('IT','it');assert.equal(a.length,12);
 assert.deepEqual(a.map(x=>x.discipline),disciplines);
 assert.equal(new Set(a.map(x=>x.id)).size,12);
 for(const x of a){assert.match(x.source,/^https:\/\//);assert.ok(x.label&&x.text);assert.equal(x.checked,'2026-11-26');assert.equal(x.review,'source-checked-not-independent');}
});
test('pilot never transfers Italian evidence to any other country',()=>{
 for(const c of countries.filter(c=>c.code!=='IT'))for(const language of languages){assert.ok(pilotEvidence(c.code,language).every(f=>!f.id.startsWith('it-')));if(!['FR','ES','DE',...lldcCodes,...sidsCodes,...euContextCodes,...geoscienceCodes,...regionalExtensionCodes,...landscapeCodes,...urbanHistoryCodes,...hydrologyCodes,...culturalLandscapeCodes].includes(c.code))assert.deepEqual(pilotEvidence(c.code,language),[]);assert.deepEqual(pilotSelection({code:c.code,language,question:'popolazione'}),[]);}
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
 const expected=['region','method',...pilotEvidence('IT','it').map(x=>x.id),...Object.entries(snapshot.values).filter(([,values])=>Object.hasOwn(values,'IT')).map(([id])=>'wdi-'+id)];
 const actual=evidenceFor(input).map(x=>x.id);
 assert.deepEqual(actual,expected);
 assert.equal(new Set(actual).size,actual.length);
});


test('France corpus has twelve disciplines, scoped bilingual facts and explicit review status',async()=>{
 const it=pilotEvidence('FR','it'),en=pilotEvidence('FR','en');
 assert.equal(it.length,12);assert.deepEqual([...new Set(it.map(f=>f.discipline))].sort(),[...disciplines].sort());
 assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
 for(let i=0;i<it.length;i++){assert.ok(it[i].id.startsWith('fr-'));assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].source,en[i].source);assert.match(it[i].source,/^https:\/\//);assert.equal(it[i].review,'source-checked-not-independent');}
 for(const [language,questions] of [['it',['orografia','idrografia','geologia','biogeografia','popolazione 2026','storia','territorio','oceanografia','clima','capitale','economia 2024','città']],['en',['orography','hydrology','geology','biogeography','population 2026','historical geography','physical geography','oceanography','climatology','capital','economy 2024','urban geography']]])for(let i=0;i<questions.length;i++){const a=await answerGuide({code:'FR',language,question:questions[i]});assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);}
 assert.equal((await answerGuide({code:'FR',language:'it',question:'popolazione 2026'})).evidence[0].period,'2026-01-01');
 assert.equal((await answerGuide({code:'FR',language:'it',question:'popolazione'})).evidence[0].id,'wdi-SP.POP.TOTL');
 assert.equal((await answerGuide({code:'AT',language:'it',question:'geologia'})).status,'insufficient');
 assert.deepEqual(pilotEvidence('FR','fr'),en);
});

test('France dated economic and urban evidence retain explicit geographical and temporal scope',async()=>{
 const g=await answerGuide({code:'FR',language:'it',question:'economia 2024'});assert.equal(g.evidence[0].period,'2024');assert.equal(g.evidence[0].checked,'2026-11-27');assert.match(g.evidence[0].text,/2\.919,9/);
 const u=await answerGuide({code:'FR',language:'en',question:'urban geography'});assert.equal(u.evidence[0].period,'2023');assert.match(u.evidence[0].text,/2,103,778.*11,013,774/);
 assert.equal((await answerGuide({code:'FR',language:'en',question:'economy 2030'})).status,'insufficient');
});


test('Spain: all twelve source-checked facts are scoped, bilingual and selected by the guide',async()=>{
 const it=pilotEvidence('ES','it'),en=pilotEvidence('ES','en');
 assert.deepEqual(it.map(f=>f.discipline),disciplines);
 assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
 for(let i=0;i<12;i++){assert.match(it[i].id,/^es-/);assert.equal(it[i].source,en[i].source);assert.equal(it[i].period,en[i].period);assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].checked,'2026-11-27');assert.equal(it[i].review,'source-checked-not-independent');}
 const queries={it:['territorio','orografia','idrografia','oceanografia','geologia','clima','biogeografia','capitale','popolazione 2025','economia 2024','città','storia'],en:['physical geography','orography','hydrology','oceanography','geology','climatology','biogeography','capital','population 2025','economy 2024','urban geography','historical geography']};
 for(const language of ['it','en'])for(let i=0;i<12;i++){const a=await answerGuide({code:'ES',language,question:queries[language][i]});assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);}
 assert.equal((await answerGuide({code:'ES',language:'it',question:'popolazione'})).evidence[0].id,'wdi-SP.POP.TOTL');
 assert.equal((await answerGuide({code:'ES',language:'it',question:'popolazione 2030'})).status,'insufficient');
 assert.deepEqual(pilotEvidence('ES','es'),en);
});


test('guide answers explicit WDI snapshot years without overriding scoped editorial facts',async()=>{
 for(const [code,language,question,id] of [
  ['FR','it','popolazione 2024','wdi-SP.POP.TOTL'],
  ['DE','de','bevölkerung 2024','wdi-SP.POP.TOTL'],
  ['ES','es','superficie terrestre 2024','wdi-AG.LND.TOTL.K2'],
  ['IT','en','forest area 2024','wdi-AG.LND.FRST.ZS'],
  ['FR','it','popolazione 2026','fr-human'],
  ['ES','en','population 2025','es-human']
 ]){const result=await answerGuide({code,language,question});assert.equal(result.status,'evidence');assert.equal(result.evidence[0].id,id);}
 for(const [code,language,question] of [['VA','it','popolazione 2024'],['FR','it','popolazione 2023'],['DE','de','bevölkerung 2030'],['FR','en','population 2024 2030']]){
  assert.equal((await answerGuide({code,language,question})).status,'insufficient');
 }
});


test('Germany twelve disciplines: bilingual, scoped, dated and source-checked',async()=>{
 const it=pilotEvidence('DE','it'),en=pilotEvidence('DE','en');
 assert.deepEqual(it.map(f=>f.discipline),disciplines);
 assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
 const queries={it:["territorio","orografia","idrografia","oceanografia","geologia","clima","biogeografia","capitale","popolazione 2025","economia 2025","città","storia"],en:["physical geography","orography","hydrology","oceanography","geology","climatology","biogeography","capital","population 2025","economy 2025","urban geography","historical geography"]};
 for(let i=0;i<12;i++){
  assert.match(it[i].id,/^de-/);assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].source,en[i].source);assert.equal(it[i].period,en[i].period);assert.equal(it[i].checked,'2026-11-27');assert.equal(it[i].review,'source-checked-not-independent');
  for(const language of ['it','en']){const a=await answerGuide({code:'DE',language,question:queries[language][i]});assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);}
 }
 assert.deepEqual(pilotEvidence('DE','de'),en);
 assert.equal((await answerGuide({code:'DE',language:'it',question:'popolazione 2024'})).evidence[0].id,'wdi-SP.POP.TOTL');
 assert.equal((await answerGuide({code:'DE',language:'it',question:'popolazione 2030'})).status,'insufficient');
});

test('UN LLDC batch: explicit partial coverage, country scope, exact guide selection and abstention',async()=>{
 const expected='AF AM AZ BT BO BW BF BI CF TD SZ ET KZ KG LA LS MK MW ML MN NP NE PY MD RW SS TJ TM UG UZ ZM ZW'.split(' ');
 assert.deepEqual(lldcCodes,expected);assert.equal(new Set(lldcCodes).size,32);
 for(const c of countries){
  const n=(['IT','FR','ES','DE'].includes(c.code)?12:expected.includes(c.code)?2:sidsCodes.includes(c.code)?3:euContextCodes.includes(c.code)?2:geoscienceCodes.includes(c.code)?3:0)+(regionalExtensionCodes.includes(c.code)?3:0)+(landscapeCodes.includes(c.code)?3:0)+(urbanHistoryCodes.includes(c.code)?2:0)+(hydrologyCodes.includes(c.code)?2:0)+(culturalLandscapeCodes.includes(c.code)?3:0);
  for(const l of languages){
   const a=pilotEvidence(c.code,l);
   assert.equal(a.length,n);
   assert.equal(new Set(a.map(x=>x.id)).size,n);
   assert.ok(a.every(x=>x.id.startsWith(c.code.toLowerCase()+'-')));
  }
  if(!expected.includes(c.code))continue;
  const it=pilotEvidence(c.code,'it'),en=pilotEvidence(c.code,'en');
  assert.deepEqual(it.slice(0,2).map(f=>f.discipline),['oceanography','economic']);
  assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
  for(const [i,qit,qen] of [[0,'oceanografia','oceanography'],[1,'accesso ai porti','access to seaports']]){
   assert.equal(it[i].checked,'2026-11-27');assert.equal(it[i].review,'source-checked-not-independent');
   assert.equal(it[i].source,en[i].source);assert.equal(it[i].period,null);
   assert.notEqual(it[i].text,en[i].text);
   for(const [language,question] of [['it',qit],['en',qen]]){
    const a=await answerGuide({code:c.code,language,question});
    assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);
   }
  }
  assert.deepEqual(pilotEvidence(c.code,'fr'),en);
  assert.equal((await answerGuide({code:c.code,language:'it',question:'oceanografia 2030'})).status,'insufficient');
 }
 assert.equal((await answerGuide({code:'AT',language:'en',question:'access to seaports'})).status,'insufficient');
 assert.equal((await answerGuide({code:'NE',language:'en',question:'access to seaports'},async()=> '{"ids":["af-economic"]}')).mode,'fallback');
 assert.equal(countries.reduce((n,c)=>n+pilotEvidence(c.code,'it').length,0),360);
});

test('UN OHRLLS SIDS group: registry membership, scoped facts and exact guide selection',async()=>{
 const expected='AG BS BB BZ CV KM CU DM DO FJ GD GW GY HT JM KI MV MH FM MU NR PW PG WS ST SG KN LC VC SC SB SR TL TO TT TV VU'.split(' ');
 assert.deepEqual(sidsCodes,expected);
 assert.equal(new Set(expected).size,37);
 assert.ok(expected.every(code=>countries.some(c=>c.code===code)));
 assert.ok(expected.every(code=>!lldcCodes.includes(code)));
 for(const code of expected){
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');
  assert.deepEqual(it.map(f=>f.discipline),['political','oceanography','climatology']);
  assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
  for(const [i,qit,qen] of [[0,'sids','sids'],[1,'oceanografia','oceanography'],[2,'clima','climatology']]){
   assert.notEqual(it[i].text,en[i].text);
   assert.equal(it[i].source,en[i].source);
   assert.equal(it[i].review,'source-checked-not-independent');
   assert.equal(it[i].period,null);
   for(const [language,question] of [['it',qit],['en',qen]]){
    const a=await answerGuide({code,language,question});
    assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);
   }
  }
  assert.deepEqual(pilotEvidence(code,'fr'),en);
  assert.equal((await answerGuide({code,language:'en',question:'climatology 2050'})).status,'insufficient');
 }
 for(const code of ['BH','AT','CK','NU','AF'])assert.deepEqual(pilotSelection({code,language:'en',question:'sids'}),[]);
 assert.equal(countries.filter(c=>pilotEvidence(c.code,'it').length>0).length,118);
});

test('EU context: 23 additional countries, dated membership and currency scope without overwriting pilots',async()=>{
 const expected='AT BE BG CY CZ DK EE FI GR HR HU IE LT LU LV MT NL PL PT RO SE SI SK'.split(' ');
 assert.deepEqual(euContextCodes,expected);
 const euro=new Set('AT BE BG CY EE FI GR HR IE LT LU LV MT NL PT SI SK'.split(' '));
 for(const code of expected){
  assert.ok(countries.some(c=>c.code===code));
  assert.ok(!lldcCodes.includes(code)&&!sidsCodes.includes(code));
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');
  assert.deepEqual(it.slice(0,2).map(f=>f.discipline),['political','economic']);
  assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
  for(const f of it.slice(0,2)){assert.equal(f.review,'source-checked-not-independent');assert.equal(f.checked,'2026-11-27');}
  assert.match(en[0].period,/^(1958|1973|1981|1986|1995|2004|2007|2013)$/);
  assert.equal(en[1].period,'2026-11-27');
  assert.equal(en[1].text.includes('not part'),!euro.has(code));
  assert.deepEqual(pilotEvidence(code,'fr'),en);
  for(const [language,question,index] of [['it','unione europea',0],['en','european union',0],['it','area euro',1],['en','euro area',1]]){
   const a=await answerGuide({code,language,question});
   assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[index].id);
  }
  assert.deepEqual(pilotSelection({code,language:'en',question:'euro area 2050'}),[]);
 }
 assert.equal(pilotEvidence('BG','en')[0].period,'2007');
 assert.equal(pilotEvidence('HR','en')[0].period,'2013');
 for(const code of ['IT','FR','ES','DE'])assert.equal(pilotEvidence(code,'en').length,12);
 for(const code of ['GB','NO','CH','VA','AF'])assert.deepEqual(pilotSelection({code,language:'en',question:'european union'}),[]);
});


test('Nine country-specific geoscience pilots preserve scope and exact bilingual guide selection',async()=>{
 const expected={AR:['orography','hydrology','geology'],AU:['physical','oceanography','biogeography'],BR:['physical','hydrology','biogeography'],CA:['physical','geology','climatology'],CN:['physical','hydrology','geology'],IN:['orography','climatology','biogeography'],JP:['orography','climatology','biogeography'],NZ:['physical','geology','biogeography'],ZA:['physical','climatology','biogeography']};
 const queries={physical:['territorio','physical geography'],orography:['orografia','orography'],hydrology:['idrografia','hydrology'],geology:['geologia','geology'],climatology:['clima','climatology'],biogeography:['biogeografia','biogeography'],oceanography:['oceanografia','oceanography']};
 assert.deepEqual(geoscienceCodes,Object.keys(expected));
 for(const [code,ds] of Object.entries(expected)){
  assert.ok(countries.some(c=>c.code===code));assert.ok(![...lldcCodes,...sidsCodes,...euContextCodes,'IT','FR','ES','DE'].includes(code));
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');assert.deepEqual(it.map(f=>f.discipline),ds);assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
  for(let i=0;i<ds.length;i++){
   assert.match(it[i].source,/^https:\/\/whc\.unesco\.org\/en\/list\/[0-9]+\/$/);assert.equal(it[i].source,en[i].source);assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].checked,'2026-11-27');assert.equal(it[i].review,'source-checked-not-independent');assert.equal(it[i].period,null);
   for(const [j,language] of ['it','en'].entries()){
    const question=queries[ds[i]][j];const a=await answerGuide({code,language,question});assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);assert.deepEqual(pilotSelection({code,language,question:question+' 2050'}),[]);
   }
  }
  assert.deepEqual(pilotEvidence(code,'fr'),en);
  const foreign=await answerGuide({code,language:'en',question:'geology'},async()=> '{"ids":["it-geology"]}');assert.equal(foreign.mode,'fallback');assert.ok(foreign.evidence.every(x=>!x.id.startsWith('it-')));
 }
});


test('editorial batches compose without replacing prior facts, including overlapping Nepal profile',async()=>{
 const sample=composeEditorialRows([['ZZ',[['physical','original']]],['ZZ',[['physical','duplicate'],['geology','new']]]]);
 assert.deepEqual(sample.get('ZZ'),[['physical','original'],['geology','new']]);
 assert.deepEqual(regionalExtensionCodes,['EC','NP','TZ','US']);
 const expected={EC:['oceanography','geology','biogeography'],NP:['oceanography','economic','orography','hydrology','biogeography'],TZ:['orography','geology','biogeography'],US:['geology','biogeography','historical']};
 const queries={oceanography:['oceanografia','oceanography'],geology:['geologia','geology'],biogeography:['biogeografia','biogeography'],economic:['accesso ai porti','access to seaports'],orography:['orografia','orography'],hydrology:['idrografia','hydrology'],historical:['storia','historical geography']};
 for(const [code,ds] of Object.entries(expected)){
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');assert.deepEqual(it.map(f=>f.discipline),ds);assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));assert.equal(new Set(it.map(f=>f.id)).size,ds.length);
  for(let i=0;i<ds.length;i++)for(const [j,language] of ['it','en'].entries()){
   const question=queries[ds[i]][j];const a=await answerGuide({code,language,question});assert.equal(a.status,'evidence');assert.equal(a.evidence.length,1);assert.equal(a.evidence[0].id,it[i].id);assert.deepEqual(pilotSelection({code,language,question:question+' 2050'}),[]);
  }
  assert.deepEqual(pilotEvidence(code,'fr'),en);
 }
 assert.match(pilotEvidence('NP','en')[0].source,/unctad/);assert.match(pilotEvidence('NP','en')[2].source,/unesco/);
});


test('Six landscape profiles preserve earlier facts and provide scoped bilingual evidence',async()=>{
 const expected={"CH":["orography","geology","biogeography"],"HR":["hydrology","geology","biogeography"],"JO":["geology","physical","historical"],"NO":["geology","orography","hydrology"],"TR":["geology","urban","historical"],"VN":["geology","physical","oceanography"]};
 const queries={"physical":["territorio","physical geography"],"orography":["orografia","orography"],"hydrology":["idrografia","hydrology"],"oceanography":["oceanografia","oceanography"],"geology":["geologia","geology"],"climatology":["clima","climatology"],"biogeography":["biogeografia","biogeography"],"urban":["città","urban geography"],"historical":["storia","historical geography"]};
 assert.deepEqual(landscapeCodes,Object.keys(expected));
 for(const [code,ds] of Object.entries(expected)){
  assert.ok(countries.some(c=>c.code===code));
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');
  assert.deepEqual(it.map(f=>f.discipline),code==='HR'?['political','economic',...ds]:ds);
  assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));assert.deepEqual(pilotEvidence(code,'fr'),en);
  for(const d of ds){const a=it.find(f=>f.discipline===d),b=en.find(f=>f.discipline===d);
   assert.equal(a.source,b.source);assert.match(a.source,/^https:\/\/whc\.unesco\.org\/en\/list\/[0-9]+\/$/);assert.equal(a.checked,'2026-11-28');assert.equal(a.review,'source-checked-not-independent');assert.notEqual(a.text,b.text);
   for(const [i,language] of ['it','en'].entries()){const question=queries[d][i];const answer=await answerGuide({code,language,question});assert.equal(answer.status,'evidence');assert.deepEqual(answer.evidence.map(f=>f.id),[a.id]);assert.deepEqual(pilotSelection({code,language,question:question+' 2050'}),[]);}
  }
 }
 assert.equal(pilotEvidence('HR','en')[0].period,'2013');
});

test('editorial coverage counts unique country-discipline slots, gaps and explicitly partial evidence',()=>{
 const codes=countries.map(c=>c.code), report=editorialCoverage(codes);
 assert.equal(report.totalCountries,195);assert.equal(report.totalSlots,2340);
 assert.equal(report.filled,360);assert.equal(report.complete,4);assert.equal(report.partial,114);assert.equal(report.empty,77);
 for(const p of report.profiles){
  const facts=pilotEvidence(p.code,'en');
  assert.deepEqual(p.covered,disciplines.filter(d=>facts.some(f=>f.discipline===d)));
  assert.deepEqual(p.missing,disciplines.filter(d=>!p.covered.includes(d)));
  assert.ok(facts.every(f=>f.review==='source-checked-not-independent'));
 }
 for(const d of disciplines)assert.equal(report.byDiscipline[d],report.profiles.filter(p=>p.covered.includes(d)).length);
 assert.equal(editorialCoverage(['IT','IT','ZZ']).filled,12);
 assert.equal(editorialCoverage(['IT','IT','ZZ']).totalCountries,2);
 assert.equal(editorialCoverage([]).totalSlots,0);
});


test('Six European urban and historical profiles preserve EU context and answer exact bilingual queries',async()=>{
 const expected=['AT','BE','CZ','HU','PL','PT'];assert.deepEqual(urbanHistoryCodes,expected);
 for(const code of expected){
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');
  assert.deepEqual(it.map(f=>f.discipline),['political','economic','urban','historical']);
  assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));assert.deepEqual(pilotEvidence(code,'de'),en);
  for(const [d,queries] of [['urban',['città','urban geography']],['historical',['storia','historical geography']]]){
   const a=it.find(f=>f.discipline===d),b=en.find(f=>f.discipline===d);
   assert.equal(a.source,b.source);assert.match(a.source,/^https:\/\/whc\.unesco\.org\/en\/list\/[0-9]+\/$/);assert.equal(a.checked,'2026-11-28');assert.equal(a.review,'source-checked-not-independent');assert.notEqual(a.text,b.text);
   for(const [i,language] of ['it','en'].entries()){const question=queries[i];const answer=await answerGuide({code,language,question});assert.equal(answer.status,'evidence');assert.deepEqual(answer.evidence.map(f=>f.id),[a.id]);assert.deepEqual(pilotSelection({code,language,question:question+' 2050'}),[]);}
  }
 }
 const report=editorialCoverage(countries.map(c=>c.code));assert.equal(report.byDiscipline.urban,13);assert.equal(report.byDiscipline.historical,15);
});

test('localized scientific topic queries retain exact scope, dates and disclosed English evidence',async()=>{
 const locales={
  fr:['géographie physique','orographie','hydrologie','océanographie','géologie','climatologie','biogéographie','capitale','économie','géographie urbaine','géographie historique','union européenne','zone euro','accès aux ports maritimes','sids'],
  de:['physische geographie','orographie','hydrologie','ozeanographie','geologie','klimatologie','biogeographie','hauptstadt','wirtschaft','stadtgeographie','historische geographie','europäische union','eurozone','zugang zu seehäfen','sids'],
  es:['geografía física','orografía','hidrología','oceanografía','geología','climatología','biogeografía','capital','economía','geografía urbana','geografía histórica','unión europea','zona euro','acceso a puertos marítimos','sids'],
  pt:['geografia física','orografia','hidrologia','oceanografia','geologia','climatologia','biogeografia','capital','economia','geografia urbana','geografia histórica','união europeia','zona euro','acesso a portos marítimos','sids']
 };
 const english=['physical geography','orography','hydrology','oceanography','geology','climatology','biogeography','capital','economy','urban geography','historical geography','european union','euro area','access to seaports','sids'];
 for(const [language,topics] of Object.entries(locales))for(const {code} of countries){
  for(let i=0;i<topics.length;i++)for(const suffix of ['', ' 2024',' 2025',' 2050']){
   const input={code,language,question:topics[i]+suffix};
   const expected=pilotSelection({...input,language:'en',question:english[i]+suffix});
   assert.deepEqual(pilotSelection(input),expected);
   if(expected.length){
    const answer=await answerGuide(input);
    assert.deepEqual(answer.evidence.map(f=>f.id),expected);
    assert.ok(answer.evidence.every(f=>f.language==='en'&&f.id.startsWith(code.toLowerCase()+'-')));
   }
  }
  for(const question of ['constructor','__proto__',topics[0]+' 2024 2050',topics[0]+' xyz'])assert.deepEqual(pilotSelection({code,language,question}),[]);
 }
 assert.deepEqual(pilotSelection({code:'IT',language:'fr',question:'  GÉOLOGIE?  '}),['it-geology']);
 assert.deepEqual(pilotSelection({code:'IT',language:'ja',question:'geology'}),[]);
 assert.equal((await answerGuide({code:'FR',language:'de',question:'bevölkerung 2024'})).evidence[0].id,'wdi-SP.POP.TOTL');
});


test('Five hydrological profiles preserve existing context, scope and bilingual guide evidence',async()=>{
 const expected={BW:['hydrology','biogeography'],IQ:['hydrology','historical'],RO:['hydrology','biogeography'],ZM:['hydrology','geology'],ZW:['hydrology','geology']};
 const queries={hydrology:['idrografia','hydrology'],biogeography:['biogeografia','biogeography'],historical:['storia','historical geography'],geology:['geologia','geology']};
 assert.deepEqual(hydrologyCodes,Object.keys(expected));
 for(const [code,ds] of Object.entries(expected)){
  const facts=pilotEvidence(code,'en');assert.deepEqual(facts.slice(-2).map(f=>f.discipline),ds);
  for(const d of ds)for(const [i,language] of ['it','en'].entries()){
   const question=queries[d][i],answer=await answerGuide({code,language,question});
   assert.equal(answer.status,'evidence');assert.deepEqual(answer.evidence.map(f=>f.id),[code.toLowerCase()+'-'+d]);
   assert.equal(answer.evidence[0].language,language);assert.equal(answer.evidence[0].review,'source-checked-not-independent');
   assert.match(answer.evidence[0].source,/^https:\/\/whc\.unesco\.org\/en\/list\/[0-9]+\/$/);
   assert.deepEqual(pilotSelection({code,language,question:question+' 2050'}),[]);
  }
  for(const [language,question] of [['fr','hydrologie'],['de','hydrologie'],['es','hidrología'],['pt','hidrologia']]){
   const a=await answerGuide({code,language,question});assert.deepEqual(a.evidence.map(f=>f.id),[code.toLowerCase()+'-hydrology']);assert.equal(a.evidence[0].language,'en');
  }
 }
 const report=editorialCoverage(countries.map(c=>c.code));assert.equal(report.byDiscipline.hydrology,17);assert.equal(report.byDiscipline.geology,19);assert.equal(report.byDiscipline.biogeography,18);
});


test('Cultural landscapes extend human geography without substituting local facts for population',async()=>{
 const expected={ID:['human','hydrology','climatology'],MX:['human','economic','urban'],PE:['human','urban','historical'],PH:['human','hydrology','physical']};
 const queries={human:['geografia umana','human geography'],hydrology:['idrografia','hydrology'],climatology:['clima','climatology'],economic:['economia','economy'],urban:['città','urban geography'],historical:['storia','historical geography'],physical:['territorio','physical geography']};
 assert.deepEqual(culturalLandscapeCodes,Object.keys(expected));
 for(const [code,ds] of Object.entries(expected)){
  const it=pilotEvidence(code,'it'),en=pilotEvidence(code,'en');
  assert.deepEqual(it.map(f=>f.discipline),ds);
  assert.deepEqual(it.map(f=>f.id),en.map(f=>f.id));
  for(let i=0;i<ds.length;i++){
   assert.notEqual(it[i].text,en[i].text);assert.equal(it[i].source,en[i].source);assert.ok(it[i].source.startsWith('https://whc.unesco.org/en/list/'));
   assert.equal(it[i].review,'source-checked-not-independent');assert.equal(it[i].period,null);assert.equal(it[i].checked,'2026-11-28');
   for(const [j,language] of ['it','en'].entries()){
    const question=queries[ds[i]][j],answer=await answerGuide({code,language,question});
    assert.equal(answer.status,'evidence');assert.deepEqual(answer.evidence.map(f=>f.id),[it[i].id]);
    assert.deepEqual(pilotSelection({code,language,question:question+' 2050'}),[]);
   }
  }
  for(const [language,question] of [['fr','géographie humaine'],['de','humangeographie'],['es','geografía humana'],['pt','geografia humana']]){
   const a=await answerGuide({code,language,question});assert.deepEqual(a.evidence.map(f=>f.id),[code.toLowerCase()+'-human']);assert.equal(a.evidence[0].language,'en');
  }
  for(const [language,question] of [['it','popolazione'],['en','population']]){
   assert.deepEqual(pilotSelection({code,language,question}),[]);
   assert.ok((await answerGuide({code,language,question})).evidence.every(f=>f.id!==code.toLowerCase()+'-human'));
  }
 }
 assert.equal(pilotSelection({code:'IT',language:'it',question:'geografia umana'})[0],'it-human');
 assert.equal(editorialCoverage(countries.map(c=>c.code)).byDiscipline.human,8);
});
