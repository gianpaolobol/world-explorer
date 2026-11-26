// Explicit offline snapshot acquisition. No user data, credentials, or runtime browser requests.
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {countryMap,parseIndicator,INDICATORS,YEAR} from '../src/world-statistics.mjs';

export function retryDelay(header,attempt,now=Date.now()){
 const fallback=2000*2**attempt;
 if(!header)return fallback;
 const ms=/^\d+$/.test(header)?Number(header)*1000:Date.parse(header)-now;
 if(!Number.isFinite(ms))return fallback;
 if(ms>60000)throw new Error('WDI Retry-After exceeds local 60s limit; try later');
 return Math.max(fallback,ms);
}
export async function get(path,query,{request=fetch,wait=delay,report=console.warn}={}){
 const url=new URL('https://api.worldbank.org/v2/'+path);
 for(const [k,v] of Object.entries({format:'json',per_page:'400',...query}))url.searchParams.set(k,v);
 for(let attempt=0;attempt<3;attempt++){
  const signal=AbortSignal.timeout(25000);
  try {
  const response=await request(url,{redirect:'error',signal,headers:{Accept:'application/json'}});
  if(!response.ok||!response.body){
   await response.body?.cancel();
   if(![429,503].includes(response.status)||attempt===2)throw new Error('WDI HTTP '+response.status+' for '+path);
   const ms=retryDelay(response.headers.get('Retry-After'),attempt);
   report('WDI HTTP '+response.status+' for '+path+'; retry in '+ms+'ms');
   await wait(ms);continue;
  }
  const reader=response.body.getReader();let size=0;const chunks=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();throw new Error('WDI response too large');}chunks.push(value);}}finally{reader.releaseLock();}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch(error) {
   if((error?.name!=='TimeoutError'&&!signal.aborted)||attempt===2)throw error;
   const ms=retryDelay(null,attempt);
   report('WDI timeout for '+path+'; retry in '+ms+'ms');
   await wait(ms);
  }
 }
 throw new Error('WDI retry limit');
}
export async function acquire({getJson=get,wait=delay,now=()=>new Date()}={}){
 const map=countryMap(await getJson('country',{}));
 const entries=[];
 for(const {id} of INDICATORS){
  await wait(1500);
  entries.push([id,parseIndicator(await getJson('country/all/indicator/'+id,{source:'2',date:YEAR}),id,map)]);
 }
 return {year:YEAR,retrieved:now().toISOString().slice(0,10),values:Object.fromEntries(entries)};
}
async function main(){
 const snapshot=await acquire();
 for(const [id,values] of Object.entries(snapshot.values))console.log(id+': '+Object.keys(values).length+' countries with observations');
 if(process.argv.includes('--write'))await writeFile(new URL('../src/world-statistics-data.mjs',import.meta.url),'// Data: World Bank WDI and named providers, CC BY 4.0 and additional terms: https://data.worldbank.org/summary-terms-of-use\nexport const snapshot='+JSON.stringify(snapshot)+';\n');
 console.log('WDI_SNAPSHOT '+JSON.stringify(snapshot));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
