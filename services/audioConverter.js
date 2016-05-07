var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();
var Q = require('q');
var fsp = require('fs-promise');

function getRandomFileName() {
  return new Date().getTime();
}

function convert(inputFilePath, outputFilePath) {
  var deferred = Q.defer();

  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .on('end', function() {
      deferred.resolve();
    })
    .on('error', function(e) {
      deferred.reject(e);
    }).run();

  return deferred.promise;
}

var convertAmrToWav = function(payload) {
  var deferred = Q.defer();

  var fileName = getRandomFileName();
  var amr = fileName + '.amr';
  var wav = fileName + '.wav';

  fsp.writeFile(amr, payload)
    .then(function() {
      return convert(amr, wav);
    })
    .then(function() {
      return fsp.readFile(wav);
    })
    .then(function(wavPayload) {
      return Q.all([fsp.unlink(amr), fsp.unlink(wav)])
        .then(function() {
          deferred.resolve(wavPayload);
        })
    })
    .catch(function(e) {
      console.log(e);
      deferred.reject();
    });

    return deferred.promise;
};

module.exports = {
  convertAmrToWav: convertAmrToWav
};
