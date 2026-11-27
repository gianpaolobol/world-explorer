// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {countryName} from './countries.mjs';
import {regionOf,regionName,M49_SOURCE} from './regions.mjs';
import {pilotEvidence} from './editorial-pilot.mjs';
import {statisticsEvidence,statisticsLanguages} from './world-statistics.mjs';
import {snapshot} from './world-statistics-data.mjs';
// Deliberately limited to sourced statistical geography. No unreviewed capital/area claims.
const templates=Object.freeze({
 it:(c,r)=>`${c}. Secondo la classificazione statistica delle Nazioni Unite, questa destinazione appartiene alla regione: ${r}. Osserva il territorio sul globo.`,
 en:(c,r)=>`${c}. In the United Nations statistical classification, this destination belongs to the region: ${r}. Explore its location on the globe.`,
 fr:(c,r)=>`${c}. Selon la classification statistique des Nations unies, cette destination appartient à la région : ${r}. Observe sa position sur le globe.`,
 de:(c,r)=>`${c}. Nach der statistischen Gliederung der Vereinten Nationen gehört dieses Ziel zur Region: ${r}. Betrachte seine Lage auf dem Globus.`,
 es:(c,r)=>`${c}. Según la clasificación estadística de las Naciones Unidas, este destino pertenece a la región: ${r}. Observa su ubicación en el globo.`,
 pt:(c,r)=>`${c}. Segundo a classificação estatística das Nações Unidas, este destino pertence à região: ${r}. Observe a sua localização no globo.`,
 ar:(c,r)=>`${c}. وفقاً للتصنيف الإحصائي للأمم المتحدة، تنتمي هذه الوجهة إلى المنطقة: ${r}. تأمل موقعها على الكرة الأرضية.`,
 zh:(c,r)=>`${c}。根据联合国统计分类，该目的地属于以下区域：${r}。请观察它在地球仪上的位置。`,
 ja:(c,r)=>`${c}。国連の統計分類では、この目的地は次の地域に属します：${r}。地球儀で位置を確認しましょう。`,
 ru:(c,r)=>`${c}. По статистической классификации ООН это место относится к региону: ${r}. Посмотрите, где оно находится на глобусе.`,
 hi:(c,r)=>`${c}। संयुक्त राष्ट्र के सांख्यिकीय वर्गीकरण के अनुसार यह स्थान इस क्षेत्र में है: ${r}। ग्लोब पर इसका स्थान देखें।`,
 ko:(c,r)=>`${c}. 유엔 통계 분류에 따르면 이 목적지는 다음 지역에 속합니다: ${r}. 지구본에서 위치를 살펴보세요.`,
 nl:(c,r)=>`${c}. Volgens de statistische indeling van de Verenigde Naties behoort deze bestemming tot de regio: ${r}. Bekijk de ligging op de wereldbol.`,
 pl:(c,r)=>`${c}. Według klasyfikacji statystycznej ONZ to miejsce należy do regionu: ${r}. Spójrz na jego położenie na globusie.`,
 tr:(c,r)=>`${c}. Birleşmiş Milletler istatistik sınıflandırmasına göre bu konum şu bölgeye aittir: ${r}. Dünya küresindeki konumunu incele.`,
 uk:(c,r)=>`${c}. За статистичною класифікацією ООН це місце належить до регіону: ${r}. Розгляньте його розташування на глобусі.`,
 sv:(c,r)=>`${c}. Enligt FN:s statistiska indelning tillhör denna destination regionen: ${r}. Se var den ligger på jordgloben.`,
 el:(c,r)=>`${c}. Σύμφωνα με τη στατιστική ταξινόμηση του ΟΗΕ, αυτός ο προορισμός ανήκει στην περιοχή: ${r}. Παρατήρησε τη θέση του στην υδρόγειο.`,
 id:(c,r)=>`${c}. Menurut klasifikasi statistik Perserikatan Bangsa-Bangsa, tujuan ini termasuk wilayah: ${r}. Amati letaknya pada globe.`,
 he:(c,r)=>`${c}. לפי הסיווג הסטטיסטי של האו״ם, יעד זה שייך לאזור: ${r}. התבוננו במיקומו על הגלובוס.`
});
export function narrationFor(code,locale='it'){
 const region=regionOf(code);if(!region)return null;
 const language=Object.hasOwn(templates,locale)?locale:'en';
 return {language,text:templates[language](countryName(code,language),regionName(region,language)),source:M49_SOURCE};
}

// A separate presentation itinerary: the guide's M49 evidence must stay M49-only.
// Never mix languages or infer values when the source snapshot has gaps.
export function cinematicNarrationFor(code,locale='it'){
 const base=narrationFor(code,locale);
 if(!base)return null;
 const local=base.language;
 const extended=statisticsLanguages.includes(local);
 const facts=extended?[
  ...pilotEvidence(code,local).filter(x=>x.language===local&&['orography','hydrology'].includes(x.discipline)),
  ...statisticsEvidence(snapshot,code,local).filter(x=>['wdi-SP.POP.TOTL','wdi-SP.URB.TOTL.IN.ZS','wdi-AG.LND.FRST.ZS','wdi-AG.LND.PRCP.MM','wdi-ER.H2O.INTR.PC'].includes(x.id))
 ]:[];
 const introductions=({
  it:'Dati della Banca Mondiale, anno 2024.',
  en:'World Bank data, reference year 2024.',
  fr:'Données de la Banque mondiale, année de référence 2024.',
  es:'Datos del Banco Mundial, año de referencia 2024.',
  de:'Daten der Weltbank, Bezugsjahr 2024.',
  pt:'Dados do Banco Mundial, ano de referência 2024.'
 });
 const stats=facts.filter(x=>x.id.startsWith('wdi-'));
 const editorial=facts.filter(x=>!x.id.startsWith('wdi-'));
 const periods=[...new Set(stats.map(x=>x.period))];
 const sections=periods.flatMap(period=>[introductions[local].replace('2024',period),...stats.filter(x=>x.period===period).map(x=>x.text)]);
 const text=[base.text,...editorial.map(x=>x.text),...sections].join(' ');
 return {language:local,text,facts,extended,source:base.source};
}
