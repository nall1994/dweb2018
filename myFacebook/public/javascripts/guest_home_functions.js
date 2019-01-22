$(() => {
    $('#addToFavorites').click(e => {
        e.preventDefault()
        var dados = {favoriteEmail: $('#favoriteEmail').val(), favoriteNome: $('#favoriteNome').val()}
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/users/addToFavorites",
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
    })
})