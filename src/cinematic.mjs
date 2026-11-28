// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Arrival-driven scheduling; minimum dwell plus narration, with a bounded speech wait.
export function createTour({choose,visit,arrive=()=>{},fly,speak,cancel,stopSpeech=()=>{},delay,onState=()=>{},schedule=setTimeout,unschedule=clearTimeout,speechLimit=120000,flightLimit=20000}){
 let state='idle',epoch=0,current=null,arrived=false;
 const timers=new Set();
 function set(s){state=s;onState(s);}
 function clearTimers(){for(const timer of timers)unschedule(timer);timers.clear();}
 function later(fn,ms){const timer=schedule(()=>{timers.delete(timer);fn();},ms);timers.add(timer);}
 function invalidate(){epoch++;clearTimers();cancel();}
 function launch(reuse=false){
   const id=++epoch;
   if(!reuse){current=choose();arrived=false;if(!current){stop();return;}visit(current);}
   set('flying');
   const activeFlight=()=>id===epoch&&state==='flying';
   // A missing camera callback must not leave the projector permanently in flight.
   later(()=>{if(activeFlight())pause();},flightLimit);
   try{fly(current,()=>{
     if(!activeFlight())return;
     clearTimers();
     if(!arrived){arrived=true;arrive(current);}
     set('dwelling');
     const minimum=delay();
     let dwellDone=false,speechDone=false;
     const active=()=>id===epoch&&state==='dwelling';
     const advance=()=>{if(active()&&dwellDone&&speechDone){clearTimers();launch();}};
     const done=()=>{if(!active())return;speechDone=true;advance();};
     later(()=>{dwellDone=true;advance();},minimum);
     let pending=false;
     try{pending=speak(current,done)===true;}catch{done();}
     if(!active())return;
     if(!pending)done();
     if(pending&&!speechDone)later(()=>{
       if(!active()||speechDone)return;
       speechDone=true;
       stopSpeech();
       advance();
     },Math.max(minimum,speechLimit));
   },()=>{if(activeFlight())pause();});}catch(error){if(activeFlight())pause();else throw error;}
 }
 function start(){if(state!=='idle')return;launch();}
 function stop(){invalidate();current=null;arrived=false;set('idle');}
 function pause(){if(state==='idle'||state==='paused')return;invalidate();set('paused');}
 function resume(){if(state==='paused')launch(true);}
 return {start,stop,pause,resume,get state(){return state;}};
}
