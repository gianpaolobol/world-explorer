// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
// Country/area classification from UNSD M49, consulted 2026-11-26.
// Deepest geographic grouping (intermediate region where present).
export const M49_SOURCE='https://unstats.un.org/unsd/methodology/m49/overview/';
const groups={
'015':'DZ EG LY MA SD TN',
'014':'BI KM DJ ER ET KE MG MW MU MZ RW SC SO SS UG TZ ZM ZW',
'017':'AO CM CF TD CG CD GQ GA ST',
'018':'BW SZ LS NA ZA',
'011':'BJ BF CV CI GM GH GN GW LR ML MR NE NG SN SL TG',
'029':'AG BS BB CU DM DO GD HT JM KN LC VC TT',
'013':'BZ CR SV GT HN MX NI PA',
'005':'AR BO BR CL CO EC GY PY PE SR UY VE',
'021':'CA US',
'143':'KZ KG TJ TM UZ',
'030':'CN KP JP MN KR',
'035':'BN KH ID LA MY MM PH SG TH TL VN',
'034':'AF BD BT IN IR MV NP PK LK',
'145':'AM AZ BH CY GE IQ IL JO KW LB OM QA SA PS SY TR AE YE',
'151':'BY BG CZ HU PL MD RO RU SK UA',
'154':'DK EE FI IS IE LV LT NO SE GB',
'039':'AL AD BA HR GR VA IT MT ME MK PT SM RS SI ES',
'155':'AT BE FR DE LI LU MC NL CH',
'053':'AU NZ',
'054':'FJ PG SB VU',
'057':'KI MH FM NR PW',
'061':'WS TO TV'
};
const mapping=Object.create(null);
for(const [region,codes] of Object.entries(groups))for(const code of codes.split(' ')){
 if(Object.hasOwn(mapping,code))throw new Error('Duplicate M49 country: '+code);
 mapping[code]=region;
}
export const regionCodes=Object.freeze(Object.keys(groups));
export const classifiedCountries=Object.freeze(Object.keys(mapping));
export function regionOf(code){return mapping[code]??null;}
export function regionName(region,locale='it'){
 if(!Object.hasOwn(groups,region))return null;
 const name=new Intl.DisplayNames([locale,'en'],{type:'region',fallback:'none'}).of(region);
 return name??new Intl.DisplayNames(['en'],{type:'region'}).of(region);
}
