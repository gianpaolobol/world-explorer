// Explicit offline snapshot acquisition. No user data, credentials, or runtime browser requests.
import {writeFile} from 'node:fs/promises';
import {countryMap,parseIndicator,INDICATORS,YEAR} from '../src/world-statistics.mjs';
async function get(path,query){
 const url=new URL('https://api.worldbank.org/v2/'+path);
 for(const [k,v] of Object.entries({format:'json',per_page:'400',...query}))url.searchParams.set(k,v);
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(25000)});
 if(!response.ok||!response.body)throw new Error('WDI HTTP '+response.status);
 const reader=response.body.getReader();let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();throw new Error('WDI response too large');}chunks.push(value);}}finally{reader.releaseLock();}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
const map=countryMap(await get('country',{}));
const entries=await Promise.all(INDICATORS.map(async ({id})=>[id,parseIndicator(await get('country/all/indicator/'+id,{source:'2',date:YEAR}),id,map)]));
const snapshot={year:YEAR,retrieved:new Date().toISOString().slice(0,10),values:Object.fromEntries(entries)};
for(const [id,values] of entries)console.log(id+': '+Object.keys(values).length+' countries with observations');
if(process.argv.includes('--write'))await writeFile(new URL('../src/world-statistics-data.mjs',import.meta.url),'// Data: World Bank WDI and named providers, CC BY 4.0 and additional terms: https://data.worldbank.org/summary-terms-of-use\nexport const snapshot='+JSON.stringify(snapshot)+';\n');
console.log('WDI_SNAPSHOT '+JSON.stringify(snapshot));
