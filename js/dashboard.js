

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
        loaded = false;

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
    document.getElementById("save-fp-data").onclick = function(){

        for (var i = floorPlan.length-1; i >= 0; i--) {

            var index = (i === 0) ? floorPlan["0"] : floorPlan[i];

            index.selectize(false).resize('stop').draggable(false);

            var Item = {
                "room_ID": String(index.node.id),
                "floor": String(1),
                "height": String(index.node.attributes[2].nodeValue),
                "width": String(index.node.attributes[1].nodeValue),
                "x": String(index.node.attributes[3].nodeValue),
                "y": String(index.node.attributes[4].nodeValue),
                "type": String(index.type)
            }

            $.ajax({
                method: 'POST',
                url: _config.api.fpAddUrl + '/floorplan/add',
                headers: {
                    Authorization: authToken
                },
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
        }
    };

    document.getElementById("load-fp-data").onclick = function() {

        // Empty floorPlan array of any previous/excess data
        var i = floorPlan.length;
        while (i !== 0) {floorPlan.pop(); i--}

        // Checks if floorplan is loaded
        if (loaded === true) {
            console.log("Your floorplan has already been loaded.");
        } else { // if floorplan has not been loaded
            $.ajax({
                method: 'POST',
                url: _config.api.fpGetUrl + '/floorplan/get',
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

            tmpDevicesArray.sort(); // sort items

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
                    floorPlan.push(room_ID);    
                }

            }
            // after done importing rooms, set loaded to true to prevent excess loading
            loaded = true;
        }
    };

    document.getElementById("drag-resize").onclick = function() {
        /*livingRoomGroup.selectize()
                    .resize({snapToAngle: 5})
                    .draggable({snapToGrid: 5})*/
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].selectize()
                    .resize({snapToAngle: 5})
                    .draggable({snapToGrid: 5})
        }
    };

    
    document.getElementById("print-fp-data").onclick = function() {

        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].selectize(false).resize('stop').draggable(false);
            console.log(floorPlan[i]);
        }

    };
    

    document.getElementById("clear").onclick = function() {
        drawing.clear()
    };



    document.getElementById("draw-rect").onclick = function() {
        
        /*
        var num = Math.floor((Math.random() * 100) + 1);
        var rect = "rect"+num;*/

        var rect = drawing.rect();
        //rect.draw();


        if ($('#draw-rect').hasClass('active')) {  }
        else {

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

                if (floorPlan.length === 0) {floorPlan.push(rect);}

                var matchCount = 0;

                for (var i = 0; i < floorPlan.length; i++) {
                    if (floorPlan[i].node.instance.node === rect.node.instance.node) {
                        console.log(floorPlan[i].node.instance.node + " matches " + rect.node.instance.node);
                        matchCount++;
                    } 
                }

                if (matchCount === 0) floorPlan.push(rect);
                rect.draw('stop');
                //var ifPush = (floorPlan.has) ? floorPlan["0"] : floorPlan[i];floorPlan.push(rect);
            });
        }

        document.getElementById("draw-rect").classList.remove("active");
    };

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