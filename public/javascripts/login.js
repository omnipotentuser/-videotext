$(document).ready(function(){

    console.log("login console")

    /*
    $("#login-form").submit(function(event){
        event.preventDefault();
        var post_url = $(this).attr('action');
        var request_method = $(this).attr('method');
        var form_data = $(this).serialize();

        $.ajax({
            url: post_url,
            type: request_method,
            data : form_data,
            error: function(data){
                console.log('error: '+JSON.stringify(data.msg));
            },
            success: function(data){
                console.log('login result: '+data.msg);
                //$('#login-form').hide();
                //$("#student-data-container").show();
            }
        });
        return false;
    });

    $("#logout").click(function(event){
        event.preventDefault();
        var post_url = "/logout";
        var request_method = "GET";
        var form_data = "";

        $.ajax({
            url: post_url,
            type: request_method,
            data : form_data,
            error: function(data){
                console.log('error: '+JSON.stringify(data.msg));
            },
            success: function(data){
                console.log('logout success');
                //$("#student-data-container").hide();
                //$('#login-form').show();
            }
        });

    });
    */
});
