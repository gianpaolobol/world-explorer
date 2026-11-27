import test from 'node:test';
import assert from 'node:assert/strict';
import {lineCollection,fetchBoundaries,boundaryURLs} from '../src/boundaries.mjs';
import {photoQuery,photoCandidates,nearbyPhotos} from '../src/photos.mjs';
const geometry={type:'LineString',coordinates:[[0,1],[2,3]]};
const collection={type:'FeatureCollection',features:[{type:'Feature',properties:{description:'<script>alert(1)</script>'},geometry}]};
test('boundary source immutable version and strips descriptions',()=>{assert.match(boundaryURLs.land,/f1890d9f152c896d250a77557a5751a93d494776/);assert.deepEqual(lineCollection(collection).features[0],{type:'Feature',properties:{},geometry});});
test('invalid boundary geometry rejected',()=>{for(const g of [{type:'Polygon',coordinates:[]},{type:'LineString',coordinates:[[181,0],[0,0]]},{type:'MultiLineString',coordinates:[]}])assert.throws(()=>lineCollection({type:'FeatureCollection',features:[{type:'Feature',geometry:g}]}));});
test('two boundary requests omit credentials and reject partial load',async()=>{const seen=[];const result=await fetchBoundaries(async(url,opts)=>{seen.push(url);assert.equal(opts.credentials,'omit');return {ok:true,json:async()=>collection};});assert.equal(result.length,2);assert.equal(seen.length,2);await assert.rejects(fetchBoundaries(async url=>({ok:url===boundaryURLs.land,json:async()=>collection})));});
const fixture=()=>({query:{pages:[{title:'File:Landscape.jpg',imageinfo:[{mime:'image/jpeg',thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Landscape.jpg/640px-Landscape.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Landscape.jpg',extmetadata:{Artist:{value:'<a href="https://example.org">A &amp; B</a>'},Attribution:{value:'A &amp; B'},Credit:{value:'Own work'},LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'}}}]}]}});
test('Commons query only sends public camera coordinates',()=>{const u=new URL(photoQuery(44,11));assert.equal(u.hostname,'commons.wikimedia.org');assert.equal(u.searchParams.get('ggscoord'),'44|11');assert.equal(u.searchParams.get('origin'),'*');assert.equal(u.searchParams.get('ggsnamespace'),'6');assert.throws(()=>photoQuery(91,0));});
test('Commons attribution and allowed license preserved as plain text',()=>{const [p]=photoCandidates(fixture());assert.equal(p.author,'A & B');assert.equal(p.credit,'Own work');assert.equal(p.license,'CC BY-SA 4.0');assert.equal(p.title,'Landscape.jpg');});
test('noncommercial, unknown, mismatched and restricted licenses rejected',()=>{for(const change of [m=>m.LicenseShortName.value='CC BY-NC 4.0',m=>m.LicenseShortName.value='toString',m=>m.LicenseUrl.value='https://evil.example/',m=>m.Restrictions={value:'Personality rights'},m=>{delete m.Artist;delete m.Attribution;}]){const d=fixture();change(d.query.pages[0].imageinfo[0].extmetadata);assert.deepEqual(photoCandidates(d),[]);}});
test('non-image and untrusted URLs rejected',()=>{for(const change of [i=>i.mime='image/svg+xml',i=>i.thumburl='https://upload.wikimedia.org.evil.example/wikipedia/commons/a.jpg',i=>i.descriptionurl='javascript:alert(1)',i=>i.thumburl='https://x@upload.wikimedia.org/wikipedia/commons/a.jpg']){const d=fixture();change(d.query.pages[0].imageinfo[0]);assert.deepEqual(photoCandidates(d),[]);}});
test('Commons network and API failures surfaced; empty responses safe',async()=>{await assert.rejects(nearbyPhotos(0,0,async()=>({ok:false})));await assert.rejects(nearbyPhotos(0,0,async()=>new Response(JSON.stringify({error:{code:'bad'}}))));assert.deepEqual(await nearbyPhotos(0,0,async()=>new Response('{}')),[]);});

test('Commons request identifies client, omits credentials and rejects redirects',async()=>{
 const signal=new AbortController().signal;
 const result=await nearbyPhotos(44,11,async(url,options)=>{
  assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');
  assert.equal(options.redirect,'error');assert.equal(options.signal,signal);
  assert.match(options.headers['Api-User-Agent'],/WorldExplorer/);
  return new Response(JSON.stringify(fixture()));
 },signal);
 assert.equal(result.length,1);
});
test('Commons metadata size is bounded even without a length header',async()=>{
 await assert.rejects(nearbyPhotos(0,0,async()=>new Response('{}',{headers:{'content-length':'1048577'}})),/too large/);
 await assert.rejects(nearbyPhotos(0,0,async()=>new Response(' '.repeat(1048577))),/too large/);
 await assert.rejects(nearbyPhotos(0,0,async()=>new Response('{')),SyntaxError);
});
test('Commons result count and credits are bounded; duplicates excluded',()=>{
 const d=fixture();const page=d.query.pages[0];
 d.query.pages=Array.from({length:8},()=>structuredClone(page));
 assert.equal(photoCandidates(d).length,1);
 d.query.pages=Array.from({length:8},(_,i)=>{const p=structuredClone(page);p.title='File:Landscape'+i+'.jpg';p.imageinfo[0].descriptionurl='https://commons.wikimedia.org/wiki/File:Landscape'+i+'.jpg';return p;});
 assert.equal(photoCandidates(d).length,5);
 const long=fixture();long.query.pages[0].imageinfo[0].extmetadata.Attribution.value='x'.repeat(4097);
 assert.deepEqual(photoCandidates(long),[]);
});
