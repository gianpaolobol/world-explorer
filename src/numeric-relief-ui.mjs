// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {parseRegionalGrid,gridMesh,projectMesh,MAX_GRID_BYTES,GEBCO_CREDIT,GLOBAL_MAX_BYTES,parseGlobalGrid,globalMesh,projectGlobalMesh} from './numeric-relief.mjs';
const $=id=>document.getElementById(id);
const input=$('reliefFile'),canvas=$('reliefCanvas'),scale=$('reliefScale'),status=$('reliefStatus'),clear=$('reliefClear');
let current=null,epoch=0;
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
 const id=++epoch,file=input.files?.[0];reset();status.textContent='';if(!file)return;
 if(file.size>MAX_GRID_BYTES){status.textContent='File troppo grande (limite 1 MiB).';input.value='';return;}
 if(!ctx){status.textContent='Canvas 2D non disponibile.';return;}
 try{const g=parseRegionalGrid(await file.text());if(id!==epoch)return;current=g;scale.disabled=false;clear.disabled=false;paint();}
 catch(e){if(id===epoch){status.textContent='Griglia non valida: '+e.message;input.value='';}}
};
scale.onchange=paint;
clear.onclick=()=>{epoch++;reset();input.value='';status.textContent='Griglia rimossa dalla memoria.';};
reset();

 // Independent coarse global relief preview, local file only.
const globalPanel=document.createElement('details');
globalPanel.id='globalRelief';
function element(tag,text,parent=globalPanel){const e=document.createElement(tag);if(text)e.textContent=text;parent.append(e);return e;}
element('summary','Globo numerico GEBCO (anteprima 2°)');
element('p','Importa il JSON prodotto da scripts/prepare-global-relief.py a partire dal NetCDF GEBCO 2025 ice surface. Il globo separato mostra quote e fondali numerici campionati ogni 2°, non il rilievo ad alta risoluzione del globo principale. File locale non autenticato; non per navigazione.');
const globalInput=element('input');globalInput.type='file';globalInput.accept='.json';globalInput.id='globalReliefFile';globalInput.setAttribute('aria-label','Griglia globale GEBCO JSON');
const controls=element('div');
function control(label,id,min,max,value,step){
 const l=element('label',label,controls),i=element('input','',l);i.id=id;i.type='range';i.min=min;i.max=max;i.value=value;i.step=step;i.disabled=true;return i;
}
const lon=control('Longitudine vista','globalLon',-180,180,0,5),lat=control('Latitudine vista','globalLat',-90,90,0,5);
const exLabel=element('label','Esagerazione verticale',controls),ex=element('select','',exLabel);ex.id='globalScale';for(const v of [1,20,50])ex.add(new Option(v+'×',String(v)));ex.disabled=true;
const globalClear=element('button','Rimuovi griglia globale');globalClear.id='globalClear';globalClear.disabled=true;
const globalCanvas=element('canvas');globalCanvas.id='globalCanvas';globalCanvas.width=440;globalCanvas.height=440;globalCanvas.style.width='100%';globalCanvas.style.height='auto';globalCanvas.hidden=true;globalCanvas.setAttribute('aria-label','Globo numerico con rilievi e fondali');
const globalStatus=element('p');globalStatus.id='globalStatus';globalStatus.setAttribute('role','status');
const source=element('a',GEBCO_CREDIT);source.href='https://doi.org/10.5285/37c52e96-24ea-67ce-e063-7086abc05f29';source.target='_blank';source.rel='noopener noreferrer';
$('numericRelief').after(globalPanel);
const gc=globalCanvas.getContext('2d');
let globalGrid=null,globalEpoch=0,mesh=null;
function clearGlobal(){
 globalGrid=null;mesh=null;globalCanvas.hidden=true;for(const c of [lon,lat,ex,globalClear])c.disabled=true;
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
 globalStatus.textContent=globalGrid.count+'/'+globalGrid.values.length+' campioni validi; quota min '+globalGrid.min+' m, max '+globalGrid.max+' m; vista '+lon.value+'° / '+lat.value+'°; esagerazione '+ex.value+'×. Risoluzione campionata 2°, non nativa; dati locali dichiarati GEBCO 2025. I vuoti e i poli non sono interpolati.';
}
globalInput.onchange=async()=>{
 const epoch=++globalEpoch,file=globalInput.files?.[0];clearGlobal();globalStatus.textContent='';
 if(!file)return;
 try{
  if(!gc)throw new Error('Canvas 2D non disponibile');
  if(file.size>GLOBAL_MAX_BYTES)throw new Error('File troppo grande');
  const grid=parseGlobalGrid(await file.text());if(epoch!==globalEpoch)return;
  globalGrid=grid;for(const c of [lon,lat,ex,globalClear])c.disabled=false;drawGlobal(true);
 }catch(e){if(epoch===globalEpoch){clearGlobal();globalInput.value='';globalStatus.textContent='Griglia globale non valida: '+e.message;}}
};
lon.onchange=lat.onchange=()=>drawGlobal();ex.onchange=()=>drawGlobal(true);
globalClear.onclick=()=>{globalEpoch++;clearGlobal();globalInput.value='';globalStatus.textContent='Griglia globale rimossa dalla memoria.';};
