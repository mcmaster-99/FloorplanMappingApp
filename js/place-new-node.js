// place-new-node.js
//
// user places new node

'use strict';

// Redirect user if logged out
if (getAuth("Authorization").length === 0) window.location.href = "signin.html";

//=============================================================
//						  REACT.JS
//=============================================================

var encoded =  window.location.href;

try {
  console.log(decodeURIComponent(encoded));
} catch(e) { // catches a malformed URI
  console.error(e);
}

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
			cancelLink: "Cancel",
			or: "or ",
			addNewRoomBtnId: "addNewRoomBtn",
			backBtnId: "",
			nextBtnId: "",
			cancelBtnId: "cancelBtn",
			showRoom: false,
			showMenu: false,
			rooms: []
		}
	}
	render() {
		return (

			<div>
				<h1 id="title">{this.state.title}</h1>

				<h3 id="prompt">{this.state.prompt}</h3>

				<div id="roomSVGDiv">
				  <svg width="200" height="200">
				    <rect id="room" width="200" height="200" fill="none" stroke="black"></rect>
				  </svg>
				</div>

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