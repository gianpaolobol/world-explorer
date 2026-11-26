// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// No implicit network voice fallback. A browser's localService flag is not a network audit.
export function createNarrator({synthesis,Utterance,onStatus=()=>{}}){
 let active=null;
 function finish(entry,status){
  if(active!==entry)return;
  active=null;entry.utterance.onend=null;entry.utterance.onerror=null;
  onStatus(status);entry.done();
 }
 function stop(){
  const entry=active;
  if(!entry)return;
  try{ synthesis.cancel(); }finally{finish(entry,'stopped');}
 }
 function speak(n,done=()=>{}){
  stop();
  if(!n||!synthesis||!Utterance){onStatus('unavailable');return false;}
  try{
   const voice=synthesis.getVoices().find(v=>v.localService===true&&v.lang.toLowerCase().split('-')[0]===n.language);
   if(!voice){onStatus('no-local-voice');return false;}
   const utterance=new Utterance(n.text);utterance.lang=n.language;utterance.voice=voice;
   const entry={utterance,done};active=entry;
   utterance.onend=()=>finish(entry,'ended');utterance.onerror=()=>finish(entry,'error');
   onStatus('speaking');synthesis.speak(utterance);
   return true;
  }catch{
   if(active)finish(active,'error');else onStatus('error');
   return false;
  }
 }
 return {speak,stop};
}
