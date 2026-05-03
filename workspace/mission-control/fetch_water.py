#!/usr/bin/env python3
"""
Fetch California Reservoir Data from CDEC RESSW report with STORAGE fallback
"""

import json
import re
import urllib.request
import datetime
import os

def fetch_reservoir_data():
    """Fetch reservoir data from CDEC RESSW report with STORAGE fallback"""
    
    url_ressw = "https://cdec.water.ca.gov/reportapp/javareports?name=RESSW"
    url_storage = "https://cdec.water.ca.gov/reportapp/javareports?name=STORAGE"
    
    # Our target reservoirs (name -> station ID)
    targets = {
        'Lake Shasta': 'SHA',
        'Lake Oroville': 'ORO', 
        'San Luis Reservoir': 'SNL',
        'Lake Berryessa': 'BER',
        'Pine Flat Lake': 'PNF',
        'Lake Success': 'SCC',
        'Millerton Lake': 'MIL',
        'Lake Perris': 'PRS',
        'Castaic Lake': 'CAS',
        'Lake Don Pedro': 'DNP',
        'Folsom Lake': 'FOL',
    }
    
    try:
        # Fetch RESSW page
        req = urllib.request.Request(url_ressw, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            html_ressw = response.read().decode('utf-8')
        
        results = []
        
        # First try: RESSW pattern for most reservoirs
        for name, station_id in targets.items():
            # Pattern 1: station_id=XXX">XXX</A></td><td...>capacity</td><td...>---</td><td...><A...>current</A></td><td...>pct</td>
            pattern1 = rf'station_id={station_id}">{station_id}</A></td><td[^>]*>([\d,]+)</td><td[^>]*>---</td><td[^>]*><A[^>]*>([\d,]+)</A></td><td[^>]*>(\d+)</td>'
            match = re.search(pattern1, html_ressw)
            
            if match:
                try:
                    capacity = float(match.group(1).replace(',', ''))
                    current = float(match.group(2).replace(',', ''))
                    pct = int(match.group(3))
                    
                    results.append({
                        "name": name,
                        "percent": pct,
                        "current": round(current / 1000000, 2),
                        "capacity": round(capacity / 1000000, 1),
                        "trend": "up" if pct > 60 else "down"
                    })
                    continue
                except Exception as e:
                    print(f"Error parsing {name} (pattern1): {e}")
            
            # Pattern 2: for rows where column 4 has a value (not ---)
            pattern2 = rf'station_id={station_id}">{station_id}</A></td><td[^>]*>([\d,]+)</td><td[^>]*>([\d,.]+)</td><td[^>]*><A[^>]*>([\d,]+)</A></td><td[^>]*>(\d+)</td>'
            match2 = re.search(pattern2, html_ressw)
            
            if match2:
                try:
                    capacity = float(match2.group(1).replace(',', ''))
                    current = float(match2.group(3).replace(',', ''))
                    pct = int(match2.group(4))
                    
                    results.append({
                        "name": name,
                        "percent": pct,
                        "current": round(current / 1000000, 2),
                        "capacity": round(capacity / 1000000, 1),
                        "trend": "up" if pct > 60 else "down"
                    })
                    continue
                except Exception as e:
                    print(f"Error parsing {name} (pattern2): {e}")
            
            print(f"Not found in RESSW: {name} ({station_id})")
        
        # Fetch STORAGE page for missing reservoirs (calculate % from capacity/current)
        req2 = urllib.request.Request(url_storage, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req2, timeout=15) as response:
            html_storage = response.read().decode('utf-8')
        
        # Storage report names mapping
        storage_names = {
            'Lake Berryessa': 'BERRYESSA',
            'Pine Flat Lake': 'PINE FLAT',
            'Lake Success': 'SUCCESS',
        }
        
        for name, storage_name in storage_names.items():
            # Check if we already have this reservoir
            if any(r['name'] == name for r in results):
                continue
            
            # Look for this reservoir in storage data
            pattern = rf'>{storage_name}<.*?<td[^>]*>([\d,.]+)</td><td[^>]*>([\d,.]+)</td><td[^>]*>([\d,.]+)</td><td[^>]*>([\d,.]+)</td><td[^>]*>(\d+)</td>'
            match = re.search(pattern, html_storage, re.DOTALL)
            
            if match:
                try:
                    capacity_af = float(match.group(1).replace(',', '')) * 1000  # Capacity in thousand AF -> AF
                    current_af = float(match.group(4).replace(',', '')) * 1000  # Current year in thousand AF -> AF
                    pct = int((current_af / capacity_af) * 100) if capacity_af > 0 else 0
                    
                    results.append({
                        "name": name,
                        "percent": pct,
                        "current": round(current_af / 1000000, 2),
                        "capacity": round(capacity_af / 1000000, 1),
                        "trend": "up" if pct > 60 else "down"
                    })
                    print(f"Added {name} from STORAGE: {pct}%")
                except Exception as e:
                    print(f"Error parsing {name} from STORAGE: {e}")
            else:
                print(f"Not found in STORAGE: {name}")
        
        results.sort(key=lambda x: x["name"])
        return results
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Fetching from CDEC RESSW + STORAGE...")
    data = fetch_reservoir_data()
    
    if data and len(data) > 0:
        output = {
            "lastUpdated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "reservoirs": data
        }
        filepath = os.path.abspath("water.json")
        print(f"Writing to: {filepath}")
        with open(filepath, "w") as f:
            json.dump(output, f, indent=2)
        if os.path.exists(filepath):
            print(f"File written successfully: {filepath}")
        print(f"Updated water.json with {len(data)} reservoirs:")
        for r in data:
            print(f"  {r['name']}: {r['percent']}%")
    else:
        print("No data retrieved")