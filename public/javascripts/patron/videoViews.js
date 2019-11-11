function VideochatViews(){

    var totalMediaCount = 0;
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
        totalMediaCount++;
        $('#videochat-room-input').css('display','none');
        $('#videochat-video-container').css('display','grid');
        $('#videochat-video-container').css('grid-template-columns','1fr');
        $('#videochat-video-container').css('grid-template-rows','1fr');
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
        //var $ml = $('.media-layout');
        //var percent = (100 / $ml.length);
        //$ml.css('width',percent+'%');

        totalMediaCount++;
        if (totalMediaCount > 4) return false;

        $("<div>", {class: 'media-layout'})
            .append('<video id="v'+pid+'" autoplay controls>')
            .appendTo('#videochat-video-container');
        var colSize, rowSize;
        if (totalMediaCount == 2){
            colSize = "1fr 1fr";
            rowSize = "1fr";
            $('video').css('height','100vh');
        } else if (totalMediaCount == 3){
            colSize = "1fr 1fr 1fr";
            rowSize = "1fr";
            $('video').css('height','100vh');
        } else if (totalMediaCount == 4){
            colSize = "1fr 1fr";
            rowSize = "1fr 1fr";
            $('video').css('height','50vh');
        } else {
            colSize = "1fr";
            rowSize = "1fr";
            $('video').css('height','100vh');
        }
        $('#videochat-video-container').css('grid-template-columns',colSize);
        $('#videochat-video-container').css('grid-template-rows',rowSize);
        return true;
    }

    this.deletePeerMedia = function(pid){
        $('#v'+pid).parent().remove();
        //var $ml = $('.media-layout');
        //var percent = (100 / $ml.length);
        //$ml.css('width',percent+'%');
        totalMediaCount--;
        var colSize, rowSize;
        if (totalMediaCount == 1){
            colSize = "1fr";
            rowSize = "1fr";
            $('video').css('height','100vh');
        } else if (totalMediaCount == 2){
            colSize = "1fr 1fr";
            rowSize = "1fr";
            $('video').css('height','100vh');
        } else if (totalMediaCount == 3){
            colSize = "1fr 1fr 1fr";
            rowSize = "1fr";
            $('video').css('height','100vh');
        } else {
            colSize = "1fr 1fr";
            rowSize = "1fr 1fr";
            $('video').css('height','50vh');
        }
        $('#videochat-video-container').css('grid-template-columns',colSize);
        $('#videochat-video-container').css('grid-template-rows',rowSize);
        console.log('deletePeerMedia', pid);
    }

    this.deleteAllMedia = function(){
        totalMediaCount = 0;
        $('#videochat-video-container').empty(); 
    }

    initialize();
}
