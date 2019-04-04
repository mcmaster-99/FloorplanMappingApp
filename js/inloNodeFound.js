// accessPointNotExist.js
//
// Users main home page:
// List View and Map view of devices in Floorplan
//

var Router = window.ReactRouterDOM.BrowserRouter;
var Route = window.ReactRouterDOM.Route;
var IndexRoute = window.ReactRouterDOM.IndexRoute;
var Link = window.ReactRouterDOM.Link;
var browserHistory = window.ReactRouterDOM.browserHistory;


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
				<Jumbotron/>
			</div>

        );
	}
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

class Jumbotron extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: "Inlo Node Found!",
			prompt: "Tell us where your Inlo node is."
		}
	}	

	render() {
		return (

			<div id="jumbotron-div">

				<div id="jumbotron">
		        
					<h1 id="title">{this.state.title}</h1>

					<h3 id="prompt">{this.state.prompt}</h3>

					<div>
						<DropDown/>
					</div>

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
		                <Link to="/AddAccessPointFAQPrompt/">Need help or have questions?</Link>
		            </div>

		        </div>

		    </div>


        );
	}
}

class DropDown extends React.Component {
	constructor() {
		super();

		this.state = {
			showMenu: false,
		};

		this.showMenu = this.showMenu.bind(this);
		this.closeMenu = this.closeMenu.bind(this);
	}
  
	showMenu(event) {
		event.preventDefault();

		this.setState({ showMenu: true }, () => {
			document.addEventListener('click', this.closeMenu);
		});
	}
  
	closeMenu(event) {

		if (!this.dropdownMenu.contains(event.target)) {
		  
			this.setState({ showMenu: false }, () => {
				document.removeEventListener('click', this.closeMenu);
			});  
		  
		}
	}

	render() {
		return (
			<div>
			    <button onClick={this.showMenu}>
			    	Select Room
			    	<img src="https://www.materialui.co/materialIcons/navigation/arrow_drop_down_black_192x192.png" id="dropdown-img"></img>
			    </button>
			    
			    {
			      this.state.showMenu
			        ? (
			          <div
			            className="menu"
			            ref={(element) => {
			              this.dropdownMenu = element;
			            }}
			          >
			            <button> Room 1</button>
			            <button> Room 2</button>
			          </div>
			        )
			        : (
			          null
			        )
			    }
			</div>
		);
	}
}



ReactDOM.render((
	<Router>
		<Route path="/" component={AccessPointNotExist}/>
	</Router>
),document.getElementById("root"));