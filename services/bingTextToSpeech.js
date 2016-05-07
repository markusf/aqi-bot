// TODO: inject secret..


var Q = require('q');
var request = require('request-promise');

var getService = function(secret) {

  var accessToken;
  var expiryDate;

  var convertToSpeech = function(payload) {
    return getToken()
      .then(function(accessToken) {
        return request.post({
          url: 'https://speech.platform.bing.com/recognize?version=3.0&requestid=b2c95ede-97eb-4c88-81e4-80f32d6aee54&appID=b2c95ede-97eb-4c88-81e4-80f32d6aee54&format=json&locale=en-US&device.os=wechat&scenarios=ulm&instanceid=b2c95ede-97eb-4c88-81e4-80f32d6aee54',
          headers: {
            'Content-Type': 'audio/wav;samplerate=8000',
            'ocp-apim-subscription-key': secret,
            Authorization: 'Bearer ' + accessToken
          },
          body: payload
        })
        .then(function(body) {
          /*
            {
              "version": "3.0",
              "header": {
                "status": "success",
                "scenario": "ulm",
                "name": "test test",
                "lexical": "test test",
                "properties": {
                  "requestid": "a7af2b90-75d7-4ffe-8e3e-84e3e1232260",
                  "HIGHCONF": "1"
                }
              },
              "results": [
                {
                  "scenario": "ulm",
                  "name": "test test",
                  "lexical": "test test",
                  "confidence": "0.934",
                  "properties": {
                    "HIGHCONF": "1"
                  }
                }
              ]
            }
          */
          console.log(body);

          var response = JSON.parse(body);

          if (response.header.status !== 'success') {
            return;
          }

          return response.results[0].name;
        });
      });
  };

  function getToken() {
    var deferred = Q.defer();

    if (!accessToken || isTokenExpired()) {
      request.post({
        url: 'https://oxford-speech.cloudapp.net/token/issueToken',
        form: {
          grant_type: 'client_credentials',
          client_id: 'mybot',
          scope: 'https://speech.platform.bing.com',
          client_secret: secret
        }
      })
      .then(function(body) {
        var response = JSON.parse(body);
        accessToken = response.access_token;
        expiryDate = new Date().getTime() + (parseInt(response.expires_in) * 1000);

        deferred.resolve(accessToken);
      })
      .catch(function(e) {
        deferred.reject(e);
      });
    } else {
      deferred.resolve(accessToken);
    }

    return deferred.promise;
  }

  function isTokenExpired() {
    var now = new Date().getTime();

    if (expiryDate - now < 4000) {
      return true;
    }

    return false;
  }

  return {
    convertToSpeech: convertToSpeech
  };

};

module.exports = function(secret) {
  return getService(secret);
}
