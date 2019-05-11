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
	FormControl,
	Icon,
	InputBase,
	MuiThemeProvider,
	Menu,
	MenuItem,
	NativeSelect,
	Select,
	Typography,
	withStyles,
} = window['material-ui'];
console.log(window['material-ui'])


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


class InloNodeFound extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: "Inlo Node Found!",
			prompt: "Tell us where your Inlo node is.",
			addLink: "Add a New Room",
			backLink: "",
			nextLink: "",
			cancelLink: "Cancel",
			or: "or ",
			addNewRoomBtnId: "addNewRoomBtn",
			backBtnId: "",
			nextBtnId: "",
			cancelBtnId: "cancelBtn",
			showRoom: false,
			showMenu: true
		}
		this.updateStateNewRm = this.updateStateNewRm.bind(this);
		this.updateStateExistingRm = this.updateStateExistingRm.bind(this);
		this.revertToOriginalState = this.revertToOriginalState.bind(this);
	}


	revertToOriginalState(){
		this.setState({
			title: "Inlo Node Found!",
			prompt: "Tell us where your Inlo node is.",
			addLink: "Add a New Room",
			backLink: "",
			nextLink: "",
			cancelLink: "Cancel",
			or: "or ",
			addNewRoomBtnId: "addNewRoomBtn",
			backBtnId: "",
			nextBtnId: "",
			cancelBtnId: "cancelBtn",
			showRoom: false,
			showMenu: true
		})
		$("#cancelBtn").css("margin-top", "200px");
	}

	updateStateNewRm(){
		this.setState({
			title: "Add a New Room", 
			prompt: "What do you want to name your new room?",
			addLink: "",
			backLink: "Back",
			nextLink: "Next",
			cancelLink: "Cancel",
			or: "",
			addNewRoomBtnId: "addNewRoomBtn",
			backBtnId: "backBtn",
			nextBtnId: "nextBtn",
			cancelBtnId: "cancelBtn"
		})
	}
	updateStateExistingRm(){
		this.setState({
			title: "Position Inlo Node", 
			prompt: "Select the wall on which the Inlo node has been plugged in. This can be adjusted later on.",
			addLink: "",
			backLink: "Back",
			nextLink: "Next",
			cancelLink: "Cancel",
			or: "",
			addNewRoomBtnId: "addNewRoomBtn",
			backBtnId: "backBtn",
			nextBtnId: "nextBtn",
			cancelBtnId: "cancelBtn",
			showRoom: true,
			showMenu: false
		})
		$("#cancelBtn").css("margin-top", "25px");
	}

	render() {
		return (

			<div>
				<h1 id="title">{this.state.title}</h1>

				<h3 id="prompt">{this.state.prompt}</h3>

				{
					this.state.showMenu == true &&
						<SelectRoomMenu updateStateExistingRm={this.updateStateExistingRm.bind(this)}/>
				}

				<p id={this.state.addNewRoomBtnId}>{this.state.or}<a style={{cursor: 'pointer'}} onClick={this.updateStateNewRm}><b>{this.state.addLink}</b></a></p>
				
				{
					this.state.showRoom == true &&
						<div id="roomSVGDiv">
						  <svg width="200" height="200">
						    <rect id="room" width="200" height="200" fill="none" stroke="black"></rect>
						  </svg>
						</div>
				}

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

					<InloNodeFound/>

				</div>

		    </div>


        );
	}
}


const BootstrapInput = withStyles(theme => ({
  input: {
  	textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    height: '15px',
    width: '200px',
    padding: '10px 26px 10px 12px',
  },
}))(InputBase);


class SelectRoomMenu extends React.Component {
	state = {
		anchorEl: null,
		room: "Select Room"
	};

	updateStateNewRm = () => {
		this.props.updateStateNewRm();
	};
	updateStateExistingRm = () => {
		this.props.updateStateExistingRm();
		this.setState({ room: event.target.value });
	};

	render() {
    	const { classes } = this.props;

	    return (
	      <form autoComplete="off">
	        <FormControl id="native-menu-select">
	          <NativeSelect
	            value={this.state.room}
	            onChange={this.updateStateExistingRm}
	            input={<BootstrapInput name="room" id="room-customized-select" />}
	            id="native-select-div"
	          >
	            <option class="option" value="SELECT ROOM">{this.state.room}</option>
	            <option class="option" value={"Bedroom"} onClick={this.updateStateExistingRm}>Bedroom</option>
	            <option class="option" value={"Living Room"} onClick={this.updateStateExistingRm}>Living Room</option>
	            <option class="option" value={"Kitchen"} onClick={this.updateStateExistingRm}>Kitchen</option>
	          </NativeSelect>
	        </FormControl>
	      </form>
	    );
  }
}



ReactDOM.render((
	<Jumbotron/>
),document.getElementById("root"));