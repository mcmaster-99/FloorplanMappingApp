
// Redirect user if logged out
if (getAuth("Authorization").length === 0) window.location.href = "signin.html";

//=============================================================
//						  SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {


	var floorPlan = new SVG('floorPlan').size('100%', '100%')
								.panZoom({zoomMin: 0.5, zoomMax: 500, zoomFactor: 0.2})

	var editFloorPlanButton = new SVG('edit-floorplan-btn-div')
								.size("100%", "100%")
								.attr({
									x: 100,
									y: 100
								})							

	// Edit Floorplan Button
	var editFloorPlanBackground = editFloorPlanButton.circle(50)
											.attr({
												id: "edit-floorplan-btn",
												x: "75%",
												y: "75%",
												cx: "80%",
												cy: "80%",
												fill: 'black',
											})
	var editIcon = editFloorPlanButton.image('images/editPen.png')
										.attr({
											id: "edit-floorplan-icon",
											x: "76.5%",
											y: "73%",
										})
	var editFloorPlanGroup = editFloorPlanButton
							.group()
							.attr({id:"edit-floorplan-btn-group"})
	editFloorPlanGroup.add(editFloorPlanBackground)
	editFloorPlanGroup.add(editIcon)

	$("#edit-floorplan-btn-group").click(function(){
		window.location.href = "mapedit.html";
	})

	/* Temporary stack for storing all user's floor plan data.
	** Each index consists of an SVG object.
	*/
	var floorPlanSvg = [],	  // stores SVG nodes
		floorPlanData = {},	 // stores initial data from database (room_ID as keys)
		deviceLocations = {},   // stores device coordinates
		deviceData = {},		// stores all device data
		nodeData = {},
		loaded = false;		 // Loaded boolean is set to false as default
		list_loaded = false;

	function load_floorplan() {

		// Empty floorPlan array of any previous/excess data
		var i = floorPlanSvg.length;
		while (i !== 0) {floorPlanSvg.pop(); i--}

		// Checks if floorplan is loaded
		if (loaded === true) {
			console.log("Your floorplan has already been loaded.");
		} else { // if floorplan has not been loaded
			$.ajax({
				method: 'GET',
				url: String(_config.api.inloApiUrl) + '/v1/floorplan',
				headers: {
					"Authorization": "Bearer " + getAuth("Authorization")
				},
				success: completeRequest,
				error: function ajaxError(jqXHR, textStatus, errorThrown) {
					console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
					console.error('Response: ', jqXHR);
					//window.location.href = 'signin.html';
				}
			});
		}

		function completeRequest(result) {
			console.log('Response received from API: ', result);
			var rawFloorPlan = JSON.stringify(result.Items);

			/*var tmpDevicesArray = [];

			// push item names to temporary array for sorting
			for (var i = 0; i < result.Items.length; i++) {
				tmpDevicesArray.push(result.Items[i].name);
			}
			tmpDevicesArray.sort(); // sort items*/

			// if there is no floorplan
			if (result.length === 0) {
				// Render a message on the screen
				$("#map-view-text").append("Map view not yet available");
			} else {
				// Loop through all items in database and store in floorplan array/stack
				for (var i = 0; i < result.length; i++) {

					if (result[i].rooms.length > 0) {
						// iterate over rooms
						for (var j = 0; j < result[i].rooms.length; j++) {
							var room = floorPlan.rect(result[i].rooms[j].width, result[i].rooms[j].height)
								.attr({
									x: result[i].rooms[j].x,
									y: result[i].rooms[j].y,
									fill: 'white',
									stroke: '#E3E3E3',
									'stroke-width': 3
								}) 
							room.node.id = result[i].rooms[j].roomID;
							var room_ID = result[i].rooms[j].roomID;
							floorPlanSvg.push(room);	
							floorPlanData[room_ID] = result[i].rooms[j];

							// iterate over nodes
							if (result[i].rooms[j].hasOwnProperty("nodes")) {
								for (var k = 0; k < result[i].rooms[j].nodes.length; k++) {

									var node_ID = result[i].rooms[j].nodes[k].nodeID;

									var svgX = document.getElementById(floorPlan.node.id).getBoundingClientRect().x,
										svgY = document.getElementById(floorPlan.node.id).getBoundingClientRect().y,
										// current coordinates of room
										room_x = result[i].rooms[j].x - svgX,
										room_y = result[i].rooms[j].y - svgY,
										// current dimensions of room
										height = result[i].rooms[j].height,
										width = result[i].rooms[j].width;


									var node_x_frac = result[i].rooms[j].nodes[k].x;
									var node_y_frac = result[i].rooms[j].nodes[k].y;

									var node_x = node_x_frac*width + room_x;
									var node_y = node_y_frac*height + room_y;

									console.log(j);
									console.log(room_x, room_y);


									var drawNode = floorPlan.image("images/inlo-device.png", 15, 10);
									drawNode.attr({
																x: node_x,
																y: node_y,
																fill: "white",
																stroke: "#E3E3E3",
																id: node_ID})

								}
							}

						}
					} else {continue;}
				}
			}

			// set loaded to true to prevent excess loading
			loaded = true;
		}

	}

	function render_devices_initial() {
		for (var key in deviceData) {

			var roomID = deviceData[key].roomID,
				nearestNodeID = deviceData[key].nearestNodeID,
				region = deviceData[key].region,
				roomName = deviceData[key].roomName,
				device_x,
				device_y;

			// Grab SVG coordinates so we can subtract from element coordinates 
			// to give us the actual coordinates on the SVG document.
			var svgX = document.getElementById(floorPlan.node.id).getBoundingClientRect().x,
				svgY = document.getElementById(floorPlan.node.id).getBoundingClientRect().y;

			// current coordinates of room
			var room_x = floorPlanData[roomID].x - svgX,
				room_y = floorPlanData[roomID].y - svgY,
			// current dimensions of room
				height = floorPlanData[roomID].height,
				width = floorPlanData[roomID].width;

		
			var nearestNodeData = {};

			for (var n = 0; n < floorPlanData[roomID].nodes.length; n++) {
				if (floorPlanData[roomID].nodes[n].nodeID === nearestNodeID){
					nearestNodeData = floorPlanData[roomID].nodes[n];
					console.log(nearestNodeData);
				}
			}

			node_x_frac = nearestNodeData.x,
			node_y_frac = nearestNodeData.y,

			// use raw node coordinates to compute actual node coordinates
			node_x = node_x_frac*width + room_x,
			node_y = node_y_frac*height + room_y;


			// draw node at real location inside room
			//var inloNode = floorPlan.image("images/inlo-device.png", 15, 10);
			//inloNode.attr({x: node_x, y: node_y, fill: "white", stroke: "#E3E3E3"})

			// Determine device coordinates
			switch(region){
				case "N":
					// determine x coordinate of near device
					if (node_x_frac < 0.5) {
						device_x = room_x + width*0.25;
					} else {
						device_x = room_x + width*0.75;
					}
					// determine y coordinate of near device
					if (node_y_frac < 0.5) {
						device_y = room_y + height*0.25;
					} else {
						device_y = room_y + height*0.75;
					}
					break;
				case "F":
					// determine x coordinate of far device
					if (node_x_frac < 0.5) {
						device_x = room_x + width*0.75;
					} else {
						device_x = room_x + width*0.25;
					}
					// determine y coordinate of far device
					if (node_y_frac < 0.5) {
						device_y = room_y + height*0.75;
					} else {
						device_y = room_y + height*0.25;
					}
					break;
			}

			// draw and store device object initializer in deviceLocations object
			deviceLocations[key] = {};
			deviceLocations[key]["Icon"] = floorPlan.image("images/inlo.png", 10, 10);
			deviceLocations[key]["Icon"].attr({x: device_x, y: device_y, fill: "white", stroke: "#E3E3E3"})

		}
	}

	function relocate_device(device_ID, new_room_ID, new_node_ID, new_region) {

		var device_x, device_y;

		// Grab SVG coordinates so we can subtract from element coordinates 
		// to give us the actual coordinates on the SVG document.
		var svgX = document.getElementById(floorPlan.node.id).getBoundingClientRect().x,
			svgY = document.getElementById(floorPlan.node.id).getBoundingClientRect().y;
		// current coordinates of room
		var room_x = document.getElementById(new_room_ID).getBoundingClientRect().x - svgX,
			room_y = document.getElementById(new_room_ID).getBoundingClientRect().y - svgY,
		// current dimensions of room
			height = document.getElementById(new_room_ID).getBoundingClientRect().height,
			width = document.getElementById(new_room_ID).getBoundingClientRect().width;

		// grab raw node coordinates from floorPlanData array to determine actual node coords
		node_x_frac = floorPlanData[new_room_ID][new_node_ID].x,
		node_y_frac = floorPlanData[new_room_ID][new_node_ID].y,

		// use raw node coordinates to compute actual node coordinates
		node_x = node_x_frac*width + room_x,
		node_y = node_y_frac*height + room_y;

		// Determine device coordinates
		switch(new_region){
			case "N":
				// determine x coordinate of near device
				if (node_x_frac < 0.5) {
					device_x = room_x + width*0.25;
				} else {
					device_x = room_x + width*0.75;
				}
				// determine y coordinate of near device
				if (node_y_frac < 0.5) {
					device_y = room_y + height*0.25;
				} else {
					device_y = room_y + height*0.75;
				}
				break;
			case "F":
				// determine x coordinate of far device
				if (node_x_frac < 0.5) {
					device_x = room_x + width*0.75;
				} else {
					device_x = room_x + width*0.25;
				}
				// determine y coordinate of far device
				if (node_y_frac < 0.5) {
					device_y = room_y + height*0.75;
				} else {
					device_y = room_y + height*0.25;
				}
				break;
		}

		// Move device to its proper location
		deviceLocations[device_ID]["Icon"].animate().move(device_x, device_y)

	}


	function read_devices_database(onReadComplete, relocate_device, populate_list) {
		$.ajax({
			method: 'GET',
			url: String(_config.api.inloApiUrl) + '/v1/nodes',
			headers: {
				"Authorization": "Bearer " + getAuth("Authorization")
			},
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
			

			// Store devices in deviceData array
			for (var i = 0; i < result.length; i++) {
				// Separate into Nodes and Devices
				if (result[i].type === "device") {
					deviceData[result[i].nodeID] = result[i];
				}
			}

			onReadComplete();
			//relocate_device("dd2", "rm3", "d3", "F");
			populate_list();
			//deviceData.dd2.location = "rm1";
			//update_list("dd2", "rm3", "d1", "F");
		}

	}

	function sort_list() {
		var sorted = $(".item-names").sort(function (a, b) {
			console.log("in sorting")
			return a.textContent > b.textContent;
		});
		re_assign();
	}

	function populate_list() {
		// Loop through deviceData object and create new div (.item-rows) 
		// and assign name+room text values to divs
		for (var key in deviceData) {
			var location = deviceData[key].roomName;
			var device_name = deviceData[key].macAddress;
			
			$("#items-listed")
				.append("<div class='item-rows'>"+
						"<p class='item-names'>"+ device_name +"</p>"+
						"<p class='item-rooms'>"+ /*room_label*/ location+"</p>"+
						"</div>");
		}

		list_loaded = true;
		/*// Sort listed items and store in variable
		var sorted = $(".item-names").sort(function (a, b) {
			console.log("in sorting")
			return a.textContent > b.textContent;
		});
		// Loop through item names and re-assign correct names (alphabetically)
		$(".item-names").each(function(i){
			console.log("in re-assign")
			this.textContent = sorted[i].innerText;
		})*/
		//sort_list();
	}

	function update_list(device_ID, new_room_ID, new_node_ID, new_region) {
		console.log(deviceData);
		device_name = deviceData[device_ID].macAddress;
		new_room_label = new_room_ID;
		console.log(new_room_label);

		for (var key in deviceData) {

			// if nothing has changed, exit/break
			if (deviceData[key].location === new_room_ID) {
				continue;
			// if room data has changed
			} else {

				// change deviceData keys to new room data
				deviceData[device_ID].location = new_room_ID;
				deviceData[device_ID].node_ID = new_node_ID;
				deviceData[device_ID].region = new_region;

				// iterate through rows to check which row has the name
				$('.item-rows').each(function() {
					console.log($(this.children[0]).text());
					// device name equals new room label
					if ($(this.children[0]).text() === device_name) {
						console.log("here");
						// fade out 
						$(this.children[1]).fadeOut();
						this.children[1].innerText = new_room_label;
						$(this.children[1]).fadeIn();
					}
				})
			}
		}
	}

	var sorted;
	function sort_list() {
		var sorted = $(".item-names").sort(function (a, b) {
			return a.textContent > b.textContent;
		});
		for (var i = 0; i < sorted.length; i++) {
			sorted[i].innerText
		}
	}

	function re_assign() {
		$(".item-names").each(function(i){
			console.log(this.textContent);
			//this.textContent = sorted[i].innerText;
		})
	}


	/* function update_list(device_ID, new_room_ID, new_node_ID, new_region)
	IF mqtt and change found
		- loop through divs to find changed item
		- IF item found
			change room to correct room
	ELSE IF mqtt and nothing changed
		- continue
	ELSE
		- continue
	*/

	load_floorplan();
	read_devices_database(render_devices_initial, relocate_device, populate_list);



	//=========================================
	// ========== BUTTON CLICKS ===============
	//=========================================

	// VIEW SWITCHERS

	//$("#items-listed-div").hide();
	//$("#dropdown-sort-div").hide();
	$("#map-view-div").hide();
	$("#edit-floorplan-btn-group").hide();

	$("#list-view-btn").click(function() {
		$("#prompt").fadeOut();
		$("#floorPlan").fadeOut();
		$("#map-view-text").fadeOut();
		$("#edit-floorplan-btn-group").fadeOut();
		$("#items-listed-div").delay(500).fadeIn("slow");
		$("#dropdown-sort-div").delay(500).fadeIn("slow");
	});


	$("#map-view-btn").click(function() {
		$("#dropdown-sort-div").fadeOut();
		$("#prompt").fadeOut();
		$("#items-listed-div").fadeOut();
		$("#edit-floorplan-btn-group").fadeIn("slow");
		$("#floorPlan").delay(500).fadeIn("slow");
		$("#map-view-text").delay(500).fadeIn("slow");
		$("#map-view-div").delay(500).fadeIn("slow");
	});

	$("#dropdown-btn").click(function() {
		$("#dropdown-menu").toggle(500);
	});
	// VIEW SWITCHERS END

	// SIGN OUT API CALL
	$("#sign-out").click(function() {
		$.ajax({
            method: 'DELETE',
            url: String(_config.api.inloApiUrl) + '/v1/user/login',
            headers: {
                Authorization: 'Bearer ' + getAuth("Authorization")
            },
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
        function completeRequest() {
        	// delete cookie by setting past expiration date
        	document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';

        	// alert user of successful sign out
        	alert("Successfully signed out");

        	// redirect user to sign in page
        	window.location.href = "signin.html";
        }
	});

	/*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
		return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	}))*/


})
