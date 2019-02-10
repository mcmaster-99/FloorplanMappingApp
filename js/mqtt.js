console.log(getAuth("Authorization"));
function connectSocket() {
	// if user is running mozilla then use it's built-in WebSocket
	window.WebSocket = window.WebSocket || window.MozWebSocket;

	var connection = new WebSocket('wss://api.theinlo.com/events');

	console.log(getAuth("Authorization"));
	//var body = {type:"subscribe",payload:{userID:access.userID}};

	connection.onopen = function () {

		//connection.send(getAuth("Authorization"));
		// connection is opened and ready to use
		console.log("open");
		console.log("userID", window.userID);
		connection.send('{"type":"subscribe","payload":{"userID": ${window.userID}}}');
		//connection.on("message", function incoming(data){
		//	console.log("received " + data);
		//})
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
		console.log(json);
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
		connection = new WebSocket('wss://api.theinlo.com/events');
	}
  
}

connectSocket();
