import test from 'node:test';
import assert from 'node:assert/strict';
import {createTour} from '../src/cinematic.mjs';
function harness(){let n=0,arrivals=[],cancels=[],timers=new Map(),visits=[],speech=[],seq=0,states=[];let t=createTour({choose:()=>++n,visit:x=>visits.push(x),fly:(x,a,c)=>{arrivals.push(a);cancels.push(c)},speak:x=>speech.push(x),cancel:()=>{},delay:()=>1000,onState:s=>states.push(s),schedule:cb=>{timers.set(++seq,cb);return seq},unschedule:id=>timers.delete(id)});return {t,arrivals,cancels,timers,visits,speech,states,tick(){let [id,cb]=timers.entries().next().value;timers.delete(id);cb()}}}
test('narration and timer begin only after arrival',()=>{let h=harness();h.t.start();assert.equal(h.t.state,'flying');assert.equal(h.timers.size,0);h.arrivals[0]();assert.deepEqual(h.speech,[1]);assert.equal(h.t.state,'dwelling');h.tick();assert.deepEqual(h.visits,[1,2])});
test('stop invalidates late arrival',()=>{let h=harness();h.t.start();h.t.stop();h.arrivals[0]();assert.equal(h.timers.size,0);assert.deepEqual(h.speech,[]);assert.equal(h.t.state,'idle')});
test('pause and resume retain stop without double counting',()=>{let h=harness();h.t.start();h.t.pause();h.arrivals[0]();h.t.resume();h.arrivals[1]();assert.deepEqual(h.visits,[1]);assert.deepEqual(h.speech,[1]);h.t.pause();assert.equal(h.timers.size,0)});
test('interrupted flight pauses tour',()=>{let h=harness();h.t.start();h.cancels[0]();assert.equal(h.t.state,'paused')});
