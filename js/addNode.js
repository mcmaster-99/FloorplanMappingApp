"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

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

'use strict'; // Redirect user if logged out


if (getAuth("Authorization").length === 0) window.location.href = "signin.html"; //=============================================================
//              REACT.JS
//=============================================================

var AddNodePage =
/*#__PURE__*/
function (_React$Component) {
  _inherits(AddNodePage, _React$Component);

  function AddNodePage(props) {
    _classCallCheck(this, AddNodePage);

    return _possibleConstructorReturn(this, _getPrototypeOf(AddNodePage).call(this, props));
  }

  _createClass(AddNodePage, [{
    key: "render",
    value: function render() {
      return _react["default"].createElement("div", null, _react["default"].createElement(NavBar, null), _react["default"].createElement(Prompt, null), _react["default"].createElement(ExistingRoomButton, null), _react["default"].createElement(NewRoomButton, null));
    }
  }]);

  return AddNodePage;
}(_react["default"].Component);

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
      return _react["default"].createElement("div", {
        className: "navbar"
      }, _react["default"].createElement("p", {
        id: "navbar-title"
      }, this.state.title));
    }
  }]);

  return NavBar;
}(_react["default"].Component);

var Prompt =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(Prompt, _React$Component3);

  function Prompt(props) {
    var _this2;

    _classCallCheck(this, Prompt);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Prompt).call(this, props));
    _this2.state = {
      text: 'In which room is new node plugged in?'
    };
    return _this2;
  }

  _createClass(Prompt, [{
    key: "render",
    value: function render() {
      return _react["default"].createElement("div", {
        className: "prompt-div"
      }, _react["default"].createElement("p", {
        id: "prompt-text"
      }, this.state.text));
    }
  }]);

  return Prompt;
}(_react["default"].Component);
/*  constructor(props) {
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


var ExistingRoomButton =
/*#__PURE__*/
function (_React$Component4) {
  _inherits(ExistingRoomButton, _React$Component4);

  function ExistingRoomButton(props) {
    var _this3;

    _classCallCheck(this, ExistingRoomButton);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(ExistingRoomButton).call(this, props));
    _this3.state = {
      title: 'Existing Room'
    };
    _this3.handleClick = _this3.handleClick.bind(_assertThisInitialized(_this3));
    return _this3;
  }

  _createClass(ExistingRoomButton, [{
    key: "handleClick",
    value: function handleClick() {
      this.setState(function (state) {
        return {
          title: 'Position New Device in Room'
        };
      });
    }
  }, {
    key: "render",
    value: function render() {
      return _react["default"].createElement("div", {
        className: "existing-room-btn buttons",
        onClick: this.handleClick
      }, _react["default"].createElement("p", {
        id: "existing-room-btn-text"
      }, this.state.title));
    }
  }]);

  return ExistingRoomButton;
}(_react["default"].Component);

var NewRoomButton =
/*#__PURE__*/
function (_React$Component5) {
  _inherits(NewRoomButton, _React$Component5);

  function NewRoomButton(props) {
    var _this4;

    _classCallCheck(this, NewRoomButton);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(NewRoomButton).call(this, props));
    _this4.state = {
      title: 'New Room'
    };
    return _this4;
  }

  _createClass(NewRoomButton, [{
    key: "render",
    value: function render() {
      return _react["default"].createElement("div", {
        className: "new-room-btn buttons"
      }, _react["default"].createElement("p", {
        id: "new-room-btn-text"
      }, this.state.title));
    }
  }]);

  return NewRoomButton;
}(_react["default"].Component);

_reactDom["default"].render(_react["default"].createElement(AddNodePage, null), document.getElementById("root"));
