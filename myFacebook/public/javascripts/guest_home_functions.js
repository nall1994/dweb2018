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

    $('#guest-mostrarFiltros').click(e => {
        if($('#guest-filterDiv').is(':visible')) {
            $('#guest-filterDiv').css('display','none')
            $('#guest-mostrarFiltros').html('Mostrar área de filtragem')
        } 
        else {
            $('#guest-filterDiv').css('display','block')
            $('guest-#mostrarFiltros').html('Esconder área de filtragem')
        }
    })

    var numPubs = $('#guest-numPubs').val()
    for(var i=0;i<numPubs;i++){
        $('#guest-comentarios'+i).click(e => {
            e.preventDefault()
            // a variavel i já nao da o valor correto por alguma razao
            var num=$(e.target).attr("value")
            if( $('#guest-comentarios-card'+num).is(':visible') ) $('#guest-comentarios-card'+num).css('display','none')
            else $('#guest-comentarios-card'+num).css('display','block')
        })
        $('#guest-comentar'+i).click(e => {
            e.preventDefault()
            // a variavel i já nao da o valor correto por alguma razao
            var nr=$(e.target).attr("value")
            var formc = document.getElementById('guest-comentariosForm'+nr)
            var comentForm = new FormData(formc)
            var comment =comentForm.get('comentario')
            $('#guest-comentario').val('')
            var c = {
                comentario:comment,
                idpub : comentForm.get('idpub')
            }
            ajaxPostComentario(c,nr)
        })
    }

    function ajaxPostComentario(c,nr){
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/pubs/newComment",
            data: JSON.stringify(c), 
            contentType: "application/json; charset=utf-8",
            success: msg => {
                renderComment(c.comentario,nr)
                alert("Comentário bem sucedido!")
                
            },
            error: function(msg) {
                alert('error:'+JSON.stringify(msg));
            }
    
        });
    }
    
    function renderComment(comentario,nr) {
        $('#guest-comentarios-card-comments'+nr).append(
            "<p class='w3-small'> <b> " + $('#guest-emailUser').val() + ": </b>" + comentario + "</p> <hr/>"
        )
    }

    window.history.pushState("","","/users/homepage/" + $('#guest-useremail').val())
})