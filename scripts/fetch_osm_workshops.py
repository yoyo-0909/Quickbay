#!/usr/bin/env python3
"""
Fetch named automotive-service POIs from OpenStreetMap via tiled Overpass queries.
ODbL data: show attribution "© OpenStreetMap contributors" and comply with ODbL.
This is an open-data discovery layer, not a completeness guarantee or a verified partner list.
Usage: python scripts/fetch_osm_workshops.py --out osm-workshops.csv
"""
import argparse, csv, json, math, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
# Approximate India mainland bounds plus island territories; tiling avoids one country-scale query.
BBOXES = [(6.0, 68.0, 37.2, 98.5)]
TILE = 2.0
TAGS = [
    ('shop', 'car_repair'), ('craft', 'car_repair'), ('craft', 'car_mechanic'),
    ('craft', 'car_painter'), ('shop', 'tyres'), ('amenity', 'car_wash')
]
FIELDS = ['source_record_id','osm_type','osm_id','name','category','latitude','longitude',
          'address','locality','city','district','state','pincode','phone','website',
          'opening_hours','source_url']

def tiles():
    seen=set()
    for south,west,north,east in BBOXES:
        lat=south
        while lat<north:
            lon=west
            while lon<east:
                box=(round(lat,5),round(lon,5),round(min(lat+TILE,north),5),round(min(lon+TILE,east),5))
                if box not in seen:
                    seen.add(box); yield box
                lon += TILE
            lat += TILE

def query_for(box):
    s,w,n,e=box
    clauses=''.join(f'nwr["{k}"="{v}"](area.india)({s},{w},{n},{e});' for k,v in TAGS)
    return f'[out:json][timeout:75];area["ISO3166-1"="IN"][admin_level=2]->.india;({clauses});out center tags;'

def request_overpass(query):
    body=urllib.parse.urlencode({'data':query}).encode()
    last=None
    for attempt in range(5):
        endpoint=ENDPOINTS[attempt % len(ENDPOINTS)]
        req=urllib.request.Request(endpoint,data=body,headers={
            'User-Agent':'QuickBay-OpenDataImporter/1.0 (ODbL attribution)',
            'Content-Type':'application/x-www-form-urlencoded'
        })
        try:
            with urllib.request.urlopen(req,timeout=100) as response:
                return json.loads(response.read().decode())
        except Exception as exc:
            last=exc
            time.sleep(min(60, 2 ** (attempt+1)))
    raise RuntimeError(f'Overpass failed after retries: {last}')

def row_for(el):
    t=el.get('tags',{})
    name=(t.get('name') or t.get('name:en') or '').strip()
    if not name: return None
    lat=el.get('lat', (el.get('center') or {}).get('lat'))
    lon=el.get('lon', (el.get('center') or {}).get('lon'))
    if lat is None or lon is None: return None
    category=next((v for k,v in TAGS if t.get(k)==v),'automotive_service')
    street=' '.join(x for x in [t.get('addr:housenumber'),t.get('addr:street')] if x)
    address=', '.join(x for x in [street,t.get('addr:suburb'),t.get('addr:city')] if x) or None
    osm_type=el.get('type','')
    osm_id=str(el.get('id',''))
    return {
      'source_record_id':f'osm:{osm_type}:{osm_id}','osm_type':osm_type,'osm_id':osm_id,
      'name':name,'category':category,'latitude':lat,'longitude':lon,
      'address':address,'locality':t.get('addr:suburb') or t.get('addr:neighbourhood'),
      'city':t.get('addr:city') or t.get('addr:town') or t.get('addr:village'),
      'district':t.get('addr:district') or t.get('addr:county'),
      'state':t.get('addr:state'),'pincode':t.get('addr:postcode'),
      'phone':t.get('contact:phone') or t.get('phone'),
      'website':t.get('contact:website') or t.get('website'),
      'opening_hours':t.get('opening_hours'),
      'source_url':f'https://www.openstreetmap.org/{osm_type}/{osm_id}'
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--out',default='osm-workshops.csv')
    ap.add_argument('--limit',type=int,default=0,help='Stop after this many unique named records (0 = all results)')
    ap.add_argument('--delay',type=float,default=1.5,help='Minimum seconds between public Overpass requests')
    args=ap.parse_args()
    found={}
    errors=0
    all_tiles=list(tiles())
    for idx,box in enumerate(all_tiles,1):
        try:
            payload=request_overpass(query_for(box))
            for el in payload.get('elements',[]):
                row=row_for(el)
                if row: found[row['source_record_id']]=row
            print(f'[{idx}/{len(all_tiles)}] unique named POIs: {len(found)}',flush=True)
            if args.limit and len(found)>=args.limit: break
        except Exception as exc:
            errors+=1
            print(f'[{idx}/{len(all_tiles)}] tile failed: {exc}',flush=True)
        time.sleep(max(1.0,args.delay))
    with open(args.out,'w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(found.values())
    print(json.dumps({'records':len(found),'failed_tiles':errors,'tiles_total':len(all_tiles),
                      'output':str(Path(args.out).resolve()),
                      'attribution':'© OpenStreetMap contributors','license':'ODbL-1.0'},indent=2))
if __name__=='__main__': main()
