import test from 'node:test';
import assert from 'node:assert/strict';
import {countries,languages} from '../src/countries.mjs';
import {classifiedCountries,regionOf,regionCodes,regionName,M49_SOURCE} from '../src/regions.mjs';
import {narrationFor} from '../src/narration.mjs';
import {loadMemory,makeQuestion,gradeQuestion,quizStats,quizExport} from '../src/region-quiz.mjs';
test('M49 covers exactly the atlas registry',()=>{assert.equal(classifiedCountries.length,195);assert.deepEqual([...classifiedCountries].sort(),countries.map(c=>c.code).sort());assert.equal(regionCodes.length,22)});
test('classification edge cases follow statistical convention',()=>{for(const [code,region] of Object.entries({MX:'013',IR:'034',RU:'151',CY:'145',TR:'145',VA:'039',PS:'145',SS:'014',TV:'061',NR:'057',SD:'015',TZ:'014'}))assert.equal(regionOf(code),region);assert.equal(regionOf('ZZ'),null)});
test('all countries in all 20 languages have a sourced narration',()=>{for(const c of countries)for(const l of languages){const n=narrationFor(c.code,l);assert.equal(n.language,l);assert.equal(n.source,M49_SOURCE);assert.ok(n.text.includes(regionName(regionOf(c.code),l)));assert.ok(n.text.length>15);assert.notEqual(regionName(regionOf(c.code),l),regionOf(c.code))}});
test('unknown destination fails closed and unsupported locale falls back',()=>{assert.equal(narrationFor('ZZ'),null);assert.equal(narrationFor('IT','xx').language,'en')});
test('questions contain exactly one correct option and exclude unseen keys',()=>{const memory=loadMemory(null);const q=makeQuestion(memory,0,()=>0.5);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(x=>x===q.answer).length,1);assert.equal(q.answer,regionOf(q.code));assert.throws(()=>gradeQuestion(q,'bad',memory,0));assert.equal(quizStats(memory,0).due,195)});
test('grading persists and respects spaced repetition',()=>{const memory=loadMemory('{}'),q=makeQuestion(memory,0,()=>0.5);assert.equal(gradeQuestion(q,q.answer,memory,0),true);assert.equal(memory[q.code].due,86400000);assert.equal(quizStats(memory,0).due,194);assert.equal(quizStats(memory,86400000).due,195);assert.deepEqual(loadMemory(JSON.stringify(memory))[q.code],memory[q.code]);assert.equal(JSON.parse(quizExport(memory)).version,1)});
test('wrong answer schedules short retry',()=>{const m=loadMemory('{}'),q=makeQuestion(m,0,()=>0.5);assert.equal(gradeQuestion(q,q.options.find(x=>x!==q.answer),m,0),false);assert.equal(m[q.code].due,600000);assert.equal(m[q.code].wrong,1)});
test('corrupt and foreign data ignored',()=>{assert.deepEqual(Object.keys(loadMemory('{')),[]);assert.deepEqual(Object.keys(loadMemory('{"ZZ":{"streak":1,"correct":1,"wrong":0,"due":0},"IT":{"streak":2,"correct":1,"wrong":0,"due":0}}')),[])});
test('all future reviews gives empty quiz',()=>{const m=Object.fromEntries(countries.map(c=>[c.code,{due:100}]));assert.equal(makeQuestion(m,0),null)});

test('overdue mistakes take priority over other reviews and unseen countries',()=>{
 const m=loadMemory(JSON.stringify({IT:{streak:0,correct:1,wrong:2,due:100},FR:{streak:1,correct:1,wrong:0,due:10},DE:{streak:0,correct:0,wrong:1,due:200}}));
 assert.equal(makeQuestion(m,100,()=>0.5).code,'IT');
 assert.equal(makeQuestion(m,99,()=>0.5).code,'FR');
 assert.notEqual(makeQuestion(m,99,()=>0.5).code,'DE');
});
test('earliest due mistake takes precedence regardless of shuffle',()=>{
 const m=loadMemory(JSON.stringify({IT:{streak:0,correct:0,wrong:1,due:100},FR:{streak:0,correct:0,wrong:1,due:20}}));
 for(const v of [0,0.5,0.99])assert.equal(makeQuestion(m,100,()=>v).code,'FR');
});
test('mastery and due retry statistics survive local storage roundtrip',()=>{
 const m=loadMemory(JSON.stringify({IT:{streak:3,correct:3,wrong:0,due:1000},FR:{streak:0,correct:1,wrong:2,due:10},DE:{streak:2,correct:2,wrong:0,due:500}}));
 assert.deepEqual(quizStats(m,20),{total:195,practiced:3,due:193,mastered:1,retryDue:1,nextDue:500});
 assert.deepEqual(quizStats(loadMemory(JSON.stringify(m)),20),quizStats(m,20));
});
test('empty quiz exposes next review without presenting future questions',()=>{
 const m=Object.fromEntries(countries.map(c=>[c.code,{streak:1,correct:1,wrong:0,due:100}]));
 assert.equal(makeQuestion(m,99),null);
 assert.equal(quizStats(m,99).nextDue,100);
 assert.equal(quizStats(m,99).due,0);
 assert.equal(quizStats(m,100).due,195);
});
