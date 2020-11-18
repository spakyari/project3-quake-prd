var myMap = L.map("mapid", {
  center: [40, -95],
  zoom: 5
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// Use this link to get the geojson data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function that will determine the color based on the depth of an earthquake



function chooseColor(depth) {
  switch (true) {
  case depth > 90:
    return "#ff0000";
  case depth > 70 :
    return "#ff8000" ;
  case depth > 50:
    return "#ffbf00";
  case depth > 30:
    return "#ffff00";
  case depth > -10:
    return "#40ff00";
  default:
    return "#4000ff";
  }
}
// Function to determine the radius of a circle based on the magnitude of an earthquake
function getRadius(feature) {
  return feature * 6

}

// Grabbing our GeoJSON data..
d3.json(link, function(data) {
// Creating a GeoJSON layer with the retrieved data
L.geoJson(data,{
    pointToLayer: function(feature, coordinate){
        return L.circleMarker(coordinate)
    },
  style: function(feature) {
      return {
        color: "black",
        // Call the chooseColor function to decide which color to color the circles
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.5,
        radius: getRadius(feature.properties.mag),
        weight: 1.5
      };
  },

  onEachFeature: function(feature, layer) {
    layer.bindPopup("<h1>Magnitude: " + feature.properties.mag + "</h1> <hr> <h3>Location: " + feature.properties.place + "</h3>" + "<h3>Quake Depth: " + feature.geometry.coordinates[2] + "</h3>")
  }
    
    
}).addTo(myMap);
});

var legend = L.control({position: 'bottomright'});

legend.onAdd = function() {

  var div = L.DomUtil.create('div', 'info legend'),
      depth = [-10, 10, 30, 50, 70, 90]
      labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
          '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
          depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(myMap);
