// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {globalMesh,globalCellCentre} from './numeric-relief.mjs';

// Build actual Earth-fixed WGS84 geometry from the imported signed grid.
// One solid-color batch per elevation band; no fictitious samples or polar caps.
const bands=[[-12000,'#102c5b'],[-6000,'#16437b'],[-4000,'#205b99'],[-2000,'#327eb2'],[-500,'#50a6c5'],[0,'#54885c'],[500,'#789c62'],[1500,'#ad9a6b'],[3000,'#987d62'],[5000,'#e2ded6']];
export function reliefBatches(g,ex){
 const mesh=globalMesh(g,ex);
 const vertices=mesh.vertices.map((v,i)=>v&&({
  ...globalCellCentre(g,i),
  height:v.height*ex
 }));
 const buckets=bands.map(([min,color])=>({min,color,faces:[]}));
 for(const face of mesh.faces){
  const z=face.reduce((sum,i)=>sum+mesh.vertices[i].height,0)/3;
  let b=buckets.length-1;while(b>0&&z<buckets[b].min)b--;
  buckets[b].faces.push(face);
 }
 return {vertices,buckets:buckets.filter(b=>b.faces.length)};
}
// Share vertices within a color band while preserving the exact triangle order.
export function indexedBandGeometry(world,faces){
 const remap=new Int32Array(world.length);remap.fill(-1);
 const used=[],indices32=new Uint32Array(faces.length*3);
 let j=0;
 for(const face of faces)for(const i of face){
  if(remap[i]===-1){remap[i]=used.length;used.push(i);}
  indices32[j++]=remap[i];
 }
 const positions=new Float64Array(used.length*3);
 for(let k=0;k<used.length;k++){
  const p=world[used[k]];positions[k*3]=p.x;positions[k*3+1]=p.y;positions[k*3+2]=p.z;
 }
 return {positions,indices:used.length<=65536?new Uint16Array(indices32):indices32};
}
export function createReliefPrimitive(C,g,ex){
 const {vertices,buckets}=reliefBatches(g,ex);
 const world=vertices.map(v=>v&&C.Cartesian3.fromDegrees(v.lon,v.lat,v.height));
 const geometryInstances=buckets.map(b=>{
  const {positions,indices}=indexedBandGeometry(world,b.faces);
  return new C.GeometryInstance({
   geometry:new C.Geometry({
    attributes:{position:new C.GeometryAttribute({componentDatatype:C.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:positions})},
    indices,primitiveType:C.PrimitiveType.TRIANGLES,boundingSphere:C.BoundingSphere.fromVertices(positions)
   }),
   attributes:{color:C.ColorGeometryInstanceAttribute.fromColor(C.Color.fromCssColorString(b.color))}
  });
 });
 if(!geometryInstances.length)throw new Error('No complete cells');
 return new C.Primitive({geometryInstances,appearance:new C.PerInstanceColorAppearance({flat:true,translucent:false,closed:false}),asynchronous:false,allowPicking:false});
}
export function safeReliefHeight(normalHeight,ex){
 return Math.max(normalHeight,100000+10000*ex);
}
