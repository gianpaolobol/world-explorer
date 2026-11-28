#!/usr/bin/env python3
"""Opt-in CEDA GEBCO 2025 ice-surface subset; never download full grid.
Copyright 2026 Gian Paolo Franceschini. Original code only.
"""
import argparse
import hashlib
import json
from pathlib import Path

SOURCE = ("https://dap.ceda.ac.uk/thredds/dodsC/bodc/gebco/global/"
          "gebco_2025/ice_surface_elevation/netcdf/GEBCO_2025.nc")
QUERY = "?lat[239:480:42959],lon[239:480:86159],elevation[239:480:42959][239:480:86159]"
DOI = "10.5285/37c52e96-24ea-67ce-e063-7086abc05f29"

def layout(degrees):
    if degrees not in (1, 2):
        raise ValueError('Expected 1 or 2 degree sampling')
    rows, cols, stride = 180//degrees, 360//degrees, 240*degrees
    first = stride//2-1
    query = f'?lat[{first}:{stride}:{first+(rows-1)*stride}],lon[{first}:{stride}:{first+(cols-1)*stride}],elevation[{first}:{stride}:{first+(rows-1)*stride}][{first}:{stride}:{first+(cols-1)*stride}]'
    return rows, cols, stride, first, query

def validate_subset(ds, degrees=2):
    rows, cols, stride, first, query = layout(degrees)
    import numpy as np
    lat, lon, z = (ds.variables[k] for k in ("lat", "lon", "elevation"))
    if z.dimensions != ("lat", "lon") or z.shape != (rows, cols):
        raise ValueError("Server did not return the bounded subset")
    if lat.shape != (rows,) or lon.shape != (cols,) or getattr(z, "units", None) not in ("m", "metres", "meters"):
        raise ValueError("Unexpected coordinate shape or elevation units")
    for axis, expected in ((lat, -90 + (first+.5 + stride*np.arange(rows))/240),
                           (lon, -180 + (first+.5 + stride*np.arange(cols))/240)):
        actual = np.ma.asarray(axis[:])
        if np.ma.getmaskarray(actual).any() or not np.allclose(actual, expected, rtol=0, atol=1e-5):
            raise ValueError("Unexpected pixel-centre coordinates")
    a = np.ma.asarray(z[:])
    mask = np.ma.getmaskarray(a)
    raw = np.asarray(a.data)
    valid = raw[~mask]
    if len(valid) < (rows*cols*16000)//16200 or not np.all(np.isfinite(valid)) or not np.all(valid == np.floor(valid)) or np.any((valid < -12000) | (valid > 10000)):
        raise ValueError("Invalid or incomplete elevation samples")
    # Broad independent sign/range sanity checks, not accuracy certification.
    probes = [
        ("Tibetan plateau", 29, 85, 2500, 8500),
        ("central Pacific", -29, -139, -8000, -1000),
        ("Sahara", 23, 13, 0, 3000),
        ("North Atlantic", 43, -39, -8000, -1000),
    ]
    observations = {}
    for name, y, x, lo, hi in probes:
        i, j = (y+90)//degrees, (x+180)//degrees
        if mask[i,j] or not lo <= raw[i,j] <= hi:
            raise ValueError("Geographic sanity check failed: " + name)
        observations[name] = {"lat":float(lat[i]), "lon":float(lon[j]), "metres":int(raw[i,j])}
    values = [None if m else int(v) for v, m in zip(raw.flat, mask.flat)]
    grid = {"format":f"gebco-2025-ice-surface-stride{stride}-v1","rows":rows,"cols":cols,"values":values}
    return grid, {"source":SOURCE,"doi":DOI,"constraint":query,"sample_degrees":degrees,"valid_samples":len(valid),
                  "min_m":int(valid.min()),"max_m":int(valid.max()),"probes":observations,
                  "note":"Broad geographic sanity checks only; not survey accuracy or navigation."}

def acquire(destination, degrees=2):
    from netCDF4 import Dataset
    with Dataset(SOURCE + layout(degrees)[4], "r") as ds:
        grid, report = validate_subset(ds, degrees)
    data = json.dumps(grid, separators=(",", ":"), allow_nan=False).encode("utf-8")
    report["sha256"] = hashlib.sha256(data).hexdigest()
    with Path(destination).open("xb") as f:
        f.write(data)
    print(json.dumps(report, indent=2, allow_nan=False))

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("destination", type=Path)
    p.add_argument("--degrees", type=int, choices=(1, 2), default=2)
    args = p.parse_args()
    acquire(args.destination, args.degrees)
