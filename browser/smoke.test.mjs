// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {makeServer} from '../server.mjs';
import {once} from 'node:events';
import {resolve,extname,sep} from 'node:path';
import {readFile} from 'node:fs/promises';
import {countries} from '../src/countries.mjs';

const root=resolve('node_modules/cesium/Build/Cesium');
const cdn='https://cdn.jsdelivr.net/npm/cesium@1.127.0/Build/Cesium/';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6XcAAAAASUVORK5CYII=','base64');
const types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wasm':'application/wasm','.xml':'application/xml'};
async function runBrowser(t,withGlobe,fn){
 const server=makeServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 t.after(()=>browser.close());
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Never load live tiles or send test data to third-party services.
 await context.route('**/*',async route=>{
  const url=route.request().url();
  if(url.startsWith(origin+'/'))return route.continue();
  if(withGlobe&&url.startsWith(cdn)){
   const relative=decodeURIComponent(new URL(url).pathname.slice(new URL(cdn).pathname.length));
   const path=resolve(root,relative);
   if(!path.startsWith(root+sep))return route.abort();
   try{return await route.fulfill({body:await readFile(path),contentType:types[extname(path)]||'application/octet-stream',headers:{'access-control-allow-origin':'*'}});}
   catch{return route.abort();}
  }
  if(withGlobe&&url.startsWith('https://tile.openstreetmap.org/'))return route.fulfill({body:png,contentType:'image/png',headers:{'access-control-allow-origin':'*'}});
  return route.abort();
 });
 await page.goto(origin+'/',{waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelector('#place').options.length===195);
 await fn(page);
 assert.deepEqual(errors,[],'Uncaught browser exceptions');
}
test('Chromium offline atlas: navigation, language, quiz, guide, relief and disabled remote',{timeout:90000},async t=>{
 await runBrowser(t,false,async page=>{
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('modalità atlante testuale'));
  for(const id of ['terrain','bathy','probe','boundaries'])assert.equal(await page.locator('#'+id).isDisabled(),true);
  const it=String(countries.findIndex(c=>c.code==='IT'));
  await page.locator('#place').selectOption(it);
  assert.equal(await page.locator('#name').textContent(),'Italia');
  await page.locator('#lang').selectOption('en');
  assert.equal(await page.locator('#name').textContent(),'Italy');
  await page.locator('#next').click();
  assert.notEqual(await page.locator('#place').inputValue(),it);
  await page.locator('#prev').click();
  assert.equal(await page.locator('#place').inputValue(),it);
  await page.locator('#lang').selectOption('it');
  await page.locator('#quiz summary').click();
  await page.locator('#quizNext').click();
  assert.equal(await page.locator('#quizOptions button').count(),4);
  await page.locator('#quizOptions button').first().click();
  assert.equal(await page.locator('#quizOptions button:disabled').count(),4);
  assert.match(await page.locator('#quizFeedback').textContent(),/Fonte ONU M49/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('world-explorer-region-quiz-v1')));
  assert.equal(Object.keys(saved).length,1);
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('#quizStats').textContent.includes('1 / 195'));
  await page.locator('#guide summary').click();
  await page.locator('#guideQuestion').fill('Regione statistica');
  await page.locator('#guideAsk').click();
  await page.locator('#guideAnswer a').waitFor();
  assert.equal(await page.locator('#guideAnswer a').first().getAttribute('href'),'https://unstats.un.org/unsd/methodology/m49/overview/');
  await page.locator('#guideQuestion').fill('qual è la popolazione?');
  await page.locator('#guideAsk').click();
  await page.waitForFunction(()=>document.querySelector('#guideStatus').textContent.includes('insufficienti'));
  assert.equal(await page.locator('#guideAnswer a').count(),0);
  await page.locator('#numericRelief summary').click();
  await page.locator('#reliefFile').setInputFiles({name:'synthetic.asc',mimeType:'text/plain',buffer:Buffer.from('ncols 2\nnrows 2\nxllcorner 10\nyllcorner 40\ncellsize 0.004166666667\n-100 20\n30 40\n')});
  await page.locator('#reliefCanvas').waitFor({state:'visible'});
  assert.match(await page.locator('#reliefStatus').textContent(),/quota min -100 m, max 40 m/);
  await page.locator('#reliefScale').selectOption('5');
  assert.match(await page.locator('#reliefStatus').textContent(),/5×/);
  await page.locator('#reliefClear').click();
  assert.equal(await page.locator('#reliefCanvas').isVisible(),false);
  await page.locator('summary').filter({hasText:'Telecomando iPhone'}).click();
  await page.locator('#remotePair').click();
  await page.waitForFunction(()=>document.querySelector('#remoteStatus').textContent.includes('non configurato'));
  assert.equal(await page.locator('#remoteToken').textContent(),'');
  await page.locator('#ambient').click();
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('ambient')),true);
 });
});
test('Chromium real Cesium WebGL with offline tile fixture: globe and tour controls',{timeout:90000},async t=>{
 await runBrowser(t,true,async page=>{
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Globo 3D'),{},{timeout:30000});
  assert.equal(await page.locator('#globe canvas').count(),1);
  assert.equal(await page.locator('#terrain').isDisabled(),false);
  await page.locator('#auto').click();
  await page.locator('#pause').click();
  assert.equal(await page.locator('#pause').textContent(),'Riprendi');
  await page.locator('#pause').click();
  await page.locator('#auto').click();
  assert.equal(await page.locator('#pause').isDisabled(),true);
  assert.equal(await page.locator('#auto').textContent(),'Viaggio automatico');
 });
});
