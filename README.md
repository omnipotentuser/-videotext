# videotext

### reading materials ###
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API">WebRTC API</a>

<a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia">getUserMedia</a>

<a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack">Media onTrack</a>

<a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer">RTCIceServer</a>

<a href="https://webrtchacks.com/guide-to-safari-webrtc/">Guide to Safari WebRTC</a>

<a href="https://guide.meteor.com/mobile.html">Meteor Cordova Integration for Mobile Development</a>

<a href="https://github.com/BasqueVoIPMafia/cordova-plugin-iosrtc">Cordova IOS plugin</a>

<a href="https://cloud.google.com/speech-to-text/docs/">Speech-to-text</a>



### usage ###
This project is a simple, intuitive implementation of a videochat WebRTC app with a login system and psql (although you are free to devise your own database). 

Each party layout with the local video and all peers (remote) comes with text box below each video. In your local video, begin typing in the textbox and the characters will be sent REAL TIME to all other users end where your video appears.

Pasting a string of words to be sent to peers will not work where you normally would text type. To send a block or string of characters at once, you need to use the *paste clipboard* textbox.

### planned ###

* Up to 4-Way Video+Audio connection meshed

* ACD support for Customer Support

* Streaming Speech-to-text transcriber

* text-to-speech transcribing

* text-to-text translation


### issues ###
if your osx internal camera hangs:

`sudo killall VDCAssistant`
