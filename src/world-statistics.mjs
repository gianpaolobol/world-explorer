// Copyright 2026 Gian Paolo Franceschini. Original software only; WDI data retain their own terms.
import {countries} from './countries.mjs';
export const YEAR='2024';
export const TERMS='https://data.worldbank.org/summary-terms-of-use';
// Protected Planet series excluded from acquisition and answers pending written permission; see docs/SOURCES.md.
export const INDICATORS=Object.freeze([
 Object.freeze({id:'SP.POP.TOTL',it:'Popolazione totale',en:'Population, total',unit:'',provider:'UN Population Division; national statistical offices; Eurostat; UN Statistics Division'}),
 Object.freeze({id:'NY.GDP.MKTP.CD',it:'PIL a prezzi correnti',en:'GDP, current prices',unit:'USD',provider:'National statistical organizations / central banks; OECD; World Bank'}),
 Object.freeze({id:'SP.URB.TOTL.IN.ZS',it:'Popolazione urbana',en:'Urban population',unit:'%',provider:'UN Population Division, World Urbanization Prospects'}),
 Object.freeze({id:'AG.LND.FRST.ZS',it:'Superficie forestale (quota delle terre emerse)',en:'Forest area (% of land area)',unit:'%',provider:'FAO, FAOSTAT'}),
 Object.freeze({id:'AG.LND.TOTL.K2',it:'Superficie delle terre emerse',en:'Land area',unit:'km²',digits:2,provider:'FAO, FAOSTAT'}),
 Object.freeze({id:'EN.POP.DNST',it:'Densità di popolazione',en:'Population density',unit:'/km²',digits:2,provider:'FAO and World Bank population estimates'}),
 Object.freeze({id:'AG.LND.AGRI.ZS',it:'Superficie agricola (quota delle terre emerse)',en:'Agricultural land (% of land area)',unit:'%',provider:'FAO, FAOSTAT'}),
 Object.freeze({id:'AG.LND.ARBL.ZS',it:'Superficie arabile (quota delle terre emerse)',en:'Arable land (% of land area)',unit:'%',provider:'FAO, FAOSTAT'}),
 Object.freeze({"id":"AG.SRF.TOTL.K2","it":"Superficie totale (terre e acque interne)","en":"Surface area (land and inland water)","unit":"km²","digits":2,"provider":"FAO, FAOSTAT"}),
 Object.freeze({"id":"SP.RUR.TOTL.ZS","it":"Popolazione rurale (% del totale)","en":"Rural population (% of total)","unit":"%","provider":"UN Population Division, World Urbanization Prospects; World Bank estimates"}),
 Object.freeze({"id":"NY.GDP.PCAP.CD","it":"PIL pro capite a prezzi correnti","en":"GDP per capita, current prices","unit":"USD","digits":2,"provider":"National statistical organizations / central banks; OECD; World Bank"}),
 Object.freeze({"id":"SP.DYN.LE00.IN","it":"Speranza di vita alla nascita (anni)","en":"Life expectancy at birth (years)","unit":"","digits":2,"provider":"UN Population Division, World Population Prospects; national statistical offices; Eurostat"}),
 Object.freeze({"id":"AG.LND.PRCP.MM","year":"2022","it":"Precipitazione media annua di lungo periodo","en":"Long-term average annual precipitation","unit":"mm/yr","digits":2,"provider":"FAO, FAOSTAT"}),
 Object.freeze({"id":"ER.H2O.INTR.PC","year":"2022","it":"Risorse idriche interne rinnovabili pro capite","en":"Renewable internal freshwater resources per capita","unit":"m³/yr","digits":2,"provider":"FAO, AQUASTAT; World Bank population estimates"})
]);
export const indicatorYear=id=>INDICATORS.find(i=>i.id===id)?.year??YEAR;
// Original translations of indicator names, not additional data observations.
const localizedLabels=Object.freeze({
 fr:['Population totale','PIB à prix courants','Population urbaine','Superficie forestière (% des terres émergées)',"Superficie des terres émergées","Densité de population","Terres agricoles (% des terres émergées)","Terres arables (% des terres émergées)","Superficie totale (terres et eaux intérieures)","Population rurale (% du total)","PIB par habitant à prix courants","Espérance de vie à la naissance (ans)","Précipitations annuelles moyennes de longue durée","Ressources internes renouvelables en eau douce par habitant"],
 es:['Población total','PIB a precios corrientes','Población urbana','Superficie forestal (% de la superficie terrestre)',"Superficie terrestre","Densidad de población","Tierras agrícolas (% de la superficie terrestre)","Tierras cultivables (% de la superficie terrestre)","Superficie total (tierra y aguas interiores)","Población rural (% del total)","PIB per cápita a precios corrientes","Esperanza de vida al nacer (años)","Precipitación media anual a largo plazo","Recursos internos renovables de agua dulce por habitante"],
 de:['Gesamtbevölkerung','BIP zu jeweiligen Preisen','Stadtbevölkerung','Waldfläche (% der Landfläche)',"Landfläche","Bevölkerungsdichte","Landwirtschaftliche Fläche (% der Landfläche)","Ackerland (% der Landfläche)","Gesamtfläche (Land und Binnengewässer)","Landbevölkerung (% der Gesamtbevölkerung)","BIP je Einwohner zu jeweiligen Preisen","Lebenserwartung bei Geburt (Jahre)","Langjähriger mittlerer Jahresniederschlag","Erneuerbare interne Süßwasserressourcen pro Kopf"],
 pt:['População total','PIB a preços correntes','População urbana','Área florestal (% da área terrestre)',"Área terrestre","Densidade populacional","Área agrícola (% da área terrestre)","Terra arável (% da área terrestre)","Área total (terra e águas interiores)","População rural (% do total)","PIB per capita a preços correntes","Esperança de vida ao nascer (anos)","Precipitação média anual de longo prazo","Recursos internos renováveis de água doce por habitante"]
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
 if(id==='SP.DYN.LE00.IN')return v>0&&v<=130;
 return true;
}
export function parseIndicator(payload,id,map){
 if(!INDICATORS.some(x=>x.id===id))throw new Error('Unknown indicator');
 const values={},seen=new Set();
 for(const row of rows(payload)){
  if(row?.indicator?.id!==id||row?.date!==indicatorYear(id))throw new Error('Wrong indicator/year');
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
  const year=indicatorYear(i.id);
  if((snapshot.yearByIndicator?.[i.id]??snapshot.year)!==year)return [];
  const v=snapshot.values?.[i.id]?.[code];if(!validValue(i.id,v))return [];
  const retrieved=snapshot.retrievedByIndicator?.[i.id]??snapshot.retrieved;
  if(typeof retrieved!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(retrieved))return [];
  const nf=new Intl.NumberFormat(language,{useGrouping:'always',maximumFractionDigits:i.digits??(i.unit==='%'?2:0)});
  return [{id:i.id,language,label:localizedLabels[language]?.[index]??i[language],value:nf.format(v)+(i.unit?' '+i.unit:''),year,retrieved,source:'https://data.worldbank.org/indicator/'+i.id,attribution:'World Bank: World Development Indicators: '+i.provider}];
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
// Local aliases retain exact matching and explicit year semantics.
Object.assign(queries.it,{"superficie totale":"AG.SRF.TOTL.K2","popolazione rurale":"SP.RUR.TOTL.ZS","pil pro capite":"NY.GDP.PCAP.CD","speranza di vita":"SP.DYN.LE00.IN"});
Object.assign(queries.en,{"surface area":"AG.SRF.TOTL.K2","rural population":"SP.RUR.TOTL.ZS","gdp per capita":"NY.GDP.PCAP.CD","life expectancy":"SP.DYN.LE00.IN"});
Object.assign(queries.fr,{"superficie totale":"AG.SRF.TOTL.K2","population rurale":"SP.RUR.TOTL.ZS","pib par habitant":"NY.GDP.PCAP.CD","espérance de vie":"SP.DYN.LE00.IN"});
Object.assign(queries.es,{"superficie total":"AG.SRF.TOTL.K2","población rural":"SP.RUR.TOTL.ZS","pib per cápita":"NY.GDP.PCAP.CD","esperanza de vida":"SP.DYN.LE00.IN"});
Object.assign(queries.de,{"gesamtfläche":"AG.SRF.TOTL.K2","landbevölkerung":"SP.RUR.TOTL.ZS","bip je einwohner":"NY.GDP.PCAP.CD","lebenserwartung":"SP.DYN.LE00.IN"});
Object.assign(queries.pt,{"área total":"AG.SRF.TOTL.K2","população rural":"SP.RUR.TOTL.ZS","pib per capita":"NY.GDP.PCAP.CD","esperança de vida":"SP.DYN.LE00.IN"});
Object.assign(queries.it,{"precipitazione media":"AG.LND.PRCP.MM","risorse idriche interne pro capite":"ER.H2O.INTR.PC"});
Object.assign(queries.en,{"average precipitation":"AG.LND.PRCP.MM","internal freshwater per capita":"ER.H2O.INTR.PC"});
Object.assign(queries.fr,{"précipitations moyennes":"AG.LND.PRCP.MM","eau douce interne par habitant":"ER.H2O.INTR.PC"});
Object.assign(queries.es,{"precipitación media":"AG.LND.PRCP.MM","agua dulce interna por habitante":"ER.H2O.INTR.PC"});
Object.assign(queries.de,{"jahresniederschlag":"AG.LND.PRCP.MM","internes süßwasser pro kopf":"ER.H2O.INTR.PC"});
Object.assign(queries.pt,{"precipitação média":"AG.LND.PRCP.MM","água doce interna per capita":"ER.H2O.INTR.PC"});
export function statisticsSelection(snapshot,input){
 if(!Object.hasOwn(queries,input.language))return [];
 let q=input.question.normalize('NFC').toLowerCase().trim().replace(/[?!.]+$/u,'').trim();
 // Explicit year queries are supported only for the exact snapshot year.
 const dated=q.match(/^(.*?)\s+(\d{4})$/u);
 if(dated)q=dated[1].trim();
 const aliases=queries[input.language];
 if(!Object.hasOwn(aliases,q))return [];
 if(dated&&dated[2]!==indicatorYear(aliases[q]))return [];
 const id='wdi-'+aliases[q];
 return statisticsEvidence(snapshot,input.code,input.language).filter(x=>x.id===id).map(x=>x.id);
}
