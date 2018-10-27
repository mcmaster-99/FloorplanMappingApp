
// Prompt user if they're sure they want to leave on page exit
$(window).bind('beforeunload', function(){
  return 'Are you sure you want to leave?';
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
    var floorPlanSvg = [],      // stores SVG nodes
        floorPlanData = {},     // stores initial data from database (room_ID as keys)
        nodeLocations = {},     // stores node SVG objects with node_ID as keys
        currentFloorPlan = {},  // stores the current state of floorplan as user makes changes (room_ID as keys)
        floorPlanChanges = {"delete" : [], // stores changes that have been made during session
                            "add" : {}, 
                            "update" : {}}, 
        floorPlanGroups = {},   // each grouped room is stored with room_ID as keys

        loaded = false;
        //rendered = false;

    initialize();

    function initialize() {

        // Empty floorPlan array of any previous/excess data
        floorPlanData = {};

        // Checks if floorplan is loaded
        if (loaded === true) { drawing.clear(); floorPlanSvg = [] }
        // if floorplan has not been loaded
        $.ajax({
            method: 'GET',
            url: String(_config.api.inloApiUrl) + '/v1/floorplan',
            headers: {
                Authorization: 'Bearer ' + getAuth("Authorization")
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });

        function completeRequest(result) {
            console.log('Response received from API: ', result);
            var rawFloorPlan = JSON.stringify(result);

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
                            room_ID.node.id = result[i].rooms[j].room_ID;
                            floorPlanSvg.push(room_ID);    
                            floorPlanData[result[i].room_ID] = result[i];
                        }
                    } else {continue;}

                    // populate floorPlanData.roomID with room data
                    floorPlanData[room_ID] = result[i].rooms[i];
                    // set currentFloorPlan data equal to floorPlanData
                    currentFloorPlan = floorPlanData;
                    // initialize floorPlanChanges as empty template
                    //floorPlanChanges = {"delete": [], "add": {}, "update": {}};


                    var groupID = room_ID + "group";
                    var roomGroup = drawing.group().addClass(groupID);

                    roomGroup.add(floorPlanSvg[i].addClass(groupID));

                    // iterate over nodes
                    for (var j = 0; j < result[i].rooms[i].nodes.length; j++) {

                        var node_ID = result[i].rooms[i].nodes[i].nodeID;

                        var node_xy =  compute_node_xy(room_ID, node_ID);
                        var node_x = node_xy[0];
                        var node_y = node_xy[1];

                        // draw and store device object initializer in deviceLocations object
                        nodeLocations[node_ID] = {};
                        nodeLocations[node_ID]["Icon"] = drawing.image("images/inlo-device.png", 15, 10);
                        nodeLocations[node_ID]["Icon"].attr({x: node_x, y: node_y, fill: "white", stroke: "#E3E3E3"})

                        // add room node to room group
                        roomGroup.add(nodeLocations[node_ID]["Icon"].addClass(groupID));

                    }

                    floorPlanGroups[room_ID] = roomGroup;           

                }
            }

            // set loaded to true to prevent excess loading
            loaded = true;
        }
    }


    function compute_node_xy(room_ID, node_ID) {
        var node_x,
            node_y,
            node_x_frac,
            node_y_frac;

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
        // Determine which node has the requested node_ID

        for (var i = 0; i < currentFloorPlan[room_ID].nodes.length; i++) {

            if (node_ID === currentFloorPlan[room_ID].nodes[i].nodeID) {

                node_x_frac = currentFloorPlan[room_ID].nodes[i].x,
                node_y_frac = currentFloorPlan[room_ID].nodes[i].y;
            } else {
                continue;
            }
        }

        // use raw node coordinates to compute actual node coordinates
        node_x = node_x_frac*width + room_x,
        node_y = node_y_frac*height + room_y;

        return [node_x, node_y];
    }


    function cancel_changes() {
        // re-initialize map
        initialize();
    }

    function save_floorplan(currentFloorplan) {

        $.ajax({

            method: 'PATCH',
            url: String(_config.api.inloApiUrl) + '/v1/floorplan/{'+floorID+'}',
            headers: {Authorization: 'Bearer ' + getAuth("Authorization")},
            data: JSON.stringify(currentFloorplan),
            contentType: 'application/json',
            success: completeRequest,

            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);

            }

        });

        function completeRequest(result) {
            console.log("save complete");
            console.log("result is:", result);
        }


        floorPlanData = currentFloorPlan;

    }



    //              ========================================
    //              ========== API CALL METHODS ============
    //              ========================================
    function add_room_api_call(add_key) {

        $.ajax({
            method: 'PATCH',
            url: String(_config.api.inloApiUrl) + '/v1/room',
            headers: {Authorization: 'Bearer ' + getAuth("Authorization")},
            data: JSON.stringify(add_key),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);
            }
        });

        function completeRequest(result) {
            /*
            ** Excecute update_api_call here to add room to floorplan
            */
            console.log("save complete");
            console.log("result is:", result);
        }
    }


    function update_api_call(update_key) {

        $.ajax({
            method: 'PATCH',
            url: String(_config.api.inloApiUrl) + '/v1/floorplan/' + String(floorID),
            headers: {Authorization: 'Bearer ' + getAuth("Authorization")},
            data: JSON.stringify(update_key),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);
            }
        });

        function completeRequest(result) {
            console.log("update complete");
            console.log("result is:", result);
        }
    }

    function delete_api_call(delete_key) {

        $.ajax({
            method: 'DELETE',
            url: String(_config.api.inloApiUrl) + '/v1/floorplan/' + String(floorID),
            headers: {Authorization: 'Bearer ' + getAuth("Authorization")},
            data: JSON.stringify(delete_key),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);
            }
        });

        function completeRequest(result) {
            console.log("delete complete");
            console.log("result is:", result);
        }
    }


    // =================================================================
    //                  BOTTOM BAR TOOL SET FUNCTIONALITY 
    // =================================================================



    // *****************
    //   PRINT DATA 
    // *****************
    $("#print-data").on('click', function(){

        console.log("currentFloorPlan", currentFloorPlan);
        console.log("floorPlanChanges", floorPlanChanges);
        console.log("floorPlanSvg", floorPlanSvg);
        console.log("floorPlanGroups", floorPlanGroups);

    });


    // *****************
    //      SAVE 
    // *****************
    $("#save-fp-data").on('click', function(){

        //window.location.href = 'dashboard.html';

        save_changes(floorPlanChanges);

    });


    // *****************
    //   DELETE ROOMS
    // *****************
    $("#delete-rooms").on('click', function() {  

        // make all rooms undraggable
        for (var key in floorPlanGroups) {
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')
        }

        for (var i = 0; i < floorPlanSvg.length; i++) {

            var room_ID = floorPlanSvg[i].node.id;

            $('#'+room_ID).on('click', function(e){

                // update room_ID
                room_ID = e.target.id;

                if (currentFloorPlan[room_ID].nodes.length === 0) {

                    // remove room instance from SVG
                    this.instance.remove()

                    // update currentFloorPlan
                    delete currentFloorPlan[room_ID];

                    // update floorPlanSvg
                    floorPlanSvg.splice(floorPlanSvg.indexOf(i), 1);

                    // update floorPlanGroups
                    delete floorPlanGroups[room_ID];

                    // remove all event handlers from all rooms
                    for (var i = 0; i < floorPlanSvg.length; i++) {
                        $("#"+floorPlanSvg[i].node.id).off("click");
                    }
                    
                    // Update floorPlanChanges
                    //floorPlanChanges.delete[room_ID] = room_ID

                    // if room was added, remove svg node
                    if (floorPlanChanges.add.hasOwnProperty(room_ID)) {
                        // do not add room to database
                        delete floorPlanChanges.add[room_ID]; 

                        // remove all event handlers from all rooms
                        for (var i = 0; i < floorPlanSvg.length; i++) {
                            $("#"+floorPlanSvg[i].node.id).off("click");
                        }
                    } else {
                        // remove all event handlers from all rooms
                        for (var i = 0; i < floorPlanSvg.length; i++) {
                            $("#"+floorPlanSvg[i].node.id).off("click");
                        }

                        floorPlanChanges.delete.push({
                                                    "room_ID" : room_ID,
                                                    "floor" : "1"
                                                    }); // plan to delete room from database
                    }

                } else {
                    // remove all event handlers from all rooms
                    for (var i = 0; i < floorPlanSvg.length; i++) {
                        $("#"+floorPlanSvg[i].node.id).off("click");
                    }
                    alert("Cannot delete that room because a node is already attached.")
                }
            });
        }
    });


    // *****************
    //      DRAG
    // *****************
    $("#drag").on('click', function(e) {

        for (var key in floorPlanGroups) {

            // stop resizing for all rooms
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')

            // make all room groups draggable
            floorPlanGroups[key].draggable()

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
                    new_room_y = document.getElementById(room_ID).getBoundingClientRect().y - svgY;

                 // update currentFloorPlan
                currentFloorPlan[room_ID].x = new_room_x;
                currentFloorPlan[room_ID].y = new_room_y;

                // add to floorPlanChanges
                floorPlanChanges.update[room_ID] = {"room_ID": room_ID,
                                                    "floor": 1, 
                                                    "x": new_room_x,
                                                    "y": new_room_y};

                })
        }

    });


    // *****************
    //      RESIZE
    // *****************
    $("#resize").on('click', function() {

        // make all rooms undraggable
        for (var key in floorPlanGroups) {
            floorPlanGroups[key].draggable(false)
        }

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
                floorPlanChanges.update[room_ID] = {"room_ID": room_ID,
                                                    "floor": 1,
                                                    "x": new_room_x,
                                                    "y": new_room_y,
                                                    "width": new_room_width,
                                                    "height": new_room_height};


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

    });    
    

    // *****************
    //     CLEAR SVG
    // *****************
    $("#clear").on('click', function() {
        // clear SVG
        drawing.clear()
        loaded = false;

        // unbind button from mouse events
        $("#clear").off('click');
    });


    // *****************
    // CANCEL USER CHANGES
    // *****************
    $("#cancel-changes").on('click', function() {
        cancel_changes();
    });


    // *****************
    //     ADD ROOM
    // *****************
    $("#draw-rect").on('click', function(){

        // make all rooms undraggable
        for (var key in floorPlanGroups) {
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')
        }

        // create room and store in variable
        var room,
            room_ID;    

        // Draw rectangle while mouse is held down
        drawing.on('mousedown', function(e){

            //if (drawn === false) {

                room = drawing.rect();

                room_ID = room.node.id;

                room.draw(e)
                    .attr({
                        fill: 'white',
                        stroke: '#E3E3E3',
                        'stroke-width': 3
                    })
        });

        // Stop drawing on mouse up and push shape to floorPlan stack
        drawing.on('mouseup', function(e){

            // stop drawing
            room.draw('stop');

            // unbind drawing button from mouse events
            drawing.off(); 

            //if (drawn === false) {
                var x = room.node.attributes[3].nodeValue,
                    y = room.node.attributes[4].nodeValue,
                    floor = 1
                    width = room.node.attributes[1].nodeValue,
                    height = room.node.attributes[2].nodeValue;


                var room_data = {"room_ID" : room_ID,
                                "floor" : floor,
                                "x" : x,
                                "y" : y,
                                "width" : width,
                                "height" : height,
                                "nodes" : [] }

                currentFloorPlan[room_ID] = room_data;

                floorPlanChanges.add[room_ID] = room_data;

                floorPlanSvg.push(room);
                
                var groupID = room_ID + "group";
                var roomGroup = drawing.group().addClass(groupID);

                roomGroup.add(floorPlanSvg[floorPlanSvg.length-1].addClass(groupID));

                floorPlanGroups[room_ID] = roomGroup;

                //drawn = true;
                
            //}
    
        });  

            //}

    });


    // *****************
    //     DRAW DOOR (WONT BE TOUCHED FOR NOW)
    // *****************
    /*$("#draw-door").on('click', function() {

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
            *
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

    });*/

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
        $("#tools").fadeOut();
		$("#items-listed-div").fadeOut();
        $("#map-view-text").delay(500).fadeIn("slow");
        $("#draw").delay(500).fadeIn("slow");
	});

	/*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
	    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	}))*/



})