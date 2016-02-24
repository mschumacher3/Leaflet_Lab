//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())

function createMap(){
    //create the map
    var map = L.map('map', {
    //sets the starting center of the map
      center: [50, -99],
      //sets the starting zoom level
      zoom: 3,
      //sets the minimum zoom level. any further out and there is no information. constrained 
      minZoom:3
      });

     //add OSM base tilelayer
    //adds tile layer and is linked with my syle tiles on MapBox
    //{z} represents the zoom level; {x} is the horizontal coordinate; {y} is the vertical coordinate; 
    //{s} represents the server instance from which the tiles are drawn
    //Tileset Credit to: Leaflet Previews, Esri National Geographic
  L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    //sets the max zoom leve. some data disapears on the map when too zoomed in. this is a tile issue
    maxZoom: 12
    }).addTo(map);
    //calls getData function
    getData(map);

//call getData function
    getData(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .0006;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function getData(map){
    //loads my data
    $.ajax("data/NationalPark.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols, then sequence controls
            createPropSymbols(response, map);
            createSequenceControls(map);
        }
    });
};


//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
    /*//creates marker attributes.. had this twice for some reason. taking this one out. seems to work with both but unneeded
     var geojsonMarkerOptions = {
        radius: 10,
        fillColor: "#ffb31a",
        color: "#b37700",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };*/

    //4. Determine which attribute to visualize with proportional symbols
    var attribute = "2013";

    L.geoJson(data, {
        pointToLayer: function (feature, latlng){
            //5. For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);
            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius =calcPropRadius(attValue);
            var layer = L.circleMarker(latlng, options);
            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
        //adds features to map.
    }).addTo(map);
    return layer;
};

//calculate the radius of each proportional symbol
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng);
        }
    }).addTo(map);
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2014";

    //create marker options
    var options = {
        fillColor: "#ffffff",
        color: "#331a00",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.0
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
     //creates marker layer...Example 2.1 line 21
    var layer = L.marker(latlng, {
        title: feature.properties.City
    });
    //creates circle layer witht the marker
    var layer = L.circleMarker(latlng, options);

   //original popupContent changed to panelContent...Example 2.2 line 1... A little confused here
    var panelContent = "<p><b>Park:</b> " + feature.properties.Park + "</p>";

    //adds formatted attributes
    var year = attribute.split("_")[1];
    panelContent += "<p><b>Number of Visitors " + year + ":</b> " + feature.properties[attribute] + "</p>";

    //popup content that is now just the Park name
    var popupContent = feature.properties.Park;


    //bind the popup to the circle marker.. not sure how this works
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });
    //event listeners to open popup on hover
    layer.on({
        //when mouse is over prop symbol popup comes up
        mouseover: function(){
            this.openPopup();
        },
        //when mouse moves away from prop symbol, popup come off
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(popupContent);
        }
    });


    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};




/*


//Step 1: Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
};
  //Example 3.3 line 1...create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
   //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/NationalPark.geojson", {
        dataType: "json",
        success: function(response){

            createPropSymbols(response, map);
            createSequenceControls(map);

        }
    });
};

*/
$(document).ready(createMap);


