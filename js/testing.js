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


    var floorPlan = [];

    // LIVING ROOM
    var livingRoom = drawing.rect(150, 100)
                            .attr({
                                x: 80,
                                y: 50,
                                fill: 'white',
                                stroke: '#CCCCCC',
                                'stroke-width': 3
                            })

    // LIVING ROOM DOOR
    var livingRoomDoor = drawing.line(
                    Number(livingRoom.node.attributes[3].nodeValue)+55,
                    Number(livingRoom.node.attributes[4].nodeValue),
                    Number(livingRoom.node.attributes[3].nodeValue)+70,
                    Number(livingRoom.node.attributes[4].nodeValue)+20)
                                .stroke({color: '#CCCCCC', width: 3})

    // INLO DEVICE
    var livingRoomDevice = drawing.rect(20, 10)
                        .attr({
                            x: (Number(livingRoom.node.attributes[3].nodeValue)+15),
                            y: (Number(livingRoom.node.attributes[4].nodeValue)),
                            fill: 'white',
                            stroke: '#CCCCCC',
                            'stroke-width': 3
                        })

    // GROUPS LIVING ROOM, DOOR, AND DEVICE TOGETHER
    var livingRoomGroup = drawing.group()
    livingRoomGroup.add(livingRoom)
                    .add(livingRoomDevice)
                    .add(livingRoomDoor)
    //livingRoomGroup.path('M20,20L30,40')
    /*var livingRoomSet = drawing.set()
    livingRoomSet.add(livingRoom)
                .add(livingRoomDoor)
                .add(livingRoomDevice)
    floorPlan.push(livingRoomSet);*/

    // push shape to floorPlan array
    floorPlan.push(livingRoom, livingRoomDoor, livingRoomDevice);


    // BEDROOM
    var bedRoom = drawing.rect(300, 100)
                        .attr({
                            x: 100,
                            y: 205,
                            fill: 'white',
                            stroke: '#CCCCCC',
                            'stroke-width': 3
                        })

    // INLO DEVICE
    var bedRoomDevice = drawing.rect(20, 10)
                        .attr({
                            x: (Number(bedRoom.node.attributes[3].nodeValue)+15),
                            y: (Number(bedRoom.node.attributes[4].nodeValue)),
                            fill: 'white',
                            stroke: '#CCCCCC',
                            'stroke-width': 3
                        })

    var bedRoomDoor = drawing.line(
                    Number(bedRoom.node.attributes[3].nodeValue)+55,
                    Number(bedRoom.node.attributes[4].nodeValue),
                    Number(bedRoom.node.attributes[3].nodeValue)+70,
                    Number(bedRoom.node.attributes[4].nodeValue)+20)
                                .stroke({color: '#CCCCCC', width: 3})


    // GROUPS LIVING ROOM, DOOR, AND DEVICE TOGETHER
    /*var bedRoomGroup = drawing.group()
                            .add(bedRoom)
    bedRoomGroup.add(bedRoomDevice)
    bedRoomGroup.add(bedRoomDoor)*/

    // push shape to floorPlan array
    floorPlan.push(bedRoom, bedRoomDevice, bedRoomDoor);

    console.log(floorPlan);
    // prints element data
    document.getElementById("print").onclick = function() {
        console.log(livingRoom.node.getBoundingClientRect().x);
        console.log(livingRoom.node.getBoundingClientRect().y);
        console.log(livingRoom.node.getBoundingClientRect().width);
        console.log(livingRoom.node.getBoundingClientRect().height);
    };



    // ================ SIDE BAR TOOL SET FUNCTIONALITY ====================

    // UPDATE ROOM DATABASE
    document.getElementById("save").onclick = function() {  

        // Stop dragging and resizing for all shapes
        for (var i = 0; i < floorPlan.length; i++) {
            floorPlan[i].draggable(false)
            floorPlan[i].selectize(false).resize("stop")
        }

        /*
        */
        for (var i = 0; i < floorPlan.length; i++) {
        
            var params = {
                Item: {
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
                else     console.log("Successfully saved and written to DB");           // successful response
            
            /*data = {
                ConsumedCapacity: {
                 CapacityUnits: 1, 
                 TableName: "Music"
                }
            }*/
            
            });
        }
    }

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

        drawing.on('mousedown', function(e){
            rect.draw(e)
                .attr({
                    fill: 'white',
                    stroke: '#CCCCCC',
                    'stroke-width': 3
                })
        }, false);

        drawing.on('mouseup', function(e){
            rect.draw('stop', e);
            floorPlan.push(rect);
        }, false);
        
        rect.on('drawstop', function(){
            rect.draw('stop');
        });
        
        console.log(floorPlan);
        
    };

})