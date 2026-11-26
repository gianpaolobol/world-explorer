// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
const root='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_50m_admin_0_boundary_lines_';
export const boundaryURLs=Object.freeze({land:root+'land.geojson',disputed:root+'disputed_areas.geojson'});
export function lineCollection(data){
 if(data?.type!=='FeatureCollection'||!Array.isArray(data.features)||!data.features.length||data.features.length>10000)throw new Error('Invalid boundary collection');
 const line=coords=>Array.isArray(coords)&&coords.length>=2&&coords.every(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90);
 const features=data.features.map(f=>{
  const g=f?.geometry;
  if(f?.type!=='Feature'||!(g?.type==='LineString'?line(g.coordinates):g?.type==='MultiLineString'&&Array.isArray(g.coordinates)&&g.coordinates.length>0&&g.coordinates.every(line)))throw new Error('Invalid boundary geometry');
  // Do not pass provider-controlled descriptive HTML or style properties into Cesium.
  return {type:'Feature',properties:{},geometry:{type:g.type,coordinates:g.coordinates}};
 });
 return {type:'FeatureCollection',features};
}
export async function fetchBoundaries(fetcher=fetch,signal){
 return Promise.all(Object.values(boundaryURLs).map(async url=>{
  const response=await fetcher(url,{signal,credentials:'omit',referrerPolicy:'no-referrer',redirect:'error'});
  if(!response.ok)throw new Error('Boundary service unavailable');
  return lineCollection(await response.json());
 }));
}
