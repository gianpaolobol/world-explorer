// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {parseRegionalGrid,gridMesh,projectMesh,MAX_GRID_BYTES,GEBCO_CREDIT,GLOBAL_MAX_BYTES,parseGlobalGrid,globalMesh,projectGlobalMesh,regionalSample,globalSample,reliefNarration} from './numeric-relief.mjs';
const $=id=>document.getElementById(id);
const input=$('reliefFile'),canvas=$('reliefCanvas'),scale=$('reliefScale'),status=$('reliefStatus'),clear=$('reliefClear');
let current=null,epoch=0,destination=null,onSampleChange=()=>{};
export function observeReliefSample(handler){onSampleChange=handler;}
export function currentReliefNarration(){return destination?reliefNarration(current,globalGrid,destination.lon,destination.lat,destination.locale):null;}
const destinationStatus=$('localReliefSample');
export function setReliefDestination(lon,lat,locale='it'){destination={lon,lat,locale};renderDestinationSample();syncGlobalDestination();}
function renderDestinationSample(){
 if(!destination)return;
 const {lon,lat,locale}=destination,fmt=(n,d=4)=>new Intl.NumberFormat(locale,{maximumFractionDigits:d}).format(n);
 const lines=[];
 for(const [grid,sample,label] of [[current,regionalSample,'GEBCO regionale 15″'],[globalGrid,globalSample,'GEBCO globale '+(globalGrid?.resolution??2)+'°']]){
  if(!grid)continue;const s=sample(grid,lon,lat);
  lines.push(s?label+': '+fmt(s.height,0)+' m · centro campione '+fmt(s.lat)+'°, '+fmt(s.lon)+'°':label+': nessun campione valido per il punto camera');
 }
 destinationStatus.textContent=lines.length?lines.join(' | ')+' · valori non esagerati, file locali non autenticati; non quota della capitale né dato per navigazione.':'';
 onSampleChange();
}
const ctx=canvas.getContext('2d');
function reset(){current=null;canvas.hidden=true;scale.disabled=true;clear.disabled=true;ctx?.clearRect(0,0,canvas.width,canvas.height);}
function paint(){
 if(!current||!ctx)return;
 const ex=Number(scale.value),triangles=projectMesh(gridMesh(current,ex));
 if(!triangles.length){canvas.hidden=true;status.textContent='Nessuna cella completa per la superficie; i vuoti non vengono interpolati.';return;}
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const t of triangles)for(const p of t.points){left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y);}
 const w=canvas.width,h=canvas.height,f=Math.min((w-28)/Math.max(1,right-left),(h-28)/Math.max(1,bottom-top));
 const x=p=>w/2+(p.x-(left+right)/2)*f,y=p=>h/2+(p.y-(top+bottom)/2)*f;
 ctx.fillStyle='#071b2a';ctx.fillRect(0,0,w,h);
 for(const t of triangles){
  const z=t.height;
  ctx.fillStyle=z<0?'hsl(207 70% '+(27+Math.max(0,1+z/12000)*25)+'%)':'hsl('+(100-Math.min(z,8000)/100)+' 38% '+(38+Math.min(z,8000)/400)+'%)';
  ctx.beginPath();t.points.forEach((p,i)=>i?ctx.lineTo(x(p),y(p)):ctx.moveTo(x(p),y(p)));ctx.closePath();ctx.fill();
 }
 canvas.hidden=false;
 const g=current,fmt=n=>n.toLocaleString('it-IT',{maximumFractionDigits:4});
 status.textContent='Area '+fmt(g.west)+'° / '+fmt(g.south)+'° – '+fmt(g.east)+'° / '+fmt(g.north)+'°; '+g.count+'/'+g.values.length+' campioni validi; quota min '+fmt(g.min)+' m, max '+fmt(g.max)+' m (dati non esagerati). Esagerazione verticale '+ex+'×. File dichiarato GEBCO 2025 dall’utente, provenienza non autenticata. '+GEBCO_CREDIT+'.';
}
input.onchange=async()=>{
 const id=++epoch,file=input.files?.[0];reset();renderDestinationSample();status.textContent='';if(!file)return;
 if(file.size>MAX_GRID_BYTES){status.textContent='File troppo grande (limite 1 MiB).';input.value='';return;}
 if(!ctx){status.textContent='Canvas 2D non disponibile.';return;}
 try{const g=parseRegionalGrid(await file.text());if(id!==epoch)return;current=g;scale.disabled=false;clear.disabled=false;paint();renderDestinationSample();}
 catch(e){if(id===epoch){status.textContent='Griglia non valida: '+e.message;input.value='';}}
};
scale.onchange=paint;
clear.onclick=()=>{epoch++;reset();renderDestinationSample();input.value='';status.textContent='Griglia rimossa dalla memoria.';};
reset();

 // Independent coarse global relief preview, local file only.
const globalPanel=document.createElement('details');
globalPanel.id='globalRelief';
function element(tag,text,parent=globalPanel){const e=document.createElement(tag);if(text)e.textContent=text;parent.append(e);return e;}
element('summary','Globo numerico GEBCO (anteprima 1° / 2°)');
element('p','Importa il JSON prodotto da scripts/acquire-ceda-relief.py (acquisizione selettiva) o scripts/prepare-global-relief.py (NetCDF locale). Puoi visualizzare quote e fondali campionati ogni 1° o 2° anche sul globo principale. Per una zona a 15 secondi d’arco, usa scripts/acquire-ceda-region.py e importa il file ASCII nel pannello regionale. File locali non autenticati; non per navigazione.');
const globalInput=element('input');globalInput.type='file';globalInput.accept='.json';globalInput.id='globalReliefFile';globalInput.setAttribute('aria-label','Griglia globale GEBCO JSON');
const preparedButton=element('button','Carica griglia predisposta sul computer');
preparedButton.id='globalPreparedLoad';preparedButton.type='button';
element('p','Facoltativo: carica la griglia locale predisposta dall’operatore all’avvio del server. Nessun download da Internet; rimane disponibile anche l’importazione manuale.');
const controls=element('div');
function control(label,id,min,max,value,step){
 const l=element('label',label,controls),i=element('input','',l);i.id=id;i.type='range';i.min=min;i.max=max;i.value=value;i.step=step;i.disabled=true;return i;
}
const lon=control('Longitudine vista','globalLon',-180,180,0,'any'),lat=control('Latitudine vista','globalLat',-90,90,0,'any');
const followLabel=element('label','Segui la destinazione del viaggio ',controls),follow=element('input','',followLabel);
follow.type='checkbox';follow.id='globalFollow';follow.disabled=true;
function syncGlobalDestination(redraw=true){
 if(!globalGrid||!follow.checked||!destination)return false;
 const changed=Number(lon.value)!==destination.lon||Number(lat.value)!==destination.lat;
 lon.value=String(destination.lon);lat.value=String(destination.lat);
 if(changed&&redraw)drawGlobal();
 return changed;
}
follow.onchange=()=>syncGlobalDestination();
const exLabel=element('label','Esagerazione verticale',controls),ex=element('select','',exLabel);ex.id='globalScale';for(const v of [1,20,50])ex.add(new Option(v+'×',String(v)));ex.disabled=true;
const mainToggle=element('button','Mostra sul globo principale');mainToggle.id='globalMainToggle';mainToggle.disabled=true;
const mainStatus=element('p');mainStatus.id='globalMainStatus';mainStatus.setAttribute('role','status');
let mainHandler=null,mainActive=false;
export function configureMainRelief(handler){mainHandler=handler;mainToggle.disabled=!globalGrid||!handler;}
export function stopMainRelief(){if(mainActive){mainHandler?.(null);mainActive=false;mainToggle.textContent='Mostra sul globo principale';mainStatus.textContent='Globo cartografico ripristinato.';}}
mainToggle.onclick=()=>{if(mainActive){stopMainRelief();return;}if(!globalGrid||!mainHandler)return;try{mainHandler(globalGrid,Number(ex.value));mainActive=true;mainToggle.textContent='Ripristina globo cartografico';mainStatus.textContent='Geometria numerica attivata; verifica rendering in corso.';}catch{mainStatus.textContent='Globo numerico non disponibile in questa vista.';}};
export function reportMainRelief(text){mainStatus.textContent=text;}
const globalClear=element('button','Rimuovi griglia globale');globalClear.id='globalClear';globalClear.disabled=true;
const globalCanvas=element('canvas');globalCanvas.id='globalCanvas';globalCanvas.width=440;globalCanvas.height=440;globalCanvas.style.width='100%';globalCanvas.style.height='auto';globalCanvas.hidden=true;globalCanvas.setAttribute('aria-label','Globo numerico con rilievi e fondali');
const globalStatus=element('p');globalStatus.id='globalStatus';globalStatus.setAttribute('role','status');
const source=element('a',GEBCO_CREDIT);source.href='https://doi.org/10.5285/37c52e96-24ea-67ce-e063-7086abc05f29';source.target='_blank';source.rel='noopener noreferrer';
$('numericRelief').after(globalPanel);
const gc=globalCanvas.getContext('2d');
let globalGrid=null,globalEpoch=0,mesh=null;
function clearGlobal(){
 stopMainRelief();mainToggle.disabled=true;globalGrid=null;mesh=null;renderDestinationSample();globalCanvas.hidden=true;follow.checked=false;for(const c of [lon,lat,ex,globalClear,follow])c.disabled=true;
 gc?.clearRect(0,0,globalCanvas.width,globalCanvas.height);
}
function drawGlobal(rebuild=false){
 if(!globalGrid||!gc)return;
 if(rebuild||!mesh)mesh=globalMesh(globalGrid,Number(ex.value));
 const triangles=projectGlobalMesh(mesh,Number(lon.value),Number(lat.value)),w=globalCanvas.width,h=globalCanvas.height,f=Math.min(w,h)*.44;
 gc.fillStyle='#071b2a';gc.fillRect(0,0,w,h);
 for(const t of triangles){
  const z=t.height;
  gc.fillStyle=z<0?'hsl(210 70% '+(25+Math.max(0,1+z/12000)*28)+'%)':'hsl('+(105-Math.min(z,8000)/100)+' 40% '+(34+Math.min(z,8000)/400)+'%)';
  gc.beginPath();t.points.forEach((p,i)=>i?gc.lineTo(w/2+p.x*f,h/2-p.y*f):gc.moveTo(w/2+p.x*f,h/2-p.y*f));gc.closePath();gc.fill();
 }
 globalCanvas.hidden=false;
 globalStatus.textContent=globalGrid.count+'/'+globalGrid.values.length+' campioni validi; quota min '+globalGrid.min+' m, max '+globalGrid.max+' m; vista '+lon.value+'° / '+lat.value+'°; esagerazione '+ex.value+'×. Risoluzione campionata '+globalGrid.resolution+'°, non nativa; dati locali dichiarati GEBCO 2025. I vuoti e i poli non sono interpolati.';
}
async function loadGlobalText(getText){
 const epoch=++globalEpoch;clearGlobal();globalStatus.textContent='Caricamento griglia globale…';
 // Permit cancelling a pending load as well as removing an active grid.
 globalClear.disabled=false;
 try{
  if(!gc)throw new Error('Canvas 2D non disponibile');
  const text=await getText();if(epoch!==globalEpoch)return;
  const grid=parseGlobalGrid(text);
  globalGrid=grid;mainToggle.disabled=!mainHandler;for(const c of [lon,lat,ex,globalClear,follow])c.disabled=false;drawGlobal(true);renderDestinationSample();
 }catch(e){if(epoch===globalEpoch){clearGlobal();globalInput.value='';globalStatus.textContent='Griglia globale non disponibile: '+e.message;}}
}
globalInput.onchange=()=>{
 const file=globalInput.files?.[0];
 if(!file){globalEpoch++;clearGlobal();globalStatus.textContent='';return;}
 return loadGlobalText(()=>{
  if(file.size>GLOBAL_MAX_BYTES)throw new Error('File troppo grande');
  return file.text();
 });
};
preparedButton.onclick=()=>{
 globalInput.value='';
 return loadGlobalText(async()=>{
  const response=await fetch('/api/relief/prepared',{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('Griglia predisposta assente o non abilitata; usa l’importazione manuale.');
  // The loopback server returns only a bounded, canonical grid.
  const length=Number(response.headers.get('content-length'));
  if(length>GLOBAL_MAX_BYTES)throw new Error('File troppo grande');
  const text=await response.text();
  if(new TextEncoder().encode(text).length>GLOBAL_MAX_BYTES)throw new Error('File troppo grande');
  return text;
 });
};
lon.onchange=lat.onchange=()=>{follow.checked=false;drawGlobal();};ex.onchange=()=>{stopMainRelief();drawGlobal(true);};
globalClear.onclick=()=>{globalEpoch++;clearGlobal();globalInput.value='';globalStatus.textContent='Griglia globale rimossa dalla memoria.';};
