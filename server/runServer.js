
var requirejs = require("requirejs");
var WebSocketServer = require("ws").Server;

require("../common/js/lib/utils.js");
require("../common/js/lib/Box2dWeb-2.1.a.3.js");

gm = require("gm");

requirejs.config({
    nodeRequire: require,

    paths: {
        "engine": "../web/js/engine",
        "game": "../web/js/game"
    }
});

debugInfo = {};

var wss = new WebSocketServer({
    port: 9000
});

requirejs([], function ()
{
    wss.on('connection', function (socket)
    {
        console.log("Received incoming connection.");

        socket.on('message', function (data)
        {
            //console.log("Received incoming message: " + data);
            /*var msg = JSON.parse(data);
            msg.socket = socket;
            networkSystem.addIncomingMessage(msg);*/
        });

        socket.on('close', function (code, message)
        {
            console.log('disconnect happening');

            /*if (socket.playerId)
            {
                var msg = new Message('disconnect');
                msg.playerId = socket.playerId;
                msg.socket = socket;
                networkSystem.addIncomingMessage(msg);
            }*/
        });
    });

    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };
});