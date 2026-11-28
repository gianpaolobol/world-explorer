import test from 'node:test';
import assert from 'node:assert/strict';
import {createTour} from '../src/cinematic.mjs';
function harness(){let n=0,arrivals=[],cancels=[],timers=new Map(),visits=[],reached=[],speech=[],seq=0,states=[];let t=createTour({choose:()=>++n,visit:x=>visits.push(x),arrive:x=>reached.push(x),fly:(x,a,c)=>{arrivals.push(a);cancels.push(c)},speak:x=>speech.push(x),cancel:()=>{},delay:()=>1000,onState:s=>states.push(s),schedule:cb=>{timers.set(++seq,cb);return seq},unschedule:id=>timers.delete(id)});return {t,arrivals,cancels,timers,visits,reached,speech,states,tick(){let [id,cb]=timers.entries().next().value;timers.delete(id);cb()}}}
test('narration and timer begin only after arrival',()=>{let h=harness();h.t.start();assert.equal(h.t.state,'flying');assert.equal(h.timers.size,1);h.arrivals[0]();assert.deepEqual(h.speech,[1]);assert.equal(h.t.state,'dwelling');h.tick();assert.deepEqual(h.visits,[1,2])});
test('stop invalidates late arrival',()=>{let h=harness();h.t.start();h.t.stop();h.arrivals[0]();assert.equal(h.timers.size,0);assert.deepEqual(h.speech,[]);assert.equal(h.t.state,'idle')});
test('pause and resume retain stop without double counting',()=>{let h=harness();h.t.start();h.t.pause();h.arrivals[0]();h.t.resume();h.arrivals[1]();assert.deepEqual(h.visits,[1]);assert.deepEqual(h.speech,[1]);h.t.pause();assert.equal(h.timers.size,0)});
test('interrupted flight pauses tour',()=>{let h=harness();h.t.start();h.cancels[0]();assert.equal(h.t.state,'paused')});

test('watchdog pauses a missing camera callback and retries without phantom visits',()=>{
 const h=harness();h.t.start();assert.deepEqual(h.reached,[]);h.tick();assert.equal(h.t.state,'paused');assert.equal(h.timers.size,0);
 h.arrivals[0]();assert.deepEqual(h.reached,[]);assert.deepEqual(h.speech,[]);
 h.t.resume();h.arrivals[0]();assert.deepEqual(h.reached,[]);h.arrivals[1]();h.arrivals[1]();
 assert.deepEqual(h.reached,[1]);assert.deepEqual(h.speech,[1]);assert.equal(h.timers.size,1);
 h.t.pause();h.t.resume();h.arrivals[2]();assert.deepEqual(h.reached,[1]);h.tick();
 assert.deepEqual(h.visits,[1,2]);assert.deepEqual(h.reached,[1]);h.arrivals[3]();assert.deepEqual(h.reached,[1,2]);h.t.stop();assert.equal(h.timers.size,0);
});
test('synchronous camera failure pauses; synchronous text-only arrival clears watchdog',()=>{
 let scheduled=new Map(),seq=0,arrived=0,fail=true,choose=0;
 const tour=createTour({choose:()=>++choose,visit:()=>{},arrive:()=>arrived++,fly:(_,done)=>{if(fail)throw Error('camera unavailable');done();},speak:()=>false,cancel:()=>{},delay:()=>100,schedule:(cb,ms)=>{scheduled.set(++seq,{cb,ms});return seq;},unschedule:id=>scheduled.delete(id)});
 tour.start();assert.equal(tour.state,'paused');assert.equal(arrived,0);assert.equal(scheduled.size,0);
 fail=false;tour.resume();assert.equal(tour.state,'dwelling');assert.equal(arrived,1);assert.deepEqual([...scheduled.values()].map(t=>t.ms),[100]);tour.stop();assert.equal(scheduled.size,0);
});
