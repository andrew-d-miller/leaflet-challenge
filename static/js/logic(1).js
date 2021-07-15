
// Storing API endpoint inside the URL
quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Function building the map
function mapDisplay () {


  // Creating tile layer that will be the background of our map
  var darkmode = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });
  
  var streetmode = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,      
        id: "streets-v11",
        accessToken: API_KEY
      });

  var satellitemode = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,      
        id: "satellite-v9",
        accessToken: API_KEY
      });

  // Creating group of tile types
  var baseMaps = {
    Street: streetmode,
    Dark: darkmode,
    Satellite: satellitemode
  };

  // Creating GeoJSON layer containing the features array from the tectonic plate data 
  var platePolys = new L.LayerGroup();

  d3.json(tectonicURL, function(data) {
        L.geoJSON(data, {
          style: plateStyle
        })
        .addTo(platePolys)
        });

  // Creating GeoJSON layer containing the features array from earthquake data 
  var earthquakes = new L.LayerGroup();

  d3.json(quakeURL, function(data) {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, markerStyle(feature));
      },
    // Call pop-up for each feature
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h1> Magnitude: </h1> <h2> " + feature.properties.mag+ "</h2> <hr> <h1> Location: </h1> <h2>" + feature.properties.place + "</h2>");
      }
    }).addTo(earthquakes);
  });

  // Creating overlay that can be toggled on or off
    var overlayMaps = {
        "Fault line": platePolys, 
        Earthquakes: earthquakes
    };
  
    // Creating the map 
    var quakeMap = L.map("map", {
        center: [0, 0],
        zoom: 5,
        worldCopyJump: true,
        layers: [satellite, earthquakes, platePolys]
    });

  // Passing map layers into layer control and adding layer control to the map
  L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(quakeMap);

  // Calling the legend function
  mapLegend(quakeMap);

};

//function to create the legend
function mapLegend (map) {

  colors = ["#459E22", "#7FB20E", "#BEBE02", "#B19A0F", "#B54C0B", "#C00000"];

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
    categories = ['<1', '1 to <2', '2 to <3', '3 to <4', '4 to <5', '>5'],
    labels = [];
    
    div.innerHTML += '<strong> Magnitude </strong> <br>'
    // Looping through the density intervals and generating a label with colored square for each interval
    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            categories[i] + '<br>';
    };
    return div;
 };
    legend.addTo(map);
};

//function for styling markers
function markerStyle (feature) {
  return {
      fillColor: markerColor(feature.properties.mag),
      radius: 3*feature.properties.mag,
      weight: 2,
      opacity: 1,
      color: markerColor(feature.properties.mag),
      fillOpacity: 0.7   
  };
};

//function for styling polygons
function plateStyle (feature) {
  return {
      fillColor: null,
      color: "grey",
      fillOpacity: 0
  };
};

// Function determining the color of marker based on magnitude
function markerColor(magnitude) {
  if (magnitude<1) {
    return "#459E22"}
  else if (magnitude<2) {
     return "#7FB20E"}
  else if (magnitude<3) {
     return "#BEBE02"}
  else if (magnitude<4) {
     return "#B19A0F"}
  else if (magnitude<5) {
     return "#B54C0B"}
  else if (magnitude>=5) {
     return "#C00000"}
  else {return "black"}
 };
  
//call function to display map
mapDisplay();