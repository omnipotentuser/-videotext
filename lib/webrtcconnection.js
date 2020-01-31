'use strict';

const RtcPeerConnection = require('wrtc').RTCPeerConnection;

const wrtcclient = function(p_sock, p_pid, p_room){
    const socket = p_sock;
    const peerid = p_pid;
    let roomname = p_room;

    const peerConnection = new RTCPeerConnection({
        sdpSemantics: 'unified-plan'
    });

    const audioTransceiver = peerConnection.addTransceiver('audio');
    const videoTransceiver = peerConnection.addTransceiver('video');
    audioTransceiver.sender.replaceTrack(audioTransceiver.receiver.track);
    videoTransceiver.sender.replaceTrack(videoTransceiver.receiver.track);

    const onIceConnectionStateChange = () => {
        console.log('iceconnectionstatechange state: ' + peerConnection.iceConnectionState);
    }

    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);
    
    this.addIceCandidate = async candidate => {
        await peerConnection.addIceCandidate(candidate);
    }

    this.doOffer = async () => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        try {
            await waitUntilIceGatheringStateComplete(peerConnection);
        } catch (error){
            this.close();
            throw error;
        }
    }

    // onIceCandidate event

    this.applyAnswer = async answer => {
        await peerConnection.setRemoteDescription(answer);
    };

    this.close = () => {
        peerConnection.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange);
        peerConnection.close();

    };

    this.toJSON = () => {
        return {
            iceConnectionState: this.iceConnectionState,
            localDescription: this.localDescription,
            remoteDescription: this.remoteDescription,
            signalingState: this.signalingState
        }
    };

    Object.defineProperties(this, {
        iceConnectionState: {
            get() {
                return peerConnection.iceConnectionState;
            }
        },
        localDescription: {
            get(){
                return descriptionToJSON(peerConnection.localDescription);
            }
        },
        remoteDescription: {
            get(){
                return descriptionToJSON(peerConnection.remoteDescription);
            }
        },
        signalingState: {
            get(){
                return peerConnection.signalingState;
            }
        }
    });
}

function descriptionToJSON(description, shouldDisableTrickleIce){
    return !description ? {} : {
        type: description.type,
        sdp: shouldDisableTrickleIce ? disableTrickleIce(description.sdp) : description.sdp
    };
}


function disableTrickleIce(sdp){
    return sdp.replace(/\r\na=ice-options:trickle/g, '');
}


async function waitUntilIceGatheringStateComplete(peerConnection){
    if (peerConnection.iceGatheringState === 'complete'){
        return;
    }
    
    function onIceCandidate({ candidate }){
        if (!candidate){
            return;
        } else {
            const message = {
                room: this.roomname,
                candidate: candidate,
                to_id: this.peerid
            };

            socket.emit('candidate', message);
        }
    }

    peerConnection.addEventListener('icecandidate', onIceCandidate);

}

module.exports = {
    wrtcclient: wrtcclient
};
