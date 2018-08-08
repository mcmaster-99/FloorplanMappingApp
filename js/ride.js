/*global WildRydes _config AmazonCognitoIdentity AWSCognito AWS*/

var WildRydes = window.WildRydes || {};


(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/webapp.theinlo/signin.html';
    });


    function requestUnicorn(UUID) {
        $.ajax({
            method: 'POST',
            url:  'https://lq78cge1t4.execute-api.us-west-2.amazonaws.com/prod/attach_iot_policy',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                "room_ID": "TEST",
                "floor": "TEST"
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting devices: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting devices:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        console.log('Response received from API: ', result);
        devices = JSON.stringify(result.Items);
        displayUpdate(devices);
    }

    // Register click handler for #request button
    $(function onDocReady() {

        $('#request').click(handleRequestClick);
        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handleRequestClick(event) {
        event.preventDefault();

        // Attempt to get cognito credentials
    var poolData = {
        UserPoolId : _config.cognito.userPoolId,
        ClientId : _config.cognito.userPoolClientId
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {

        cognitoUser.getSession(function(err, result) {
            if (result) {
                // Check Session Validity
                console.log('session validity: ' + result.isValid());

                // Get User Attributes
                cognitoUser.getUserAttributes(function(err, attributes) { 
                    if (err) { 
                        console.log("did not get user attributes");
                    } else { 
                        console.log("attributes: " + attributes); 
                    } 
                });

                
                AWS.config.region = _config.cognito.region;

                var providerKey = 'cognito-idp.' + _config.cognito.region + '.amazonaws.com/' + _config.cognito.userPoolId;

                console.log("providerKey is: ", providerKey);

                // Initialize cognitoidentity
                var cognitoidentity = new AWS.CognitoIdentity();

                // Get IdentityId 
                var params = {
                    IdentityPoolId: _config.cognito.identityPoolId, /* required */
                    Logins : { 'cognito-idp.us-west-2.amazonaws.com/us-west-2_EmZYHJNib':result.getIdToken().getJwtToken() }

                };
                cognitoidentity.getId(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        // Get user credentials
                        var params = {
                            IdentityId: data.IdentityId, /* required */
                            Logins : { 'cognito-idp.us-west-2.amazonaws.com/us-west-2_EmZYHJNib':result.getIdToken().getJwtToken() }
                        };
                        cognitoidentity.getCredentialsForIdentity(params, function(err, data) {
                            if (err) console.log(err, err.stack, "params", params); // an error occurred
                            else {

                                /**
                               * utilities to do sigv4
                               * @class SigV4Utils
                               */

                                function SigV4Utils() {}
                                
                                SigV4Utils.getSignatureKey = function (key, date, region, service) {
                                    var kDate = AWS.util.crypto.hmac('AWS4' + key, date, 'buffer');
                                    var kRegion = AWS.util.crypto.hmac(kDate, region, 'buffer');
                                    var kService = AWS.util.crypto.hmac(kRegion, service, 'buffer');
                                    var kCredentials = AWS.util.crypto.hmac(kService, 'aws4_request', 'buffer');    
                                    return kCredentials;
                                };
                                
                                SigV4Utils.getSignedUrl = function(host, region, credentials) {

                                    var datetime = AWS.util.date.iso8601(new Date()).replace(/[:\-]|\.\d{3}/g, '');
                                    var date = datetime.substr(0, 8);
                                
                                    var method = 'GET';
                                    var protocol = 'wss';
                                    var uri = '/mqtt';
                                    var service = 'iotdevicegateway';
                                    var algorithm = 'AWS4-HMAC-SHA256';
                                    
                                    var credentialScope = date + '/' + region + '/' + service + '/' + 'aws4_request';
                                    var canonicalQuerystring = 'X-Amz-Algorithm=' + algorithm;
                                    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(credentials.AccessKeyId + '/' + credentialScope);
                                    canonicalQuerystring += '&X-Amz-Date=' + datetime;
                                    canonicalQuerystring += '&X-Amz-SignedHeaders=host';
                                
                                    var canonicalHeaders = 'host:' + host + '\n';
                                    var payloadHash = AWS.util.crypto.sha256('', 'hex')
                                    var canonicalRequest = method + '\n' + uri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;
                                
                                    var stringToSign = algorithm + '\n' + datetime + '\n' + credentialScope + '\n' + AWS.util.crypto.sha256(canonicalRequest, 'hex');
                                    var signingKey = SigV4Utils.getSignatureKey(credentials.SecretKey, date, region, service);
                                    var signature = AWS.util.crypto.hmac(signingKey, stringToSign, 'hex');
                                    
                                    canonicalQuerystring += '&X-Amz-Signature=' + signature;
                                    if (credentials.SessionToken) {
                                        canonicalQuerystring += '&X-Amz-Security-Token=' + encodeURIComponent(credentials.SessionToken);
                                    }
                                
                                    var requestUrl = protocol + '://' + host + uri + '?' + canonicalQuerystring;
                                    return requestUrl;

                                };
                                var clientId = "clientID" + (Math.floor((Math.random()*100000) + 1));
                                var requestUrl = SigV4Utils.getSignedUrl('a17q59ygxtqaej.iot.us-west-2.amazonaws.com', 'us-west-2', data.Credentials);
                                
                                console.log(clientId);
                                console.log(requestUrl);

                                var client = new Paho.MQTT.Client(requestUrl, clientId);
                                console.log(data.Credentials);
                                var connectOptions = {
                                    onSuccess: function(){
                                        console.log("subbed!");
                                    },
                                    useSSL: true,
                                    timeout: 3,
                                    mqttVersion: 4,
                                    onFailure: function(err) {
                                        console.log(err);
                                    }
                                };
                                client.connect(connectOptions);

                            }
                        });
                    }// successful response
                }); 
            }
        });

    }
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));