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

	const bind_click = function() {
		$("rect").click(function(e){	
			let svgX = document.getElementById("svg").getBoundingClientRect().x
			let svgY = document.getElementById("svg").getBoundingClientRect().y
			let roomX = document.getElementById("room1").instance.x()
			let roomY = document.getElementById("room1").instance.y()

			let nodeX = e.clientX - svgX;
			let nodeY = e.clientY - svgY;

			drawing.image("images/inlo-device.png", 15, 10).attr({x:nodeX, y:nodeY});
		})
	}

	const render_room = function() {
		room = drawing.rect(100, 100)
						.attr({ 
							x: 0,
							y: 0,
							fill: 'white', 
							stroke: "black",		
							id: "room1"
						})
	}
	
	/*const setScale = function(room_w, room_h) {
		let jumbo_x = X,
			jumbo_y = Y,
			scale;
		if (w > h) { 
			scale = room_w/jumbo_x
		} else {
			scale = room_h/jumbo_y
		}
	}

	Render room
	width = room_w*scale
	height = room_h*scale

	const saveNodeCoordinates = function(x, y, roomData) {
		// convert to floorplan coordinate
		node_x = room_x + x*scale
		node_y = room_y + y*scale
		
		// API call to add node to room
	}*/


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
			$("rect").click(function(e){	
				let svgX = document.getElementById("svg").getBoundingClientRect().x
				let svgY = document.getElementById("svg").getBoundingClientRect().y
				let roomX = document.getElementById("room1").instance.x()
				let roomY = document.getElementById("room1").instance.y()

				let nodeX = e.clientX - svgX;
				let nodeY = e.clientY - svgY;

				drawing.image("images/inlo-device.png", 15, 10).attr({x:nodeX, y:nodeY});
			})
			room = drawing.rect(roomData.width, roomData.height)
						.attr({ 
							x: 0,
							y: 0,
							fill: 'white', 
							stroke: "black",		
							id: "room1"
						})
		}
		
	}

	decodeURI()
	fetch_room_data()


	//fetch_room_data(render_room, bind_click);

  // if user has made any changes, ask before exiting current page

  $(window).bind('beforeunload', function(){
      if (changesMade === true) return 'Are you sure you want to leave?';
  });


});
