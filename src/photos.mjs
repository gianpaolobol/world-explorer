// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
const maxMetadataBytes=1024*1024;
const maxPhotos=5;
const apiAgent='WorldExplorer/0.6 (https://github.com/gianpaolobol/world-explorer)';
const endpoint='https://commons.wikimedia.org/w/api.php';
const licenses=Object.freeze({'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/','CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/','CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/','CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/','CC0':'https://creativecommons.org/publicdomain/zero/1.0/'});
function httpsURL(value,host,prefix){
 try{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host&&!u.port&&!u.username&&!u.password&&u.pathname.startsWith(prefix)?u.href:null;}catch{return null;}
}
function plain(value){
 if(typeof value!=='string')return '';
 return value.replace(/<[^>]*>/g,' ').replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g,e=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&nbsp;':' '})[e]).replace(/\s+/g,' ').trim();
}
export function photoQuery(lat,lon){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new RangeError('Invalid coordinates');
 const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',generator:'geosearch',ggsnamespace:'6',ggscoord:lat+'|'+lon,ggsradius:'10000',ggslimit:'5',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'640',iiextmetadatafilter:'Artist|Attribution|Credit|LicenseShortName|LicenseUrl|Restrictions|Copyrighted'});
 return endpoint+'?'+params;
}
export function photoCandidates(data){
 const pages=data?.query?.pages;
 if(!Array.isArray(pages))return [];
 const seen=new Set();
 return pages.slice(0,maxPhotos).flatMap(page=>{
  const i=page?.imageinfo?.[0],m=i?.extmetadata;
  if(!i||!m||!['image/jpeg','image/png'].includes(i.mime)||typeof page.title!=='string'||!page.title.startsWith('File:')||page.title.length>512)return [];
  const val=k=>plain(m[k]?.value),license=val('LicenseShortName'),licenseUrl=licenses[license];
  if(!licenseUrl||!Object.hasOwn(licenses,license)||val('Restrictions'))return [];
  const supplied=val('LicenseUrl').replace(/^http:/,'https:').replace(/\/?$/,'/');
  if(supplied!==licenseUrl)return [];
  const author=val('Artist'),attribution=val('Attribution'),credit=val('Credit');
  if(!author&&!attribution)return [];
  const image=httpsURL(i.thumburl,'upload.wikimedia.org','/wikipedia/commons/'),source=httpsURL(i.descriptionurl,'commons.wikimedia.org','/wiki/File:');
  if(!image||!source||seen.has(source)||[author,attribution,credit].some(v=>v.length>4096))return [];
  seen.add(source);
  return [{title:page.title.slice(5),author,attribution,credit,license,licenseUrl,image,source}];
 });
}
async function boundedJSON(response){
 const length=response.headers.get('content-length');
 if(length!==null&&(!/^\d+$/.test(length)||Number(length)>maxMetadataBytes))throw new Error('Commons metadata too large');
 if(!response.body)throw new Error('Commons empty body');
 const reader=response.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});
 let bytes=0,text='';
 try{
  for(;;){
   const {done,value}=await reader.read();
   if(done)break;
   bytes+=value.byteLength;
   if(bytes>maxMetadataBytes)throw new Error('Commons metadata too large');
   text+=decoder.decode(value,{stream:true});
  }
  text+=decoder.decode();
  return JSON.parse(text);
 }catch(error){try{await reader.cancel();}catch{}throw error;}
 finally{reader.releaseLock();}
}
export async function nearbyPhotos(lat,lon,fetcher=fetch,signal){
 const response=await fetcher(photoQuery(lat,lon),{credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',headers:{'Api-User-Agent':apiAgent},signal});
 if(!response.ok)throw new Error('Commons unavailable');
 const data=await boundedJSON(response);
 if(data?.error)throw new Error('Commons query rejected');
 return photoCandidates(data);
}
