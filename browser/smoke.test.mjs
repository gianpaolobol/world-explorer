// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {makeServer} from '../server.mjs';
import {once} from 'node:events';
import {resolve,extname,sep} from 'node:path';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
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
 const page=await context.newPage();const errors=[],failedAssets=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',res=>{if(res.url().startsWith(origin+'/src/')&&res.status()>=400)failedAssets.push(res.status()+' '+res.url());});
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
 try{await page.waitForFunction(()=>document.querySelector('#place').options.length===195);}
 catch(error){throw new Error('Atlas startup failed; browser exceptions: '+JSON.stringify(errors)+'; failed local assets: '+JSON.stringify(failedAssets),{cause:error});}
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
  assert.match(await page.locator('#narration').textContent(),/Monviso/);
  assert.match(await page.locator('#narration').textContent(),/Banca Mondiale, anno 2024/);
  assert.equal(await page.locator('#narrationCredits a[href^="https://data.worldbank.org/indicator/"]').count(),5);
  await page.locator('#profile > summary').click();
  assert.equal(await page.locator('#profileFacts a').count(),12);
  assert.match(await page.locator('#profileStatus').textContent(),/revisione indipendente mancante/);
  await page.locator('#editorialCoverage summary').click();
  assert.match(await page.locator('#editorialCoverageStatus').textContent(),/348 \/ 2340/);
  assert.equal(await page.locator('#editorialCoverageList li').count(),12);
  await page.locator('#editorialFilter').selectOption('human');
  assert.equal(await page.locator('#editorialDestination option').count(),4);
  assert.match(await page.locator('#profileMissing').textContent(),/Tutte le discipline/);
  for(const [locale,label] of [['en','Go to destination'],['fr','Aller à la destination'],['de','Zum Ziel'],['es','Ir al destino'],['pt','Ir para o destino'],['ja','Go to destination']]){
   await page.locator('#lang').selectOption(locale);
   assert.equal(await page.locator('#editorialGo').textContent(),label);
   assert.equal(await page.locator('#editorialFilter').getAttribute('lang'),locale==='ja'?'en':locale);
   assert.equal(await page.locator('#editorialDestination').getAttribute('lang'),locale);
   assert.equal(await page.locator('#editorialFilter').inputValue(),'human');
   assert.equal(await page.locator('#editorialDestination option').count(),4);
  }
  await page.locator('#lang').selectOption('it');
  await page.locator('#editorialDestination').selectOption('DE');
  await page.locator('#editorialGo').click();
  assert.equal(await page.locator('#place').inputValue(),String(countries.findIndex(c=>c.code==='DE')));
  await page.locator('#editorialDestination').selectOption('IT');
  await page.locator('#editorialGo').click();
  assert.equal(await page.locator('#place').inputValue(),it);
  await page.locator('#editorialCoverage summary').click();
  assert.match(await page.locator('#statisticsStatus').textContent(),/14 \/ 14 indicatori/);
  assert.equal(await page.locator('#profileStats a[href^="https://data.worldbank.org/indicator/"]').count(),14);
  assert.match(await page.locator('#narration').textContent(),/Banca Mondiale, anno 2022/);
  assert.match(await page.locator('#profileStats').textContent(),/832 mm\/yr · 2022/);
  const fr=String(countries.findIndex(c=>c.code==='FR'));
  await page.locator('#place').selectOption(fr);
  assert.equal(await page.locator('#profileFacts a').count(),12);
  assert.match(await page.locator('#profileStatus').textContent(),/12 \/ 12 discipline/);
  assert.match(await page.locator('#narration').textContent(),/Pirenei/);
  assert.match(await page.locator('#profileStats').textContent(),/68\.551\.653/);
  assert.match(await page.locator('#narration').textContent(),/68\.551\.653/);
  assert.equal(await page.locator('#narrationCredits a[href^="https://www.adbpo.it/"]').count(),0);
  await page.locator('#lang').selectOption('fr');
  assert.equal(await page.locator('#narration').getAttribute('lang'),'fr');
  assert.match(await page.locator('#narration').textContent(),/Données de la Banque mondiale/);
  assert.equal(await page.locator('#narrationCredits a[href^="https://data.worldbank.org/indicator/"]').count(),5);
  assert.equal(await page.locator('#narrationCredits a[href^="https://whc.unesco.org/"]').count(),0);
  assert.match(await page.locator('#profileStats').textContent(),/Population totale/);
  await page.locator('#lang').selectOption('it');
  const va=String(countries.findIndex(c=>c.code==='VA'));
  await page.locator('#place').selectOption(va);
  assert.equal(await page.locator('#narrationCredits a').count(),0);
  assert.match(await page.locator('#narrationCoverage').textContent(),/Nessun approfondimento/);
  assert.match(await page.locator('#profileMissing').textContent(),/Geografia fisica.*Geografia storica/);
  await page.locator('#place').selectOption(it);
  await page.locator('#profile > summary').click();
  await page.locator('#lang').selectOption('en');
  assert.equal(await page.locator('#name').textContent(),'Italy');
  await page.locator('#next').click();
  assert.notEqual(await page.locator('#place').inputValue(),it);
  await page.locator('#prev').click();
  assert.equal(await page.locator('#place').inputValue(),it);
  await page.locator('#lang').selectOption('it');
  // Deterministic browser speech contract; not a test of physical audio.
  await page.evaluate(()=>{
   const engine=window.speechSynthesis;
   if(!engine)throw Error('speech API unavailable in Chromium');
   window.__spoken=[];
   const voice={lang:'it-IT',localService:true};
   // A real utterance requires a native SpeechSynthesisVoice; instead verify the
   // no-local-voice path using the existing captured browser engine.
   engine.getVoices=()=>[{...voice,localService:false}];
   engine.speak=u=>window.__spoken.push(u.text);
  });
  await page.locator('#voice').click();
  assert.match(await page.locator('#speechStatus').textContent(),/Voce locale assente/);
  assert.deepEqual(await page.evaluate(()=>window.__spoken),[]);
  await page.locator('#quiz summary').click();
  await page.locator('#quizNext').click();
  assert.equal(await page.locator('#quizOptions button').count(),4);
  await page.locator('#quizOptions button').first().click();
  assert.equal(await page.locator('#quizOptions button:disabled').count(),4);
  assert.match(await page.locator('#quizFeedback').textContent(),/Fonte ONU M49/);
  await page.locator('#lang').selectOption('en');
  assert.match(await page.locator('#quizFeedback').textContent(),/UN M49 source/);
  assert.match(await page.locator('#quizStats').textContent(),/Mastered/);
  assert.equal(await page.locator('#quizOptions button:disabled').count(),4);
  await page.locator('#lang').selectOption('it');
  assert.match(await page.locator('#quizFeedback').textContent(),/Fonte ONU M49/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('world-explorer-region-quiz-v1')));
  assert.equal(Object.keys(saved).length,1);
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('#quizStats').textContent.includes('1 / 195'));
  await page.locator('#quiz').evaluate(el=>el.open=true);
  await page.locator('#quizMode').selectOption('statistics');
  await page.locator('#quizNext').click();
  assert.equal(await page.locator('#quizOptions button').count(),4);
  assert.match(await page.locator('#quizQuestion').textContent(),/202[24]/);
  await page.locator('#quizOptions button').first().click();
  assert.match(await page.locator('#quizFeedback a').getAttribute('href'),/^https:\/\/data\.worldbank\.org\/indicator\//);
  assert.equal(await page.locator('#quizOptions button:disabled').count(),4);
  for(const [locale,label] of [['fr','Nouvelle question'],['de','Neue Frage'],['es','Nueva pregunta'],['pt','Nova pergunta'],['ja','New question']]){
   await page.locator('#lang').selectOption(locale);
   assert.equal(await page.locator('#quizNext').textContent(),label);
   assert.equal(await page.locator('#quizQuestion').getAttribute('lang'),locale==='ja'?'en':locale);
   assert.equal(await page.locator('#quizOptions button:disabled').count(),4);
   assert.match(await page.locator('#quizFeedback a').getAttribute('href'),/^https:\/\/data\.worldbank\.org\/indicator\//);
  }
  await page.locator('#lang').selectOption('it');
  await page.locator('#quizMode').selectOption('region');
  assert.match(await page.locator('#quizStats').textContent(),/1 \/ 195/);
  await page.locator('#quizMode').selectOption('statistics');
  assert.match(await page.locator('#quizStats').textContent(),/1 \/ 2\d{3}/);
  await page.reload();
  await page.locator('#quiz').evaluate(el=>el.open=true);
  await page.locator('#quizMode').selectOption('statistics');
  assert.match(await page.locator('#quizStats').textContent(),/1 \/ 2\d{3}/);
  // Reload intentionally resets the selected country; select Italy for the scoped corpus.
  await page.locator('#place').selectOption(it);
  await page.locator('#guide summary').click();
  await page.locator('#guideQuestion').fill('Regione statistica');
  await page.locator('#guideAsk').click();
  await page.locator('#guideAnswer a').waitFor();
  assert.equal(await page.locator('#guideAnswer a').first().getAttribute('href'),'https://unstats.un.org/unsd/methodology/m49/overview/');
  await page.locator('#guideQuestion').fill('qual è la popolazione?');
  await page.locator('#guideAsk').click();
  await page.waitForFunction(()=>document.querySelector('#guideAnswer').textContent.includes('58.943.464'));
  assert.match(await page.locator('#guideAnswer').textContent(),/2024-12-31/);
  assert.match(await page.locator('#guideAnswer a').first().getAttribute('href'),/^https:\/\/www\.istat\.it\//);
  await page.locator('#guideQuestion').fill('Qual è il monte più alto?');
  await page.locator('#guideAsk').click();
  await page.waitForFunction(()=>document.querySelector('#guideStatus').textContent.includes('insufficienti'));
  assert.equal(await page.locator('#guideAnswer a').count(),0);
  await page.locator('#place').selectOption(fr);
  await page.locator('#guideQuestion').fill('popolazione');
  await page.locator('#guideAsk').click();
  await page.waitForFunction(()=>document.querySelector('#guideAnswer').textContent.includes('68.551.653'));
  assert.equal(await page.locator('#guideAnswer a').first().getAttribute('href'),'https://data.worldbank.org/indicator/SP.POP.TOTL');
  await page.locator('#place').selectOption(it);
  const es=String(countries.findIndex(c=>c.code==='ES'));
  await page.locator('#place').selectOption(es);
  assert.equal(await page.locator('#profileFacts a').count(),12);
  assert.match(await page.locator('#narration').textContent(),/Teide/);
  assert.match(await page.locator('#narration').textContent(),/Guadalquivir/);
  assert.equal(await page.locator('#narrationCredits a[href^="https://whc.unesco.org/"]').count(),2);
  await page.locator('#place').selectOption(it);
  // Explicit opt-in, safe credit rendering and clearing across destinations.
  let commonsCalls=0;
  const fakeImage='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Synthetic.jpg/640px-Synthetic.jpg';
  await page.route('https://commons.wikimedia.org/w/api.php?*',route=>{
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET, OPTIONS','access-control-allow-headers':'Api-User-Agent'}});
   commonsCalls++;
   const metadata={Artist:{value:'<b>Synthetic &amp; creator</b>'},LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'}};
   return route.fulfill({json:{query:{pages:[{title:'File:Synthetic.jpg',imageinfo:[{mime:'image/jpeg',thumburl:fakeImage,descriptionurl:'https://commons.wikimedia.org/wiki/File:Synthetic.jpg',extmetadata:metadata}]}]}},headers:{'access-control-allow-origin':'*','access-control-allow-headers':'Api-User-Agent'}});
  });
  await page.route(fakeImage,route=>route.fulfill({body:png,contentType:'image/png'}));
  assert.equal(commonsCalls,0);
  await page.locator('#photos').evaluate(el=>{el.closest('details').open=true;});
  await page.locator('#photos').click();
  await page.locator('#photoResults figcaption').waitFor();
  assert.match(await page.locator('#photoResults figcaption').textContent(),/Synthetic & creator/);
  assert.equal(await page.locator('#photoResults figcaption b').count(),0);
  assert.equal(await page.locator('#photoResults a[href="https://creativecommons.org/licenses/by/4.0/"]').count(),1);
  assert.equal(await page.locator('#photoResults img').getAttribute('referrerpolicy'),'no-referrer');
  assert.equal(commonsCalls,1);
  await page.locator('#place').selectOption(fr);
  assert.equal(await page.locator('#photoResults figure').count(),0);
  assert.equal(commonsCalls,1);
  await page.locator('#place').selectOption(it);
  await page.locator('#numericRelief summary').click();
  await page.locator('#reliefFile').setInputFiles({name:'synthetic.asc',mimeType:'text/plain',buffer:Buffer.from('ncols 2\nnrows 2\nxllcorner 10\nyllcorner 40\ncellsize 0.004166666667\n-100 20\n30 40\n')});
  await page.locator('#reliefCanvas').waitFor({state:'visible'});
  assert.match(await page.locator('#reliefStatus').textContent(),/quota min -100 m, max 40 m/);
  await page.locator('#reliefScale').selectOption('5');
  assert.match(await page.locator('#reliefStatus').textContent(),/5×/);
  await page.locator('#reliefClear').click();
  assert.equal(await page.locator('#reliefCanvas').isVisible(),false);
  await page.locator('#globalRelief summary').click();
  const values=Array(16200).fill(0);values[100]=-5000;values[200]=4000;values[300]=null;
  await page.locator('#globalReliefFile').setInputFiles({name:'synthetic-global.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'gebco-2025-ice-surface-stride480-v1',rows:90,cols:180,values}))});
  await page.locator('#globalCanvas').waitFor({state:'visible'});
  const localSample=await page.locator('#localReliefSample').textContent();
  assert.match(localSample,/GEBCO globale 2°: 0 m · centro campione/);
  assert.match(await page.locator('#narration').textContent(),/file locale non autenticato.*0 metri/);
  assert.equal(await page.locator('#localReliefNarrationCredit a').count(),1);
  await page.locator('#lang').selectOption('en');
  assert.match(await page.locator('#narration').textContent(),/unverified local file.*0 metres/);
  await page.locator('#lang').selectOption('it');
  assert.match(await page.locator('#globalStatus').textContent(),/16199\/16200.*-5000 m, max 4000 m/);
  await page.locator('#globalScale').selectOption('50');
  assert.match(await page.locator('#globalStatus').textContent(),/50×/);
  assert.equal(await page.locator('#localReliefSample').textContent(),localSample);
  await page.locator('#globalLon').fill('180');
  await page.locator('#globalLon').dispatchEvent('change');
  assert.match(await page.locator('#globalStatus').textContent(),/vista 180°/);
  await page.locator('#globalClear').click();
  assert.equal(await page.locator('#globalCanvas').isVisible(),false);
  assert.equal(await page.locator('#localReliefSample').textContent(),'');
  assert.doesNotMatch(await page.locator('#narration').textContent(),/file locale non autenticato/);
  assert.equal(await page.locator('#localReliefNarrationCredit').count(),0);
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
  await page.locator('#globalRelief summary').click();
  const values=Array.from({length:16200},(_,i)=>i<8100?-4500:2300);
  await page.locator('#globalReliefFile').setInputFiles({name:'synthetic-main.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'gebco-2025-ice-surface-stride480-v1',rows:90,cols:180,values}))});
  await page.locator('#globalMainToggle').click();
  await page.waitForFunction(()=>document.querySelector('#globalMainStatus').textContent.includes('Cesium pronta'),{},{timeout:30000});
  assert.equal(await page.locator('#mainReliefCredit').isVisible(),true);
  assert.equal(await page.locator('#terrain').isDisabled(),true);
  await page.locator('#next').click();
  await page.locator('#globalClear').click();
  assert.equal(await page.locator('#mainReliefCredit').isVisible(),false);
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

 // Explicit live-data mode: regular offline checks do not require a download.
if(process.env.WORLD_EXPLORER_REAL_RELIEF==='1'){
 test('Chromium renders acquired global and native coastal GEBCO data',{timeout:240000},async t=>{
  const [global,regional,globalReport,regionalReport,dense,denseReport]=await Promise.all([
   readFile('global-relief.json'),readFile('regional-relief.asc'),
   readFile('relief-report.json','utf8').then(JSON.parse),readFile('regional-report.json','utf8').then(JSON.parse),
   readFile('global-relief-1deg.json'),readFile('relief-report-1deg.json','utf8').then(JSON.parse)
  ]);
  for(const [bytes,report] of [[global,globalReport],[regional,regionalReport],[dense,denseReport]])assert.equal(createHash('sha256').update(bytes).digest('hex'),report.sha256);
  assert.equal(globalReport.valid_samples,16200);
  assert.equal(denseReport.sample_degrees,1);assert.equal(denseReport.valid_samples,64800);
  assert.ok(denseReport.min_m < -4000 && denseReport.max_m > 4000);
  assert.ok(globalReport.min_m < -4000 && globalReport.max_m > 4000);
  assert.ok(regionalReport.valid_samples>=16057 && regionalReport.min_m<0 && regionalReport.max_m>0);
  await runBrowser(t,true,async page=>{
   await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Globo 3D'),{},{timeout:30000});
   await page.locator('#numericRelief summary').click();
   await page.locator('#reliefFile').setInputFiles({name:'regional-relief.asc',mimeType:'text/plain',buffer:regional});
   await page.locator('#reliefCanvas').waitFor({state:'visible'});
   assert.match(await page.locator('#reliefStatus').textContent(),/campioni validi/);
   const colors=await page.locator('#reliefCanvas').evaluate(c=>{
    const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    const unique=new Set();for(let i=0;i<p.length;i+=4)unique.add(p[i]+256*p[i+1]+65536*p[i+2]);return unique.size;
   });
   assert.ok(colors>10,'regional canvas has varied rendered pixels');
   await page.locator('#reliefCanvas').screenshot({path:'regional-render.png'});
   await page.locator('#globalRelief summary').click();
   await page.locator('#globalReliefFile').setInputFiles({name:'global-relief.json',mimeType:'application/json',buffer:global});
   await page.locator('#globalCanvas').waitFor({state:'visible'});
   assert.ok((await page.locator('#globalStatus').textContent()).includes('16200/16200'));
   assert.match(await page.locator('#localReliefSample').textContent(),/GEBCO globale 2°:.* m · centro campione/);
   await page.locator('#globalScale').selectOption('20');
   await page.locator('#globalMainToggle').click();
   await page.waitForFunction(()=>document.querySelector('#globalMainStatus').textContent.includes('Cesium pronta'),{},{timeout:30000});
   assert.equal(await page.locator('#mainReliefCredit').isVisible(),true);
   await page.locator('#globe canvas').screenshot({path:'global-render.png'});
   await page.locator('#next').click();
   await page.locator('#globalClear').click();
   await page.locator('#globalReliefFile').setInputFiles({name:'global-relief-1deg.json',mimeType:'application/json',buffer:dense});
   await page.locator('#globalCanvas').waitFor({state:'visible'});
   assert.match(await page.locator('#globalStatus').textContent(),/64800\/64800.*Risoluzione campionata 1°/);
   assert.match(await page.locator('#localReliefSample').textContent(),/GEBCO globale 1°:/);
   await page.locator('#globalMainToggle').click();
   await page.waitForFunction(()=>document.querySelector('#globalMainStatus').textContent.includes('Cesium pronta'),{},{timeout:60000});
   assert.match(await page.locator('#mainReliefCredit').textContent(),/campioni 1°/);
   await page.locator('#globe canvas').screenshot({path:'global-render-1deg.png'});
   await page.locator('#globalClear').click();
   assert.equal(await page.locator('#mainReliefCredit').isVisible(),false);
   assert.equal(await page.locator('#terrain').isDisabled(),false);
  });
 });
}
