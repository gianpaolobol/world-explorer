// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import test from 'node:test';
import assert from 'node:assert/strict';
import {networkInterfaces,tmpdir} from 'node:os';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:net';
import {request} from 'node:https';
import {createRemoteState,privateIPv4,startRemote} from '../src/remote.mjs';

async function freePort(ip){
 const s=createServer();
 await new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,ip,resolve);});
 const port=s.address().port;
 await new Promise((resolve,reject)=>s.close(err=>err?reject(err):resolve()));
 return port;
}
function call(ip,port,path,{ca,method='GET',headers={},body}={}){
 return new Promise((resolve,reject)=>{
  const req=request({hostname:ip,port,path,method,ca,agent:false,rejectUnauthorized:true,
   headers:{...headers,...(body===undefined?{}:{'Content-Length':Buffer.byteLength(body)})}},res=>{
   const parts=[];res.on('data',c=>parts.push(c));res.on('error',reject);
   res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(parts).toString()}));
  });
  req.setTimeout(5000,()=>req.destroy(new Error('TLS request timed out')));
  req.on('error',reject);req.end(body);
 });
}
test('production LAN HTTPS startup, trusted IP certificate, command and revocation', {timeout:25000},async t=>{
 const ip=Object.values(networkInterfaces()).flat().find(x=>x&&!x.internal&&x.family==='IPv4'&&privateIPv4(x.address))?.address;
 assert.ok(ip,'CI requires a private IPv4 interface; do not silently skip the TLS test');
 const dir=await mkdtemp(join(tmpdir(),'world-explorer-tls-'));
 t.after(()=>rm(dir,{recursive:true,force:true}));
 const certPath=join(dir,'cert.pem'),keyPath=join(dir,'key.pem');
 function generate(san){execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-sha256','-days','1','-subj','/CN=World Explorer ephemeral test','-addext','subjectAltName=IP:'+san,'-keyout',keyPath,'-out',certPath],{stdio:'ignore',timeout:10000});}
 const port=await freePort(ip);
 const state=createRemoteState();
 generate(ip==='10.255.255.254'?'10.255.255.253':'10.255.255.254');
 await assert.rejects(startRemote({ip,port,certPath,keyPath,state}),/IP SAN/);
 generate(ip);
 const ca=await readFile(certPath);
 const {server,url}=await startRemote({ip,port,certPath,keyPath,state});
 t.after(()=>new Promise(resolve=>{server.closeAllConnections?.();server.close(resolve);}));
 assert.equal(url,'https://'+ip+':'+port+'/');
 await assert.rejects(call(ip,port,'/'),e=>['DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN','UNABLE_TO_VERIFY_LEAF_SIGNATURE'].includes(e.code));
 const home=await call(ip,port,'/',{ca});
 assert.equal(home.status,200);
 assert.match(home.body,/Telecomando/);
 assert.match(home.headers['content-security-policy'],/default-src 'none'/);
 assert.equal(home.headers['cache-control'],'no-store');
 assert.equal((await call(ip,port,'/remote-client.mjs',{ca})).status,200);
 for(const path of ['/api/guide','/api/remote/pair','/server.mjs'])assert.equal((await call(ip,port,path,{ca})).status,404);
 assert.equal((await call(ip,port,'/',{ca,headers:{Host:'untrusted.example'}})).status,403);
 const origin='https://'+ip+':'+port;
 const post=(token,source=origin,command='next')=>call(ip,port,'/command',{ca,method:'POST',headers:{Origin:source,Authorization:'Bearer '+token,'Content-Type':'application/json','Sec-Fetch-Site':'same-origin'},body:JSON.stringify({command})});
 const {token}=state.pair();
 assert.equal((await post(token,'https://untrusted.example')).status,403);
 assert.equal((await post('invalid')).status,401);
 assert.equal((await post(token,origin,'shell')).status,400);
 assert.equal((await post(token)).status,202);
 assert.deepEqual(state.drain().commands,['next']);
 assert.deepEqual(state.drain().commands,[]);
 state.revoke();
 assert.equal((await post(token)).status,401);
});
