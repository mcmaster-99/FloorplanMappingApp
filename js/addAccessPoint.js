// dashboard.js
//
// Users main home page:
// List View and Map view of devices in Floorplan
//
'use strict'; // Redirect user if logged out

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

if (getAuth("Authorization").length === 0) window.location.href = "signin.html"; //=============================================================
//						  REACT.JS
//=============================================================

var AccessPointExistPage =
/*#__PURE__*/
function (_React$Component) {
  _inherits(AccessPointExistPage, _React$Component);

  function AccessPointExistPage(props) {
    _classCallCheck(this, AccessPointExistPage);

    return _possibleConstructorReturn(this, _getPrototypeOf(AccessPointExistPage).call(this, props));
  }

  _createClass(AccessPointExistPage, [{
    key: "render",
    value: function render() {
      return React.createElement("div", null, React.createElement(NavBar, null), React.createElement(AddAccessPointFAQPrompt, null));
    }
  }]);

  return AccessPointExistPage;
}(React.Component);

var NavBar =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(NavBar, _React$Component2);

  function NavBar(props) {
    var _this;

    _classCallCheck(this, NavBar);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NavBar).call(this, props));
    _this.state = {
      title: 'Describe Room'
    };
    return _this;
  }

  _createClass(NavBar, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "navbar-div"
      }, React.createElement("nav", null, React.createElement("a", {
        href: "#"
      }, React.createElement("img", {
        src: "images/theinlo.png",
        id: "inlo-banner"
      })), React.createElement("div", {
        id: "right-nav-icons-div"
      }, React.createElement("div", {
        id: "add-devices-dropdown-div"
      }, React.createElement("button", {
        id: "dropdown-btn"
      }, React.createElement("img", {
        src: "images/username.png",
        id: "onboard-device",
        className: "right-nav-icons"
      })), React.createElement("div", {
        id: "dropdown-menu"
      }, React.createElement("li", null, React.createElement("a", {
        id: "addID",
        href: "#addID"
      }, "Add Inlo Device")), React.createElement("li", null, React.createElement("a", {
        id: "addTPD",
        href: "#addTPD"
      }, "Add Third Party Device")))), React.createElement("a", {
        href: "#"
      }, React.createElement("img", {
        src: "images/email.png",
        className: "right-nav-icons"
      })), React.createElement("a", {
        href: "#"
      }, React.createElement("img", {
        src: "images/home.png",
        className: "right-nav-icons"
      })))));
    }
  }]);

  return NavBar;
}(React.Component);

var AddAccessPointFAQPrompt =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(AddAccessPointFAQPrompt, _React$Component3);

  function AddAccessPointFAQPrompt(props) {
    var _this2;

    _classCallCheck(this, AddAccessPointFAQPrompt);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(AddAccessPointFAQPrompt).call(this, props));
    _this2.state = {
      text: 'Inlo uses the technology in your smart phone to connect to the Inlo hub. You must use your Inlo Mobile App to add your hub.' + 'Once you have added your hub, you may add additional inlo nodes and third party devices to your account.' + 'You can identify which Inlo node is your hub by checking for a label on the back of your nodes.'
    };
    return _this2;
  }

  _createClass(AddAccessPointFAQPrompt, [{
    key: "handleClick",
    value: function handleClick() {
      window.location.href = "dashboard.html";
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "how-to-text-div"
      }, React.createElement("h3", {
        id: "how-to-title"
      }, "FAQ"), React.createElement("p", {
        id: "how-to-text"
      }, this.state.text), React.createElement("div", {
        id: "how-to-links-div"
      }, React.createElement("button", {
        onClick: this.handleClick
      }, "Go Back Home")));
    }
  }]);

  return AddAccessPointFAQPrompt;
}(React.Component);

ReactDOM.render(React.createElement(AccessPointExistPage, null), document.getElementById("root"));