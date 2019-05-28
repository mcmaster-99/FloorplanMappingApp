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

	let draw = new SVG('draw').size("100%", "100%").attr({id: "svg"}),
			encoded =  window.location.href,
			room,
			roomID,
			roomData;

	try {
		// decoding URL to get params
		let str = decodeURIComponent(encoded),
			roomID = str.substr(str.indexOf("=")+1);

		console.log(roomID)
	} catch(e) { // catches a malformed URI
	  console.error(e);
	}

	const bind_click = function() {
		
		$("rect").click(function(e){	
			console.log(e)
			draw.image("images/inlo-device.png", 15, 10).attr({x:e.offsetX, y:e.offsetY});
		})
	}

	const render_room = function() {
		room = draw.rect(100, 100)
								.attr({ 
									x: 50,
									y: 50,
									fill: 'white', 
									stroke: "black",		
									id: "room1"
								})
		
		console.log($("#draw"))
	}

	render_room()
	bind_click()
	


	const fetch_room_data = function(render_room, bind_click) {
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
						if (result[i].rooms[j].roomID == roomID)
							roomData = result[i].rooms[j];
					}
				}
			}
		}
	}

	//fetch_room_data(render_room, bind_click);

  // if user has made any changes, ask before exiting current page

  $(window).bind('beforeunload', function(){
      if (changesMade === true) return 'Are you sure you want to leave?';
  });


});
