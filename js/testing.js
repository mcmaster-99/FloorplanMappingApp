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
                                .panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})


    var shapes = [];

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
    shapes.push(livingRoomSet);*/

    // push shape to shapes array
    shapes.push(livingRoom, livingRoomDoor, livingRoomDevice);


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

    // push shape to shapes array
    shapes.push(bedRoom, bedRoomDevice, bedRoomDoor);

    console.log(shapes);
    // prints element data
    document.getElementById("print").onclick = function() {
        console.log(livingRoom.node.getBoundingClientRect().x);
        console.log(livingRoom.node.getBoundingClientRect().y);
        console.log(livingRoom.node.getBoundingClientRect().width);
        console.log(livingRoom.node.getBoundingClientRect().height);
    };

    // UPDATE ROOM DATABASE
    document.getElementById("save").onclick = function() {  

        for (var i = 0; i < shapes.length; i++) {
            shapes[i].draggable(false)

            shapes[i].selectize(false).resize("stop")
        }

        var params = {
            Item: {
                "x": {
                    S: String(livingRoom.node.getBoundingClientRect().x) //livingRoom.node.attributes[3].nodeValue
                },
                "y": {
                    S: String(livingRoom.node.getBoundingClientRect().y)
                },
                "width": {
                    S: String(livingRoom.node.getBoundingClientRect().width)
                },
                "height": {
                    S: String(livingRoom.node.getBoundingClientRect().height)
                },
                "room_ID": {
                    S: "livingRoom"
                },
                "floor": {
                    S: livingRoom.node.attributes[3].nodeValue
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


    // ================ SIDE BAR TOOL SET FUNCTIONALITY ====================

    document.getElementById("drag-resize").onclick = function() {
        /*livingRoomGroup.selectize()
                    .resize({snapToAngle: 5})
                    .draggable({snapToGrid: 5})*/
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].selectize()
                    .resize({snapToAngle: 5})
                    .draggable({snapToGrid: 5})
        }

    };
    
    document.getElementById("draw-rect").onclick = function() {
        rect = drawing.rect()
                            .attr({
                                fill: 'white',
                                stroke: '#CCCCCC',
                                'stroke-width': 3
                        })
        rect.draw()
        shapes.push(rect);

        document.getElementById("resize").onclick = function() {
            for (var i = 0; i < shapes.length; i++) {
                //console.log("stop " + shapes[i] + " resize");
                //console.log("start " + shapes[i] + " draggable");
                shapes[i].selectize().resize()
            }
        };
    };

    document.getElementById("clear").onclick = function() {
        //$("#draw").empty();
        console.log(shapes);
        for (var i = 0; i < shapes.length; i++) {
            shapes.pop();
        }
        console.log(shapes);
    };


})