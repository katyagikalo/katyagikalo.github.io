import geopandas as gpd
from shapely.ops import unary_union
from shapely.validation import make_valid
from shapely.geometry import MultiPolygon, Polygon

# Load the shapefile using GeoPandas
shapefile_path = "/Users/arthurdebelle/Desktop/TUM/3 - WiSe 24-25/GovTech/shapefiles/München/München_boundary.shp"
gdf = gpd.read_file(shapefile_path)

# Step 1: Check and set the correct CRS (if needed)
# If it's in lat/lon (EPSG:4326), consider converting to a projection (like UTM)
if gdf.crs != 'EPSG:4326':
    gdf = gdf.to_crs(epsg=4326)  # Convert to lat/lon (or use an appropriate CRS)

# Step 2: Ensure all geometries are valid
gdf["geometry"] = gdf["geometry"].apply(make_valid)  # Fix invalid geometries

# Step 3: Handle invalid geometries by buffering with zero (a common cleaning trick)
gdf["geometry"] = gdf["geometry"].buffer(0)

# Step 4: Remove any remaining invalid or empty geometries
gdf = gdf[gdf.is_valid & ~gdf.is_empty]

# Step 5: Simplify geometries slightly to remove overly complex or fragmented geometries
gdf["geometry"] = gdf["geometry"].simplify(tolerance=0.0001, preserve_topology=True)

# Step 6: Perform unary union to unify all polygons into a single geometry
try:
    unified_geometry = unary_union(gdf.geometry)
except Exception as e:
    print(f"Error during unification: {e}")
    exit()

# Step 7: Handle the unified geometry and extract coordinates
if unified_geometry.geom_type == "Polygon":
    # Single unified polygon
    coordinates_list = list(unified_geometry.exterior.coords)
elif unified_geometry.geom_type == "MultiPolygon":
    # Unified geometry is still a MultiPolygon (take the largest polygon, for example)
    largest_polygon = max(unified_geometry.geoms, key=lambda p: p.area)
    coordinates_list = list(largest_polygon.exterior.coords)

# Step 8: Format coordinates as [latitude, longitude]
coordinates_list = [[coord[1], coord[0]] for coord in coordinates_list]

# Plot the unified geometry to check results
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(8, 8))
gdf.plot(ax=ax, color='lightblue', edgecolor='darkblue')  # Plot original geometries for comparison
if unified_geometry.geom_type == "Polygon":
    ax.plot(*unified_geometry.exterior.xy, color='red', lw=2)  # Plot unified polygon
elif unified_geometry.geom_type == "MultiPolygon":
    for polygon in unified_geometry.geoms:
        ax.plot(*polygon.exterior.xy, color='red', lw=2)  # Plot each polygon in the MultiPolygon

#plt.show()


##########################################################################################################

from shapely.geometry import Polygon, MultiPolygon

def extract_coordinates(unified_geometry):
    """
    Extracts coordinates from a Shapely Polygon or MultiPolygon object.

    Args:
        unified_geometry: A Shapely Polygon or MultiPolygon object.

    Returns:
        A list of lists, where each inner list represents the coordinates of a polygon ring.
    """

    coordinates_list = []

    if isinstance(unified_geometry, Polygon):
        # Handle single Polygon
        for ring in [unified_geometry.exterior] + list(unified_geometry.interiors):
            coordinates_list.append(list(ring.coords))

    elif isinstance(unified_geometry, MultiPolygon):
        # Handle MultiPolygon
        for polygon in unified_geometry.geoms:  # Correct: Iterate over 'geoms' attribute
            for ring in [polygon.exterior] + list(polygon.interiors):
                coordinates_list.append(list(ring.coords))

    else:
        raise ValueError("Invalid geometry type. Expected Polygon or MultiPolygon.")

    return coordinates_list

# Assuming 'unified_geometry' holds your Shapely Polygon or MultiPolygon object
extracted_coords = extract_coordinates(unified_geometry)
print(extracted_coords)


def convex_hull(points):
    # Sort the points lexicographically (tuples are compared element by element)
    points = sorted(set(points))

    # Boring case: no points or a single point, possibly repeated multiple times.
    if len(points) <= 1:
        return points

    # 2D cross product of OA and OB vectors, i.e. z-component of their cross product.
    # A positive cross product indicates a counter-clockwise turn, 0 indicates a collinear point, and negative indicates a clockwise turn
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    # Build the lower hull
    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)

    # Build the upper hull
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)

    # Concatenate lower and upper hull to make the full hull
    # The last point of each half is omitted because it's repeated at the beginning of the other half
    return lower[:-1] + upper[:-1]


def get_extreme_points(coords):
    # Flatten the list of coordinates
    flat_coords = [point for sublist in coords for point in sublist]

    # Get the convex hull of the points
    extreme_points = convex_hull(flat_coords)
    return extreme_points

extreme_points = get_extreme_points(extracted_coords)
extreme_points_clean = []
for i in range(len(extreme_points)):
    extreme_points_clean.append([extreme_points[i][1], extreme_points[i][0]])
print("----------------")
print(extreme_points_clean)
print(len(extreme_points_clean))

##########################################################################################################
