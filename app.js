var environment = process.env.NODE_ENV || 'dev';
var config = require('./config')[environment];
var builder = require('botbuilder');
var luisDialog = new builder.LuisDialog(config.luisEndpoint);
var bot = new builder.TextBot();
var aqiService = require('./services/aqiService')(config.aqiServiceEndpoint);

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

bot.listenStdin();
