/* globals RTCEngine:true, VideochatViews:true */

$(document).ready(function(){
    var rtc_engine = new RTCEngine();
    var videochatViews = new VideochatViews();
    var localId = null;
    var roomName = '';
    var $input = $('#roomnameinput');
    var joinRoomBtn = $('#joinroombtn');
    var exitRoomBtn = $('#exitchat');
    var randGenBtn = $('#randomgeneratorbtn');

    var handleSocketEvents = function(signaler, data){
        if (signaler){
            var pid = '';
            switch (signaler) {
                case 'connected':
                    console.log('rtc engine connected');
                    rtc_engine.join({room:roomName});
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
                    videochatViews.appendPeerMedia(pid);
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

    var handleJoinBtn = function(event){

        if (roomName === ''){
            roomName = $input.val();
        }
        
        if (roomName === ''){
            window.alert('Cannot have empty name');
        } else {
            event.preventDefault();
            videochatViews.openMediaViews();

            (function(room, engine){
                console.log('starting rtc engine');
                engine.connect(handleSocketEvents);
            })(roomName, rtc_engine);

            videochatViews.updateTitle(roomName);
            window.history.replaceState({}, "OpenStream "+roomName, "#"+roomName);
            joinRoomBtn.unbind('click', handleJoinBtn);
            randGenBtn.unbind('click', handleRandGenBtn);
            exitRoomBtn.show();
        }
    };

    var handleExitBtn = function(event){
        $input.val('');
        joinRoomBtn.bind('click', handleJoinBtn);
        randGenBtn.bind('click', handleRandGenBtn);
        rtc_engine.leave();
        videochatViews.closeMediaViews();
        videochatViews = null;
        rtc_engine = null;
        location.href = "/vpexit";
    };

    var S4 = function(){
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    var    generateID = function(){
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    };

    var handleRandGenBtn = function(event){
        $input.val(generateID());
        joinRoomBtn.trigger('click');
    };

    joinRoomBtn.bind('click', handleJoinBtn);
    exitRoomBtn.bind('click', handleExitBtn);
    randGenBtn.bind('click', handleRandGenBtn);

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
        if (roomName !== ''){
            joinRoomBtn.trigger('click');
        }
    })();
})

