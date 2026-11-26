// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {createServer as createHttpsServer} from 'node:https';
import {readFile} from 'node:fs/promises';
import {isIPv4} from 'node:net';

export const commands=Object.freeze(['prev','next','auto','pause','voice','stopVoice','ambient']);
export function privateIPv4(ip){
 if(typeof ip!=='string'||!isIPv4(ip))return false;
 const [a,b]=ip.split('.').map(Number);
 return a===10||a===172&&b>=16&&b<=31||a===192&&b===168;
}
export function createRemoteState({now=Date.now,random=()=>randomBytes(24).toString('hex')}={}){
 let token=null,expires=0,queue=[],last=-Infinity;
 function revoke(){token=null;expires=0;queue=[];last=-Infinity;}
 function active(){if(token&&now()>=expires)revoke();return token!==null;}
 return {
  pair(){revoke();token=random();if(!/^[a-f0-9]{48}$/.test(token)){revoke();throw new Error('invalid random token');}expires=now()+15*60*1000;return {token,expires};},
  revoke,active,
  accept(header,command){
   if(!active()||typeof header!=='string'||!/^Bearer [a-f0-9]{48}$/.test(header)||!timingSafeEqual(Buffer.from(header.slice(7)),Buffer.from(token)))return 401;
   if(!commands.includes(command))return 400;
   const t=now();queue=queue.filter(x=>t-x.at<5000);
   if(queue.length>=8||t-last<250)return 429;
   last=t;queue.push({command,at:t});return 202;
  },
  drain(){if(!active())return {active:false,commands:[]};const t=now(),result=queue.filter(x=>t-x.at<5000).map(x=>x.command);queue=[];return {active:true,commands:result};}
 };
}
const root=new URL('../',import.meta.url);
function send(res,status,value,type='application/json; charset=utf-8'){
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'none'; script-src 'self'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'"});
 res.end(type.startsWith('application/json')?JSON.stringify(value):value);
}
export function remoteHandler(state,host,{allowPeer=privateIPv4}={}){
 return async(req,res)=>{
  if(!allowPeer(req.socket.remoteAddress)||req.headers.host!==host){send(res,403,{error:'LAN host rejected'});return;}
  if(req.method==='GET'&&(req.url==='/'||req.url==='/remote-client.mjs')){
   try{const file=req.url==='/'?'remote.html':'src/remote-client.mjs';send(res,200,await readFile(new URL(file,root)),req.url==='/'?'text/html; charset=utf-8':'text/javascript; charset=utf-8');}catch{send(res,404,{error:'not found'});}return;
  }
  if(req.method!=='POST'||req.url!=='/command'){send(res,404,{error:'not found'});return;}
  if(req.headers.origin!=='https://'+host||req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'){send(res,403,{error:'origin rejected'});return;}
  if(req.headers['content-type']!=='application/json'){send(res,415,{error:'JSON required'});return;}
  const len=Number(req.headers['content-length']);
  if(!Number.isSafeInteger(len)||len<1||len>128||req.headers['transfer-encoding']){send(res,413,{error:'invalid length'});return;}
  try{
   const chunks=[];let size=0;
   for await(const chunk of req){size+=chunk.length;if(size>128){send(res,413,{error:'too large'});return;}chunks.push(chunk);}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{send(res,400,{error:'invalid JSON'});return;}
   if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==1||typeof input.command!=='string'){send(res,400,{error:'invalid command'});return;}
   const status=state.accept(req.headers.authorization,input.command);
   send(res,status,{accepted:status===202});
  }catch{if(!res.destroyed&&!res.headersSent)send(res,400,{error:'invalid request'});}
 };
}
export async function startRemote({ip,certPath,keyPath,state,port=8766}){
 if(!privateIPv4(ip)||!certPath||!keyPath||!Number.isInteger(port)||port<1024||port>65535)throw new Error('remote requires explicit private IPv4 and TLS certificate/key');
 const host=ip+':'+port;
 const server=createHttpsServer({cert:await readFile(certPath),key:await readFile(keyPath),minVersion:'TLSv1.2',requestTimeout:5000,headersTimeout:4000,maxHeaderSize:4096},remoteHandler(state,host));
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,ip,()=>{server.removeListener('error',reject);resolve();});});
 return {server,url:'https://'+host+'/'};
}
