// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Regional GEBCO 2025 ice-surface ASCII grid, geographic lon/lat, metres.
export const MAX_GRID_BYTES=1024*1024;
export const MAX_GRID_SIDE=128;
export const GEBCO_CREDIT='GEBCO Compilation Group (2025), GEBCO 2025 Grid, doi:10.5285/37c52e96-24ea-67ce-e063-7086abc05f29';
export const GEBCO_DOI='https://doi.org/10.5285/37c52e96-24ea-67ce-e063-7086abc05f29';
const headerKeys=new Set(['ncols','nrows','xllcorner','yllcorner','xllcenter','yllcenter','cellsize','nodata_value']);
function number(token){
 if(typeof token!=='string'||!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(token))throw new Error('Invalid numeric token');
 const n=Number(token);if(!Number.isFinite(n))throw new Error('Nonfinite value');return n;
}
export function parseRegionalGrid(text){
 if(typeof text!=='string'||text.length>MAX_GRID_BYTES)throw new Error('Grid too large');
 const tokens=text.trim().split(/\s+/),h=Object.create(null);let i=0;
 while(i<tokens.length&&headerKeys.has(tokens[i].toLowerCase())){
  const k=tokens[i++].toLowerCase();if(Object.hasOwn(h,k))throw new Error('Duplicate header');
  h[k]=number(tokens[i++]);
 }
 const cols=h.ncols,rows=h.nrows,step=h.cellsize;
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<2||rows<2||cols>MAX_GRID_SIDE||rows>MAX_GRID_SIDE)throw new Error('Expected 2–128 rows and columns');
 if(!Number.isFinite(step)||Math.abs(step-1/240)>1e-8)throw new Error('Expected GEBCO 15 arc-second geographic cells');
 const corner=Object.hasOwn(h,'xllcorner')&&Object.hasOwn(h,'yllcorner')&&!Object.hasOwn(h,'xllcenter')&&!Object.hasOwn(h,'yllcenter');
 const center=Object.hasOwn(h,'xllcenter')&&Object.hasOwn(h,'yllcenter')&&!Object.hasOwn(h,'xllcorner')&&!Object.hasOwn(h,'yllcorner');
 if(!corner&&!center)throw new Error('Invalid origin');
 const west=corner?h.xllcorner:h.xllcenter-step/2,south=corner?h.yllcorner:h.yllcenter-step/2;
 const east=west+cols*step,north=south+rows*step;
 if(west < -180-1e-7||east>180+1e-7||south < -85||north>85)throw new Error('Outside regional projection domain');
 if(tokens.length-i!==rows*cols)throw new Error('Unexpected cell count');
 const missing=h.nodata_value??-9999,values=new Array(rows*cols);let min=Infinity,max=-Infinity,count=0;
 for(let j=0;j<values.length;j++){
  const z=number(tokens[i+j]);if(z===missing){values[j]=null;continue;}
  if(z < -12000||z>10000)throw new Error('Elevation out of supported range');
  values[j]=z;min=Math.min(min,z);max=Math.max(max,z);count++;
 }
 if(!count)throw new Error('No valid cells');
 return {cols,rows,step,west,south,east,north,values,min,max,count};
}
// Row zero is north. Mesh vertices are cell centres, never the outer corners.
// Local equirectangular metric approximation; no interpolation across missing vertices.
export function gridMesh(g,exaggeration=1){
 if(![1,5,20].includes(exaggeration))throw new Error('Invalid exaggeration');
 const lat=(g.south+g.north)/2*Math.PI/180,dy=6371008.8*g.step*Math.PI/180,dx=dy*Math.cos(lat);
 const vertices=g.values.map((z,i)=>z===null?null:{x:(i%g.cols-(g.cols-1)/2)*dx,y:((g.rows-1)/2-Math.floor(i/g.cols))*dy,z:z*exaggeration,height:z});
 const faces=[];
 for(let r=0;r<g.rows-1;r++)for(let c=0;c<g.cols-1;c++){
  const a=r*g.cols+c,b=a+1,d=a+g.cols,e=d+1;
  // Omit the whole quad if any corner is missing; do not bridge nodata.
  if([a,b,d,e].some(i=>vertices[i]===null))continue;
  faces.push([a,d,b],[b,d,e]);
 }
 return {vertices,faces,dx,dy,exaggeration};
}
export function projectMesh(mesh){
 const q=Math.SQRT1_2,s=0.5,c=Math.sqrt(3)/2;
 const vertices=mesh.vertices.map(v=>{
  if(!v)return null;
  const toward=(v.x-v.y)*q;
  return {x:(v.x+v.y)*q,y:toward*s-v.z*c,depth:toward*c+v.z*s,height:v.height};
 });
 const triangles=mesh.faces.map(indices=>{
  const points=indices.map(i=>vertices[i]);
  return {points,depth:points.reduce((a,p)=>a+p.depth,0)/3,height:points.reduce((a,p)=>a+p.height,0)/3};
 }).sort((a,b)=>a.depth-b.depth);
 return triangles;
}

 // Coarse local GEBCO preview: sample native pixel centres at fixed stride 480.
 // Not a terrain provider or a survey-grade model. No inferred polar cap values.
export const GLOBAL_ROWS=90,GLOBAL_COLS=180,GLOBAL_STRIDE=480,GLOBAL_FIRST=239,GLOBAL_MAX_BYTES=512*1024;
// Two bounded native-centre sampling layouts; never infer a format from file size.
const GLOBAL_LAYOUTS=Object.freeze({
 'gebco-2025-ice-surface-stride480-v1':Object.freeze({rows:90,cols:180,stride:480,first:239}),
 'gebco-2025-ice-surface-stride240-v1':Object.freeze({rows:180,cols:360,stride:240,first:119})
});
export function globalCellCentre(g,i){
 const {cols,stride,first}=g;
 return {lon:-180+(first+(i%cols)*stride+.5)/240,lat:-90+(first+Math.floor(i/cols)*stride+.5)/240};
}
export function parseGlobalGrid(text){
 if(typeof text!=='string'||text.length>GLOBAL_MAX_BYTES)throw new Error('Global grid too large');
 const g=JSON.parse(text);
 const layout=g&&Object.hasOwn(GLOBAL_LAYOUTS,g.format)?GLOBAL_LAYOUTS[g.format]:null;
 if(!layout||g.rows!==layout.rows||g.cols!==layout.cols||
 !Array.isArray(g.values)||g.values.length!==layout.rows*layout.cols)throw new Error('Invalid global grid format');
 let min=Infinity,max=-Infinity,count=0;
 for(const z of g.values){
  if(z===null)continue;
  if(!Number.isInteger(z)||z< -12000||z>10000)throw new Error('Invalid global elevation');
  min=Math.min(min,z);max=Math.max(max,z);count++;
 }
 if(!count)throw new Error('No valid global samples');
 return {...layout,resolution:layout.stride/240,values:g.values,min,max,count};
}
// Strip arbitrary metadata before a configured local grid is served to the browser.
export function canonicalGlobalGrid(text){
 const grid=parseGlobalGrid(text);
 const format=Object.keys(GLOBAL_LAYOUTS).find(key=>GLOBAL_LAYOUTS[key].stride===grid.stride);
 return {format,rows:grid.rows,cols:grid.cols,values:grid.values};
}
export function validateGlobalExaggeration(exaggeration){
 if(![1,20,50].includes(exaggeration))throw new Error('Invalid global exaggeration');
}
// Shared native-grid topology for Canvas and Cesium. No spherical projection
// or allocation of intermediate vertices is required to enumerate the faces.
export function* globalFaces(g){
 for(let row=0;row<g.rows-1;row++)for(let col=0;col<g.cols;col++){
  const a=row*g.cols+col,b=row*g.cols+(col+1)%g.cols,c=a+g.cols,d=b+g.cols;
  if(g.values[a]===null||g.values[b]===null||g.values[c]===null||g.values[d]===null)continue;
  yield [a,b,c];yield [b,d,c];
 }
}
export function globalMesh(g,exaggeration=1){
 validateGlobalExaggeration(exaggeration);
 const vertices=g.values.map((z,i)=>{
  if(z===null)return null;
  const centre=globalCellCentre(g,i),lat=centre.lat*Math.PI/180,lon=centre.lon*Math.PI/180;
  const radius=1+z*exaggeration/6371008.8;
  return {x:radius*Math.cos(lat)*Math.cos(lon),y:radius*Math.cos(lat)*Math.sin(lon),z:radius*Math.sin(lat),height:z};
 });
 // Keep actual data gaps open; close the longitude seam, not the poles.
 return {vertices,faces:Array.from(globalFaces(g))};
}
export function projectGlobalMesh(mesh,longitude=0,latitude=0){
 if(!Number.isFinite(longitude)||Math.abs(longitude)>180||!Number.isFinite(latitude)||Math.abs(latitude)>90)throw new Error('Invalid view');
 const l=longitude*Math.PI/180,p=latitude*Math.PI/180,cl=Math.cos(l),sl=Math.sin(l),cp=Math.cos(p),sp=Math.sin(p);
 const vertices=mesh.vertices.map(v=>{
  if(!v)return null;
  const radial=v.x*cl+v.y*sl;
  return {x:-v.x*sl+v.y*cl,y:-radial*sp+v.z*cp,depth:radial*cp+v.z*sp,height:v.height};
 });
 const triangles=[];
 for(const f of mesh.faces){
  const points=f.map(i=>vertices[i]),[a,b,c]=points;
  // Back-face culling in projected east/north coordinates.
  const cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  if(cross<=0)continue;
  triangles.push({points,depth:(a.depth+b.depth+c.depth)/3,height:(a.height+b.height+c.height)/3});
 }
 return triangles.sort((a,b)=>a.depth-b.depth);
}

 // Report actual cell values, never interpolated or vertically exaggerated.
function coordinateCheck(lon,lat){
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)throw new RangeError('Invalid coordinates');
}
export function regionalSample(g,lon,lat){
 coordinateCheck(lon,lat);
 if(!g||lon<g.west||lon>=g.east||lat<g.south||lat>=g.north)return null;
 const col=Math.min(g.cols-1,Math.floor((lon-g.west)/g.step));
 const row=g.rows-1-Math.min(g.rows-1,Math.floor((lat-g.south)/g.step));
 const height=g.values[row*g.cols+col];
 if(!Number.isFinite(height))return null;
 return {height,lon:g.west+(col+.5)*g.step,lat:g.south+(g.rows-row-.5)*g.step,resolution:g.step};
}
export function globalSample(g,lon,lat){
 coordinateCheck(lon,lat);
 if(!g)return null;
 const step=g.resolution,first=(g.first+.5)/240;
 const south=-90+first,north=south+(g.rows-1)*step;
 // No extrapolation into the unrepresented polar caps.
 if(!g||lat<south||lat>north)return null;
 const row=Math.max(0,Math.min(g.rows-1,Math.round((lat-south)/step)));
 const west=-180+first;
 const col=((Math.round((lon-west)/step)%g.cols)+g.cols)%g.cols;
 const height=g.values[row*g.cols+col];
 if(!Number.isFinite(height))return null;
 return {height,lon:west+col*step,lat:south+row*step,resolution:step};
}

 // Local files are user supplied, not authenticated source evidence. Keep this
 // optional spoken observation separate from the verified editorial corpus.
const reliefSpeech=Object.freeze({
 it:(z,res)=>`Nel file locale non autenticato dichiarato GEBCO 2025, il campione ${res} vicino al punto di vista vale ${z} metri, senza esagerazione verticale. Non è la quota della capitale né un dato per navigazione.`,
 en:(z,res)=>`In the unverified local file labelled GEBCO 2025, the ${res} sample near the camera target is ${z} metres, without vertical exaggeration. This is not the capital's elevation or navigation data.`,
 fr:(z,res)=>`Dans le fichier local non authentifié indiqué GEBCO 2025, l’échantillon ${res} près du point de vue vaut ${z} mètres, sans exagération verticale. Ce n’est ni l’altitude de la capitale ni une donnée de navigation.`,
 es:(z,res)=>`En el archivo local no autenticado identificado como GEBCO 2025, la muestra ${res} cerca del punto de cámara vale ${z} metros, sin exageración vertical. No es la altitud de la capital ni un dato de navegación.`,
 de:(z,res)=>`In der nicht authentifizierten lokalen Datei mit der Bezeichnung GEBCO 2025 beträgt der ${res} Messwert nahe dem Kameraziel ${z} Meter, ohne vertikale Überhöhung. Dies ist weder die Höhe der Hauptstadt noch eine Navigationsangabe.`,
 pt:(z,res)=>`No ficheiro local não autenticado identificado como GEBCO 2025, a amostra ${res} perto do alvo da câmara vale ${z} metros, sem exagero vertical. Não é a altitude da capital nem um dado de navegação.`
});
const resolutionSpeech=Object.freeze({
 it:['regionale a 15 secondi d’arco','globale a 2 gradi'],
 en:['regional 15 arc-second','global 2-degree'],
 fr:['régional à 15 secondes d’arc','mondial à 2 degrés'],
 es:['regional de 15 segundos de arco','global de 2 grados'],
 de:['regionale 15-Bogensekunden','globale 2-Grad'],
 pt:['regional de 15 segundos de arco','global de 2 graus']
});
export function reliefNarration(regional,global,lon,lat,locale){
 if(!Object.hasOwn(reliefSpeech,locale))return null;
 const native=regionalSample(regional,lon,lat),sample=native??globalSample(global,lon,lat);
 if(!sample)return null;
 return {text:reliefSpeech[locale](new Intl.NumberFormat(locale,{maximumFractionDigits:3}).format(sample.height),native?resolutionSpeech[locale][0]:resolutionSpeech[locale][1].replace('2',String(sample.resolution))),source:GEBCO_DOI,sample};
}
