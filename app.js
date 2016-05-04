var builder = require('botbuilder');
var luisDialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=c5b1296c-ef3f-437e-b574-a1f7c4eded53&subscription-key=406d2cee0c624a0f932ef42a5a8ea17c');
var bot = new builder.TextBot();
var environment = process.env.NODE_ENV || 'dev';
var config = require('./config')[environment];

bot.add('/', luisDialog);

luisDialog.on('AQI', [
  function(session, args, next) {
    console.log('first');

    var location = builder.EntityRecognizer.findEntity(args.entities, 'location');

    if (!location) {
      builder.Prompts.text(session, "Where?");
    } else {
      next({response: location.entity});
    }
  },
  function(session, results, next) {
    // invoke aqi service here
    console.log('second func');
    console.log(results);
    session.beginDialog('/fufu');
  },
  function(session, results, next) {
    console.log('3');
  }
]);

bot.add('/fufu', [
  function(session, results, next) {
    console.log('1');
    session.send('hello');
    next();
  },
  function(session, results, next) {
    console.log('2');
  },
  function(session, results, next) {
    console.log('3');
    session.endDialog(); // will jump back to '3' (previous dialog)
  }
]);

luisDialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

bot.listenStdin();
