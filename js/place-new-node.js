// place-new-node.js
//
// user places new node

'use strict';

// Redirect user if logged out
//if (getAuth("Authorization").length === 0) window.location.href = "signin.html";

//=============================================================
//						  REACT.JS
//=============================================================

class NavBar extends React.Component {
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

class PlaceNewNode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: "Position Inlo Node",
			prompt: "Select the wall on which the Inlo node has been plagugged in. This can be adjusted later on.",
			backLink: "",
			nextLink: "",
			cancelLink: "Cancel",
			backBtnId: "",
			nextBtnId: "",
			cancelBtnId: "cancelBtn",
			dataLoaded: false,
			rooms: [],
			decodedRoomID: '',
			roomData: [],
			placeNewNodeRoom: ""
		}
		this.PlaceNewNode = this.PlaceNewNode.bind(this);
	}

	PlaceNewNode(e) {
			e.persist() // retain event object
			console.log(e)
			/*var placeNodeSVG = new SVG('roomSVG').size("100%", "100%").panZoom({
						    zoomMin: 0.5,
						    zoomMax: 2,
						    zoomFactor: 0.1
						  })
			let node = placeNodeSVG.image("images/inlo-device.png", 15, 10);
					node.attr({
			      x: e.clientX,
			      y: e.clientY,
			      fill: "white",
			      stroke: "#E3E3E3",
			      id: "testID"
					})*/
		
	}

	componentDidMount() {

		var encoded =  window.location.href;
		const _this = this;

		try {
			// decoding URL to get params
			let str = decodeURIComponent(encoded),
				roomID = str.substr(str.indexOf("=")+1);

			_this.setState({
				decodedRoomID: roomID
			})

			console.log(_this.state.decodedRoomID)
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
						if (result[i].rooms[j].roomID == _this.state.decodedRoomID)
						
						_this.setState({
							roomData: result[i].rooms[j]
						})
					}
				}
			}
			_this.setState({
				dataLoaded: true
			})
			
		}
	}

	render() {
		return (

			<div>
				<h1 id="title">{this.state.title}</h1>

				<h3 id="prompt">{this.state.prompt}</h3>

					
					{$('#jumbotron').click(function(e){
						console.log(e)
					})}
				  {/*<svg id="roomSVG" onClick={this.PlaceNewNode} width={this.state.roomData.width} height={this.state.roomData.width}>
						<rect id={this.state.roomData.roomID} width={this.state.roomData.width} height={this.state.roomData.height} fill="none" stroke="black"></rect>
				  </svg>*/}

				{ this.state.dataLoaded == true && (
					console.log(this.state.roomData)
				)}

				<h1 id={this.state.backBtnId} onClick={this.revertToOriginalState}>
					<p><b>{this.state.backLink}</b></p>
				</h1>

				<h1 id={this.state.nextBtnId}><p id="nextTxt">
					<b>{this.state.nextLink}</b></p>
				</h1>

				<h1 id={this.state.cancelBtnId}>
					<p><b>{this.state.cancelLink}</b></p>
				</h1>
			</div>
		);
	}
}

class Jumbotron extends React.Component {
	constructor(props) {
		super(props);
	}	

	render() {
		return (

			<div id="jumbotron-div">


				<div id="jumbotron">

					<PlaceNewNode/>

				</div>

			</div>


		);
	}
}

ReactDOM.render((
	<Jumbotron/>
),document.getElementById("root"));
