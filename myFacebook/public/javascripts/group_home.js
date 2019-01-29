$(() => {
    var albumfotos = new FormData()


    $('#postType').change(e => {
        e.preventDefault()
        if ($('#receitaForm').is(':visible')) $('#receitaForm').css('display', 'none')
        if ($('#ideiaForm').is(':visible')) $('#ideiaForm').css('display', 'none')
        if ($('#desportivoForm').is(':visible')) $('#desportivoForm').css('display', 'none')
        if ($('#eventoForm').is(':visible')) $('#eventoForm').css('display', 'none')
        if ($('#eventoProfissionalForm').is(':visible')) $('#eventoProfissionalForm').css('display', 'none')
        if ($('#albumForm').is(':visible')) $('#albumForm').css('display', 'none')
        if ($('#formacaoForm').is(':visible')) $('#formacaoForm').css('display', 'none')
        if ($('#genericaForm').is(':visible')) $('#genericaForm').css('display', 'none')
        $('#' + $('#postType').val() + "Form").css('display', 'block')
        $('#hashtagsForm').css('display', 'inline')
        if ($('#postType').val() == 'none') $('#hashtagsForm').css('display', 'none')
    })

    $('#mostrarFiltros').click(e => {
        if ($('#filterDiv').is(':visible')) {
            $('#filterDiv').css('display', 'none')
            $('#mostrarFiltros').html('Mostrar área de filtragem')
        }
        else {
            $('#filterDiv').css('display', 'block')
            $('#mostrarFiltros').html('Esconder área de filtragem')
        }
    })

    $('#userSearch').click(e => {
        e.preventDefault()
        $('#searchResults').empty()
        var searchField = { campo_procura: $('#searchField').val() }
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/users/search",
            data: JSON.stringify(searchField),
            contentType: "application/json; charset=utf-8",
            //  dataType: "json",
            success: data => {
                renderSearchResults(data)
            },
            error: function (msg) {
                alert('error:' + JSON.stringify(msg));
            }
        })

    })

    function renderSearchResults(users) {
        if (users.length == 0) {
            $('#searchResults').append("<div class='w3-card-4'> <p class='w3-text-grey'> Nenhum utilizador encontrado </p> </div> ")
        } else {
            for (var i = 0; i < users.length; i++) {
                var user = users[i]
                $('#searchResults').append(
                    "<div class='w3-card-4'> " +
                    "<p style='padding: 4px;' class='w3-text-grey'> <a href='http://localhost:3000/users/homepage/" + user.email + "'>" + "<b>" + user.nome + "</b>" + " (" + user.email + ")" + " </a> <button class='addUser w3-button w3-green' id='" + user.email + "' style='padding: 1px; float: right;'>+</button> </p>"
                    + "</div> <br/> <hr>"
                )
            }
        }
    }

    $('body').on('click', '.rem-group', function () { // Make your changes here
        var id = $(this).attr('id');
        console.log("REM GROUP: " + id);
        console.log(JSON.stringify(id));
        // var content = { email: id };
        // console.log("http://localhost:3000/groups/addUser/" + $("#group_id").val());
        $.ajax({
            type: "DELETE",
            url: "http://localhost:3000/groups/" + id,
            // data: JSON.stringify(content),
            // contentType: "application/json; charset=utf-8",
            success: msg => {
                console.log("Grupo eliminado com sucesso.");
                window.location.replace("http://localhost:3000/users/homepage/" + $('#admin').val());
            },
            error: function (msg) {
                console.log("Erro na eliminação do grupo.");
                // window.location.reload(true);
            }
        })
    });

    $('body').on('click', '.addUser', function () { // Make your changes here
        var id = $(this).attr('id');
        console.log("ADD USER: " + id);
        console.log(JSON.stringify(id));
        var content = { email: id };
        console.log("http://localhost:3000/groups/addUser/" + $("#group_id").val());
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/groups/addUser/" + $("#group_id").val(),
            data: JSON.stringify(content),
            contentType: "application/json; charset=utf-8",
            success: msg => {
                console.log("Registado no grupo com sucesso.");
                window.location.reload(true);
            },
            error: function (msg) {
                console.log("Erro no registo no grupo.");
                window.location.reload(true);
            }
        })
    });

    $('body').on('click', '.remUser', function () {
        var id = $(this).attr('id');
        console.log("REM USER: " + id);
        console.log(JSON.stringify(id));
        var content = { email: id };
        console.log("http://localhost:3000/groups/remUser/" + $("#group_id").val());
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/groups/remUser/" + $("#group_id").val(),
            data: JSON.stringify(content),
            contentType: "application/json; charset=utf-8",
            success: msg => {
                console.log("Removido do grupo com sucesso.");
                if ($("#useremail").val() == $("#admin").val()) {
                    window.location.reload(true);
                }
                else {
                    window.location.replace("http://localhost:3000/users/homepage/" + id);
                }
            },
            error: function (msg) {
                console.log("Erro na remoção do grupo.");
                window.location.reload(true);
            }
        })
    });

    var numPubs = $('#numPubs').val()
    for (var i = 0; i < numPubs; i++) {
        $('#comentarios' + i).click(e => {
            e.preventDefault()
            // a variavel i já nao da o valor correto por alguma razao
            var num = $(e.target).attr("value")
            if ($('#comentarios-card' + num).is(':visible')) $('#comentarios-card' + num).css('display', 'none')
            else $('#comentarios-card' + num).css('display', 'block')
        })
        $('#comentar' + i).click(e => {
            e.preventDefault()
            // a variavel i já nao da o valor correto por alguma razao
            var nr = $(e.target).attr("value")
            var formc = document.getElementById('comentariosForm' + nr)
            var comentForm = new FormData(formc)
            var comment = comentForm.get('comentario')
            $('#comentario').val('')
            var c = {
                comentario: comment,
                idpub: comentForm.get('idpub')
            }
            ajaxPostComentario(c, nr)
        })

        $('#sharetwitter' + i).click(e => {
            var pub = $(e.target).attr("name")
            var pub_parsed = JSON.parse(pub)
            var texto = "erro"
            var tipo = 0
            if (pub_parsed.tipo == "ideia") texto = shareIdeia(pub_parsed, tipo)
            if (pub_parsed.tipo == "receita") texto = shareReceita(pub_parsed, tipo)
            if (pub_parsed.tipo == "evento") texto = shareEvento(pub_parsed, tipo)
            if (pub_parsed.tipo == "eventoProfissional") texto = shareEventoProf(pub_parsed, tipo)
            if (pub_parsed.tipo == "creditacao") texto = shareFormacao(pub_parsed, tipo)
            if (pub_parsed.tipo == "desportivo") texto = shareDesportiva(pub_parsed, tipo)
            if (pub_parsed.tipo == "album") texto = shareAlbum(pub_parsed, tipo)
            if (pub_parsed.tipo == "generica") texto = shareGenerica(pub_parsed, tipo)
        })

        $('#sharefb' + i).click(e => {
            var pub = $(e.target).attr("name")
            var pub_parsed = JSON.parse(pub)
            var texto = "erro"
            var tipo = 1
            if (pub_parsed.tipo == "ideia") texto = shareIdeia(pub_parsed, tipo)
            if (pub_parsed.tipo == "receita") texto = shareReceita(pub_parsed, tipo)
            if (pub_parsed.tipo == "evento") texto = shareEvento(pub_parsed, tipo)
            if (pub_parsed.tipo == "eventoProfissional") texto = shareEventoProf(pub_parsed, tipo)
            if (pub_parsed.tipo == "creditacao") texto = shareFormacao(pub_parsed, tipo)
            if (pub_parsed.tipo == "desportivo") texto = shareDesportiva(pub_parsed, tipo)
            if (pub_parsed.tipo == "album") texto = shareAlbum(pub_parsed, tipo)
            if (pub_parsed.tipo == "generica") texto = shareGenerica(pub_parsed, tipo)
        })

    }

    $('#adicionar').click(e => {
        e.preventDefault()
        if (validateAdicionarFoto()) {

            albumfotos.append('dataFoto', $('#dataFoto').val())
            albumfotos.append('local', $('#localFoto').val())
            albumfotos.append('foto', $('#foto')[0].files[0])

            $('#dataFoto').val('')
            $('#localFoto').val('')
            $('#foto').val('')
        }

    })

    //Falta ver para pôr os classificadores em todos os tipos de publicação!
    //No PUG, each userData.classificadores criar uma checkbox
    //Deste lado recolher cada um dos classificadores selecionados!

    $('#publicarAlbum').click(e => {
        e.preventDefault()
        var endForm = document.getElementById('albumForm')
        var endFormData = new FormData(endForm)
        if (validateAlbum(endFormData)) {
            var fotoAlbum = new FormData()
            fotoAlbum.set('data', parseDate(new Date()))
            fotoAlbum.set('tipo', 'album')
            fotoAlbum.set('origin_email', endFormData.get('origin_email'))
            fotoAlbum.set('isPrivate', endFormData.get('privacidade'))
            fotoAlbum.set('groupId', $('#group_id').val())


            var number_fotos_arr = albumfotos.getAll('dataFoto').length

            for (i = 0; i < number_fotos_arr; i++) {

                fotoAlbum.set("foto" + i, albumfotos.getAll('foto')[i])
                fotoAlbum.set("local" + i, albumfotos.getAll('local')[i])
                fotoAlbum.set("data" + i, albumfotos.getAll('dataFoto')[i])
            }

            fotoAlbum.set("nFotos", number_fotos_arr)
            fotoAlbum.set('titulo', endFormData.get('titulo'))
            fotoAlbum.set('descricao', endFormData.get('descricao'))
            fotoAlbum.set("classificacoes", getClassificacoes())
            albumfotos = new FormData() // limpar albumfotos
            ajaxPostAlbum(fotoAlbum)
        }

    })

    $('#publicarEventoProfissional').click(e => {
        e.preventDefault()
        var form = document.getElementById('eventoProfissionalForm')
        var eventoProf = new FormData(form)
        if (validateEvento(eventoProf)) {

            var evento = new FormData()
            evento.set('tipo', 'eventoProfissional')
            evento.set('origin_email', eventoProf.get('origin_email'))
            evento.set('groupId', $('#group_id').val())
            evento.set('data', parseDate(new Date()))
            evento.set('isPrivate', eventoProf.get('privacidade'))
            var oradores = eventoProf.get('oradores').split('\n')
            evento.set('titulo', eventoProf.get('titulo'))
            evento.set('local', eventoProf.get('local'))
            evento.set('dataEvento', eventoProf.get('dataEvento'))
            evento.set('oradores', oradores)
            evento.set('descricao', eventoProf.get('descricao'))
            for (var i = 0; i < $('#ficheiros')[0].files.length; ++i) {

                evento.set("ficheiro" + i, $('#ficheiros')[0].files[i])
            }
            evento.set("nfiles", i)
            evento.set("classificacoes", getClassificacoes())
            for (var pair of evento.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            ajaxPostEventoProf(evento)
        }

    })

    $('#publicarGenerica').click(e => {
        e.preventDefault()
        var form = document.getElementById('genericaForm')
        var generica = new FormData(form)
        if (validateGenerica(generica)) {
            var generica_send = new FormData()
            generica_send.set('titulo', generica.get('titulo'))
            generica_send.set('descricao', generica.get('descricao'))
            generica_send.set('tipo', 'generica')
            generica_send.set('origin_email', generica.get('origin_email'))
            generica_send.set('groupId', $('#group_id').val())
            generica_send.set('data', parseDate(new Date()))
            generica_send.set('privacidade', generica.get('privacidade'))
            for (var i = 0; i < $('#ficheirosGenerica')[0].files.length; ++i) {
                generica_send.set("ficheiro" + i, $('#ficheirosGenerica')[0].files[i])
            }
            generica_send.set("nFiles", i)
            generica_send.set("classificacoes", getClassificacoes())
            ajaxPostGenerica(generica_send)
            $('#tituloGenerica').val('')
            $('#descricaoGenerica').val('')
            $('#ficheirosGenerica').val('')
        }
    })

    $('#publicarEvento').click(e => {
        e.preventDefault()
        var form = document.getElementById('eventoForm')
        var eventoForm = new FormData(form)
        if (validateEvento(eventoForm)) {
            var convidados
            if (eventoForm.get('convidados') != "") convidados = eventoForm.get('convidados').split('\n')
            else convidados = []
            var data = {
                titulo: eventoForm.get('titulo'),
                dataEvento: eventoForm.get('dataEvento'),
                local: eventoForm.get('local'),
                descricao: eventoForm.get('descricao'),
                convidados: convidados
            }

            var data_evento = { evento: data }
            var evento = {
                dados: data_evento,
                isPrivate: eventoForm.get('privacidade'),
                data: parseDate(new Date()),
                tipo: "evento",
                origin_email: eventoForm.get('origin_email'),
                groupId: $('#group_id').val(),
                classificacoes: getClassificacoes()
            }
            ajaxPost(evento)
            $('#tituloEvento').val('')
            $('#descricaoEvento').val('')
            $('#convidados').val('')
            $('#local').val('')
            $('#dataEvento').val('')
            $('#postType').val('none')
            $('#eventoForm').css('display', 'none')
        }


    })

    $('#publicarReceita').click(e => {
        e.preventDefault()
        var form = document.getElementById('receitaForm')
        var receitaForm = new FormData(form)
        if (validateReceita(receitaForm)) {
            var ingredientes = receitaForm.get('ingredientes')
            var instrucoes = receitaForm.get('instrucoes')
            var data = ingredientes + ";" + instrucoes
            var dados = { titulo: receitaForm.get('titulo'), textoEstruturado: data }
            var data_receita = { receita: dados }
            var receita = {
                dados: data_receita,
                isPrivate: receitaForm.get('privacidade'),
                data: parseDate(new Date()),
                tipo: "receita",
                origin_email: receitaForm.get('origin_email'),
                groupId: $('#group_id').val(),
                classificacoes: getClassificacoes()
            }
            ajaxPost(receita)
            $('#tituloReceita').val('')
            $('#ingredientes').val('')
            $('#instrucoes').val('')
            $('#postType').val('none')
            $('#receitaForm').css('display', 'none')
        }

    })

    $('#publicarIdeia').click(e => {
        e.preventDefault()
        var form = document.getElementById('ideiaForm')
        var ideiaForm = new FormData(form)
        if (validateIdeia(ideiaForm)) {
            var classificadores = []
            if (ideiaForm.get('classificadores') != "") classificadores = ideiaForm.get('classificadores').split(",")
            data = {
                titulo: ideiaForm.get('titulo'),
                classificadores: classificadores,
                descricao: ideiaForm.get('descricao')
            }
            data_ideia = { ideia: data }
            var ideia = {
                dados: data_ideia,
                isPrivate: ideiaForm.get('privacidade'),
                data: parseDate(new Date()),
                tipo: "ideia",
                origin_email: ideiaForm.get('origin_email'),
                groupId: $('#group_id').val(),
                classificacoes: getClassificacoes()
            }
            ajaxPost(ideia)
            $('#tituloIdeia').val('')
            $('#descricaoIdeia').val('')
            $('#classificadores').val('')
            $('#postType').val('none')
            $('#ideiaForm').css('display', 'none')
        }

    })

    $('#publicarDesportivo').click(e => {
        e.preventDefault()
        var form = document.getElementById('desportivoForm')
        var desportivoForm = new FormData(form)
        if (validateDesportivo(desportivoForm)) {
            var desportivo = new FormData()
            desportivo.set('origin_email', desportivoForm.get('origin_email'))
            desportivo.set('groupId', $('#group_id').val())
            desportivo.set('tipo', 'desportivo')
            desportivo.set('data', parseDate(new Date()))
            desportivo.set('isPrivate', desportivoForm.get('privacidade'))

            desportivo.set('titulo', desportivoForm.get('titulo'))
            desportivo.set('atividade', desportivoForm.get('atividade'))
            desportivo.set('duracao', desportivoForm.get('duracao'))
            desportivo.set('descricao', desportivoForm.get('descricao'))
            desportivo.set('ficheiro_gpx', $('#ficheiro_gpx')[0].files[0])
            for (var i = 0; i < $('#fotos')[0].files.length; ++i) {

                desportivo.set("foto" + i, $('#fotos')[0].files[i])
            }
            desportivo.set("nFotos", i)
            desportivo.set("classificacoes", getClassificacoes())
            ajaxPostDesp(desportivo)

        }

    })

    $('#publicarFormacao').click(e => {
        e.preventDefault()
        var form = document.getElementById('formacaoForm')
        var creditacaoForm = new FormData(form)
        if (validateFormacao(creditacaoForm)) {
            var data = {
                titulo: creditacaoForm.get('titulo'),
                creditacao: creditacaoForm.get('creditacao'),
                instituicao: creditacaoForm.get('instituicao'),
                descricao: creditacaoForm.get('descricao')
            }
            var data_creditacao = { formacao: data }
            var creditacao = {
                dados: data_creditacao,
                isPrivate: creditacaoForm.get('privacidade'),
                data: parseDate(new Date()),
                tipo: "creditacao",
                origin_email: creditacaoForm.get('origin_email'),
                groupId: $('#group_id').val(),
                classificacoes: getClassificacoes()
            }
            ajaxPost(creditacao)
            $('#tituloFormacao').val('')
            $('#descricaoFormacao').val('')
            $('#creditacao').val('')
            $('#instituicao').val('')
            $('#postType').val('none')
            $('#formacaoForm').css('display', 'none')
        }
    })

    window.history.pushState("", "", "/groups/" + $('#group_id').val())
})

function getClassificacoes() {
    var classificacoes = ""
    var $boxes = $('input[name=hashtag]:checked')
    $boxes.each(function () {
        classificacoes = classificacoes + ($(this).val() + ",")
    });
    $boxes.each(function () {
        $(this).prop('checked', false)
    });
    return classificacoes
}

function parseDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var hh = date.getHours();
    var min = date.getMinutes();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    if (hh < 10) {
        hh = '0' + hh
    }

    if (min < 10) {
        min = '0' + min
    }

    date = mm + '/' + dd + '/' + yyyy + ' ' + hh + 'h:' + min + "m";
    return date
}

function validateGenerica(generica) {
    if (generica.get('titulo') == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que indicar o título da publicação! </p>')
        return false
    }
    if (generica.get('descricao') == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que indicar uma descrição do conteúdo! </p>')
        return false
    }
    return true
}

function validateAdicionarFoto() {

    if ($('#dataFoto').val() == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que escolher a data da foto! </p>')
        return false
    }
    if ($('#localFoto').val() == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que escolher o local da foto! </p>')
        return false
    }
    if ($('#foto').val() == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que escolher uma foto! </p>')
        return false
    }
    return true
}

function validateAlbum(formData) {

    if (formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#albumForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o título do seu álbum!</p>')
        return false
    }
    if (formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#albumForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição do seu álbum!</p>')
        return false
    }

    return true
}

function validateDesportivo(formData) {

    if (formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer um título para a atividade desportiva! </p>')
        return false
    }
    if (formData.get('atividade') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o tipo de atividade relacionada com esta publicação! </p>')
        return false
    }
    if (formData.get('duracao') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma duração aproximada da atividade! </p>')
        return false
    }
    if (formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição para a atividade a praticar! </p>')
        return false
    }

    return true
}

function validateEvento(formData) {

    if (formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o título do evento! </p>')
        return false
    }
    if (formData.get('local') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o local do evento! </p>')
        return false
    }
    if (formData.get('dataEvento') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer a data em que o evento irá ocorrer! </p>')
        return false
    }
    if (formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição do evento! </p>')
        return false
    }
    return true
}


function validateFormacao(formData) {

    if (formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o título da publicação! </p>')
        return false
    }
    if (formData.get('creditacao') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o nome da formação! </p>')
        return false
    }
    if (formData.get('instituicao') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o nome da instituição que o formou! </p>')
        return false
    }
    if (formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição da formação! </p>')
        return false
    }
    return true

}

function validateIdeia(formData) {

    if (formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#ideiaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório dar um título à sua ideia! </p>')
        return false
    }
    if (formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#ideiaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório descrever a sua ideia! </p>')
        return false
    }

    return true
}

function validateReceita(formData) {

    if (formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#receitaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório nomear o seu cozinhado! </p> ')
        return false
    }
    if (formData.get('ingredientes') == '') {
        $('#appendedData').remove()
        $('#receitaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer os ingredientes do seu cozinhado! </p> ')
        return false
    }
    if (formData.get('instrucoes') == '') {
        $('#appendedData').remove()
        $('#receitaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer as instruções para o seu cozinhado! </p> ')
        return false
    }
    return true
}

function ajaxPostComentario(c, nr) {
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/pubs/newComment",
        data: JSON.stringify(c),
        contentType: "application/json; charset=utf-8",
        success: msg => {
            renderComment(c.comentario, nr)
            alert("Comentário bem sucedido!")

        },
        error: function (msg) {
            alert('error:' + JSON.stringify(msg));
        }

    });
}

function renderComment(comentario, nr) {
    $('#comentarios-card-comments' + nr).append(
        "<p class='w3-small'> <b> " + $('#emailUser').val() + ": </b>" + comentario + "</p> <hr/>"
    )
}

function ajaxPost(pub) {
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/pubs/newPub",
        data: JSON.stringify(pub),
        contentType: "application/json; charset=utf-8",
        //  dataType: "json",
        success: msg => {
            //addToPage(pub)
            alert("Publicação bem sucedida!")
            window.location.reload(true)
        },
        error: function (msg) {
            alert('error:' + JSON.stringify(msg));
        }

    });
}

function ajaxPostGenerica(pub) {
    $.ajax({
        type: "POST",
        enctype: "form/multipart",
        processData: false,
        contentType: false,
        url: "http://localhost:3000/pubs/newGenerica",
        data: pub,
        success: f => {
            alert("Publicação bem sucedida!")
            window.location.reload(true)
        },
        error: e => {
            alert('Erro no post: ' + JSON.stringify(e))
            console.log('Erro no post: ' + e)
        }
    })
}

function ajaxPostEventoProf(pub) {
    $.ajax({
        type: "POST",
        enctype: "form/multipart",
        processData: false,
        contentType: false,
        url: "http://localhost:3000/pubs/newEventoProf",
        data: pub,
        success: f => {
            alert("Publicação bem sucedida!")
            window.location.reload(true)
        },
        error: e => {
            alert('Erro no post: ' + JSON.stringify(e))
            console.log("Erro no post: " + e)
        }
    })
}

function ajaxPostDesp(pub) {
    $.ajax({
        type: "POST",
        enctype: "form/multipart",
        processData: false,
        contentType: false,
        url: "http://localhost:3000/pubs/newDesp",
        data: pub,
        success: f => {
            alert("Publicação bem sucedida!")
            window.location.reload(true)
        },
        error: e => {
            alert('Erro no post: ' + e)
            console.log("Erro no post: " + e)
        }
    })

}

function ajaxPostAlbum(pub) {
    $.ajax({
        type: "POST",
        enctype: "form/multipart",
        processData: false,
        contentType: false,
        url: "http://localhost:3000/pubs/newAlbum",
        data: pub,
        success: f => {
            alert("Publicação bem sucedida!")
            window.location.reload(true)
        },
        error: e => {
            alert('Erro no post: ' + e)
            console.log("Erro no post: " + e)
        }
    })
}


function classifiersString(classificadores) {
    var returnString = ""
    for (var i = 0; i < classificadores.length; i++) {
        returnString += "<span class='w3-tag'> " + classificadores[i] + "</span> <span> &nbsp; </span>"
    }
    return returnString
}

function renderHashTagsAndDate(classificacoes, data) {
    var returnString = ""
    classificacoes = classificacoes.split(",")
    for (var i = 0; i < classificacoes.length - 1; i++) {
        returnString += "<span class='w3-tag w3-yellow'> " + classificacoes[i] + "</span> <span> &nbsp; </span>"
    }
    returnString += "<p class='w3-tiny'> Publicado em " + data + "</p>"
    return returnString
}

function renderConvidados(convidados) {
    var returnString = ""
    for (var i = 0; i < convidados.length; i++) {
        returnString += "<p class='w3-tiny'> " + convidados[i] + "</p>"
    }
    return returnString
}

function shareIdeia(pub_parsed, tipo) {

    var texto = "Tive uma ideia: " + pub_parsed.dados.ideia.titulo + "\n" + pub_parsed.dados.ideia.descricao + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    for (var hashtag in pub_parsed.dados.ideia.classificadores) texto = texto + "#" + pub_parsed.dados.ideia.classificadores[hashtag]
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1)
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}

function shareReceita(pub_parsed, tipo) {

    var texto = "Receita: " + pub_parsed.dados.receita.titulo + "\n" + pub_parsed.dados.receita.textoEstruturado + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}
function shareEvento(pub_parsed, tipo) {

    var texto = pub_parsed.dados.evento.titulo + " decorrerá em " + pub_parsed.dados.evento.dataEvento + " em " + pub_parsed.dados.evento.local
    texto = texto + "\n" + pub_parsed.dados.evento.descricao + "\nEstão convidados :\n " + pub_parsed.dados.evento.convidados.toString().replace(/,/g, " ") + "\n"

    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}
function shareFormacao(pub_parsed, tipo) {

    var texto = pub_parsed.dados.formacao.titulo + "\nRecebi a creditação: " + pub_parsed.dados.formacao.creditacao + " da instituição " + pub_parsed.dados.formacao.instituicao + "\n" + pub_parsed.dados.formacao.descricao + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}
function shareAlbum(pub_parsed, tipo) {

    var texto = "Album: " + pub_parsed.dados.album.titulo + "\n" + pub_parsed.dados.album.descricao + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    for (var foto in pub_parsed.dados.album.fotos) texto = texto + "\n" + pub_parsed.dados.album.fotos[foto].foto
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}
function shareDesportiva(pub_parsed, tipo) {

    var texto = pub_parsed.dados.desportivo.titulo + "\nPratiquei " + pub_parsed.dados.desportivo.atividade + " durante " + pub_parsed.dados.desportivo.duracao + "\n" + pub_parsed.dados.desportivo.descricao + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    for (var foto in pub_parsed.dados.desportivo.fotos) texto = texto + "\n" + pub_parsed.dados.desportivo.fotos[foto]
    texto = texto + "\n" + pub_parsed.dados.desportivo.ficheiro_gpx
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}
function shareEventoProf(pub_parsed, tipo) {

    var texto = "O evento : " + pub_parsed.dados.eventoProfissional.titulo + " decorrerá em " + pub_parsed.dados.eventoProfissional.dataEvento + " no " + pub_parsed.dados.eventoProfissional.local + "\n" + pub_parsed.dados.eventoProfissional.descricao + "\n"
    var texto = texto + "Com os seguintes oradores : \n " + pub_parsed.dados.eventoProfissional.oradores.toString().replace(/,/g, " ") + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    for (var foto in pub_parsed.dados.eventoProfissional.ficheiros) texto = texto + "\n" + pub_parsed.dados.eventoProfissional.ficheiros[foto]
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}

function shareGenerica(pub_parsed, tipo) {
    var texto = "Título: " + pub_parsed.dados.generica.titulo + "\n"
    texto = texto + "Descrição: " + pub_parsed.dados.generica.descricao + "\n"
    for (var hashtag in pub_parsed.classificacoes) texto = texto + "#" + pub_parsed.classificacoes[hashtag]
    for (var ficheiro in pub_parsed.dados.generica.ficheiros) texto = texto + "\n" + pub_parsed.dados.generica.ficheiros[ficheiro].url
    if (tipo == 0) //twitter
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(texto));
    if (tipo == 1) //face
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://google.pt&quote=' + encodeURIComponent(texto));
}