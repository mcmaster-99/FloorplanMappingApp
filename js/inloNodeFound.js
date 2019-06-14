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
} = window['MaterialUI'];


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
			showMenu: false,
			rooms: []
		}
		this.redirectToPlaceNewNode = this.redirectToPlaceNewNode.bind(this);
		this.linkToNewRmPage = this.linkToNewRmPage.bind(this);
	}

	redirectToPlaceNewNode() {
		let roomID = document.getElementById("native-select-div").value;

		var objStr = encodeURIComponent(roomID);
		console.log(objStr)
		window.location.href = 'placeNewNode.html?' + "roomID=" + objStr; 
	}

	linkToNewRmPage() {
		window.location.href = 'addNewRoom.html'; 
	}

	componentDidMount() {
		const that = this;
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
                	console.log(result[i].rooms)
                	that.setState({
                		rooms: result[i].rooms
                	})
                    // iterate over rooms
                    /*for (let j = 0; j < result[i].rooms.length; j++) {
                    	
                    	this.state.rooms.push(result[i].rooms[j].roomName)
                    }*/
                }
            }
            that.setState({
            	showMenu: true
            })
	    }
	}

	render() {
		return (

			<div>
				<h1 id="title">{this.state.title}</h1>

				<h3 id="prompt">{this.state.prompt}</h3>

				{ this.state.showMenu && (
					<SelectRoomMenu rooms={this.state.rooms} redirectToPlaceNewNode={this.redirectToPlaceNewNode}/>
				)}

				<p id={this.state.addNewRoomBtnId}>{this.state.or}<a style={{cursor: 'pointer'}} onClick={this.linkToNewRmPage}><b>{this.state.addLink}</b></a></p>

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
    height: '20px',
    width: '200px',
    padding: '10px 26px 10px 12px',
  },
}))(InputBase);


class SelectRoomMenu extends React.Component {
	state = {
		anchorEl: null,
		room: "Select Room"
	};

	redirectToPlaceNewNode = () => {
		this.props.redirectToPlaceNewNode();
		this.setState({ room: event.target.value });
	};

	render() {
    	const classes = this.props;
    	let value
	    return (
	      <form autoComplete="off">
	        <FormControl id="native-menu-select">
	          <NativeSelect
	            value={this.state.room}
	            label="Select Room"
	            onChange={this.props.redirectToPlaceNewNode}
	            input={<BootstrapInput name="room" id="room-customized-select" />}
	            id="native-select-div"
	          >
	          <option defaultValue='' disabled>Select Room</option>
	          	{
	          		classes.rooms.map((item,i) => 
			        	<option value={item.roomID} key={item.roomID}>{item.roomName}</option>
		          	)
	          	}
	     
	          </NativeSelect>
	        </FormControl>
	      </form>
	    );
  }
}



ReactDOM.render((
	<Jumbotron/>
),document.getElementById("root"));
