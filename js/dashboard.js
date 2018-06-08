
$(document).ready(function(){


	$("#list-view-btn").click(function() {
		$("#prompt").fadeOut();
		$("#map-view-text").fadeOut();
		$("#items-listed-div").delay(500).fadeIn("slow");

	});


	$("#map-view-btn").click(function() {
		$("#prompt").fadeOut();
		$("#items-listed-div").fadeOut();
		$("#map-view-text").delay(500).fadeIn("slow");

	});

	/*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
	    return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	}))*/


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
        var devices = JSON.stringify(result.Items);

        var tmpDevicesArray = [];
    	for (var i = 0; i < result.Items.length; i++) {
    		tmpDevicesArray.push(result.Items[i].name);
    	}
    	tmpDevicesArray.sort();
       	console.log("tmpDevicesArray is: " + tmpDevicesArray);

       	for (var i = 0; i < tmpDevicesArray.length; i++) {

			// Check if value exists in Object
			for (var y in result.Items) {
				console.log("got here");
				if (result.Items[y].name === tmpDevicesArray[i]) {
					$("#item-name-list").append('<ol class="item-names">' + result.Items[i].name + '</ol>');
	        		$("#item-room-list").append('<ol class="item-rooms">' + result.Items[i].room + '</ol>');
	        		$("#item-icon-list").append('<ol class="item-icons">' + "[" + result.Items[i].icon + "]" + '</ol>');
				}
			}
    	}
        /*if (devices === "No Dynamic Devices") {
        	$("#items-listed").append("<p>"+ result.Items[0].mac_address +"</p>");
        } else {
        	console.log(result);
        	for (var i = 0; i < result.Items.length; i++) {
        		$("#item-name-list").append('<ol class="item-names">' + result.Items[i].name + '</ol>');
        		$("#item-room-list").append('<ol class="item-rooms">' + result.Items[i].room + '</ol>');
        		$("#item-icon-list").append('<ol class="item-icons">' + "[" + result.Items[i].icon + "]" + '</ol>');
        	}
        }
        console.log(devices);*/
        displayUpdate(devices);
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#list-view-btn').click(handleRequestClick);
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


})