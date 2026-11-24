// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {countries,languages,countryName} from './countries.mjs';
import {wrapIndex,chooseDestination,cameraHeight} from './travel.mjs';
const $=id=>document.getElementById(id), key='world-explorer-visits-v1';
let visits={},lang='it',index=0,viewer=null,timer=null,terrainOn=false,terrainBusy=false;
try { const data=JSON.parse(localStorage.getItem(key)||'{}'); for(const c of countries){if(Number.isSafeInteger(data?.[c.code])&&data[c.code]>=0)visits[c.code]=data[c.code];} } catch {}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(visits));}catch{$('status').textContent='Memoria locale non disponibile';}};
const name=c=>countryName(c.code,lang);
function options(){
 $('place').replaceChildren(...countries.map((c,i)=>new Option(name(c),String(i))).sort((a,b)=>a.text.localeCompare(b.text,lang)));
 $('place').value=String(index);
}
for(const l of languages)$('lang').add(new Option(new Intl.DisplayNames([l],{type:'language'}).of(l),l));
$('lang').value=lang;options();
function speak(){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(name(countries[index]));u.lang=lang;const v=speechSynthesis.getVoices().find(v=>v.lang.split('-')[0]===lang);if(v)u.voice=v;speechSynthesis.speak(u);}
function render(fly=true,read=false){
 const c=countries[index];$('place').value=String(index);$('name').textContent=name(c);
 $('facts').textContent='Capitale (dato iniziale): '+c.capital+' · Superficie indicativa: '+new Intl.NumberFormat(lang).format(c.area)+' km²';
 $('source').href='https://'+lang+'.wikipedia.org/w/index.php?search='+encodeURIComponent(name(c));
 $('progress').textContent='Destinazioni visitate: '+Object.keys(visits).filter(k=>visits[k]>0).length+' / '+countries.length;
 if(fly&&viewer){viewer.camera.cancelFlight();viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(c.lon,c.lat,cameraHeight(c.area)),orientation:{heading:0,pitch:Cesium.Math.toRadians(-75),roll:0},duration:5});}
 if(read)speak();
}
function visit(i,read=false){index=wrapIndex(i,countries.length);const c=countries[index];visits[c.code]=(visits[c.code]||0)+1;save();render(true,read);}
function advance(){const c=chooseDestination(countries,visits,countries[index].code);if(c)visit(countries.indexOf(c),true);}
function schedule(){clearInterval(timer);timer=setInterval(advance,Number($('interval').value)*1000);}
$('auto').onclick=()=>{if(timer!==null){clearInterval(timer);timer=null;$('auto').textContent='Viaggio automatico';window.speechSynthesis?.cancel();}else{advance();schedule();$('auto').textContent='Ferma viaggio';}};
$('interval').onchange=()=>{if(timer!==null)schedule();};
$('place').onchange=e=>visit(Number(e.target.value));$('prev').onclick=()=>visit(index-1);$('next').onclick=()=>visit(index+1);
$('lang').onchange=e=>{lang=e.target.value;options();render(false);};
$('voice').onclick=speak;$('stopVoice').onclick=()=>window.speechSynthesis?.cancel();
$('reset').onclick=()=>{if(confirm('Eliminare tutte le visite memorizzate su questo browser?')){visits={};save();render(false);}};
$('ambient').onclick=()=>document.body.classList.toggle('ambient');
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('status').textContent='Schermo intero non disponibile';}};
$('terrain').onclick=async()=>{if(!viewer||terrainBusy)return;terrainBusy=true;$('terrain').disabled=true;
 try{if(terrainOn){viewer.terrainProvider=new Cesium.EllipsoidTerrainProvider();terrainOn=false;$('status').textContent='Globo 3D · ellissoide';}
 else{const provider=await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl('https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer');
 provider.errorEvent.addEventListener(()=>{$('status').textContent='Rilievo Esri: errore nel caricamento delle tessere';});viewer.terrainProvider=provider;terrainOn=true;$('status').textContent='Provider Esri collegato · verifica tessere in corso';}
 }catch{$('status').textContent='Rilievo Esri non disponibile · ellissoide';viewer.terrainProvider=new Cesium.EllipsoidTerrainProvider();terrainOn=false;}finally{terrainBusy=false;$('terrain').disabled=false;$('terrain').textContent=terrainOn?'Disattiva rilievo Esri':'Attiva rilievo Esri';}};
try{if(!window.Cesium)throw new Error('Cesium non disponibile');
 viewer=new Cesium.Viewer('globe',{baseLayer:false,baseLayerPicker:false,geocoder:false,animation:false,timeline:false,sceneModePicker:true,homeButton:true});
 const osm=new Cesium.UrlTemplateImageryProvider({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',maximumLevel:19,credit:'© OpenStreetMap contributors'});
 osm.errorEvent.addEventListener(()=>{$('status').textContent='Cartografia OSM: errore di rete o tessere';});
 viewer.imageryLayers.addImageryProvider(osm);$('status').textContent='Globo 3D · ellissoide · OSM';}
catch{$('status').textContent='Globo non disponibile: modalità atlante testuale';$('terrain').disabled=true;}
visit(index);
