#!/usr/bin/env python3
"""Prepare a coarse preview from the official local GEBCO 2025 ice-surface NetCDF.
Copyright 2026 Gian Paolo Franceschini. Original code only.
Requires numpy and netCDF4 (install separately in a local virtual environment).
No network requests; no original data copied to the repository.
"""
import argparse
import json
from pathlib import Path

def prepare(source, destination, degrees=2):
    if degrees not in (1, 2):
        raise ValueError('Expected 1 or 2 degree sampling')
    rows, cols, stride = 180//degrees, 360//degrees, 240*degrees
    first = stride//2-1
    import numpy as np
    from netCDF4 import Dataset
    with Dataset(source, "r") as ds:
        lat = ds.variables["lat"]
        lon = ds.variables["lon"]
        z = ds.variables["elevation"]
        if z.dimensions != ("lat", "lon") or z.shape != (43200, 86400):
            raise ValueError("Expected GEBCO 15 arc-second ice-surface layout")
        if getattr(z, "units", None) not in ("m", "metres", "meters"):
            raise ValueError("Expected metre elevations")
        expected_lat = -90 + (np.arange(43200) + .5) / 240
        expected_lon = -180 + (np.arange(86400) + .5) / 240
        if not np.allclose(lat[:], expected_lat, rtol=0, atol=1e-5) or not np.allclose(lon[:], expected_lon, rtol=0, atol=1e-5):
            raise ValueError("Unexpected GEBCO pixel-centre coordinates")
        # Read only the sampled rows; avoid loading the full 7.5GB array.
        values = []
        for i in range(first, 43200, stride):
            row = np.ma.asarray(z[i, first:86400:stride])
            for v in row:
                if np.ma.is_masked(v):
                    values.append(None)
                else:
                    n = float(v)
                    if not np.isfinite(n) or not n.is_integer() or not -12000 <= n <= 10000:
                        raise ValueError("Invalid elevation in input")
                    values.append(int(n))
    if len(values) != rows*cols or all(v is None for v in values):
        raise ValueError("Unexpected sample count")
    result = {"format":f"gebco-2025-ice-surface-stride{stride}-v1","rows":rows,"cols":cols,"values":values}
    # Never overwrite an existing file; operator chooses output path.
    with Path(destination).open("x", encoding="utf-8") as f:
        json.dump(result, f, separators=(",", ":"))
    print("GEBCO declared source; valid samples:", sum(v is not None for v in values))

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("source", type=Path, help="Official GEBCO 2025 ice-surface NetCDF")
    p.add_argument("destination", type=Path, help="New local JSON output")
    p.add_argument('--degrees', type=int, choices=(1, 2), default=2)
    a = p.parse_args()
    prepare(a.source, a.destination, a.degrees)
