# Third-party notices
The proprietary license governs original project contributions only. CountryInfo seed facts originated in the recovered prototype; original license notice preserved below. Runtime localized names come from browser Intl data. CesiumJS is loaded from its pinned CDN distribution, under Apache-2.0. Map data © OpenStreetMap contributors, ODbL; map tile usage is subject to OSMF policy. Esri service use is subject to its terms and attribution. No third-party assets are relicensed here.

## CountryInfo MIT License

Copyright (c) 2018 Porimol Chandro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

- Natural Earth boundary data: public domain, https://www.naturalearthdata.com/about/terms-of-use/ (v5.1.2 pinned upstream commit; fetched at runtime).
- Wikimedia Commons photographs: individual third-party licenses shown alongside each thumbnail; the proprietary license of this project does not apply to them. See original file page and license for reuse conditions.

- World Bank: World Development Indicators: UN Population Division, national statistical offices, Eurostat, UN Statistics Division (population); national statistical organizations/central banks, OECD and World Bank (GDP); UN Population Division (urban population); FAO FAOSTAT (forest area). 2024 observations acquired 2026-11-26, CC BY 4.0 with additional terms https://data.worldbank.org/summary-terms-of-use and https://www.worldbank.org/ext/en/legal/terms-conditions/datasets ; https://creativecommons.org/licenses/by/4.0/ . Filtered to registry codes, reformatted for presentation; no endorsement implied. Proprietary license does not apply to these observations.

- Optional local model Qwen2.5 1.5B: Apache-2.0, https://ollama.com/library/qwen2.5:1.5b . Qwen2.5 3B is governed by a separate Qwen Research License permitting noncommercial use only, https://ollama.com/library/qwen2.5:3b ; not approved for commercial use here. Model weights and Ollama binaries are not distributed in this repository. CI uses a temporary verified upstream Ollama v0.40.18 archive; https://github.com/ollama/ollama/releases/tag/v0.40.18 .

- WDI expansion (2024 observations acquired 2026-11-27): land area, agricultural land and arable land: FAO FAOSTAT; population density: FAO and World Bank population estimates; indicator pages and CC BY 4.0 / additional terms in docs/SOURCES.md. Snapshot includes 1,534 observations; no imputation.
