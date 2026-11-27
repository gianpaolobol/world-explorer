// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {countries} from './countries.mjs';
import {INDICATORS,statisticsFor} from './world-statistics.mjs';
import {review,exportMemory} from './learning.mjs';
function shuffle(items,random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createStatisticsQuiz(snapshot){
 const groups=new Map(INDICATORS.map(i=>[i.id,[]]));
 for(const {code} of countries)for(const item of statisticsFor(snapshot,code,'en')){
  groups.get(item.id).push({code,value:snapshot.values[item.id][code],display:item.value});
 }
 const tasks=new Map();
 for(const [id,rows] of groups)for(const row of rows){
  // Keep a clear numerical gap and avoid ties at the displayed precision.
  const candidates=rows.filter(x=>x.code!==row.code&&x.display!==row.display&&Math.abs(x.value-row.value)>0.05*Math.max(x.value,row.value));
  const lower=candidates.filter(x=>x.value<row.value),higher=candidates.filter(x=>x.value>row.value);
  if(lower.length>=3||higher.length>=3)tasks.set(id+':'+row.code,{id,code:row.code,lower,higher});
 }
 function load(raw){
  let parsed;const result=Object.create(null);try{parsed=JSON.parse(raw||'{}');}catch{return result;}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return result;
  for(const key of tasks.keys()){const v=parsed[key];if(v&&typeof v==='object'&&['streak','correct','wrong','due'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0)&&v.streak<=v.correct&&v.due<=8640000000000000)result[key]={streak:v.streak,correct:v.correct,wrong:v.wrong,due:v.due};}
  return result;
 }
 function make(memory,now=Date.now(),random=Math.random){
  const due=shuffle([...tasks.keys()],random).filter(k=>(memory[k]?.due||0)<=now);
  const priority=k=>!memory[k]?2:memory[k].streak===0&&memory[k].wrong>0?0:1;
  due.sort((a,b)=>priority(a)-priority(b)||(memory[a]?.due||0)-(memory[b]?.due||0));
  const key=due[0];if(!key)return null;const t=tasks.get(key);
  const highest=t.lower.length>=3&&(t.higher.length<3||random()<0.5);
  const options=shuffle([t.code,...shuffle(highest?t.lower:t.higher,random).slice(0,3).map(x=>x.code)],random);
  return Object.freeze({key,id:t.id,answer:t.code,highest,options:Object.freeze(options)});
 }
 function describe(q,locale='it'){
  if(!q)return null;const t=tasks.get(q.key);if(!t||q.id!==t.id||q.answer!==t.code||typeof q.highest!=='boolean'||!Array.isArray(q.options)||q.options.length!==4||new Set(q.options).size!==4||!q.options.includes(q.answer))return null;
  const allowed=new Set((q.highest?t.lower:t.higher).map(x=>x.code));
  if(q.options.some(x=>x!==q.answer&&!allowed.has(x)))return null;
  const entries=q.options.map(code=>({code,...statisticsFor(snapshot,code,locale).find(x=>x.id===t.id)}));
  const answer=entries.find(x=>x.code===q.answer);
  if(!answer?.source||entries.some(x=>!x.source||x.year!==answer.year))return null;
  return {label:answer.label,year:answer.year,source:answer.source,attribution:answer.attribution,entries};
 }
 function grade(q,choice,memory,now=Date.now()){
  if(!describe(q,'en')||!q.options.includes(choice))throw new RangeError('Invalid statistical answer');
  const correct=choice===q.answer,p=memory[q.key]||{};
  memory[q.key]=review({...p,streak:Math.min(p.streak||0,52),correct:Math.min(p.correct||0,Number.MAX_SAFE_INTEGER-1),wrong:Math.min(p.wrong||0,Number.MAX_SAFE_INTEGER-1)},correct,now);
  return correct;
 }
 function stats(memory,now=Date.now()){
  const keys=[...tasks.keys()],records=keys.map(k=>memory[k]).filter(Boolean),scheduled=records.filter(v=>v.due>now).map(v=>v.due);
  return {total:keys.length,practiced:records.length,due:keys.filter(k=>(memory[k]?.due||0)<=now).length,mastered:records.filter(v=>v.streak>=3).length,retryDue:records.filter(v=>v.streak===0&&v.wrong>0&&v.due<=now).length,nextDue:scheduled.length?Math.min(...scheduled):null};
 }
 return Object.freeze({load,make,describe,grade,stats,export:exportMemory});
}
