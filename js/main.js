
//1. Create the Leaflet map--done (in createMap())
function createMap(){
    //creates boundaries for map
    //var bounds= [[22,-128],[55,-60]]
    //creates the map
    var map = L.map('map', {
    //sets the starting center of the map
      center: [50, -99],
      zoom: 3,
      minZoom:3,
     // maxBounds: bounds
      });

    //add OSM base tilelayer
    //Tileset Credit to: Leaflet Previews, Esri National Geographic
    L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        //sets the max zoom leve. some data disapears on the map when too zoomed in. this is a tile issue
        maxZoom: 8
    }).addTo(map);
    getData(map);
};

//calculate the radius of each proportional symbols
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
        $.ajax("data/NationalParks2009to2015.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            //call function to create proportional symbols, then sequence controls
           createPropSymbols(response, map, attributes);
           createSequenceControls(map, attributes);
        }

    });
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Add circle markers for point features to the map
//tried adding attributes
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
         pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }    
    }).addTo(map);
};
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
     //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //check
    //console.log(attribute);
    //create marker options
    var options = {
        fillColor: "#ffffff",
        color: "#331a00",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.0
    };
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

     //create marker layer...Example 2.1 line 21
    // var layer = L.marker(latlng, {
    //     title: feature.properties.City
    // });
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    //original popupContent changed to panelContent...Example 2.2 line 1... A little confused here
    var panelContent = "<p><b>Park Name:</b> " + feature.properties.ParkName + "</p>";
    //adds formatted attributes
    var year = attribute.split("_")[1];
    panelContent += "<p><b>Number of Visitors in " + year + ":</b> " + feature.properties[attribute] + "</p>";
    //popup content that is now just the Park name
    var popupContent = feature.properties.ParkName;

    //bind the popup to the circle marker
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
        // click: function(){
        //  $("#panel").html(popupContent);
        // }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
      max: 6,
      min: 0,
      value: 0,
      step: 1,
    })

    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img src="img/LeftArrow.png">');
    $('#forward').html('<img src="img/RightArrrow.png">');

    //Step 5: click listener for buttons
    $('.skip').click(function(){
      //get the old index value
      var index = $('.range-slider').val();

      //Step 6: increment or decrement depending on button clicked
      if ($(this).attr('id') == 'forward'){
           index++;
           //Step 7: if past the last attribute, wrap around to first attribute
           index = index > 6 ? 0 : index;
      } else if ($(this).attr('id') == 'reverse'){
           index--;
           //Step 7: if past the first attribute, wrap around to last attribute
           index = index < 0 ? 6 : index;
         };
      //Step 8: update slider
      $('.range-slider').val(index);

      //Step 9: pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        updatePropSymbols(map, attributes[index]);
    });
};

// Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
       if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>Park Name:</b> " + props.ParkName + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Number of visitors in " + year + ":</b> " + props[attribute] + "20</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            })
        };
    });
};
 
 
// function addAverage(response, map) {
//   var avMarkerOptions={
//     radius: 4,
//     fillColor: #ffffff,
//     color: #00e600,
//     buffer: 2.5,
//     weight: 1.5
//     opacity: 1,
//     fillOpacity:1
//     };

//   L.geoJson(response, {
//     //convert point to layer, add pop ups, interactivty with overlayButton
//     pointToLayer: function(feature, latlng) {
//       //define layer and popupContent
//       var layer2 = L.circleMarker(latlng, avMarkerOptions)
//       var popupContent="<p><b>Park Name: </b>"+feature.properties.ParkName+"</p>"
//       popupContent+="<p><b>Year: </b>"+feature.properties.20+"</p>"
//       //add functionality to button to add/remove layer2
//       $('#buttonOverlay').click(function(){
//       if (map.hasLayer(layer2)){
//           map.removeLayer(layer2);
//       } else {
//         map.addLayer(layer2);
//       }
//     });
//     //bind popup content to layer2
//       layer2.bindPopup(popupContent);
//       layer2.on({
//     //provide functionality for mouseover and mouseout
//           mouseover: function(){
//             this.openPopup();
//         },
//           mouseout: function(){
//             this.closePopup();
//           }
//         });
//         return layer2;
//       }
//   }).addTo(map);
// };


//  //FIFTH INTERACTION OPERATOR: MAKES A TOGGEL BUTTON THAT TURNS ON AVERAGES FOR THE DATA PER PARK #Overlay
//  //Might add another operator that draws lines and displays distances if possible. still looking into this. Would be
//  //geared towards visitors finding or mapping with potenial trail routes. #Calculate
// function togglePoints(){
//         //loads my data
//         $.ajax("data/NationalParksAverage.geojson", {
//         dataType: "json",
//         success: function(response){
//             //call function to create proportional symbols
//            createPropSymbolsAverage(response, map, attributes);
        
//         }
//         click: function(){
//             $("#control").html(popupContentAverage);
//         }
//     }
// }
// // creates the prop symbl for the average 
// function createPropSymbolsAverage(data, map){
//     //create a Leaflet GeoJSON layer and add it to the map for average
//     L.geoJson(data, {
//          pointToLayerAverage: function(feature, latlng){
//             return pointToLayerAverage(feature, latlng, attributes);
//         }    
//     }).addTo(map);
// };

// //similar to the pointToLayer above, but more simple.
// function pointToLayerAverage(feature, latlng, attributes){
//      //Step 4: Assign the current attribute based on the first index of the attributes array
//     var attribute = "ParkName";
//     //create marker options
//     var options = {
//         fillColor: "#ffffff",
//         color: "#00cc00",
//         weight: 1.5,
//         opacity: 1,
//         fillOpacity: 0.0
//     };
//     //create circle marker layer
//     var layer = L.circleMarker(latlng, options);
//     var popupContentAverage = feature.properties.ParkName;
//      var attValue = Number(feature.properties.ParkName);
//     //Give each feature's circle marker a radius based on its attribute value
//     options.radius = calcPropRadius(attValue);
//     return layer;
// };








$(document).ready(createMap);


