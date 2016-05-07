var environment = process.env.NODE_ENV || 'dev';
var config = require('./config')[environment];
var builder = require('botbuilder');
var wechatBotBuilder = require('botbuilder-wechat');
var luisDialog = new builder.LuisDialog(config.luisEndpoint);
var aqiService = require('./services/aqiService')(config.aqiServiceEndpoint);
var audioConverter = require('./services/audioConverter');
var bingTextToSpeech = require('./services/bingTextToSpeech')(process.env.bingTextToSpeechSecret);
var express = require('express');
var app = express();
var http = require('http').Server(app);

var bot = new wechatBotBuilder.WechatBot({
  wechatAppId: process.env.wechatAppId,
  wechatSecret: process.env.wechatSecret,
  wechatToken: process.env.wechatToken,
  voiceMessageParser: function(payload, done) {
    // paylod is a buffer containing an AMR Audio File
    // parsing logic goes in here
    // call service like ibm watson or microsoft speech
    console.log('convert');

    audioConverter.convertAmrToWav(payload)
      .then(function(wavPayload) {
        console.log('wav received');

        return bingTextToSpeech.convertToSpeech(wavPayload)
          .then(function(text) {
            done(text);
          });
      })
      .catch(function(e) {
        console.log(e);
        done('');
      });
  }
});

bot.add('/', luisDialog);

luisDialog.on('AQI', [
  function(session, args, next) {
    var location = builder.EntityRecognizer.findEntity(args.entities, 'location');

    if (!location) {
      // need a custom dialog here, this one sucks
      builder.Prompts.text(session, "Where?");
    } else {
      next({response: location.entity});
    }
  },
  function(session, results, next) {
    var location = results.response;
    // invoke service here
    aqiService.getAqiByLocation(location).then(function(aqi) {
      session.send('the aqi is ' + aqi);
    }, function() {
      session.send('error fetching the aqi, you may check your location');
    });
  }
]);

luisDialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

// change back to /wc
app.use('/bot/wc', bot.getWechatCallbackHandler());

app.get('*', function(req, res) {
  res.status(404).end();
});

var port = process.env.PORT || 3000;

http.listen(port, function() {
  console.log('== Server started ==');
});
