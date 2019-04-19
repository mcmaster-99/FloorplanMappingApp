// accessPointNotExist.js
//
// Users main home page:
// List View and Map view of devices in Floorplan
//

//import {Button} from '@material-ui/core/';

const {
	anchorEl,
  Button,
  colors,
  createMuiTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  MuiThemeProvider,
  Menu,
  MenuItem,
  Typography,
  withStyles,
} = window['material-ui'];

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

class InloNodeFound extends React.Component {
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

					<SelectRoomMenu/>

					<p id="option1">or <a href=""><b>Create a New Room</b></a></p>
					
					<p id="option2"><a href=""><b>Cancel</b></a></p>

				</div>

		    </div>


        );
	}
}


class SelectRoomMenu extends React.Component {
	state = {
		anchorEl: null,
	};

	handleClick = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleClose = () => {
		this.setState({ anchorEl: null });
	};

	render() {
    	const { anchorEl } = this.state;

	return (
		<div>
		<Button
			id="menu-button"
		  	aria-owns={anchorEl ? 'simple-menu' : undefined}
		  	aria-haspopup="true"
		  	onClick={this.handleClick}
		>
          <p id="select-room-txt">Select Room</p>
          <p><img id="dropdown-img" src="https://image.flaticon.com/icons/svg/60/60995.svg"></img></p>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}>Bedroom</MenuItem>
          <MenuItem onClick={this.handleClose}>Kitchen</MenuItem>
          <MenuItem onClick={this.handleClose}>Bathroom</MenuItem>
        </Menu>
      </div>
    );
  }
}



ReactDOM.render((
	<InloNodeFound/>
),document.getElementById("root"));