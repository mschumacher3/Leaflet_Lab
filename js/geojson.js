
 //Map of GeoJSON data from MegaCities.geojson Displayed with point symbols and popups

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    //adds tile layer and is linked with my syle tiles on MapBox
	//{z} represents the zoom level; {x} is the horizontal coordinate; {y} is the vertical coordinate; 
	//{s} represents the server instance from which the tiles are drawn
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    	//discribes the data layer
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //calls getData function
    getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //loads the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            //this creates marker icons
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };


function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loops to add feature property names and values to html string
        for (var property in feature.properties){
        	//adds the data strings to the popup
            popupContent += "<p>" + property + ": " + feature.properties[property] + " million" + "</p>";
        }
        //Binds a popup with a particular HTML content to a click on this marker
        layer.bindPopup(popupContent);
    };
};

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                	//adds the circle markers to the particular lat and long
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature,
                //filters out cities that are less than 20 million in 2015 to not be displayed 
                filter: function(feature, layer) {
                    return feature.properties.Pop_2015 > 20;
                }
            }).addTo(map);
        }
    });
};
$(document).ready(createMap);


