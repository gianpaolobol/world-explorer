// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
export function review(previous={}, correct, now=Date.now()) {
 const streak=correct?(previous.streak||0)+1:0;
 const days=correct?Math.min(180,2**(streak-1)):0;
 return {...previous,streak,correct:(previous.correct||0)+Number(correct),wrong:(previous.wrong||0)+Number(!correct),due:now+(correct?days*86400000:600000)};
}
export function nextReview(items,memory,now=Date.now()){
 return [...items].sort((a,b)=>(memory[a.code]?.due||0)-(memory[b.code]?.due||0)).find(x=>(memory[x.code]?.due||0)<=now)||null;
}
export function exportMemory(memory,topic){return JSON.stringify({version:1,...(topic?{topic}:{}),memory});}
export function importMemory(raw,topic,load){
 const invalid=()=>{throw new RangeError('Invalid quiz backup');};
 if(!['region','statistics'].includes(topic)||typeof raw!=='string'||raw.length>524288)return invalid();
 let data;try{data=JSON.parse(raw);}catch{return invalid();}
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 if(!record(data)||data.version!==1||!record(data.memory)||Object.keys(data).some(k=>!['version','topic','memory'].includes(k)))return invalid();
 if(Object.hasOwn(data,'topic')&&data.topic!==topic)return invalid();
 const keys=Object.keys(data.memory);
 // Legacy backups had no topic. Nonempty records identify their topic through the current loader.
 if(!Object.hasOwn(data,'topic')&&!keys.length)return invalid();
 const cleaned=load(JSON.stringify(data.memory));
 if(Object.keys(cleaned).length!==keys.length)return invalid();
 for(const key of keys){
  const original=data.memory[key],value=cleaned[key];
  if(!record(original)||!value||Object.keys(original).length!==4||!['streak','correct','wrong','due'].every(k=>Object.hasOwn(original,k)&&original[k]===value[k]))return invalid();
 }
 return cleaned;
}

