
//1. Create the Leaflet map--done (in createMap())
function createMap(){
    //creates boundaries for map
    //var bounds= [[22,-128],[55,-60]]
    //creates the map
    var map = L.map('map', {
    //sets the starting center of the map
      center: [42, -99],
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
           createLegend(map, attributes);
        }

    });
        //adds 5th operator data to map
        $.ajax("data/NationalParksAverage.geojson",{
            dataType: "json",
            success: function(response){
                addAverage(response,map);
            }
        })
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Y") > -1){
            attributes.push(attribute);
        };
    };

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
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
     var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
         onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

             //create range input element (slider)
             //GOG FORSAKEN UGLY ARROWS ARE NOT SHOWING
            $(container).append('<input class="range-slider" type="range">');
            $(container).append('<button class="skip" id="reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward">Skip</button>');
          
              //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            return container;
        }
    });

    map.addControl(new SequenceControl());

    //set slider attributes
    $('.range-slider').attr({
      max: 6,
      min: 0,
      value: 0,
      step: 1,
    })
      $('#reverse').html('<img src="img/LeftArrow.png">');
      $('#forward').html('<img src="img/RightArrrow.png">');
    //Step 5: click listener for buttons
    $('.skip').click(function(){
      //get the old index value
      var index = $('.range-slider').val();

      //Step 6: increment or decrement depending on button clicked
      if ($(this).attr('id') == 'forward'){
           index++;
           index = index > 6 ? 0 : index;
      } else if ($(this).attr('id') == 'reverse'){
           index--;
           index = index < 0 ? 6 : index;
         };
      // update slider
      $('.range-slider').val(index);

      //Step 9: pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
      updateLegend(map,attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
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
            popupContent += "<p><b>Number of visitors in " + attribute + ":</b> " + props[attribute] + "</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            })
        };
    });
};
 





function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //object to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#ffffff" fill-opacity="0" stroke="#000000" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="80" y="' + circles[circle] + '"></text>';
            };


            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};

//updates the legend with the new attribute
function updateLegend(map, attribute){
    //var year = attribute[2];
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Visitors in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " ");
    };
};


//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;
    
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};



$(document).ready(createMap);


