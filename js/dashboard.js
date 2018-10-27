
var auth = 'Bearer ' + getAuth("Authorization");
console.log(auth);

/*var authToken;
Inlo.authToken.then(function setAuthToken(token) {
    if (token) {
        authToken = token;
    } else {
        window.location.href = '/signin.html';
    }
}).catch(function handleTokenError(error) {
    alert(error);
    window.location.href = '/signin.html';
});
console.log(authToken);*/


//=============================================================
//                          SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {
    var drawing = new SVG('draw').size(500, 400)
                                .panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})


    /* Temporary stack for storing all user's floor plan data.
    ** Each index consists of an SVG object.
    */


    var floorPlanSvg = [],      // stores SVG nodes
        floorPlanData = {},     // stores initial data from database (room_ID as keys)
        deviceLocations = {},   // stores device coordinates
        deviceData = {},        // stores all device data
        loaded = false;         // Loaded boolean is set to false as default

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
                url: String(_config.api.inloApiUrl) + '/v1/floorplan',
                headers: {
                    "Authorization": "Bearer " + getAuth("Authorization")
                },
                success: completeRequest,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR);
                }
            });
            /*$.ajax({
                 url: String(_config.api.inloApiUrl) + '/v1/floorplan',
                 data: { signature: "Bearer " + getAuth("Authorization") },
                 type: "GET",
                 beforeSend: function(xhr){xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:8080');},
                 success: function() { alert('Success!' + authHeader); }
            });*/
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
                console.log(result[0]);
                console.log(result[0].rooms.length);
                // Loop through all items in database and store in floorplan array/stack
                for (var i = 0; i < result.length; i++) {

                    if (result[i].rooms.length > 0) {
                        // iterate over rooms
                        for (var j = 0; j < result[i].rooms.length; j++) {
                            var room_ID = drawing.rect(result[i].rooms[j].width, result[i].rooms[j].height)
                                .attr({
                                    x: result[i].rooms[j].x,
                                    y: result[i].rooms[j].y,
                                    fill: 'white',
                                    stroke: '#E3E3E3',
                                    'stroke-width': 3
                                }) 
                            var room_ID = result[i].rooms[j].roomID;
                            floorPlanSvg.push(room_ID);    
                            floorPlanData[result[i].room_ID] = result[i];
                        }
                    } else {continue;}
                }
            }
            //render_devices_initial();

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
            node_x_frac = floorPlanData[roomID][nodes][nodeID].x,
            node_y_frac = floorPlanData[roomID][nodes][nodeID].y,

            // use raw node coordinates to compute actual node coordinates
            node_x = node_x_frac*width + room_x,
            node_y = node_y_frac*height + room_y;

            // draw node at real location inside room
            var inloNode = drawing.image("images/inlo-device.png", 15, 10);
            inloNode.attr({x: node_x, y: node_y, fill: "white", stroke: "#E3E3E3"})

            // Determine device coordinates
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

    function relocate_device(device_ID, new_room_ID, new_node_ID, new_region) {

        var device_x, device_y;

        // Grab SVG coordinates so we can subtract from element coordinates 
        // to give us the actual coordinates on the SVG document.
        var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
            svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;
        // current coordinates of room
        var room_x = document.getElementById(new_room_ID).getBoundingClientRect().x - svgX,
            room_y = document.getElementById(new_room_ID).getBoundingClientRect().y - svgY,
        // current dimensions of room
            height = document.getElementById(new_room_ID).getBoundingClientRect().height,
            width = document.getElementById(new_room_ID).getBoundingClientRect().width;

        // grab raw node coordinates from floorPlanData array to determine actual node coords
        node_x_frac = floorPlanData[new_room_ID][nodes][new_node_ID].x,
        node_y_frac = floorPlanData[new_room_ID][nodes][new_node_ID].y,

        // use raw node coordinates to compute actual node coordinates
        node_x = node_x_frac*width + room_x,
        node_y = node_y_frac*height + room_y;

        // Determine device coordinates
        switch(new_region){
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

        // Move device to its proper location
        deviceLocations[device_ID]["Icon"].animate().move(device_x, device_y)

    }


    /*function read_devices_database(onReadComplete, relocate_device) {
        $.ajax({
            method: 'GET',
            url: _config.api.inloApiUrl + '/devices/get',
            dataType: 'jsonp',
            headers: {
                'Authorization': 'Bearer ' + getAuth("Authorization"),
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);
            }
        });

        function completeRequest(result) {

            console.log('Response received from API: ', result);
            var rawDevices = result.Items;

            for (var i = 0; i < rawDevices.length; i++) {
                console.log(rawDevices[i]);
                deviceData[rawDevices[i].deviceID] = rawDevices[i];
            }

            onReadComplete();
            relocate_device("dd2", "rm3", "d3", "F");
            relocate_device("dd2", "rm1", "d1", "N");
            relocate_device("dd2", "rm1", "d1", "F");

        }

    }*/

    load_floorplan();
    //read_devices_database(render_devices_initial, relocate_device);
})

$(document).ready(function(){

    $("#items-listed-div").hide();
    $("#dropdown-sort-div").hide();

    // When user clicks list view button
	$("#list-view-btn").click(function() {
        $("#prompt").fadeOut();
		$("#draw").fadeOut();
        $("#map-view-text").fadeOut();
        $("#edit-mode-btn").fadeOut();
		$("#items-listed-div").delay(500).fadeIn("slow");
        $("#dropdown-sort-div").delay(500).fadeIn("slow");
	});

    // When user clicks map view button
	$("#map-view-btn").click(function() {
        $("#dropdown-sort-div").fadeOut();
		$("#prompt").fadeOut();
		$("#items-listed-div").fadeOut();
        $("#map-view-text").delay(500).fadeIn("slow");
        $("#edit-mode-btn").delay(500).fadeIn("slow");
        $("#draw").delay(500).fadeIn("slow");
	});

    // When user clicks edit mode button
    $("#edit-mode-btn").click(function() {
        window.location.href = 'mapedit.html';
    });

    // Sorting listed items
	/*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
	    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	}))*/

})