// Explicit offline snapshot acquisition. No user data, credentials, or runtime browser requests.
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {countryMap,parseIndicator,INDICATORS,YEAR,indicatorYear,statisticsFor} from '../src/world-statistics.mjs';
import {snapshot as committedSnapshot} from '../src/world-statistics-data.mjs';

export function retryDelay(header,attempt,now=Date.now()){
 const fallback=15000*2**attempt;
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
export async function acquire({getJson=get,wait=delay,now=()=>new Date(),base=null}={}){
 const entries=[], dates={};
 const datePattern=/^\d{4}-\d{2}-\d{2}$/;
 if(base!==null){
  if(base.year!==YEAR||!datePattern.test(base.retrieved??'')||!base.values||typeof base.values!=='object'||Array.isArray(base.values))throw new Error('Invalid base WDI snapshot');
  for(const [id,values] of Object.entries(base.values)){
   if(!INDICATORS.some(i=>i.id===id)||!values||typeof values!=='object'||Array.isArray(values)||!Object.keys(values).length)throw new Error('Invalid base WDI series');
   const checked=base.retrievedByIndicator?.[id]??base.retrieved;
   if(!datePattern.test(checked))throw new Error('Invalid base WDI acquisition date');
   for(const code of Object.keys(values))if(!statisticsFor(base,code,'en').some(i=>i.id===id))throw new Error('Invalid base WDI observation');
   entries.push([id,{...values}]);dates[id]=checked;
  }
 }
 const present=new Set(entries.map(([id])=>id));
 const missing=INDICATORS.filter(({id})=>!present.has(id));
 if(!missing.length)return base; // no external request when all series are already verified
 const map=countryMap(await getJson('country',{}));
 for(const {id} of missing){
  await wait(base===null?1500:5000);
  entries.push([id,parseIndicator(await getJson('country/all/indicator/'+id,{source:'2',date:indicatorYear(id)}),id,map)]);
  dates[id]=now().toISOString().slice(0,10);
 }
 const values=Object.fromEntries(INDICATORS.map(({id})=>[id,entries.find(([key])=>key===id)[1]]));
 const retrieved=now().toISOString().slice(0,10);
 const yearByIndicator=Object.fromEntries(INDICATORS.filter(i=>indicatorYear(i.id)!==YEAR).map(i=>[i.id,indicatorYear(i.id)]));
 return {year:YEAR,retrieved,values,...(Object.keys(yearByIndicator).length?{yearByIndicator}:{}),...(base!==null||Object.values(dates).some(d=>d!==retrieved)?{retrievedByIndicator:dates}:{})};
}
async function main(){
 const snapshot=await acquire({base:process.argv.includes('--extend')?committedSnapshot:null});
 for(const [id,values] of Object.entries(snapshot.values))console.log(id+': '+Object.keys(values).length+' countries with observations');
 if(process.argv.includes('--write'))await writeFile(new URL('../src/world-statistics-data.mjs',import.meta.url),'// Data: World Bank WDI and named providers, CC BY 4.0 and additional terms: https://data.worldbank.org/summary-terms-of-use\nexport const snapshot='+JSON.stringify(snapshot)+';\n');
 console.log('WDI_SNAPSHOT '+JSON.stringify(snapshot));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
