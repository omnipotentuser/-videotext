'use strict';
/* globals RTCEngine:true, SessionsViews:true */

$(document).ready(function(){
    var rtc_engine = new RTCEngine();
    let patronViews = new PatronViews();
    var localId = null;
    var startSessionBtn = $('#joinsessionbtn');
    var exitSession = $('#exitsession');

    var handleSocketEvents = function(signaler, data){
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
                    var created = patronViews.appendPeerMedia(pid);
                    console.log('******* Was peer created?', created);
                    return created;
                    break;
                case 'peerDisconnect':
                    pid = data.id;
                    patronViews.deletePeerMedia(data.id);
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
        
        patronViews.setListeners(rtc_engine);
        patronViews.openMediaViews();
        console.log('starting rtc engine');
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

    exitSession.bind('click', handleExitBtn);
    startSessionBtn.bind('click', handleStartSession);

})

