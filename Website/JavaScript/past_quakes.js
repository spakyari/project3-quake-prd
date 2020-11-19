var myMap = L.map("mapid", {
  center: [37, -115],
  zoom: 7
});

// Populate_DropDowns()

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
var link = 'https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2020-11-11%2000:00:00&endtime=2020-11-18%2023:59:59&maxlatitude=41.961&minlatitude=32.813&maxlongitude=-114.521&minlongitude=-124.255&minmagnitude=2.5&orderby=time';


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

function Populate_DropDowns() {

  var features = ["date", "city", "magnitude"]
  
  var APIs = {
    "date": "https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2020-11-11%2000:00:00&endtime=2020-11-18%2023:59:59&maxlatitude=41.961&minlatitude=32.813&maxlongitude=-114.521&minlongitude=-124.255&minmagnitude=2.5&orderby=time",
    "city": "https://predictquake.herokuapp.com/api/v1.0/areas",
    "magnitude": "https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2020-11-11%2000:00:00&endtime=2020-11-18%2023:59:59&maxlatitude=41.961&minlatitude=32.813&maxlongitude=-114.521&minlongitude=-124.255&minmagnitude=2.5&orderby=time"
      
  };

  var dd = d3.select("#by");

  dd.selectAll("option").remove();

  dd.append("option")
  .attr("value", "city")
  .text("city");

  dd.append("option")
  .attr("value", "magnitude")
  .text("magnitude");

 

  var i=0
  features.forEach((feature)=>{

      d3.json(APIs[feature]).then(function(response) {

        var DropDown = d3.select(`#${feature}`);

        DropDown.selectAll("option").remove();

        DropDown.append("option")
        .attr("value", "all")
        .text("All");


        response.forEach((item)=>{

            DropDown.append("option")
            .attr("value", item)
            .text(item);

        });

      });
  });

};

function update_criteria() {

  var myDrop_down = d3.event.target;

  

  criteria[String(myDrop_down.id)] = fixAll(myDrop_down.value);
    
  console.log(`value is ${myDrop_down.value}`)
  console.log(`key is ${String(myDrop_down.id)}`)


    function fixAll(myText) {


      if (myText == "All")

        {return "all"}

      else

        {return myText};

    };


}



