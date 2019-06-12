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

			console.log(roomID)
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
						console.log(result[i].rooms[j].roomID)
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
				console.log(room_w, room_h, jumbo_w, jumbo_h)
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
			console.log(room_w, room_h, scaled_width, scaled_height)
			room = drawing.rect(scaled_width, scaled_height)
						.attr({ 
							x: 0,
							y: 0,
							fill: 'white', 
							stroke: "black",		
							id: "room1"
						})

			$("rect").click(function(e){	

				//document.getElementById("room1").remove()
				console.log($(e.target))
				if(document.getElementById("draw").contains(document.getElementById("node"))) {
					console.log("has")
					document.getElementById("svg").removeChild(document.getElementById("node"))
				}

				let svgX = document.getElementById("svg").getBoundingClientRect().x
				let svgY = document.getElementById("svg").getBoundingClientRect().y
				let roomX = document.getElementById("room1").instance.x()
				let roomY = document.getElementById("room1").instance.y()
				let roomWidth = document.getElementById("room1").instance.width()
				let roomHeight = document.getElementById("room1").instance.height()
				let mouseX = e.clientX - svgX
				let mouseY = e.clientY - svgY
				let clickMarginError = 15
				let nodeX = e.clientX - svgX
				let nodeY = e.clientY - svgY

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


	//fetch_room_data(render_room, bind_click);


	// click events for back and cancel buttons
	$("#backBtn, #cancelBtn").click(function(){
		if (changesMade == true) {
			console.log("here")
			var userResponse = confirm("Are you sure you want to cancel changes and go back?")

			if (userResponse == true) {
				window.location.href = "inloNodeFound.html"
			}
		} else {
			window.location.href = "inloNodeFound.html"
		}
		
	})


});
