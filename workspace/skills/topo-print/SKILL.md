---
name: topo-print
description: Generate 3D printable terrain models from topographic maps and elevation data. Converts USGS elevation data, heightmaps, or GeoTIFFs into STL files ready for 3D printing. Use when Warrant needs to create landscape, mountain, or terrain models for printing.
credentials:
  - name: USGS_API_KEY
    required: false
    description: USGS National Map API key for elevation data (get from https://viewer.nationalmap.gov/registration/)
---

# Topo Print - 3D Terrain Printer

Generate 3D printable terrain models from elevation data.

## Quick Start

**Generate terrain from coordinates:**
```bash
python3 {baseDir}/scripts/terrain_from_coords.py --lat 36.107 --lon -112.113 --output grand_canyon.stl
```

**Generate terrain from USGS elevation data:**
```bash
python3 {baseDir}/scripts/download_usgs.py --region "Grand Canyon" --output terrain.stl
```

**Convert heightmap image to STL:**
```bash
python3 {baseDir}/scripts/heightmap_to_stl.py --image path/to/heightmap.png --output terrain.stl
```

## Workflow

1. **Get Coordinates** — Use Mission Control Links → USGS National Map to find your area
2. **Download Elevation** — Script pulls DEM data from USGS 3DEP
3. **Process to STL** — Convert elevation data to 3D printable model
4. **Slice & Print** — Import into Anycubic Slicer → send to printer

## Output Formats

- **STL** — Standard 3D print format
- **OBJ** — With texture coordinates
- **GLB** — For visualization

## Tips

- Higher resolution = longer processing time
- Scale factor adjusts vertical exaggeration (default 1.0)
- Base thickness adds a flat bottom to the model
