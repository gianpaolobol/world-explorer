// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
const token=document.getElementById('token'),status=document.getElementById('status');
let busy=false;
for(const button of document.querySelectorAll('[data-command]'))button.onclick=async()=>{
 if(busy)return;
 const value=token.value.trim();
 if(!/^[a-f0-9]{48}$/.test(value)){status.textContent='Inserisci il codice completo.';return;}
 busy=true;
 try{
  const response=await fetch('/command',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+value},body:JSON.stringify({command:button.dataset.command}),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(5000)});
  status.textContent=response.status===202?'Comando in coda.':response.status===401?'Codice scaduto o non valido.':response.status===429?'Attendi prima di riprovare.':'Comando rifiutato.';
 }catch{status.textContent='Computer non raggiungibile.';}finally{busy=false;}
};
document.getElementById('forget').onclick=()=>{token.value='';status.textContent='Codice cancellato da questo schermo.';};
window.addEventListener('pagehide',()=>{token.value='';});
