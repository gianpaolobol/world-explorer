// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {globalMesh,GLOBAL_COLS,GLOBAL_FIRST,GLOBAL_STRIDE} from './numeric-relief.mjs';

// Build actual Earth-fixed WGS84 geometry from the imported signed grid.
// One solid-color batch per elevation band; no fictitious samples or polar caps.
const bands=[[-12000,'#102c5b'],[-6000,'#16437b'],[-4000,'#205b99'],[-2000,'#327eb2'],[-500,'#50a6c5'],[0,'#54885c'],[500,'#789c62'],[1500,'#ad9a6b'],[3000,'#987d62'],[5000,'#e2ded6']];
export function reliefBatches(g,ex){
 const mesh=globalMesh(g,ex);
 const vertices=mesh.vertices.map((v,i)=>v&&({
  lon:-180+(GLOBAL_FIRST+(i%GLOBAL_COLS)*GLOBAL_STRIDE+.5)/240,
  lat:-90+(GLOBAL_FIRST+Math.floor(i/GLOBAL_COLS)*GLOBAL_STRIDE+.5)/240,
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
export function createReliefPrimitive(C,g,ex){
 const {vertices,buckets}=reliefBatches(g,ex);
 const world=vertices.map(v=>v&&C.Cartesian3.fromDegrees(v.lon,v.lat,v.height));
 const geometryInstances=buckets.map(b=>{
  const positions=new Float64Array(b.faces.length*9);
  let j=0;
  for(const face of b.faces)for(const i of face){
   const p=world[i];positions[j++]=p.x;positions[j++]=p.y;positions[j++]=p.z;
  }
  return new C.GeometryInstance({
   geometry:new C.Geometry({
    attributes:{position:new C.GeometryAttribute({componentDatatype:C.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:positions})},
    primitiveType:C.PrimitiveType.TRIANGLES,boundingSphere:C.BoundingSphere.fromVertices(positions)
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
