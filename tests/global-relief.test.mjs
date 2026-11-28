import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGlobalGrid,globalMesh,projectGlobalMesh,GLOBAL_MAX_BYTES,GLOBAL_ROWS,GLOBAL_COLS,globalSample,regionalSample,parseRegionalGrid,reliefNarration,GEBCO_DOI} from '../src/numeric-relief.mjs';
const payload=(values=Array(GLOBAL_ROWS*GLOBAL_COLS).fill(0))=>JSON.stringify({format:'gebco-2025-ice-surface-stride480-v1',rows:GLOBAL_ROWS,cols:GLOBAL_COLS,values});
test('global grid has fixed shape and preserves deep negative values and gaps',()=>{
 const v=Array(16200).fill(0);v[0]=-9999;v[1]=null;v[2]=8848;
 const g=parseGlobalGrid(payload(v));assert.equal(g.min,-9999);assert.equal(g.max,8848);assert.equal(g.count,16199);assert.equal(g.values[1],null);
});
test('invalid global data is rejected before mesh construction',()=>{
 for(const v of [[],Array(16200).fill(null),Array(16200).fill(-12001),Array(16200).fill(1.2),Array(16200).fill('0')])assert.throws(()=>parseGlobalGrid(payload(v)));
 assert.throws(()=>parseGlobalGrid(' '.repeat(GLOBAL_MAX_BYTES+1)));
 assert.throws(()=>parseGlobalGrid(payload().replace('stride480','stride1')));
});
test('global mesh closes the antimeridian and leaves polar caps open',()=>{
 const m=globalMesh(parseGlobalGrid(payload()));
 assert.equal(m.vertices.length,16200);assert.equal(m.faces.length,89*180*2);
 assert.ok(m.faces.some(f=>f.includes(179)&&f.includes(0)));
 assert.ok(m.vertices[0].z<-.99);assert.ok(m.vertices.at(-1).z>.99);
 assert.ok(m.vertices.every(v=>Math.abs(Math.hypot(v.x,v.y,v.z)-1)<1e-12));
});
test('signed geometry and gaps remain distinct at all exaggerations',()=>{
 const v=Array(16200).fill(0);v[0]=-5000;v[1]=4000;v[2]=null;
 const g=parseGlobalGrid(payload(v)),m=globalMesh(g,50);
 assert.ok(Math.hypot(m.vertices[0].x,m.vertices[0].y,m.vertices[0].z)<1);
 assert.ok(Math.hypot(m.vertices[1].x,m.vertices[1].y,m.vertices[1].z)>1);
 assert.equal(m.vertices[0].height,-5000);assert.equal(m.vertices[2],null);
 assert.ok(m.faces.every(f=>!f.includes(2)));assert.throws(()=>globalMesh(g,100));
});
test('global orthographic rotation produces finite front-facing triangles',()=>{
 const m=globalMesh(parseGlobalGrid(payload()));
 for(const [lon,lat] of [[0,0],[180,0],[90,90],[-180,-90]]){
  const tris=projectGlobalMesh(m,lon,lat);
  assert.ok(tris.length>14000&&tris.length<18000);
  assert.ok(tris.every((t,i)=>Number.isFinite(t.depth)&&(!i||tris[i-1].depth<=t.depth)));
 }
 assert.throws(()=>projectGlobalMesh(m,181,0));
});

test('local relief reports native signed sample values and never interpolates gaps',()=>{
 const g=parseRegionalGrid('ncols 2\nnrows 2\nxllcorner 10\nyllcorner 40\ncellsize 0.004166666667\n-100 -9999\n30 40');
 assert.equal(regionalSample(g,10.001,40.006).height,-100);
 assert.equal(regionalSample(g,10.006,40.006),null);
 assert.equal(regionalSample(g,10.001,40.001).height,30);
 assert.equal(regionalSample(g,10.006,40.001).height,40);
 assert.equal(regionalSample(g,g.east,40.001),null);
 assert.equal(regionalSample(g,10.001,g.north),null);
 assert.equal(regionalSample(g,9,40),null);
 assert.throws(()=>regionalSample(g,NaN,40));
});
test('coarse samples close longitude seam, preserve zero and exclude polar caps',()=>{
 const v=Array(16200).fill(0);v[45*180]=-5000;v[45*180+1]=null;
 const g=parseGlobalGrid(payload(v));
 for(const lon of [-180,180,-179])assert.equal(globalSample(g,lon,1).height,-5000);
 assert.equal(globalSample(g,-177,1),null);
 assert.equal(globalSample(g,0,0).height,0);
 assert.equal(globalSample(g,0,90),null);
 assert.equal(globalSample(g,0,-90),null);
 assert.throws(()=>globalSample(g,0,91));
 for(let row=0;row<90;row++)for(let col=0;col<180;col++){
  const lat=-90+(239+row*480+.5)/240,lon=-180+(239+col*480+.5)/240;
  const s=globalSample(g,lon,lat);
  if(v[row*180+col]===null){assert.equal(s,null);continue;}
  assert.equal(s.height,v[row*180+col]);assert.ok(Math.abs(s.lon-lon)<1e-9);assert.ok(Math.abs(s.lat-lat)<1e-9);
 }
});

test('relief narration is optional, local, signed, resolution-labelled and never invents gaps',()=>{
 const g=parseGlobalGrid(payload(Array(16200).fill(-5000)));
 const region=parseRegionalGrid('ncols 2\nnrows 2\nxllcorner 10\nyllcorner 40\ncellsize 0.004166666667\n-100 -9999\n30 40');
 for(const locale of ['it','en','fr','es','de','pt']){
  const r=reliefNarration(region,g,10.001,40.006,locale);
  assert.equal(r.sample.height,-100);assert.equal(r.source,GEBCO_DOI);assert.match(r.text,/15/);assert.match(r.text,/-100/);
  const fallback=reliefNarration(region,g,10.006,40.006,locale);
  assert.equal(fallback.sample.height,-5000);assert.match(fallback.text,/2/);
  assert.equal(reliefNarration(region,null,10.006,40.006,locale),null);
  assert.equal(reliefNarration(null,g,0,90,locale),null);
  assert.equal(reliefNarration(null,null,0,0,locale),null);
 }
 assert.equal(reliefNarration(region,g,10.001,40.006,'ja'),null);
 assert.equal(reliefNarration(region,g,10.001,40.006,'__proto__'),null);
});

test('one-degree layout preserves every native sample, missing cells, and seam',()=>{
 const rows=180,cols=360,values=Array.from({length:rows*cols},(_,i)=>i%97===0?null:i%10000-5000);
 const payload={format:'gebco-2025-ice-surface-stride240-v1',rows,cols,values};
 const g=parseGlobalGrid(JSON.stringify(payload));
 assert.equal(g.resolution,1);assert.equal(g.count,values.filter(v=>v!==null).length);
 for(let i=0;i<values.length;i++){
  const lat=-90+(119.5+Math.floor(i/cols)*240)/240,lon=-180+(119.5+(i%cols)*240)/240;
  const sample=globalSample(g,lon,lat);
  if(values[i]===null)assert.equal(sample,null);
  else{assert.equal(sample.height,values[i]);assert.ok(Math.abs(sample.lat-lat)<1e-9);assert.ok(Math.abs(sample.lon-lon)<1e-9);assert.equal(sample.resolution,1);}
 }
 const mesh=globalMesh(g,20);
 assert.equal(mesh.vertices.length,64800);assert.ok(mesh.faces.every(f=>f.every(i=>values[i]!==null)));
 assert.ok(mesh.faces.some(f=>f.some(i=>i%cols===0)&&f.some(i=>i%cols===359)));
 assert.deepEqual(globalSample(g,-180,0),globalSample(g,180,0));
 assert.equal(globalSample(g,0,90),null);assert.equal(globalSample(g,0,-90),null);
 for(const locale of ['it','en','fr','es','de','pt'])assert.match(reliefNarration(null,g,0,0,locale).text,/1/);
 assert.throws(()=>parseGlobalGrid(JSON.stringify({...payload,rows:90})));
 assert.throws(()=>parseGlobalGrid(JSON.stringify({...payload,format:'__proto__'})));
});
