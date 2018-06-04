
//require(['aws-sdk'], function(AWS) {


    var dynamodb = new AWS.DynamoDB();


    //=============================================================
    //                          SVG.JS
    //=============================================================
    SVG.on(document, 'DOMContentLoaded', function() {
        var drawing = new SVG('draw').size(500, 500)
                                    .panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})
    

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
        livingRoomGroup.add(livingRoomDevice)
        livingRoomGroup.add(livingRoomDoor)


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
        var bedRoomGroup = drawing.group()
        .add(bedRoom)
        bedRoomGroup.add(bedRoomDevice)
        bedRoomGroup.add(bedRoomDoor)


        document.getElementById("print").onclick = function() {
            console.log(livingRoom.node.getBoundingClientRect().x);
            console.log(livingRoom.node.getBoundingClientRect().y);
            console.log(livingRoom.node.getBoundingClientRect().width);
            console.log(livingRoom.node.getBoundingClientRect().height);
        };

        // UPDATE ROOM DATABASE
        document.getElementById("save").onclick = function() {  

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
            /*
            data = {
            ConsumedCapacity: {
             CapacityUnits: 1, 
             TableName: "Music"
            }
            }
            */
            });
        }



        document.getElementById("drag").onclick = function() {
            livingRoom.selectize(false).resize("stop");
            bedRoom.selectize(false).resize("stop");

            /*livingRoom.draggable({snapToGrid: 20})
            bedRoom.draggable({snapToGrid: 20})
            device.draggable({snapToGrid: 20})*/
            livingRoomGroup.draggable({snapToGrid: 20})
            bedRoomGroup.draggable({snapToGrid: 20})
        };
        document.getElementById("resize").onclick = function() {
            livingRoom.selectize().resize()
            bedRoom.selectize().resize()
        };
        /*document.getElementById("draw").onclick = function() {
            drawing = new SVG('draw').size(500, 500);
            rect = drawing.rect().draw()
        };*/ 
        document.getElementById("clear").onclick = function() {
            $("#draw").empty();
        };


    })

//=============================================================
//                          D3.JS
//=============================================================
/*var container = document.getElementById("svg");
var i = 0;
var xPosition = [];
var yPosition = [];
var radius = 20;

var zoom = d3.zoom()
    .on("zoom", function() {
        console.log(d3.event);
        svgContainer.attr("transform", d3.event.transform)
    })


var svgContainer = d3.select(container)
    .attr("width", 500)
    .attr("height", 500)
    .attr("border", "5px solid black")
    .call(d3.zoom()
        .on("zoom", function() {
            console.log(d3.event);
            $("#svg").attr("transform", d3.event.transform)
        }));

svgContainer.append("circle")
            .attr("class", "circle")
            .attr("cx", 50 )
            .attr("cy", 50 )
            .attr("stroke", "green")
            .attr("stroke-width", 5)
            .attr("r", radius)
            .on("mouseover", hover)
            .on("mouseout", unhover);



// CIRCLE DRAGGING AND RESIZING
/*
container.onclick = function (e) {

    var circle = svgContainer.append("circle")
                            .attr("class", "circle")
                            .attr("cx", e.clientX )
                            .attr("cy", e.clientY )
                            .attr("stroke", "green")
                            .attr("stroke-width", 5)
                            .attr("r", radius)
                            .on("mouseover", hover)
                            .on("mouseout", unhover)
                            .call(drag_handler);
}

function hover(d, i) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr("r", radius + 5)
}
function unhover(d, i) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr("r", radius - 5)
}


var drag_handler = d3.drag()
    .on("drag", function(d) {
        console.log("x: " + d3.event.x + " y: " + d3.event.y);
        d3.select(this)
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);
    });

var resize_circle = d3.drag()
    .on("drag", function(d) {
        console.log(d3.event);
        d3.select(this)
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);
    });

var zoom = d3.zoom()
    .on("zoom", function() {
        svgContainer.attr("transform", d3.event.transform)
    })
*/



// RECTANGLE DRAGGING AND RESIZING
/*
container.onclick = function (e) {

    var rect = svgContainer.append("rect")
                            .attr("class", "rect")
                            .attr("x", e.clientX )
                            .attr("y", e.clientY )
                            .attr("width", 100)
                            .attr("height", 100)
                            .attr("fill", "white")
                            .attr("stroke", "green")
                            .attr("stroke-width", 5);

    var g = svgContainer.append("g");

    g.append("circle")
        .style("fill", "green")
        .attr("cx", e.clientX)
        .attr("cy", e.clientY)
        .attr("r", 10)
        .on("mouseover", hover)
        .on("mouseout", unhover)
        .call(drag_handler);

    var corner_circle = d3.select(this);

        corner_circle
            .append("circle")
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y)
            .attr("r", 5);
}

function hover(d, i) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr("r", radius + 5)
}
function unhover(d, i) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr("r", radius - 5)
}

var drag_handler = d3.drag()
    .on("drag", function(d) {
        console.log(d3.event.x);
        d3.select(this)
            .style("cursor", "move")
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);
    });

var resize_right = d3.behavior.drag()
    .on("drag", function() {
        console.log("in resize function")
        x = d3.mouse(this.parentNode)[0];

        x = Math.max(50, x);

        rect.style("width", x + "px");
    })*/


//=============================================================
//                        INTERACT.JS
//=============================================================
/*
interact('.resize-drag')

  .draggable({
    inertia: true,
    // keep the element within the area of its parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    snap: {
            targets: [
                interact.createSnapGrid({x: 25, y: 25})
            ],
            range: Infinity,
            relativePoints: [ { x: 0, y: 0 } ]
    },
    // enable autoScroll
    autoSctroll: true,

    // call this function on every dragmove event
    onmove: dragMoveListener,

    //call this function on every dragend event
    onend: function (e) {
        var textEl = e.target.querySelector('p');

        textEl && (textEl.textContent = 
            'moved a distance of '
            + (Math.sqrt(Math.pow(e.pageX - e.x0, 2) + 
                        Math.pow(e.pageY - e.y0, 2) | 0))
                .toFixed(2) + 'px');
    }
  })

  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

  })

  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';


    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
  });





var element = document.getElementById('resize-drag2'), 
    x = 0, y = 0;

interact(element)
    .draggable({
        snap: {
            targets: [
                interact.createSnapGrid({x: 25, y: 25})
            ],
            range: Infinity,
            relativePoints: [ { x: 0, y: 0 } ]
        },
        inertia: false,
        restrict: {
            restriction: element.parentNode,
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
            endOnly: true
        }
    })
    .on('dragmove', function (event) {
        x += event.dx;
        y += event.dy;

        event.target.style.webkitTransform = 
        event.target.style.transform = 
            'translate(' + x + 'px, ' + y + 'px)';
    })





function dragMoveListener(e) {
    var target = e.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;
    console.log("target: " + target);
    console.log("x: " + x);
    console.log("y: " + y);

    target.style.webkitTransform = 
    target.style.transform = 
        'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}*/