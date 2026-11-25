import test from 'node:test';
import assert from 'node:assert/strict';
import {GEBCO,bathymetryProvider,sampleElevation,elevationLabel} from '../src/geography.mjs';
class Ellipsoid{};class Geo{};class WMS{constructor(o){this.options=o;}}
const C={EllipsoidTerrainProvider:Ellipsoid,GeographicTilingScheme:Geo,WebMapServiceImageryProvider:WMS,Cartographic:{fromDegrees:(lon,lat)=>({lon,lat})},sampleTerrain:async(p,l,a)=>{assert.equal(l,10);return [{...a[0],height:-1234}]}};
test('pinned bathymetry source and attribution',()=>{const p=bathymetryProvider(C).options;assert.equal(p.layers,'gebco_2025');assert.equal(p.parameters.crs,'EPSG:4326');assert.match(p.credit,/GEBCO_2025/);assert.equal(p.maximumLevel,8)});
test('ellipsoid is not reported as elevation',async()=>assert.equal(await sampleElevation(C,new Ellipsoid(),0,0),null));
test('negative heights are not clamped',async()=>{assert.equal(await sampleElevation(C,{},12,43),-1234);assert.equal(elevationLabel(-1234,'en'),'-1,234 m')});
test('invalid coordinates rejected',async()=>assert.rejects(sampleElevation(C,{},181,0),RangeError));
test('missing sample remains unavailable',async()=>assert.equal(await sampleElevation({...C,sampleTerrain:async()=>[{}]}, {},0,0),null));
