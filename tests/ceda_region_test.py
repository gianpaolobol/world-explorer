import importlib.util
from pathlib import Path
import unittest
import numpy as np

spec=importlib.util.spec_from_file_location("region",Path(__file__).parents[1]/"scripts/acquire-ceda-region.py")
region=importlib.util.module_from_spec(spec)
spec.loader.exec_module(region)

class Variable:
    def __init__(self,data,dimensions,units=None):
        self.data,self.dimensions,self.units=data,dimensions,units
        self.shape=data.shape
    def __getitem__(self,key):
        return self.data[key]

class Dataset:
    def __init__(self,y,x,side):
        self.variables={
            "lat":Variable(-90+(y+.5+np.arange(side))/240,("lat",)),
            "lon":Variable(-180+(x+.5+np.arange(side))/240,("lon",)),
            "elevation":Variable(np.ma.array(np.arange(side*side).reshape(side,side)-side*side//2,mask=False),("lat","lon"),"m")}

class RegionTests(unittest.TestCase):
    def test_native_bounds_and_constraint(self):
        y,x=region.bounds(40.77,14.25,128)
        self.assertEqual(region.constraint(y,x,128),f"?lat[{y}:1:{y+127}],lon[{x}:1:{x+127}],elevation[{y}:1:{y+127}][{x}:1:{x+127}]")
        self.assertLess(abs(-90+(y+64)/240-40.77),1/240)
    def test_invalid_bounds(self):
        for args in [(0,0,129),(85,0,128),(0,179.99,128),(float("nan"),0,128),(0,0,1)]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                region.bounds(*args)
    def test_ascii_north_first(self):
        y,x=region.bounds(40.77,14.25,4)
        data,report=region.convert(Dataset(y,x,4),y,x,4)
        lines=data.decode().splitlines()
        self.assertEqual(lines[6],"4 5 6 7")
        self.assertEqual(lines[-1],"-8 -7 -6 -5")
        self.assertEqual(report["valid_samples"],16)
        self.assertEqual(report["min_m"],-8)
    def test_nodata_preserved(self):
        y,x=region.bounds(40.77,14.25,8)
        ds=Dataset(y,x,8)
        ds.variables["elevation"].data[0,0]=np.ma.masked
        data,report=region.convert(ds,y,x,8)
        self.assertTrue(data.decode().splitlines()[-1].startswith("-32768 "))
        self.assertEqual(report["valid_samples"],63)
    def test_reject_coordinates_and_missing(self):
        y,x=region.bounds(40.77,14.25,8)
        ds=Dataset(y,x,8)
        ds.variables["lat"].data+=.1
        with self.assertRaisesRegex(ValueError,"centres"):
            region.convert(ds,y,x,8)
        ds=Dataset(y,x,8)
        ds.variables["elevation"].data[0,:]=np.ma.masked
        with self.assertRaisesRegex(ValueError,"samples"):
            region.convert(ds,y,x,8)
