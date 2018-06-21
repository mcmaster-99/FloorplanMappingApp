

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


    //rect[i] = drawing.rect();

    /*var rect = [];

    for (var i = 0; i < 5; i++) {
        rect[i] = "rect" + i;
    }

    for (var i = 0; i < 4; i++) {

        rect[i] = drawing.rect();
        console.log("rect[i] " + rect[i]);

        // Draw rectangle while mouse is held down
        drawing.on('mousedown', function(e){
            rect[i].draw(e)
                .attr({
                    fill: 'white',
                    stroke: '#E3E3E3',
                    'stroke-width': 3
                })
        });

        // Stop drawing on mouse up and
        // push shapes to floorPlan stack
        drawing.on('mouseup', function(e){
            rect[i].draw('stop', e);
            floorPlan.push(rect);
        });
        
        rect[i].on('drawstop', function(){
            rect.draw('stop');
        });
    }*/


    /* Temporary stack for storing all user's floor plan data.
    ** Each index consists of an SVG object.
    */
    var floorPlan = [];

    /*
    var drawState = false,
        dragResizeState = false;

    while (drawState == true) {
        console.log("here");
        var rect = drawing.rect();

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
        // push shapes to floorPlan stack
        drawing.on('mouseup', function(e){
            rect.draw('stop', e);
            floorPlan.push(rect);
        });
        
        rect.on('drawstop', function(){
            rect.draw('stop');
        });
    }*/


    //              ===============================
    //              SIDE BAR TOOL SET FUNCTIONALITY 
    //              ===============================

    // SAVE ALL DATA TO DYNAMODB
    /*document.getElementById("save-fp-data").onclick = function(){

        for (var i = 0; i < floorPlan.length; i++) {
            var Item = {
                "room_ID": "test",
                "floor": "test"
            }
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/floorplan/add',
                headers: {
                    Authorization: authToken
                },
                data: JSON.stringify(
                    Item
                ),
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
        }
    };*/

    document.getElementById("load-fp-data").onclick = function() {

        // Empty floorPlan array of any previous/excess data
        while (floorPlan.length !== 0) {floorPlan.pop();}

        $.ajax({
            method: 'POST',
            url: _config.api.fpGetURL + '/floorplan/get',
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

        function completeRequest(result) {
            console.log('Response received from API: ', result);
            var devices = JSON.stringify(result.Items);

            var tmpDevicesArray = [];
            // push item names to temporary array for sorting
            for (var i = 0; i < result.Items.length; i++) {
                tmpDevicesArray.push(result.Items[i].name);
            }

            tmpDevicesArray.sort();

            if (devices === "No Dynamic Devices") {
                $("#map-view-text").append("Map view not yet available");
            } else {
                for (var i = 0; i < result.Items.length; i++) {
                    floorPlan.push(result.Items[i]);
                }
            }
            console.log("==== floorPlan ====" + result.Items);

            drawFloorPlan();
        }
    };

    document.getElementById("drag-resize").onclick = function() {
        /*livingRoomGroup.selectize()
                    .resize({snapToAngle: 5})
                    .draggable({snapToGrid: 5})*/
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].room_ID.selectize()
                    .resize({snapToAngle: 5})
                    .draggable({snapToGrid: 5})
        }
    };

    
    /*document.getElementById("print-fp-data").onclick = function() {

        for (var i = 0; i < floorPlan.length; i++) {
            console.log(floorPlan[i]);
        }
    };*/
    

    /*document.getElementById("clear").onclick = function() {
        //$("#draw").empty();
        console.log(floorPlan);
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan.pop();
        }
        console.log(floorPlan);
    };*/



    $("#draw-rect").click(function() {

        var rect = drawing.rect();

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
            rect.draw('stop', e);
            floorPlan.push(rect);
        });
        
        drawing.rect().on('drawstop', function(){
            rect.draw('stop');
        });
    });

    // Methods/Functions

    function drawFloorPlan() {
        for (var i = 0; i < floorPlan.length; i++) {

            var type = floorPlan[i].type,
                room_ID = floorPlan[i].room_ID,
                width = Number(floorPlan[i].width),
                height = Number(floorPlan[i].height),
                x = Number(floorPlan[i].x),
                y = Number(floorPlan[i].y);


            console.log("==== rect " + i + " =====");
            console.log("x: " + x);
            console.log("y: " + y);
            console.log("width: " + width);
            console.log("height: " + height);

            console.log("Now drawing: " + room_ID);
            var room_ID = drawing.rect(width, height)
                .attr({
                    x: x,
                    y: y,
                    fill: 'white',
                    stroke: '#E3E3E3',
                    'stroke-width': 3
                })  
        }
    }

})







$(document).ready(function(){

    $("#items-listed-div").hide();

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
		$("#tools").delay(500).fadeIn("slow");

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
            url: _config.api.fpGetURL + '/floorplan/get',
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