let request = require('request');

const turnSecret = require('../config.js').thirdparty.turn_secret;
const turnIdent = require('../config.js').thirdparty.turn_ident;
const iceStaticConfig = require('../config.js').iceStaticConfig;

let io = null;
let currentRoom = {};
let ACD_interpreter_list = []; // [ {roomName : <string>, socketid: <string>, username: <string> },.. ]
let ACD_occupied = []; // [ {roomName : <string>, users: [{type: <string i.e. interpreter, or patron>, socketid: <string>}] },.. ]
//let rooms = {}; // { room : { islocked : <bool> } } ** old

function createOccupiedRoom(patronsockid, patronStunOn){
    if (ACD_interpreter_list.length > 0){
        let nextTerp = ACD_interpreter_list.shift();
        let newRoom = {
            roomName : nextTerp.roomName,
            users : [
                {
                    type: "interpreter",
                    socketid: nextTerp.socketid,
                    //username: nextTerp.username ? nextTerp.username : "Unnamed Interpreter",
                    stunOn: nextTerp.stunOn
                },
                {
                    type: "patron",
                    socketid: patronsockid,
                    //username: patronUsername ? patronUsername : "User",
                    stunOn: patronStunOn
                }
            ]
        }
        ACD_occupied.push(newRoom);
        return newRoom.roomName;
    } else {
        return 'limbo';
    }
}

function getOccupiedRoomUsers(roomName){
    let roomIndex = ACD_occupied.findIndex( room => {
        return room.roomName == roomName;
    });

    if (roomIndex >= 0)
        return ACD_occupied[roomIndex].users;
    else
        return null;
}

function isInterpreterInOccupiedRoom(roomName){

    let roomIndex = ACD_occupied.findIndex( room => {
        return room.roomName == roomName;
    });

    if (roomIndex >= 0){
        let users = ACD_occupied[roomIndex].users;

        users.forEach( user => {
            if (user.type == 'interpreter'){
                return true;
            }
        });

    }
    return false;
}

// The room closes if any user leaves
//
// TODO - any patron remaining in room needs to be sent event
// that no interpreter is in room. Patron has to leave.
//
// This may be handled on the client end, for now.
//
function closeOccupiedRoom(roomName, socketid){

    let roomIndex = ACD_occupied.findIndex( room => {
        return room.roomName == roomName;
    });

    if (roomIndex >= 0){
        let users = ACD_occupied[roomIndex].users;

        users.forEach( user => {
            if (user.type == 'interpreter'){
                var terpUser = {
                    roomName : roomName,
                    socketid: user.socketid,
                    username: user.username,
                    stunOn: user.stunOn
                };

                console.log('closeOccupiedRoom -- exiting interpreter socket.id', socketid);
                console.log('closeOccupiedRoom --   ACD list terpUser.socket.id', terpUser.socketid);
                console.log('closeOccupiedRoom -- terp socket.id match?', terpUser.socketid === socketid);
                ACD_interpreter_list.push(terpUser);
            }
        });

        ACD_occupied.splice(roomIndex, 1);
    }
}

function updateIce(stunOn, callback){
    console.log('updateIce called');
    let o = {
        format: "urls"
    };

    let bodyString = JSON.stringify(o);
    let https = require('https');
    let turnInfo = turnIdent + ":" + turnSecret;
    //console.log('turnInfo: ' + turnInfo);
    let options = {
        host: "global.xirsys.net",
        path: "/_turn/bovav",
        method: "PUT",
        headers: {
            "Authorization": "Basic " + Buffer.from(turnInfo).toString("base64")
            , "Content-Type": "application/json"
            , "Content-Length": bodyString.length
        }
    };

    let ice = null;
    let httpreq = https.request(options, function(httpres) {
        let str = "";
        httpres.on("data", function(data){ str += data; });
        httpres.on("error", function(e){ 
            console.log("XIRSYS error: ", e); 
            return Promise.resolve(ice);
        });
        httpres.on("end", function(){
            if (str.length > 0){
                let config = JSON.parse(str).v.iceServers;
                console.log('is STUN enabled?', stunOn);
                if (!stunOn){
                    let urls = config.urls;
                    let newurls = [];
                    urls.forEach(url => {
                        if (!url.includes('stun')){
                            newurls.push(url);
                        }
                    })
                    config.urls = newurls;
                    console.log(config.urls);
                }

                console.log("ICE List: ", config);
                callback(config);
            }
        });
    });

    httpreq.on("error", function(e){
        console.log("XIRSYS request error: ", e);
    });
    httpreq.write(bodyString);
    httpreq.end();
}


function handleBroadcastJoin(socket){
    socket.on('broadcastJoin', (message) => {
        let room = message.room;
        let stun = message.stunOn;
        console.log('broadcast createOffer to room ', room);
        updateIce(stun, function(iceconfig){
            socket.to(room).emit('createOffer', {id:socket.id, ice: iceconfig});
        });
    });
}

function joinRoom(socket, room, stunOn){
    console.log('joinRoom ' + room);
    socket.join(room);
    currentRoom[socket.id] = room;
    var clients = io.sockets.adapter.rooms[room];
    var usersInRoom = [];
    if( clients ){
        Object.keys(clients.sockets).forEach( function(socketId){
            console.log('clients client socket ID: ' + socketId);
            usersInRoom.push(socketId);
        });
    }
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
        updateIce(stunOn, (iceconfig) => {
            socket.emit('createPeers', {
                len:peers.length,
                users:peers,
                ice: iceconfig,
                roomName: room
            });
        });
    } else {
        console.log('Info: Room feels lonely.');
        socket.emit('info', {info:'room empty'});
    }
}


function handleJoinRoom(socket){
    socket.on('join', function (message) {
        console.log('handleJoinRoom');
        let roomName = message.room;
        let stun = message.stunOn;
        let userType = null;
        if (message.userType)
            userType = message.userType;
        if (currentRoom[socket.id])
            socket.leave(currentRoom[socket.id]);
        console.log('handleJoinRoom -- joining room, as', userType);
        console.log('handleJoinRoom -- number of interpreters vacant:', ACD_interpreter_list.length);
        console.log('handleJoinRoom -- number of interpreters occupied:', ACD_occupied.length);
        if (userType === "interpreter"){
            socket.emit('id', {yourId:socket.id});
            ACD_interpreter_list.push({roomName: roomName, socketid: socket, stunOn: stun});
            joinRoom(socket, roomName, stun);
        } else if (userType === "patron"){
            if(ACD_interpreter_list.length < 1){
                socket.emit('info', {info:'novacancy'});
            } else {
                socket.emit('id', {yourId:socket.id});
                roomName = createOccupiedRoom(socket,stun);
                console.log('handleJoinRoom -- roomName:', roomName, 'userType:', userType);
                joinRoom(socket, roomName, stun);
            }
        } else {
            console.log('Unknown user joining a room');
            joinRoom(socket, roomName, stun);
        }

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

            // obsolete, for keeping track of rooms to retain and send to clients
            // for list of rooms to show
            //var obj = io.sockets.adapter.rooms[room];
            //var len = 0;
            //if (obj){
            //    len = Object.keys(obj).length;
            //}

            // close only if interpreter leaves
            closeOccupiedRoom(room, socket.id);

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
        handleBroadcastJoin(socket);
        handleClientExit(socket);
        handleMessageBroadcasting(socket);
        handleIceCandidate(socket);
        handleSetRemoteDescription(socket);
        handleClientDisconnect(socket);
    });
}
