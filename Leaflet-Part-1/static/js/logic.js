// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

fetch(queryUrl)
  .then(response => response.json())
  .then(data => createMap(data))
  .catch(error => console.log("Error fetching earthquake data:", error));

  // Create a map
  function createMap(data) {
    var map = L.map('map').setView([37.09, -95.71], 5);
  
  // Add BaseMaps tile layer to the map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(map);
  
  // If earthquake data exists, create features and legend
    if (data && data.features) {
      createFeatures(data.features, map);
      createLegend(map); // Adding the legend after creating features
    } else {
      console.log("No earthquake data found");
    }
  }
  
function createFeatures(earthquakeData, map) {
  // Function to bind popups to each earthquake feature
  function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.place && feature.properties.time && feature.properties.mag) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
        "<hr> <p> Earthquake Magnitude: " + feature.properties.mag + "</p>");
    }
  }

  // Function to determine color based on earthquake magnitude
  function getColor(magnitude) {
    return magnitude > 5 ? "#FF0000" :
      magnitude > 4 ? "#FF8000" :
      magnitude > 3 ? "#FFBF00" :
      magnitude > 2 ? "#FFEC00" :
      magnitude > 1 ? "#83FF00" :
      "#FF00BF";
  }

  // Function to create circle markers for earthquake features
  function createCircleMarker(feature, latlng) {
    var options = {
      radius: feature.properties.mag * 4,
      fillColor: getColor(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
    };
    return L.circleMarker(latlng, options);
  }

  // Create geoJSON layer for earthquake data with circle markers and popups, and add to the map
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return createCircleMarker(feature, latlng);
    },
    onEachFeature: onEachFeature
  }).addTo(map);
}

 // Create a legend control and specify its position on the map
function createLegend(map) {
  var legend = L.control({ position: 'bottomright' });

  // Function to generate legend content
  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [-10, 10, 30, 50, 70, 90],
      labels = ['<strong>Magnitude</strong>'],
      colors = ['#7FFF00', '#FFA500', '#FFD700', '#FF8C00', '#FF4500', '#FF0000'];

// Loop through magnitude intervals and generate HTML for legend
    for (var i = 0; i < magnitudes.length; i++) {
      var start = magnitudes[i];
      var end = magnitudes[i + 1] !== undefined ? magnitudes[i + 1] : '';

  // Adjusting range representation for -10 to 10 and other ranges
      var rangeRepresentation = start === -10 ? '&minus;' + Math.abs(start) : Math.abs(start);
      rangeRepresentation += end ? '&ndash;' + end : '+';

      div.innerHTML +=
        labels.push(
          '<i style="background:' + colors[i] + '"></i> ' + rangeRepresentation + '<br>'
        );
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);
}





