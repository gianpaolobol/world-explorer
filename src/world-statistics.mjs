// Copyright 2026 Gian Paolo Franceschini. Original software only; WDI data retain their own terms.
import {countries} from './countries.mjs';
export const YEAR='2024';
export const TERMS='https://data.worldbank.org/summary-terms-of-use';
export const INDICATORS=Object.freeze([
 Object.freeze({id:'SP.POP.TOTL',it:'Popolazione totale',en:'Population, total',unit:'',provider:'UN Population Division; national statistical offices; Eurostat; UN Statistics Division'}),
 Object.freeze({id:'NY.GDP.MKTP.CD',it:'PIL a prezzi correnti',en:'GDP, current prices',unit:'USD',provider:'National statistical organizations / central banks; OECD; World Bank'}),
 Object.freeze({id:'SP.URB.TOTL.IN.ZS',it:'Popolazione urbana',en:'Urban population',unit:'%',provider:'UN Population Division, World Urbanization Prospects'}),
 Object.freeze({id:'AG.LND.FRST.ZS',it:'Superficie forestale (quota delle terre emerse)',en:'Forest area (% of land area)',unit:'%',provider:'FAO, FAOSTAT'}),
 Object.freeze({id:'AG.LND.TOTL.K2',it:'Superficie delle terre emerse',en:'Land area',unit:'km²',digits:2,provider:'FAO, FAOSTAT'}),
 Object.freeze({id:'EN.POP.DNST',it:'Densità di popolazione',en:'Population density',unit:'/km²',digits:2,provider:'FAO and World Bank population estimates'}),
 Object.freeze({id:'AG.LND.AGRI.ZS',it:'Superficie agricola (quota delle terre emerse)',en:'Agricultural land (% of land area)',unit:'%',provider:'FAO, FAOSTAT'}),
 Object.freeze({id:'AG.LND.ARBL.ZS',it:'Superficie arabile (quota delle terre emerse)',en:'Arable land (% of land area)',unit:'%',provider:'FAO, FAOSTAT'})
]);
// Original translations of indicator names, not additional data observations.
const localizedLabels=Object.freeze({
 fr:['Population totale','PIB à prix courants','Population urbaine','Superficie forestière (% des terres émergées)',"Superficie des terres émergées","Densité de population","Terres agricoles (% des terres émergées)","Terres arables (% des terres émergées)"],
 es:['Población total','PIB a precios corrientes','Población urbana','Superficie forestal (% de la superficie terrestre)',"Superficie terrestre","Densidad de población","Tierras agrícolas (% de la superficie terrestre)","Tierras cultivables (% de la superficie terrestre)"],
 de:['Gesamtbevölkerung','BIP zu jeweiligen Preisen','Stadtbevölkerung','Waldfläche (% der Landfläche)',"Landfläche","Bevölkerungsdichte","Landwirtschaftliche Fläche (% der Landfläche)","Ackerland (% der Landfläche)"],
 pt:['População total','PIB a preços correntes','População urbana','Área florestal (% da área terrestre)',"Área terrestre","Densidade populacional","Área agrícola (% da área terrestre)","Terra arável (% da área terrestre)"]
});
export const statisticsLanguages=Object.freeze(['it','en',...Object.keys(localizedLabels)]);
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
 const language=statisticsLanguages.includes(locale)?locale:'en';
 return INDICATORS.flatMap((i,index)=>{
  const v=snapshot.values?.[i.id]?.[code];if(!validValue(i.id,v))return [];
  const nf=new Intl.NumberFormat(language,{useGrouping:'always',maximumFractionDigits:i.digits??(i.unit==='%'?2:0)});
  return [{id:i.id,language,label:localizedLabels[language]?.[index]??i[language],value:nf.format(v)+(i.unit?' '+i.unit:''),year:YEAR,retrieved:snapshot.retrieved,source:'https://data.worldbank.org/indicator/'+i.id,attribution:'World Bank: World Development Indicators: '+i.provider}];
 });
}

export function statisticsEvidence(snapshot,code,locale){
 return statisticsFor(snapshot,code,locale).map(x=>({
  id:'wdi-'+x.id,language:x.language,source:x.source,label:x.attribution,
  text:x.label+' ('+x.year+'): '+x.value+'.',period:x.year,checked:x.retrieved,
  review:'source-checked-not-independent'
 }));
}
const queries={
 it:{'popolazione':'SP.POP.TOTL','qual è la popolazione':'SP.POP.TOTL','popolazione totale':'SP.POP.TOTL','pil':'NY.GDP.MKTP.CD','popolazione urbana':'SP.URB.TOTL.IN.ZS','superficie forestale':'AG.LND.FRST.ZS',"superficie delle terre emerse":"AG.LND.TOTL.K2","densità di popolazione":"EN.POP.DNST","superficie agricola":"AG.LND.AGRI.ZS","superficie arabile":"AG.LND.ARBL.ZS"},
 en:{'population':'SP.POP.TOTL','what is the population':'SP.POP.TOTL','total population':'SP.POP.TOTL','gdp':'NY.GDP.MKTP.CD','urban population':'SP.URB.TOTL.IN.ZS','forest area':'AG.LND.FRST.ZS',"land area":"AG.LND.TOTL.K2","population density":"EN.POP.DNST","agricultural land":"AG.LND.AGRI.ZS","arable land":"AG.LND.ARBL.ZS"},
 fr:{'population':'SP.POP.TOTL','population totale':'SP.POP.TOTL','pib':'NY.GDP.MKTP.CD','population urbaine':'SP.URB.TOTL.IN.ZS','superficie forestière':'AG.LND.FRST.ZS',"superficie des terres émergées":"AG.LND.TOTL.K2","densité de population":"EN.POP.DNST","terres agricoles":"AG.LND.AGRI.ZS","terres arables":"AG.LND.ARBL.ZS"},
 es:{'población':'SP.POP.TOTL','población total':'SP.POP.TOTL','pib':'NY.GDP.MKTP.CD','población urbana':'SP.URB.TOTL.IN.ZS','superficie forestal':'AG.LND.FRST.ZS',"superficie terrestre":"AG.LND.TOTL.K2","densidad de población":"EN.POP.DNST","tierras agrícolas":"AG.LND.AGRI.ZS","tierras cultivables":"AG.LND.ARBL.ZS"},
 de:{'bevölkerung':'SP.POP.TOTL','gesamtbevölkerung':'SP.POP.TOTL','bip':'NY.GDP.MKTP.CD','stadtbevölkerung':'SP.URB.TOTL.IN.ZS','waldfläche':'AG.LND.FRST.ZS',"landfläche":"AG.LND.TOTL.K2","bevölkerungsdichte":"EN.POP.DNST","landwirtschaftliche fläche":"AG.LND.AGRI.ZS","ackerland":"AG.LND.ARBL.ZS"},
 pt:{'população':'SP.POP.TOTL','população total':'SP.POP.TOTL','pib':'NY.GDP.MKTP.CD','população urbana':'SP.URB.TOTL.IN.ZS','área florestal':'AG.LND.FRST.ZS',"área terrestre":"AG.LND.TOTL.K2","densidade populacional":"EN.POP.DNST","área agrícola":"AG.LND.AGRI.ZS","terra arável":"AG.LND.ARBL.ZS"}
};
export function statisticsSelection(snapshot,input){
 if(!Object.hasOwn(queries,input.language))return [];
 let q=input.question.normalize('NFC').toLowerCase().trim().replace(/[?!.]+$/u,'').trim();
 // Explicit year queries are supported only for the exact snapshot year.
 const dated=q.match(/^(.*?)\s+(\d{4})$/u);
 if(dated){if(dated[2]!==YEAR)return [];q=dated[1].trim();}
 const aliases=queries[input.language];
 if(!Object.hasOwn(aliases,q))return [];
 const id='wdi-'+aliases[q];
 return statisticsEvidence(snapshot,input.code,input.language).filter(x=>x.id===id).map(x=>x.id);
}
