// dashboard.js
//
// Users main home page:
// List View and Map view of devices in Floorplan
//
'use strict'; // Redirect user if logged out

if (getAuth("Authorization").length === 0) window.location.href = "signin.html"; //=============================================================
//						  REACT.JS
//=============================================================

/*class ListView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			itemName: '',
			itemRoom: '',
			deviceData: ['Test']
		};
	}	

	render() {
		return (

			<div id="items-listed">

	            <div className='item-rows'>
	                <p className='item-names'>{this.state.deviceData}</p>
	                <p className='item-rooms'>{this.state.deviceData}</p>
	            </div>

        	</div>

        );
	}
}

const listViewComponent = <ListView/>;

ReactDOM.render(
  listViewComponent,
  document.getElementById('items-listed-div')
);*/
//=============================================================
//						  SVG.JS
//=============================================================
SVG.on(document, 'DOMContentLoaded', function() {

	var floorPlan = new SVG('floorPlan').size('100%', '100%')
										.attr({id: 'floorPlanSVG'})
										.panZoom({zoomMin: 0.5, zoomMax: 500, zoomFactor: 0.2})

	var editFloorPlanButton = new SVG('edit-floorplan-btn-div')
								.size("100%", "100%")
								.attr({
									x: 80,
									y: 80
								})							

	// Edit Floorplan Button
	var editFloorPlanIcon = editFloorPlanButton
							.image('images/mapeditIcon.svg')
							.attr({id: "edit-floorplan-btn"})
							.style('cursor', 'pointer')


	var floorPlan,
		floorPlanSvg = [],	  // stores SVG nodes
		floorPlanData = {},	 // stores initial data from database (room_ID as keys)
		deviceLocations = {},   // stores device coordinates
		deviceData = {},		// stores all device data
		nodeData = {},
		loaded = false,	 // Loaded boolean is set to false as default
		list_loaded = false;

	//=============================================================
	//						Websocket Connection
	//=============================================================

	const connectSocket = (deviceData) => {
		// if user is running mozilla then use it's built-in WebSocket
		window.WebSocket = window.WebSocket || window.MozWebSocket;
	
		var connection = new WebSocket('wss://api.theinlo.com/events');
	
		var body = '{"type":"subscribe","payload":{"userID":"' + getAuth("userID") + '"}}';
	
		connection.onopen = function () {
	
			//connection.send(getAuth("Authorization"));
			// connection is opened and ready to use
			console.log("open");
			connection.send(body);
		};
	
		connection.onerror = function (error) {
			// an error occurred when sending/receiving data
			console.log(error);
		};
	
		connection.onmessage = function (message) {
			// parse the json
			try {
			  const json = JSON.parse(message.data),
			  		roomID = json.roomID,
			  		nodeID = json.nodeID,
			  		roomName = json.roomName,
			  		newNodeID = json.nearestNodeID,
			  		region = json.region,
					device_x = json.x,
					device_y = json.y;

			  console.log(message);

                          // Update list view and relocate the device on map

			  //const update_list = (device_ID, new_room_ID, new_node_ID, new_region)
			  update_list(nodeID, roomName, newNodeID, region);

			  deviceLocations[nodeID]["Icon"].animate({ ease: '<', delay: '1.5s' }).move(device_x, device_y);
			  //relocate_device(nodeID, roomID, newNodeID, region, device_x, device_y);
			  
			} catch (error) {
			  console.error(error);
			  console.log('Error in parsing message JSON: ', message.data);
			  return;
			}
		};
	
		connection.onclose = function (error) {
			// socket server closed
			console.log("closed");
			setTimeout(connectSocket, 5000);
		};
	
		function reOpen() {
			connection = new WebSocket('wss://api.theinlo.com/events');
		}
  
	}

	//=============================================================
	//						Render Floorplan and Inlo Nodes
	//=============================================================

	const load_floorplan = () => {

		// Empty floorPlan array of any previous/excess data
		let length = floorPlanSvg.length;
		while (length !== 0) {floorPlanSvg.pop(); length--}

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
			let rawFloorPlan = JSON.stringify(result.Items);

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
				for (let i = 0; i < result.length; i++) {

					if (result[i].rooms.length > 0) {
						// iterate over rooms
						for (let j = 0; j < result[i].rooms.length; j++) {
							let room = floorPlan.rect(result[i].rooms[j].width, result[i].rooms[j].height)
								.attr({
									x: result[i].rooms[j].x,
									y: result[i].rooms[j].y,
									fill: 'white',
									stroke: '#E3E3E3',
									'stroke-width': 3
								}) 
							room.node.id = result[i].rooms[j].roomID;
							const room_ID = result[i].rooms[j].roomID;
							floorPlanSvg.push(room);	
							floorPlanData[room_ID] = result[i].rooms[j];

							// iterate over nodes
							if (result[i].rooms[j].hasOwnProperty("nodes")) {
								for (let k = 0; k < result[i].rooms[j].nodes.length; k++) {

									const node_ID = result[i].rooms[j].nodes[k].nodeID;

									const node_x = result[i].rooms[j].nodes[k].x,
									      node_y = result[i].rooms[j].nodes[k].y;

									const drawNode = floorPlan.image("images/inlo-device.png", 15, 10);
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

			read_devices_database()
		}
		
	}
   


	//=============================================================
	//						Render User's Devices
	//=============================================================
   
	
	// Load Data from Database
	const read_devices_database = () => {
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

			// Store devices in deviceData array
			for (var i = 0; i < result.length; i++) {
				// Separate into Nodes and Devices
				if (result[i].type === "device") {
					deviceData[result[i].nodeID] = result[i];
				}
			}
			render_devices_initial()
			populate_list()
		}
	}

	// Render initial positions of Devices on Map
	const render_devices_initial = () => {

		for (let key in deviceData) {

			const 	roomID = deviceData[key].roomID,
					nearestNodeID = deviceData[key].nearestNodeID,
					icon_color = deviceData[key].iconColor,
					region = deviceData[key].region,
					roomName = deviceData[key].roomName,
                    device_x = deviceData[key].x,
                    device_y = deviceData[key].y;

			// draw and store device object initializer in deviceLocations object
			deviceLocations[key] = {};

			let iconPath = floorPlan.path("M13.4293 0H9.92157C4.44201 2.49689e-05 0 4.44204 0 9.92157V13.4294V17.3627V19.8431H2.48041H6.41376H9.92157C15.401 19.8431 19.8431 15.4011 19.8431 9.92157V6.41373V2.48039V0H17.3627H13.4293ZM7.44113 9.92153C7.44113 11.2914 8.55167 12.4019 9.92157 12.4019C11.2914 12.4019 12.4019 11.2914 12.4019 9.92153C12.4019 8.55167 11.2914 7.44113 9.92157 7.44113C8.55167 7.44113 7.44113 8.55167 7.44113 9.92153ZM9.92157 17.3627C14.0311 17.3627 17.3627 14.0312 17.3627 9.92157C17.3627 5.81194 14.0311 2.48041 9.92157 2.48041C5.8119 2.48041 2.48036 5.81194 2.48036 9.92157C2.48036 14.0312 5.8119 17.3627 9.92157 17.3627ZM23.5636 17.3626C23.5636 16.6777 23.0084 16.1225 22.3234 16.1225C21.6385 16.1225 21.0833 16.6777 21.0833 17.3626C21.1069 18.3923 20.7954 19.1329 20.1362 19.8427C19.4532 20.6059 18.4645 21.0832 17.3627 21.0832C16.6778 21.0832 16.1225 21.6385 16.1225 22.3234C16.1225 23.0084 16.6778 23.5636 17.3627 23.5636C19.1993 23.5636 20.8507 22.7636 21.9844 21.4969C22.8963 20.4515 23.54 18.874 23.5636 17.3626Z")
			iconPath.attr({id:"iconPath",
							'fill-rule': "evenodd",
							'clip-rule': "evenodd",
							fill: icon_color})
			iconPath.x(50).y(200)
			deviceLocations[key]["Icon"] = iconPath;
			iconPath.front()
		}
		connectSocket(deviceData);
	}

	// Relocate devices position - this function gets called on websocket updates
    const relocate_device = (device_ID, new_room_ID, new_node_ID, new_region, device_x, device_y) => {

		// Move device to its proper location
		deviceLocations[device_ID]["Icon"].animate({ ease: '<', delay: '1.5s' }).move(device_x, device_y)

	}



	//=============================================================
	//						Load the List View
	//=============================================================
	const populate_list = () => {

		// Loop through deviceData object and create new div (.item-rows) 
		// and assign name+room text values to divs
		console.log(deviceData)
		for (var key in deviceData) {
			var location = deviceData[key].roomName || "Unknown";
			var device_name = deviceData[key].name || deviceData[key].macAddress
			console.log(device_name)
			
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

	const update_list = (device_ID, new_room_ID, new_node_ID, new_region) => {


		for (let key in deviceData) {
			if (key === device_ID) {
				const 	device_name = deviceData[key].name, // Need to add: if no name attribute, use mac address instead
						new_room_label = new_room_ID;
				// if nothing has changed, exit/break
				if (deviceData[key].location === new_room_ID) {
					continue;
				// if room data has changed
				} else {
	
					// change deviceData keys to new room data
					deviceData[device_ID].location = new_room_ID;
					deviceData[device_ID].nearestNodeID = new_node_ID;
					deviceData[device_ID].region = new_region;

					// iterate through rows to check which row has the name
					$('.item-rows').each(function() {
						// device name equals new room label
						if ($(this.children[0]).text() === device_name) {
							// fade out 
							$(this.children[1]).fadeOut();
							this.children[1].innerText = new_room_label;
							$(this.children[1]).fadeIn();
						}
					})
				}
			}
		}
	}

	const sort_list = () => {
		let sorted = $(".item-names").sort(function (a, b) {
			return a.textContent > b.textContent;
		});
		for (var i = 0; i < sorted.length; i++) {
			sorted[i].innerText
		}
	}

	const re_assign = () => {
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

	load_floorplan()
	
	//=============================================================
  //						Render User's Devices
  //=============================================================
  // Load Data from Database



  //=============================================================
  //						Load the List View
  //=============================================================

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

});

$(document).ready(function(){
		//=========================================
	  // ========== BUTTON CLICKS ===============
	  //=========================================
	  // VIEW SWITCHERS
	  //$("#items-listed-div").hide();
	  //$("#dropdown-sort-div").hide();

	  $("#edit-floorplan-btn").hide();

	  // Display list view and hide map view
	  $("#list-view-btn").click(function () {
	    $("#map-view-btn").removeClass('selected'); // remove selected class from previous element

	    $(this).addClass('selected'); // add selected class to (this)

	    $("#prompt").fadeOut();
	    $("#floorPlan").fadeOut();
	    $("#map-view-div").fadeOut();
	    $("#edit-floorplan-btn").fadeOut();
	    $("#items-listed-div").delay(500).fadeIn("slow");
	    $("#dropdown-sort-div").delay(500).fadeIn("slow");
	  });
	  // Display map view and hide list view
	  $("#map-view-btn").click(function () {
	    $("#list-view-btn").removeClass('selected'); // remove selected class from previous element

	    $(this).addClass('selected'); // add selected class to (this)

	    $("#dropdown-sort-div").fadeOut();
	    $("#prompt").fadeOut();
	    $("#items-listed-div").fadeOut();
	    $("#edit-floorplan-btn").fadeIn("slow");
	    $("#floorPlan").delay(500).fadeIn("slow");
	    $("#map-view-text").delay(500).fadeIn("slow");
	    $("#map-view-div").delay(500).fadeIn("slow");
	  });
	  $("#edit-floorplan-btn").click(function () {
	    window.location.href = "mapedit.html";
	  });
	  $(".home-icon").click(function () {
	    var homeIconClass = document.getElementsByClassName("home-icon");
	    var homeIconId = document.getElementById("home-icon-svg");

	    for (var i = 0; i < $(".home-icon").length; i++) {
	      homeIconClass[i].attributes[4].nodeValue = "#00D9A7";
	    }

	    homeIconId.style.borderBottom = "6px solid #00D9A7";
	    homeIconId.style.paddingBottom = ".6em";
	  });
	  $("#dropdown-btn").click(function () {
	    $("#dropdown-menu").toggle(500);
	  });
	  // VIEW SWITCHERS END


	  // SIGN OUT API CALL

	  $("#sign-out").click(function () {
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
	      document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/'; // alert user of successful sign out

	      alert("Successfully signed out"); // redirect user to sign in page

	      window.location.href = "signin.html";
	    }
	  });
	  /*$("#sort-selection").html($("#sort-selection option").sort(function (a, b) {
	  	return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
	  }))*/
});
