$(document).ready(function(){
    console.log('register script loaded.');
    $("#register-form").submit(function(event){
        event.preventDefault();
        console.log('submitted new login account');

        var post_url = $(this).attr('action');
        var request_method = $(this).attr('method');
        var form_data = $(this).serialize();

        console.log('%s, %s, %s', post_url, request_method, form_data);

        $.ajax({
            url: post_url,
            type: request_method,
            data: form_data,
            error: function(data){
                console.log('error: '+JSON.stringify(data));
            },
            success: function(data){
                console.log('submit result: ' + data.msg);
                if (data.msg === 'success'){
                    window.alert('Successful submitting data');
                    location.reload();
                } else {
                    window.alert('Failed to submit');
                }
            }
        });
        /*
        $('#register-submit-modal').show();
        $('#gm-first-name').html($('#g-first-name').val());
        $('#gm-last-name').html($('#g-last-name').val());
        */
    });

    $("#register-submit-close").click(function(){
        $("#register-submit-modal").hide(200);
    });
});
