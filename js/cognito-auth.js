"use strict";

var Inlo = window.Inlo || {}; // Notification section

var notifs = document.getElementById("notifs");

function setAuth(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getAuth(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return "";
}

(function scopeWrapper($) {
  /*
   * User Pool functions
   */
  function register(name, email, password, onSuccess, onFailure) {
    var settings = {
      "url": String(_config.api.inloApiUrl) + "/user/add",
      "crossDomain": true,
      "method": "POST",
      "headers": {
        'Accept': 'application/json'
      },
      "contentType": "application/json",
      "data": JSON.stringify({
        "name": name,
        "email": email,
        "password": password
      }),
      "success": onSuccess,
      "error": onFailure
    };
    $.ajax(settings).done(function (response) {
      console.log(response);
      console.log(settings);
    });
    /*
    ** create floorplan here
    */
  }

  function signin(email, password, onSuccess, onFailure) {
    var settings = {
      "url": String(_config.api.inloApiUrl) + "/v1/user/login",
      "crossDomain": true,
      "method": "POST",
      "headers": {
        'Accept': 'application/json'
      },
      "contentType": "application/json",
      "data": JSON.stringify({
        "email": email,
        "password": password
      }),
      "success": onSuccess,
      "error": onFailure
    };
    $.ajax(settings).done(function (response) {
      console.log(response);
    });
  }
  /*
   *  Event Handlers
   */


  $(function onDocReady() {
    $('#signinForm').submit(handleSignin);
    $('#registrationForm').submit(handleRegister);
  });

  function handleSignin(event) {
    var email = 'goyal.yash1990+test@gmail.com';
    var password = 'yash123';
    event.preventDefault();
    signin(email, password, function signinSuccess(result) {
      console.log('Successfully Logged In'); // console.log("result", result);

      setAuth("Authorization", result.token, 1); // console.log(getAuth("Authorization"));

      setAuth("userID", result.userID, 1); // console.log(getAuth("userID"));

      window.location.href = 'dashboard.html';
    }, function signinError(err) {
      notifs.innerHTML = "Your email or password is incorrect. Try again.";
    });
  }

  function handleRegister(event) {
    var name = $('#nameInputRegister').val();
    var email = $('#emailInputRegister').val();
    var password = $('#passwordInputRegister').val();
    var password2 = $('#password2InputRegister').val();

    var onSuccess = function registerSuccess(result) {
      console.log(result);
      console.log('user registered');
      var confirmation = 'Registration successful. Please check your email inbox or spam folder for your verification code.';

      if (confirmation) {
        window.location.href = 'verify.html';
      }
    };

    var onFailure = function registerFailure(err) {
      console.log(err.status);

      if (err.status === 409) {
        notifs.innerHTML = "Oops, that email is already registered.";
      } else if (err.status === 500) {
        notifs.innerHTML = "Sorry, there was an internal error.";
      }
    };

    event.preventDefault();

    if (password === password2) {
      register(name, email, password, onSuccess, onFailure);
    } else {
      notifs.innerHTML = "Passwords do not match.";
    }
  }
})(jQuery);