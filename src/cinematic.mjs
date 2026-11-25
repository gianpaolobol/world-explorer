// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Arrival-driven scheduling; invalidate stale callbacks before cancelling flight.
export function createTour({choose,visit,fly,speak,cancel,delay,onState=()=>{},schedule=setTimeout,unschedule=clearTimeout}){
 let state='idle',epoch=0,timer=null,current=null;
 function set(s){state=s;onState(s);}
 function invalidate(){epoch++;if(timer!==null){unschedule(timer);timer=null;}cancel();}
 function launch(reuse=false){
   const id=++epoch;
   if(!reuse){current=choose();if(!current){stop();return;}visit(current);}
   set('flying');
   fly(current,()=>{if(id!==epoch||state!=='flying')return;set('dwelling');speak(current);
     timer=schedule(()=>{timer=null;if(id===epoch&&state==='dwelling')launch();},delay());
   },()=>{if(id===epoch&&state==='flying')pause();});
 }
 function start(){if(state!=='idle')return;launch();}
 function stop(){invalidate();current=null;set('idle');}
 function pause(){if(state==='idle'||state==='paused')return;invalidate();set('paused');}
 function resume(){if(state==='paused')launch(true);}
 return {start,stop,pause,resume,get state(){return state;}};
}
