
var dynamodb = new AWS.DynamoDB();

var authToken;
WildRydes.authToken.then(function setAuthToken(token) {
    if (token) {
        authToken = token;
    } else {
        window.location.href = '/signin.html';
    }
}).catch(function handleTokenError(error) {
    alert(error);
    window.location.href = '/signin.html';
});


//=============================================================
//                          SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {
    var drawing = new SVG('draw').size(500, 400)
                                //.panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})


    /* Temporary stack for storing all user's floor plan data.
    ** Each index consists of an SVG object.
    */

    // ARRAYS
    var floorPlanSvg = [];
    
    // BOOLEANS
    var loaded = false;

    // OBJECTS
    var floorPlanData = {},
        deviceLocations = {},
        deviceData = {};

    load_floorplan();

    function load_floorplan() {

        // Empty floorPlan array of any previous/excess data
        var i = floorPlanSvg.length;
        while (i !== 0) {floorPlanSvg.pop(); i--}

        // Checks if floorplan is loaded
        if (loaded === true) {
            console.log("Your floorplan has already been loaded.");
        } else { // if floorplan has not been loaded
            $.ajax({
                method: 'GET',
                url: String(_config.api.coreFunctionsUrl) + '/floorplan/get',
                headers: {Authorization: authToken},
                contentType: 'application/json',
                success: completeRequest,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occured when requesting devices:\n' + jqXHR.responseText);
                }
            });
        }

        function completeRequest(result) {
            console.log('Response received from API: ', result);
            var rawFloorPlan = JSON.stringify(result.Items);

            /*var tmpDevicesArray = [];

            // push item names to temporary array for sorting
            for (var i = 0; i < result.Items.length; i++) {
                tmpDevicesArray.push(result.Items[i].name);
            }
            tmpDevicesArray.sort(); // sort items*/

            // if there are no devices
            if (rawFloorPlan === "Empty") {
                $("#map-view-text").append("Map view not yet available");
            } else {
                // Loop through all items in database and store in floorplan array/stack
                for (var i = 0; i < result.Items.length; i++) {

                    var room_ID = drawing.rect(result.Items[i].width, result.Items[i].height)
                        .attr({
                            x: result.Items[i].x,
                            y: result.Items[i].y,
                            fill: 'white',
                            stroke: '#E3E3E3',
                            'stroke-width': 3
                        }) 
                    room_ID.node.id = result.Items[i].room_ID;
                    floorPlanSvg.push(room_ID);    
                    floorPlanData[result.Items[i].room_ID] = result.Items[i];
                }
            }
            render_devices_initial();

            // set loaded to true to prevent excess loading
            loaded = true;
        }
    }

    function render_devices_initial() {
        for (var key in deviceData) {

            if (deviceData[key].location === "unknown location") continue;
            var roomID = deviceData[key].location,
                nodeID = deviceData[key].node_ID,
                region = deviceData[key].region,
                device_x,
                device_y;

            // Grab SVG coordinates so we can subtract from element coordinates 
            // to give us the actual coordinates on the SVG document.
            var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
                svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

            // current coordinates of room
            var room_x = document.getElementById(roomID).getBoundingClientRect().x - svgX,
                room_y = document.getElementById(roomID).getBoundingClientRect().y - svgY,
            // current dimensions of room
                height = document.getElementById(roomID).getBoundingClientRect().height,
                width = document.getElementById(roomID).getBoundingClientRect().width;

            // grab raw node coordinates from floorPlanData array to determine actual node coords
            node_x_frac = floorPlanData[roomID][nodeID].x,
            node_y_frac = floorPlanData[roomID][nodeID].y,

            // use raw node coordinates to compute actual node coordinates
            node_x = node_x_frac*width + room_x,
            node_y = node_y_frac*height + room_y;

            // draw node at real location inside room
            var inloNode = drawing.image("images/inlo-device.png", 15, 10);
            inloNode.attr({x: node_x, y: node_y, fill: "white", stroke: "#E3E3E3"})

            switch(region){
                case "N":
                    // determine x coordinate of near device
                    if (node_x_frac < 0.5) {
                        device_x = room_x + width*0.25;
                    } else {
                        device_x = room_x + width*0.75;
                    }
                    // determine y coordinate of near device
                    if (node_y_frac < 0.5) {
                        device_y = room_y + height*0.25;
                    } else {
                        device_y = room_y + height*0.75;
                    }
                    break;
                case "F":
                    // determine x coordinate of far device
                    if (node_x_frac < 0.5) {
                        device_x = room_x + width*0.75;
                    } else {
                        device_x = room_x + width*0.25;
                    }
                    // determine y coordinate of far device
                    if (node_y_frac < 0.5) {
                        device_y = room_y + height*0.75;
                    } else {
                        device_y = room_y + height*0.25;
                    }
                    break;
            }

            // draw and store device object initializer in deviceLocations object
            deviceLocations[key] = {};
            deviceLocations[key]["Icon"] = drawing.image("images/inlo.png", 10, 10);
            deviceLocations[key]["Icon"].attr({x: device_x, y: device_y, fill: "white", stroke: "#E3E3E3"})

        }
    }

    function relocate_devices(device_ID, new_room_ID, new_node_ID, new_region) {

        //use new_room, new_node_ID and new_region to find new device x y coordinates

        deviceLocations[device_ID]["Icon"].animate().move(x, y)

    }

    function read_devices_database(onReadComplete) {
        $.ajax({
            method: 'GET',
            url: String(_config.api.coreFunctionsUrl) + '/devices/get',
            headers: {Authorization: authToken},
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);
            }
        });

        function completeRequest(result) {

            console.log('Response received from API: ', result);
            var rawDevices = result.Items;

            for (var i = 0; i < rawDevices.length; i++) {
                deviceData[rawDevices[i].deviceID] = rawDevices[i];
            }

            onReadComplete();

        }

    }

    read_devices_database(render_devices_initial);



})

$(document).ready(function(){

    $("#items-listed-div").hide();
    $("#dropdown-sort-div").hide();

	$("#list-view-btn").click(function() {
        $("#prompt").fadeOut();
		$("#draw").fadeOut();
        $("#map-view-text").fadeOut();
        $("#edit-mode-btn").fadeOut();
		$("#items-listed-div").delay(500).fadeIn("slow");
        $("#dropdown-sort-div").delay(500).fadeIn("slow");
	});


	$("#map-view-btn").click(function() {
        $("#dropdown-sort-div").fadeOut();
		$("#prompt").fadeOut();
		$("#items-listed-div").fadeOut();
        $("#map-view-text").delay(500).fadeIn("slow");
        $("#edit-mode-btn").delay(500).fadeIn("slow");
        $("#draw").delay(500).fadeIn("slow");
	});

    $("#edit-mode-btn").click(function() {
        window.location.href = '/mapedit.html';
    });

	/*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
	    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	}))*/

})







/*function render_floorplan(d) {

        // Grab SVG coordinates so we can subtract from element coordinates 
        // to give us the actual coordinates on the SVG document.
        var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
            svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

        for (var i = 0; i < floorPlanSvg.length; i++) {

            // generate random variable for device ID
            var num = Math.random() * 1000;
            var groupID = String("group"+(~~num));

            var distance = d, 
                // current coordinates of room
                x = document.getElementById(floorPlanSvg[i].node.id).getBoundingClientRect().x - svgX,
                y = document.getElementById(floorPlanSvg[i].node.id).getBoundingClientRect().y - svgY,
                // current dimensions of room
                height = document.getElementById(floorPlanSvg[i].node.id).getBoundingClientRect().height,
                width = document.getElementById(floorPlanSvg[i].node.id).getBoundingClientRect().width;

            // sample device
            var roomID = floorPlanSvg[i].node.id;
        
            var nodes = floorPlanData[roomID].nodes;

            var inloNode = drawing.image("images/inlo-device.png", 15, 10);
            if (nodes.length > 0) {
                console.log(nodes.length);
                for (var j = 0; j < nodes.length; j++) {
                    var node_x = floorPlanData[roomID][nodes[j]].x;
                    var node_y = floorPlanData[roomID][nodes[j]].y;
                    inloNode.attr({x: node_x, y: node_y, fill: "white", stroke: "#E3E3E3"})
                }
            }
           
            //var inloNode = drawing.image("images/inlo-device.png", 15, 10);
            //inloNode.attr({x: x+(width/2), y: y, fill: "white", stroke: "#E3E3E3"})

            // current coordinates of inlo device
            x_node = document.getElementById(inloNode.node.id).getBoundingClientRect().x - x - svgX,
            y_node = document.getElementById(inloNode.node.id).getBoundingClientRect().y - y - svgY;

            //inloNode.hide()
        
            switch(distance){
                case "N":
                    // determine x coordinate of near item
                    if (x_node < width/2) {
                        x = x + width*0.25;
                    } else {
                        x = x + width*0.75;
                    }
                    // determine y coordinate of near item
                    if (y_node < height/2) {
                        y = y + height*0.25;
                    } else {
                        y = y + height*0.75;
                    }
                    break;
                case "F":
                    // determine x coordinate of far item
                    if (x_node < width/2) {
                        x = x + width*0.75;
                    } else {
                        x = x + width*0.25;
                    }
                    // determine y coordinate of far item
                    if (y_node < height/2) {
                        y = y + height*0.75;
                    } else {
                        y = y + height*0.25;
                    }
                    break;
            }


            // draw device at coordinates 10, 10
            //deviceLocations[deviceID].Icon = drawing.image("images/inlo.png", 10, 10)


            //deviceLocations["DeviceID"].Icon.animate().move(x, y)

            // Animate items to correct position
            //deviceIcon.animate().move(x, y)

            console.log("floorPlan", floorPlanSvg);

        }
    }*/