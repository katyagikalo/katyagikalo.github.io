import geopandas as gpd

# Load the shapefile using GeoPandas
shapefile_path = "/Users/arthurdebelle/Desktop/TUM/3 - WiSe 24-25/GovTech/shapefiles/München/München_boundary.shp"
gdf = gpd.read_file(shapefile_path)

# Assuming gdf is your GeoDataFrame and it always contains a "MultiPolygon" with one polygon
geometry = gdf.iloc[0].geometry  # Extract the geometry from the first (and only) row

# Directly access the first (and only) polygon in the MultiPolygon
first_polygon = list(geometry.geoms)[0]  # Extract the single polygon

# Extract its exterior coordinates
coordinates_list = list(first_polygon.exterior.coords)
coordinates_list = [[coord[1], coord[0]] for coord in coordinates_list]

# Print the result
print(f"{coordinates_list};")
print(len(coordinates_list))


# Save the coordinates to a text file
# output_file = "/Users/arthurdebelle/Desktop/TUM/3 - WiSe 24-25/GovTech/shapefiles/Düsseldorf/Düsseldorf_boundary.txt"
# with open(output_file, 'w') as file:
#     # file.write(f"{coordinates_list}")
#     for coords in coordinates_list:
#         file.write(f"{coords},\n")
#     file.write("\n")

# output_file = "/Users/arthurdebelle/Desktop/TUM/3 - WiSe 24-25/GovTech/AllGermanCities_Coordinates.txt"
# with open(output_file, 'w') as file:
#     for coords in coordinates_list:
#         file.write(f"[{coords[0]}, {coords[1]}]\n")
#     file.write("\n")

