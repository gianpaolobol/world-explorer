// Copyright 2026 Gian Paolo Franceschini. Original software only; WDI data retain their own terms.
import {countries} from './countries.mjs';
export const YEAR='2024';
export const TERMS='https://data.worldbank.org/summary-terms-of-use';
export const INDICATORS=Object.freeze([
 Object.freeze({id:'SP.POP.TOTL',it:'Popolazione totale',en:'Population, total',unit:'',provider:'UN Population Division; national statistical offices; Eurostat; UN Statistics Division'}),
 Object.freeze({id:'NY.GDP.MKTP.CD',it:'PIL a prezzi correnti',en:'GDP, current prices',unit:'USD',provider:'National statistical organizations / central banks; OECD; World Bank'}),
 Object.freeze({id:'SP.URB.TOTL.IN.ZS',it:'Popolazione urbana',en:'Urban population',unit:'%',provider:'UN Population Division, World Urbanization Prospects'}),
 Object.freeze({id:'AG.LND.FRST.ZS',it:'Superficie forestale (quota delle terre emerse)',en:'Forest area (% of land area)',unit:'%',provider:'FAO, FAOSTAT'})
]);
const codes=new Set(countries.map(x=>x.code));
function rows(payload){
 if(!Array.isArray(payload)||payload.length!==2||!payload[0]||!Array.isArray(payload[1])||Number(payload[0].pages)!==1||Number(payload[0].page)!==1||Number(payload[0].total)!==payload[1].length)throw new Error('Incomplete WDI response');
 return payload[1];
}
export function countryMap(payload){
 const map=new Map();
 for(const c of rows(payload)){
  if(!codes.has(c?.iso2Code)||c?.region?.id==='NA'||c?.region?.value==='Aggregates'||!c?.region?.id||! /^[A-Z]{3}$/.test(c?.id??''))continue;
  if(map.has(c.iso2Code)||[...map.values()].includes(c.id))throw new Error('Duplicate WDI country');
  map.set(c.iso2Code,c.id);
 }
 if(!map.size)throw new Error('No WDI country metadata');
 return map;
}
function validValue(id,v){
 if(typeof v!=='number'||!Number.isFinite(v)||v<0)return false;
 if(id==='SP.POP.TOTL')return Number.isSafeInteger(v);
 if(id.endsWith('.ZS'))return v<=100;
 return true;
}
export function parseIndicator(payload,id,map){
 if(!INDICATORS.some(x=>x.id===id))throw new Error('Unknown indicator');
 const values={},seen=new Set();
 for(const row of rows(payload)){
  if(row?.indicator?.id!==id||row?.date!==YEAR)throw new Error('Wrong indicator/year');
  const code=row.country?.id;
  if(!map.has(code))continue;
  if(row.countryiso3code!==map.get(code))throw new Error('Country code mismatch');
  if(seen.has(code))throw new Error('Duplicate WDI observation');
  seen.add(code);
  if(row.value===null)continue;
  if(!validValue(id,row.value))throw new Error('Invalid WDI value');
  values[code]=row.value;
 }
 if(!Object.keys(values).length)throw new Error('No observations');
 return values;
}
export function statisticsFor(snapshot,code,locale='it'){
 if(!codes.has(code)||!snapshot||snapshot.year!==YEAR||typeof snapshot.retrieved!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.retrieved))return [];
 const language=locale==='it'?'it':'en';
 return INDICATORS.flatMap(i=>{
  const v=snapshot.values?.[i.id]?.[code];if(!validValue(i.id,v))return [];
  const nf=new Intl.NumberFormat(language,{maximumFractionDigits:i.unit==='%'?2:0});
  return [{id:i.id,language,label:i[language],value:nf.format(v)+(i.unit?' '+i.unit:''),year:YEAR,retrieved:snapshot.retrieved,source:'https://data.worldbank.org/indicator/'+i.id,attribution:'World Bank: World Development Indicators: '+i.provider}];
 });
}
