import test from 'node:test';
import assert from 'node:assert/strict';
import {review,nextReview,exportMemory} from '../src/learning.mjs';
test('correct answers increase intervals',()=>{let a=review({},true,0);assert.equal(a.due,86400000);assert.equal(review(a,true,0).due,172800000)});
test('wrong answer resets streak',()=>{assert.equal(review({streak:4},false,0).streak,0);assert.equal(review({},false,0).due,600000)});
test('future reviews excluded',()=>assert.equal(nextReview([{code:'IT'}],{IT:{due:100}},0),null));
test('export version',()=>assert.equal(JSON.parse(exportMemory({})).version,1));
