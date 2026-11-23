# World Explorer — implementation roadmap
Owner: Gian Paolo Franceschini. Proprietary original code; public repository.
## Milestones and acceptance gates
- V0.2 baseline: import prototype, validate 195 unique ISO codes (193 UN members plus PS and VA), document sources and limitations.
- V0.3 geography: interactive globe, country boundaries, real DEM with attribution, terrain fallback, bathymetry from licensed GEBCO data; distinguish vertical exaggeration and actual elevation. Test mountain, coastal and ocean locations.
- V0.4 cinematic travel: globe-to-country flights, regional waypoints, pause/resume, cancellation, projector mode, narration synchronization and credited photographs. Test transitions and offline failures.
- V0.5 guide: source-grounded multilingual answers, local Ollama and optional server-side API, no exposed secrets, uncertainty and source links, prompt injection tests. Italian default; language coverage depends on available voices and translation sources.
- V0.6 learning: adaptive questions, spaced repetition, topic mastery, local history, export/delete, no mandatory account. Test persistence and scheduling.
- V0.7 remote: authenticated phone controller on LAN, pairing, revocation, no public unauthenticated endpoints.
- V0.8 editorial: verify 195 country profiles, disputed boundaries, dates, source provenance and all twelve geography disciplines.
- V0.9 QA: browser/device/projector tests, accessibility, performance, security and privacy audit.
- V1.0 release only after acceptance gates pass.
## Editorial disciplines
Physical geography, orography, hydrology, oceanography, geology, climatology, biogeography, political, human, economic, urban and historical geography.
## Review
Ten specialist review roles and ten independent verification roles; 100 cross-check assignments. Record evidence and unresolved defects; do not claim agent execution or completion without results.
## Sources
Evaluate Natural Earth, GEBCO, Copernicus DEM, Wikimedia Commons, Wikidata and UN datasets. Record license, attribution, date and resolution for each asset; no unlicensed redistribution.
