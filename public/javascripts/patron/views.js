'use strict';

function PatronViews(){

    // Enable data message passing through websocket
    // Defaults to DataChannel p2p delivery
    let isrelay = false;
    let engine = null;

    var shiftKeyCode = {'192':'126', '49':'33', '50':'64', '51':'35', '52':'36', '53':'37', '54':'94', '55':'38', '56':'42', '57':'40', '48':'41', '189':'95', '187':'43', '219':'123', '221':'125', '220':'124', '186':'58', '222':'34', '188':'60', '190':'62', '191':'63'};
    var specialCharCode = {'8':'8', '13':'13', '32':'32', '186':'58', '187':'61', '188':'44', '189':'45', '190':'46', '191':'47', '192':'96', '219':'91', '220':'92', '221':'93', '222':'39'};

    var usewebsocket = function(e){
        e.preventDefault();
        var $lta = $('#local-ta');
        if ($('.patron-input-checkbox-wsmode').is(':checked')){
            $lta.val( $lta.val() + '\nDataChannel disabled, using WebSocket instead.\n');
            isrelay = true;
        } else {
            $lta.val( $lta.val() + '\nDataChannel enabled.\n');
            isrelay = false;
        }
    };

    this.initialize = function(p_engine){
        engine = p_engine;
        $('#patron-home').css('display','none');
        $('#patron-session-container').css('display','inline-block');
    };

    this.setVideoViews = function (){
        $('<div/>', {id:'local-container', class:'media-layout'})
            .appendTo('#patron-session-container');
        $('#local-container')
            .append('<video id=\"local-video\" autoplay playsinline controls muted>')
    };

    this.setTranscriberViews = function(){
        console.log('set views listeners');
        var clip = $('<div/>', {class:'patron-layout-options'})
            .append('<input type="text" class="patron-input-text-clip" placeholder="Paste from clipboard"/>')
            .append('<button class="patron-btn-clip" title="Send to peers" type="submit"> send </button>');
        
        var wstext = $('<div/>', {class:'patron-layout-options'})
            .append('<input type="checkbox" class="patron-input-checkbox-wsmode" value="enable">Use WebSocket</input>');

        $('#local-container')
            .append(clip)
            .append(wstext)
            .append('<textarea id=\"local-ta\" placeholder="Begin typing in real time"></textarea>')

        $('.patron-input-checkbox-wsmode').bind('change',usewebsocket);
        $('#local-ta').on('keydown', function textareaByteChar(e) {
            var sc = engine.sendChar;
            var code = (e.keyCode ? e.keyCode : e.which);
            console.log(e.type, e.which, e.keyCode);

            if( code === '37' || code === '38' || code === '39' || code === '40' ){
                e.preventDefault();
                return;
            }

            if( code    !== 16 ) {// ignore shift
                if( code >= 65 && code <= 90 ) {
                    if(!e.shiftKey){
                        code = code + 32;
                    }
                    sc(code, isrelay);
                } else if(e.shiftKey && (shiftKeyCode[code] !== undefined) ){
                    code = shiftKeyCode[code];
                    sc(code, isrelay);
                } else if(specialCharCode[code] !== undefined){
                    code = specialCharCode[code];
                    sc(code, isrelay);
                } else if ( code >= 48 && code <= 57 ) {
                    sc(code, isrelay);
                } else {
                    console.log('keycode not accepted');
                }
            }
        })
        $('.patron-btn-clip').on('click', function(event){
            var ss = engine.sendString;
            var $clipinput = $('.patron-input-text-clip');
            var word = $clipinput.val();
            if (word && word.length < 4){
                window.alert('String is too shart. Has to be longer than 3 characters.');
            } else if (word){
                ss(word, isrelay);
                $clipinput.val('');
            }
        });
    };

    // TODO destroy patron-btn-clip
    this.destroyListeners = function(){
        $('.patron-input-checkbox-wsmode').unbind('change',usewebsocket);
    };

    this.closeMediaViews = function(){
        $('#patron-title').empty();
        $('#patron-session-container').fadeOut(function(){
            $('#patron-home').fadeIn( 200, function destroyCB(){
                //destroyCallback(next);
                console.log('ending videotext views connection');
            });
        });
        this.destroyListeners();
        this.deleteAllMedia();
    };

    this.appendPeerMedia = function(pid, isTranscriberEnabled, isVideoEnabled){
        console.log('appendPeerMedia', pid);

        let media = $('<div/>', {id:'m'+pid, class:'media-layout'});
        if (isVideoEnabled && ! isTranscriberEnabled)
            media.append('<video id="v'+pid+'" autoplay controls>');

        else if (isTranscriberEnabled && ! isVideoEnabled){
            
            // Temporary to test Nodejs client media loop
            media.append('<video id="v'+pid+'" autoplay controls>');
            /////////////////////////////////////////////

            media.append('<textarea id="ta-'+pid+'" class="remote-textarea" readonly></textarea>')
        } else {
            media.append('<video id="v'+pid+'" autoplay controls>');
            media.append('<textarea id="ta-'+pid+'" class="remote-textarea" readonly></textarea>')
        }

        media.appendTo('#patron-session-container');
        var $ml = $('.media-layout');
        var percent = (100 / $ml.length);
        $ml.css('width',percent+'%');
        return true;
    }

    this.deletePeerMedia = function(pid, isTranscriberEnabled, isVideoEnabled){
        $('#m'+pid).parent().remove();
        var $ml = $('.media-layout');
        var percent = (100 / $ml.length);
        $ml.css('width',percent+'%');
        console.log('deletePeerMedia', pid);
    }

    this.deleteAllMedia = function(){
        $('#patron-session-container').empty(); 
    }

    this.updateTextArea = function(pid, bytechar){
        var $ta = $('#ta-'+pid);
        if (bytechar.length > 3){
            $ta.val( $ta.val() + '\n' + bytechar + '\n');
        } else if (bytechar === '8'){
            $ta.val( $ta.val().slice(0,-1)); 
        } else{
            var ch = String.fromCharCode(bytechar);
            $ta.val($ta.val() + ch);
        }
        $ta.scrollTop($ta[0].scrollHeight);
    }

    this.updateTitle = function(room){
        $('#patron-title').append('<p>Room: '+room+'</p>');
    }
}
