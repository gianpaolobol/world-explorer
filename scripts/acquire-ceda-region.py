#!/usr/bin/env python3
"""Opt-in native-resolution regional GEBCO 2025 sample through CEDA DAP2.
Copyright 2026 Gian Paolo Franceschini. Original code only.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

SOURCE = ("https://dap.ceda.ac.uk/thredds/dodsC/bodc/gebco/global/"
          "gebco_2025/ice_surface_elevation/netcdf/GEBCO_2025.nc")
DOI = "10.5285/37c52e96-24ea-67ce-e063-7086abc05f29"
NODATA = -32768

def bounds(lat, lon, side):
    if not isinstance(side, int) or not 2 <= side <= 128:
        raise ValueError("Expected 2–128 cells per side")
    if not math.isfinite(lat) or not math.isfinite(lon) or not -85 < lat < 85 or not -180 <= lon < 180:
        raise ValueError("Outside regional projection domain")
    y = math.floor((lat+90)*240)-side//2
    x = math.floor((lon+180)*240)-side//2
    if x < 0 or x+side > 86400 or y < 1200 or y+side > 42000:
        raise ValueError("Region crosses longitude seam or projection boundary")
    return y,x

def constraint(y,x,side):
    yr=f"[{y}:1:{y+side-1}]"
    xr=f"[{x}:1:{x+side-1}]"
    return f"?lat{yr},lon{xr},elevation{yr}{xr}"

def convert(ds,y,x,side):
    import numpy as np
    lat,lon,z=(ds.variables[k] for k in ("lat","lon","elevation"))
    if z.dimensions != ("lat","lon") or z.shape != (side,side):
        raise ValueError("Unexpected bounded elevation shape")
    if lat.shape != (side,) or lon.shape != (side,) or getattr(z,"units",None) not in ("m","metres","meters"):
        raise ValueError("Unexpected coordinate shape or elevation units")
    for axis,expected in ((lat,-90+(y+.5+np.arange(side))/240),
                          (lon,-180+(x+.5+np.arange(side))/240)):
        actual=np.ma.asarray(axis[:])
        if np.ma.getmaskarray(actual).any() or not np.allclose(actual,expected,rtol=0,atol=1e-5):
            raise ValueError("Unexpected native sample centres")
    a=np.ma.asarray(z[:])
    raw=np.asarray(a.data)
    mask=np.ma.getmaskarray(a)
    valid=raw[~mask]
    if len(valid)<math.ceil(side*side*.98) or not np.all(np.isfinite(valid)) or not np.all(valid==np.floor(valid)) or np.any((valid < -12000)|(valid > 10000)):
        raise ValueError("Invalid or incomplete regional elevation samples")
    # ESRI ASCII expects north-first rows. GEBCO is south-first.
    rows=[" ".join(str(NODATA if m else int(v)) for v,m in zip(row,masked)) for row,masked in zip(raw[::-1],mask[::-1])]
    west=-180+x/240
    south=-90+y/240
    header=f"ncols {side}\nnrows {side}\nxllcorner {west:.12f}\nyllcorner {south:.12f}\ncellsize {1/240:.12f}\nNODATA_value {NODATA}\n"
    data=(header+"\n".join(rows)+"\n").encode("ascii")
    report={"source":SOURCE,"doi":DOI,"constraint":constraint(y,x,side),"side":side,"valid_samples":int(len(valid)),
            "west":west,"south":south,"min_m":int(valid.min()),"max_m":int(valid.max()),
            "sha256":hashlib.sha256(data).hexdigest(),"note":"Native 15 arc-second grid; not survey accuracy or navigation."}
    return data,report

def acquire(lat,lon,side,destination):
    from netCDF4 import Dataset
    y,x=bounds(lat,lon,side)
    with Dataset(SOURCE+constraint(y,x,side),"r") as ds:
        data,report=convert(ds,y,x,side)
    with Path(destination).open("xb") as f:
        f.write(data)
    print(json.dumps(report,indent=2,allow_nan=False))

if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("latitude",type=float)
    p.add_argument("longitude",type=float)
    p.add_argument("destination",type=Path)
    p.add_argument("--side",type=int,default=128)
    a=p.parse_args()
    acquire(a.latitude,a.longitude,a.side,a.destination)
