
// Prompt user if they're sure they want to leave on page exit
$(window).bind('beforeunload', function(){
  return 'Are you sure you want to leave?';
});

//=============================================================
//                          SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {

    // Function that creates a grid in HTML.
    // Reason for this: certain functions re-initialize floorplan and
    // change HTML content resulting in SVG Grid being erased.
    function initializeGrid() {
        var svgGridHTML = '<svg id="svgGrid" xmlns="http://www.w3.org/2000/svg">'+
                    '<!-- Grid -->'+
                  '<defs>'+
                    '<pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">'+
                      '<path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" stroke-width="0.5"/>'+
                    '</pattern>'+

                    '<pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">'+
                      '<rect width="100" height="100" fill="url(#smallGrid)"/>'+
                      '<path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" stroke-width="1"/>'+
                    '</pattern>'+
                  '</defs>'+
                  '<!-- Grid [End] -->'+

                  '<rect width="1000vw" height="1000vh" fill="url(#grid)" />'+
                '</svg';
        $("#draw").append(svgGridHTML);
    }
    initializeGrid();
    initialize();


    var drawing = new SVG('svgGrid')
                        .size("100%", "100%")
                        .attr({x: 500,
                               y: 500
                              })
                            .panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})

    /* Temporary stack for storing all user's floor plan data.
    ** Each index consists of an SVG object.
    */
    var floorPlanSvg = [],              // stores SVG nodes
        initialFloorPlanData = [],      // stores initial data from database (room_ID as keys)
        nodeLocations = {},             // stores node SVG objects with node_ID as keys
        currentFloorPlan = [],          // stores the current state of floorplan as user makes changes (room_ID as keys)
        floorID = "",
        floorPlanGroups = {},   // each grouped room is stored with room_ID as keys

        loaded = false;



    var frontDoorSymbolSVG = new SVG('front-door-symbol-div')
                        .size("100%", "100%")
                        .attr({
                            x: 100,
                            y: 100
                        })
    var frontDoorText = frontDoorSymbolSVG.image('/images/frontDoorText.png')
    .attr({
        x: "15%",
        y: "25%"
    })
    var frontDoorSymbol = frontDoorSymbolSVG.image('/images/frontDoorSymbol.png')
    .attr({
        x: "30%",
        y: "50%"
    })

    drawing.on('panEnd', function(ev) {
        var vbX = drawing.viewbox().x;
        var vbY = drawing.viewbox().y;
        console.log(drawing.viewbox());
        //$("svg").removeAttr("viewBox");
        //drawing.viewbox(0, 0, 801, 464)
    })


    // New SVG for buttons
    var buttonSvg = new SVG('cancel-save-return-buttons-div').size("100%", "100%")
                                                            .attr({
                                                                x: 250,
                                                                y: 250
                                                            })
    // Cancel changes Button
    var cancel_changes = buttonSvg.text("Cancel")
                                .attr({
                                    id: 'cancel-changes-btn',
                                    x: 0,
                                    y: 100,
                                }) 

    // Return to dashboard Button
    var return_dashboard = buttonSvg.text("Return to dashboard")
                                .attr({
                                    id: 'return-dashboard-btn',
                                    x: 0,
                                    y: 50
                                }) 

    // Save Button
    var save_changes = buttonSvg.circle(50)
                            .attr({
                                id: "save-changes-btn",
                                cx: 110,
                                cy: 110,
                                fill: '#363636',
                                stroke: '#E3E3E3',
                                'stroke-width': 3
                            })
    var saveGroup = buttonSvg.group().addClass("saveGroup").add(save_changes)
    var saveText = buttonSvg.text("Save")
                            .attr({
                                x: Number(save_changes.node.attributes[2].value)-17,
                                y: Number(save_changes.node.attributes[3].value)-15,
                                fill: 'white'
                            })
    saveGroup.add(saveText)



    // Import floorplan
    //initialize();

    // Function to import floorplan
    function initialize() {

        // Empty floorPlan array of any previous/excess data
        initialFloorPlanData = [];

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
                //window.location.href = 'signin.html';
            }
        });

        function completeRequest(result) {
            console.log('Response received from API: ', result);

            // if there are no floorplans
            if (result.length === 0) {
                console.log("here");
                $("#map-view-text").append("Map view not yet available");
            } else {

                currentFloorPlan = result;
                initialFloorPlanData = JSON.stringify(result);

                // Loop through all items in database and store in floorplan array/stack
                for (var i = 0; i < result.length; i++) {

                    if (result[i].rooms.length > 0) {

                        // iterate over rooms
                        for (var j = 0; j < result[i].rooms.length; j++) {

                            var room = drawing.rect(result[i].rooms[j].width, result[i].rooms[j].height)
                                .attr({
                                    x: result[i].rooms[j].x,
                                    y: result[i].rooms[j].y,
                                    fill: 'white',
                                    stroke: '#E3E3E3',
                                    'stroke-width': 3
                                }) 

                            // change created room's id to roomID from database
                            room.node.id = result[i].rooms[j].roomID;
                            // store roomID in var
                            var room_ID = room.node.id;

                            floorPlanSvg.push(room);   


                            var groupID = room_ID + "group";
                            var roomGroup = drawing.group().addClass(groupID);
                            roomGroup.add(room.addClass(groupID));

                            // iterate over nodes
                            if (result[i].rooms[j].hasOwnProperty("nodes")) {
                                for (var k = 0; k < result[i].rooms[j].nodes.length; k++) {

                                    var node_ID = result[i].rooms[j].nodes[k].nodeID;

                                    var node_xy =  compute_node_xy(room_ID, node_ID);
                                    var node_x = node_xy[0];
                                    var node_y = node_xy[1];

                                    // draw and store device object initializer in deviceLocations object
                                    nodeLocations[node_ID] = {};
                                    nodeLocations[node_ID]["Icon"] = drawing.image("images/inlo-device.png", 15, 10);
                                    nodeLocations[node_ID]["Icon"].attr({
                                                                x: node_x,
                                                                y: node_y,
                                                                fill: "white",
                                                                stroke: "#E3E3E3",
                                                                id: node_ID})

                                    // add room node to room group
                                    roomGroup.add(nodeLocations[node_ID]["Icon"].addClass(groupID));

                                }
                            }
                            floorPlanGroups[room_ID] = roomGroup; 
                        }
                    } else {continue;}
         
                }
            }

            // set loaded to true to prevent excess loading
            loaded = true;

        }
    } // END initialize()


    function compute_node_xy(room_ID, node_ID) {
        console.log(room_ID, node_ID);
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

        // grab raw node coordinates from initialFloorPlanData array to determine actual node coords
        // Determine which node has the requested node_ID

        // iterate over floor plans
        for (var i = 0; i < currentFloorPlan.length; i++) {

            // iterate over rooms
            for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {

                // if room has a nodes property
                if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                    // iterate over nodes
                    for (var k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {

                        if (node_ID === currentFloorPlan[i].rooms[j].nodes[k].nodeID) {

                            node_x_frac = currentFloorPlan[i].rooms[j].nodes[k].x,
                            node_y_frac = currentFloorPlan[i].rooms[j].nodes[k].y;

                        } else {
                            continue;
                        }

                    }
                } else {continue;}
            }
        }

        // use raw node coordinates to compute actual node coordinates
        node_x = node_x_frac*width + room_x,
        node_y = node_y_frac*height + room_y;

        return [node_x, node_y];

    } // END compute_node_xy()

    function cancelChanges() {

        // prompt user
        var userResponse = confirm("Are you sure you want to cancel changes?");

        // if user clicks OK
        if (userResponse == true) {

            // update currentFloorPlan
            currentFloorPlan = JSON.parse(initialFloorPlanData);

            // clear rooms groups
            for (var i = 0; i < floorPlanSvg.length; i++) {
                var groupId = floorPlanSvg[i].node.parentElement.id;
                $("#"+String(groupId)).remove();
            }

            // Clear floorPlanSvg
            floorPlanSvg = [];

            // redraw rooms groups and reload floorPlanSvg
            for (var i = 0; i < currentFloorPlan.length; i++) {

                    if (currentFloorPlan[i].rooms.length > 0) {

                        // iterate over rooms
                        for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {

                            var room = drawing.rect(currentFloorPlan[i].rooms[j].width, currentFloorPlan[i].rooms[j].height)
                                .attr({
                                    x: currentFloorPlan[i].rooms[j].x,
                                    y: currentFloorPlan[i].rooms[j].y,
                                    fill: 'white',
                                    stroke: '#E3E3E3',
                                    'stroke-width': 3
                                }) 

                            // change created room's id to roomID from database
                            room.node.id = currentFloorPlan[i].rooms[j].roomID;
                            // store roomID in var
                            var room_ID = room.node.id;

                            floorPlanSvg.push(room);   


                            var groupID = room_ID + "group";
                            var roomGroup = drawing.group().addClass(groupID);
                            roomGroup.add(room.addClass(groupID));

                            // iterate over nodes
                            if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                                for (var k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {

                                    var node_ID = currentFloorPlan[i].rooms[j].nodes[k].nodeID;

                                    var node_xy =  compute_node_xy(room_ID, node_ID);
                                    var node_x = node_xy[0];
                                    var node_y = node_xy[1];

                                    // draw and store device object initializer in deviceLocations object
                                    nodeLocations[node_ID] = {};
                                    nodeLocations[node_ID]["Icon"] = drawing.image("images/inlo-device.png", 15, 10);
                                    nodeLocations[node_ID]["Icon"].attr({
                                                                x: node_x,
                                                                y: node_y,
                                                                fill: "white",
                                                                stroke: "#E3E3E3",
                                                                id: node_ID})

                                    // add room node to room group
                                    roomGroup.add(nodeLocations[node_ID]["Icon"].addClass(groupID));

                                }
                            }
                            floorPlanGroups[room_ID] = roomGroup; 
                        }
                    } else {continue;}
         
                }


            //window.location.href = 'mapedit.html'

            /*// iterate over floorPlanSVG rooms
            for (var i = 0; i < floorPlanSvg.length; i++) {

                // if room has just been drawn
                if (floorPlanSvg[i]._event !== null) {

                    // store groupID
                    var groupId = floorPlanSvg[i].node.parentElement.id;

                    // remove room from svg display
                    $("#"+String(groupId)).remove();

                    // update floorPlanSvg
                    floorPlanSvg.splice(i, 1)


                    // update floorPlanGroups
                    //floorPlanGroups.splice(1, )

                    console.log("floorPlanSvg", floorPlanSvg);
                    console.log("currentFloorPlan", currentFloorPlan);
                    console.log("initialFloorPlanData", initialFloorPlanData);
                    console.log("floorPlanGroups", floorPlanGroups);
                }
            }*/
        }
        // if user clicks CANCEL, everything remains as is.


    } // END cancelChanges()


    function save_floorplan(update_key) {

        for (var i = 0; i < currentFloorPlan.length; i++) {

            console.log(currentFloorPlan[i].floorID);

            var floor_ID = currentFloorPlan[i].floorID;

            var input_rooms = currentFloorPlan[i].rooms;

            var input_body = {"rooms": input_rooms};

            console.log(input_body);

            $.ajax({

                method: 'PATCH',
                url: String(_config.api.inloApiUrl) + '/v1/floorplan/' + floor_ID,
                headers: {
                    Authorization: 'Bearer ' + getAuth("Authorization")
                },
                data: input_body,
                success: completeRequest,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occured when requesting devices:\n' + jqXHR.responseText);

                }

            });
        }

        function completeRequest(result) {
            console.log("save complete");
            console.log("result is:", result);
        }


        initialFloorPlanData = JSON.stringiy(currentFloorPlan);

    } // END save_floorplan()


    function create_floorplan() {

        $.ajax({

            method: 'POST',
            url: String(_config.api.inloApiUrl) + '/v1/floorplan',
            headers: {
                Authorization: 'Bearer ' + getAuth("Authorization")
            },
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


        initialFloorPlanData = JSON.stringify(currentFloorPlan);

    } // END create_floorplan()


    function delete_floorplan(currentFloorplan) {

        //for (var i = 0; i < currentFloorPlan.length; i++) {

            //console.log(currentFloorPlan[i]);

            //var floorID = currentFloorPlan[i].floorID;

            $.ajax({

                method: 'DELETE',
                url: String(_config.api.inloApiUrl) + '/v1/floorplan/' + floorID,
                headers: {
                    Authorization: 'Bearer ' + getAuth("Authorization")
                },
                data: currentFloorplan,
                success: completeRequest,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occured when requesting devices:\n' + jqXHR.responseText);

                }

            });
        //}

        function completeRequest(result) {
            console.log("save complete");
            console.log("result is:", result);
        }


        initialFloorPlanData = JSON.stringify(currentFloorPlan);

    } // END delete_floorplan()


    // =================================================================
    //                 buttonSVG buttons functionailty
    // =================================================================

    // Redirect user back to dashboard on click
    $("#return-dashboard-btn").click(function(){window.location.href = 'dashboard.html'})

    // Cancel user changes
    $("#cancel-changes-btn").click(function(){cancelChanges();})

    // Save user changes
    $(".saveGroup").click(function(){save_floorplan(currentFloorPlan);})

    // =================================================================
    //                  buttonSVG buttons functionailty END
    // =================================================================



    // =================================================================
    //                      HTML buttons functionality
    // =================================================================

    // *****************
    //   PRINT DATA 
    // *****************
    $("#print-data").on('click', function(){

        console.log("currentFloorPlan", currentFloorPlan);
        console.log("initialFloorPlanData", initialFloorPlanData);
        console.log("floorPlanSvg", floorPlanSvg);
        console.log("floorPlanGroups", floorPlanGroups);

    });

    // *****************
    // CREATE FLOORPLAN 
    // *****************
    $("#create-floorplan").on('click', function(){

        //window.location.href = 'dashboard.html';

        create_floorplan();

    });


    // *****************
    // DELETE FLOORPLAN 
    // *****************
    $("#delete-floorplan").on('click', function(){

        //window.location.href = 'dashboard.html';

        delete_floorplan(currentFloorPlan[0]);

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

                // remove room instance from SVG
                this.instance.remove()

                // update currentFloorPlan
                //ITERATE over floors
                // iterate over rooms until you find room with roomID == room_ID
                // delete that room 
                for (var i = 0; i < currentFloorPlan.length; i++) {
                    for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                        if (currentFloorPlan[i].rooms[j].roomID === room_ID) {
                            if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                                alert("Cannot delete room. Node attached.")
                            } else {
                                console.log(currentFloorPlan[i].rooms);
                                currentFloorPlan[i].rooms.splice(j,1);
                                console.log(currentFloorPlan);
                            }

                        }
                        
                        
                    }
                }
                //delete currentFloorPlan[room_ID];

                // update floorPlanSvg
                floorPlanSvg.splice(floorPlanSvg.indexOf(i), 1);

                // update floorPlanGroups
                delete floorPlanGroups[room_ID];

                // remove all event handlers from all rooms
                for (var i = 0; i < floorPlanSvg.length; i++) {
                    $("#"+floorPlanSvg[i].node.id).off("click");
                }
                
            });
        }
    });


    // *****************
    //    DRAG ROOM
    // *****************
    $("#drag").on('click', function(e) {

        for (var key in floorPlanGroups) {

            // stop resizing for all rooms
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')

            // make all room groups draggable
            console.log(floorPlanGroups[key]);
            floorPlanGroups[key].draggable({snapToGrid: 8})

            // unbind event listener
            floorPlanGroups[key].off('dragend')

            // After the room has been dragged
            floorPlanGroups[key].on("dragend", function(e){

                e.preventDefault();

                // Grab room_ID
                var room_ID = e.target.children["0"].id,
                    node_ID = e.target.children[1].id;


                // if page was zoomed/panned
                // subtract SVG coords from new coords to get new device coords
                if (document.getElementById("svgGrid").hasAttribute('viewBox')) {
                    console.log("here")
                    var vbX = drawing.viewbox().x;
                    var vbY = drawing.viewbox().y;
                    console.log(drawing.viewbox())

                    // Grab SVG coordinates so we can subtract from element coordinates 
                    // to give us the actual coordinates on the SVG document.
                    // svgX/svgY is defined again below because it will change if SVG was panned/zoomed
                    var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x - vbX,
                        svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y - vbY;
                        console.log(svgX, svgY)

                    var new_room_x = e.target.getBoundingClientRect().x - svgX,
                        new_room_y = e.target.getBoundingClientRect().y - svgY;
                        console.log(new_room_x, new_room_y);
                    $("#"+e.target.id).removeAttr("transform");
                    $("#"+e.target.children[0].id).attr("x", String(new_room_x));
                    $("#"+e.target.children[0].id).attr("y", String(new_room_y));

                    var new_node_locations = compute_node_xy(room_ID, node_ID);
                    console.log(new_node_locations[0], new_node_locations[1])
                    $("#"+e.target.childNodes[1].id).removeAttr("transform");
                    $("#"+e.target.children[1].id).attr("x", String(new_node_locations[0]) + vbX);
                    $("#"+e.target.children[1].id).attr("y", String(new_node_locations[1]) + vbY);
                
                // if page was NOT zoomed/panned
                } else {

                    // Grab SVG coordinates so we can subtract from element coordinates 
                    // to give us the actual coordinates on the SVG document.
                    var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
                        svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

                    // grab node coordinates
                    var node_locations = compute_node_xy(room_ID, node_ID),
                        node_x = node_locations[0],
                        node_y = node_locations[1];

                    // Remove transform attribute and manually set X,Y coordinates of room
                    var new_room_x = e.target.getBoundingClientRect().x - svgX,
                        new_room_y = e.target.getBoundingClientRect().y - svgY;
                    $("#"+e.target.id).removeAttr("transform");
                    $("#"+e.target.children[0].id).attr("x", String(new_room_x));
                    $("#"+e.target.children[0].id).attr("y", String(new_room_y));

                    // Remove transform attribute and manually set X,Y coordinates of node
                    $("#"+e.target.childNodes[1].id).removeAttr("transform");
                    new_node_locations = compute_node_xy(room_ID, node_ID);
                    $("#"+e.target.childNodes[1].id).attr("x", String(new_node_locations[0]));
                    $("#"+e.target.childNodes[1].id).attr("y", String(new_node_locations[1]));
                }

                // update currentFloorPlan
                for (var i = 0; i < currentFloorPlan.length; i++) {
                    for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                        console.log("here");
                        if (currentFloorPlan[i].rooms[j].roomID === room_ID) {
                            currentFloorPlan[i].rooms[j].x = new_room_x;
                            currentFloorPlan[i].rooms[j].y = new_room_y;
                        }
                    }
                }
                console.log(currentFloorPlan);

            })
        }

    });

    // *****************
    //     DRAG NODE
    // *****************
    $("#drag-node").on('click', function(e) {

        for (var key in floorPlanGroups) {

            // stop resizing for all rooms
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')

            // make all room groups draggable
            console.log(floorPlanGroups[key]);
            for (var i = 1; i < floorPlanGroups[key].node.children.length; i++) {
                console.log(floorPlanGroups[key].node.childNodes[i].instance);
                floorPlanGroups[key].node.childNodes[i].instance.draggable({snapToGrid: 10})

                // unbind event listener
                floorPlanGroups[key].node.childNodes[i].instance.off('dragend')

                // After the room has been dragged
                floorPlanGroups[key].node.childNodes[i].instance.on("dragend", function(e){

                    /*if (panned) {
                        add vbX to room x
                        add vbY to room y
                    }*/

                    // Grab room_ID
                    var room_ID = e.target.instance.node.parentNode.firstChild.id;

                    // Grab SVG coordinates so we can subtract from element coordinates 
                    // to give us the actual coordinates on the SVG document.
                    var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
                        svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

                    
                    var node_ID = e.target.instance.node.id;
                    console.log(room_ID, node_ID);

                    // compute new node coordinates
                    console.log(e.target);
                    var roomX,
                        roomY,
                        roomWidth,
                        roomHeight;
                    // update currentFloorPlan
                    for (var i = 0; i < currentFloorPlan.length; i++) {
                        for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                            console.log("here");
                            if (currentFloorPlan[i].rooms[j].roomID === room_ID) {
                                roomX = currentFloorPlan[i].rooms[j].x;
                                roomY = currentFloorPlan[i].rooms[j].y;
                                roomWidth = currentFloorPlan[i].rooms[j].width;
                                roomHeight = currentFloorPlan[i].rooms[j].height;
                            }
                        }
                    }
                    console.log(roomX, roomY);
                    var new_node_x = document.getElementById(node_ID).getBoundingClientRect().x - svgX - roomX,
                        new_node_y = document.getElementById(node_ID).getBoundingClientRect().y - svgY - roomY;

                        console.log(new_node_x, new_node_y);

                    var new_node_frac_x = new_node_x/roomWidth,
                        new_node_frac_y = new_node_y/roomHeight;

                        console.log(new_node_frac_x, new_node_frac_y);

                    var node_locations = compute_node_xy(room_ID, node_ID),
                        node_x = node_locations[0],
                        node_y = node_locations[1];
                    console.log(node_locations);

                    // Remove transform attribute and manually set X,Y coordinates of room
                    var new_room_x = e.target.getBoundingClientRect().x - svgX,
                        new_room_y = e.target.getBoundingClientRect().y - svgY;

                    // update currentFloorPlan nodes
                    for (var i = 0; i < currentFloorPlan.length; i++) {
                        for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                            for (var k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {
                                if (currentFloorPlan[i].rooms[j].nodes[k].nodeID === node_ID) {
                                    console.log("here");
                                    currentFloorPlan[i].rooms[j].nodes[k].x = new_node_frac_x;
                                    currentFloorPlan[i].rooms[j].nodes[k].y = new_node_frac_y;
                                }
                            }
                        }
                    }
                    console.log(currentFloorPlan);

                })
            }
            
        }

    });


    // *****************
    //    RESIZE ROOM
    // *****************
    $("#resize").on('click', function() {

        // make all rooms undraggable
        for (var key in floorPlanGroups) {
            floorPlanGroups[key].draggable(false)
        }

        // loop through elements in group
        $('#svgGrid g rect').each(function() {

            this.instance.selectize().resize()

            $("#"+this.instance.node.id).off('resizedone')

            // when resizing is done
            $("#"+this.instance.node.id).on('resizedone', function(e) {

                var node_count;

                // get room_ID
                var room_ID = e.target.id;

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
                for (var i = 0; i < currentFloorPlan.length; i++) {
                    for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                        if (currentFloorPlan[i].rooms[j].roomID === room_ID) {

                            // get node_ID
                            for (var k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {
                                var node_ID = currentFloorPlan[i].rooms[j].nodes[k].nodeID,
                                    // grab node coordinates
                                    node_locations = compute_node_xy(room_ID, node_ID),
                                    node_x = node_locations[0],
                                    node_y = node_locations[1];

                                // Move target node to new node location
                                nodeLocations[node_ID].Icon.animate().move(node_x, node_y)
                            }

                            currentFloorPlan[i].rooms[j].x = new_room_x;
                            currentFloorPlan[i].rooms[j].y = new_room_y;
                            currentFloorPlan[i].rooms[j].width = new_room_width;
                            currentFloorPlan[i].rooms[j].height = new_room_height;
                        }
                    }
                }

            }) 
        })

    });    


    // *****************
    //     ADD ROOM
    // *****************
    $("#draw-rect").on('click', function(){

        // make all rooms undraggable and unresizable
        for (var key in floorPlanGroups) {
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')
        }

        // create room and store in variable
        var room,
            room_ID;    

        // Draw rectangle while mouse is held down
        drawing.on('mousedown', function(e){

                room = drawing.rect();

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

            var room_ID;

            var x = room.node.attributes[3].nodeValue,
                y = room.node.attributes[4].nodeValue,
                floor = 1
                width = room.node.attributes[1].nodeValue,
                height = room.node.attributes[2].nodeValue;


            $.ajax({
                method: 'POST',
                url: String(_config.api.inloApiUrl) + '/v1/room',
                headers: {
                    Authorization: 'Bearer ' + getAuth("Authorization")
                },
                success: completeRequest,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    //window.location.href = 'signin.html';
                }
            });

            function completeRequest(result) {
                console.log(result);
                room_ID = result.roomID;
                timestamp = result.timestamp;

                var room_data = {
                                    "rooms": [
                                        {
                                            "roomID" : room_ID,
                                            "roomName": "Kitchen",
                                            "floor" : floor,
                                            "x" : x,
                                            "y" : y,
                                            "width" : width,
                                            "height" : height
                                        }
                                    ]
                                }

                currentFloorPlan[floorID].rooms.push(room_data.rooms[0]);

                floorPlanSvg.push(room);

                console.log(currentFloorPlan);
                
                var groupID = room_ID + "group";
                var roomGroup = drawing.group().addClass(groupID);

                roomGroup.add(floorPlanSvg[floorPlanSvg.length-1].addClass(groupID));

                floorPlanGroups[room_ID] = roomGroup;
                
            }
    
        });  

    });


    // *****************
    //     DRAW DOOR (WONT BE TOUCHED FOR NOW)
    // *****************
    $("#draw-door").on('click', function() {

        // Deselect all rooms
        for (var i = 0; i < floorPlanSvg.length; i++) {
            floorPlanSvg[i].selectize(false).resize('stop').draggable(false);
        }

        // ungroup elements
        for (var i = 0; i < floorPlanGroups.length; i++) {
            floorPlanGroups[i].ungroup(drawing);
            console.log("floorPlan[i] ungrouped", floorPlanGroups[i]);
        }
        console.log("floorPlan after", floorPlanSvg);

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
            for (var i = 0; i < floorPlanSvg.length; i++) {

                // Declare variables for room attributes: X, Y, Width, Height
                var roomX = Number(floorPlanSvg[i].node.attributes[3].nodeValue),
                    roomY = Number(floorPlanSvg[i].node.attributes[4].nodeValue),
                    roomWidth = Number(floorPlanSvg[i].node.attributes[1].nodeValue),
                    roomHeight = Number(floorPlanSvg[i].node.attributes[2].nodeValue);

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
                    door.node.attributes[3].nodeValue = Number(floorPlanSvg[i].node.attributes[3].nodeValue);
                    door.node.attributes[1].nodeValue = Number(floorPlanSvg[i].node.attributes[3].nodeValue);
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
                    door.node.attributes[2].nodeValue = Number(floorPlanSvg[i].node.attributes[4].nodeValue);
                    door.node.attributes[4].nodeValue = Number(floorPlanSvg[i].node.attributes[4].nodeValue);
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
                    door.node.attributes[3].nodeValue = Number(floorPlanSvg[i].node.attributes[3].nodeValue)+roomWidth;
                    door.node.attributes[1].nodeValue = Number(floorPlanSvg[i].node.attributes[3].nodeValue)+roomWidth;
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
                    door.node.attributes[2].nodeValue = Number(floorPlanSvg[i].node.attributes[4].nodeValue)+roomHeight;
                    door.node.attributes[4].nodeValue = Number(floorPlanSvg[i].node.attributes[4].nodeValue)+roomHeight;
                } else {
                    continue;
                }
            }
        }

        

        document.addEventListener("click", addDoor);

    });

    // =================================================================
    //                    HTML buttons functionality END
    // =================================================================


})






$(document).ready(function(){

    $("#items-listed-div").hide();
    $("#dropdown-sort-div").hide();

    $("#list-view-btn").click(function() {
        $("#prompt").fadeOut();
        $("#tools").fadeOut();
        $("#svgGrid").fadeOut();
        $("#map-view-text").fadeOut();
        $("#items-listed-div").delay(500).fadeIn("slow");
        $("#dropdown-sort-div").delay(500).fadeIn("slow");
    });


    $("#map-view-btn").click(function() {
        $("#dropdown-sort-div").fadeOut();
        $("#prompt").fadeOut();
        $("#items-listed-div").fadeOut();
        $("#map-view-text").delay(500).fadeIn("slow");
        $("#svgGrid").delay(500).fadeIn("slow");
    });

    /*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
    }))*/


})






