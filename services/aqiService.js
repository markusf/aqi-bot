var request = require('request');
var Q = require('q');

// TODO: use promises
function getService(endpoint) {

  var getAqiByLocation = function(location) {
    var deferred = Q.defer();
    request.get(endpoint + '/aqi/' + location, function(error, response, body) {
        if (error || response.statusCode === 404) {
          deferred.reject(error);
          return;
        }

        var pm25 = JSON.parse(body).pm25;

        deferred.resolve(pm25);
    });
    return deferred.promise;
  };

  return {
    getAqiByLocation: getAqiByLocation
  };
}

module.exports = function(endpoint) {
  return getService(endpoint);
};
