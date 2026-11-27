import test from 'node:test';
import assert from 'node:assert/strict';
import {createStatisticsQuiz} from '../src/statistics-quiz.mjs';
import {snapshot} from '../src/world-statistics-data.mjs';
import {INDICATORS} from '../src/world-statistics.mjs';
const quiz=createStatisticsQuiz(snapshot);
test('all eligible real statistical tasks have four unique choices, strict ordering, dated source and six localized labels',()=>{
 const memory=quiz.load(null),total=quiz.stats(memory,0).total,seen=new Set();
 assert.ok(total>2500);
 for(let i=0;i<total;i++){
  const q=quiz.make(memory,0,()=>0.5);assert.ok(q);assert.ok(!seen.has(q.key));seen.add(q.key);
  assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.answer));
  const values=snapshot.values[q.id],answer=values[q.answer];
  for(const c of q.options.filter(x=>x!==q.answer))assert.ok(q.highest?answer>values[c]:answer<values[c]);
  for(const lang of ['it','en','fr','es','de','pt']){
   const d=quiz.describe(q,lang);assert.ok(d);assert.equal(d.entries.length,4);assert.match(d.source,/^https:\/\/data\.worldbank\.org\/indicator\//);assert.ok(d.entries.every(e=>e.year===d.year&&e.language===lang));
  }
  assert.equal(quiz.grade(q,q.answer,memory,0),true);
 }
 assert.equal(quiz.make(memory,0),null);assert.equal(quiz.stats(memory,0).practiced,total);assert.equal(new Set([...seen].map(k=>k.split(':')[0])).size,INDICATORS.length);
});
test('wrong answers retry first, preserve local history and reject forged questions',()=>{
 const m=quiz.load(null),q=quiz.make(m,0,()=>0.5);
 assert.equal(quiz.grade(q,q.options.find(x=>x!==q.answer),m,0),false);
 assert.notEqual(quiz.make(m,599999,()=>0.5).key,q.key);
 assert.equal(quiz.make(m,600000,()=>0.5).key,q.key);
 assert.throws(()=>quiz.grade({...q,highest:!q.highest},q.answer,m,0),RangeError);
 assert.throws(()=>quiz.grade({...q,options:[q.answer,q.answer,q.answer,q.answer]},q.answer,m,0),RangeError);
 const restored=quiz.load(JSON.stringify({...m,INVALID:{streak:1,correct:1,wrong:0,due:0}}));
 assert.deepEqual(Object.keys(restored),[q.key]);assert.equal(JSON.parse(quiz.export(restored)).memory[q.key].wrong,1);
});
test('empty or invalid snapshots have no fabricated questions',()=>{
 const empty=createStatisticsQuiz(null);assert.equal(empty.stats(empty.load(null)).total,0);assert.equal(empty.make({}),null);
});
