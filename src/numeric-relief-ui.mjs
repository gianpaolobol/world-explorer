// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {parseRegionalGrid,gridMesh,projectMesh,MAX_GRID_BYTES,GEBCO_CREDIT} from './numeric-relief.mjs';
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
