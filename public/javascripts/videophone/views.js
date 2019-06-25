function VideochatViews(){

    var initialize = function(){

        $('<div/>', {id:'local-container', class:'media-layout'})
            .append('<video id=\"local-video\" autoplay playsinline controls muted>')
            .appendTo('#videochat-video-container');

        var $input = $('#roomnameinput');
        $input.focus();
        $input.keypress(function(event){
            if (event.which === 13){
                event.preventDefault();
                $('#joinroombtn').trigger("click");
            }
        });
    };

    this.setListeners = function(engine){
        console.log('set views listeners');
    };

    this.openMediaViews = function(){
        $('#videochat-room-input').css('display','none');
        $('#videochat-video-container').css('display','inline-block');
    };

    this.closeMediaViews = function(){
        $('#videochat-room-title').empty();
        $('#videochat-video-container').fadeOut(function(){
            $('#videochat-room-input').fadeIn( 200, function destroyCB(){
                //destroyCallback(next);
                console.log('ending videotext views connection');
            });
        });
        this.deleteAllMedia();
    };

    this.appendPeerMedia = function(pid){
        console.log('appendPeerMedia', pid);
        $('<div/>', {class:'media-layout'})
            .append('<video id="'+pid+'" autoplay controls>')
            .appendTo('#videochat-video-container');
        var $ml = $('.media-layout');
        var percent = (100 / $ml.length);
        $ml.css('width',percent+'%');
    }

    this.deletePeerMedia = function(pid){
        $('#'+pid).parent().remove();
        var $ml = $('.media-layout');
        var percent = (100 / $ml.length);
        $ml.css('width',percent+'%');
        console.log('deletePeerMedia', pid);
    }

    this.deleteAllMedia = function(){
        $('#videochat-video-container').empty(); 
    }

    this.updateTitle = function(room){
        $('#videochat-room-title').append('<p>Room: '+room+'</p>');
    }

    initialize();
}
