var myMap3 = L.map("mapid3", {
  center: [37, -118],
  zoom: 6
});

var today = new Date();
var myDate

function mapTime(){
  
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var hours = today.getHours();
  var min = today.getMinutes();
  var sec = today.getSeconds();

  myDate = yyyy + '-' + mm + '-' + dd + ' ' + hours + ':' + min + ':' + sec;
}

refreshMap()

dropdown = d3.select("#quakeDate")

dropdown.on("change", function(){
  
  d3.event.preventDefault();
  // today = document.getElementById("quakeDate").value
  myDate = `${document.getElementById("quakeDate").value} 00:00:00`
  console.log(myDate)
  
  
  refreshMap()

})

function chooseColor(depth) {
  switch (true) {
  case depth > 2.0:
    return "#ff0000";
  case depth > 4.0 :
    return "#ff8000" ;
  case depth > 6.0:
    return "#ffbf00";
  case depth > 8.0:
    return "#ffff00";
  case depth > 8.5:
    return "#40ff00";
  default:
    return "#4000ff";
  }
}

// Adding tile layer
function refreshMap(){

  myMap3.eachLayer(function (layer) {
      
    myMap3.removeLayer(layer)
});

  
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap3);



  // Use this link to get the geojson data.
  var link = `https://predictquake.herokuapp.com//api/v1.0/past30days/${myDate}`;

  console.log(link)
  // Function that will determine the color based on the depth of an earthquake



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
          fillColor: chooseColor(feature.properties.mag),
          fillOpacity: 0.5,
          radius: (2 ** feature.properties.mag),
          weight: 1.5
        };
    },

    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h1>Magnitude: " + feature.properties.mag + "</h1> <hr> <h3>Location: " + feature.properties.place + "</h3>")
    }
      
      
  }).addTo(myMap3);
  });

}

// var legend = L.control({position: 'bottomright'});

// legend.onAdd = function() {

//   var div = L.DomUtil.create('div', 'info legend'),
//       depth = [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]
//       labels = [];

//   // loop through our density intervals and generate a label with a colored square for each interval
//   for (var i = 0; i < depth.length; i++) {
//       div.innerHTML +=
//           '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
//           depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
//   }

//   return div;
// };

// legend.addTo(myMap1);


