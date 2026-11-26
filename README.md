# World Explorer — Atlante Vivente

Anteprima V0.5.1, non una release definitiva.

## Avvio locale
Dal repository, con Node 22, eseguire `npm start`. Il server ascolta solo su 127.0.0.1. Non esporlo tramite proxy o su LAN. Aprire http://127.0.0.1:8765/ in Chrome o Edge. Internet e WebGL necessari per il globo. Usare Schermo intero per proiettare. Il rilievo Esri è opzionale e non collaudato; il viaggio automatico privilegia le destinazioni meno visitate.

## Test
Node 22: `npm test`. La CI esegue i test unitari e controlla la sintassi del modulo browser. Non sostituisce il collaudo WebGL o sul proiettore.

195 voci iniziali, tutte non revisionate; 20 lingue per nomi e voce (dipende dal browser). Le capitali e superfici non sono ancora validate. Disponibile il livello visuale GEBCO 2025 (non mesh 3D), campionamento quota Esri sperimentale e viaggio con pausa/ripresa e narrazione dopo l’arrivo. Narrazione introduttiva e quiz adattivi sulla classificazione geografica ONU M49 dei 195 Stati integrati, con 20 modelli linguistici di testo e voce dipendente dal dispositivo. Il quiz salva solo in locale, permette esportazione e cancellazione. La revisione linguistica e il collaudo browser restano aperti. Narrazione approfondita e batimetria globale 3D restano da implementare. Vedi [fonti](docs/SOURCES.md) e [roadmap](docs/IMPLEMENTATION_PLAN.md).

## Diritti / Copyright
**Copyright © 2026 Gian Paolo Franceschini** — Tutti i diritti riservati esclusivamente sui contributi originali di sua legittima titolarità, nei limiti delle licenze applicabili e delle concessioni preesistenti. Restano salvi i diritti di terzi. Vedi [LICENSE](LICENSE), [RIGHTS_NOTICE.md](RIGHTS_NOTICE.md), [COPYRIGHT.md](COPYRIGHT.md) e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

### V0.4.1 preview
Optional Natural Earth land/disputed lines and nearby Wikimedia Commons photographs with per-file credits. Both require network and are not editorially verified; see docs/SOURCES.md. Photographs are opt-in and do not use device location.

### Guida locale V0.5 (anteprima)
Per impostazione predefinita, `npm start` non contatta Ollama: digitare «Regione statistica» (italiano) o «Statistical region» (inglese) per consultare la fonte M49. Per attivare la selezione semantica, installare separatamente Ollama, disabilitare le funzionalità cloud nel demone con OLLAMA_NO_CLOUD=1 e riavviarlo (verificare i log); tenere il servizio su 127.0.0.1:11434. Usare un modello locale già disponibile, ad esempio gemma3:4b. Impostare WORLD_EXPLORER_MODEL=gemma3:4b e WORLD_EXPLORER_LOCAL_ONLY=1 nell'ambiente del processo Node, quindi avviare npm start. In PowerShell: `$env:WORLD_EXPLORER_MODEL="gemma3:4b"; $env:WORLD_EXPLORER_LOCAL_ONLY="1"; npm start`. Nessun download automatico. L'app non può verificare che il demone sia realmente offline: l'operatore deve controllarlo. Per maggiori dettagli: https://docs.ollama.com/faq e https://docs.ollama.com/api/chat.
Il modello sceglie solo ID di estratti M49; nessun testo libero generato, nessuna ricerca web del modello o invio esplicito a cloud. Selezione potenzialmente non pertinente; le fonti sono limitate, non un profilo completo del paese. Estratto regionale in 20 lingue, nota metodologica in italiano/inglese. Nessuna persistenza delle domande nell'app; Ollama può avere propri log. Il server rifiuta origini diverse e non espone file arbitrari. Solo uso locale; nessuna autenticazione LAN ancora implementata. Ollama reale e browser da collaudare.

### Rilievo numerico regionale V0.5.1
Scaricare manualmente un piccolo sottoinsieme GEBCO 2025 (ice surface) Esri ASCII da https://download.gebco.net/downloads (oppure dai prodotti storici GEBCO). Usare una griglia 15 arc-secondi di 2–128 celle per lato (massimo circa 0,53°), entro ±85° di latitudine, senza attraversare l'antimeridiano. Estrarre il file .asc dallo ZIP e selezionarlo nel pannello Rilievo e fondali numerici. Nessun upload o persistenza. La provenienza non è verificata dal parser. Vista obliqua locale di triangoli su coordinate metriche approssimate, quote firmate in metri, esagerazione 1/5/20× esplicita e statistiche non esagerate; celle mancanti non colmate. Non è un nuovo terrain provider Cesium, non è navigazione marina e non sostituisce la verifica del datum. Il file reale e il rendering browser devono ancora essere collaudati.
