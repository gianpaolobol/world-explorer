// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
import {countries} from './countries.mjs';
import {regionOf,regionCodes} from './regions.mjs';
import {review,exportMemory} from './learning.mjs';
const registry=countries.filter(c=>regionOf(c.code));
const known=new Set(registry.map(c=>c.code));
function shuffle(items,random){
 const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function loadMemory(raw){
 const clean=Object.create(null);let parsed;
 try{parsed=JSON.parse(raw||'{}');}catch{return clean;}
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return clean;
 for(const code of known){const v=parsed[code];if(!v||typeof v!=='object')continue;
 if(['streak','correct','wrong','due'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0)&&v.streak<=v.correct&&v.due<=8640000000000000)
 clean[code]={streak:v.streak,correct:v.correct,wrong:v.wrong,due:v.due};}
 return clean;
}
export function makeQuestion(memory,now=Date.now(),random=Math.random){
 // Review overdue mistakes first, then other due reviews, then unseen countries.
 // Never present a future review. Randomize ties without overriding urgency.
 const due=shuffle(registry,random).filter(c=>(memory[c.code]?.due||0)<=now);
 const priority=c=>{const v=memory[c.code];return !v?2:v.streak===0&&v.wrong>0?0:1;};
 due.sort((a,b)=>priority(a)-priority(b)||(memory[a.code]?.due||0)-(memory[b.code]?.due||0));
 const c=due[0];if(!c)return null;
 const answer=regionOf(c.code);
 const others=shuffle(regionCodes.filter(x=>x!==answer),random).slice(0,3);
 return Object.freeze({code:c.code,answer,options:Object.freeze(shuffle([answer,...others],random))});
}
export function gradeQuestion(question,choice,memory,now=Date.now()){
 if(!question||!known.has(question.code)||question.answer!==regionOf(question.code)||!question.options.includes(choice))throw new RangeError('Invalid answer');
 const correct=choice===question.answer;
 const previous=memory[question.code]||{};
 // Bound counters to keep persisted JSON safe even if local storage is edited.
 const bounded={...previous,streak:Math.min(previous.streak||0,52),correct:Math.min(previous.correct||0,Number.MAX_SAFE_INTEGER-1),wrong:Math.min(previous.wrong||0,Number.MAX_SAFE_INTEGER-1)};
 memory[question.code]=review(bounded,correct,now);
 return correct;
}
export function quizStats(memory,now=Date.now()){
 const records=registry.map(c=>memory[c.code]).filter(Boolean);
 const scheduled=records.filter(v=>v.due>now).map(v=>v.due);
 return {total:registry.length,practiced:records.length,due:registry.filter(c=>(memory[c.code]?.due||0)<=now).length,
  mastered:records.filter(v=>v.streak>=3).length,
  retryDue:records.filter(v=>v.streak===0&&v.wrong>0&&v.due<=now).length,
  nextDue:scheduled.length?Math.min(...scheduled):null};
}
export function quizExport(memory){return exportMemory(memory,'region');}

// Quiz interface translations; other atlas languages explicitly fall back to English.
const quizCatalog={
 "it": {
  "import": "Importa quiz (JSON)",
  "importConfirm": "Sostituire la memoria locale di questo argomento con il backup?",
  "importOk": "Backup importato.",
  "importError": "Backup non valido, incompatibile o troppo grande. Memoria invariata.",
  "questions": "Domande esercitate: ",
  "countries": "Paesi esercitati: ",
  "due": " · Disponibili: ",
  "mastered": " · Consolidati (3 risposte consecutive): ",
  "mistakes": " · Errori da ripassare: ",
  "nextDue": " · Prossimo ripasso: ",
  "storage": "Memoria locale non disponibile: esporta i risultati prima di chiudere.",
  "region": "Regioni ONU M49",
  "statistics": "Confronti statistici WDI",
  "topic": "Argomento",
  "next": "Nuova domanda",
  "reset": "Cancella quiz",
  "export": "Esporta quiz",
  "exhausted": "Nessun ripasso disponibile ora. Riprova più tardi.",
  "start": "Premi Nuova domanda per esercitarti.",
  "unavailable": "Dati non disponibili.",
  "highest": "Quale paese ha il valore più alto? ",
  "lowest": "Quale paese ha il valore più basso? ",
  "correct": "Corretto! ",
  "wrong": "Risposta da ripassare. ",
  "regionQuestion": "In quale regione statistica ONU si trova ",
  "regionSource": " · Fonte ONU M49",
  "confirm": "Eliminare la memoria locale di questo argomento?",
  "heading": "Quiz geografico adattivo",
  "notice": "Le domande utilizzano la classificazione ONU M49 oppure le osservazioni WDI con anno e fonte indicati; revisione indipendente in attesa. La memoria rimane locale e separata per argomento."
 },
 "en": {
  "import": "Import quiz (JSON)",
  "importConfirm": "Replace local memory for this topic with the backup?",
  "importOk": "Backup imported.",
  "importError": "Invalid, incompatible or oversized backup. Memory unchanged.",
  "questions": "Questions practiced: ",
  "countries": "Countries practiced: ",
  "due": " · Due: ",
  "mastered": " · Mastered (3 consecutive correct): ",
  "mistakes": " · Mistakes due: ",
  "nextDue": " · Next review: ",
  "storage": "Local memory unavailable: export your results before closing.",
  "region": "UN M49 regions",
  "statistics": "WDI statistical comparisons",
  "topic": "Topic",
  "next": "New question",
  "reset": "Reset quiz",
  "export": "Export quiz",
  "exhausted": "No reviews due now. Try again later.",
  "start": "Select New question to practise.",
  "unavailable": "Data unavailable.",
  "highest": "Which country has the highest value? ",
  "lowest": "Which country has the lowest value? ",
  "correct": "Correct! ",
  "wrong": "Review this answer. ",
  "regionQuestion": "Which UN statistical region contains ",
  "regionSource": " · UN M49 source",
  "confirm": "Delete local memory for this topic?",
  "heading": "Adaptive geography quiz",
  "notice": "Questions use UN M49 classifications or WDI observations with year and source; independent review pending. Memory stays local and separate by topic."
 },
 "fr": {
  "import": "Importer le quiz (JSON)",
  "importConfirm": "Remplacer la mémoire locale de ce thème par la sauvegarde ?",
  "importOk": "Sauvegarde importée.",
  "importError": "Sauvegarde invalide, incompatible ou trop volumineuse. Mémoire inchangée.",
  "questions": "Questions travaillées : ",
  "countries": "Pays étudiés : ",
  "due": " · À réviser : ",
  "mastered": " · Maîtrisés (3 bonnes réponses consécutives) : ",
  "mistakes": " · Erreurs à revoir : ",
  "nextDue": " · Prochaine révision : ",
  "storage": "Mémoire locale indisponible : exportez vos résultats avant de fermer.",
  "region": "Régions ONU M49",
  "statistics": "Comparaisons statistiques WDI",
  "topic": "Thème",
  "next": "Nouvelle question",
  "reset": "Effacer le quiz",
  "export": "Exporter le quiz",
  "exhausted": "Aucune révision disponible. Réessayez plus tard.",
  "start": "Sélectionnez Nouvelle question pour vous entraîner.",
  "unavailable": "Données indisponibles.",
  "highest": "Quel pays a la valeur la plus élevée ? ",
  "lowest": "Quel pays a la valeur la plus faible ? ",
  "correct": "Correct ! ",
  "wrong": "Réponse à revoir. ",
  "regionQuestion": "Dans quelle région statistique de l’ONU se trouve ",
  "regionSource": " · Source ONU M49",
  "confirm": "Supprimer la mémoire locale de ce thème ?",
  "heading": "Quiz de géographie adaptatif",
  "notice": "Les questions utilisent la classification ONU M49 ou des observations WDI avec année et source ; révision indépendante en attente. La mémoire reste locale et distincte par thème."
 },
 "de": {
  "import": "Quiz importieren (JSON)",
  "importConfirm": "Lokalen Lernstand für dieses Thema durch die Sicherung ersetzen?",
  "importOk": "Sicherung importiert.",
  "importError": "Ungültige, inkompatible oder zu große Sicherung. Lernstand unverändert.",
  "questions": "Bearbeitete Fragen: ",
  "countries": "Geübte Länder: ",
  "due": " · Fällig: ",
  "mastered": " · Gefestigt (3 richtige Antworten in Folge): ",
  "mistakes": " · Fehler zur Wiederholung: ",
  "nextDue": " · Nächste Wiederholung: ",
  "storage": "Lokaler Speicher nicht verfügbar: Ergebnisse vor dem Schließen exportieren.",
  "region": "UN-M49-Regionen",
  "statistics": "WDI-Statistikvergleiche",
  "topic": "Thema",
  "next": "Neue Frage",
  "reset": "Quiz zurücksetzen",
  "export": "Quiz exportieren",
  "exhausted": "Keine Wiederholung fällig. Später erneut versuchen.",
  "start": "Wähle Neue Frage zum Üben.",
  "unavailable": "Daten nicht verfügbar.",
  "highest": "Welches Land hat den höchsten Wert? ",
  "lowest": "Welches Land hat den niedrigsten Wert? ",
  "correct": "Richtig! ",
  "wrong": "Diese Antwort wiederholen. ",
  "regionQuestion": "In welcher UN-Statistikregion liegt ",
  "regionSource": " · Quelle UN M49",
  "confirm": "Lokalen Lernstand für dieses Thema löschen?",
  "heading": "Adaptives Geografiequiz",
  "notice": "Fragen verwenden die UN-M49-Klassifikation oder WDI-Daten mit Jahr und Quelle; unabhängige Prüfung steht aus. Der Lernstand bleibt lokal und nach Thema getrennt."
 },
 "es": {
  "import": "Importar cuestionario (JSON)",
  "importConfirm": "¿Sustituir la memoria local de este tema por la copia?",
  "importOk": "Copia importada.",
  "importError": "Copia no válida, incompatible o demasiado grande. Memoria sin cambios.",
  "questions": "Preguntas practicadas: ",
  "countries": "Países practicados: ",
  "due": " · Pendientes: ",
  "mastered": " · Dominados (3 aciertos consecutivos): ",
  "mistakes": " · Errores por repasar: ",
  "nextDue": " · Próximo repaso: ",
  "storage": "Memoria local no disponible: exporta los resultados antes de cerrar.",
  "region": "Regiones ONU M49",
  "statistics": "Comparaciones estadísticas WDI",
  "topic": "Tema",
  "next": "Nueva pregunta",
  "reset": "Borrar cuestionario",
  "export": "Exportar cuestionario",
  "exhausted": "No hay repasos pendientes. Inténtalo más tarde.",
  "start": "Selecciona Nueva pregunta para practicar.",
  "unavailable": "Datos no disponibles.",
  "highest": "¿Qué país tiene el valor más alto? ",
  "lowest": "¿Qué país tiene el valor más bajo? ",
  "correct": "¡Correcto! ",
  "wrong": "Repasa esta respuesta. ",
  "regionQuestion": "¿En qué región estadística de la ONU se encuentra ",
  "regionSource": " · Fuente ONU M49",
  "confirm": "¿Eliminar la memoria local de este tema?",
  "heading": "Cuestionario geográfico adaptativo",
  "notice": "Las preguntas usan la clasificación ONU M49 u observaciones WDI con año y fuente; revisión independiente pendiente. La memoria es local y separada por tema."
 },
 "pt": {
  "import": "Importar questionário (JSON)",
  "importConfirm": "Substituir a memória local deste tema pela cópia de segurança?",
  "importOk": "Cópia importada.",
  "importError": "Cópia inválida, incompatível ou demasiado grande. Memória inalterada.",
  "questions": "Perguntas praticadas: ",
  "countries": "Países praticados: ",
  "due": " · Pendentes: ",
  "mastered": " · Dominados (3 acertos consecutivos): ",
  "mistakes": " · Erros a rever: ",
  "nextDue": " · Próxima revisão: ",
  "storage": "Memória local indisponível: exporte os resultados antes de fechar.",
  "region": "Regiões ONU M49",
  "statistics": "Comparações estatísticas WDI",
  "topic": "Tema",
  "next": "Nova pergunta",
  "reset": "Apagar questionário",
  "export": "Exportar questionário",
  "exhausted": "Nenhuma revisão pendente. Tente novamente mais tarde.",
  "start": "Selecione Nova pergunta para praticar.",
  "unavailable": "Dados indisponíveis.",
  "highest": "Qual país tem o valor mais elevado? ",
  "lowest": "Qual país tem o valor mais baixo? ",
  "correct": "Correto! ",
  "wrong": "Reveja esta resposta. ",
  "regionQuestion": "Em que região estatística da ONU se encontra ",
  "regionSource": " · Fonte ONU M49",
  "confirm": "Eliminar a memória local deste tema?",
  "heading": "Questionário geográfico adaptativo",
  "notice": "As perguntas usam a classificação ONU M49 ou observações WDI com ano e fonte; revisão independente pendente. A memória é local e separada por tema."
 }
};
export function quizLanguage(locale){return Object.hasOwn(quizCatalog,locale)?locale:'en';}
export function quizMessage(key,locale){const messages=quizCatalog[quizLanguage(locale)];if(!Object.hasOwn(messages,key))throw new RangeError('Unknown quiz message');return messages[key];}
