"""Synthetic subset contract tests, not actual geographic data."""
import importlib.util
from pathlib import Path
import unittest
import numpy as np

spec = importlib.util.spec_from_file_location("acquisition", Path(__file__).parents[1] / "scripts/acquire-ceda-relief.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class Variable:
    def __init__(self, data, dimensions, units=None):
        self.data = data
        self.dimensions = dimensions
        self.shape = data.shape
        self.units = units
    def __getitem__(self, index):
        return self.data[index]

class Dataset:
    def __init__(self):
        a = np.ma.array(np.full((90,180), -4000, dtype=float), mask=False)
        a[(29+89)//2,(85+179)//2] = 4500
        a[(23+89)//2,(13+179)//2] = 200
        self.variables = {
            "lat": Variable(-90 + (239.5 + 480*np.arange(90))/240, ("lat",)),
            "lon": Variable(-180 + (239.5 + 480*np.arange(180))/240, ("lon",)),
            "elevation": Variable(a, ("lat","lon"), "m"),
        }

class TestAcquisition(unittest.TestCase):
    def test_valid_fixture(self):
        ds = Dataset()
        ds.variables["elevation"].data[0,0] = np.ma.masked
        grid, report = module.validate_subset(ds)
        self.assertEqual(len(grid["values"]), 16200)
        self.assertIsNone(grid["values"][0])
        self.assertEqual(report["valid_samples"], 16199)
        self.assertEqual(report["probes"]["Tibetan plateau"]["metres"],4500)
    def test_shape_rejected_before_read(self):
        ds = Dataset()
        ds.variables["elevation"].shape = (43200,86400)
        with self.assertRaisesRegex(ValueError, "bounded"):
            module.validate_subset(ds)
    def test_reversed_coordinates_rejected(self):
        ds = Dataset()
        ds.variables["lat"].data = ds.variables["lat"].data[::-1]
        with self.assertRaisesRegex(ValueError, "coordinates"):
            module.validate_subset(ds)
    def test_units_rejected(self):
        ds = Dataset()
        ds.variables["elevation"].units = "km"
        with self.assertRaisesRegex(ValueError, "units"):
            module.validate_subset(ds)
    def test_nonintegral_and_nonfinite_rejected(self):
        for value in (0.1, np.nan, np.inf, -12001):
            with self.subTest(value=value):
                ds = Dataset()
                ds.variables["elevation"].data[0,0] = value
                with self.assertRaisesRegex(ValueError, "samples"):
                    module.validate_subset(ds)
    def test_missing_coverage_rejected(self):
        ds = Dataset()
        ds.variables["elevation"].data[:2] = np.ma.masked
        with self.assertRaisesRegex(ValueError, "samples"):
            module.validate_subset(ds)
    def test_geographic_probe_rejected(self):
        ds = Dataset()
        ds.variables["elevation"].data[(29+89)//2,(85+179)//2] = -100
        with self.assertRaisesRegex(ValueError, "Tibetan"):
            module.validate_subset(ds)

    def test_one_degree_subset(self):
        rows, cols, stride, first, query = module.layout(1)
        self.assertEqual((rows, cols, stride, first), (180, 360, 240, 119))
        self.assertEqual(module.layout(2)[4], module.QUERY)
        self.assertIn("lat[119:240:43079]", query)
        ds = Dataset()
        a = np.ma.array(np.full((rows, cols), -4000, dtype=float), mask=False)
        a[119,265] = 4500
        a[113,193] = 200
        ds.variables = {
            "lat": Variable(-90+(first+.5+stride*np.arange(rows))/240, ("lat",)),
            "lon": Variable(-180+(first+.5+stride*np.arange(cols))/240, ("lon",)),
            "elevation": Variable(a, ("lat","lon"), "m"),
        }
        grid, report = module.validate_subset(ds, 1)
        self.assertEqual(len(grid["values"]),64800)
        self.assertEqual(report["sample_degrees"],1)
        self.assertEqual(report["probes"]["Tibetan plateau"]["metres"],4500)
        with self.assertRaisesRegex(ValueError,"bounded"):
            module.validate_subset(ds, 2)
        with self.assertRaises(ValueError):
            module.layout(0)

if __name__ == "__main__":
    unittest.main()
