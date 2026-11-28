// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdtemp,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {makeServer,readPreparedGlobalRelief} from '../server.mjs';
import {canonicalGlobalGrid,GLOBAL_MAX_BYTES,parseGlobalGrid} from '../src/numeric-relief.mjs';

function fixture(dense=false){
 const rows=dense?180:90,cols=dense?360:180,stride=dense?240:480;
 return {format:`gebco-2025-ice-surface-stride${stride}-v1`,rows,cols,values:Array.from({length:rows*cols},(_,i)=>i===0?null:i%20001-11000),privateNote:'must not be returned',extra:{path:'not a public field'}};
}
test('prepared relief canonicalization preserves all signed samples and strips extra fields',()=>{
 for(const dense of [false,true]){
  const original=fixture(dense),text=JSON.stringify(original),clean=canonicalGlobalGrid(text);
  assert.deepEqual(Object.keys(clean),['format','rows','cols','values']);
  assert.deepEqual(clean.values,original.values);
  assert.equal(parseGlobalGrid(JSON.stringify(clean)).resolution,dense?1:2);
  assert.equal(clean.format,original.format);
 }
 for(const data of [{...fixture(),rows:180},{...fixture(),format:'unknown'},{...fixture(),values:[]},{...fixture(),values:fixture().values.map(()=>null)}])assert.throws(()=>canonicalGlobalGrid(JSON.stringify(data)));
});
test('prepared relief reader bounds regular files and strips metadata',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'world-relief-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const file=join(directory,'grid.json'),original=fixture(true);
 await writeFile(file,JSON.stringify(original));
 const clean=JSON.parse(await readPreparedGlobalRelief(file));
 assert.deepEqual(clean,canonicalGlobalGrid(JSON.stringify(original)));
 await assert.rejects(readPreparedGlobalRelief(directory));
 await assert.rejects(readPreparedGlobalRelief(join(directory,'missing.json')));
 if(process.platform!=='win32'){
  const alias=join(directory,'alias.json');await symlink(file,alias);
  await assert.rejects(readPreparedGlobalRelief(alias));
 }
 await writeFile(file,Buffer.alloc(GLOBAL_MAX_BYTES+1,32));await assert.rejects(readPreparedGlobalRelief(file));
 await writeFile(file,'{"format":"unknown"}');await assert.rejects(readPreparedGlobalRelief(file));
 await writeFile(file,Buffer.from([0xff,0xfe]));await assert.rejects(readPreparedGlobalRelief(file));
});
async function local(t,preparedRelief){
 const server=makeServer({preparedRelief});server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const origin='http://127.0.0.1:'+server.address().port;
 const route=origin+'/api/relief/prepared';
 const post=(options={})=>fetch(route,{method:'POST',headers:{Origin:origin},...options});
 return {origin,route,post};
}
test('prepared relief is opt-in, same-origin POST only and contains no extra metadata',async t=>{
 const original=fixture(true),{origin,route,post}=await local(t,JSON.stringify(original));
 const response=await post();assert.equal(response.status,200);
 assert.match(response.headers.get('content-type'),/application\/json/);
 assert.equal(response.headers.get('cache-control'),'no-store');
 const clean=await response.json();assert.deepEqual(clean,canonicalGlobalGrid(JSON.stringify(original)));
 assert.equal((await fetch(route)).status,403);
 assert.equal((await post({headers:{Origin:'https://example.org'}})).status,403);
 assert.equal((await post({headers:{Origin:origin,'Sec-Fetch-Site':'cross-site'}})).status,403);
 assert.equal((await post({body:'x'})).status,403);
 assert.equal((await fetch(route+'?path=private',{method:'POST',headers:{Origin:origin}})).status,404);
 assert.equal((await fetch(origin+'/local-data/global-relief.json')).status,404);
});
test('absent or invalid prepared grids preserve manual import fallback',async t=>{
 for(const data of [undefined,'{"format":"unknown"}']){
  const {post}=await local(t,data);const response=await post();
  assert.equal(response.status,404);assert.deepEqual(await response.json(),{error:'prepared relief unavailable'});
 }
});
