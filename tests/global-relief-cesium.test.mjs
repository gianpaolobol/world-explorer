import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGlobalGrid,globalMesh,globalFaces,globalCellCentre} from '../src/numeric-relief.mjs';
import {reliefBatches,safeReliefHeight,indexedBandGeometry} from '../src/global-relief-cesium.mjs';
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

test('indexed dense geometry preserves every ordered triangle and reduces input buffers',()=>{
 const g=parseGlobalGrid(JSON.stringify({format:'gebco-2025-ice-surface-stride240-v1',rows:180,cols:360,values:Array.from({length:64800},(_,i)=>i%97===0?null:Math.floor(i/360)%2===0?-4000:1500)}));
 const {vertices,buckets}=reliefBatches(g,20);
 const world=vertices.map(v=>v&&({x:v.lon,y:v.lat,z:v.height}));
 let previousBytes=0,indexedBytes=0;
 for(const b of buckets){
  const {positions,indices}=indexedBandGeometry(world,b.faces);
  assert.ok(indices instanceof Uint16Array);
  assert.equal(indices.length,b.faces.length*3);
  let j=0;
  for(const face of b.faces)for(const i of face){
   const k=indices[j++]*3;
   assert.equal(positions[k],world[i].x);
   assert.equal(positions[k+1],world[i].y);
   assert.equal(positions[k+2],world[i].z);
  }
  previousBytes+=b.faces.length*9*8;
  indexedBytes+=positions.byteLength+indices.byteLength;
 }
 assert.ok(indexedBytes<previousBytes*.5);
});
test('indexed geometry selects index width without wrapping at the 16-bit limit',()=>{
 const world=Array.from({length:65538},(_,i)=>({x:i,y:0,z:0}));
 const faces=Array.from({length:21846},(_,i)=>[3*i,3*i+1,3*i+2]);
 const wide=indexedBandGeometry(world,faces);
 assert.ok(wide.indices instanceof Uint32Array);
 assert.equal(wide.indices[65537],65537);
 assert.equal(wide.positions[65537*3],65537);
 const small=indexedBandGeometry(world,faces.slice(0,-1));
 assert.ok(small.indices instanceof Uint16Array);
 assert.equal(small.indices[65534],65534);
});

test('shared topology preserves every signed sample, face order and color band in both rendering paths',()=>{
 for(const [rows,cols,stride] of [[90,180,480],[180,360,240]]){
  const values=Array.from({length:rows*cols},(_,i)=>i%113===0?null:(i*37)%20001-11000);
  const g=parseGlobalGrid(JSON.stringify({format:`gebco-2025-ice-surface-stride${stride}-v1`,rows,cols,values}));
  const expected=[];
  for(let row=0;row<rows-1;row++)for(let col=0;col<cols;col++){
   const a=row*cols+col,b=row*cols+(col+1)%cols,c=a+cols,d=b+cols;
   if([a,b,c,d].some(i=>values[i]===null))continue;
   expected.push([a,b,c],[b,d,c]);
  }
  assert.deepEqual(Array.from(globalFaces(g)),expected);
  const thresholds=[-12000,-6000,-4000,-2000,-500,0,500,1500,3000,5000];
  const bands=thresholds.map(min=>({min,faces:[]}));
  for(const face of expected){
   const z=face.reduce((sum,i)=>sum+values[i],0)/3;
   let i=bands.length-1;while(i>0&&z<bands[i].min)i--;
   bands[i].faces.push(face);
  }
  const expectedBands=bands.filter(x=>x.faces.length);
  for(const ex of [1,20,50]){
   const {vertices,buckets}=reliefBatches(g,ex);
   assert.deepEqual(globalMesh(g,ex).faces,expected);
   assert.deepEqual(buckets.map(({min,faces})=>({min,faces})),expectedBands);
   for(let i=0;i<values.length;i++)assert.deepEqual(vertices[i],values[i]===null?null:{...globalCellCentre(g,i),height:values[i]*ex});
  }
 }
});
