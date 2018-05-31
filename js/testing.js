
//=============================================================
//                          SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {
    var drawing = new SVG('draw').size(500, 500)
                                .panZoom({zoomMin: 0.5, zoomMax: 20, zoomFactor: 0.2})
    
    

    // LIVING ROOM
    var livingRoom = drawing.rect(200, 100)
                            .attr({
                                x: 80,
                                y: 50,
                                fill: 'white',
                                stroke: '#CCCCCC',
                                'stroke-width': 3
                            })
    // UPDATE ROOM DATABASE

                        

    // BEDROOM
    var bedRoom = drawing.rect(300, 100)
                        .attr({
                            x: 100,
                            y: 205,
                            fill: 'white',
                            stroke: '#CCCCCC',
                            'stroke-width': 3
                        })


    // BATHROOM
    var bathRoom = drawing.rect(20, 10)
                        .attr({
                            x: (Number(livingRoom.node.attributes[3].nodeValue)+15),
                            y: (Number(livingRoom.node.attributes[4].nodeValue)),
                            fill: 'white',
                            stroke: '#CCCCCC',
                            'stroke-width': 3
                        })


    document.getElementById("drag").onclick = function() {
        livingRoom.selectize(false).resize("stop");
        bedRoom.selectize(false).resize("stop");
        bathRoom.selectize(false).resize("stop");

        livingRoom.draggable({snapToGrid: 20})
        bedRoom.draggable({snapToGrid: 20})
        bathRoom.draggable({snapToGrid: 20})
    };
    document.getElementById("resize").onclick = function() {
        livingRoom.selectize().resize({snapToGrid: 10})
        bedRoom.selectize().resize({snapToGrid: 10})
        bathRoom.selectize().resize({snapToGrid: 10})
    };
    /*document.getElementById("draw").onclick = function() {
        drawing = new SVG('draw').size(500, 500);
        rect = drawing.rect().draw()
    };*/ 
    document.getElementById("clear").onclick = function() {
        $("#draw").empty();
    };


})


/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};

(function rideScopeWrapper($) {
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
            url: _config.api.invokeUrl + '/devices/get',
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
        devices = JSON.stringify(result.Items);
        displayUpdate(devices);
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handleRequestClick(event) {
        event.preventDefault();
        requestUnicorn("UUID");
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));



