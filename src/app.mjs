// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {createReliefPrimitive,safeReliefHeight} from './global-relief-cesium.mjs';
import {configureMainRelief,stopMainRelief,reportMainRelief,setReliefDestination,observeReliefSample,currentReliefNarration} from './numeric-relief-ui.mjs';
import {countries,languages,countryName} from './countries.mjs';
import {wrapIndex,chooseDestination,cameraHeight} from './travel.mjs';
import {createTour} from './cinematic.mjs';
import {createNarrator} from './speech.mjs';
import {bathymetryProvider,ESRI_URL,sampleElevation,elevationLabel} from './geography.mjs';
import {fetchBoundaries} from './boundaries.mjs';
import {nearbyPhotos} from './photos.mjs';
import {cinematicNarrationFor} from './narration.mjs';
import {regionName,M49_SOURCE} from './regions.mjs';
import {pilotEvidence,disciplines,editorialCoverage} from './editorial-pilot.mjs';
import {statisticsFor,statisticsEvidence,TERMS,INDICATORS} from './world-statistics.mjs';
import {snapshot} from './world-statistics-data.mjs';
import {loadMemory,makeQuestion,gradeQuestion,quizStats,quizExport,quizLanguage,quizMessage} from './region-quiz.mjs';
import {importMemory} from './learning.mjs';
import {createStatisticsQuiz} from './statistics-quiz.mjs';
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
function displayedNarration(){
 const base=cinematicNarrationFor(countries[index].code,lang),local=currentReliefNarration();
 return base&&local?{...base,text:base.text+' '+local.text}:base;
}
function refreshReliefNarration(){
 const n=displayedNarration();$('narration').textContent=n?.text||'';$('narration').lang=n?.language||lang;
 $('localReliefNarrationCredit')?.remove();
 const local=currentReliefNarration();if(local){const item=document.createElement('li');item.id='localReliefNarrationCredit';item.append(creditLink('GEBCO 2025 (local file / file locale)',local.source));$('narrationCredits').append(item);}
}
observeReliefSample(refreshReliefNarration);
function speak(done){return narrator.speak(displayedNarration(),typeof done==='function'?done:undefined);}
const quizKey='world-explorer-region-quiz-v1';
const statQuizKey='world-explorer-statistics-quiz-v1';
const statQuiz=createStatisticsQuiz(snapshot);
let statMemory=statQuiz.load(null);
const statMode=()=>$('quizMode').value==='statistics';
let quizImportEpoch=0,quizImportResult='';
let quizMemory=loadMemory(null),question=null,answered=false,quizCorrect=null,quizStorageFailed=false,quizExhausted=false;
try{quizMemory=loadMemory(localStorage.getItem(quizKey));statMemory=statQuiz.load(localStorage.getItem(statQuizKey));}catch{quizStorageFailed=true;}
const quizLocale=()=>quizLanguage(lang);
const quizText=key=>quizMessage(key,quizLocale());
const quizCountry=code=>countryName(code,quizLocale());
function updateQuizStats(){
 const s=statMode()?statQuiz.stats(statMemory):quizStats(quizMemory);
 $('quizStats').lang=quizLocale();
 $('quizStats').textContent=(statMode()?quizText('questions'):quizText('countries'))+s.practiced+' / '+s.total+
  quizText('due')+s.due+quizText('mastered')+s.mastered+
  quizText('mistakes')+s.retryDue;
 if(!s.due&&s.nextDue!==null)$('quizStats').textContent+=quizText('nextDue')+new Date(s.nextDue).toLocaleString(quizLocale());
}
function saveQuiz(){
 quizImportEpoch++;quizImportResult='';
 try{localStorage.setItem(statMode()?statQuizKey:quizKey,JSON.stringify(statMode()?statMemory:quizMemory));quizStorageFailed=false;}
 catch{quizStorageFailed=true;}
 updateQuizStorage();
}
function updateQuizStorage(){
 $('quizStorage').lang=quizLocale();
 $('quizStorage').textContent=quizStorageFailed?quizText('storage'):'';
}
function renderQuiz(){
 $('quizOptions').replaceChildren();updateQuizStats();updateQuizStorage();
 for(const id of ['quiz','quizQuestion','quizFeedback','quizOptions','quizNext','quizReset','quizExport','quizImportLabel','quizImport','quizImportStatus','quizMode','quizModeLabel','quizHeading','quizNotice'])$(id).lang=quizLocale();
 $('quizHeading').textContent=quizText('heading');$('quizNotice').textContent=quizText('notice');
 $('quizMode').options[0].textContent=quizText('region');
 $('quizMode').options[1].textContent=quizText('statistics');
 $('quizModeLabel').textContent=quizText('topic');
 $('quizNext').textContent=quizText('next');
 $('quizReset').textContent=quizText('reset');
 $('quizExport').textContent=quizText('export');
 $('quizImportLabel').textContent=quizText('import');$('quizImportStatus').textContent=quizImportResult?quizText(quizImportResult):'';
 $('quizFeedback').textContent='';
 if(!question){$('quizQuestion').textContent=quizExhausted?quizText('exhausted'):quizText('start');return;}
 if(statMode()){
  const d=statQuiz.describe(question,quizLocale());if(!d){$('quizQuestion').textContent=quizText('unavailable');return;}
  $('quizQuestion').textContent=(question.highest?quizText('highest'):quizText('lowest'))+d.label+' ('+d.year+')';
  for(const option of question.options){const b=document.createElement('button');b.type='button';b.lang=quizLocale();b.textContent=quizCountry(option);b.disabled=answered;b.onclick=()=>{if(answered)return;quizCorrect=statQuiz.grade(question,option,statMemory);answered=true;saveQuiz();renderQuiz();};$('quizOptions').append(b);}
  if(answered){$('quizFeedback').append(document.createTextNode((quizCorrect?quizText('correct'):quizText('wrong'))+quizCountry(question.answer)+' · '+d.entries.map(e=>quizCountry(e.code)+': '+e.value).join(' · ')+' · '+d.year+' · '),creditLink(d.attribution,d.source));}
  return;
 }
 $('quizQuestion').textContent=quizText('regionQuestion')+quizCountry(question.code)+(quizLocale()==='fr'?' ?':'?');
 for(const option of question.options){
  const b=document.createElement('button');b.type='button';b.lang=quizLocale();b.textContent=regionName(option,quizLocale());b.disabled=answered;
  b.onclick=()=>{if(answered)return;answered=true;quizCorrect=gradeQuestion(question,option,quizMemory);saveQuiz();
   renderQuiz();};
  $('quizOptions').append(b);
 }
 if(answered)$('quizFeedback').textContent=(quizCorrect?quizText('correct'):quizText('wrong'))+regionName(question.answer,quizLocale())+quizText('regionSource');
}
$('quizNext').onclick=()=>{question=statMode()?statQuiz.make(statMemory):makeQuestion(quizMemory);answered=false;quizCorrect=null;quizExhausted=!question;renderQuiz();};
$('quizMode').onchange=()=>{quizImportEpoch++;quizImportResult='';question=null;answered=false;quizCorrect=null;quizExhausted=false;renderQuiz();};
$('quizReset').onclick=()=>{if(!confirm(quizText('confirm')))return;if(statMode())statMemory=statQuiz.load(null);else quizMemory=loadMemory(null);question=null;answered=false;quizCorrect=null;quizExhausted=false;saveQuiz();renderQuiz();};
$('quizExport').onclick=()=>{const url=URL.createObjectURL(new Blob([statMode()?statQuiz.export(statMemory):quizExport(quizMemory)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=statMode()?'world-explorer-statistics-quiz.json':'world-explorer-quiz.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('quizImport').onchange=async()=>{
 const file=$('quizImport').files?.[0];$('quizImport').value='';
 const epoch=++quizImportEpoch,statistics=statMode();quizImportResult='';$('quizImportStatus').textContent='';
 if(!file)return;
 try{
  if(file.size>524288)throw new RangeError('Backup too large');
  const raw=await file.text();
  if(epoch!==quizImportEpoch)return;
  const restored=importMemory(raw,statistics?'statistics':'region',statistics?statQuiz.load:loadMemory);
  if(!confirm(quizText('importConfirm')))return;
  if(statistics)statMemory=restored;else quizMemory=restored;
  question=null;answered=false;quizCorrect=null;quizExhausted=false;saveQuiz();quizImportResult='importOk';
 }catch{if(epoch!==quizImportEpoch)return;quizImportResult='importError';}
 renderQuiz();
};
renderQuiz();
const coverage=editorialCoverage(countries.map(c=>c.code));
const coverageLocales={
 it:{names:['Geografia fisica','Orografia','Idrologia','Oceanografia','Geologia','Climatologia','Biogeografia','Geografia politica','Geografia umana','Geografia economica','Geografia urbana','Geografia storica'],missing:'Discipline senza contenuto editoriale: ',complete:'Tutte le discipline hanno almeno un contenuto pilota.',heading:'Copertura delle dodici discipline',slots:' coppie Stato-disciplina con almeno un fatto pilota; non equivalgono a revisioni indipendenti. ',countries:' Stati con tutte le discipline.',filter:'Disciplina da esplorare',destination:'Destinazioni con contenuti',go:'Vai alla destinazione'},
 en:{names:['Physical geography','Orography','Hydrology','Oceanography','Geology','Climatology','Biogeography','Political geography','Human geography','Economic geography','Urban geography','Historical geography'],missing:'Disciplines without editorial content: ',complete:'All disciplines have at least one pilot fact.',heading:'Coverage of the twelve disciplines',slots:' country-discipline slots with at least one pilot fact; not independent reviews. ',countries:' countries with all disciplines.',filter:'Discipline to explore',destination:'Destinations with content',go:'Go to destination'},
 fr:{names:['Géographie physique','Orographie','Hydrologie','Océanographie','Géologie','Climatologie','Biogéographie','Géographie politique','Géographie humaine','Géographie économique','Géographie urbaine','Géographie historique'],missing:'Disciplines sans contenu éditorial : ',complete:'Toutes les disciplines ont au moins un fait pilote.',heading:'Couverture des douze disciplines',slots:' couples pays-discipline avec au moins un fait pilote ; ce ne sont pas des révisions indépendantes. ',countries:' pays couvrant toutes les disciplines.',filter:'Discipline à explorer',destination:'Destinations avec contenu',go:'Aller à la destination'},
 de:{names:['Physische Geographie','Orographie','Hydrologie','Ozeanographie','Geologie','Klimatologie','Biogeographie','Politische Geographie','Humangeographie','Wirtschaftsgeographie','Stadtgeographie','Historische Geographie'],missing:'Disziplinen ohne redaktionelle Inhalte: ',complete:'Alle Disziplinen enthalten mindestens einen Pilotinhalt.',heading:'Abdeckung der zwölf Disziplinen',slots:' Land-Disziplin-Paare mit mindestens einem Pilotinhalt; keine unabhängigen Prüfungen. ',countries:' Länder mit allen Disziplinen.',filter:'Disziplin erkunden',destination:'Ziele mit Inhalten',go:'Zum Ziel'},
 es:{names:['Geografía física','Orografía','Hidrología','Oceanografía','Geología','Climatología','Biogeografía','Geografía política','Geografía humana','Geografía económica','Geografía urbana','Geografía histórica'],missing:'Disciplinas sin contenido editorial: ',complete:'Todas las disciplinas tienen al menos un dato piloto.',heading:'Cobertura de las doce disciplinas',slots:' pares país-disciplina con al menos un dato piloto; no equivalen a revisiones independientes. ',countries:' países con todas las disciplinas.',filter:'Disciplina para explorar',destination:'Destinos con contenido',go:'Ir al destino'},
 pt:{names:['Geografia física','Orografia','Hidrologia','Oceanografia','Geologia','Climatologia','Biogeografia','Geografia política','Geografia humana','Geografia económica','Geografia urbana','Geografia histórica'],missing:'Disciplinas sem conteúdo editorial: ',complete:'Todas as disciplinas têm pelo menos um dado piloto.',heading:'Cobertura das doze disciplinas',slots:' pares país-disciplina com pelo menos um dado piloto; não equivalem a revisões independentes. ',countries:' países com todas as disciplinas.',filter:'Disciplina a explorar',destination:'Destinos com conteúdo',go:'Ir para o destino'}
};
const coverageLocale=()=>quizLanguage(lang);
const disciplineName=d=>coverageLocales[coverageLocale()].names[disciplines.indexOf(d)];
function renderCoverageDestinations(){
 const d=$('editorialFilter').value,previous=$('editorialDestination').value;
 const choices=coverage.profiles.filter(p=>p.covered.includes(d)).map(p=>new Option(countryName(p.code,lang),p.code)).sort((a,b)=>a.text.localeCompare(b.text,lang));
 $('editorialDestination').lang=lang;
 $('editorialDestination').replaceChildren(...choices);
 if(choices.some(c=>c.value===previous))$('editorialDestination').value=previous;
 $('editorialGo').disabled=!choices.length;
}
function renderEditorialCoverage(code){
 const locale=coverageLocale(),messages=coverageLocales[locale],profile=coverage.profiles.find(p=>p.code===code);
 for(const id of ['profileMissing','editorialCoverageHeading','editorialCoverageStatus','editorialCoverageList','editorialFilterLabel','editorialFilter','editorialDestinationLabel','editorialGo'])$(id).lang=locale;
 $('profileMissing').textContent=profile?.missing.length?messages.missing+profile.missing.map(disciplineName).join(', '):messages.complete;
 $('editorialCoverageHeading').textContent=messages.heading;
 $('editorialCoverageStatus').textContent=coverage.filled+' / '+coverage.totalSlots+messages.slots+coverage.complete+' / '+coverage.totalCountries+messages.countries;
 $('editorialCoverageList').replaceChildren(...disciplines.map(d=>{const li=document.createElement('li');li.textContent=disciplineName(d)+': '+coverage.byDiscipline[d]+' / '+coverage.totalCountries;return li;}));
 const prev=$('editorialFilter').value;
 $('editorialFilter').replaceChildren(...disciplines.map(d=>new Option(disciplineName(d),d)));
 if(disciplines.includes(prev))$('editorialFilter').value=prev;
 $('editorialFilterLabel').textContent=messages.filter;
 $('editorialDestinationLabel').textContent=messages.destination;
 $('editorialGo').textContent=messages.go;
 renderCoverageDestinations();
}
$('editorialFilter').onchange=renderCoverageDestinations;
$('editorialGo').onclick=()=>{const i=countries.findIndex(c=>c.code===$('editorialDestination').value);if(i>=0){tour.stop();visit(i);}};
function renderProfile(code){
 const box=$('profileFacts'),stats=$('profileStats');box.replaceChildren();stats.replaceChildren();
 const facts=pilotEvidence(code,lang);renderEditorialCoverage(code);
 $('profileStatus').textContent=facts.length?new Set(facts.map(f=>f.discipline)).size+' / 12 discipline con almeno un fatto pilota; revisione indipendente mancante.':'Profilo multidisciplinare non ancora disponibile per questa destinazione.';
 for(const item of facts){
  const p=document.createElement('p');p.lang=item.language;p.dir='auto';
  p.append(document.createTextNode(item.text+' '),creditLink(item.label,item.source));
  const meta=document.createElement('small');meta.textContent=' · '+(item.period?'Riferimento: '+item.period+' · ':'')+'Controllo fonte: '+item.checked+(item.language!==lang?' · testo in inglese':'');p.append(meta);box.append(p);
 }
 const observations=statisticsFor(snapshot,code,lang);
 $('statisticsStatus').textContent=observations.length?observations.length+' / '+INDICATORS.length+' indicatori disponibili (anno indicato per ogni dato); non sono dati in tempo reale.':'Nessun indicatore WDI verificato/importato per questa destinazione.';
 for(const item of observations){
  const p=document.createElement('p');p.lang=item.language;p.dir='auto';
  p.append(document.createTextNode(item.label+': '+item.value+' · '+item.year+' · '),creditLink(item.attribution,item.source),document.createTextNode(' · Acquisizione: '+item.retrieved+(item.language!==lang?' · testo in inglese':'')));stats.append(p);
 }
 if(observations.length){const p=document.createElement('p');p.append(creditLink('Condizioni dati WDI / CC BY 4.0',TERMS));stats.append(p);}
}
function render(fly=true,read=false){
 clearPhotos();clearGuide();
 probeEpoch++;$('elevation').textContent='';
 const c=countries[index];$('place').value=String(index);$('name').textContent=name(c);renderProfile(c.code);setReliefDestination(c.lon,c.lat,lang);
 const n=cinematicNarrationFor(c.code,lang);$('narration').textContent=n?.text||'';$('narration').lang=n?.language||lang;
 const credits=$('narrationCredits');credits.replaceChildren();
 for(const fact of n?.facts||[]){
  const item=document.createElement('li');item.append(creditLink(fact.label,fact.source));
  if(fact.period)item.append(document.createTextNode(' · '+fact.period));
  credits.append(item);
 }
 $('narrationCoverage').textContent=n?.facts.length?'Approfondimenti con fonti · revisione indipendente in attesa.':n?.extended?'Nessun approfondimento narrativo verificato per questa destinazione.':'Narrazione regionale; statistiche narrate disponibili in italiano, inglese, francese, spagnolo, tedesco e portoghese; contenuti editoriali in italiano e inglese.';
 if(n?.facts.some(x=>x.id.startsWith('wdi-'))){const item=document.createElement('li');item.append(creditLink('Condizioni dati WDI / CC BY 4.0',TERMS));credits.append(item);}
 refreshReliefNarration();
 $('facts').textContent='Capitale (dato iniziale): '+c.capital+' · Superficie indicativa: '+new Intl.NumberFormat(lang).format(c.area)+' km²';
 $('source').href='https://'+lang+'.wikipedia.org/w/index.php?search='+encodeURIComponent(name(c));
 renderVisitProgress();
 if(fly&&viewer){viewer.camera.cancelFlight();viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,flightHeight(c)),orientation:{heading:0,pitch:Cesium.Math.toRadians(-75),roll:0},duration:5});}
 if(read)speak();
}
function renderVisitProgress(){$('progress').textContent='Destinazioni visitate: '+Object.keys(visits).filter(k=>visits[k]>0).length+' / '+countries.length;}
function visit(i,read=false){index=wrapIndex(i,countries.length);const c=countries[index];visits[c.code]=(visits[c.code]||0)+1;save();render(true,read);}
const tour=createTour({
 choose:()=>chooseDestination(countries,visits,countries[index].code),
 visit:c=>{index=countries.indexOf(c);render(false);},
 arrive:c=>{visits[c.code]=(visits[c.code]||0)+1;save();renderVisitProgress();},
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
 const credit=document.createElement('span');credit.id='mainReliefCredit';credit.hidden=true;credit.textContent='GEBCO 2025 · DOI 10.5285/37c52e96-24ea-67ce-e063-7086abc05f29 · griglia locale non autenticata, non per navigazione';$('status').after(credit);
 configureMainRelief((grid,ex)=>{
  if(!grid){if(!reliefMode)return;const m=reliefMode;reliefMode=null;m.removeListener?.();scene.primitives.remove(m.primitive);scene.globe.show=m.globe;controller.minimumZoomDistance=m.zoom;for(const [layer,shown] of m.layers)layer.show=shown;for(const [button,disabled] of m.buttons)button.disabled=disabled;credit.hidden=true;scene.requestRender();return;}
  if(scene.mode!==Cesium.SceneMode.SCENE3D||terrainBusy||boundaryBusy)throw new Error('Requires stable 3D view');
  const primitive=createReliefPrimitive(Cesium,grid,ex),buttons=['terrain','bathy','probe','boundaries'].map(id=>[$(id),$(id).disabled]);
  const layers=boundaryLayers.map(layer=>[layer,layer.show]);
  tour.stop();viewer.camera.cancelFlight();
  const m={primitive,ex,globe:scene.globe.show,zoom:controller.minimumZoomDistance,layers,buttons,removeListener:null};
  scene.primitives.add(primitive);reliefMode=m;scene.globe.show=false;controller.minimumZoomDistance=safeReliefHeight(0,ex);for(const [layer] of layers)layer.show=false;for(const [button] of buttons)button.disabled=true;
  credit.hidden=false;credit.textContent='GEBCO 2025 · DOI 10.5285/37c52e96-24ea-67ce-e063-7086abc05f29 · campioni '+grid.resolution+'°, esagerazione '+ex+'× · griglia locale non autenticata, non per navigazione';
  const c=countries[index];viewer.camera.setView({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,Math.max(2500000,flightHeight(c))),orientation:{heading:0,pitch:-Math.PI/2,roll:0}});
  m.removeListener=scene.postRender.addEventListener(()=>{if(primitive.ready){m.removeListener?.();m.removeListener=null;reportMainRelief('Geometria numerica Cesium pronta · cartografia e confini sospesi.');}});scene.requestRender();
 });
 scene.morphStart.addEventListener(()=>stopMainRelief());
 scene.renderError.addEventListener(()=>{if(reliefMode){stopMainRelief();reportMainRelief('Errore grafico: ripristinato il globo cartografico.');}});
 }
catch{$('status').textContent='Globo non disponibile: modalità atlante testuale';$('terrain').disabled=true;$('bathy').disabled=true;$('probe').disabled=true;$('boundaries').disabled=true;}
visit(index);
