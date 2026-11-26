// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {createReliefPrimitive,safeReliefHeight} from './global-relief-cesium.mjs';
import {configureMainRelief,stopMainRelief,reportMainRelief} from './numeric-relief-ui.mjs';
import {countries,languages,countryName} from './countries.mjs';
import {wrapIndex,chooseDestination,cameraHeight} from './travel.mjs';
import {createTour} from './cinematic.mjs';
import {createNarrator} from './speech.mjs';
import {bathymetryProvider,ESRI_URL,sampleElevation,elevationLabel} from './geography.mjs';
import {fetchBoundaries} from './boundaries.mjs';
import {nearbyPhotos} from './photos.mjs';
import {cinematicNarrationFor} from './narration.mjs';
import {regionName,M49_SOURCE} from './regions.mjs';
import {pilotEvidence} from './editorial-pilot.mjs';
import {statisticsFor,statisticsEvidence,TERMS} from './world-statistics.mjs';
import {snapshot} from './world-statistics-data.mjs';
import {loadMemory,makeQuestion,gradeQuestion,quizStats,quizExport} from './region-quiz.mjs';
const $=id=>document.getElementById(id), key='world-explorer-visits-v1';
let visits={},lang='it',index=0,viewer=null,terrainOn=false,terrainBusy=false,bathyLayer=null,probeEpoch=0;
try { const data=JSON.parse(localStorage.getItem(key)||'{}'); for(const c of countries){if(Number.isSafeInteger(data?.[c.code])&&data[c.code]>=0)visits[c.code]=data[c.code];} } catch {}
let reliefMode=null;
const flightHeight=c=>reliefMode?safeReliefHeight(cameraHeight(c.area),reliefMode.ex):cameraHeight(c.area);
const save=()=>{try{localStorage.setItem(key,JSON.stringify(visits));}catch{$('status').textContent='Memoria locale non disponibile';}};
const name=c=>countryName(c.code,lang);
function options(){
 $('place').replaceChildren(...countries.map((c,i)=>new Option(name(c),String(i))).sort((a,b)=>a.text.localeCompare(b.text,lang)));
 $('place').value=String(index);
}
for(const l of languages)$('lang').add(new Option(new Intl.DisplayNames([l],{type:'language'}).of(l),l));
$('lang').value=lang;options();
const narrator=createNarrator({synthesis:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,onStatus:s=>{
 $('speechStatus').textContent=({unavailable:'Sintesi vocale non disponibile', 'no-local-voice':'Voce locale assente per questa lingua; installala sul dispositivo',speaking:'Narrazione in corso',ended:'',stopped:'',error:'Narrazione interrotta o non disponibile'})[s]||'';
}});
function speak(done){return narrator.speak(cinematicNarrationFor(countries[index].code,lang),typeof done==='function'?done:undefined);}
const quizKey='world-explorer-region-quiz-v1';
let quizMemory=loadMemory(null),question=null,answered=false,quizCorrect=null,quizStorageFailed=false,quizExhausted=false;
try{quizMemory=loadMemory(localStorage.getItem(quizKey));}catch{quizStorageFailed=true;}
const quizLocale=()=>lang==='it'?'it':'en';
const quizText=(it,en)=>quizLocale()==='it'?it:en;
function updateQuizStats(){
 const s=quizStats(quizMemory);
 $('quizStats').lang=quizLocale();
 $('quizStats').textContent=quizText('Paesi esercitati: ','Countries practiced: ')+s.practiced+' / '+s.total+
  quizText(' · Disponibili: ',' · Due: ')+s.due+quizText(' · Consolidati (3 risposte consecutive): ',' · Mastered (3 consecutive correct): ')+s.mastered+
  quizText(' · Errori da ripassare: ',' · Mistakes due: ')+s.retryDue;
 if(!s.due&&s.nextDue!==null)$('quizStats').textContent+=quizText(' · Prossimo ripasso: ',' · Next review: ')+new Date(s.nextDue).toLocaleString(quizLocale());
}
function saveQuiz(){
 try{localStorage.setItem(quizKey,JSON.stringify(quizMemory));quizStorageFailed=false;}
 catch{quizStorageFailed=true;}
 updateQuizStorage();
}
function updateQuizStorage(){
 $('quizStorage').lang=quizLocale();
 $('quizStorage').textContent=quizStorageFailed?quizText('Memoria locale non disponibile: esporta i risultati prima di chiudere.','Local memory unavailable: export your results before closing.'):'';
}
function renderQuiz(){
 $('quizOptions').replaceChildren();updateQuizStats();updateQuizStorage();
 for(const id of ['quizQuestion','quizFeedback','quizOptions','quizNext','quizReset','quizExport'])$(id).lang=quizLocale();
 $('quizNext').textContent=quizText('Nuova domanda','New question');
 $('quizReset').textContent=quizText('Cancella quiz','Reset quiz');
 $('quizExport').textContent=quizText('Esporta quiz','Export quiz');
 $('quizFeedback').textContent='';
 if(!question){$('quizQuestion').textContent=quizExhausted?quizText('Nessun ripasso disponibile ora. Riprova più tardi.','No reviews due now. Try again later.'):quizText('Premi Nuova domanda per esercitarti.','Select New question to practise.');return;}
 $('quizQuestion').textContent=quizText('In quale regione statistica ONU si trova ','Which UN statistical region contains ')+name({code:question.code})+'?';
 for(const option of question.options){
  const b=document.createElement('button');b.type='button';b.lang=lang;b.textContent=regionName(option,lang);b.disabled=answered;
  b.onclick=()=>{if(answered)return;answered=true;quizCorrect=gradeQuestion(question,option,quizMemory);saveQuiz();
   renderQuiz();};
  $('quizOptions').append(b);
 }
 if(answered)$('quizFeedback').textContent=(quizCorrect?quizText('Corretto! ','Correct! '):quizText('Risposta da ripassare. ','Review this answer. '))+regionName(question.answer,lang)+quizText(' · Fonte ONU M49',' · UN M49 source');
}
$('quizNext').onclick=()=>{question=makeQuestion(quizMemory);answered=false;quizCorrect=null;quizExhausted=!question;renderQuiz();};
$('quizReset').onclick=()=>{if(!confirm(quizText('Eliminare la memoria locale dei quiz?','Delete local quiz memory?')))return;quizMemory=loadMemory(null);question=null;answered=false;quizCorrect=null;quizExhausted=false;saveQuiz();renderQuiz();};
$('quizExport').onclick=()=>{const url=URL.createObjectURL(new Blob([quizExport(quizMemory)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='world-explorer-quiz.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
renderQuiz();
function renderProfile(code){
 const box=$('profileFacts'),stats=$('profileStats');box.replaceChildren();stats.replaceChildren();
 const facts=pilotEvidence(code,lang);
 $('profileStatus').textContent=facts.length?'12 / 12 discipline con un fatto pilota ciascuna; revisione indipendente mancante.':'Profilo multidisciplinare non ancora disponibile per questa destinazione.';
 for(const item of facts){
  const p=document.createElement('p');p.lang=item.language;p.dir='auto';
  p.append(document.createTextNode(item.text+' '),creditLink(item.label,item.source));
  const meta=document.createElement('small');meta.textContent=' · '+(item.period?'Riferimento: '+item.period+' · ':'')+'Controllo fonte: '+item.checked+(item.language!==lang?' · testo in inglese':'');p.append(meta);box.append(p);
 }
 const observations=statisticsFor(snapshot,code,lang);
 $('statisticsStatus').textContent=observations.length?observations.length+' / 4 indicatori disponibili (2024); non sono dati in tempo reale.':'Nessun indicatore WDI verificato/importato per questa destinazione.';
 for(const item of observations){
  const p=document.createElement('p');p.lang=item.language;p.dir='auto';
  p.append(document.createTextNode(item.label+': '+item.value+' · '+item.year+' · '),creditLink(item.attribution,item.source),document.createTextNode(' · Acquisizione: '+item.retrieved+(item.language!==lang?' · testo in inglese':'')));stats.append(p);
 }
 if(observations.length){const p=document.createElement('p');p.append(creditLink('Condizioni dati WDI / CC BY 4.0',TERMS));stats.append(p);}
}
function render(fly=true,read=false){
 clearPhotos();clearGuide();
 probeEpoch++;$('elevation').textContent='';
 const c=countries[index];$('place').value=String(index);$('name').textContent=name(c);renderProfile(c.code);
 const n=cinematicNarrationFor(c.code,lang);$('narration').textContent=n?.text||'';$('narration').lang=n?.language||lang;
 const credits=$('narrationCredits');credits.replaceChildren();
 for(const fact of n?.facts||[]){
  const item=document.createElement('li');item.append(creditLink(fact.label,fact.source));
  if(fact.period)item.append(document.createTextNode(' · '+fact.period));
  credits.append(item);
 }
 $('narrationCoverage').textContent=n?.facts.length?'Approfondimenti con fonti · revisione indipendente in attesa.':n?.extended?'Nessun approfondimento narrativo verificato per questa destinazione.':'Narrazione regionale; approfondimenti disponibili in italiano e inglese.';
 if(n?.facts.some(x=>x.id.startsWith('wdi-'))){const item=document.createElement('li');item.append(creditLink('Condizioni dati WDI / CC BY 4.0',TERMS));credits.append(item);}
 $('facts').textContent='Capitale (dato iniziale): '+c.capital+' · Superficie indicativa: '+new Intl.NumberFormat(lang).format(c.area)+' km²';
 $('source').href='https://'+lang+'.wikipedia.org/w/index.php?search='+encodeURIComponent(name(c));
 $('progress').textContent='Destinazioni visitate: '+Object.keys(visits).filter(k=>visits[k]>0).length+' / '+countries.length;
 if(fly&&viewer){viewer.camera.cancelFlight();viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,flightHeight(c)),orientation:{heading:0,pitch:Cesium.Math.toRadians(-75),roll:0},duration:5});}
 if(read)speak();
}
function visit(i,read=false){index=wrapIndex(i,countries.length);const c=countries[index];visits[c.code]=(visits[c.code]||0)+1;save();render(true,read);}
const tour=createTour({
 choose:()=>chooseDestination(countries,visits,countries[index].code),
 visit:c=>{index=countries.indexOf(c);visits[c.code]=(visits[c.code]||0)+1;save();render(false);},
 fly:(c,complete,cancel)=>{if(!viewer){complete();return;}viewer.camera.cancelFlight();viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,flightHeight(c)),orientation:{heading:0,pitch:Cesium.Math.toRadians(-75),roll:0},duration:5,complete,cancel});},
 speak:(_,done)=>speak(done),stopSpeech:()=>narrator.stop(),cancel:()=>{viewer?.camera.cancelFlight();narrator.stop();},
 delay:()=>Number($('interval').value)*1000,
 onState:s=>{$('auto').textContent=s==='idle'?'Viaggio automatico':'Ferma viaggio';$('pause').disabled=s==='idle';$('pause').textContent=s==='paused'?'Riprendi':'Pausa';$('tourState').textContent=({idle:'',flying:'Sorvolo',dwelling:'Sosta',paused:'In pausa'})[s];}
});
$('auto').onclick=()=>tour.state==='idle'?tour.start():tour.stop();
$('pause').onclick=()=>tour.state==='paused'?tour.resume():tour.pause();
function manual(i){tour.stop();visit(i);}
$('place').onchange=e=>manual(Number(e.target.value));$('prev').onclick=()=>manual(index-1);$('next').onclick=()=>manual(index+1);
$('lang').onchange=e=>{tour.pause();narrator.stop();lang=e.target.value;options();render(false);renderQuiz();};
$('voice').onclick=()=>{tour.pause();speak();};$('stopVoice').onclick=()=>narrator.stop();
$('reset').onclick=()=>{if(confirm('Eliminare tutte le visite memorizzate su questo browser?')){visits={};save();render(false);}};
$('ambient').onclick=()=>{$('ambient').setAttribute('aria-pressed',String(document.body.classList.toggle('ambient')));};
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('status').textContent='Schermo intero non disponibile';}};
$('terrain').onclick=async()=>{if(!viewer||terrainBusy)return;terrainBusy=true;probeEpoch++;$('elevation').textContent='';$('terrain').disabled=true;
 try{if(terrainOn){viewer.terrainProvider=new Cesium.EllipsoidTerrainProvider();terrainOn=false;$('status').textContent='Globo 3D · ellissoide';}
 else{const provider=await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(ESRI_URL,{credit:'Esri World Elevation 3D'});
 provider.errorEvent.addEventListener(()=>{$('status').textContent='Rilievo Esri: errore nel caricamento delle tessere';});viewer.terrainProvider=provider;terrainOn=true;$('status').textContent='Provider Esri collegato · verifica tessere in corso';}
 }catch{$('status').textContent='Rilievo Esri non disponibile · ellissoide';viewer.terrainProvider=new Cesium.EllipsoidTerrainProvider();terrainOn=false;}finally{terrainBusy=false;$('terrain').disabled=false;$('terrain').textContent=terrainOn?'Disattiva rilievo Esri':'Attiva rilievo Esri';}};
$('bathy').onclick=()=>{
 if(!viewer)return;
 if(bathyLayer){viewer.imageryLayers.remove(bathyLayer);bathyLayer=null;$('bathy').textContent='Mostra fondali GEBCO';return;}
 try{const provider=bathymetryProvider(Cesium);provider.errorEvent.addEventListener(()=>{$('status').textContent='GEBCO: errore tessere; disattivare il livello se persiste';});bathyLayer=viewer.imageryLayers.addImageryProvider(provider);$('bathy').textContent='Nascondi fondali GEBCO';$('status').textContent='GEBCO 2025 · rilievo ombreggiato, non geometria 3D';}
 catch{$('status').textContent='Cartografia GEBCO non disponibile';}
};
$('probe').onclick=async()=>{
 if(!viewer||!terrainOn){$('elevation').textContent='Attivare prima il rilievo Esri';return;}
 const id=++probeEpoch,c=countries[index],provider=viewer.terrainProvider;
 $('elevation').textContent='Campionamento…';
 try{const height=await sampleElevation(Cesium,provider,c.lon,c.lat);if(id!==probeEpoch)return;$('elevation').textContent=height===null?'Quota non disponibile':'Quota del punto camera (Esri, livello 10): '+elevationLabel(height,lang)+' · non quota della capitale';}
 catch{if(id===probeEpoch)$('elevation').textContent='Campionamento non disponibile';}
};

// Optional imagery: request only on an explicit click; cancel on country change.
let photoRequest=null;
function clearPhotos(){
 photoRequest?.abort();photoRequest=null;$('photoResults').replaceChildren();$('photoStatus').textContent='';$('photos').disabled=false;
}
function creditLink(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
$('photos').onclick=async()=>{
 clearPhotos();const c=countries[index],request=new AbortController();photoRequest=request;$('photos').disabled=true;$('photoStatus').textContent='Ricerca su Wikimedia Commons…';
 const timer=setTimeout(()=>request.abort(),12000);
 try{
  const photos=await nearbyPhotos(c.lat,c.lon,fetch,request.signal);
  if(photoRequest!==request||request.signal.aborted)return;
  for(const p of photos){
   const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');
   img.alt=p.title;img.loading='lazy';img.referrerPolicy='no-referrer';img.src=p.image;
   img.onerror=()=>{img.remove();};
   caption.append(creditLink(p.title,p.source),document.createTextNode(' · '+[p.author,p.attribution,p.credit].filter((x,i,a)=>x&&a.indexOf(x)===i).join(' · ')+' · '),creditLink(p.license,p.licenseUrl),document.createTextNode(' · Miniatura ridimensionata da Commons, nessun ritaglio applicato.'));
   figure.append(img,caption);$('photoResults').append(figure);
  }
  $('photoStatus').textContent=photos.length?'Immagini geolocalizzate vicino al punto camera: contenuto e posizione da verificare.':'Nessuna immagine con metadati e licenza accettati.';
 }catch{if(photoRequest===request)$('photoStatus').textContent='Ricerca immagini non disponibile.';}
 finally{clearTimeout(timer);if(photoRequest===request){photoRequest=null;$('photos').disabled=false;}}
};
let guideRequest=null;
function clearGuide(){
 guideRequest?.abort();guideRequest=null;$('guideAnswer').replaceChildren();$('guideStatus').textContent='';$('guideAsk').disabled=false;$('guideQuestion').value='';
}
$('guideForm').onsubmit=async e=>{
 e.preventDefault();guideRequest?.abort();$('guideAnswer').replaceChildren();
 const question=$('guideQuestion').value.trim();if(!question)return;
 const request=new AbortController();guideRequest=request;$('guideAsk').disabled=true;$('guideStatus').textContent='Consultazione delle fonti…';
 const timer=setTimeout(()=>request.abort(),35000);
 try{
  const res=await fetch('./api/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:countries[index].code,language:lang,question}),signal:request.signal,redirect:'error'});
  if(!res.ok)throw new Error('Guide unavailable');
  const data=await res.json();if(guideRequest!==request||request.signal.aborted)return;
  const mode=({atlas:'Solo atlante',ollama:'Selezione Ollama',fallback:'Ollama non disponibile: solo atlante'})[data.mode]||'Guida';
  $('guideStatus').textContent=mode+' · '+(data.status==='evidence'?'Estratti pertinenti da verificare; non una risposta enciclopedica.':'Fonti disponibili insufficienti per rispondere.');
  for(const item of Array.isArray(data.evidence)?data.evidence:[]){
   if(!item||typeof item.text!=='string')continue;
   const pilot=pilotEvidence(countries[index].code,lang).find(x=>x.id===item.id&&x.source===item.source&&x.text===item.text);
   const wdi=statisticsEvidence(snapshot,countries[index].code,lang).find(x=>x.id===item.id&&x.source===item.source&&x.text===item.text);
   if(!pilot&&!wdi&&item.source!==M49_SOURCE)continue;
   const p=document.createElement('p');p.dir='auto';p.lang=languages.includes(item.language)?item.language:'en';
   p.append(document.createTextNode(item.text+' '),creditLink(pilot?pilot.label:wdi?wdi.label:'Fonte ONU M49',item.source));
   const evidenceMeta=pilot||wdi;
   if(evidenceMeta){const meta=document.createElement('small');meta.textContent=' · '+(evidenceMeta.period?'Riferimento: '+evidenceMeta.period+' · ':'')+'Controllo fonte: '+evidenceMeta.checked+' · revisione indipendente mancante'+(evidenceMeta.language!==lang?' · testo in inglese':'');p.append(meta);}
   $('guideAnswer').append(p);
  }
 }catch{if(guideRequest===request)$('guideStatus').textContent='Guida non disponibile. Avvia il server locale con npm start; consulta il README.';}
 finally{clearTimeout(timer);if(guideRequest===request){guideRequest=null;$('guideAsk').disabled=false;}}
};
let boundaryLayers=[],boundaryBusy=false;
$('boundaries').onclick=async()=>{
 if(!viewer||boundaryBusy)return;
 if(boundaryLayers.length){for(const layer of boundaryLayers)viewer.dataSources.remove(layer,true);boundaryLayers=[];$('boundaries').textContent='Mostra confini';return;}
 boundaryBusy=true;$('boundaries').disabled=true;const request=new AbortController(),timer=setTimeout(()=>request.abort(),20000);const added=[];
 try{
  const data=await fetchBoundaries(fetch,request.signal);
  const prepared=await Promise.all(data.map((geo,i)=>Cesium.GeoJsonDataSource.load(geo,{stroke:i?Cesium.Color.ORANGE:Cesium.Color.WHITE,strokeWidth:i?3:2,clampToGround:true})));
  for(const layer of prepared){await viewer.dataSources.add(layer);added.push(layer);}
  boundaryLayers=added;$('boundaries').textContent='Nascondi confini';$('status').textContent='Natural Earth 1:50M · bianco: linee terrestri; arancio: aree contese (linee) · rappresentazione de facto';
 }catch{for(const layer of added)viewer.dataSources.remove(layer,true);$('status').textContent='Confini Natural Earth non disponibili';}
 finally{clearTimeout(timer);boundaryBusy=false;$('boundaries').disabled=false;}
};

try{if(!window.Cesium)throw new Error('Cesium non disponibile');
 viewer=new Cesium.Viewer('globe',{baseLayer:false,baseLayerPicker:false,geocoder:false,animation:false,timeline:false,sceneModePicker:true,homeButton:true});
 const osm=new Cesium.UrlTemplateImageryProvider({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',maximumLevel:19,credit:'© OpenStreetMap contributors'});
 osm.errorEvent.addEventListener(()=>{$('status').textContent='Cartografia OSM: errore di rete o tessere';});
 viewer.imageryLayers.addImageryProvider(osm);$('status').textContent='Globo 3D · ellissoide · OSM';
 const scene=viewer.scene,controller=scene.screenSpaceCameraController;
 const credit=document.createElement('span');credit.id='mainReliefCredit';credit.hidden=true;credit.textContent='GEBCO 2025 · DOI 10.5285/37c52e96-24ea-67ce-e063-7086abc05f29 · griglia locale non autenticata, campioni 2°, non per navigazione';$('status').after(credit);
 configureMainRelief((grid,ex)=>{
  if(!grid){if(!reliefMode)return;const m=reliefMode;reliefMode=null;m.removeListener?.();scene.primitives.remove(m.primitive);scene.globe.show=m.globe;controller.minimumZoomDistance=m.zoom;for(const [layer,shown] of m.layers)layer.show=shown;for(const [button,disabled] of m.buttons)button.disabled=disabled;credit.hidden=true;scene.requestRender();return;}
  if(scene.mode!==Cesium.SceneMode.SCENE3D||terrainBusy||boundaryBusy)throw new Error('Requires stable 3D view');
  const primitive=createReliefPrimitive(Cesium,grid,ex),buttons=['terrain','bathy','probe','boundaries'].map(id=>[$(id),$(id).disabled]);
  const layers=boundaryLayers.map(layer=>[layer,layer.show]);
  tour.stop();viewer.camera.cancelFlight();
  const m={primitive,ex,globe:scene.globe.show,zoom:controller.minimumZoomDistance,layers,buttons,removeListener:null};
  scene.primitives.add(primitive);reliefMode=m;scene.globe.show=false;controller.minimumZoomDistance=safeReliefHeight(0,ex);for(const [layer] of layers)layer.show=false;for(const [button] of buttons)button.disabled=true;
  credit.hidden=false;credit.textContent='GEBCO 2025 · DOI 10.5285/37c52e96-24ea-67ce-e063-7086abc05f29 · campioni 2°, esagerazione '+ex+'× · griglia locale non autenticata, non per navigazione';
  const c=countries[index];viewer.camera.setView({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,Math.max(2500000,flightHeight(c))),orientation:{heading:0,pitch:-Math.PI/2,roll:0}});
  m.removeListener=scene.postRender.addEventListener(()=>{if(primitive.ready){m.removeListener?.();m.removeListener=null;reportMainRelief('Geometria numerica Cesium pronta · cartografia e confini sospesi.');}});scene.requestRender();
 });
 scene.morphStart.addEventListener(()=>stopMainRelief());
 scene.renderError.addEventListener(()=>{if(reliefMode){stopMainRelief();reportMainRelief('Errore grafico: ripristinato il globo cartografico.');}});
 }
catch{$('status').textContent='Globo non disponibile: modalità atlante testuale';$('terrain').disabled=true;$('bathy').disabled=true;$('probe').disabled=true;$('boundaries').disabled=true;}
visit(index);
