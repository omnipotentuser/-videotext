/* globals RTCEngine:true, VideochatViews:true */

$(document).ready(function(){
    var rtc_engine = new RTCEngine();
    let videochatViews = new VideochatViews();
    let transcriberViews = new TranscriberViews();
    var localId = null;
    var joinVideoBtn = $('#joinvideobtn');
    var joinTranscriberBtn = $('#jointranscriberbtn');
    var exitRoom = $('#local-video');

    var handleVideoSocketEvents = function(signaler, data){
        if (signaler){
            var pid = '';
            switch (signaler) {
                case 'connected':
                    console.log('rtc engine connected');
                    let roomName = "";
                    let userType = "patron";
                    rtc_engine.join({room:roomName, userType:userType});
                    break;
                case 'id':
                    localId = data.id;
                    break;
                case 'create':
                    pid = data.id;
                    console.log( 'creating new media element', pid);
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
                    if (data.msg == 'novacancy'){
                        window.alert('No Interpreter available. Try again later.');
                        exitRoom.trigger('click');
                    }
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

    var handleVideoBtn = function(event){

        event.preventDefault();
        videochatViews.openMediaViews();
        console.log('starting rtc engine');
        rtc_engine.connect(handleVideoSocketEvents);

        joinVideoBtn.unbind('click', handleVideoBtn);
        joinTranscriberBtn.unbind('click', handleTranscriberBtn);
    };

    var handleTranscriberBtn = function(event){
        joinVideoBtn.unbind('click', handleVideoBtn);
        joinTranscriberBtn.unbind('click', handleTranscriberBtn);
    };

    var handleExitBtn = function(event){
        joinVideoBtn.bind('click', handleVideoBtn);
        joinTranscriberBtn.bind('click', handleTranscriberBtn);
        rtc_engine.leave();
        videochatViews.closeMediaViews();
        videochatViews = null;
        TranscriberViews = null;
        rtc_engine = null;
        location.href = "/patron";
    };

    exitRoom.bind('click', handleExitBtn);
    joinVideoBtn.bind('click', handleVideoBtn);
    joinTranscriberBtn.bind('click', handleTranscriberBtn);

    videochatViews.setListeners(rtc_engine);
})

