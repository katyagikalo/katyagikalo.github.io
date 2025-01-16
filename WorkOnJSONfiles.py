import geopandas as gpd
import json

counties = gpd.read_file("germany_new.geojson")

# fix list issue
counties = counties.applymap(lambda x: ", ".join(map(str, x)) if isinstance(x, list) else x)
climate_data = ""

with open("climate_data_test.json") as f:
    climate_data = json.load(f)
for i, row in counties.iterrows():
    krs_code = str(int(row["krs_code"]))
    if krs_code not in climate_data:
        continue
    else:
        countie_climate_data = climate_data[krs_code]

        counties.at[i, 'parname'] = 3

counties.to_file("counties_climate_data.geojson", driver="GeoJSON")
