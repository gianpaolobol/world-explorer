# World Explorer — Atlante Vivente

Anteprima V0.3.0, non una release definitiva.

## Avvio locale
Dal repository, eseguire `python -m http.server 8765 --bind 127.0.0.1` (Windows: `py -m http.server 8765 --bind 127.0.0.1`). Aprire http://127.0.0.1:8765/ in Chrome o Edge. Internet e WebGL necessari per il globo. Usare Schermo intero per proiettare. Il rilievo Esri è opzionale e non collaudato; il viaggio automatico privilegia le destinazioni meno visitate.

## Test
Node 22: `npm test`. La CI esegue i test unitari e controlla la sintassi del modulo browser. Non sostituisce il collaudo WebGL o sul proiettore.

195 voci iniziali, tutte non revisionate; 20 lingue per nomi e voce (dipende dal browser). Le capitali e superfici non sono ancora validate. Disponibile il livello visuale GEBCO 2025 (non mesh 3D), campionamento quota Esri sperimentale e viaggio con pausa/ripresa e narrazione dopo l’arrivo. Guida AI, foto, quiz integrati e batimetria numerica/3D restano da implementare. Vedi [fonti](docs/SOURCES.md) e [roadmap](docs/IMPLEMENTATION_PLAN.md).

## Diritti / Copyright
**Copyright © 2026 Gian Paolo Franceschini** — Tutti i diritti riservati esclusivamente sui contributi originali di sua legittima titolarità, nei limiti delle licenze applicabili e delle concessioni preesistenti. Restano salvi i diritti di terzi. Vedi [LICENSE](LICENSE), [RIGHTS_NOTICE.md](RIGHTS_NOTICE.md), [COPYRIGHT.md](COPYRIGHT.md) e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
