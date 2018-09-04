
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
    var floorPlan = [],
        floorPlanRoomGroups = [],
        loaded = false,
        rendered = false;

    var floorPlanData = [];

    load_floorplan();

    function load_floorplan() {

        // Empty floorPlan array of any previous/excess data
        var i = floorPlan.length;
        while (i !== 0) {floorPlan.pop(); i--}

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
            var devices = JSON.stringify(result.Items);

            /*var tmpDevicesArray = [];

            // push item names to temporary array for sorting
            for (var i = 0; i < result.Items.length; i++) {
                tmpDevicesArray.push(result.Items[i].name);
            }
            tmpDevicesArray.sort(); // sort items*/

            // if there are no devices
            if (devices === "No Dynamic Devices") {
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
                    floorPlan.push(room_ID);    
                    floorPlanData[result.Items[i].room_ID] = result.Items[i];
                    console.log("ID", room_ID.node);
                }
                console.log("floorPlanData", floorPlanData);
            }
            render_floorplan("F");

            // set loaded to true to prevent excess loading
            loaded = true;
        }
    }


    function render_floorplan_single_room(room, d) {

        // Grab SVG coordinates so we can subtract from element coordinates 
        // to give us the actual coordinates on the SVG document.
        var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
            svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

        // generate random variable for device ID
        var num = Math.random() * 1000;
        var deviceID = String("icon"+(~~num));

        console.log("room", room);

        var distance = d, 
            // current coordinates of room
            x = document.getElementById(room.node.id).getBoundingClientRect().x - svgX,
            y = document.getElementById(room.node.id).getBoundingClientRect().y - svgY,
            // current dimensions of room
            height = document.getElementById(room.node.id).getBoundingClientRect().height,
            width = document.getElementById(room.node.id).getBoundingClientRect().width;
    
        // sample device
        var inloNode = drawing.image("images/inlo-device.png", 15, 10);
        inloNode.attr({x: x+(width/2), y: y, fill: "white", stroke: "#E3E3E3"})

        // current coordinates of inlo device
        x_node = document.getElementById(inloNode.node.id).getBoundingClientRect().x - x - svgX,
        y_node = document.getElementById(inloNode.node.id).getBoundingClientRect().y - y - svgY;
    
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

        var deviceIcon = drawing.image("images/inlo.png", 10, 10);

        // Animate items to correct position
        deviceIcon.animate().move(x, y)

    }

    function render_floorplan(d) {

        // Grab SVG coordinates so we can subtract from element coordinates 
        // to give us the actual coordinates on the SVG document.
        var svgX = document.getElementById(drawing.node.id).getBoundingClientRect().x,
            svgY = document.getElementById(drawing.node.id).getBoundingClientRect().y;

        for (var i = 0; i < floorPlan.length; i++) {

            // generate random variable for device ID
            var num = Math.random() * 1000;
            var groupID = String("group"+(~~num));

            var distance = d, 
                // current coordinates of room
                x = document.getElementById(floorPlan[i].node.id).getBoundingClientRect().x - svgX,
                y = document.getElementById(floorPlan[i].node.id).getBoundingClientRect().y - svgY,
                // current dimensions of room
                height = document.getElementById(floorPlan[i].node.id).getBoundingClientRect().height,
                width = document.getElementById(floorPlan[i].node.id).getBoundingClientRect().width;

            // sample device
            var roomID = floorPlan[i].node.id;
        
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

            // /*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*/
            // problem is that the nodes will always render in the same
            // location since a node's location is remains the same in dynamoDB
            // /*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*//*/*/*/*/
           
            //var inloNode = drawing.image("images/inlo-device.png", 15, 10);
            //inloNode.attr({x: x+(width/2), y: y, fill: "white", stroke: "#E3E3E3"})

            // current coordinates of inlo device
            x_node = document.getElementById(inloNode.node.id).getBoundingClientRect().x - x - svgX,
            y_node = document.getElementById(inloNode.node.id).getBoundingClientRect().y - y - svgY;

            inloNode.hide()
        
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



            var deviceIcon = drawing.image("images/inlo.png", 10, 10);

            // Animate items to correct position
            deviceIcon.animate().move(x, y)

            if (rendered === false) {

                var roomGroup = drawing.group().addClass(groupID);

                roomGroup.add(floorPlan[i].addClass(groupID));
                roomGroup.add(inloNode.addClass(groupID));
                roomGroup.add(deviceIcon.addClass(groupID));

                floorPlanRoomGroups[i] = roomGroup;
            }


            console.log("floorPlan", floorPlan);
            console.log("floorPlanRoomGroups", floorPlanRoomGroups);

            /*Room groups are ungrouped when resizing*/
        }
        rendered = true;
    }


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