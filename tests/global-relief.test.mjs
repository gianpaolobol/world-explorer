import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGlobalGrid,globalMesh,projectGlobalMesh,GLOBAL_MAX_BYTES,GLOBAL_ROWS,GLOBAL_COLS} from '../src/numeric-relief.mjs';
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
