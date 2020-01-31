/* globals RTCEngine:true, VideochatViews:true */

$(document).ready(function(){
    var rtc_engine = new RTCEngine();
    var videochatViews = new VideochatViews();
    var localId = null;
    var roomName = null;
    var exitRoom = $('#local-video');

    var handleSocketEvents = function(signaler, data){
        if (signaler){
            var pid = '';
            switch (signaler) {
                case 'connected':
                    console.log('rtc engine connected');
                    rtc_engine.join({
                        room:roomName,
                        userType:"interpreter",
                        videoEnabled: true
                    });
                    break;
                case 'id':
                    localId = data.id;
                    break;
                case 'create':
                    pid = data.id;
                    console.log(
                        'creating new media element', 
                        pid
                    );
                    var created = videochatViews.appendPeerMedia(pid);
                    console.log('******* Was peer created?', created);
                    return created;
                    break;
                case 'peerDisconnect':
                    pid = data.id;
                    videochatViews.deletePeerMedia(data.id);
                    break;
                case 'info':
                    console.log(data.msg);
                    break;
                case 'error':
                    // need to handle error for room full
                    // by exiting room
                    console.log(data.msg);
                    break;
                default:
                    break;
            }
        }
    };

    var joinRoom = function(){

        console.log('joinRoom roomName_', roomName, '_default');

        if (!roomName){
            roomName = generateID();
            console.log('joinRoom roomName_', roomName, '_generated');
        }
        
        if (roomName === ''){
            window.alert('Cannot have empty name');
        } else {
            videochatViews.openMediaViews();
            (function(room, engine){
                console.log('starting rtc engine');
                engine.connect(handleSocketEvents);
            })(roomName, rtc_engine);
            window.history.pushState({}, "MCA Interpreter "+roomName, "#"+roomName);
        }
    };

    var handleExitBtn = function(event){
        rtc_engine.leave();
        videochatViews.closeMediaViews();
        videochatViews = null;
        rtc_engine = null;
        location.href = "/logout";
    };

    var S4 = function(){
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    var generateID = function(){
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    };

    exitRoom.bind('click', handleExitBtn);

    videochatViews.setListeners(rtc_engine);
    (function queryUrl(){
        var hashurl = window.location.hash;
        var hashpos = hashurl.lastIndexOf('#');
        if (hashpos !== -1){
            hashurl = hashurl.substring(hashpos + 1);
        }
        if (hashpos === -1){
            roomName = '';
        } else if (hashurl.length > 0){
            roomName = hashurl;
        } else {
            roomName = '';
        }
        console.log('roomName',roomName);
        joinRoom();
    })();
})

