function VideochatViews(){

    var totalMediaCount = 0;
    var initialize = function(){

        $('<div/>', {id:'local-container', class:'media-layout'})
            .append('<video id=\"local-video\" autoplay playsinline controls muted>')
            .appendTo('#interpreter-video-container');

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
        $('#interpreter-room-input').css('display','none');
        $('#interpreter-video-container').css('display','grid');
        $('#interpreter-video-container').css('grid-template-columns','1fr');
        $('#interpreter-video-container').css('grid-template-rows','1fr');
    };

    this.closeMediaViews = function(){
        $('#interpreter-room-title').empty();
        $('#interpreter-video-container').fadeOut(function(){
            $('#interpreter-room-input').fadeIn( 200, function destroyCB(){
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
            .append('<video id="'+pid+'" autoplay controls>')
            .appendTo('#interpreter-video-container');
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
        $('#interpreter-video-container').css('grid-template-columns',colSize);
        $('#interpreter-video-container').css('grid-template-rows',rowSize);
        return true;
    }

    this.deletePeerMedia = function(pid){
        $('#'+pid).parent().remove();
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
        $('#interpreter-video-container').css('grid-template-columns',colSize);
        $('#interpreter-video-container').css('grid-template-rows',rowSize);
        console.log('deletePeerMedia', pid);
    }

    this.deleteAllMedia = function(){
        totalMediaCount = 0;
        $('#interpreter-video-container').empty(); 
    }

    initialize();
}
