// Set region and credentials for DynamoDB
AWS.config.update({
    region: 'us-west-2',
    accessKeyId: "AKIAJBSRT3E7L7FXLPMA",
    secretAccessKey: "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"
});
var dynamodb = new AWS.DynamoDB();


//=============================================================
//                          SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {
    var drawing = new SVG('draw').size(500, 500)
                                //.panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})


    /* Temporary stack for storing all user's floor plan data.
    ** Each index consists of an SVG object.
    */
    var floorPlan = [];

    //              ===============================
    //              SIDE BAR TOOL SET FUNCTIONALITY 
    //              ===============================

    // SAVE ALL DATA TO DYNAMODB
    document.getElementById("save-fp-data").onclick = function() {  

        // Stop dragging and resizing for all shapes
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].draggable(false)
            floorPlan[i].selectize(false).resize("stop")
        }

        /*
        ** Writes all floor plan data from floorPlan stack/array to the database
        */
        for (var i = 0; i < floorPlan.length; i++) {
        
            var params = {
                Item: {
                    "type": {
                        S: String(floorPlan[i].node.getBoundingClientRect().type) //livingRoom.node.attributes[3].nodeValue
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

            dynamodb.putItem(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred 
                else     console.log("Successfully saved and written to DB"); // successful response
            
            });
        }
    }

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

                // Iterate through each object and push it to floorPlan array
                data.Items.forEach(function(e) {
                    if (e.type.S === "rect") {
                        var bedRoomDevice = drawing.rect(e.width.S, e.height.S)
                            .attr({
                                x: (e.x.S),
                                y: (e.y.S),
                                fill: 'white',
                                stroke: '#CCCCCC',
                                'stroke-width': 3
                            })
                    }
                    console.log(e.width.S);
                });

            }
        })

        console.log("floorPlan: " + floorPlan);
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


    document.getElementById("draw-rect").onclick = function() {
        
        var rect = drawing.rect();

        // Draw rectangle while mouse is held down
        drawing.on('mousedown', function(e){
            rect.draw(e)
                .attr({
                    fill: 'white',
                    stroke: '#CCCCCC',
                    'stroke-width': 3
                })
        }, false);

        // Stop drawing on mouse up and
        // push shapes to floorPlan stack
        drawing.on('mouseup', function(e){
            rect.draw('stop', e);
            floorPlan.push(rect);
        }, false);
        
        rect.on('drawstop', function(){
            rect.draw('stop');
        });
        
        
    };

    // Methods/Functions

    function drawFloorPlan() {

    }

})