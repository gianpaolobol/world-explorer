// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
const $=id=>document.getElementById(id);
const allowed=new Set(['prev','next','auto','pause','voice','stopVoice','ambient']);
let epoch=0,timer=null;
function stop(){epoch++;clearTimeout(timer);timer=null;$('remoteToken').textContent='';}
async function request(path){
 const response=await fetch('/api/remote/'+path,{method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(3000)});
 if(!response.ok)throw new Error('remote unavailable');return response.json();
}
async function poll(id){
 if(id!==epoch)return;
 try{
  const result=await request('poll');if(id!==epoch)return;
  if(!result.active){stop();$('remoteStatus').textContent='Sessione terminata.';return;}
  for(const command of result.commands){if(allowed.has(command))$(command)?.click();}
  timer=setTimeout(()=>poll(id),500);
 }catch{if(id===epoch){stop();$('remoteStatus').textContent='Collegamento interrotto. Revoca o genera un nuovo codice.';}}
}
$('remotePair').onclick=async()=>{
 stop();const id=epoch;$('remotePair').disabled=true;$('remoteRevoke').disabled=true;
 try{
  const result=await request('pair');if(id!==epoch)return;
  $('remoteToken').textContent=result.token;$('remoteStatus').textContent='Apri '+result.url+' sul telefono (HTTPS attendibile). Codice valido 15 minuti.';
  poll(id);
 }catch{if(id===epoch)$('remoteStatus').textContent='Telecomando non configurato. Consulta il README.';}
 finally{$('remotePair').disabled=false;$('remoteRevoke').disabled=false;}
};
$('remoteRevoke').onclick=async()=>{
 stop();$('remotePair').disabled=true;$('remoteRevoke').disabled=true;
 try{await request('revoke');$('remoteStatus').textContent='Sessione revocata.';}
 catch{$('remoteStatus').textContent='Revoca non confermata. Chiudi il server per interrompere la sessione.';}
 finally{$('remotePair').disabled=false;$('remoteRevoke').disabled=false;}
};
window.addEventListener('pagehide',stop);
