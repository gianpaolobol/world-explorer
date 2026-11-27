// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Explicit live integration: fixed public landmarks, no cached images, no author data in logs.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {makeServer} from '../server.mjs';
import {once} from 'node:events';

test('Commons real browser CORS, attribution and thumbnail',{timeout:75000},async t=>{
 const server=makeServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch();t.after(()=>browser.close());
 const context=await browser.newContext();
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.origin===origin||u.origin==='https://commons.wikimedia.org'||u.origin==='https://upload.wikimedia.org')return route.continue();
  return route.abort();
 });
 const page=await context.newPage();
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{
  const {nearbyPhotos}=await import('/src/photos.mjs');
  let accepted=0,decoded=0;
  // Public landmark coordinates, not a user's location; sequential calls only.
  for(const [lat,lon] of [[41.8902,12.4922],[48.8584,2.2945]]){
   const photos=await nearbyPhotos(lat,lon,fetch,AbortSignal.timeout(15000));
   accepted+=photos.length;
   if(!photos.length)continue;
   const p=photos[0];
   if(!p.title||!(p.author||p.attribution)||!p.license||!p.licenseUrl||!p.source)throw Error('Missing attribution');
   const img=new Image();img.referrerPolicy='no-referrer';img.src=p.image;
   let timeout;
   try{await Promise.race([img.decode(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Thumbnail timeout')),10000);})]);}
   finally{clearTimeout(timeout);img.removeAttribute('src');}
   decoded++;
  }
  return {accepted,decoded};
 });
 assert.ok(result.accepted>=1,'No acceptable image returned for either landmark');
 assert.ok(result.decoded>=1,'No thumbnail decoded');
 console.log('Commons accepted metadata records:',result.accepted,'decoded thumbnails:',result.decoded);
});
