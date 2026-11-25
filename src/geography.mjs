// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
export const GEBCO = Object.freeze({
 url:'https://wms.gebco.net/2025/mapserv?',
 layers:'gebco_2025',
 parameters:Object.freeze({version:'1.3.0',crs:'EPSG:4326',format:'image/jpeg',transparent:false}),
 credit:'Imagery reproduced from the GEBCO_2025 Grid, www.gebco.net'
});
export const ESRI_URL='https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer';
export function bathymetryProvider(C){
 return new C.WebMapServiceImageryProvider({...GEBCO,parameters:{...GEBCO.parameters},tilingScheme:new C.GeographicTilingScheme(),maximumLevel:8});
}
export function elevationLabel(height,locale='it'){
 if(!Number.isFinite(height))return null;
 return new Intl.NumberFormat(locale,{maximumFractionDigits:0}).format(height)+' m';
}
export async function sampleElevation(C,provider,lon,lat){
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lon)>180||Math.abs(lat)>90)throw new RangeError('Invalid coordinates');
 if(!provider||provider instanceof C.EllipsoidTerrainProvider)return null;
 const positions=[C.Cartographic.fromDegrees(lon,lat)];
 // Explicit resolution: provider availability is not guaranteed for ArcGIS.
 const result=await C.sampleTerrain(provider,10,positions);
 return Number.isFinite(result[0]?.height)?result[0].height:null;
}
