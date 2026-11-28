import test from 'node:test';
import assert from 'node:assert/strict';
import {review,nextReview,exportMemory,importMemory} from '../src/learning.mjs';
test('correct answers increase intervals',()=>{let a=review({},true,0);assert.equal(a.due,86400000);assert.equal(review(a,true,0).due,172800000)});
test('wrong answer resets streak',()=>{assert.equal(review({streak:4},false,0).streak,0);assert.equal(review({},false,0).due,600000)});
test('future reviews excluded',()=>assert.equal(nextReview([{code:'IT'}],{IT:{due:100}},0),null));
test('export version',()=>assert.equal(JSON.parse(exportMemory({})).version,1));

test('backup parser rejects malformed, oversized, wrong version or ambiguous empty legacy files',()=>{
 const load=()=>Object.create(null);
 for(const raw of ['{','null','[]','{}',' '.repeat(524289),'{"version":2,"memory":{}}','{"version":1,"memory":{}}','{"version":1,"topic":"statistics","memory":{}}','{"version":1,"topic":"region","memory":[]}', '{"version":1,"topic":"region","memory":{},"extra":true}'])assert.throws(()=>importMemory(raw,'region',load),RangeError);
 assert.equal(Object.keys(importMemory(exportMemory({},'region'),'region',load)).length,0);
});
