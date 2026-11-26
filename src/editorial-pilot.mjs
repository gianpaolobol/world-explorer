// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Original short factual summaries; primary sources consulted 2026-11-26.
// Pilot only: no independent editorial approval and no other country inferred.
export const disciplines=Object.freeze(['physical','orography','hydrology','oceanography','geology','climatology','biogeography','political','human','economic','urban','historical']);
const yearbook='https://www.istat.it/wp-content/uploads/2026/03/Italian-Statistical-Yearbook-2025-Executive-summary.pdf';
const rows=[
 ['physical','territorio','physical geography','Nel 2024 i comuni costieri rappresentavano l’8,2% dei comuni italiani.','In 2024, coastal municipalities made up 8.2% of Italy’s municipalities.',yearbook,'ISTAT, Annuario 2025, cap. 1','2024'],
 ['orography','orografia','orography','Secondo l’Annuario ISTAT 2025, il 41,6% del territorio italiano è collinare e il 35,2% montuoso.','ISTAT’s 2025 yearbook classifies 41.6% of Italy’s surface as hills and 35.2% as mountains.',yearbook,'ISTAT, Annuario 2025, cap. 1','2025'],
 ['hydrology','idrografia','hydrology','Il Po percorre circa 652 km dal Monviso all’Adriatico, attraversando la Pianura Padana.','The Po flows approximately 652 km from Monviso across the Po Plain to the Adriatic.','https://www.adbpo.it/territorio-di-competenza/','Autorità di bacino del Po',null],
 ['oceanography','oceanografia','oceanography','Nel sistema europeo MSFD l’Adriatico e lo Ionio-Mediterraneo centrale costituiscono due distinte sottoregioni del Mediterraneo.','Under the EU MSFD classification, the Adriatic and the Ionian–Central Mediterranean form separate Mediterranean subregions.','https://water.discomap.eea.europa.eu/arcgis/rest/services/Marine/MSFD_regions_and_subregions/MapServer','EEA, MSFD','2016'],
 ['geology','geologia','geology','L’Etna, in Sicilia, è classificato come stratovulcano dal Global Volcanism Program.','The Global Volcanism Program classifies Sicily’s Etna as a stratovolcano.','https://volcano.si.edu/volcano.cfm?vn=211060&vtab=Weekly','Smithsonian GVP',null],
 ['climatology','clima','climatology','Nei capoluoghi regionali italiani, nel 2023 la temperatura media annua risultò 16,6 °C, ossia 1,7 °C sopra il riferimento 1981–2010. Non è la media dell’intero territorio nazionale.','Across Italian regional capitals in 2023, annual mean temperature was 16.6 °C, 1.7 °C above the 1981–2010 reference; this is not a nationwide territorial mean.',yearbook,'ISTAT, Annuario 2025, cap. 2','2023'],
 ['biogeography','biogeografia','biogeography','Le tre regioni biogeografiche terrestri della direttiva Habitat presenti in Italia sono Alpina, Continentale e Mediterranea.','Italy contains three terrestrial Habitats Directive biogeographical regions: Alpine, Continental and Mediterranean.','https://www.isprambiente.gov.it/public_files/XI_RAU_sfogliabile/files/assets/basic-html/page-369.html','ISPRA, XI Rapporto ambiente urbano',null],
 ['political','capitale','capital','L’articolo 114 della Costituzione italiana identifica Roma come capitale della Repubblica.','Article 114 of the Italian Constitution identifies Rome as the capital of the Republic.','https://www.senato.it/istituzione/la-costituzione/parte-ii/titolo-v/articolo-114','Senato, Costituzione, art. 114',null],
 ['human','popolazione','population','Il censimento ISTAT registra 58.943.464 abitanti abitualmente dimoranti in Italia al 31 dicembre 2024.','ISTAT’s census counted 58,943,464 usual residents of Italy on 31 December 2024.','https://www.istat.it/comunicato-stampa/censimento-e-dinamica-della-popolazione-anno-2024/','ISTAT, Censimento 2024','2024-12-31'],
 ['economic','economia','economy','Nel 2024 il PIL italiano a prezzi correnti era pari a 2.199.619 milioni di euro secondo la pubblicazione ISTAT dei conti 2023–2024; la serie può essere revisionata.','ISTAT’s 2023–2024 accounts reported Italy’s 2024 GDP at current prices as EUR 2,199,619 million; the series may be revised.','https://www.istat.it/comunicato-stampa/conti-economici-nazionali-anni-2023-2024/','ISTAT, Conti economici 2023–2024','2024'],
 ['urban','città','urban geography','Al 31 dicembre 2024 solo 11 comuni italiani superavano i 250.000 residenti, ospitando il 14,7% della popolazione nazionale.','On 31 December 2024, just 11 Italian municipalities had over 250,000 residents, representing 14.7% of the national population.',yearbook,'ISTAT, Annuario 2025, cap. 1','2024-12-31'],
 ['historical','storia','historical geography','Venezia si sviluppò su isole lagunari dal V secolo e acquisì un ruolo marittimo di primo piano nel X secolo; città e laguna sono patrimonio UNESCO dal 1987.','Venice developed on lagoon islands from the fifth century and rose as a maritime power in the tenth; the city and lagoon became a UNESCO World Heritage property in 1987.','https://whc.unesco.org/en/list/394','UNESCO, Venice and its Lagoon','1987']
];
const normalize=q=>q.normalize('NFC').toLowerCase().replace(/[?!.]+$/u,'').trim();
export function pilotEvidence(code,language){
 if(code!=='IT')return [];
 const locale=language==='it'?'it':'en';
 return rows.map(([discipline,itQuery,enQuery,it,en,source,label,period])=>({id:'it-'+discipline,discipline,text:locale==='it'?it:en,language:locale,source,label,period,checked:'2026-11-26',review:'source-checked-not-independent'}));
}
export function pilotSelection(input){
 if(input.code!=='IT'||!['it','en'].includes(input.language))return [];
 const q=normalize(input.question);
 const alias=input.language==='it'?{'qual è la capitale':'capitale','qual è la popolazione':'popolazione','geografia fisica':'territorio','idrologia':'idrografia','climatologia':'clima','geografia politica':'capitale','geografia umana':'popolazione','geografia economica':'economia','geografia urbana':'città','geografia storica':'storia'}:{'what is the capital':'capital','what is the population':'population','climate':'climatology'};
 const key=Object.hasOwn(alias,q)?alias[q]:q;
 return rows.filter(r=>r[input.language==='it'?1:2]===key).map(r=>'it-'+r[0]);
}
