import test from 'node:test';
import assert from 'node:assert/strict';
import {countryMap,parseIndicator,statisticsFor,YEAR,INDICATORS} from '../src/world-statistics.mjs';
const page=a=>[{page:1,pages:1,total:a.length},a];
const country=(iso2Code,id,region={id:'ECS',value:'Europe'})=>({iso2Code,id,region});
const map=countryMap(page([country('IT','ITA'),country('FR','FRA'),country('US','USA'),country('DE','AGG',{id:'NA',value:'Aggregates'}),country('XX','XXX')]));
const row=(code,iso,value,id='SP.POP.TOTL',date=YEAR)=>({country:{id:code},countryiso3code:iso,value,indicator:{id},date});
test('WDI country matching excludes aggregates and nonregistry codes',()=>{assert.deepEqual([...map],[['IT','ITA'],['FR','FRA'],['US','USA']]);assert.throws(()=>countryMap(page([country('IT','ITA'),country('IT','ITA')])));});
test('WDI parser preserves zero, omits missing and excludes unregistered rows',()=>{assert.deepEqual(parseIndicator(page([row('IT','ITA',123),row('FR','FRA',null),row('US','USA',0),row('DE','AGG',50)]),'SP.POP.TOTL',map),{IT:123,US:0});});
test('WDI parser rejects incomplete pages, wrong years, duplicates and country mismatches',()=>{for(const data of [[{page:1,pages:2,total:1},[row('IT','ITA',1)]],page([row('IT','ITA',1,'SP.POP.TOTL','2023')]),page([row('IT','ITA',1),row('IT','ITA',1)]),page([row('IT','FRA',1)]),page([row('IT','ITA',1,'NY.GDP.MKTP.CD')])])assert.throws(()=>parseIndicator(data,'SP.POP.TOTL',map));});
test('WDI parser rejects invalid numeric values rather than coercing',()=>{for(const v of [-1,'23',1.5,Infinity])assert.throws(()=>parseIndicator(page([row('IT','ITA',v)]),'SP.POP.TOTL',map));assert.throws(()=>parseIndicator(page([row('IT','ITA',101,'SP.URB.TOTL.IN.ZS')]),'SP.URB.TOTL.IN.ZS',map));});
test('offline profile uses dated and attributed observations only, explicit language fallback',()=>{const snapshot={year:YEAR,retrieved:'2026-11-26',values:{'SP.POP.TOTL':{IT:1234},'SP.URB.TOTL.IN.ZS':{IT:0}}};const a=statisticsFor(snapshot,'IT','it');assert.equal(a.length,2);assert.equal(a[0].value,'1.234');assert.equal(a[1].value,'0 %');assert.ok(a.every(x=>x.year===YEAR&&x.attribution.includes('World Bank')&&x.source.startsWith('https://data.worldbank.org/indicator/')));assert.equal(statisticsFor(snapshot,'IT','ja')[0].language,'en');assert.deepEqual(statisticsFor(snapshot,'FR'),[]);assert.deepEqual(statisticsFor(null,'IT'),[]);assert.deepEqual(statisticsFor({...snapshot,year:'2023'},'IT'),[]);assert.equal(INDICATORS.length,4);});

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
 const getJson=async(path,query)=>{assert.equal(active++,0);paths.push(path);await Promise.resolve();active--;if(path==='country')return page([country('IT','ITA')]);const id=path.split('/').at(-1);assert.equal(query.date,YEAR);assert.equal(query.source,'2');return page([row('IT','ITA',1,id)]);};
 const a=await acquire({getJson,wait:async ms=>waits.push(ms),now:()=>new Date('2026-11-26T09:00:00Z')});
 assert.deepEqual(paths,['country',...INDICATORS.map(i=>'country/all/indicator/'+i.id)]);assert.deepEqual(waits,[1500,1500,1500,1500]);assert.equal(a.retrieved,'2026-11-26');assert.equal(Object.keys(a.values).length,4);
 await assert.rejects(acquire({getJson:async p=>{if(p==='country')return page([country('IT','ITA')]);throw Error('unavailable');},wait:async()=>{}}),/unavailable/);
});
