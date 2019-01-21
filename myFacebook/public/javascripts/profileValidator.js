$(() => {
    $('#atualizarPass').click(e => {
        e.preventDefault()
        if($('#oldPassword').val() == "") {
            $('#appendedData').remove()
            $('#passwordUpdate').prepend("<p id='appendedData' class='w3-center w3-text-red'> Tem que inserir a sua password antiga! </p>")
        } else if($('#newPassword').val() == "") {
            $('#appendedData').remove()
            $('#passwordUpdate').prepend("<p id='appendedData' class='w3-center w3-text-red'> Tem que inserir a password nova! </p>")
        } else if($('#confirmNewPassword').val() == "") {
            $('#appendedData').remove()
            $('#passwordUpdate').prepend("<p id='appendedData' class='w3-center w3-text-red'> Tem que confirmar a password nova! </p>")
        } else if($('#newPassword').val() != $('#confirmNewPassword').val()) {
            $('#appendedData').remove()
            $('#passwordUpdate').prepend("<p id='appendedData' class='w3-center w3-text-red'> Os campos de password nova não coincidem! </p>")
        } else {
            var dados = {
                oldPass: $('#oldPassword').val(),
                newPass: $('#newPassword').val()
            }
            var email = $('#email').val()
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/users/updatePassword/" + email,
                data: JSON.stringify(dados), 
                contentType: "application/json; charset=utf-8",
              //  dataType: "json",
                success: msg => {
                    alert(msg.info)
                    
                },
                error: function(msg) {
                    alert('error:'+JSON.stringify(msg));
                }
        
            });
        }
    })
})