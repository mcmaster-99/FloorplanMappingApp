
function connectSocket() {
	// if user is running mozilla then use it's built-in WebSocket
	window.WebSocket = window.WebSocket || window.MozWebSocket;

	var connection = new WebSocket('ws://api.theinlo.com/api/events');

	connection.onopen = function () {
		// connection is opened and ready to use
		console.log("open");
	};

	connection.onerror = function (error) {
		// an error occurred when sending/receiving data
		console.log(error);
	};

	connection.onmessage = function (message) {
		// try to decode json (I assume that each message
		// from server is json)
		try {
		  var json = JSON.parse(message.data);
		} catch (e) {
		  console.log('This doesn\'t look like a valid JSON: ',
		      message.data);
		  return;
		}
		// handle incoming message
	};

	connection.onclose = function (error) {
		// socket server closed
		console.log("closed");
		setTimeout(connectSocket, 5000);
	};

	function reOpen() {
		connection = new WebSocket('ws://api.theinlo.com/api/events');
	}
  
}

connectSocket();