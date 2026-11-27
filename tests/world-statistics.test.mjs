import test from 'node:test';
import assert from 'node:assert/strict';
import {countryMap,parseIndicator,statisticsFor,YEAR,INDICATORS,indicatorYear} from '../src/world-statistics.mjs';
const page=a=>[{page:1,pages:1,total:a.length},a];
const country=(iso2Code,id,region={id:'ECS',value:'Europe'})=>({iso2Code,id,region});
const map=countryMap(page([country('IT','ITA'),country('FR','FRA'),country('US','USA'),country('DE','AGG',{id:'NA',value:'Aggregates'}),country('XX','XXX')]));
const row=(code,iso,value,id='SP.POP.TOTL',date=YEAR)=>({country:{id:code},countryiso3code:iso,value,indicator:{id},date});
test('WDI country matching excludes aggregates and nonregistry codes',()=>{assert.deepEqual([...map],[['IT','ITA'],['FR','FRA'],['US','USA']]);assert.throws(()=>countryMap(page([country('IT','ITA'),country('IT','ITA')])));});
test('WDI parser preserves zero, omits missing and excludes unregistered rows',()=>{assert.deepEqual(parseIndicator(page([row('IT','ITA',123),row('FR','FRA',null),row('US','USA',0),row('DE','AGG',50)]),'SP.POP.TOTL',map),{IT:123,US:0});});
test('WDI parser rejects incomplete pages, wrong years, duplicates and country mismatches',()=>{for(const data of [[{page:1,pages:2,total:1},[row('IT','ITA',1)]],page([row('IT','ITA',1,'SP.POP.TOTL','2023')]),page([row('IT','ITA',1),row('IT','ITA',1)]),page([row('IT','FRA',1)]),page([row('IT','ITA',1,'NY.GDP.MKTP.CD')])])assert.throws(()=>parseIndicator(data,'SP.POP.TOTL',map));});
test('WDI parser rejects invalid numeric values rather than coercing',()=>{for(const v of [-1,'23',1.5,Infinity])assert.throws(()=>parseIndicator(page([row('IT','ITA',v)]),'SP.POP.TOTL',map));assert.throws(()=>parseIndicator(page([row('IT','ITA',101,'SP.URB.TOTL.IN.ZS')]),'SP.URB.TOTL.IN.ZS',map));});
test('offline profile uses dated and attributed observations only, explicit language fallback',()=>{const snapshot={year:YEAR,retrieved:'2026-11-26',values:{'SP.POP.TOTL':{IT:1234},'SP.URB.TOTL.IN.ZS':{IT:0}}};const a=statisticsFor(snapshot,'IT','it');assert.equal(a.length,2);assert.equal(a[0].value,'1.234');assert.equal(a[1].value,'0 %');assert.ok(a.every(x=>x.year===YEAR&&x.attribution.includes('World Bank')&&x.source.startsWith('https://data.worldbank.org/indicator/')));assert.equal(statisticsFor(snapshot,'IT','ja')[0].language,'en');assert.deepEqual(statisticsFor(snapshot,'FR'),[]);assert.deepEqual(statisticsFor(null,'IT'),[]);assert.deepEqual(statisticsFor({...snapshot,year:'2023'},'IT'),[]);assert.equal(INDICATORS.length,16);});

import {get,retryDelay,acquire} from '../scripts/fetch-world-statistics.mjs';
test('WDI respects Retry-After seconds and date, rejects excessive waits',()=>{
 assert.equal(retryDelay('4',0),4000);assert.equal(retryDelay('garbage',1),4000);
 assert.equal(retryDelay('Thu, 26 Nov 2026 09:00:10 GMT',0,Date.parse('2026-11-26T09:00:00Z')),10000);
 assert.throws(()=>retryDelay('61',0),/Retry-After/);
});
test('WDI bounded retry recovers from 429 and never retries permanent HTTP errors',async()=>{
 let calls=0;const waits=[];
 const request=async(url,opts)=>{calls++;assert.equal(url.hostname,'api.worldbank.org');assert.equal(opts.redirect,'error');return calls===1?new Response('limited',{status:429,headers:{'Retry-After':'3'}}):new Response('[1,2]');};
 assert.deepEqual(await get('country',{}, {request,wait:async ms=>waits.push(ms),report:()=>{}}),[1,2]);assert.deepEqual(waits,[3000]);assert.equal(calls,2);
 calls=0;await assert.rejects(get('country',{}, {request:async()=>{calls++;return new Response('',{status:400});},wait:async()=>assert.fail('permanent error retried')}),/HTTP 400/);assert.equal(calls,1);
});
test('WDI stops at three rate limited attempts',async()=>{
 let calls=0;const waits=[];
 await assert.rejects(get('country',{}, {request:async()=>{calls++;return new Response('',{status:429});},wait:async ms=>waits.push(ms),report:()=>{}}),/HTTP 429/);
 assert.equal(calls,3);assert.deepEqual(waits,[2000,4000]);
});
test('WDI acquisition requests one indicator at a time and returns no partial snapshot on failure',async()=>{
 const paths=[],waits=[];let active=0;
 const getJson=async(path,query)=>{assert.equal(active++,0);paths.push(path);await Promise.resolve();active--;if(path==='country')return page([country('IT','ITA')]);const id=path.split('/').at(-1);assert.equal(query.date,indicatorYear(id));assert.equal(query.source,'2');return page([row('IT','ITA',1,id,indicatorYear(id))]);};
 const a=await acquire({getJson,wait:async ms=>waits.push(ms),now:()=>new Date('2026-11-26T09:00:00Z')});
 assert.deepEqual(paths,['country',...INDICATORS.map(i=>'country/all/indicator/'+i.id)]);assert.deepEqual(waits,INDICATORS.map(()=>1500));assert.equal(a.retrieved,'2026-11-26');assert.equal(Object.keys(a.values).length,INDICATORS.length);
 await assert.rejects(acquire({getJson:async p=>{if(p==='country')return page([country('IT','ITA')]);throw Error('unavailable');},wait:async()=>{}}),/unavailable/);
});

test('WDI retries timeout but not invalid JSON, with bounded attempts',async()=>{
 let calls=0;const waits=[];
 const timeout=()=>new DOMException('timed out','TimeoutError');
 assert.deepEqual(await get('country',{}, {request:async()=>{if(++calls===1)throw timeout();return new Response('[1,2]');},wait:async ms=>waits.push(ms),report:()=>{}}),[1,2]);
 assert.equal(calls,2);assert.deepEqual(waits,[2000]);
 calls=0;await assert.rejects(get('country',{}, {request:async()=>{calls++;throw timeout();},wait:async()=>{},report:()=>{}}),{name:'TimeoutError'});assert.equal(calls,3);
 calls=0;await assert.rejects(get('country',{}, {request:async()=>{calls++;return new Response('not json');},wait:async()=>assert.fail('invalid data retried')}),SyntaxError);assert.equal(calls,1);
});

import {snapshot} from '../src/world-statistics-data.mjs';
import {countries} from '../src/countries.mjs';
test('verified CI snapshot contains 2301 dated observations from 194 registry destinations',()=>{
 assert.equal(snapshot.year,'2024');assert.equal(snapshot.retrieved,'2026-11-27');
 assert.deepEqual(Object.keys(snapshot.values),INDICATORS.slice(0,12).map(i=>i.id));
 assert.deepEqual(Object.values(snapshot.values).map(v=>Object.keys(v).length),[194,187,194,191,193,193,192,190,192,194,187,194]);
 const allowed=new Set(countries.map(c=>c.code));
 const union=new Set(Object.values(snapshot.values).flatMap(Object.keys));
 assert.equal(union.size,194);assert.ok([...union].every(c=>allowed.has(c)));
 assert.deepEqual(statisticsFor(snapshot,'VA'),[]);
 assert.equal(countries.reduce((n,c)=>n+statisticsFor(snapshot,c.code).length,0),2301);
 for(const [id,values] of Object.entries(snapshot.values))for(const [code,v] of Object.entries(values)){
  assert.ok(Number.isFinite(v)&&v>=0);if(id.endsWith('.ZS'))assert.ok(v<=100);
  if(id==='SP.POP.TOTL')assert.ok(Number.isSafeInteger(v));if(id==='SP.DYN.LE00.IN')assert.ok(v>0&&v<=130);
 }
});

test('four new statistic locales retain exact observation coverage, provenance and dated query selection',async()=>{
 const {statisticsEvidence,statisticsSelection,statisticsLanguages}=await import('../src/world-statistics.mjs');
 assert.deepEqual(statisticsLanguages,['it','en','fr','es','de','pt']);
 const queries={fr:['population','pib','population urbaine','superficie forestière'],es:['población','pib','población urbana','superficie forestal'],de:['bevölkerung','bip','stadtbevölkerung','waldfläche'],pt:['população','pib','população urbana','área florestal']};
 for(const [locale,qs] of Object.entries(queries)){
  for(const {code} of countries){
   const base=statisticsEvidence(snapshot,code,'en'),translated=statisticsEvidence(snapshot,code,locale);
   assert.deepEqual(translated.map(({id,source,period,checked})=>({id,source,period,checked})),base.map(({id,source,period,checked})=>({id,source,period,checked})));
   assert.ok(translated.every(x=>x.language===locale));
   for(let i=0;i<qs.length;i++){
    const id='wdi-'+INDICATORS[i].id;
    assert.deepEqual(statisticsSelection(snapshot,{code,language:locale,question:qs[i]}),base.some(x=>x.id===id)?[id]:[]);
   }
   assert.deepEqual(statisticsSelection(snapshot,{code,language:locale,question:qs[0]+' 2030'}),[]);
  }
 }
});

// Synthetic edge cases complement the separately acquired snapshot.
test('expanded WDI indicators validate units, retain fractions and select exact localized evidence',async()=>{
 const {statisticsEvidence,statisticsSelection}=await import('../src/world-statistics.mjs');
 const ids=["AG.LND.TOTL.K2","EN.POP.DNST","AG.LND.AGRI.ZS","AG.LND.ARBL.ZS"];
 const vals=[123.45,0.25,0,99.5];
 const values=Object.fromEntries(ids.map((id,i)=>[id,parseIndicator(page([row('IT','ITA',vals[i],id),row('FR','FRA',null,id)]),id,map)]));
 const candidate={year:YEAR,retrieved:'2026-11-27',values};
 assert.deepEqual(statisticsFor(candidate,'IT','en').map(x=>x.value),['123.45 km²','0.25 /km²','0 %','99.5 %']);
 assert.deepEqual(statisticsFor(candidate,'FR'),[]);
 const queries={"it":["superficie delle terre emerse","densità di popolazione","superficie agricola","superficie arabile"],"en":["land area","population density","agricultural land","arable land"],"fr":["superficie des terres émergées","densité de population","terres agricoles","terres arables"],"es":["superficie terrestre","densidad de población","tierras agrícolas","tierras cultivables"],"de":["landfläche","bevölkerungsdichte","landwirtschaftliche fläche","ackerland"],"pt":["área terrestre","densidade populacional","área agrícola","terra arável"]};
 for(const [language,questions] of Object.entries(queries)){
  assert.ok(statisticsEvidence(candidate,'IT',language).every(x=>x.language===language&&x.period===YEAR&&x.review==='source-checked-not-independent'));
  for(let i=0;i<ids.length;i++){
   assert.deepEqual(statisticsSelection(candidate,{code:'IT',language,question:questions[i]}),['wdi-'+ids[i]]);
   assert.deepEqual(statisticsSelection(candidate,{code:'FR',language,question:questions[i]}),[]);
   assert.deepEqual(statisticsSelection(candidate,{code:'IT',language,question:questions[i]+' 2030'}),[]);
  }
 }
 for(const id of ids){assert.throws(()=>parseIndicator(page([row('IT','ITA',-1,id)]),id,map));}
 for(const id of ids.slice(2)){assert.throws(()=>parseIndicator(page([row('IT','ITA',101,id)]),id,map));}
});

test('real expanded snapshot supports all twelve exact queries in six locales without filling gaps',async()=>{
 const {statisticsEvidence,statisticsSelection}=await import('../src/world-statistics.mjs');
 const queries={"it":["popolazione","pil","popolazione urbana","superficie forestale","superficie delle terre emerse","densità di popolazione","superficie agricola","superficie arabile","superficie totale","popolazione rurale","pil pro capite","speranza di vita"],"en":["population","gdp","urban population","forest area","land area","population density","agricultural land","arable land","surface area","rural population","gdp per capita","life expectancy"],"fr":["population","pib","population urbaine","superficie forestière","superficie des terres émergées","densité de population","terres agricoles","terres arables","superficie totale","population rurale","pib par habitant","espérance de vie"],"es":["población","pib","población urbana","superficie forestal","superficie terrestre","densidad de población","tierras agrícolas","tierras cultivables","superficie total","población rural","pib per cápita","esperanza de vida"],"de":["bevölkerung","bip","stadtbevölkerung","waldfläche","landfläche","bevölkerungsdichte","landwirtschaftliche fläche","ackerland","gesamtfläche","landbevölkerung","bip je einwohner","lebenserwartung"],"pt":["população","pib","população urbana","área florestal","área terrestre","densidade populacional","área agrícola","terra arável","área total","população rural","pib per capita","esperança de vida"]};
 for(const {code} of countries)for(const [language,questions] of Object.entries(queries)){
  const evidence=statisticsEvidence(snapshot,code,language);
  for(const [i,indicator] of INDICATORS.slice(0,12).entries()){
   const id='wdi-'+indicator.id,present=Object.hasOwn(snapshot.values[indicator.id]??{},code),fact=evidence.find(x=>x.id===id);
   assert.equal(Boolean(fact),present);
   if(fact)assert.ok(fact.language===language&&fact.period===YEAR&&fact.checked===snapshot.retrievedByIndicator[indicator.id]&&fact.source==='https://data.worldbank.org/indicator/'+indicator.id);
   assert.deepEqual(statisticsSelection(snapshot,{code,language,question:questions[i]}),present?[id]:[]);
   assert.deepEqual(statisticsSelection(snapshot,{code,language,question:questions[i]+' '+YEAR+'? '}),present?[id]:[]);
   assert.deepEqual(statisticsSelection(snapshot,{code,language,question:questions[i]+' 2023'}),[]);
   assert.deepEqual(statisticsSelection(snapshot,{code,language,question:questions[i]+' 2030'}),[]);
   assert.deepEqual(statisticsSelection(snapshot,{code,language,question:questions[i]+' '+YEAR+' 2030'}),[]);
  }
 }
});


test('demographic and surface-area expansion preserves independent indicators and exact localized queries',async()=>{
 const {statisticsEvidence,statisticsSelection}=await import('../src/world-statistics.mjs');
 const ids=["AG.SRF.TOTL.K2","SP.RUR.TOTL.ZS","NY.GDP.PCAP.CD","SP.DYN.LE00.IN"], nums=[123.45,0,4567.89,82.34];
 const values=Object.fromEntries(ids.map((id,i)=>[id,parseIndicator(page([row('IT','ITA',nums[i],id),row('FR','FRA',null,id)]),id,map)]));
 const candidate={year:YEAR,retrieved:'2026-11-27',values};
 assert.deepEqual(statisticsFor(candidate,'IT','en').map(x=>x.value),['123.45 km²','0 %','4,567.89 USD','82.34']);
 assert.deepEqual(statisticsFor(candidate,'FR'),[]);
 for(const [language,questions] of Object.entries({"it":["superficie totale","popolazione rurale","pil pro capite","speranza di vita"],"en":["surface area","rural population","gdp per capita","life expectancy"],"fr":["superficie totale","population rurale","pib par habitant","espérance de vie"],"es":["superficie total","población rural","pib per cápita","esperanza de vida"],"de":["gesamtfläche","landbevölkerung","bip je einwohner","lebenserwartung"],"pt":["área total","população rural","pib per capita","esperança de vida"]})){
  const facts=statisticsEvidence(candidate,'IT',language);
  assert.equal(facts.length,4);
  assert.ok(facts.every(x=>x.language===language&&x.period===YEAR&&x.review==='source-checked-not-independent'));
  for(let i=0;i<ids.length;i++){
   const input={code:'IT',language,question:questions[i]},expected=['wdi-'+ids[i]];
   assert.deepEqual(statisticsSelection(candidate,input),expected);
   assert.deepEqual(statisticsSelection(candidate,{...input,question:input.question+' 2024?'}),expected);
   assert.deepEqual(statisticsSelection(candidate,{...input,question:input.question+' 2023'}),[]);
   assert.deepEqual(statisticsSelection(candidate,{...input,code:'FR'}),[]);
  }
 }
 for(const v of [-1,0,131,Infinity,'80'])assert.throws(()=>parseIndicator(page([row('IT','ITA',v,ids[3])]),ids[3],map));
 assert.throws(()=>parseIndicator(page([row('IT','ITA',101,ids[1])]),ids[1],map));
});


test('incremental WDI acquisition requests only missing series and preserves old provenance and values',async()=>{
 const base={year:YEAR,retrieved:'2026-11-26',values:{'SP.POP.TOTL':{IT:1234},'NY.GDP.MKTP.CD':{IT:5678}},retrievedByIndicator:{'NY.GDP.MKTP.CD':'2026-11-25'}};
 const original=JSON.stringify(base),paths=[],waits=[];
 const getJson=async(path,query)=>{paths.push(path);if(path==='country')return page([country('IT','ITA')]);const id=path.split('/').at(-1);assert.equal(query.date,indicatorYear(id));return page([row('IT','ITA',1,id,indicatorYear(id))]);};
 const result=await acquire({base,getJson,wait:async ms=>waits.push(ms),now:()=>new Date('2026-11-27T09:00:00Z')});
 assert.equal(JSON.stringify(base),original);
 assert.deepEqual(paths,['country',...INDICATORS.slice(2).map(i=>'country/all/indicator/'+i.id)]);
 assert.deepEqual(waits,INDICATORS.slice(2).map(()=>5000));
 assert.equal(result.values['SP.POP.TOTL'].IT,1234);assert.equal(result.values['NY.GDP.MKTP.CD'].IT,5678);
 assert.deepEqual(Object.keys(result.values),INDICATORS.map(i=>i.id));
 assert.deepEqual(statisticsFor(result,'IT','en').map(x=>x.retrieved),['2026-11-26','2026-11-25',...INDICATORS.slice(2).map(()=> '2026-11-27')]);
 assert.equal(await acquire({base:result,getJson:async()=>assert.fail('complete snapshot requested network')}),result);
 await assert.rejects(acquire({base:{...base,year:'2023'},getJson:async()=>assert.fail('invalid base requested network')}),/Invalid base/);
 await assert.rejects(acquire({base:{...base,values:{'SP.POP.TOTL':{XX:1}}},getJson:async()=>assert.fail('invalid base requested network')}),/Invalid base/);
 await assert.rejects(acquire({base,getJson:async p=>{if(p==='country')return page([country('IT','ITA')]);throw Error('unavailable');},wait:async()=>{}}),/unavailable/);
 assert.equal(JSON.stringify(base),original);
});


test('environmental series enforce individual reference years and exact localized queries',async()=>{
 const {statisticsEvidence,statisticsSelection}=await import('../src/world-statistics.mjs');
 const defs=[{"id":"AG.LND.PRCP.MM","year":"2022","q":{"it":"precipitazione media","en":"average precipitation","fr":"précipitations moyennes","es":"precipitación media","de":"jahresniederschlag","pt":"precipitação média"}},{"id":"ER.H2O.INTR.PC","year":"2022","q":{"it":"risorse idriche interne pro capite","en":"internal freshwater per capita","fr":"eau douce interne par habitant","es":"agua dulce interna por habitante","de":"internes süßwasser pro kopf","pt":"água doce interna per capita"}},{"id":"ER.MRN.PTMR.ZS","year":"2025","q":{"it":"aree marine protette","en":"marine protected areas","fr":"aires marines protégées","es":"áreas marinas protegidas","de":"meeresschutzgebiete","pt":"áreas marinhas protegidas"}},{"id":"ER.LND.PTLD.ZS","year":"2025","q":{"it":"aree terrestri protette","en":"terrestrial protected areas","fr":"aires terrestres protégées","es":"áreas terrestres protegidas","de":"landschutzgebiete","pt":"áreas terrestres protegidas"}}];
 const values=Object.fromEntries(defs.map(d=>[d.id,parseIndicator(page([row('IT','ITA',25,d.id,d.year),row('FR','FRA',null,d.id,d.year)]),d.id,map)]));
 const yearByIndicator=Object.fromEntries(defs.map(d=>[d.id,d.year]));const candidate={year:YEAR,retrieved:'2026-11-27',yearByIndicator,values};
 for(const d of defs){assert.throws(()=>parseIndicator(page([row('IT','ITA',25,d.id,'2024')]),d.id,map));for(const [language,question] of Object.entries(d.q)){const input={code:'IT',language,question},id='wdi-'+d.id;assert.deepEqual(statisticsSelection(candidate,input),[id]);assert.deepEqual(statisticsSelection(candidate,{...input,question:question+' '+d.year}),[id]);assert.deepEqual(statisticsSelection(candidate,{...input,question:question+' 2024'}),[]);assert.deepEqual(statisticsSelection(candidate,{...input,code:'FR'}),[]);assert.deepEqual(statisticsSelection({...candidate,yearByIndicator:{}},input),[]);assert.equal(statisticsEvidence(candidate,'IT',language).find(x=>x.id===id).period,d.year);}}
 for(const d of defs.filter(x=>x.id.endsWith('.ZS')))assert.throws(()=>parseIndicator(page([row('IT','ITA',101,d.id,d.year)]),d.id,map));
});
