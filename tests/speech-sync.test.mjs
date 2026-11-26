// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createTour} from '../src/cinematic.mjs';
import {createNarrator} from '../src/speech.mjs';
function harness(){
 let n=0,arrival,complete,id=0,now=0;const timers=new Map(),visits=[],spoken=[];let stopped=0;
 const tour=createTour({choose:()=>++n,visit:x=>visits.push(x),fly:(_,a)=>arrival=a,speak:(x,done)=>{spoken.push(x);complete=done;return true;},cancel:()=>{},stopSpeech:()=>{stopped++;complete();},delay:()=>100,speechLimit:300,schedule:(cb,ms)=>{timers.set(++id,{cb,at:now+ms});return id;},unschedule:i=>timers.delete(i)});
 function tick(ms){const end=now+ms;while(true){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].cb();}now=end;}
 return {tour,visits,spoken,tick,arrive:()=>arrival(),done:()=>complete(),callback:()=>complete,get stopped(){return stopped;}};
}
test('long speech extends minimum dwell until completion',()=>{const h=harness();h.tour.start();h.arrive();h.tick(150);assert.deepEqual(h.visits,[1]);h.done();assert.deepEqual(h.visits,[1,2]);});
test('short speech still respects minimum dwell',()=>{const h=harness();h.tour.start();h.arrive();h.done();h.tick(99);assert.deepEqual(h.visits,[1]);h.tick(1);assert.deepEqual(h.visits,[1,2]);});
test('missing speech completion reaches bounded timeout once',()=>{const h=harness();h.tour.start();h.arrive();h.tick(299);assert.equal(h.stopped,0);h.tick(1);assert.equal(h.stopped,1);assert.deepEqual(h.visits,[1,2]);h.done();assert.deepEqual(h.visits,[1,2]);});
test('stale completion cannot advance paused or resumed tour',()=>{const h=harness();h.tour.start();h.arrive();const old=h.callback();h.tour.pause();old();h.tick(500);assert.deepEqual(h.visits,[1]);h.tour.resume();h.arrive();old();h.tick(100);assert.deepEqual(h.visits,[1]);h.done();assert.deepEqual(h.visits,[1,2]);});
test('no remote or unknown voice fallback',()=>{let count=0,status;const synthesis={getVoices:()=>[{lang:'it-IT',localService:false},{lang:'it-IT'},{lang:'en-US',localService:true}],speak:()=>count++};const n=createNarrator({synthesis,Utterance:class{},onStatus:s=>status=s});assert.equal(n.speak({language:'it',text:'test'}),false);assert.equal(status,'no-local-voice');assert.equal(count,0);});
test('local voice completion, explicit stop and stale error complete exactly once',()=>{let u,done=0;const local={lang:'it-IT',localService:true};const synthesis={getVoices:()=>[{lang:'it-IT',localService:false},local],speak:v=>u=v,cancel:()=>u.onerror?.()};const n=createNarrator({synthesis,Utterance:class{constructor(text){this.text=text;} }});assert.equal(n.speak({language:'it',text:'ciao'},()=>done++),true);assert.equal(u.voice,local);const stale=u.onend;n.stop();assert.equal(done,1);stale();assert.equal(done,1);n.speak({language:'it',text:'ciao'},()=>done++);u.onend();n.stop();assert.equal(done,2);});
test('unavailable speech never blocks tour',()=>{const n=createNarrator({});assert.equal(n.speak({language:'it',text:'ciao'}),false);});
