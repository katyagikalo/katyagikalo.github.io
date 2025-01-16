// Initialize the map and set its view to the center of Germany
var map = L.map('map_germany_CROP-MATE').setView([51.1657, 10.4515], 6); // Germany's center with zoom level 6

// Add OpenStreetMap tiles to the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Define the coordinates for the polygon around Bavaria
var NewCityCoordinates0 = [
    [47.66305552798364, 12.766715376099194],
    [47.47559578540252, 13.009196558229617],
    [48.12034107452676, 12.759979788139054],
    [48.58742487368135, 13.788891425212839],
    [50.38718127079562, 11.964714309757543],
    [50.53525273796473, 10.181467120936302],
    [50.03987672990113, 9.001250384187044],
    [49.589622910118244, 9.096012312282609],
    [49.73365224988176, 9.707186870968036],
    [48.93507758752413, 10.433068532075618],
    [48.4309428072249, 10.074841216959307],
    [47.64939131212717, 10.10312232078428],
    [47.57622442880113, 9.608235704557346],
    [47.27592380338732, 10.18793741660399],
    [47.561494314822625, 10.450290497255521],
    [47.41746070667839, 10.97762109510855],
    [47.41657941553193, 11.006807969701521],
    [47.69676614048624, 12.232415153211315]
];
var NewCityCoordinates1 = [[48.1580704, 11.360777], [48.1278656, 11.3896186], [48.0623947, 11.5042105], [48.0616244, 11.5087578], [48.0774915, 11.685651], [48.1048692, 11.7127047], [48.1056211, 11.7130833], [48.137117, 11.7229099], [48.1799813, 11.6955543], [48.2170076, 11.6505051], [48.225704, 11.639484], [48.2259624, 11.6389922], [48.2292444, 11.624613], [48.2480909, 11.5014069], [48.2480984, 11.4998422], [48.2457752, 11.490981], [48.2004624, 11.3908298], [48.1765327, 11.3691266], [48.163048, 11.36277]];




// Add the polygon to the map
var polygon = L.polygon(NewCityCoordinates1, {
    color: 'blue',       // Border color
    fillColor: 'lightblue', // Fill color
    fillOpacity: 0.5     // Opacity of the fill
}).addTo(map);

// Add a popup to the polygon
polygon.bindPopup("This is Ansbach, Germany.");

// Optional: Add a marker in Munich for reference
var marker = L.marker([48.137801961255896, 11.57511329742685]).addTo(map);
marker.bindPopup("Munich, Bavaria").openPopup();

// Handle map clicks to get coordinates
map.on('click', function(e) {
    // Get the clicked location coordinates
    var lat = e.latlng.lat.toFixed(5);
    var lng = e.latlng.lng.toFixed(5);

    // Update the right panel with the coordinates
    document.getElementById('coordinates').textContent = "Lat: " + lat + ", Lon: " + lng;
});


// python -> geometry avec geopandas, retrieve de ça





