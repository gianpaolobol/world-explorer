// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {countries,languages,countryName} from './countries.mjs';
import {wrapIndex,chooseDestination,cameraHeight} from './travel.mjs';
import {createTour} from './cinematic.mjs';
import {bathymetryProvider,ESRI_URL,sampleElevation,elevationLabel} from './geography.mjs';
import {fetchBoundaries} from './boundaries.mjs';
import {nearbyPhotos} from './photos.mjs';
import {narrationFor} from './narration.mjs';
import {regionName} from './regions.mjs';
import {loadMemory,makeQuestion,gradeQuestion,quizStats,quizExport} from './region-quiz.mjs';
const $=id=>document.getElementById(id), key='world-explorer-visits-v1';
let visits={},lang='it',index=0,viewer=null,terrainOn=false,terrainBusy=false,bathyLayer=null,probeEpoch=0;
try { const data=JSON.parse(localStorage.getItem(key)||'{}'); for(const c of countries){if(Number.isSafeInteger(data?.[c.code])&&data[c.code]>=0)visits[c.code]=data[c.code];} } catch {}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(visits));}catch{$('status').textContent='Memoria locale non disponibile';}};
const name=c=>countryName(c.code,lang);
function options(){
 $('place').replaceChildren(...countries.map((c,i)=>new Option(name(c),String(i))).sort((a,b)=>a.text.localeCompare(b.text,lang)));
 $('place').value=String(index);
}
for(const l of languages)$('lang').add(new Option(new Intl.DisplayNames([l],{type:'language'}).of(l),l));
$('lang').value=lang;options();
function speak(){
 const n=narrationFor(countries[index].code,lang);
 if(!n||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
 window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(n.text);u.lang=n.language;
 const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().split('-')[0]===n.language);
 if(v)u.voice=v;window.speechSynthesis.speak(u);
}
const quizKey='world-explorer-region-quiz-v1';
let quizMemory=loadMemory(null),question=null,answered=false;
try{quizMemory=loadMemory(localStorage.getItem(quizKey));}catch{}
function updateQuizStats(){
 const s=quizStats(quizMemory);
 $('quizStats').textContent='Paesi esercitati: '+s.practiced+' / '+s.total+' · Disponibili: '+s.due;
}
function saveQuiz(){
 try{localStorage.setItem(quizKey,JSON.stringify(quizMemory));}
 catch{$('quizStorage').textContent='Memoria non salvata: esporta i risultati prima di chiudere.';}
}
function renderQuiz(){
 $('quizOptions').replaceChildren();updateQuizStats();
 if(!question){$('quizQuestion').textContent='Premi Nuova domanda per esercitarti.';return;}
 $('quizQuestion').textContent='In quale regione statistica ONU si trova '+name({code:question.code})+'?';
 for(const option of question.options){
  const b=document.createElement('button');b.type='button';b.textContent=regionName(option,lang);b.disabled=answered;
  b.onclick=()=>{if(answered)return;answered=true;const ok=gradeQuestion(question,option,quizMemory);saveQuiz();
   $('quizFeedback').textContent=(ok?'Corretto! ':'Risposta da ripassare. ')+regionName(question.answer,lang)+' · Fonte ONU M49';
   for(const el of $('quizOptions').children)el.disabled=true;updateQuizStats();};
  $('quizOptions').append(b);
 }
 if(answered)$('quizFeedback').textContent='Risposta corretta: '+regionName(question.answer,lang)+' · Fonte ONU M49';
}
$('quizNext').onclick=()=>{question=makeQuestion(quizMemory);answered=false;$('quizFeedback').textContent='';renderQuiz();if(!question)$('quizQuestion').textContent='Nessun ripasso disponibile ora. Riprova più tardi.';};
$('quizReset').onclick=()=>{if(!confirm('Eliminare la memoria locale dei quiz?'))return;quizMemory=loadMemory(null);question=null;answered=false;$('quizFeedback').textContent='';saveQuiz();renderQuiz();};
$('quizExport').onclick=()=>{const url=URL.createObjectURL(new Blob([quizExport(quizMemory)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='world-explorer-quiz.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
renderQuiz();
function render(fly=true,read=false){
 clearPhotos();
 probeEpoch++;$('elevation').textContent='';
 const c=countries[index];$('place').value=String(index);$('name').textContent=name(c);
 const n=narrationFor(c.code,lang);$('narration').textContent=n?.text||'';$('narration').lang=n?.language||lang;
 $('facts').textContent='Capitale (dato iniziale): '+c.capital+' · Superficie indicativa: '+new Intl.NumberFormat(lang).format(c.area)+' km²';
 $('source').href='https://'+lang+'.wikipedia.org/w/index.php?search='+encodeURIComponent(name(c));
 $('progress').textContent='Destinazioni visitate: '+Object.keys(visits).filter(k=>visits[k]>0).length+' / '+countries.length;
 if(fly&&viewer){viewer.camera.cancelFlight();viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,cameraHeight(c.area)),orientation:{heading:0,pitch:Cesium.Math.toRadians(-75),roll:0},duration:5});}
 if(read)speak();
}
function visit(i,read=false){index=wrapIndex(i,countries.length);const c=countries[index];visits[c.code]=(visits[c.code]||0)+1;save();render(true,read);}
const tour=createTour({
 choose:()=>chooseDestination(countries,visits,countries[index].code),
 visit:c=>{index=countries.indexOf(c);visits[c.code]=(visits[c.code]||0)+1;save();render(false);},
 fly:(c,complete,cancel)=>{if(!viewer){complete();return;}viewer.camera.cancelFlight();viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,cameraHeight(c.area)),orientation:{heading:0,pitch:Cesium.Math.toRadians(-75),roll:0},duration:5,complete,cancel});},
 speak:()=>speak(),cancel:()=>{viewer?.camera.cancelFlight();window.speechSynthesis?.cancel();},
 delay:()=>Number($('interval').value)*1000,
 onState:s=>{$('auto').textContent=s==='idle'?'Viaggio automatico':'Ferma viaggio';$('pause').disabled=s==='idle';$('pause').textContent=s==='paused'?'Riprendi':'Pausa';$('tourState').textContent=({idle:'',flying:'Sorvolo',dwelling:'Sosta',paused:'In pausa'})[s];}
});
$('auto').onclick=()=>tour.state==='idle'?tour.start():tour.stop();
$('pause').onclick=()=>tour.state==='paused'?tour.resume():tour.pause();
function manual(i){tour.stop();visit(i);}
$('place').onchange=e=>manual(Number(e.target.value));$('prev').onclick=()=>manual(index-1);$('next').onclick=()=>manual(index+1);
$('lang').onchange=e=>{lang=e.target.value;options();render(false);renderQuiz();};
$('voice').onclick=speak;$('stopVoice').onclick=()=>window.speechSynthesis?.cancel();
$('reset').onclick=()=>{if(confirm('Eliminare tutte le visite memorizzate su questo browser?')){visits={};save();render(false);}};
$('ambient').onclick=()=>document.body.classList.toggle('ambient');
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
 viewer.imageryLayers.addImageryProvider(osm);$('status').textContent='Globo 3D · ellissoide · OSM';}
catch{$('status').textContent='Globo non disponibile: modalità atlante testuale';$('terrain').disabled=true;$('bathy').disabled=true;$('probe').disabled=true;$('boundaries').disabled=true;}
visit(index);
