// dashboard.js
//
// Users main home page:
// List View and Map view of devices in Floorplan
//

'use strict';

// Redirect user if logged out
if (getAuth("Authorization").length === 0) window.location.href = "signin.html";


//=============================================================
//						  REACT.JS
//=============================================================

class AccessPointExistPage extends React.Component {
	constructor(props) {
		super(props);

	}	

	render() {
		return (

			<div>
				<NavBar/>
				<AddAccessPointFAQPrompt/>
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



ReactDOM.render(
  <AccessPointExistPage/>,
  document.getElementById("root")
);