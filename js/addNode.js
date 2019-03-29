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

class AddNodePage extends React.Component {
	constructor(props) {
		super(props);

	}	

	render() {
		return (

			<div>
				<NavBar/>
				<Prompt/>
				<ExistingRoomButton/>
				<NewRoomButton/>
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

			<div className="navbar">
				<p id="navbar-title">{this.state.title}</p>
			</div>

        );
	}
}

class Prompt extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: 'In which room is new node plugged in?'
		};
	}	

	render() {
		return (

			<div className="prompt-div">
				<p id="prompt-text">{this.state.text}</p>
			</div>

        );
	}
}

/*	constructor(props) {
		super(props);
		this.state = {
			title: ''
		};

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.setState(state => ({
			title: 'Position New Device in Room'
		}));
	}

	render() {
		return (
			<div className="btn">
				<p id="btn-name">{this.state.title}</p>
			</div>

        );
	}
}*/

class ExistingRoomButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: 'Existing Room'
		};

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.setState(state => ({
			title: 'Position New Device in Room'
		}));
	}

	render() {
		return (

			<div className="existing-room-btn buttons" onClick={this.handleClick}>
				<p id="existing-room-btn-text">{this.state.title}</p>
			</div>
        );
	}
}

class NewRoomButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: 'New Room'
		};
	}	

	render() {
		return (
			<div className="new-room-btn buttons">
				<p id="new-room-btn-text">{this.state.title}</p>
			</div>

        );
	}
}


ReactDOM.render(
  <AddNodePage/>,
  document.getElementById("root")
);