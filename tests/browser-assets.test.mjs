// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {makeServer} from '../server.mjs';

test('all static local browser module dependencies are served, with private files denied',async t=>{
 const server=makeServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const origin='http://127.0.0.1:'+server.address().port;
 const html=await fetch(origin+'/');assert.equal(html.status,200);
 const document=await html.text();
 const queue=[...document.matchAll(/<script\b[^>]*\bsrc=["'](\.\/src\/[^"']+\.mjs)["']/g)].map(m=>new URL(m[1],origin+'/').href);
 assert.ok(queue.length>=3);
 const seen=new Set();
 while(queue.length){
  const url=queue.shift();if(seen.has(url))continue;seen.add(url);
  assert.equal(new URL(url).origin,origin);
  const res=await fetch(url);assert.equal(res.status,200,'missing browser module: '+url);
  assert.match(res.headers.get('content-type'),/^text\/javascript\b/);
  assert.equal(res.headers.get('x-content-type-options'),'nosniff');
  const source=await res.text();
  for(const m of source.matchAll(/^\s*(?:import\s+(?:[^;\n]*?\sfrom\s*)?|export\s+[^;\n]*?\sfrom\s*)['"](\.\.?\/[^'"]+)['"]/gm)){
   queue.push(new URL(m[1],url).href);
  }
 }
 assert.ok(seen.has(origin+'/src/statistics-quiz.mjs'));
 assert.ok(seen.has(origin+'/src/learning.mjs'));
 for(const path of ['/server.mjs','/package.json','/src/guide.mjs','/src/remote.mjs','/docs/PROGRESS.md','/.git/config','/src/missing.mjs']){
  const res=await fetch(origin+path);assert.equal(res.status,404,path);await res.text();
 }
});
