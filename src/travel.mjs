// Copyright 2026 Gian Paolo Franceschini.
export function wrapIndex(index,length){
 if(!Number.isInteger(index)||!Number.isInteger(length)||length<1)throw new RangeError('Invalid index or length');
 return ((index%length)+length)%length;
}
export function chooseDestination(items,visits,current,random=Math.random){
 const candidates=items.filter(x=>x.code!==current);
 const pool=candidates.length?candidates:items;
 if(!pool.length)return null;
 const count=x=>Number.isFinite(visits[x.code])?visits[x.code]:0;
 const min=Math.min(...pool.map(count));
 const tied=pool.filter(x=>count(x)===min);
 return tied[Math.min(tied.length-1,Math.max(0,Math.floor(random()*tied.length)))];
}
export function cameraHeight(area){return Math.max(18000,Math.min(9500000,Math.sqrt(Math.max(0,area))*2300));}
