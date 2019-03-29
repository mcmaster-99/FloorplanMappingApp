// accessPointNotExist.js
//
// Users main home page:
// List View and Map view of devices in Floorplan
//

/*var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;
var Link = ReactRouter.Link;*/


'use strict';

// Redirect user if logged out
if (getAuth("Authorization").length === 0) window.location.href = "signin.html";


//=============================================================
//						  REACT.JS
//=============================================================

function accessPointNotExistFAQ() {
	return (
			<div id="how-to-text-div">
		        <h3 id="how-to-title">FAQ</h3>

		        <p id="how-to-text">
		            {this.state.text}
		        </p>

		        <div id="how-to-links-div">
		            <button onClick={this.handleClick}>Go Back Home</button>
		        </div>

		    </div>
	);
}

class AccessPointNotExist extends React.Component {
	constructor(props) {
		super(props);

	}	

	render() {
		return (

			<div>
				<NavBar/>
				<Prompt/>
			</div>

        );
	}
}


class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: 'Describe Room'
		};
	}	

	render() {
		return (


			<div id="navbar-div">
		      <nav>
		        <a href="#"><img src="images/theinlo.png" id="inlo-banner"></img></a>

		        <div id="right-nav-icons-div">
		            <div id="add-devices-dropdown-div">

		                <button id="dropdown-btn">
		                    <img src="images/username.png" id="onboard-device" className="right-nav-icons"></img>
		                </button>
		                <div id="dropdown-menu">
		                    <li><a id="addID" href="#addID">Add Inlo Device</a></li>
		                    <li><a id="addTPD" href="#addTPD">Add Third Party Device</a></li>
		                </div>
		                
		            </div>

		            <a href="#"><img src="images/email.png" className="right-nav-icons"></img></a>
		            <a href="#"><img src="images/home.png" className="right-nav-icons"></img></a>
		        </div>

		      </nav>
		    </div>


        );
	}
}

class AddAccessPointFAQPrompt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: 'Inlo uses the technology in your smart phone to connect to the Inlo hub. You must use your Inlo Mobile App to add your hub.'

	            +'Once you have added your hub, you may add additional inlo nodes and third party devices to your account.'

	            +'You can identify which Inlo node is your hub by checking for a label on the back of your nodes.'
		};
	}	

	handleClick() {
		window.location.href = "dashboard.html";
	}

	render() {
		return (

			<div id="how-to-text-div">
		        <h3 id="how-to-title">FAQ</h3>

		        <p id="how-to-text">
		            {this.state.text}
		        </p>

		        <div id="how-to-links-div">
		            <button onClick={this.handleClick}>Go Back Home</button>
		        </div>

		    </div>


        );
	}
}

class Prompt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		}
	}	

	handleClick() {
		window.location.href = "addAccessPoint.html";
	}

	render() {
		return (

			<div>
		        <img src="" id="how-to-img"></img>

		        <div id="how-to-text-div">
		            <h3 id="how-to-title">Add Inlo Hub</h3>

		            <p id="how-to-text">
		                You haven’t added an Inlo hub! Add one using the Inlo mobile app by following these steps :
		                1. Download the Inlo mobile app on the App Store or Goolge Play.
		                2. Open the Inlo mobile app and log in.
		                3. Click Add Inlo Hub.
		                4. Follow the prompts.

		            </p>

		            <div id="how-to-links-div">
		                <button>Go Back Home</button>
		                <button onClick={this.handleClick}>Need help or have questions?</button>
		            </div>

		        </div>

		    </div>


        );
	}
}



ReactDOM.render((
	//<Router>
		<AccessPointNotExist/>
	//</Router>
),document.getElementById("root"));