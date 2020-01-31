'use strict';
/* globals RTCEngine:true, SessionsViews:true */

$(document).ready(function(){
    let rtc_engine = new RTCEngine();
    let patronViews = new PatronViews();
    let localId = null;
    let startSessionBtn = $('#joinsessionbtn');
    let exitSession = $('#exitsession');
    let enableVideoCheck = $('#video-enable');
    let enableTranscriberCheck = $('#transcriber-enable');
    let isVideoEnabled = true; // default
    let isTranscriberEnabled = false; // default

    var handleSocketEvents = function(signaler, data){
        if (signaler){
            var pid = '';
            switch (signaler) {
                case 'connected':
                    console.log('rtc engine connected');
                    let roomName = "";
                    let userType = "patron";
                    rtc_engine.join({
                        room:roomName,
                        userType:userType,
                        videoEnabled:isVideoEnabled,
                        transcriberEnabled:isTranscriberEnabled
                    });
                    break;
                case 'id':
                    localId = data.id;
                    break;
                case 'create':
                    pid = data.id;
                    console.log( 'creating new media element', pid);
                    return patronViews.appendPeerMedia(
                            pid, 
                            isTranscriberEnabled,
                            isVideoEnabled
                        );
                    break;
                case 'peerDisconnect':
                    pid = data.id;
                    patronViews.deletePeerMedia(data.id);
                    break;
                case 'readbytechar':
                    patronViews.updateTextArea(data.from_id, data.code);
                    break;
                case 'info':
                    console.log(data.msg);
                    if (data.msg == 'novacancy'){
                        window.alert('No Interpreter available. Try again later.');
                        exitSession.trigger('click');
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

    var handleStartSession = function(event){

        event.preventDefault();

        isTranscriberEnabled = enableTranscriberCheck.is(':checked');
        isVideoEnabled = enableVideoCheck.is(':checked');

        if (!isTranscriberEnabled && !isVideoEnabled){
            window.alert('Cannot start without at least one box checked');
            return;
        }

        patronViews.initialize(rtc_engine);

        // video view has to be called first if enabled
        // if (isVideoEnabled) handleVideoEnabled();

        // temporary always on to set media video loop
        // delete this call after test is done. Re-enable
        // the conditional isVideoEnabled above
        handleVideoEnabled();

        //if (isTranscriberEnabled) handleTranscriberEnabled();

        rtc_engine.connect(handleSocketEvents);

        startSessionBtn.unbind('click', handleStartSession);
    };

    var handleExitBtn = function(event){
        startSessionBtn.bind('click', handleStartSession);
        rtc_engine.leave();
        patronViews.closeMediaViews();
        patronViews = null;
        rtc_engine = null;
        location.href = "/patron";
    };

    let handleVideoEnabled = function(){
        patronViews.setVideoViews();
    };

    let handleTranscriberEnabled = function(){
        patronViews.setTranscriberViews();
    };

    exitSession.bind('click', handleExitBtn);
    startSessionBtn.bind('click', handleStartSession);


})

