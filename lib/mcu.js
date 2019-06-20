
var request = require('request');
var turnSecret = require('../config.js').thirdparty.turn_secret;
var turnIdent = require('../config.js').thirdparty.turn_ident;;

var io;
var currentRoom = {};
var passwords = {};
var rooms = {}; // { room : { islocked : <bool> } }

function joinRoom(socket, room){
    console.log('joinRoom ' + room);
    socket.join(room);
    currentRoom[socket.id] = room;
    //var clients = io.nsps['/'].adapter.rooms[room];
    var clients = io.sockets.adapter.rooms[room];
    var usersInRoom = [];
    if( clients ){
        Object.keys(clients.sockets).forEach( function(socketId){
            console.log('clients client socket ID: ' + socketId);
            usersInRoom.push(socketId);
        });
    }
    /*
    for (var clientId in clients){
        console.log('clientId: ' + clientId);
        console.log('io.sockets.connected[clientId]: ' + io.sockets.connected[clientId]);
        usersInRoom.push(io.sockets.connected[clientId]);
    }
    */
    if (usersInRoom.length > 1){
        console.log('number of users: ' + usersInRoom.length);
        console.log('id ' + socket.id + ' joining');
        var peers = [];
        for (var i = 0; i<usersInRoom.length; i++){
            console.log('typeof usersInRoom[i].id ' + typeof usersInRoom[i]);
            console.log('usersInRoom['+i+'] '+usersInRoom[i]);
            if ( usersInRoom[i] && usersInRoom[i] !== socket.id ) {
                console.log('adding ' + socket.id + ' to peers');
                peers.push(usersInRoom[i]);
            };
        };
        socket.to(room).emit('createOffer', {id:socket.id});
        socket.emit('createPeers', {len:peers.length, users:peers});
    } else {
        console.log('Info: Room feels lonely.');
        socket.emit('info', {info:'room empty'});
    }
}

function handleJoinRoom(socket){
    socket.on('join', function (message) {
            /* temporary until xirsys is reconfigured */
        /*
        var roomName = message.room;
        if (currentRoom[socket.id])
            socket.leave(currentRoom[socket.id]);
        if (passwords[roomName] && passwords[roomName] === message.password){
            console.log('handleJoinRoom -- joining room, password matched');
            socket.emit('id', {yourId:socket.id});
            joinRoom(socket, roomName);
        } else if (!passwords[roomName]){ // no password assigned
            console.log('handleJoinRoom -- joining room, no password');
            socket.emit('id', {yourId:socket.id});
            joinRoom(socket, roomName);
        } else {
            socket.emit('err', {errcode:'invalid password'});
        }
        return;
        */

        console.log('handleJoinRoom');
        let o = {
            format: "urls"
        };

        let bodyString = JSON.stringify(o);
        let https = require('https');
        let turnInfo = turnIdent + ":" + turnSecret;
        let options = {
            host: "global.xirsys.net"
            , path: "/_turn/bovav"
            , method: "PUT"
            , headers: {
                "Authorization": "Basic " + Buffer.from(turnInfo).toString("base64")
                , "Content-Type": "application/json"
                , "Content-Length": bodyString.length
            }
        };

        let httpreq = https.request(options, function(httpres) {
            let str = "";
            httpres.on("data", function(data){ str += data; });
            httpres.on("error", function(e){ console.log("XIRSYS error: ", e); });
            httpres.on("end", function(){
                console.log("ICE List: ", str);
                //var ice = JSON.parse(body).d.iceServers;
                ice = str;
                if (ice.length > 0){
                    socket.emit('iceConfig', ice);
                }
                let roomName = message.room;
                if (currentRoom[socket.id])
                    socket.leave(currentRoom[socket.id]);
                if (passwords[roomName] && passwords[roomName] === message.password){
                    console.log('handleJoinRoom -- joining room, password matched');
                    socket.emit('id', {yourId:socket.id});
                    joinRoom(socket, roomName);
                } else if (!passwords[roomName]){ // no password assigned
                    console.log('handleJoinRoom -- joining room, no password');
                    socket.emit('id', {yourId:socket.id});
                    joinRoom(socket, roomName);
                } else {
                    socket.emit('err', {errcode:'invalid password'});
                }
            });
        });

        httpreq.on("error", function(e){
            console.log("XIRSYS request error: ", e);
        });
        httpreq.end();
        /*
        var turnOptions = {
            ident : "openhack",
            secret : turnSecret,
            domain : "openhack.net",
            application : "default",
            room : "default",
            secure : "1"
        };

        request.post(
            { 
                url : "https://api.xirsys.com/getIceServers", 
                form: turnOptions
            },
            function(err, res, body){
                if (err){
                    console.log('XIRSYS err:', err);
                    return;
                }
                var xirsys_body = JSON.parse(body);
                console.log('XIRSYS body', xirsys_body);
                var ice = JSON.parse(body).d.iceServers;
                if (ice.length > 0){
                    socket.emit('iceConfig', ice);
                }
                var roomName = message.room;
                if (currentRoom[socket.id])
                    socket.leave(currentRoom[socket.id]);
                if (passwords[roomName] && passwords[roomName] === message.password){
                    console.log('handleJoinRoom -- joining room, password matched');
                    socket.emit('id', {yourId:socket.id});
                    joinRoom(socket, roomName);
                } else if (!passwords[roomName]){ // no password assigned
                    console.log('handleJoinRoom -- joining room, no password');
                    socket.emit('id', {yourId:socket.id});
                    joinRoom(socket, roomName);
                } else {
                    socket.emit('err', {errcode:'invalid password'});
                }
            }
        );
        */
    });
}

function handleCreateRoom(socket){
    socket.on('createRoom', function (message) {
        if (currentRoom[socket.id])
	        socket.leave(currentRoom[socket.id]);
        var len = 0, obj = io.sockets.adapter.rooms[message.room];
        if (obj){
            len = Object.keys(obj).length;
        }
        console.log("handleCreateRoom - number of sockets connected", len);

        if (len < 1){
            console.log('handleCreateRoom - isLocked: '+message.isLocked);
            if (message.isLocked){
                passwords[message.room] = message.password;
            }
            rooms[message.room] = {isLocked: message.isLocked};
            socket.emit('roomCreated', {created:true});

            var add = {};
            add[message.room] = {isLocked: message.isLocked};
            socket.broadcast.emit('addRoom', add);

        } else {
            console.log(message.room + ' exists already');
            socket.emit('roomCreated', {created:false});
        }
    });
}

function handleSendRooms(socket){
    socket.on('getRooms', function(){
        console.log('Client asking for room list, sending');

        /*
        var list = {
            'boo00000000oooooooooooooooooooooooooo': {isLocked: true },
            'mtg': {isLocked: false},
            'mtg1': {isLocked: true},
            'mtg2': {isLocked: false},
            'mtg22': {isLocked: true},
            'mtg222': {isLocked: true},
            'mtg2222': {isLocked: true},
            'mtg2222222': {isLocked: true},
            'mtg22222222': {isLocked: true},
            'mtg22222': {isLocked: true},
            'mtg222222': {isLocked: true},
            'mtg22222222222': {isLocked: true},
            'mtg2222222222222222': {isLocked: true},
            'mtg22 22222222222 2222': {isLocked: true},
            'mtg222222222222': {isLocked: true},
            'mtg2222222222': {isLocked: true},
            'mtg2222222222222222222': {isLocked: true},
            'mtgeee': {isLocked: true},
            'mtgeeeeee': {isLocked: true},
            'mtgeeeeeeeee': {isLocked: true},
            'mtg33': {isLocked: true},
            'mtg3333': {isLocked: true},
            'Poker Night': {isLocked: false}
        };
        socket.emit('roomsSent', list);
        */
        socket.emit('roomsSent', rooms);
    });
}

function handleMessageBroadcasting(socket){
    socket.on('byteChar', function (message) {
        console.log("Node received message " + message.code);
        message.from_id = socket.id;
        socket.to(message.room).emit('byteChar', message);
    });
}

function handleIceCandidate(socket){
    socket.on('candidate', function(message){
        message.from_id = socket.id;
        socket.to(message.to_id).emit('candidate', message);
 });
};

function handleSetRemoteDescription(socket) {
    socket.on('sdp', function(message){
        message.from_id = socket.id;
        socket.to(message.to_id).emit('sdp', message);
        //io.socket(message.to_id).emit('sdp', message);
    });
};

function handleClientDisconnect(socket) {
    socket.on('disconnect', function() {
        var room = currentRoom[socket.id];
        if (room){

            console.log(socket.id + ' disconnected from ' + room);
            delete currentRoom[socket.id];

            var len = 0, obj = io.sockets.adapter.rooms[room];
            if (obj){
                len = Object.keys(obj).length;
            }
            if (len <= 0){
                if (passwords[room]) delete passwords[room];
                delete rooms[room];
            }

            socket.in(room).emit('leave', socket.id);
            socket.broadcast.emit('deleteRoom', {'room': room});
            socket.leave(room);

        }
    });
};

function handleClientExit(socket) {
    socket.on('exit', function () {
        console.log(socket.id, 'exiting from room ' + currentRoom[socket.id]);
        socket.disconnect();
    });
};

exports.init = function(server){
    io = server;
    io.on('connection', function(socket){
        console.log('socket connected with id: ' + socket.id);
        //handleGetId(socket);
        handleJoinRoom(socket);
        handleCreateRoom(socket);
        handleSendRooms(socket);
        handleClientExit(socket);
        handleMessageBroadcasting(socket);
        handleIceCandidate(socket);
        handleSetRemoteDescription(socket);
        handleClientDisconnect(socket);
    });
}
