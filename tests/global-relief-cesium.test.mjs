import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGlobalGrid} from '../src/numeric-relief.mjs';
import {reliefBatches,safeReliefHeight} from '../src/global-relief-cesium.mjs';
const grid=(values)=>parseGlobalGrid(JSON.stringify({format:'gebco-2025-ice-surface-stride480-v1',rows:90,cols:180,values}));
test('Earth-fixed batches preserve native sample centres, signed height and missing cells',()=>{
 const v=Array(16200).fill(-4000);v[0]=5000;v[1]=null;
 const {vertices,buckets}=reliefBatches(grid(v),20);
 assert.ok(Math.abs(vertices[0].lat+89.00208333333333)<1e-9);
 assert.ok(Math.abs(vertices[0].lon+179.00208333333333)<1e-9);
 assert.equal(vertices[0].height,100000);assert.equal(vertices[2].height,-80000);assert.equal(vertices[1],null);
 assert.ok(buckets.every(b=>b.faces.every(f=>!f.includes(1))));
 assert.ok(buckets.some(b=>b.faces.some(f=>f.includes(179)&&f.includes(0))));
});
test('color bands partition every complete face and do not change with exaggeration',()=>{
 const v=Array.from({length:16200},(_,i)=>i<8100?-5000:2000);
 const g=grid(v),a=reliefBatches(g,1),b=reliefBatches(g,50);
 assert.equal(a.buckets.reduce((n,b)=>n+b.faces.length,0),89*180*2);
 assert.deepEqual(a.buckets,b.buckets);assert.ok(a.buckets.length>=2);
 assert.throws(()=>reliefBatches(g,2));
});
test('relief flight clearance never reduces normal country camera altitude',()=>{
 assert.equal(safeReliefHeight(18000,50),600000);
 assert.equal(safeReliefHeight(3000000,50),3000000);
 assert.equal(safeReliefHeight(18000,1),110000);
});

test('one-degree Earth-fixed batches use actual centres and partition the dense mesh',()=>{
 const g=parseGlobalGrid(JSON.stringify({format:'gebco-2025-ice-surface-stride240-v1',rows:180,cols:360,values:Array(64800).fill(-4000)}));
 const {vertices,buckets}=reliefBatches(g,20);
 assert.equal(vertices.length,64800);
 assert.ok(Math.abs(vertices[0].lon+179.50208333333333)<1e-9);
 assert.ok(Math.abs(vertices[0].lat+89.50208333333333)<1e-9);
 assert.equal(vertices[0].height,-80000);
 assert.equal(buckets.reduce((n,b)=>n+b.faces.length,0),179*360*2);
});
