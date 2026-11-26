#!/usr/bin/env bash
# Copyright 2026 Gian Paolo Franceschini. All rights reserved.
set -euo pipefail
export OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1 OLLAMA_CONTEXT_LENGTH=4096
# Fail rather than pretend to be offline if an external network interface exists.
test "$(ip -o link show | wc -l)" -eq 1
ip -o link show lo >/dev/null
ollama serve >"${TMPDIR:-/tmp}/world-explorer-ollama-offline.log" 2>&1 &
pid=$!
cleanup(){ kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; }
trap cleanup EXIT
for i in $(seq 1 60); do
  if curl --noproxy '*' -fsS --max-time 2 http://127.0.0.1:11434/api/version >/dev/null; then break; fi
  sleep 1
done
curl --noproxy '*' -fsS --max-time 5 http://127.0.0.1:11434/api/version
node --test integration/ollama-real.test.mjs
