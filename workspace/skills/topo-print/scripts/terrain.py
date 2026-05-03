#!/usr/bin/env python3
"""
Topo Print - Convert elevation data to 3D printable STL files
"""

import argparse
import os
import sys

def heightmap_to_stl(image_path, output_path, scale=1.0, base_thickness=2.0, resolution=100):
    """Convert a heightmap image to STL"""
    
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        print("Installing required packages...")
        os.system("pip install pillow numpy")
        from PIL import Image
        import numpy as np
    
    print(f"Loading heightmap: {image_path}")
    img = Image.open(image_path).convert('L')
    img = img.resize((resolution, resolution))
    heightmap = np.array(img)
    
    # Normalize to 0-1
    heightmap = heightmap / 255.0
    
    # Apply scale
    heightmap = heightmap * scale * 10  # Scale factor for height
    
    print(f"Generating 3D model ({resolution}x{resolution} points)...")
    
    # Create vertices for the terrain mesh
    vertices = []
    triangles = []
    
    size = 100.0  # mm
    
    for y in range(resolution):
        for x in range(resolution):
            z = heightmap[y, x]
            vx = (x / (resolution - 1)) * size
            vy = (y / (resolution - 1)) * size
            vz = z
            vertices.append((vx, vy, vz))
    
    # Add bottom vertices for base
    for y in range(resolution):
        for x in range(resolution):
            vx = (x / (resolution - 1)) * size
            vy = (y / (resolution - 1)) * size
            vz = -base_thickness
            vertices.append((vx, vy, vz))
    
    # Generate triangles
    for y in range(resolution - 1):
        for x in range(resolution - 1):
            # Top surface
            i = y * resolution + x
            triangles.append((i, i + 1, i + resolution))
            triangles.append((i + 1, i + resolution + 1, i + resolution))
            
            # Bottom surface (reversed winding)
            i = resolution * resolution + y * resolution + x
            triangles.append((i, i + resolution, i + 1))
            triangles.append((i + 1, i + resolution, i + resolution + 1))
    
    # Write STL file
    print(f"Writing STL: {output_path}")
    with open(output_path, 'w') as f:
        f.write("solid terrain\n")
        for tri in triangles:
            v0 = vertices[tri[0]]
            v1 = vertices[tri[1]]
            v2 = vertices[tri[2]]
            
            # Calculate normal
            ux = v1[0] - v0[0]
            uy = v1[1] - v0[1]
            uz = v1[2] - v0[2]
            vx = v2[0] - v0[0]
            vy = v2[1] - v0[1]
            vz = v2[2] - v0[2]
            
            nx = uy * vz - uz * vy
            ny = uz * vx - ux * vz
            nz = ux * vy - uy * vx
            
            f.write(f"  facet normal {nx:.6f} {ny:.6f} {nz:.6f}\n")
            f.write("    outer loop\n")
            f.write(f"      vertex {v0[0]:.6f} {v0[1]:.6f} {v0[2]:.6f}\n")
            f.write(f"      vertex {v1[0]:.6f} {v1[1]:.6f} {v1[2]:.6f}\n")
            f.write(f"      vertex {v2[0]:.6f} {v2[1]:.6f} {v2[2]:.6f}\n")
            f.write("    endloop\n")
            f.write("  endfacet\n")
        f.write("endsolid terrain\n")
    
    print(f"Done! Created: {output_path}")
    print(f"Size: {size}x{size}mm, Height: {heightmap.max():.1f}mm")

def download_usgs_elevation(lat, lon, output_path, buffer=0.1):
    """Download elevation data from USGS"""
    
    print(f"Downloading USGS elevation data for: {lat}, {lon}")
    print("Note: For full USGS download, use their API or web interface")
    print("This creates a sample terrain for testing")
    
    # Create a sample heightmap for demo
    import numpy as np
    from PIL import Image
    
    resolution = 200
    x = np.linspace(0, 4 * np.pi, resolution)
    y = np.linspace(0, 4 * np.pi, resolution)
    X, Y = np.meshgrid(x, y)
    
    # Create mountain-like terrain
    heightmap = np.sin(X) * np.sin(Y) * 50 + 50
    heightmap = heightmap.astype(np.uint8)
    
    img = Image.fromarray(heightmap)
    temp_heightmap = "/tmp/temp_heightmap.png"
    img.save(temp_heightmap)
    
    heightmap_to_stl(temp_heightmap, output_path)

def main():
    parser = argparse.ArgumentParser(description="Topo Print - Terrain to STL converter")
    parser.add_argument("--image", help="Heightmap image path")
    parser.add_argument("--lat", type=float, help="Latitude for USGS download")
    parser.add_argument("--lon", type=float, help="Longitude for USGS download")
    parser.add_argument("--output", required=True, help="Output STL file path")
    parser.add_argument("--scale", type=float, default=1.0, help="Vertical scale factor")
    parser.add_argument("--base", type=float, default=2.0, help="Base thickness (mm)")
    parser.add_argument("--resolution", type=int, default=100, help="Mesh resolution")
    
    args = parser.parse_args()
    
    if args.image:
        heightmap_to_stl(args.image, args.output, args.scale, args.base, args.resolution)
    elif args.lat and args.lon:
        download_usgs_elevation(args.lat, args.lon, args.output)
    else:
        print("Usage:")
        print("  From heightmap: topo-print --image heightmap.png --output terrain.stl")
        print("  From coords:    topo-print --lat 36.107 --lon -112.113 --output terrain.stl")
        sys.exit(1)

if __name__ == "__main__":
    main()
