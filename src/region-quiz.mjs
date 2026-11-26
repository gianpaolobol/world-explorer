// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {countries} from './countries.mjs';
import {regionOf,regionCodes} from './regions.mjs';
import {review,nextReview,exportMemory} from './learning.mjs';
const registry=countries.filter(c=>regionOf(c.code));
const known=new Set(registry.map(c=>c.code));
function shuffle(items,random){
 const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function loadMemory(raw){
 const clean=Object.create(null);let parsed;
 try{parsed=JSON.parse(raw||'{}');}catch{return clean;}
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return clean;
 for(const code of known){const v=parsed[code];if(!v||typeof v!=='object')continue;
 if(['streak','correct','wrong','due'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0)&&v.streak<=v.correct&&v.due<=8640000000000000)
 clean[code]={streak:v.streak,correct:v.correct,wrong:v.wrong,due:v.due};}
 return clean;
}
export function makeQuestion(memory,now=Date.now(),random=Math.random){
 const c=nextReview(shuffle(registry,random),memory,now);if(!c)return null;
 const answer=regionOf(c.code);
 const others=shuffle(regionCodes.filter(x=>x!==answer),random).slice(0,3);
 return Object.freeze({code:c.code,answer,options:Object.freeze(shuffle([answer,...others],random))});
}
export function gradeQuestion(question,choice,memory,now=Date.now()){
 if(!question||!known.has(question.code)||question.answer!==regionOf(question.code)||!question.options.includes(choice))throw new RangeError('Invalid answer');
 const correct=choice===question.answer;
 const previous=memory[question.code]||{};
 // Bound counters to keep persisted JSON safe even if local storage is edited.
 const bounded={...previous,streak:Math.min(previous.streak||0,52),correct:Math.min(previous.correct||0,Number.MAX_SAFE_INTEGER-1),wrong:Math.min(previous.wrong||0,Number.MAX_SAFE_INTEGER-1)};
 memory[question.code]=review(bounded,correct,now);
 return correct;
}
export function quizStats(memory,now=Date.now()){
 return {total:registry.length,practiced:registry.filter(c=>memory[c.code]).length,due:registry.filter(c=>(memory[c.code]?.due||0)<=now).length};
}
export function quizExport(memory){return exportMemory(memory);}
