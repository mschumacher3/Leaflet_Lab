// my tutorials folder

//initialized map on the map view with a given view
//Instantiates a map object given a div element (or its id) and optionally an object literal with map options described below
//var map = L.map('map').setView([51.505, -0.09], 13);
//this below is another way of writing the line above
var map = L.map ('map',{
    center: [51.505, -0.09],
    zoom: 13
});

//adds tile layer and is linked with my syle tiles on MapBox
//{z} represents the zoom level; {x} is the horizontal coordinate; {y} is the vertical coordinate; 
//{s} represents the server instance from which the tiles are drawn
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //discribes the data layer
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

//Instantiates a circle marker tbe geographical point 
var marker = L.marker([51.5, -0.09]).addTo(map);

//creates the cirlcel marker and gives it attributes and adds to map
var circle = L.circle([51.508, -0.11], 500, {
    color: 'yellow',
    fillColor: '#000000',
    fillOpacity: 0.5
}).addTo(map);

//creates a polygona and gives it specific verticies and adds to map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//blind popups mean they do not appear until they are clicked o
//creates a popup
marker.bindPopup("<b>Hello There!</b><br>I am a popup.").openPopup();
//creates a popup for the circle
circle.bindPopup("I'm a circle, duh.");
//creates a popup for the triangle/polygon
polygon.bindPopup("I am triangle.");

//standalone popup
var popup = L.popup()
    // changes the marker position to this given point
    .setLatLng([51.5, -0.09])
    //the cintent that will be displayed for the user when the popup comes
    .setContent("I am a standalone popup.")
    //Adds the popup to the map and closes the previous one
    .openOn(map);

//creates variable that overwrites the popup variable above
var popup = L.popup();

//function that displays the lat and long when clicking on the map
function onMapClick(e) {
    popup
        //Changes the marker position to the given point
        .setLatLng(e.latlng)
        //the content which will be displayed to the used then popup is displayed
        .setContent("You clicked the map at " + e.latlng.toString())
        //Adds the popup to the map and closes the previous one
        .openOn(map);
}

map.on('click', onMapClick);

/*
This does the same as the varable for add to Map as below,
but does not add specific items to the array
creates and adds a Geojson file to our map
L.geoJson(geojsonFeature).addTo(map);

GeoJSON objects passed in as an array
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
*/

//An empty GeoJSON layer is created that we will add to later
var myLayer = L.geoJson().addTo(map);
//adds a GeoJSON object to the layer
myLayer.addData(geojsonFeature);

//styles individual features based on their properties
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"state": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//Creates a GeoJSON layer and accepts an object in GeoJSON format to display on the map
L.geoJson(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

// function is passed a LatLng and should return an instance of ILayer
//pointToLayer option to create a CircleMarker
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//Creates a GeoJSON layer and accepts an object in GeoJSON format to display on the map
L.geoJson(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

//attaches a popup to features when they are clicked
//function that is called on each feature before adding it to a GeoJSON layer
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//Creates a GeoJSON layer and accepts an object in GeoJSON format to display on the map
L.geoJson(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);


//function gets called for each feature in your GeoJSON layer, and gets passed the feature and the layer
//can then utilise the values in the feature's properties to control the visibility by returning true or false
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJson(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);


