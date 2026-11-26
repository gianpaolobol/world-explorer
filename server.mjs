// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {answerGuide,validateGuideInput,ollamaSelector} from './src/guide.mjs';
import {createRemoteState,startRemote} from './src/remote.mjs';
const root=new URL('./',import.meta.url);
const assets=new Set(['/index.html','/src/style.css',...['app','remote-host-ui','countries','travel','cinematic','geography','numeric-relief','numeric-relief-ui','boundaries','photos','narration','regions','region-quiz','learning','editorial-pilot'].map(x=>'/src/'+x+'.mjs')]);
const MAX_BODY=4096;
function send(res,status,value,type='application/json; charset=utf-8'){
 res.writeHead(status,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cross-Origin-Resource-Policy':'same-origin'});
 res.end(type.startsWith('application/json')?JSON.stringify(value):value);
}
export function makeServer({select,remote}={}){
 let busy=false;
 return createServer({requestTimeout:10000,headersTimeout:5000,maxHeaderSize:8192},async(req,res)=>{
  const port=req.socket.localPort,host='127.0.0.1:'+port;
  if(req.socket.remoteAddress!=='127.0.0.1'||req.headers.host!==host){send(res,403,{error:'local only'});return;}
  if(req.method==='GET'&&(req.url==='/'||assets.has(req.url))){
   const path=req.url==='/'?'/index.html':req.url;
   try{const type=path.endsWith('.mjs')?'text/javascript; charset=utf-8':path.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';send(res,200,await readFile(new URL('.'+path,root)),type);}catch{send(res,404,{error:'not found'});}return;
  }
  if(['/api/remote/pair','/api/remote/poll','/api/remote/revoke'].includes(req.url)){
   if(!remote){send(res,404,{error:'remote disabled'});return;}
   if(req.method!=='POST'||req.headers.origin!=='http://'+host||req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'||req.headers['transfer-encoding']||Number(req.headers['content-length']||0)!==0){send(res,403,{error:'remote local origin rejected'});return;}
   if(req.url.endsWith('/pair')){send(res,200,{...remote.state.pair(),url:remote.url});return;}
   if(req.url.endsWith('/revoke')){remote.state.revoke();send(res,200,{active:false});return;}
   send(res,200,remote.state.drain());return;
  }
  if(req.url!=='/api/guide'||req.method!=='POST'){send(res,404,{error:'not found'});return;}
  if(req.headers.origin!=='http://'+host||req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'){send(res,403,{error:'origin rejected'});return;}
  if(req.headers['content-type']!=='application/json'){send(res,415,{error:'JSON required'});return;}
  const length=Number(req.headers['content-length']);
  if(!Number.isSafeInteger(length)||length<1||length>MAX_BODY||req.headers['transfer-encoding']){send(res,413,{error:'invalid body length'});return;}
  if(busy){send(res,429,{error:'guide busy'});return;}
  busy=true;
  try{
   const chunks=[];let size=0;
   for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY){send(res,413,{error:'body too large'});return;}chunks.push(chunk);}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{send(res,400,{error:'invalid JSON'});return;}
   if(!validateGuideInput(input)){send(res,400,{error:'invalid input'});return;}
   const answer=await answerGuide(input,select);
   if(!res.destroyed)send(res,200,answer);
  }catch{if(!res.destroyed&&!res.headersSent)send(res,503,{error:'guide unavailable'});}
  finally{busy=false;}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const model=process.env.WORLD_EXPLORER_MODEL;
 // Operator must also disable cloud in the running Ollama process; this flag is explicit consent, not proof of daemon configuration.
 const select=model&&process.env.WORLD_EXPLORER_LOCAL_ONLY==='1'?ollamaSelector(model):undefined;
 let remote;
 if(process.env.WORLD_EXPLORER_REMOTE==='1'){
  const state=createRemoteState();
  try{const connection=await startRemote({ip:process.env.WORLD_EXPLORER_REMOTE_IP,certPath:process.env.WORLD_EXPLORER_REMOTE_CERT,keyPath:process.env.WORLD_EXPLORER_REMOTE_KEY,state});remote={state,url:connection.url};console.log('Remote HTTPS configured; pair from atlas.');}
  catch{console.error('Remote HTTPS unavailable; atlas remains local only.');}
 }
 const server=makeServer({select,remote});server.listen(8765,'127.0.0.1',()=>console.log('World Explorer: http://127.0.0.1:8765/ · '+(select?'Ollama enabled (operator-confirmed local-only)':'source-only guide')));
}
