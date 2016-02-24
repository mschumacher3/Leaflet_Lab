//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //pulling in the map box tile layer and setting the max zoom
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
	}).addTo(map);

    //call getData function
    getData(map);
};

//setting the marker to a circle marker, defining as a universal varible to be pulled into the getdata function
var geojsonMarkerOptions = {
    radius: 9,
    fillColor: "#662441",
    color: "#662441",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//Retrieving the data from the geojson and adding the data to the map once it is successfully retrieved
function getData(map){
    //load the data through ajax when it is successfully read peforming the annoymous function response
    $.ajax("data/women_in_power.geojson", {
        dataType: "json",
        success: function(response){
            // //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latln) {
                  //calling the geojson options to make the marker a circle at each lat/lon's specified in the geojson called through response

                    return L.circleMarker(latln, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    });
};


$(document).ready(createMap);