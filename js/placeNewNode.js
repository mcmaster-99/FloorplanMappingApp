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

let roomData;

SVG.on(document, 'DOMContentLoaded', function () {

	function render_node() {
		console.log("here")
	}

	let draw = new SVG('draw').size("100%", "100%")
	$("defs").detach()
	let rect = draw.rect(100, 100)
									.attr({ 
										fill: 'none', 
										stroke: "black",
										id: "room1"
									})

	$('#draw').on('click', 'rect#room1', function(){
	  alert("clicked")
	}, false);

	var encoded =  window.location.href,
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

  // if user has made any changes, ask before exiting current page

  $(window).bind('beforeunload', function(){
      if (changesMade === true) return 'Are you sure you want to leave?';
  });


});
