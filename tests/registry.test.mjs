import test from 'node:test';import assert from 'node:assert/strict';
import {countries,languages,countryName} from '../src/countries.mjs';
test('195 unique alpha-2 codes including observers',()=>{assert.equal(countries.length,195);assert.equal(new Set(countries.map(c=>c.code)).size,195);assert.ok(countries.every(c=>/^[A-Z]{2}$/.test(c.code)));assert.ok(countries.some(c=>c.code==='VA'));assert.ok(countries.some(c=>c.code==='PS'));});
test('valid finite geographic fields',()=>{for(const c of countries){assert.ok(Number.isFinite(c.lat)&&Math.abs(c.lat)<=90);assert.ok(Number.isFinite(c.lon)&&Math.abs(c.lon)<=180);assert.ok(Number.isFinite(c.area)&&c.area>0);assert.equal(c.status,'unreviewed');}});
test('20 language names',()=>{assert.equal(languages.length,20);for(const lang of languages)for(const c of countries)assert.ok(countryName(c.code,lang));});
