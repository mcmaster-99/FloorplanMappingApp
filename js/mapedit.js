
// Redirect user if logged out
//if (getAuth("Authorization").length === 0) window.location.href = "signin.html";
'use strict';
//=============================================================
//                          SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {

    // if user has made any changes, ask before exiting current page
    /*$(window).bind('beforeunload', function(){
        if (changesMade === true) return 'Are you sure you want to leave?';
    });*/

    // Function that creates a grid in HTML.
    // Reason for this: certain functions re-initialize floorplan and
    // change HTML content resulting in SVG Grid being erased.
    /*function initializeGrid() {
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

                          '<rect width="1000px" height="1000px" x="-1000" y="-1000" fill="url(#grid)" />'+
                        '</svg';
        $("#draw").append(svgGridHTML);
    }
    initializeGrid();*/

    var drawing = new SVG('svgGrid')
                        .size("100%", "100%")
                            .panZoom({zoomMin: 0.5, zoomMax: 2, zoomFactor: 0.1})

    /* Temporary stack for storing all user's floor plan data.
    ** Each index consists of an SVG object.
    */
    var floorPlanSvg = [],              // stores SVG nodes
        initialFloorPlanData = [],      // stores initial data from database (room_ID as keys)
        nodeLocations = {},             // stores node SVG objects with node_ID as keys
        currentFloorPlan = [],          // stores the current state of floorplan as user makes changes (room_ID as keys)
        floorID = "0",
        floorPlanGroups = {},   // each grouped room is stored with room_ID as keys
        loaded = false,
        changesMade = false;


    /* // Front door compass
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
    */

    drawing.on('panEnd', function(ev) {
        let vbX = drawing.viewbox().x;
        let vbY = drawing.viewbox().y;
        console.log(drawing.viewbox())
    })


    // New SVG for buttons
    const buttonSvg = new SVG('cancel-save-return-buttons-div').size("100%", "100%")
                                                            .attr({
                                                                x: 250,
                                                                y: 250
                                                            })
    const backDrop = buttonSvg.image("images/mapEditButtonsBackdrop.svg")
                                .attr({
                                    id: "mapEditButtonsBackdrop",
                                    x: 0,
                                    y: 0
                                })
    // Cancel changes Button
    const cancel_changes = buttonSvg.text("Cancel")
                                .attr({
                                    id: 'cancel-changes-btn',
                                    x: '10%',
                                    y: '27.5%'
                                }).font({family:'Roboto'})

    // Save Button
    const saveText = buttonSvg.text("Save")
                            .attr({
                                id: 'save-text',
                                x: '30%',
                                y: '27.5%'
                            }).font({family: 'Roboto'})  

    const doneRectangle = buttonSvg.image('images/doneRectangle.svg')
                                .attr({
                                    id: "save-changes-btn",
                                    x: '45%',
                                    y: '35%'
                                })    

    const doneText = buttonSvg.text("Done")
                                .attr({
                                    id: 'return-dashboard-btn',
                                    x: '48%',
                                    y: '30%',
                                    fill: 'white'
                                }).font({family:'Roboto'})                 

    // Return to dashboard Button
    /*const return_dashboard = buttonSvg.text("Return to dashboard")
                                .attr({
                                    id: 'return-dashboard-btn',
                                    x: 0,
                                    y: 50
                                }).font({family:'Roboto'})

    // Save Button
    const save_changes = buttonSvg.image('images/Ellipse.svg')
                            .attr({
                                id: "save-changes-btn",
                                x: 75,
                                y: 90
                            })
    const saveText = buttonSvg.text("Save")
                            .attr({
                                id: 'save-text',
                                x: Number(save_changes.node.attributes[4].value)+15,
                                y: Number(save_changes.node.attributes[5].value)+12.5,
                                fill: 'white'
                            }).font({family: 'Robotosave'})*/

    var saveGroup = buttonSvg.group()
                    .addClass("saveGroup")
                    .add(backDrop)
                    .add(cancel_changes)
                    .add(saveText)
                    .add(doneRectangle)
                    .add(doneText)
    



    // Import floorplan
    //initialize();

    // Function to import floorplan
    const initialize = () => {

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
                for (let i = 0; i < result.length; i++) {

                    if (result[i].rooms.length > 0) {

                        // iterate over rooms
                        for (let j = 0; j < result[i].rooms.length; j++) {

                            let room = drawing.rect(result[i].rooms[j].width, result[i].rooms[j].height)
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
                            let room_ID = room.node.id;

                            floorPlanSvg.push(room);   


                            let groupID = room_ID + "group";
                            let roomGroup = drawing.group().addClass(groupID);
                            roomGroup.add(room.addClass(groupID));

                            // iterate over nodes
                            if (result[i].rooms[j].hasOwnProperty("nodes")) {
                                for (let k = 0; k < result[i].rooms[j].nodes.length; k++) {

                                    let node_ID = result[i].rooms[j].nodes[k].nodeID;

                                    let node_xy =  compute_node_xy(room_ID, node_ID);
                                    let node_x = node_xy[0];
                                    let node_y = node_xy[1];

                                    // draw and store device object initializer in deviceLocations object
                                    nodeLocations[node_ID] = {};
                                    nodeLocations[node_ID]["Icon"] = drawing.image("images/inlo-device.png", 15, 10);
                                    nodeLocations[node_ID]["Icon"].attr({
                                                                x: node_x,
                                                                y: node_y,
                                                                fill: "white",
                                                                stroke: "#00D9AE",
                                                                id: node_ID})

                                    // add room node to room group
                                    roomGroup.add(nodeLocations[node_ID]["Icon"].addClass(groupID));

                                }
                            }
                            floorPlanGroups[room_ID] = roomGroup; 
                        }
                    // if no rooms
                    } else {continue;}
         
                }
            }

            // set loaded to true to prevent excess loading
            loaded = true;

        }
    } // END initialize()
    initialize()



    const compute_node_xy = (room_ID, node_ID) => {

        let node_x,
            node_y,
            node_x_frac,
            node_y_frac,
            vbX = drawing.viewbox().x,
            vbY = drawing.viewbox().y,
            vbZoom = drawing.viewbox().zoom;

        // Grab SVG coordinates so we can subtract from element coordinates 
        // to give us the actual coordinates on the SVG document.

        // current coordinates of room
        var room_x = (document.getElementById(room_ID).instance.x() - document.getElementById(room_ID).instance.transform().x),
            room_y = (document.getElementById(room_ID).instance.y() - document.getElementById(room_ID).instance.transform().y),
        // current dimensions of room
            height = document.getElementById(room_ID).instance.height(),
            width = document.getElementById(room_ID).instance.width();


        // grab raw node coordinates from initialFloorPlanData array to determine actual node coords
        // Determine which node has the requested node_ID

        // iterate over floor plans
        for (let i = 0; i < currentFloorPlan.length; i++) {

            // iterate over rooms
            for (let j = 0; j < currentFloorPlan[i].rooms.length; j++) {

                // if room has a nodes property
                if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                    // iterate over nodes
                    for (let k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {

                        if (node_ID === currentFloorPlan[i].rooms[j].nodes[k].nodeID) {

                            node_x_frac = currentFloorPlan[i].rooms[j].nodes[k].x,
                            node_y_frac = currentFloorPlan[i].rooms[j].nodes[k].y;

                        } else {continue;}
                    }
                } else {continue;}
            }
        }

        // use raw node coordinates to compute actual node coordinates
        node_x = node_x_frac*width + room_x,
        node_y = node_y_frac*height + room_y;

        return [node_x, node_y];

    } // END compute_node_xy()


    const cancelChanges = () => {

        // prompt user
        const userResponse = confirm("Are you sure you want to cancel changes?");

        // if user clicks OK
        if (userResponse == true) {

            // update currentFloorPlan
            currentFloorPlan = JSON.parse(initialFloorPlanData);

            // clear rooms groups
            for (let i = 0; i < floorPlanSvg.length; i++) {
                let groupId = floorPlanSvg[i].node.parentElement.id;
                $("#"+String(groupId)).remove();
            }

            // Clear floorPlanSvg
            floorPlanSvg = [];

            // redraw rooms groups and reload floorPlanSvg
            for (let i = 0; i < currentFloorPlan.length; i++) {

                    if (currentFloorPlan[i].rooms.length > 0) {

                        // iterate over rooms
                        for (let j = 0; j < currentFloorPlan[i].rooms.length; j++) {

                            let room = drawing.rect(currentFloorPlan[i].rooms[j].width, currentFloorPlan[i].rooms[j].height)
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
                            let room_ID = room.node.id;

                            floorPlanSvg.push(room);   


                            let groupID = room_ID + "group";
                            let roomGroup = drawing.group().addClass(groupID);
                            roomGroup.add(room.addClass(groupID));

                            // iterate over nodes
                            if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                                for (let k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {

                                    let node_ID = currentFloorPlan[i].rooms[j].nodes[k].nodeID;

                                    let node_xy =  compute_node_xy(room_ID, node_ID);
                                    let node_x = node_xy[0];
                                    let node_y = node_xy[1];

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


    const save_floorplan = (update_key) => {

        for (let i = 0; i < currentFloorPlan.length; i++) {

            let floor_ID = currentFloorPlan[i].floorID,

                input_rooms = currentFloorPlan[i].rooms,

                input_body = {"rooms": input_rooms};

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
            // Get the modal
            let modal = document.getElementById('saveModal');

            // Get the button that opens the modal
            let btn = document.getElementById("myBtn");

            // Get the <span> element that closes the modal
            let span = document.getElementsByClassName("close")[0];

            // When the user clicks on the button, open the modal
            modal.style.display = "block";

            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
              modal.style.display = "none";
            }

            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
              if (event.target == modal) {
                modal.style.display = "none";
              }
            }
        }


        initialFloorPlanData = JSON.stringify(currentFloorPlan);

    } // END save_floorplan()


    const create_floorplan = () => {

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


    const delete_floorplan = (currentFloorplan) => {

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
        console.log("here");
        console.log("currentFloorPlan", currentFloorPlan);
        console.log("initialFloorPlanData", initialFloorPlanData);
        console.log("floorPlanSvg", floorPlanSvg);
        console.log("floorPlanGroups", floorPlanGroups);

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

                // remove all event handlers from all rooms
                for (var i = 0; i < floorPlanSvg.length; i++) {
                    $("#"+floorPlanSvg[i].node.id).off("click");
                }

                
                //ITERATE over floors
                // iterate over rooms until you find room with roomID == room_ID
                // then delete that room 
                for (var i = 0; i < currentFloorPlan.length; i++) {
                    for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                        if (currentFloorPlan[i].rooms[j].roomID === room_ID) {
                            // if room has any nodes
                            if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                                alert("Cannot delete room. Node attached.")
                            } else {
                                // remove room instance from SVG
                                this.instance.remove()
                                currentFloorPlan[i].rooms.splice(j,1);

                                // update floorPlanSvg
                                floorPlanSvg.splice(floorPlanSvg.indexOf(i), 1);

                                // update floorPlanGroups
                                delete floorPlanGroups[room_ID];
                            }

                        }
                        
                        
                    }
                }
                changesMade = true;
                
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
            floorPlanGroups[key].draggable({snapToGrid: 8})

            // unbind event listener
            floorPlanGroups[key].off('dragend')

            // After the room has been dragged
            floorPlanGroups[key].on("dragend", function(e){

                e.preventDefault();

                // Grab room_ID
                let room_ID = e.target.children["0"].id,
                    node_ID = e.target.children[1].id;

                // Manually adjust room's new x/y coordinates
                let new_room_x = e.target.firstChild.instance.x() + e.target.instance.transform().x,
                    new_room_y = e.target.firstChild.instance.y() + e.target.instance.transform().y;
                $("#"+e.target.id).removeAttr("transform");
                $("#"+e.target.children[0].id).attr("x", new_room_x);
                $("#"+e.target.children[0].id).attr("y", new_room_y);

                // use node compute function to grab node coordinates
                let node_locations = compute_node_xy(room_ID, node_ID),
                    node_x = node_locations[0],
                    node_y = node_locations[1];

                // Manually adjust node's new x/y coordinates
                $("#"+e.target.childNodes[1].id).removeAttr("transform");
                $("#"+e.target.children[1].id).attr("x", String(node_x));
                $("#"+e.target.children[1].id).attr("y", String(node_y));
                

                // update currentFloorPlan
                for (var i = 0; i < currentFloorPlan.length; i++) {
                    for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                        if (currentFloorPlan[i].rooms[j].roomID === room_ID) {
                            currentFloorPlan[i].rooms[j].x = new_room_x;
                            currentFloorPlan[i].rooms[j].y = new_room_y;
                        }
                    }
                } // END update currentFloorPlan

                changesMade = true;

            }) // END dragend
        } // END for loop

    });

    // *****************
    //     DRAG NODE
    // *****************
    $("#drag-node").on('click', function(e) {

        for (var key in floorPlanGroups) {

            // stop resizing for all rooms
            floorPlanGroups[key].node.children[0].instance.selectize(false).resize('stop')

            // make all room groups draggable
            for (var i = 1; i < floorPlanGroups[key].node.children.length; i++) {
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

                    // compute new node coordinates
                    var roomX,
                        roomY,
                        roomWidth,
                        roomHeight;
                    // update currentFloorPlan
                    for (var i = 0; i < currentFloorPlan.length; i++) {
                        for (var j = 0; j < currentFloorPlan[i].rooms.length; j++) {
                            if (currentFloorPlan[i].rooms[j].roomID === room_ID) {
                                roomX = currentFloorPlan[i].rooms[j].x;
                                roomY = currentFloorPlan[i].rooms[j].y;
                                roomWidth = currentFloorPlan[i].rooms[j].width;
                                roomHeight = currentFloorPlan[i].rooms[j].height;
                            }
                        }
                    }

                    var new_node_x = document.getElementById(node_ID).getBoundingClientRect().x - svgX - roomX,
                        new_node_y = document.getElementById(node_ID).getBoundingClientRect().y - svgY - roomY;

                    var new_node_frac_x = new_node_x/roomWidth,
                        new_node_frac_y = new_node_y/roomHeight;

                    var node_locations = compute_node_xy(room_ID, node_ID),
                        node_x = node_locations[0],
                        node_y = node_locations[1];

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

                })
            }
            changesMade = true;
            
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
                            console.log(currentFloorPlan[i].rooms[j].hasOwnProperty("nodes"));
                            if (currentFloorPlan[i].rooms[j].hasOwnProperty("nodes")) {
                                for (var k = 0; k < currentFloorPlan[i].rooms[j].nodes.length; k++) {
                                    var node_ID = currentFloorPlan[i].rooms[j].nodes[k].nodeID,
                                        // grab node coordinates
                                        node_locations = compute_node_xy(room_ID, node_ID),
                                        node_x = node_locations[0],
                                        node_y = node_locations[1];

                                    // Move target node to new node location
                                    nodeLocations[node_ID].Icon.animate().move(node_x, node_y)
                                }
                            }

                            currentFloorPlan[i].rooms[j].x = new_room_x;
                            currentFloorPlan[i].rooms[j].y = new_room_y;
                            currentFloorPlan[i].rooms[j].width = new_room_width;
                            currentFloorPlan[i].rooms[j].height = new_room_height;
                        }
                    }
                }

            }) 
            changesMade = true;
        })

    });    


    // *****************
    //     ADD ROOM
    // *****************
    $("#draw-room").on('click', function(){
        
        // turn panning off
        drawing.panZoom(false);

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
                floor = 1,
                width = room.node.attributes[1].nodeValue,
                height = room.node.attributes[2].nodeValue;

            // calling room API to generate room ID and timestamp
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
                }
            });

            function completeRequest(result) {
                // creates room ID and time room was drawn
                room_ID = result.roomID;
                timestamp = result.timestamp;

                var groupID = room_ID + "group";
                var roomGroup = drawing.group().addClass(groupID);
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

                roomGroup.add(floorPlanSvg[floorPlanSvg.length-1].addClass(groupID));

                floorPlanGroups[room_ID] = roomGroup;
                
            }
            changesMade = true;

            // turn panning back on
            drawing.panZoom(true);
    
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


    // Prompt user if they're sure they want to leave on page exit
    /*$(window).bind('beforeunload', function(){
        if (currentFloorPlan === initialFloorPlanData) {
            return 'Are you sure you want to leave?';
        }
    });*/

    /*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
    }))*/


})






