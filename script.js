// Initialize the map
const map = L.map('map').setView([51.1657, 10.4515], 6);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
}).addTo(map);

const districtDropdown = document.getElementById('district-dropdown');
const highlightedDistricts = new Map();
const infoBoxContainer = document.getElementById('info-box-container');

let geoJsonLayer;

const defaultStyle = {
    fillColor: 'rgba(255, 255, 255, 0.8)',
    weight: 2,
    opacity: 1,
    color: 'grey',
    fillOpacity: 0.5
};

const highlightStyle = {
    fillColor: 'yellow',
    weight: 2,
    opacity: 1,
    color: 'orange',
    fillOpacity: 0.7
};

// Fetch GeoJSON and add layers
fetch('merged_counties_all.geojson')
    .then(response => response.json())
    .then(data => {
        geoJsonLayer = L.geoJSON(data, {
            style: defaultStyle,
            onEachFeature: (feature, layer) => {
                const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

                // Add to dropdown
                const option = document.createElement('option');
                option.value = districtName;
                option.textContent = districtName;
                districtDropdown.appendChild(option);

                // Add click interactivity
                layer.on('click', () => toggleDistrictHighlight(layer, feature, filters));
            }
        }).addTo(map);

        map.fitBounds(geoJsonLayer.getBounds());
    })
    .catch(error => console.error('Error loading GeoJSON:', error));


// Toggle district highlight
function toggleDistrictHighlight(layer, feature, filters) {
    const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

    if (highlightedDistricts.has(layer)) {
        // Remove highlight and info box
        layer.setStyle(defaultStyle);
        highlightedDistricts.delete(layer);
        removeDistrictInfo(districtName);
    } else {
        // Highlight the district and add its info box with current filter values
        layer.setStyle(highlightStyle);
        highlightedDistricts.set(layer, districtName);
        addDistrictInfo(layer, feature, filters);
    }
}

function formatCropName(cropName) {
    const exceptions = {
        "potat_tot": "Potato",
        "silage_maize": "Silage Maize",
        "winter_wheat": "Winter Wheat",
        "spring_barley": "Spring Barley"
    };
    if (exceptions[cropName]) {
        return exceptions[cropName];
    }
    // Replace underscores with spaces and capitalize each word
    return cropName
        .split('_') // Split the string by underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join the words back with spaces
}

// Add district info box
function addDistrictInfo(layer, feature, filters) {
    const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';
    const krsCode = Array.isArray(feature.properties.krs_code) ? feature.properties.krs_code[0] : 'Unknown Code';
    const climateData = feature.properties.climate_data || [];

    // Filter climate data based on slider values
    const matchingData = climateData.filter(entry =>
        entry["2 metre temperature"] === filters.temperature &&
        entry["Total precipitation"] === filters.precipitation &&
        entry["Surface net short-wave (solar) radiation"] === filters.radiation
    );

    let climateHtml = '<strong>Climate Data:</strong><ul>';
    let yieldHtml = '<strong>Crop Yields (t/ha):</strong><ul>';

    if (matchingData.length > 0) {
        const params = matchingData[0];
        const temperature = params["2 metre temperature"] || "N/A";
        const precipitation = params["Total precipitation"] || "N/A";
        const radiation = params["Surface net short-wave (solar) radiation"] || "N/A";

        climateHtml += `
            <li>Temperature: ${temperature}C</li>
            <li>Humidity: 20%</li>
            <li>Rainfall: ${precipitation} mm</li>
            <li>Solar Radiation: ${radiation} W/m2</li>
        `;

        const maxYields = {};
        matchingData.forEach(entry => {
            const yields = entry["crop_yields_per_area"];
            if (yields) {
                for (const [crop, yieldValue] of Object.entries(yields)) {
                    if (!maxYields[crop] || yieldValue > maxYields[crop]) {
                        maxYields[crop] = yieldValue;
                    }
                }
            }
        });

        const sortedYields = Object.entries(maxYields)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        sortedYields.forEach(([crop, yieldValue]) => {
            const formattedCropName = formatCropName(crop);
            yieldHtml += `<li>${formattedCropName}: ${yieldValue.toFixed(1)} t/ha</li>`;
        });
    } else {
        climateHtml += '<li>No data matching filters.</li>';
        yieldHtml += '<li>No crop yield data available.</li>';
    }

    climateHtml += '</ul>';
    yieldHtml += '</ul>';

    const existingBox = document.getElementById(`info-box-${districtName}`);
    if (existingBox) {
        existingBox.innerHTML = `
            <strong>${districtName}</strong>
            <span>Code: ${krsCode}</span><br>
            ${climateHtml}
            ${yieldHtml}
        `;
        return;
    }

    const districtInfoBox = document.createElement('div');
    districtInfoBox.id = `info-box-${districtName}`;
    districtInfoBox.className = 'info-box';
    districtInfoBox.innerHTML = `
        <strong>${districtName}</strong>
        <span>Code: ${krsCode}</span><br>
        ${climateHtml}
        ${yieldHtml}
    `;

    infoBoxContainer.appendChild(districtInfoBox);
}

// Update info boxes for all highlighted districts when sliders change
function updateDistrictInfoBoxes(filters) {
    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;
        if (highlightedDistricts.has(layer)) {
            addDistrictInfo(layer, feature, filters);
        }
    });
}

// Dropdown selection (preserve multiple selections)
districtDropdown.addEventListener('change', function () {
    const selectedDistrict = this.value;

    if (!selectedDistrict) {
        // If no district is selected, do nothing
        return;
    }

    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;
        const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

        if (districtName === selectedDistrict) {
            // Highlight the district and add its info box
            if (!highlightedDistricts.has(layer)) {
                layer.setStyle(highlightStyle);
                highlightedDistricts.set(layer, districtName);
                addDistrictInfo(layer, feature, filters);
                map.fitBounds(layer.getBounds());
            }
        }
    });
});


// Event listeners for sliders
document.getElementById('temperature-slider').addEventListener('input', function () {
    filters.temperature = parseInt(this.value);
    document.getElementById('temperature-value').textContent = `${filters.temperature}C`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('precipitation-slider').addEventListener('input', function () {
    filters.precipitation = parseInt(this.value);
    document.getElementById('precipitation-value').textContent = `${filters.precipitation} mm`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('radiation-slider').addEventListener('input', function () {
    filters.radiation = parseInt(this.value);
    document.getElementById('radiation-value').textContent = `${filters.radiation} W/m2`;
    updateDistrictInfoBoxes(filters);
});

// Filters initialization
const filters = {
    temperature: 11,
    precipitation: 35,
    radiation: 5
};


function updateDistrictInfoBoxes(filters) {
    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;

        if (highlightedDistricts.has(layer)) {
            addDistrictInfo(layer, feature, filters);
        }
    });
}

function removeDistrictInfo(districtName) {
    const box = document.getElementById(`info-box-${districtName}`);
    if (box) {
        box.remove();
    }
}

// Select All functionality
document.getElementById('select-all-btn').addEventListener('click', () => {
    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;
        const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

        if (!highlightedDistricts.has(layer)) {
            // Highlight the district and add its info box
            layer.setStyle(highlightStyle);
            highlightedDistricts.set(layer, districtName);
            addDistrictInfo(layer, feature, filters);
        }
    });
});

document.getElementById('deselect-all-btn').addEventListener('click', () => {
    // Iterate through all highlighted layers
    highlightedDistricts.forEach((districtName, layer) => {
        // Reset layer style to default
        layer.setStyle(defaultStyle);

        // Remove the corresponding info box
        removeDistrictInfo(districtName);
    });

    // Clear the map of highlighted districts
    highlightedDistricts.clear();
});

