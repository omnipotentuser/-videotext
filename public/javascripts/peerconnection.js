/* globals RTCIceCandidate:true, RTCPeerConnection:true, RTCSessionDescription:true */

function logError(error) {
    console.log('error: ' + error.name);
}

function Peer(p_socket, p_id, p_roomName, iceConfig) {
    var pc = null,
        peerid = p_id,
        onByteChar = null,
        dc = null,
        bufferedData = '',
        socket = p_socket,
        localStream = null,
        roomName = p_roomName,
        ice_config = {iceServers:[iceConfig]},
       	//ice_config = {iceServers:[iceConfig], iceTransportPolicy: "relay"},
        credentials = [];

    var policy = location.search.split('policy=')[1] ? location.search.split('policy=')[1] : "";
    console.log('Have ICE transport policy? ', policy);
    console.log('Peer() ice_config: ', ice_config);
    if (ice_config){
        //console.log('choosing turn server from post');
        credentials = ice_config;
    } else {
	console.log('WARNING: ICE Config empty');
        credentials = [{}] /* empty ICE config */
    }

    this.getid = function () {
        return (peerid);
    };

    this.hasPC = function () {
        return (pc) ? true : false ;
    }

    this.close = function(){
        if (pc) pc.close();
        if (dc) dc.close();
    };

    this.buildClient = function(stream, bytecharCallback, requestType){
	console.log('buildClient: ice config - ', credentials);
        pc = new RTCPeerConnection(credentials);
        pc.ontrack = onTrack;
        pc.onicecandidate = onIceCandidate;
        pc.oniceconnectionstatechange = onIceConnectionStateChange;
        pc.onnegotiationneeded = onNegotiationNeeded;
        pc.onremovestream = onRemoveStream;
        pc.onsignalingstatechange = onSignalingStateChange;
        if (requestType === 'offer'){
                dc = pc.createDataChannel('chat'. dataChannelOptions);
                dc.onerror = onDCError;
                dc.onmessage = onDCMessage;
                dc.onopen = onDCOpen;
                dc.onclose = onDCClose;
                console.log('readyState', dc.readyState);
        } else {
            pc.ondatachannel = onCreateDataChannel;
            console.log('DataChannel - listening');
        }

        onByteChar = bytecharCallback;

        if (stream){
            localStream = stream;
	        pc.addStream(localStream);
        }else{
            window.alert('Media device (camera) not found!');
        }
    };

    var onDCError = function (err){
        console.log('data channel error:', err);
    };

    var onDCMessage = function(event){
        if (onByteChar && peerid){
            if (event.data === '\n'){
                var message = {
                    from_id: peerid,
                    code: bufferedData //event.data
                };
                //console.log('onDCMessage - completed',message.code);
                onByteChar(message);
                bufferedData = '';
            } else {
                bufferedData += event.data;
                //console.log('onDCMessage buff', bufferedData);
                //console.log('onDCMessage data', event.data);
            }
        }
    };

    var onDCOpen = function(event){
        console.log('the data channel is opened');
    };

    var onDCClose = function(){
        console.log('the data channel is closed');
    };

    // since we are not setting any value, it defaults to reliable
    var dataChannelOptions = {
    };

    var onTrack = function(evt) {
        console.log('onTrack connecting stream to object: ' + peerid);
        let remoteVideoDom = document.querySelector('#v'+peerid);
        remoteVideoDom.srcObject = evt.streams[0];
    };

    var onIceCandidate = function(evt){

        var cand = evt.candidate;
        if(!cand) return;

        if (cand){
            if (typeof policy != "undefined" && policy != null && policy == "relay"){
                if(cand.candidate.indexOf('typ relay') == -1){
                    console.log('omitting candidate: ', cand.candidate);
                } else {
                    var message = {
                        room: roomName,
                        candidate:cand,
                        to_id: peerid
                    };
                    console.log('sending candidate: ', message.candidate.candidate);
                    socket.emit('candidate', message);
                }
            } else {
                var message = {
                    room: roomName,
                    candidate:cand,
                    to_id: peerid
                };
                console.log('sending candidate', message.candidate.candidate);
                socket.emit('candidate', message);
            }
        }
    };

    var onIceConnectionStateChange = function(){
        console.log('onIceConnectionStateChange state: ' + pc.iceConnectionState);
    };

    var onNegotiationNeeded = function(){
        console.log('onNegotiationNeeded');
    };

    var onRemoveStream = function(evt){
        console.log('onRemoveStream '+evt);
    };

    var onSignalingStateChange = function(){
        console.log('onSignalingStateChange: ' + pc.signalingState);
    };

    this.addIceCandidate = function (p_candidate) {
        if(pc){
	        pc.addIceCandidate(p_candidate);
        } else {
	        console.log('No peer candidate instance');
        }
    };

    var localDescCreated = function(desc){
        if(pc.signalingState === 'closed')
	        return;
        pc.setLocalDescription(desc, function() {
            var message = {
                room: roomName,
                sdp: pc.localDescription,
                to_id: peerid
            };
            socket.emit('sdp', message)
        }, logError);
    };

    var onCreateDataChannel = function(event){
        if (dc && dc.readyState !== 'closed'){
            console.log('dataChannel channel already created');
        } else {
            dc = event.channel;
            dc.onmessage = onDCMessage;
            dc.onopen = onDCOpen;
            dc.onclose = onDCClose;
            console.log('DataChannel remote connection status', dc.readyState);
        }
    };

    this.peerCreateOffer = function () {

        console.log('peerCreateOffer called');
        pc.createOffer(localDescCreated, logError); 

    };

    this.setRemoteDescription = function (p_remote_sdp) {
        console.log('setRemoteDescription signalingState ' + pc.signalingState);
        pc.setRemoteDescription(new RTCSessionDescription(p_remote_sdp), function () {
            if(pc.remoteDescription.type === 'offer') {
                console.log('createAnswer to remote sdp offer');
                pc.createAnswer(localDescCreated, logError);
            }
        }, logError);
    };

    this.sendData = function(byteChar){
        if (dc && dc.readyState.toLowerCase() === 'open'){
            //console.log('datachannel sending',byteChar);
            var delay = 10;
            var charSlice = 10000;
            var termChar = '\n';
            var dataSent = 0;
            var intervalId = 0;

            if (byteChar.isNaN){
                intervalId = setInterval(function(){
                    slideEndIndex = dataSent + charSlice;
                    if (slideEndIndex > byteChar.length){
                        slideEndIndex = byteChar.length;
                    } 
                    dc.send(byteChar.slice(dataSent, slideEndIndex));
                    dataSent = slideEndIndex;
                    if (dataSent + 1 > byteChar.length) {
                        //console.log('All data chunks sent.');
                        dc.send(termChar);
                        clearInterval(intervalId);
                    }
                }, delay);
            } else {
                dc.send(byteChar);
                dc.send('\n');
            }
        } else {
            console.log('DataChannel not ready');
        }
    };
}
