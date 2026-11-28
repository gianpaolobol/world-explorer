// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Original short factual summaries; primary sources consulted 2026-11-26/27.
// Pilot only: no independent editorial approval; facts are scoped to their country.
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
const franceRows=[
 ['orography','orografia','orography','Nei Pirenei, sul versante francese del sito transfrontaliero del Monte Perdido, si trovano grandi circhi glaciali.','On the French side of the transboundary Mont Perdu site in the Pyrenees, large glacial cirques shape the mountain landscape.','https://whc.unesco.org/en/list/773/','UNESCO, Pyrénées – Mont Perdu',null],
 ['hydrology','idrografia','hydrology','Il tratto della Loira tutelato come paesaggio culturale UNESCO si estende per circa 280 km fra Sully-sur-Loire e Chalonnes, lungo il corso medio del fiume.','The UNESCO cultural landscape along the middle Loire spans about 280 km between Sully-sur-Loire and Chalonnes.','https://whc.unesco.org/en/list/933/','UNESCO, Loire Valley',null],
 ['geology','geologia','geology','In Alvernia, la faglia di Limagne e i vulcani della Chaîne des Puys documentano la distensione della crosta continentale.','In Auvergne, the Limagne fault and Chaîne des Puys volcanoes provide geological evidence of continental extension.','https://whc.unesco.org/en/list/1434','UNESCO, Chaîne des Puys – Limagne fault',null],
 ['biogeography','biogeografia','biogeography','La riserva corsa di Scandola comprende ambienti marini e costieri con macchia mediterranea e habitat per uccelli marini.','Corsica’s Scandola reserve contains coastal and marine habitats, including Mediterranean scrub and seabird habitat.','https://whc.unesco.org/en/list/258/','UNESCO, Gulf of Porto',null],
 ['human','popolazione 2026','population 2026','Al 1º gennaio 2026, INSEE stimava 69,1 milioni di residenti: la Francia metropolitana e i cinque dipartimenti d’oltremare.','On 1 January 2026, INSEE estimated 69.1 million residents in metropolitan France and the five overseas departments.','https://www.insee.fr/fr/statistiques/8996934','INSEE, Démographie : évolutions récentes et à venir','2026-01-01'],
 ['historical','storia','historical geography','Nel 2000 il Comitato del patrimonio mondiale iscrisse il paesaggio culturale della Valle della Loira; i suoi castelli testimoniano fra l’altro il Rinascimento francese.','In 2000 the World Heritage Committee listed the Loire Valley cultural landscape, whose castles include notable examples of French Renaissance heritage.','https://whc.unesco.org/en/decisions/2459/','UNESCO, Decision 24 COM X.C.1','2000'],
 ["physical","territorio","physical geography","La Francia metropolitana si affaccia su quattro bacini marittimi: Mare del Nord, Manica, Atlantico e Mediterraneo.","Metropolitan France has coastlines facing the North Sea, English Channel, Atlantic and Mediterranean.","https://www.france.fr/es/articulo/clima-y-geografia-francia/","Atout France, clima e geografia",null,"2026-11-27"],
 ["oceanography","oceanografia","oceanography","Nella baia di Mont-Saint-Michel le maree determinano l’alternanza tra distese sabbiose esposte e superfici sommerse.","Tidal fluctuations in the Bay of Mont-Saint-Michel periodically expose and inundate extensive sand flats.","https://whc.unesco.org/en/list/80/","UNESCO, Mont-Saint-Michel and its Bay",null,"2026-11-27"],
 ["climatology","clima","climatology","Météo-France distingue cinque tipi climatici nella Francia esagonale e in Corsica, tra cui quello oceanico, montano e mediterraneo.","Météo-France distinguishes five climate types in mainland France and Corsica, including oceanic, mountain and Mediterranean climates.","https://meteofrance.com/changement-climatique/le-climat-en-france-hexagonale-et-corse","Météo-France, climat en France hexagonale et Corse",null,"2026-11-27"],
 ["political","capitale","capital","Parigi è la capitale della Francia.","Paris is the capital of France.","https://www.france.fr/de/artikel/steckbrief-frankreich/","Atout France, Steckbrief Frankreich",null,"2026-11-27"],
 ["economic","economia 2024","economy 2024","Nei conti nazionali INSEE pubblicati nel 2025, il PIL francese del 2024 era pari a 2.919,9 miliardi di euro a prezzi correnti; il dato è soggetto a revisioni.","In INSEE’s national accounts published in 2025, France’s 2024 GDP at current prices was EUR 2,919.9 billion; estimates may be revised.","https://www.insee.fr/en/statistiques/8574734","INSEE, National accounts in 2024","2024","2026-11-27"],
 ["urban","città","urban geography","Nel censimento 2023 il comune di Parigi contava 2.103.778 abitanti, mentre l’unità urbana di Parigi ne contava 11.013.774: due perimetri distinti.","In the 2023 census, the municipality of Paris had 2,103,778 residents and the Paris urban unit had 11,013,774: two distinct geographical definitions.","https://www.insee.fr/fr/statistiques/1405599?geo=REG-11+COM-75056+AAV2020-001+UU2020-00851","INSEE, Comparateur de territoires","2023","2026-11-27"]
];
const spainRows=[
 ["physical","territorio","physical geography","Sulla costa andalusa di Doñana il paesaggio comprende dune mobili e stabilizzate, accanto a lagune e paludi.","On the Andalusian coast at Doñana, mobile and stabilized dunes adjoin lagoons and marshes.","https://whc.unesco.org/en/list/685/","UNESCO, Doñana",null,"2026-11-27"],
 ["orography","orografia","orography","Il Teide, sull’isola di Tenerife, raggiunge 3.718 metri ed è la massima elevazione della Spagna.","Teide on Tenerife reaches 3,718 metres, the highest elevation in Spain.","https://whc.unesco.org/fr/list/1258/","UNESCO, Teide",null,"2026-11-27"],
 ["hydrology","idrografia","hydrology","Il Guadalquivir sfocia nell’Atlantico presso Doñana; le zone umide del parco dipendono anche dalle acque sotterranee del bacino.","The Guadalquivir reaches the Atlantic near Doñana; the park’s wetlands also depend on groundwater in its basin.","https://whc.unesco.org/en/list/685/","UNESCO, Doñana",null,"2026-11-27"],
 ["oceanography","oceanografia","oceanography","Nei fondali di Ibiza le praterie di Posidonia oceanica contribuiscono alla stabilità delle spiagge.","Around Ibiza, underwater Posidonia oceanica meadows help maintain beach stability.","https://whc.unesco.org/en/list/417","UNESCO, Ibiza",null,"2026-11-27"],
 ["geology","geologia","geology","Il complesso Teide-Pico Viejo a Tenerife è uno stratovulcano, testimonianza della formazione geologica delle isole oceaniche.","Tenerife’s Teide-Pico Viejo complex is a stratovolcano illustrating the geological development of oceanic islands.","https://whc.unesco.org/fr/list/1258/","UNESCO, Teide",null,"2026-11-27"],
 ["climatology","clima","climatology","A La Gomera, nelle Canarie, l’esposizione delle alture ai venti umidi favorisce la formazione di nubi e nebbie nel parco di Garajonay.","On La Gomera in the Canary Islands, exposure of the uplands to moist winds favours clouds and mist in Garajonay National Park.","https://whc.unesco.org/en/list/380/","UNESCO, Garajonay",null,"2026-11-27"],
 ["biogeography","biogeografia","biogeography","Il parco di Garajonay conserva foreste di laurisilva, tipiche della vegetazione relitta macaronesica.","Garajonay National Park preserves laurel forests characteristic of relict Macaronesian vegetation.","https://whc.unesco.org/en/list/380/","UNESCO, Garajonay",null,"2026-11-27"],
 ["political","capitale","capital","L’articolo 5 della Costituzione spagnola stabilisce che la capitale è Madrid.","Article 5 of Spain’s Constitution designates Madrid as the national capital.","https://www.lamoncloa.gob.es/lang/en/espana/leyfundamental/paginas/titulo_preliminar.aspx","La Moncloa, Costituzione, art. 5",null,"2026-11-27"],
 ["human","popolazione 2025","population 2025","Il censimento annuale INE registrava 49.128.297 residenti in Spagna al 1º gennaio 2025.","Spain’s INE annual census counted 49,128,297 residents on 1 January 2025.","https://www.ine.es/dyngs/Prensa/en/CensoVariables2025.htm","INE, Censimento annuale 2025","2025-01-01","2026-11-27"],
 ["economic","economia 2024","economy 2024","Secondo la revisione INE dei conti nazionali pubblicata nel settembre 2025, il PIL spagnolo 2024 a prezzi correnti era stimato in 1.594.330 milioni di euro. Si tratta di una stima di quella pubblicazione, soggetta a revisioni.","INE’s September 2025 national accounts release estimated Spain’s 2024 GDP at current prices at EUR 1,594,330 million. This release-specific estimate is subject to revisions.","https://www.ine.es/dyngs/Prensa/en/CNA2024.htm","INE, Conti nazionali 2022–2024, revisione 2025","2024","2026-11-27"],
 ["urban","città","urban geography","Al 1º gennaio 2025, secondo il censimento INE, il 40,9% dei residenti in Spagna viveva in comuni con più di 100.000 abitanti; non è una misura delle aree metropolitane.","In INE’s census for 1 January 2025, 40.9% of Spain’s residents lived in municipalities above 100,000 inhabitants; this is not a metropolitan-area measure.","https://www.ine.es/dyngs/Prensa/en/CensoVariables2025.htm","INE, Censimento annuale 2025","2025-01-01","2026-11-27"],
 ["historical","storia","historical geography","L’acquedotto romano di Segovia documenta l’infrastruttura idrica dell’antica città; parte delle arcate è tuttora visibile nel centro storico.","Segovia’s Roman aqueduct records the ancient city’s water infrastructure; its arches remain visible in the historic centre.","https://whc.unesco.org/en/list/311","UNESCO, Segovia",null,"2026-11-27"]
];
const germanyRows=[
 ["physical","territorio","physical geography","Sulla costa tedesca del Mare dei Wadden si alternano piane sabbiose, distese fangose e paludi salmastre.","The German Wadden Sea coast includes sandy flats, mudflats and salt marshes.","https://whc.unesco.org/en/list/1314","UNESCO, Wadden Sea",null,"2026-11-27"],
 ["orography","orografia","orography","La Zugspitze è la montagna più alta della Germania, con la sommità a circa 3.000 metri.","The Zugspitze is Germany's highest mountain, with its summit near 3,000 metres.","https://zugspitze.de/en/Our-mountain-worlds/Events/Morgengluehen","Bayerische Zugspitzbahn",null,"2026-11-27"],
 ["hydrology","idrografia","hydrology","Tra Bingen e Coblenza il Reno attraversa un tratto vallivo tutelato dall’UNESCO lungo circa 65 km.","Between Bingen and Koblenz, the Rhine crosses a UNESCO-listed valley section of about 65 km.","https://whc.unesco.org/en/list/1066/","UNESCO, Upper Middle Rhine Valley",null,"2026-11-27"],
 ["oceanography","oceanografia","oceanography","Nel Mare dei Wadden, condiviso con Danimarca e Paesi Bassi, le maree modellano canali e banchi di sedimenti.","In the Wadden Sea, shared with Denmark and the Netherlands, tidal action shapes channels and sediment banks.","https://whc.unesco.org/en/list/1314","UNESCO, Wadden Sea",null,"2026-11-27"],
 ["geology","geologia","geology","Nel sito fossilifero di Messel, in Assia, i sedimenti conservano testimonianze dell’Eocene medio risalenti a circa 47–48 milioni di anni fa.","At Messel in Hesse, fossil-bearing sediments record environments of the middle Eocene, about 47–48 million years ago.","https://whc.unesco.org/en/list/720","UNESCO, Messel Pit",null,"2026-11-27"],
 ["climatology","clima","climatology","Secondo l’agenzia ambientale federale, nel 2025 la temperatura media della Germania è stata circa 10,0 °C, 1,8 °C sopra il riferimento 1961–1990.","Germany's federal environment agency reports a nationwide mean temperature of about 10.0 °C in 2025, 1.8 °C above the 1961–1990 reference.","https://www.umweltbundesamt.de/daten/umweltzustand-trends/klima/trends-der-lufttemperatur","UBA, dati DWD","2025","2026-11-27"],
 ["biogeography","biogeografia","biogeography","Nel 2011 cinque faggete tedesche, tra cui aree del Kellerwald e dello Hainich, entrarono nel sito naturale UNESCO transnazionale delle antiche faggete.","Five German beech forest areas, including parts of Kellerwald and Hainich, joined the transnational UNESCO beech forest property in 2011.","https://www.bfn.de/en/unesco-natural-world-heritage","BfN, UNESCO Beech Forests","2011","2026-11-27"],
 ["political","capitale","capital","Berlino è la capitale della Germania.","Berlin is Germany's capital.","https://www.destatis.de/Europa/EN/Country/EU-Member-States/Germany.html","Destatis, Eurostat","2025","2026-11-27"],
 ["human","popolazione 2025","population 2025","Destatis registrava 83.467.117 abitanti in Germania al 31 dicembre 2025, secondo gli aggiornamenti basati sul censimento 2022.","Destatis recorded 83,467,117 residents in Germany on 31 December 2025 using population updates based on the 2022 census.","https://www.destatis.de/EN/Themes/Society-Environment/Population/Current-Population/Tables/population-by-laender-basis-2022.html","Destatis, popolazione","2025-12-31","2026-11-27"],
 ["economic","economia 2025","economy 2025","Nella prima stima Destatis del 15 gennaio 2026, il PIL reale tedesco del 2025 cresceva dello 0,2% rispetto al 2024; la stima è soggetta a revisioni.","Destatis's initial estimate of 15 January 2026 put German real GDP growth in 2025 at 0.2% over 2024; the estimate is subject to revision.","https://www.destatis.de/EN/Press/2026/01/PE26_017_811.html","Destatis, prima stima PIL","2025","2026-11-27"],
 ["urban","città","urban geography","Al 31 dicembre 2025 il Land di Berlino contava 3.700.577 residenti; il dato non descrive l’intera area metropolitana.","On 31 December 2025 the federal state of Berlin had 3,700,577 residents; this does not measure its entire metropolitan area.","https://www.destatis.de/EN/Themes/Society-Environment/Population/Current-Population/Tables/population-by-laender-basis-2022.html","Destatis, popolazione per Land","2025-12-31","2026-11-27"],
 ["historical","storia","historical geography","Nella valle del Medio Reno, i terrazzamenti viticoli testimoniano oltre un millennio di trasformazioni del paesaggio fluviale.","Vineyard terraces in the Middle Rhine Valley reflect over a millennium of human reshaping of the river landscape.","https://whc.unesco.org/en/list/1066/","UNESCO, Upper Middle Rhine Valley",null,"2026-11-27"]
];
// UNCTAD's 32-country LLDC list and the UN explanatory page, checked 2026-11-27.
 // This is a partial geographic context, not an oceanographic survey or national economic profile.
export const lldcCodes=Object.freeze('AF AM AZ BT BO BW BF BI CF TD SZ ET KZ KG LA LS MK MW ML MN NP NE PY MD RW SS TJ TM UG UZ ZM ZW'.split(' '));
const lldcRows=[
 ['oceanography','oceanografia','oceanography','Questo Stato non dispone di accesso territoriale diretto all’oceano; ciò non esclude laghi, mari interni o altri ambienti acquatici.','This country has no direct territorial access to the ocean; it may still have lakes, inland seas or other aquatic environments.','https://unctad.org/topic/landlocked-developing-countries/list-of-LLDCs','UNCTAD, LLDC list',null,'2026-11-27'],
 ['economic','accesso ai porti','access to seaports','Per raggiungere via terra porti oceanici, questo Stato dipende dal transito attraverso altri Paesi; non è una stima dei costi di trasporto nazionali.','Land routes from this country to ocean seaports depend on transit through other countries; this is not an estimate of national transport costs.','https://www.un.org/en/landlocked/about-landlocked-developing-countries','UN, LLDC geographical context',null,'2026-11-27']
];
// UN OHRLLS/UN DESA 39-member SIDS list, intersected with the 195-country atlas.
 // Cook Islands and Niue are outside this registry; Bahrain is not in this specific list.
export const sidsCodes=Object.freeze('AG BS BB BZ CV KM CU DM DO FJ GD GW GY HT JM KI MV MH FM MU NR PW PG WS ST SG KN LC VC SC SB SR TL TO TT TV VU'.split(' '));
const sidsRows=[
 ['political','sids','sids','Questo Stato appartiene al gruppo SIDS della lista ONU OHRLLS; la categoria riguarda esigenze di sviluppo e non implica che ogni membro sia un’isola.','This country belongs to the SIDS group on the UN OHRLLS list; the development category does not imply that every member is an island.','https://www.un.org/ohrlls/content/list-sids','UN OHRLLS, SIDS list',null,'2026-11-27'],
 ['oceanography','oceanografia','oceanography','Per il gruppo SIDS, le risorse marine sono centrali nello sviluppo sostenibile. È un quadro collettivo, non una misura delle risorse o dei fondali di questo singolo Stato.','Marine resources are central to sustainable development for the SIDS group. This is group-level context, not a measurement of this individual country’s resources or seabed.','https://sdgs.un.org/smallislands/about-small-island-developing-states','UN DESA, SIDS context',null,'2026-11-27'],
 ['climatology','clima','climatology','L’ONU considera il gruppo SIDS particolarmente vulnerabile agli effetti del cambiamento climatico; rischi, intensità e fenomeni variano tra i membri. Non è una previsione climatica nazionale.','The UN identifies the SIDS group as particularly vulnerable to climate change impacts; hazards and their intensity vary among members. This is not a national climate projection.','https://sdgs.un.org/smallislands/about-small-island-developing-states','UN DESA, SIDS context',null,'2026-11-27']
];
// EU official membership and currency lists, checked 2026-11-27.
// Existing complete national pilots retain their own political/economic facts.
const euGroups=[[1958,'BE LU NL'],[1973,'DK IE'],[1981,'GR'],[1986,'PT'],[1995,'AT FI SE'],[2004,'CY CZ EE HU LT LV MT PL SI SK'],[2007,'BG RO'],[2013,'HR']];
const euYears=new Map(euGroups.flatMap(([year,codes])=>codes.split(' ').map(code=>[code,year])));
export const euContextCodes=Object.freeze([...euYears.keys()].sort());
const euroMembers=new Set('AT BE BG HR CY EE FI GR IE LV LT LU MT NL PT SK SI'.split(' '));
function euRows(code){
 const year=euYears.get(code), euro=euroMembers.has(code);
 const joining=year===1958;
 return [
 ['political','unione europea','european union',joining?'Questo Stato è tra i sei fondatori delle Comunità europee, con riferimento al 1958.':`Questo Stato è membro dell’Unione europea (o delle Comunità europee che l’hanno preceduta) dal ${year}.`,joining?'This country is one of the six founding members of the European Communities, with 1958 as the reference year.':`This country has been a member of the European Union (or its predecessor European Communities) since ${year}.`,'https://european-union.europa.eu/principles-countries-history/eu-countries_en','European Union, membership chronology',String(year),'2026-11-27'],
 ['economic','area euro','euro area',euro?'Al 27 novembre 2026 questo Stato fa parte dell’area euro.':'Al 27 novembre 2026 questo Stato è membro UE ma non dell’area euro.',euro?'On 27 November 2026 this country belongs to the euro area.':'On 27 November 2026 this country is an EU member but not part of the euro area.','https://european-union.europa.eu/institutions-law-budget/euro/countries-using-euro_en','European Union, euro area membership','2026-11-27','2026-11-27']
 ];
}
// Original factual summaries of local sites; no UNESCO text or media redistributed.
const geoscienceRows=new Map([
 [
  "AR",
  [
   [
    "orography",
    "orografia",
    "orography",
    "Nelle Ande patagoniche argentine il Cerro Chaltén (Fitz Roy) raggiunge 3.375 metri.",
    "Cerro Chaltén (Fitz Roy) rises to 3,375 metres in the Argentine Patagonian Andes.",
    "https://whc.unesco.org/en/list/145/",
    "UNESCO, Los Glaciares",
    null,
    "2026-11-27"
   ],
   [
    "hydrology",
    "idrografia",
    "hydrology",
    "Il lago Argentino riceve acqua e ghiaccio da ghiacciai fra cui il Perito Moreno.",
    "Lake Argentino receives water and ice from glaciers including Perito Moreno.",
    "https://whc.unesco.org/en/list/145/",
    "UNESCO, Los Glaciares",
    null,
    "2026-11-27"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "A Los Glaciares le morene e le conche lacustri testimoniano l'evoluzione glaciale quaternaria.",
    "Moraines and lake basins at Los Glaciares record Quaternary glacial evolution.",
    "https://whc.unesco.org/en/list/145/",
    "UNESCO, Los Glaciares",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "CA",
  [
   [
    "physical",
    "territorio",
    "physical geography",
    "Nei parchi delle Montagne Rocciose canadesi si incontrano valli glaciali, canyon e grotte carsiche.",
    "Canada's Rocky Mountain parks contain glacial valleys, canyons and karst caves.",
    "https://whc.unesco.org/en/list/304/",
    "UNESCO, Canadian Rocky Mountain Parks",
    null,
    "2026-11-27"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "Il sito del Burgess Shale conserva fossili marini del Cambriano, inclusi organismi a corpo molle.",
    "The Burgess Shale site preserves Cambrian marine fossils, including soft-bodied organisms.",
    "https://whc.unesco.org/en/list/304/",
    "UNESCO, Canadian Rocky Mountain Parks",
    null,
    "2026-11-27"
   ],
   [
    "climatology",
    "clima",
    "climatology",
    "Nei parchi delle Rocciose canadesi è documentato l'arretramento dei ghiacciai associato al cambiamento climatico.",
    "Glacier retreat associated with climate change is documented in the Canadian Rocky Mountain parks.",
    "https://whc.unesco.org/en/list/304/",
    "UNESCO, Canadian Rocky Mountain Parks",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "CN",
  [
   [
    "physical",
    "territorio",
    "physical geography",
    "Il sito carsico della Cina meridionale comprende paesaggi distribuiti fra Yunnan, Guizhou, Guangxi e Chongqing.",
    "The South China Karst property encompasses landscapes in Yunnan, Guizhou, Guangxi and Chongqing.",
    "https://whc.unesco.org/en/list/1248/",
    "UNESCO, South China Karst",
    null,
    "2026-11-27"
   ],
   [
    "hydrology",
    "idrografia",
    "hydrology",
    "Nel carsismo di Libo alcuni corsi d'acqua penetrano nel sottosuolo e percorrono sistemi di grotte.",
    "In the Libo karst, some streams descend underground into cave systems.",
    "https://whc.unesco.org/en/list/1248/",
    "UNESCO, South China Karst",
    null,
    "2026-11-27"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "A Shilin nello Yunnan l'erosione carsica ha prodotto colonne rocciose che formano le cosiddette foreste di pietra.",
    "Karst erosion at Shilin in Yunnan has produced rock pillars forming the so-called stone forests.",
    "https://whc.unesco.org/en/list/1248/",
    "UNESCO, South China Karst",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "BR",
  [
   [
    "physical",
    "territorio",
    "physical geography",
    "L'area protetta UNESCO del Pantanal brasiliano si trova presso il confine con la Bolivia, nel settore sud-occidentale del Mato Grosso.",
    "Brazil's UNESCO Pantanal conservation property lies near Bolivia, in southwestern Mato Grosso.",
    "https://whc.unesco.org/en/list/999/",
    "UNESCO, Pantanal Conservation Area",
    null,
    "2026-11-27"
   ],
   [
    "hydrology",
    "idrografia",
    "hydrology",
    "Il Pantanal brasiliano appartiene a un vasto sistema di zone umide d'acqua dolce legato ai fiumi Paraguay e Cuiabá.",
    "Brazil's Pantanal forms part of an extensive freshwater wetland system linked to the Paraguay and Cuiabá rivers.",
    "https://whc.unesco.org/en/list/999/",
    "UNESCO, Pantanal Conservation Area",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Fra gli animali del Pantanal brasiliano figurano caimani, giaguari e pappagalli, tutelati anche nelle aree protette.",
    "Animals of the Brazilian Pantanal include caimans, jaguars and parrots, also protected within conservation areas.",
    "https://whc.unesco.org/en/list/999/",
    "UNESCO, Pantanal Conservation Area",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "IN",
  [
   [
    "orography",
    "orografia",
    "orography",
    "I Ghati occidentali si sviluppano per circa 1.600 km in parallelo alla costa occidentale indiana.",
    "The Western Ghats extend roughly 1,600 km parallel to India's western coast.",
    "https://whc.unesco.org/en/list/1342/",
    "UNESCO, Western Ghats",
    null,
    "2026-11-27"
   ],
   [
    "climatology",
    "clima",
    "climatology",
    "I Ghati occidentali intercettano le correnti umide del monsone di sud-ovest, influenzando le precipitazioni regionali.",
    "The Western Ghats intercept moist southwesterly monsoon winds, affecting regional rainfall.",
    "https://whc.unesco.org/en/list/1342/",
    "UNESCO, Western Ghats",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Le foreste tropicali sempreverdi dei Ghati occidentali ospitano numerose specie endemiche.",
    "Tropical evergreen forests of the Western Ghats support many endemic species.",
    "https://whc.unesco.org/en/list/1342/",
    "UNESCO, Western Ghats",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "ZA",
  [
   [
    "physical",
    "territorio",
    "physical geography",
    "Il complesso protetto della Regione floristica del Capo comprende anche bacini idrografici montani all'estremità sud-occidentale del Sudafrica.",
    "The protected Cape Floral Region includes mountain catchments at South Africa's southwestern tip.",
    "https://whc.unesco.org/en/list/01007/",
    "UNESCO, Cape Floral Region",
    null,
    "2026-11-27"
   ],
   [
    "climatology",
    "clima",
    "climatology",
    "Nella Regione floristica del Capo il clima mediterraneo contribuisce a caratterizzare la vegetazione del fynbos.",
    "The Mediterranean climate of the Cape Floral Region helps shape its fynbos vegetation.",
    "https://whc.unesco.org/en/list/01007/",
    "UNESCO, Cape Floral Region",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Il fynbos della Regione del Capo è una vegetazione arbustiva con elevato endemismo e adattamenti agli incendi periodici.",
    "Cape fynbos is shrubland with high endemism and adaptations to recurring fires.",
    "https://whc.unesco.org/en/list/01007/",
    "UNESCO, Cape Floral Region",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "NZ",
  [
   [
    "physical",
    "territorio",
    "physical geography",
    "Nell'Isola del Sud neozelandese, i fiordi di Te Wahipounamu sono il risultato dell'erosione glaciale.",
    "Glacial erosion shaped the fjords of Te Wahipounamu on New Zealand's South Island.",
    "https://whc.unesco.org/en/list/551/",
    "UNESCO, Te Wahipounamu",
    null,
    "2026-11-27"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "La Faglia Alpina attraversa Te Wahipounamu e segna una zona di contatto fra le placche australiana e pacifica.",
    "The Alpine Fault crosses Te Wahipounamu, marking a contact zone between the Australian and Pacific plates.",
    "https://whc.unesco.org/en/list/551/",
    "UNESCO, Te Wahipounamu",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "A Te Wahipounamu vivono uccelli autoctoni quali il kea e il takahē.",
    "Native birds of Te Wahipounamu include the kea and takahē.",
    "https://whc.unesco.org/en/list/551/",
    "UNESCO, Te Wahipounamu",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "JP",
  [
   [
    "orography",
    "orografia",
    "orography",
    "Il sito montano Shirakami-Sanchi, nel nord di Honshū, si estende da circa 100 a 1.243 metri di quota.",
    "The mountainous Shirakami-Sanchi property in northern Honshu ranges from about 100 to 1,243 metres in elevation.",
    "https://whc.unesco.org/en/list/663/",
    "UNESCO, Shirakami-Sanchi",
    null,
    "2026-11-27"
   ],
   [
    "climatology",
    "clima",
    "climatology",
    "Nell'area di Shirakami-Sanchi, sul versante del Mar del Giappone, le abbondanti nevicate caratterizzano l'ambiente forestale.",
    "Heavy snowfall characterizes the forest environment around Shirakami-Sanchi on the Sea of Japan side.",
    "https://whc.unesco.org/en/list/663/",
    "UNESCO, Shirakami-Sanchi",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Shirakami-Sanchi conserva foreste temperate dominate dal faggio giapponese Fagus crenata.",
    "Shirakami-Sanchi preserves temperate forest dominated by Japanese beech, Fagus crenata.",
    "https://whc.unesco.org/en/list/663/",
    "UNESCO, Shirakami-Sanchi",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "AU",
  [
   [
    "physical",
    "territorio",
    "physical geography",
    "La Grande barriera corallina si sviluppa lungo la costa nord-orientale dell'Australia.",
    "The Great Barrier Reef extends along Australia's northeastern coast.",
    "https://whc.unesco.org/en/list/154/",
    "UNESCO, Great Barrier Reef",
    null,
    "2026-11-27"
   ],
   [
    "oceanography",
    "oceanografia",
    "oceanography",
    "Il sito della Grande barriera comprende ambienti marini dalla costa fino alla piattaforma continentale esterna, in alcuni tratti a circa 250 km dalla terraferma.",
    "The Great Barrier Reef property spans marine environments from the coast to the outer continental shelf, in some places about 250 km offshore.",
    "https://whc.unesco.org/en/list/154/",
    "UNESCO, Great Barrier Reef",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Le acque della Grande barriera corallina ospitano dugonghi e tartarughe verdi.",
    "Dugongs and green turtles inhabit the waters of the Great Barrier Reef.",
    "https://whc.unesco.org/en/list/154/",
    "UNESCO, Great Barrier Reef",
    null,
    "2026-11-27"
   ]
  ]
 ]
]);
export const geoscienceCodes=Object.freeze([...geoscienceRows.keys()].sort());
// Compose independent batches without replacing earlier country facts or changing IDs.
// Existing discipline wins; explicitly reviewed replacements require a separate edit.
export function composeEditorialRows(entries){
 const result=new Map();
 for(const [code,rows] of entries){
  const byDiscipline=new Map((result.get(code)||[]).map(row=>[row[0],row]));
  for(const row of rows)if(!byDiscipline.has(row[0]))byDiscipline.set(row[0],row);
  result.set(code,[...byDiscipline.values()]);
 }
 return result;
}
const regionalExtensionRows=new Map([
 [
  "NP",
  [
   [
    "orography",
    "orografia",
    "orography",
    "Il parco nazionale di Sagarmatha, in Nepal, comprende il settore nepalese dell’Everest.",
    "Nepal’s Sagarmatha National Park includes the Nepalese side of Everest.",
    "https://whc.unesco.org/en/list/120/",
    "UNESCO, Sagarmatha National Park",
    null,
    "2026-11-27"
   ],
   [
    "hydrology",
    "idrografia",
    "hydrology",
    "I ghiacciai del parco di Sagarmatha alimentano le risorse idriche a valle.",
    "Glaciers in Sagarmatha National Park supply water to downstream areas.",
    "https://whc.unesco.org/en/list/120/",
    "UNESCO, Sagarmatha National Park",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Nel parco di Sagarmatha sono presenti il panda rosso e il leopardo delle nevi.",
    "Red pandas and snow leopards occur in Sagarmatha National Park.",
    "https://whc.unesco.org/en/list/120/",
    "UNESCO, Sagarmatha National Park",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "TZ",
  [
   [
    "orography",
    "orografia",
    "orography",
    "La cima del Kilimangiaro, in Tanzania, raggiunge 5.895 metri, quota massima del continente africano.",
    "Tanzania’s Kilimanjaro reaches 5,895 metres, Africa’s highest elevation.",
    "https://whc.unesco.org/en/list/403/",
    "UNESCO, Kilimanjaro National Park",
    null,
    "2026-11-27"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "Il massiccio del Kilimangiaro comprende tre edifici vulcanici principali: Shira, Mawenzi e Kibo.",
    "The Kilimanjaro massif comprises the three principal volcanic peaks Shira, Mawenzi and Kibo.",
    "https://whc.unesco.org/en/list/403/",
    "UNESCO, Kilimanjaro National Park",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Sul Kilimangiaro la fascia forestale montana lascia spazio, salendo di quota, a brughiere e ambienti di deserto alpino.",
    "Higher on Kilimanjaro, heathland and alpine desert succeed the montane forest belt.",
    "https://whc.unesco.org/en/list/403/",
    "UNESCO, Kilimanjaro National Park",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "EC",
  [
   [
    "oceanography",
    "oceanografia",
    "oceanography",
    "Le Galápagos sorgono in una zona del Pacifico orientale dove convergono tre correnti oceaniche.",
    "Three ocean currents converge in the eastern Pacific near the Galápagos.",
    "https://whc.unesco.org/en/list/1/",
    "UNESCO, Galápagos Islands",
    null,
    "2026-11-27"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "Nelle Galápagos le isole occidentali di Isabela e Fernandina sono geologicamente più giovani di Española e San Cristóbal a oriente.",
    "The western Galápagos islands Isabela and Fernandina are geologically younger than Española and San Cristóbal to the east.",
    "https://whc.unesco.org/en/list/1/",
    "UNESCO, Galápagos Islands",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "L’isolamento delle Galápagos ha favorito l’evoluzione di forme endemiche, fra cui l’iguana marina.",
    "Isolation of the Galápagos fostered endemic forms such as the marine iguana.",
    "https://whc.unesco.org/en/list/1/",
    "UNESCO, Galápagos Islands",
    null,
    "2026-11-27"
   ]
  ]
 ],
 [
  "US",
  [
   [
    "geology",
    "geologia",
    "geology",
    "Il parco di Yellowstone negli Stati Uniti presenta fenomeni geotermici, fra cui numerosi geyser.",
    "Geothermal phenomena in the US Yellowstone park include numerous geysers.",
    "https://whc.unesco.org/en/list/28/",
    "UNESCO, Yellowstone National Park",
    null,
    "2026-11-27"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Il parco di Yellowstone ospita bisonti, lupi e orsi grizzly.",
    "Bison, wolves and grizzly bears inhabit Yellowstone National Park.",
    "https://whc.unesco.org/en/list/28/",
    "UNESCO, Yellowstone National Park",
    null,
    "2026-11-27"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "Il parco nazionale di Yellowstone fu istituito nel 1872.",
    "Yellowstone National Park was established in 1872.",
    "https://whc.unesco.org/en/list/28/",
    "UNESCO, Yellowstone National Park",
    "1872",
    "2026-11-27"
   ]
  ]
 ]
]);
export const regionalExtensionCodes=Object.freeze([...regionalExtensionRows.keys()].sort());
// Site-specific landscape evidence, complementary to existing batches.
const landscapeRows=new Map([
 [
  "CH",
  [
   [
    "orography",
    "orografia",
    "orography",
    "Nelle Alpi svizzere il sito Jungfrau-Aletsch comprende valli a U e cime modellate dall’erosione glaciale.",
    "In Switzerland, Jungfrau-Aletsch includes U-shaped valleys and peaks shaped by glacial erosion.",
    "https://whc.unesco.org/en/list/1037/",
    "UNESCO, Swiss Alps Jungfrau-Aletsch",
    null,
    "2026-11-28"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "Nel sito Jungfrau-Aletsch rocce cristalline antiche sovrastano rocce carbonatiche più giovani per effetto della tettonica.",
    "At Jungfrau-Aletsch, tectonic movement placed older crystalline rocks above younger carbonate rocks.",
    "https://whc.unesco.org/en/list/1037/",
    "UNESCO, Swiss Alps Jungfrau-Aletsch",
    null,
    "2026-11-28"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "Nell’area Jungfrau-Aletsch la vegetazione colonizza i terreni liberati dal ritiro dei ghiacciai.",
    "At Jungfrau-Aletsch, vegetation colonizes ground exposed by retreating glaciers.",
    "https://whc.unesco.org/en/list/1037/",
    "UNESCO, Swiss Alps Jungfrau-Aletsch",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "HR",
  [
   [
    "hydrology",
    "idrografia",
    "hydrology",
    "In Croazia i laghi di Plitvice comunicano attraverso corsi d’acqua superficiali e sotterranei.",
    "Croatia’s Plitvice lakes are linked by surface and underground watercourses.",
    "https://whc.unesco.org/en/list/98/",
    "UNESCO, Plitvice Lakes National Park",
    null,
    "2026-11-28"
   ],
   [
    "geology",
    "geologia",
    "geology",
    "A Plitvice la precipitazione di carbonato di calcio contribuisce alla formazione di sbarramenti naturali di tufo calcareo.",
    "At Plitvice, calcium carbonate deposition builds natural tufa barriers.",
    "https://whc.unesco.org/en/list/98/",
    "UNESCO, Plitvice Lakes National Park",
    null,
    "2026-11-28"
   ],
   [
    "biogeography",
    "biogeografia",
    "biogeography",
    "I boschi del parco di Plitvice ospitano orso bruno, lupo e lince.",
    "The forests of Plitvice National Park support brown bears, wolves and lynx.",
    "https://whc.unesco.org/en/list/98/",
    "UNESCO, Plitvice Lakes National Park",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "JO",
  [
   [
    "geology",
    "geologia",
    "geology",
    "Nel Wadi Rum, in Giordania meridionale, l’arenaria continentale costituisce il substrato di spettacolari forme desertiche.",
    "Continental sandstone underlies desert landforms in southern Jordan’s Wadi Rum.",
    "https://whc.unesco.org/en/list/1377/",
    "UNESCO, Wadi Rum Protected Area",
    null,
    "2026-11-28"
   ],
   [
    "physical",
    "territorio",
    "physical geography",
    "Nel Wadi Rum il paesaggio comprende gole incise e archi rocciosi naturali.",
    "Wadi Rum contains incised gorges and natural rock arches.",
    "https://whc.unesco.org/en/list/1377/",
    "UNESCO, Wadi Rum Protected Area",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "Nel Wadi Rum incisioni rupestri e reperti attestano circa dodici millenni di presenza umana.",
    "Rock markings and archaeological finds at Wadi Rum document roughly twelve millennia of human presence.",
    "https://whc.unesco.org/en/list/1377/",
    "UNESCO, Wadi Rum Protected Area",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "NO",
  [
   [
    "geology",
    "geologia",
    "geology",
    "I fiordi norvegesi di Geiranger e Nærøy occupano antiche valli glaciali invase dal mare.",
    "Norway’s Geiranger and Nærøy fjords occupy former glacial valleys flooded by seawater.",
    "https://whc.unesco.org/en/list/1195/",
    "UNESCO, West Norwegian Fjords",
    null,
    "2026-11-28"
   ],
   [
    "orography",
    "orografia",
    "orography",
    "Sui due fiordi norvegesi le pareti rocciose raggiungono localmente circa 1.400 metri sopra il livello marino.",
    "Rock walls beside the two Norwegian fjords rise locally to about 1,400 metres above sea level.",
    "https://whc.unesco.org/en/list/1195/",
    "UNESCO, West Norwegian Fjords",
    null,
    "2026-11-28"
   ],
   [
    "hydrology",
    "idrografia",
    "hydrology",
    "Numerose cascate scendono lungo i versanti dei fiordi di Geiranger e Nærøy.",
    "Many waterfalls descend the slopes of the Geiranger and Nærøy fjords.",
    "https://whc.unesco.org/en/list/1195/",
    "UNESCO, West Norwegian Fjords",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "TR",
  [
   [
    "geology",
    "geologia",
    "geology",
    "In Cappadocia l’erosione del terreno vulcanico ha prodotto pinnacoli detti camini delle fate.",
    "Erosion of volcanic terrain in Cappadocia has produced pinnacles known as fairy chimneys.",
    "https://whc.unesco.org/en/list/357/",
    "UNESCO, Göreme National Park and the Rock Sites of Cappadocia",
    null,
    "2026-11-28"
   ],
   [
    "urban",
    "città",
    "urban geography",
    "Nel paesaggio della Cappadocia si trovano insediamenti sotterranei, tra cui Kaymaklı e Derinkuyu.",
    "Cappadocia’s settlement landscape includes underground towns such as Kaymaklı and Derinkuyu.",
    "https://whc.unesco.org/en/list/357/",
    "UNESCO, Göreme National Park and the Rock Sites of Cappadocia",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "I santuari scavati nella roccia della valle di Göreme conservano testimonianze dell’arte bizantina successiva all’iconoclastia.",
    "Rock-cut sanctuaries in the Göreme valley preserve Byzantine art from after the Iconoclastic period.",
    "https://whc.unesco.org/en/list/357/",
    "UNESCO, Göreme National Park and the Rock Sites of Cappadocia",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "VN",
  [
   [
    "geology",
    "geologia",
    "geology",
    "Nel sito vietnamita Ha Long–Cat Ba la sommersione marina del carsismo calcareo ha creato un paesaggio di torri rocciose.",
    "At Vietnam’s Ha Long–Cat Ba site, seawater flooded limestone karst, leaving a landscape of rock towers.",
    "https://whc.unesco.org/en/list/672/",
    "UNESCO, Ha Long Bay - Cat Ba Archipelago",
    null,
    "2026-11-28"
   ],
   [
    "physical",
    "territorio",
    "physical geography",
    "Il paesaggio di Ha Long–Cat Ba include isole calcaree vegetate e scogliere a picco sul mare.",
    "Ha Long–Cat Ba includes vegetated limestone islands and steep sea cliffs.",
    "https://whc.unesco.org/en/list/672/",
    "UNESCO, Ha Long Bay - Cat Ba Archipelago",
    null,
    "2026-11-28"
   ],
   [
    "oceanography",
    "oceanografia",
    "oceanography",
    "L’erosione lungo la costa di Ha Long–Cat Ba produce cavità e incavi alla base delle formazioni calcaree.",
    "Coastal erosion at Ha Long–Cat Ba forms cavities and notches at the base of limestone features.",
    "https://whc.unesco.org/en/list/672/",
    "UNESCO, Ha Long Bay - Cat Ba Archipelago",
    null,
    "2026-11-28"
   ]
  ]
 ]
]);
export const landscapeCodes=Object.freeze([...landscapeRows.keys()].sort());
// Local urban and historical evidence; not a national urbanisation statistic.
const urbanHistoryRows=new Map([
 [
  "AT",
  [
   [
    "urban",
    "città",
    "urban geography",
    "Il viale della Ringstrasse, realizzato nella seconda metà dell’Ottocento, organizza una parte importante del centro monumentale di Vienna.",
    "Vienna’s monumental core includes the Ringstrasse boulevard, laid out in the latter half of the nineteenth century.",
    "https://whc.unesco.org/en/list/1033/",
    "UNESCO, Historic Centre of Vienna",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "Vienna fu la capitale della monarchia austro-ungarica.",
    "Vienna served as the capital of the Austro-Hungarian monarchy.",
    "https://whc.unesco.org/en/list/1033/",
    "UNESCO, Historic Centre of Vienna",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "BE",
  [
   [
    "urban",
    "città",
    "urban geography",
    "La Grand-Place di Bruxelles è delimitata da edifici civici e privati, tra cui il municipio e le case delle corporazioni.",
    "Brussels’ Grand-Place is enclosed by civic and private buildings, including the town hall and guild houses.",
    "https://whc.unesco.org/en/list/857/",
    "UNESCO, La Grand-Place, Brussels",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "La maggior parte degli edifici che circondano la Grand-Place di Bruxelles risale alla fine del Seicento.",
    "Most buildings around Brussels’ Grand-Place date to the late seventeenth century.",
    "https://whc.unesco.org/en/list/857/",
    "UNESCO, La Grand-Place, Brussels",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "CZ",
  [
   [
    "urban",
    "città",
    "urban geography",
    "Il centro storico di Praga comprende la Città Vecchia, Malá Strana e la Città Nuova, articolate sulle rive della Moldava.",
    "Prague’s historic core includes the Old Town, Lesser Town and New Town on the banks of the Vltava.",
    "https://whc.unesco.org/en/list/616/",
    "UNESCO, Historic Centre of Prague",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "Il ponte Carlo e numerosi monumenti di Praga risalgono all’epoca di Carlo IV, nel Trecento.",
    "Charles Bridge and many Prague monuments date to the fourteenth-century reign of Charles IV.",
    "https://whc.unesco.org/en/list/616/",
    "UNESCO, Historic Centre of Prague",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "HU",
  [
   [
    "urban",
    "città",
    "urban geography",
    "Il paesaggio urbano tutelato di Budapest comprende entrambe le rive del Danubio, il quartiere del castello di Buda e il viale Andrássy.",
    "Budapest’s protected urban landscape includes both Danube banks, the Buda Castle district and Andrássy Avenue.",
    "https://whc.unesco.org/en/list/400/",
    "UNESCO, Budapest, Banks of the Danube, Buda Castle Quarter and Andrássy Avenue",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "A Budapest le vestigia di Aquincum documentano la presenza romana nell’area della capitale ungherese.",
    "The remains of Aquincum attest to Roman settlement in the area of Hungary’s capital, Budapest.",
    "https://whc.unesco.org/en/list/400/",
    "UNESCO, Budapest, Banks of the Danube, Buda Castle Quarter and Andrássy Avenue",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "PL",
  [
   [
    "urban",
    "città",
    "urban geography",
    "Nel centro storico di Cracovia la grande piazza del mercato è il fulcro dell’impianto urbano mercantile medievale.",
    "Kraków’s large market square anchors the medieval merchant-town layout.",
    "https://whc.unesco.org/en/list/29/",
    "UNESCO, Historic Centre of Kraków",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "Cracovia fu capitale della Polonia; la cattedrale sul Wawel ospita sepolture di sovrani polacchi.",
    "Kraków was once Poland’s capital; Wawel Cathedral contains the tombs of Polish monarchs.",
    "https://whc.unesco.org/en/list/29/",
    "UNESCO, Historic Centre of Kraków",
    null,
    "2026-11-28"
   ]
  ]
 ],
 [
  "PT",
  [
   [
    "urban",
    "città",
    "urban geography",
    "Il centro storico di Porto si sviluppa sui pendii che dominano il tratto finale del fiume Douro.",
    "Porto’s historic centre occupies hillsides above the lower Douro River.",
    "https://whc.unesco.org/en/list/755/",
    "UNESCO, Historic Centre of Oporto",
    null,
    "2026-11-28"
   ],
   [
    "historical",
    "storia",
    "historical geography",
    "La storia urbana di Porto si estende per circa due millenni ed è legata all’attività portuale.",
    "Porto’s urban history spans roughly two millennia and is closely tied to its port.",
    "https://whc.unesco.org/en/list/755/",
    "UNESCO, Historic Centre of Oporto",
    null,
    "2026-11-28"
   ]
  ]
 ]
]);
export const urbanHistoryCodes=Object.freeze([...urbanHistoryRows.keys()].sort());
const corpus=composeEditorialRows([['IT',rows],['FR',franceRows],['ES',spainRows],['DE',germanyRows],...lldcCodes.map(code=>[code,lldcRows]),...sidsCodes.map(code=>[code,sidsRows]),...euContextCodes.map(code=>[code,euRows(code)]),...geoscienceRows,...regionalExtensionRows,...landscapeRows,...urbanHistoryRows]);
// Exact localized topic aliases only; English evidence remains explicitly labelled as English.
const topicAliases=Object.freeze({
 fr:Object.freeze({'géographie physique':'physical geography','orographie':'orography','hydrologie':'hydrology','océanographie':'oceanography','géologie':'geology','climatologie':'climatology','biogéographie':'biogeography','capitale':'capital','économie':'economy','géographie urbaine':'urban geography','géographie historique':'historical geography','union européenne':'european union','zone euro':'euro area','accès aux ports maritimes':'access to seaports','sids':'sids'}),
 de:Object.freeze({'physische geographie':'physical geography','orographie':'orography','hydrologie':'hydrology','ozeanographie':'oceanography','geologie':'geology','klimatologie':'climatology','biogeographie':'biogeography','hauptstadt':'capital','wirtschaft':'economy','stadtgeographie':'urban geography','historische geographie':'historical geography','europäische union':'european union','eurozone':'euro area','zugang zu seehäfen':'access to seaports','sids':'sids'}),
 es:Object.freeze({'geografía física':'physical geography','orografía':'orography','hidrología':'hydrology','oceanografía':'oceanography','geología':'geology','climatología':'climatology','biogeografía':'biogeography','capital':'capital','economía':'economy','geografía urbana':'urban geography','geografía histórica':'historical geography','unión europea':'european union','zona euro':'euro area','acceso a puertos marítimos':'access to seaports','sids':'sids'}),
 pt:Object.freeze({'geografia física':'physical geography','orografia':'orography','hidrologia':'hydrology','oceanografia':'oceanography','geologia':'geology','climatologia':'climatology','biogeografia':'biogeography','capital':'capital','economia':'economy','geografia urbana':'urban geography','geografia histórica':'historical geography','união europeia':'european union','zona euro':'euro area','acesso a portos marítimos':'access to seaports','sids':'sids'})
});
const normalize=q=>q.normalize('NFC').toLowerCase().trim().replace(/[?!.]+$/u,'').trim();
export function pilotEvidence(code,language){
 const records=corpus.get(code);if(!records)return [];
 const locale=language==='it'?'it':'en';
 return records.map(([discipline,itQuery,enQuery,it,en,source,label,period,checked='2026-11-26'])=>({id:code.toLowerCase()+'-'+discipline,discipline,text:locale==='it'?it:en,language:locale,source,label,period,checked,review:'source-checked-not-independent'}));
}
export function pilotSelection(input){
 const records=corpus.get(input.code);if(!records)return [];
 const q=normalize(input.question);
 if(Object.hasOwn(topicAliases,input.language)){
  const aliases=topicAliases[input.language];
  const dated=q.match(/^(.*?)\\s+(\\d{4})$/u);
  const topic=dated?dated[1]:q;
  if(!Object.hasOwn(aliases,topic))return [];
  // A year is never discarded; it must match the stored query verbatim.
  const key=aliases[topic]+(dated?' '+dated[2]:'');
  return records.filter(r=>r[2]===key).map(r=>input.code.toLowerCase()+'-'+r[0]);
 }
 if(!['it','en'].includes(input.language))return [];
 const alias=input.language==='it'?{'qual è la capitale':'capitale','qual è la popolazione':'popolazione','geografia fisica':'territorio','idrologia':'idrografia','climatologia':'clima','geografia politica':'capitale','geografia umana':'popolazione','geografia economica':'economia','geografia urbana':'città','geografia storica':'storia'}:{'what is the capital':'capital','what is the population':'population','climate':'climatology'};
 const key=Object.hasOwn(alias,q)?alias[q]:q;
 return records.filter(r=>r[input.language==='it'?1:2]===key).map(r=>input.code.toLowerCase()+'-'+r[0]);
}

/** Editorial slots only: statistics and regional classifications are not independent reviews. */
export function editorialCoverage(codes){
 const unique=[...new Set(codes)];
 const byDiscipline=Object.fromEntries(disciplines.map(d=>[d,0]));
 const profiles=unique.map(code=>{
  const available=new Set(pilotEvidence(code,'en').map(f=>f.discipline));
  const covered=disciplines.filter(d=>available.has(d));
  const missing=disciplines.filter(d=>!available.has(d));
  for(const d of covered)byDiscipline[d]++;
  return {code,covered,missing};
 });
 const filled=Object.values(byDiscipline).reduce((sum,n)=>sum+n,0);
 return {totalCountries:unique.length,totalSlots:unique.length*disciplines.length,filled,
  complete:profiles.filter(p=>!p.missing.length).length,
  partial:profiles.filter(p=>p.covered.length&&p.missing.length).length,
  empty:profiles.filter(p=>!p.covered.length).length,byDiscipline,profiles};
}
