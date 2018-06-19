// Set region and credentials for DynamoDB
/*AWS.config.update({
    region: 'us-west-2',
    accessKeyId: "AKIAJBSRT3E7L7FXLPMA",
    secretAccessKey: "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"
});*/
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
    var drawing = new SVG('draw').size(500, 500)
                                //.panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})


    //rect[i] = drawing.rect();

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

    /*var rect = [];

    for (var i = 0; i < 5; i++) {
        rect[i] = "rect" + i;
    }

    for (var i = 0; i < 4; i++) {

        rect[i] = drawing.rect();

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
    }


    //              ===============================
    //              SIDE BAR TOOL SET FUNCTIONALITY 
    //              ===============================

    // SAVE ALL DATA TO DYNAMODB
    /*document.getElementById("save-fp-data").onclick = function() {  

        // Stop dragging and resizing for all shapes
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].draggable(false)
            floorPlan[i].selectize(false).resize("stop")
        }

        
        ** Writes all floor plan data from floorPlan stack/array to the database
        */
        /*
        for (var i = 0; i < floorPlan.length; i++) {
            if (floorPlan[i].type === "rect") {
                var params = {
                    Item: {
                        "type": {
                            S: String(floorPlan[i].type) //livingRoom.node.attributes[3].nodeValue
                        },
                        "x": {
                            S: String(floorPlan[i].node.getBoundingClientRect().x) //livingRoom.node.attributes[3].nodeValue
                        },
                        "y": {
                            S: String(floorPlan[i].node.getBoundingClientRect().y)
                        },
                        "width": {
                            S: String(floorPlan[i].node.getBoundingClientRect().width)
                        },
                        "height": {
                            S: String(floorPlan[i].node.getBoundingClientRect().height)
                        },
                        "room_ID": {
                            S: String(floorPlan[i])
                        },
                        "floor": {
                            S: floorPlan[i].node.attributes[3].nodeValue
                        }
                    },
                    ReturnConsumedCapacity: "TOTAL", 
                    TableName: "FloorPlan.test-at-test.com"
                };
            }

            dynamodb.putItem(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred 
                else     console.log("Successfully saved and written to DB"); // successful response
            
            });
        }
    }*/
    document.getElementById("save-fp-data").onclick = function(){

        for (var i = 0; i < floorPlan.length; i++) {
            var Item = {
                "room_ID": "test",
                "floor": "test"
            }
            $.ajax({
                method: 'POST',
                url: _config.api.fpInvokeUrl + '/floorplan/add',
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

        /*$.post(_config.api.invokeUrl + '/floorplan/add',
        {
            name: "test",
            city: "test"
        },
        function(data, status){
            alert("Data: " + data + "\nStatus: " + status);
        });*/
    };

    document.getElementById("load-fp-data").onclick = function() {

        // Empty floorPlan array of any previous/excess data
        while (floorPlan.length !== 0) {floorPlan.pop();}

        // Load floor plan data for the specific user
        var params = {
            TableName: "FloorPlan.test-at-test.com",
        };
        dynamodb.scan(params, function(err, data){
            if (err) console.log(err, err.stack);
            else    {

                // Populate floor plan stack
                for (var i = 0; i < data.Items.length; i++) {
                    floorPlan.push(data.Items[i]);
                }
                
                drawFloorPlan();

            }
            console.log(floorPlan);
        })
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

        /*drawState = false;
        dragResizeState = true;
        console.log(dragResizeState);
        console.log(drawState);*/
    };

    
    document.getElementById("print-fp-data").onclick = function() {

        for (var i = 0; i < floorPlan.length; i++) {
            console.log(floorPlan[i]);
        }
    };
    

    document.getElementById("clear").onclick = function() {
        //$("#draw").empty();
        console.log(floorPlan);
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan.pop();
        }
        console.log(floorPlan);
    };



    $("#draw-rect").click(function() {

        /*dragResizeState = false;
        drawState = true;
        console.log(drawState);*/
    });

    // Methods/Functions

    function drawFloorPlan() {
        for (var i = 0; i < floorPlan.length; i++) {

            var type = floorPlan[i].type.S,
                room_ID = floorPlan[i].room_ID.S,
                width = Number(floorPlan[i].width.S),
                height = Number(floorPlan[i].height.S),
                x = Number(floorPlan[i].x.S),
                y = Number(floorPlan[i].y.S);


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