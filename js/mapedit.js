
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
    var floorPlanSvg = [],
        floorPlanData = {},
        nodeLocations = {},
        currentFloorPlan = {},
        floorPlanChanges = {"delete" : [], "add" : {}, "update" : {}},
        floorPlanGroups = {},

        loaded = false,
        rendered = false;

    initialize();

    function initialize() {

        // Empty floorPlan array of any previous/excess data
        floorPlanData = {};

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

                    var room = drawing.rect(result.Items[i].width, result.Items[i].height)
                        .attr({
                            x: result.Items[i].x,
                            y: result.Items[i].y,
                            fill: 'white',
                            stroke: '#E3E3E3',
                            'stroke-width': 3
                        }) 

                    var room_ID = result.Items[i].room_ID;

                    room.node.id = room_ID;
                    floorPlanSvg.push(room);    
                    floorPlanData[room_ID] = result.Items[i];
                    console.log(result.Items[i]);
                    for (var j=0; j < result.Items[i].nodes.length; j++) {

                        var node_ID = result.Items[i].nodes[j];

                        var node_xy =  compute_node_xy(room_ID, node_ID);
                        var node_x = node_xy[0];
                        var node_y = node_xy[1];


                        // draw and store device object initializer in deviceLocations object
                        nodeLocations[node_ID] = {};
                        nodeLocations[node_ID]["Icon"] = drawing.image("images/inlo-device.png", 15, 10);
                        nodeLocations[node_ID]["Icon"].attr({x: node_x, y: node_y, fill: "white", stroke: "#E3E3E3"})



                    }
                    if (rendered === false) {

                        var groupID = room_ID + "group";
                        var roomGroup = drawing.group().addClass(groupID);

                        roomGroup.add(floorPlanSvg[i].addClass(groupID));
                        roomGroup.add(nodeLocations[node_ID]["Icon"].addClass(groupID));

                        floorPlanGroups[room_ID] = roomGroup;
                    }

                }
                rendered = true;
            }

            // 
            currentFloorPlan = floorPlanData;
            floorPlanChanges = {"delete": {}, "add": {}, "update": {}};

            // set loaded to true to prevent excess loading
            loaded = true;
        }
    }


    function compute_node_xy(room_ID, node_ID) {
        var node_x,
            node_y;

        // Grab SVG coordinates so we can subtract from element coordinates 
        // to give us the actual coordinates on the SVG document.
        var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
            svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y,
        // current coordinates of room
            room_x = document.getElementById(room_ID).getBoundingClientRect().x - svgX,
            room_y = document.getElementById(room_ID).getBoundingClientRect().y - svgY,
        // current dimensions of room
            height = document.getElementById(room_ID).getBoundingClientRect().height,
            width = document.getElementById(room_ID).getBoundingClientRect().width;

        // grab raw node coordinates from floorPlanData array to determine actual node coords
        console.log(floorPlanData);
        node_x_frac = floorPlanData[room_ID][node_ID].x,
        node_y_frac = floorPlanData[room_ID][node_ID].y,

        // use raw node coordinates to compute actual node coordinates
        node_x = node_x_frac*width + room_x,
        node_y = node_y_frac*height + room_y;

        return [node_x, node_y];
    }



    //              =================================
    //              BOTTOM BAR TOOL SET FUNCTIONALITY 
    //              =================================

    // SAVE ALL DATA TO DYNAMODB (will only be used in rare cases)
    document.getElementById("save-fp-data").onclick = function(){

        window.location.href = 'dashboard.html';

        /*for (var i = floorPlan.length-1; i >= 0; i--) {

            var index = (i === 0) ? floorPlan["0"] : floorPlan[i];

            index.selectize(false).resize('stop').draggable(false);

            var Item = [{
                "room_ID": String(index.node.id),
                "floor": String(1),
                "height": String(index.node.attributes[2].nodeValue),
                "width": String(index.node.attributes[1].nodeValue),
                "x": String(index.node.attributes[3].nodeValue),
                "y": String(index.node.attributes[4].nodeValue),
                "type": String(index.type),
                "nodes": 
            }];

            $.ajax({
                method: 'PUT',
                url: String(_config.api.coreFunctionsUrl) + '/floorplan/add',
                headers: {Authorization: authToken},
                data: JSON.stringify(Item),
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
            devices = JSON.stringify(result.Items);
        }*/
    };

    document.getElementById("delete-rooms").onclick = function() {       
        for (var i = 0; i < floorPlanSvg.length; i++) {
            /*if (i === 1) {
                console.log(floorPlan[i]);
                floorPlan[i].remove()
            }*/
            console.log(floorPlanSvg);
        }
        //floorPlan[i].remove();
    };

    document.getElementById("drag").onclick = function() {

        //var dragged = false;

        for (var key in floorPlanGroups) {
            floorPlanGroups[key]
                    .draggable({snapToGrid: 5})
                    .resize('stop')
        }

        for (var key in floorPlanGroups) {
            // After the room has been dragged
            floorPlanGroups[key].on("dragend", function(e){

                    // Grab room_ID
                    var room_ID = e.target.children["0"].id;

                    // Grab SVG coordinates so we can subtract from element coordinates 
                    // to give us the actual coordinates on the SVG document.
                    var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
                        svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

                    // subtract SVG coords from new coords to get new device coords
                    var new_room_x = document.getElementById(room_ID).getBoundingClientRect().x - svgX,
                        new_room_y = document.getElementById(room_ID).getBoundingClientRect().y - svgY,
                        floor = 1;

                     // update currentFloorPlan
                    currentFloorPlan[room_ID].x = new_room_x;
                    currentFloorPlan[room_ID].y = new_room_y;

                    // add to floorPlanChanges
                    floorPlanChanges.update[room_ID] = [room_ID, floor, new_room_x, new_room_y];

                })

        }

    };

    document.getElementById("resize").onclick = function() {

        // get elements in group
        $('#draw g rect').each(function() {
            this.instance.selectize().resize({snapToGrid: 10})

            // when resizing is done
            this.instance.on('resizedone', function(e) {

                // get room_ID
                var room_ID = e.srcElement.id;

                // Grab SVG coordinates so we can subtract from element coordinates 
                // to give us the actual coordinates on the SVG document.
                var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
                    svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

                // subtract SVG coords from new coords to get new device coords
                var new_room_x = document.getElementById(room_ID).getBoundingClientRect().x - svgX,
                    new_room_y = document.getElementById(room_ID).getBoundingClientRect().y - svgY;

                var new_room_width = document.getElementById(room_ID).getBoundingClientRect().width,
                    new_room_height = document.getElementById(room_ID).getBoundingClientRect().height;

                // update currentFloorPlan with new coordinates, width and height
                currentFloorPlan[room_ID].x = new_room_x;
                currentFloorPlan[room_ID].y = new_room_y;
                currentFloorPlan[room_ID].width = new_room_width;
                currentFloorPlan[room_ID].height = new_room_height;

                // Add to floorPlanChanges
                floorPlanChanges.update[room_ID] = [room_ID, 1, new_room_x, new_room_y, new_room_width, new_room_height];


                // see how many nodes there are and store in node_count
                var node_count = currentFloorPlan[room_ID].nodes.length;

                // Iterate over all nodes in the resized room and relocate them to their new locations
                for (var node = 0; node < node_count; node++) {
                    // get node_ID
                    var node_ID = currentFloorPlan[room_ID].nodes[node],
                        // grab node coordinates
                        node_locations = compute_node_xy(room_ID, node_ID),
                        node_x = node_locations[0],
                        node_y = node_locations[1];

                    // Move target node to new node location
                    nodeLocations[node_ID].Icon.animate().move(node_x, node_y)

                }
            })
        })
    };    
    
    // clears floorplan from SVG
    document.getElementById("clear").onclick = function() {
        // clear SVG
        drawing.clear()
        loaded = false;
    };



    document.getElementById("draw-rect").onclick = function() {

        var rect = drawing.rect();
        //rect.draw();


        // Draw rectangle while mouse is held down
        drawing.on('mousedown', function(e){
            rect.draw(e)
                .attr({
                    fill: 'white',
                    stroke: '#E3E3E3',
                    'stroke-width': 3
                })
        });

        // Stop drawing on mouse up and
        // push shape to floorPlan stack
        drawing.on('mouseup', function(e){

            floorPlan.push(rect);

            rect.draw('stop');

            console.log(floorPlan);
            
        });

    };



    document.getElementById("draw-door").onclick = function() {

        // Deselect all rooms
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].selectize(false).resize('stop').draggable(false);
        }

        // ungroup elements
        console.log("floorPlan before", floorPlan);
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].ungroup(drawing);
            console.log("floorPlan[i] ungrouped", floorPlan[i]);
        }
        console.log("floorPlan after", floorPlan);

        // grab SVG coords so we can subtract them from mouse
        // coords to give us actual coords on SVG
        var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
            svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

        function addDoor(event) {

            var mouseX = event.clientX-svgX,
                mouseY = event.clientY-svgY,
                doorLength = 20,
                clickMarginError = 10;


            /* The purpose of this for loop is to go through each room
            *  in the floorPlan stack and determine exactly which wall
            *  the user clicked so that a door can be drawn and aligned
            *  properly on that wall of the room. 
            */
            for (var i = 0; i < floorPlan.length; i++) {

                // Declare variables for room attributes: X, Y, Width, Height
                var roomX = Number(floorPlan[i].node.attributes[3].nodeValue),
                    roomY = Number(floorPlan[i].node.attributes[4].nodeValue),
                    roomWidth = Number(floorPlan[i].node.attributes[1].nodeValue),
                    roomHeight = Number(floorPlan[i].node.attributes[2].nodeValue);

                // Determine if user clicked the [LEFT] wall
                if (    mouseX < roomX+clickMarginError &&
                        mouseY > roomY+(doorLength/2) && // if below roomY
                        mouseX > roomX-clickMarginError &&
                        mouseY < roomY+roomHeight-(doorLength/2) // above bottom roomY
                    )
                {
                    var door = drawing.line(mouseX, mouseY-(doorLength/2), mouseX, mouseY+(doorLength/2))
                        .stroke({color: '#888888', width: 3})
                    // Set x1, x2 coordinates to that of the room to align door with room wall
                    door.node.attributes[3].nodeValue = Number(floorPlan[i].node.attributes[3].nodeValue);
                    door.node.attributes[1].nodeValue = Number(floorPlan[i].node.attributes[3].nodeValue);
                } 
                // Determine if user clicked the [TOP] wall
                else if (   mouseY < roomY+clickMarginError && // if above click margin error
                            mouseX > roomX+(doorLength/2) && // 
                            mouseY > roomY-clickMarginError &&
                            mouseX < roomX+roomWidth-(doorLength/2)
                            ) {
                    var door = drawing.line(mouseX-(doorLength/2), mouseY, mouseX+(doorLength/2), mouseY)
                        .stroke({color: '#888888', width: 3})
                    // Set y1, y2 coordinates to that of the room to align door with room wall
                    door.node.attributes[2].nodeValue = Number(floorPlan[i].node.attributes[4].nodeValue);
                    door.node.attributes[4].nodeValue = Number(floorPlan[i].node.attributes[4].nodeValue);
                } 
                // Determine if user clicked the [RIGHT] wall
                else if (   mouseX < roomX+roomWidth+clickMarginError &&
                            mouseY > roomY+(doorLength/2) && // if below roomY
                            mouseX > roomX+roomWidth-clickMarginError &&
                            mouseY < roomY+roomHeight-(doorLength/2)
                            ) {
                    var door = drawing.line(mouseX, mouseY-(doorLength/2), mouseX, mouseY+(doorLength/2))
                        .stroke({color: '#888888', width: 3})
                    // Set x1, x2 coordinates to that of the room to align door with room wall
                    door.node.attributes[3].nodeValue = Number(floorPlan[i].node.attributes[3].nodeValue)+roomWidth;
                    door.node.attributes[1].nodeValue = Number(floorPlan[i].node.attributes[3].nodeValue)+roomWidth;
                } 
                // Determine if user clicked the [BOTTOM] wall
                else if (   mouseY < roomY+roomHeight+clickMarginError && // if above click margin error
                            mouseX > roomX+(doorLength/2) && // 
                            mouseY > roomY+roomHeight-clickMarginError &&
                            mouseX < roomX+roomWidth-(doorLength/2)
                            ) {
                    var door = drawing.line(mouseX-(doorLength/2), mouseY, mouseX+(doorLength/2), mouseY)
                        .stroke({color: '#888888', width: 3})
                    // Set y1, y2 coordinates to that of the room to align door with room wall
                    door.node.attributes[2].nodeValue = Number(floorPlan[i].node.attributes[4].nodeValue)+roomHeight;
                    door.node.attributes[4].nodeValue = Number(floorPlan[i].node.attributes[4].nodeValue)+roomHeight;
                } else {
                    continue;
                }
            }
        }

        

        document.addEventListener("click", addDoor);

    };

    /*var itemOriginalPosX = $('.inlo-icon').offset().left;
    var itemOriginalPosY = $('.inlo-icon').offset().top;

    console.log("itemOriginalPosX = " + itemOriginalPosX);
    console.log("itemOriginalPosY = " + itemOriginalPosY);*/

})







$(document).ready(function(){

    $("#items-listed-div").hide();
    $("#dropdown-sort-div").hide();

	$("#list-view-btn").click(function() {
        $("#prompt").fadeOut();
        $("#tools").fadeOut();
		$("#draw").fadeOut();
        $("#map-view-text").fadeOut();
		$("#items-listed-div").delay(500).fadeIn("slow");
        $("#dropdown-sort-div").delay(500).fadeIn("slow");
	});


	$("#map-view-btn").click(function() {
        $("#dropdown-sort-div").fadeOut();
		$("#prompt").fadeOut();
		$("#items-listed-div").fadeOut();
        $("#map-view-text").delay(500).fadeIn("slow");
        $("#draw").delay(500).fadeIn("slow");
	});

	/*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
	    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	}))*/


/*(function rideScopeWrapper($) {
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
    function requestUnicorn(UUID) {
        $.ajax({
            method: 'POST',
            url: _config.api.coreFunctionsUrl + '/floorplan/get',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                "userName": "UUID"
            }),
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
        var devices = JSON.stringify(result.Items);

        var tmpDevicesArray = [];
        // push item names to temporary array for sorting
    	for (var i = 0; i < result.Items.length; i++) {
    		tmpDevicesArray.push(result.Items[i].name);
    	}

    	tmpDevicesArray.sort();

       	for (var i = 0; i < tmpDevicesArray.length; i++) {

			// Check if value exists in Object
			for (var y in result.Items) {

				if (result.Items[y].name === tmpDevicesArray[i]) {
					$("#items-listed-content").append(
                        '<ol class="item-rows">' + '<p class="item-names">' + result.Items[y].name + '</p>' +
                        '<p class="item-rooms">' + result.Items[y].room + '</p>' + '</ol><br>'
                        );
				} else {
					continue;
				}
			}
    	}
        if (devices === "No Dynamic Devices") {
        	$("#items-listed").append("<p>"+ result.Items[0].mac_address +"</p>");
        } else {
        	console.log("result" + result);
        	for (var i = 0; i < result.Items.length; i++) {
        		$("#item-name-list").append('<ol class="item-names">' + result.Items[i].name + '</ol>');
        		$("#item-room-list").append('<ol class="item-rooms">' + result.Items[i].room + '</ol>');
        		$("#item-icon-list").append('<ol class="item-icons">' + "[" + result.Items[i].icon + "]" + '</ol>');
        	}
        }
        console.log("==== devices ====" + devices);
        displayUpdate(devices);
    }

    // Register click handler for #request button
    $(function onDocReady() {
    	handleRequestClick;
        //$('#list-view-btn').click(handleRequestClick);

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }

        requestUnicorn("UUID");
    });

    function handleRequestClick() {
        event.preventDefault();
        requestUnicorn("UUID");
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));*/


})