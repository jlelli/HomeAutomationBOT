// Authorized users, replace with your real IDs
var authorized_users = [
  "username1",
  "username2",
];

// Include required libraries
//var sensorLib = require('node-dht-sensor');
var telegram = require('telegram-bot-api');
var shell = require('shelljs');
var dateFormat = require('dateformat');

// Initialize relay board (using onoff library)
//var Gpio = require('onoff').Gpio,
//  relay1 = new Gpio(2, 'out'),
//  relay2 = new Gpio(3, 'out');

// Turn both the relays off
//relay1.writeSync(0);
//relay2.writeSync(0);

// Initialize DHT11 sensor
//sensorLib.initialize(11, 4);

// Initialize and start Telegram BOT (insert your real token)
var bot = new telegram({
  token: '<obtain through BotFather>',
  updates : {
    enabled: true,
    get_interval: 2000
  }
});

// Attach event on every received message 
bot.on('message', function (message) {
  parseMessage(message);
});

// Start the bot
console.log("BOT ready!");

var lights_status = {
	studio: "OFF"
};

// Function that handles a new message
function parseMessage(message) {

  if(!isAuthorized(message.from.username)) {
      bot.sendMessage({
        chat_id: message.chat.id,
        text: "Go away " + message.from.first_name + " " + message.from.last_name + " (AKA " + message.from.username + ") ! \nYou are not authorized to enter these premises!",
      });
      console.log(message.from.username + " tried to enter the premises!!!");
      return;
  }

  switch(true) {

    case message.text == "/start":
      bot.sendMessage({
        chat_id: message.chat.id,
        text: "Welcome " + message.from.first_name + " " + message.from.last_name + " to juril Home Automation!",
      });
      console.log(message.from.username + " is in!");
      break;

    case message.text == "/photostudio":
      if (shell.exec('<get photo with motioneye>').code != 0) {
        return;
      }
      var now = new Date();
      bot.sendPhoto({
        chat_id: message.chat.id,
        caption: 'Studio @ ' + dateFormat(now),
        photo: '/tmp/snapshot.jpg'
      });
      console.log(message.from.username + " asked for a photo of Studio");
      break;

    case message.text == "/getlights":
      bot.sendMessage({
        chat_id: message.chat.id,
        text: 'Lights status:\nStudio is ' + lights_status["studio"],
      });
      console.log(message.from.username + " asked for lights status");
      break;

    case message.text == "/switchstudioon":
      if (shell.exec('./codesend 4543795 1 181').code != 0) {
        bot.sendMessage({
          chat_id: message.chat.id,
          text: 'Oops.. something went wrong. :-(',
        });
        return;
      }
      lights_status['studio'] = "ON";
      bot.sendMessage({
        chat_id: message.chat.id,
        text: 'Studio lights turned ON',
      });
      console.log(message.from.username + " turned studio lights ON");
      break;

    case message.text == "/switchstudiooff":
      if (shell.exec('./codesend 4543804 1 181').code != 0) {
        bot.sendMessage({
          chat_id: message.chat.id,
          text: 'Oops.. something went wrong. :-(',
        });
        return;
      }
      lights_status['studio'] = "OFF";
      bot.sendMessage({
        chat_id: message.chat.id,
        text: 'Studio lights turned OFF',
      });
      console.log(message.from.username + " turned studio lights OFF");
      break;
  }
}


// Function that checks if the user is authorized (its id is in the array)
function isAuthorized(username) {

  for(i = 0; i < authorized_users.length; i++) 
    if(authorized_users[i] == username) return true;
 
  return false;
}
