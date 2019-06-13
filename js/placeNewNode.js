// placeNewNode.js
//
// user places new node

'use strict';

// Redirect user if logged out
if (getAuth("Authorization").length === 0) window.location.href = "signin.html";

/*class NavBar extends React.Component {
	constructor(props) {
		super(props);
	}	

	render() {
		return (

			<div id="navbar-div">
			  <nav>
				<img src="images/theinlo.png" id="inlo-banner"></img>
			  </nav>
			</div>

		);
	}
}

ReactDOM.render((
	<NavBar/>
),document.getElementById("root"));*/


SVG.on(document, 'DOMContentLoaded', function () {

	let changesMade = false;

	let drawing = new SVG('draw').size("100%", "100%").attr({id: "svg"}),
		encoded =  window.location.href,
		room,
		roomID;

	const decodeURI = function() {
		try {
			// decoding URL to get params
			let str = decodeURIComponent(encoded);
			
			roomID = str.substr(str.indexOf("=")+1);
		} catch(e) { // catches a malformed URI
		  console.error(e);
		}
	}


	const fetch_room_data = function() {

		let roomData;

		$.ajax({
		  method: 'GET',
		  url: String(_config.api.inloApiUrl) + '/v1/floorplan',
		  headers: {
			Authorization: 'Bearer ' + getAuth("Authorization")
		  },
		  success: completeAjaxRequest,
		  error: function ajaxError(jqXHR, textStatus, errorThrown) {
			console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
			console.error('Response: ', jqXHR.responseText);
		  }
		})
		function completeAjaxRequest(result) {
			for (let i = 0; i < result.length; i++) {
				if (result[i].rooms.length > 0) {
					for (let j = 0; j < result[i].rooms.length; j++) {
						if (String(result[i].rooms[j].roomID) == String(roomID)){
							console.log("here")
							roomData = result[i].rooms[j];
							console.log(roomData)
						}
					}
				}
			}
			console.log(document.getElementById("draw").getBoundingClientRect())
			let room_w = roomData.width,
				room_h = roomData.height,
				jumbo_w = document.getElementById("draw").getBoundingClientRect().width,
				jumbo_h = document.getElementById("draw").getBoundingClientRect().height,
				scale;
			const setScale = function(room_w, room_h) {
				if (room_w > room_h) { 
					scale = jumbo_w/room_w
					console.log(scale)
				} else {
					scale = jumbo_h/room_w
					console.log(scale)
				}
			}
			setScale(room_w, room_h)
			let scaled_width = room_w*scale,
				scaled_height = room_h*scale;

			/*const saveNodeCoordinates = function(x, y, roomData) {
				// convert to floorplan coordinate
				node_x = room_x + x*scale
				node_y = room_y + y*scale
				
				// API call to add node to room
			}*/
			room = drawing.rect(scaled_width, scaled_height)
						.attr({ 
							x: 0,
							y: 0,
							fill: 'white', 
							stroke: "black",		
							id: "room1"
						})

			$("rect").click(function(e){	

				if (document.getElementById("draw").contains(document.getElementById("node"))) {
					console.log("has")
					document.getElementById("svg").removeChild(document.getElementById("node"))
				}

				let svgX = document.getElementById("svg").getBoundingClientRect().x,
					svgY = document.getElementById("svg").getBoundingClientRect().y,
					roomX = document.getElementById("room1").instance.x(),
					roomY = document.getElementById("room1").instance.y(),
					roomWidth = document.getElementById("room1").instance.width(),
					roomHeight = document.getElementById("room1").instance.height(),
					mouseX = e.clientX - svgX,
					mouseY = e.clientY - svgY,
					clickMarginError = 15,
					nodeX = e.clientX - svgX,
					nodeY = e.clientY - svgY;

				// Determine if user clicked the [LEFT] wall
				if (mouseX < roomX + clickMarginError && mouseY > roomY && 
		        	mouseX > roomX - clickMarginError && mouseY < roomY + roomHeight 
		        ) 
		        {
		            var node = drawing.image("images/inlo-device.png", 15, 10).attr({x:nodeX-10, y:nodeY-5, id:"node"});
		        	node.rotate(-90)
	          	} // Determine if user clicked the [RIGHT] wall
	          	else if (mouseX < roomX + roomWidth + clickMarginError && mouseY > roomY && 
		            	mouseX > roomX + roomWidth - clickMarginError && mouseY < roomY + roomHeight) 
	          	{
	              	var node = drawing.image("images/inlo-device.png", 15, 10).attr({x:nodeX-10, y:nodeY-5, id:"node"});
	        		node.rotate(90)
	            } else {
	            	drawing.image("images/inlo-device.png", 15, 10).attr({x:nodeX-10, y:nodeY-5, id:"node"});
	            }

	            changesMade = true;
			})
			
		}
		
	}

	decodeURI()
	fetch_room_data()



	/*=======================
	==== EVENT HANDLERS =====
	========================*/

	// click events for back and cancel buttons
	$("#backBtn, #cancelBtn").click(function(){
		if (changesMade == true) {
			var userResponse = confirm("Are you sure you want to cancel changes and go back?")
			if (userResponse == true) {
				window.location.href = "inloNodeFound.html"
			}
		} else {
			window.location.href = "inloNodeFound.html"
		}
	})

	// click events for next button
	$("#nextBtn").click(function(){
		if (changesMade == true) {
			//window.location.href = "inloNodeFound.html"
			alert("Placeholder alert. Will add redirection once page has been created.")
		} else {
			alert("Please add a node to continue")
		}
	})


});
