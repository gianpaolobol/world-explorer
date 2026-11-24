import test from 'node:test';import assert from 'node:assert/strict';import {wrapIndex,chooseDestination,cameraHeight} from '../src/travel.mjs';
test('wrapping negative and large indexes',()=>{assert.equal(wrapIndex(-1,195),194);assert.equal(wrapIndex(391,195),1);assert.throws(()=>wrapIndex(1,0));});
test('avoid current and favor unvisited',()=>{const a=[{code:'IT'},{code:'JP'},{code:'CA'}];assert.equal(chooseDestination(a,{JP:2},'IT',()=>0).code,'CA');assert.equal(chooseDestination([],{},null),null);assert.equal(chooseDestination([a[0]],{},'IT').code,'IT');});
test('bounded camera altitude',()=>{assert.equal(cameraHeight(.49),18000);assert.equal(cameraHeight(17124442),9500000);assert.ok(cameraHeight(300000)>18000);});
