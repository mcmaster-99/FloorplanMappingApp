var Inlo = window.Inlo || {};

// Notification section
var notifs = document.getElementById("notifs");

(function scopeWrapper($) {

    /*var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    WildRydes.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    WildRydes.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });*/


    /*
     * User Pool functions
     */

    function register(name, email, password, onSuccess, onFailure) {
        var settings = {
          "url": _config.api.inloApiUrl + "/user/add",
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
        }

        $.ajax(settings).done(function (response) {
          console.log(response);
          console.log(settings);
        });
    }

    function signin(email, password, onSuccess, onFailure) {

        var settings = {
          "url": _config.api.inloApiUrl + "/user/login",
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
        }
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

        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess(result) {
                console.log('Successfully Logged In');
                console.log("result", result);
                Inlo.authToken = result.token;
                window.location.href = 'dashboard.html';
            },
            function signinError(err) {
                notifs.innerHTML = "Your email or password is incorrect. Try again.";
            }
        );
    }

    function handleRegister(event) {
        var name = $('#nameInputRegister').val();
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            console.log(result);
            console.log('user registered');
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
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

}(jQuery));
