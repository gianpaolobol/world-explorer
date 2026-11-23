# Architecture
Browser presentation layer: Cesium globe, projector UI, keyboard controls and accessible panels.
Data layer: country registry, source-backed profiles, terrain and bathymetry adapters, image attribution.
Travel engine: cancellable state machine with camera, narration and timed stops.
Learning engine: local mastery, due dates, quiz generation and export/delete.
Guide: local backend bound to loopback by default, Ollama adapter, optional authenticated cloud adapter, retrieval and citations.
Remote control: separate authenticated LAN interface, explicit pairing.
Privacy: no secrets or personal learning records in public Git; external requests documented; no analytics by default.
Quality: unit tests for pure modules, integration tests for service failures, manual projector and multilingual speech checks. Track actual evidence per milestone.
