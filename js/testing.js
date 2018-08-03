
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
    document.getElementById("save-fp-data").onclick = function(){

        for (var i = 0; i < floorPlan.length; i++) {
            var Item = {
                "room_ID": "test",
                "floor": "test"
            }
            $.ajax({
                method: 'POST',
                url: _config.api.fpInvokeUrl + '/devices/get',
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