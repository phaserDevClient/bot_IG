
const VERIFY_TOKEN = 'EAADX2DirSNsBAMMFIBmrZAvDHf2T0i4kVTiFLhJ5sUzv7wqjmkVHeKt9ZB2ei6JTwWWRZBUsLxwYJTQ2HKvoTXAj2ol9Xc8VhxXY6ZCiZAeZC7TgiQcdKfUPvw1ZAcUyErZA3IrKnpZAsfq86nu7trQWm9DFl9yXFBIiDgjj14Seiwlf1KJblFZAZA0';
const PAGE_ACCESSTOKEN = 'EAADX2DirSNsBAMMFIBmrZAvDHf2T0i4kVTiFLhJ5sUzv7wqjmkVHeKt9ZB2ei6JTwWWRZBUsLxwYJTQ2HKvoTXAj2ol9Xc8VhxXY6ZCiZAeZC7TgiQcdKfUPvw1ZAcUyErZA3IrKnpZAsfq86nu7trQWm9DFl9yXFBIiDgjj14Seiwlf1KJblFZAZA0';

var arrMessageReminders = [
    {
        title: "😍 We miss you! 😍",
        message: "Time to relax! 😏 Come back to play and solve some levels...🤘"
    },
    {
        title: "Time to relax...😍'",
        message: "If you feel tired 😪 Let's play and solve some puzzle for relax and get fun! 🤘"
    },
    {
        title: "Your friends waiting you...😤",
        message: "Some your friends playing game now 🤘 Join and beat them! 😎"
    },
    {
        title: "Do you know? 🤗",
        message: "More than 20% players can't reach level 100. Can you reach level 100? 😎"
    },
    {
        title: "1400 levels waitting...😱",
        message: "🤣 I think you can  solve all levels. Let's play now! 😎"
    },
];

const
    // request = require('request'),
    // express = require('express'),
    // bodyParser = require('body-parser'),
    // app = express().use(bodyParser.json());
    request = require('request'),
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()), // creates express http server
    cors = require('cors');

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
app.use(body_parser.json());
app.use(cors());

app.set('port', (process.env.PORT || 1341));
app.listen(app.get('port'), function () {
    console.log('Webhook Knife Hit - Port 1341 is listening...');
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {
            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            if (webhook_event.game_play) {
                onReceivedGameplay(webhook_event);
            }

        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

function onReceivedGameplay(event) {
    // Messenger platform Page-Scope ID
    var senderId = event.sender.id;

    // FBInstant player id
    var playerId = event.game_play.player_id;

    // FBInstant context id
    var contextId = event.game_play.context_id;
    console.log(JSON.stringify(event));
    if (event.game_play.payload) {
        // Get data from payload
        var payload = JSON.parse(event.game_play.payload);
        console.log(JSON.stringify(payload));
        // sendMessage(senderId, contextId, "Infinity Knife", "Want to play again?", "https://image.ibb.co/exbXOo/cover_2.png", "Play now!", payload);
        setTimeout(function () {
            sendMessageReminderToPlay(senderId, contextId)
        }, 1500);
        var scoutSent = payload['scoutSent'];
        var scoutDurationInHours = payload['scoutDurationInHours'];

        // Schedule sending message to player when scout returns.
        if (scoutSent) {
            // Scheduler.after(scoutDurationInHours).hours().then(function () {
                sendMessage(
                    senderId,
                    contextId,
                    'Your scout has come back with more intel. Want to find out more?',
                    'Get scout report!',
                    {deeplinkTo: 'scout_screen'}
                );
            // });
        }
    }
};

// Send bot message
//
// sender (string) : Page-scoped ID of the message recipient
// context (string): FBInstant context ID. Opens the bot message in a specific context
// message (string): Message text
// cta (string): Button text
// payload (object): Custom data that will be sent to game session
//
function sendMessage(senderID, contextID, title, message, urlImg, cta, payload) {
    var button = {
        type: "game_play",
        title: cta
    };

    if (contextID) {
        button.context = contextID;
    }

    if (payload) {
        button.payload = JSON.stringify(payload)
    }

    var messageData = {
        recipient: {
            id: senderID
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [
                        {
                            title: title,
                            subtitle: message,
                            image_url: urlImg,
                            buttons: [button]
                        }
                    ]
                }
            }
        }
    };

    callSendAPI(messageData);

};

function sendMessageWithLimitedGift(senderID, contextID) {
    var valueBonusCoin = 50;
    var title = '😱 Limited Gift 😱';
    var message = "Don't miss it! Enter game to claim " + valueBonusCoin + " apples! Only in 12 hours! 😎";
    var urlImg = 'https://image.ibb.co/exbXOo/cover_2.png';
    var cta = 'Claim & Play Now';

    sendMessage(senderID, contextID, title, message, urlImg, cta, {event: 'claim_coins'});
};

function sendMessageReminderToPlay(senderID, contextID) {
    var rndMessage = randomItemArray(arrMessageReminders);

    var title = rndMessage.title;
    var message = rndMessage.message;
    var urlImg = 'https://image.ibb.co/exbXOo/cover_2.png';
    var cta = 'Play Now';

    sendMessage(senderID, contextID, title, message, urlImg, cta, null);
};

function sendMessageSubscribe(senderID, contextID) {
    var title = 'Nice to meet you! 👋';
    var message = "I'm Bot! I'll notify you when have gifts or new updates! Have a nice day!";
    var urlImg = 'https://image.ibb.co/exbXOo/cover_2.png';
    var cta = 'Play Now';

    sendMessage(senderID, contextID, title, message, urlImg, cta, null);
};

function callSendAPI(messageData) {
    var graphApiUrl = 'https://graph.facebook.com/me/messages?access_token=' + PAGE_ACCESSTOKEN;
    request({
        url: graphApiUrl,
        method: "POST",
        json: true,
        body: messageData
    }, function (error, response, body) {
        // if(error)
        //     console.error('Send FB Graph API failed ', 'error', error, 'status code', response.statusCode, 'body', body);
        // else
        //     console.log('Send FB Graph API successed!');
    });
};

// function addPlayerToCollection(senderID, playerID){
//     var collection = MongoDB.collection(PLAYERS_COLLECTION_NAME);
//     if(collection){
//         var query = {sender_id: senderID};
//         var player = { sender_id: senderID, player_id: playerID, last_datetime_send_push: moment(), is_can_get_limited_gift: false};
//         collection.update(query, player, {upsert: true}, function(err, res) {
//             if(!err){
//                 if(res.result.nModified == 0){
//                     console.log("[" + moment().format('LLL') + "]" + " Added new player with sender id: " + senderID);
//                     sendMessageSubscribe(senderID, null);
//                 }
//             }
//             else
//                 console.error("Error addPlayerToCollection");
//         });
//     }
// };
//
// function checkAndSendMessageForAllPlayers(){
//     var collection = MongoDB.collection(PLAYERS_COLLECTION_NAME);
//     if(collection){
//         collection.find().forEach(function(doc){
//             var curDateTime = moment();
//             var diff = curDateTime.diff(moment(doc.last_datetime_send_push), 'minute');
//             //>= 12 hours
//             if((diff + 1) >= 1440){
//                 sendMessageWithLimitedGift(doc.sender_id, null);
//                 collection.update({_id: doc._id}, {$set: {last_datetime_send_push: curDateTime, is_can_get_limited_gift: true}});
//             }
//             //sendMessageWithLimitedGift(doc.sender_id, null);
//             //collection.update({_id: doc._id}, {$set: {last_datetime_send_push: curDateTime, is_can_get_limited_gift: true}});
//         });
//         console.log("[" + moment().format('LLL') + "]" + " Check and send message to all players!");
//     }
// };
//
// function isPlayerCanGetLimitedReward(playerID){
//
// }
//
function randomItemArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
