$(() => {
    var album = new FormData()
    var counter = 0
    $('#postType').change(e => {
        e.preventDefault()
        if($('#receitaForm').is(':visible')) $('#receitaForm').css('display','none')
        if($('#ideiaForm').is(':visible')) $('#ideiaForm').css('display','none')
        if($('#desportivoForm').is(':visible')) $('#desportivoForm').css('display','none')
        if($('#eventoForm').is(':visible')) $('#eventoForm').css('display','none')
        if($('#eventoProfissionalForm').is(':visible')) $('#eventoProfissionalForm').css('display','none')
        if($('#albumForm').is(':visible')) $('#albumForm').css('display','none')
        if($('#formacaoForm').is(':visible')) $('#formacaoForm').css('display','none')
        $('#' + $('#postType').val() + "Form").css('display','block')
        $('#hashtagsForm').css('display','inline')
        if ($('#postType').val()=='none') $('#hashtagsForm').css('display','none')
    })

    $('#adicionar').click(e => {
        e.preventDefault()
        if(validateAdicionarFoto()) {
            if(counter == 0) {
                var form = document.getElementById('albumForm')
                album = new FormData(form)
                counter++
            } 
            else {
                album.append('dataFoto', $('#dataFoto'))
                album.append('local',$('#localFoto'))
                album.append('foto',$('#foto'))
                counter++
            }
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
        if(validateAlbum(endFormData)) {
            var fotoAlbum = new FormData()
            fotoAlbum.set('data',parseDate(new Date()))
            fotoAlbum.set('tipo','album')
            fotoAlbum.set('origin_email',album.get('origin_email'))
            fotoAlbum.set('isPrivate',endFormData.get('privacidade'))
            var fotos = new Array()
            var number_fotos_arr = album.get('foto')
            for(i=0; i< number_fotos_arr.length; i++){
                var obj = {dataFoto: album.get('dataFoto')[i], local: album.get('local')[i], foto: number_fotos_arr[i]}
                fotos.push(obj)
            }
            var data = {titulo: endFormData.get('titulo'), descricao: endFormData.get('descricao'),fotos: fotos}
            fotoAlbum.set('dados', data)
            ajaxPost(album)
        }
        
    })

    $('#publicarEventoProfissional').click(e => {
        e.preventDefault()
        var form = document.getElementById('eventoProfissionalForm')
        var eventoProf = new FormData(form)
        if(validateEvento(eventoProf)) {
            var evento = new FormData()
            evento.set('tipo','eventoProfissional')
            evento.set('origin_email',eventoForm.get('origin_email'))
            evento.set('data',parseDate(new Date()))
            evento.set('isPrivate',eventoProf.get('privacidade'))
            var oradores = eventoProf.get('oradores').split('\n')
            var data = {titulo: eventoProf.get('titulo'), local: eventoProf.get('local'), dataEvento: parseDate(eventoProf.get('dataEvento')), oradores: oradores, descricao: descricao, ficheiros: eventoForm.get('ficheiros') }
            evento.set('dados', data)
            ajaxPost(evento)
        }
        
    })

    $('#publicarEvento').click(e => {
        e.preventDefault()
        var form = document.getElementById('eventoForm')
        var eventoForm = new FormData(form)
        if(validateEvento(eventoForm)) { 
            var convidados 
            if (eventoForm.get('convidados') !="") convidados =  eventoForm.get('convidados').split('\n')
            else convidados=[]
            var data = {
                titulo:eventoForm.get('titulo'),
                dataEvento:eventoForm.get('dataEvento') ,
                local: eventoForm.get('local') ,
                descricao: eventoForm.get('descricao'),
                convidados: convidados
            }

            var data_evento={evento: data}
            var evento = {
                dados:data_evento,
                isPrivate:eventoForm.get('privacidade'),
                data:parseDate(new Date()),
                tipo:"evento",
                origin_email: eventoForm.get('origin_email'),
                classificacoes : getClassificacoes()
            }
            ajaxPost(evento)
        }
        
    })

    $('#publicarReceita').click(e => {
        e.preventDefault()
        var form = document.getElementById('receitaForm')
        var receitaForm = new FormData(form)
        if(validateReceita(receitaForm)) {
            var ingredientes = receitaForm.get('ingredientes')
            var instrucoes = receitaForm.get('instrucoes')
            var data = ingredientes + ";" + instrucoes
            var dados = {titulo: receitaForm.get('titulo'), textoEstruturado: data}
            var data_receita = {receita:dados}
            var receita = {
                            dados:data_receita,
                            isPrivate:receitaForm.get('privacidade'),
                            data:parseDate(new Date()),
                            tipo:"receita",
                            origin_email: receitaForm.get('origin_email'),
                            classificacoes : getClassificacoes()
                        }
            ajaxPost(receita)
        }
        
    })

    $('#publicarIdeia').click(e =>  {
        e.preventDefault()
        var form = document.getElementById('ideiaForm')
        var ideiaForm = new FormData(form)
        if(validateIdeia(ideiaForm)) { 
            var classificadores = []
            if (ideiaForm.get('classificadores') !="") classificadores = ideiaForm.get('classificadores').split(",")
            data = {
                    titulo : ideiaForm.get('titulo'),
                    classificadores: classificadores,
                    descricao:ideiaForm.get('descricao') 
                }            
            data_ideia ={ideia: data}
            var ideia = {
                dados:data_ideia,
                isPrivate:ideiaForm.get('privacidade'),
                data:parseDate(new Date()),
                tipo:"ideia",
                origin_email: ideiaForm.get('origin_email'),
                classificacoes : getClassificacoes()
            }
            ajaxPost(ideia)
        }
        
    })

    $('#publicarDesportivo').click(e => {
        e.preventDefault()
        var form = document.getElementById('desportivoForm')
        var desportivoForm = new FormData(form)
        if(validateDesportivo(desportivoForm)) {
            var desportivo = new FormData()
            desportivo.set('origin_email',desportivoForm.get('origin_email'))
            desportivo.set('tipo','desportivo')
            desportivo.set('data', parseDate(new Date()))
            desportivo.set('isPrivate',desportivoForm.get('privacidade'))
            var data = {titulo: desportivoForm.get('titulo'), atividade: desportivoForm.get('atividade'), duracao: desportivoForm.get('duracao'),descricao: desportivoForm.get('descricao'), fotos: desportivoForm.get('fotos'), ficheiro_gpx: desportivoForm.get('ficheiro_gpx')}
            desportivo.set('dados',data)
            ajaxPost(desportivo)
        }
        
    })

    $('#publicarFormacao').click(e => {
        e.preventDefault()
        var form = document.getElementById('formacaoForm')
        var creditacaoForm = new FormData(form)
        if(validateFormacao(creditacaoForm)) { 
            var data = {
                titulo: creditacaoForm.get('titulo'),
                creditacao: creditacaoForm.get('creditacao'),
                instituicao: creditacaoForm.get('instituicao'),
                descricao: creditacaoForm.get('descricao')
            }
            var data_creditacao={formacao: data}
            var creditacao = {
                dados:data_creditacao,
                isPrivate:creditacaoForm.get('privacidade'),
                data:parseDate(new Date()),
                tipo:"creditacao",
                origin_email: creditacaoForm.get('origin_email'),
                classificacoes : getClassificacoes()
            }
            ajaxPost(creditacao)
        }
        
    })
})

function getClassificacoes(){
    var classificacoes = ""
    var $boxes = $('input[name=hashtag]:checked')
    $boxes.each(function(){
        classificacoes= classificacoes+( $(this).val() +",")
    });
    return classificacoes
}

function parseDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    date = mm + '/' + dd + '/' + yyyy;
    return date
}

function validateAdicionarFoto() {
    
    if($('#dataFoto').val() == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que escolher a data da foto! </p>')
        return false
    }
    if($('#localFoto').val() == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que escolher o local da foto! </p>')
        return false
    }
    if($('#foto').val() == '') {
        $('#appendedData').remove()
        $('#bPar').append('<p id="appendedData" class="w3-center w3-text-red"> Tem que escolher uma foto! </p>')
        return false
    }
    return true
}

function validateAlbum(formData) {

    if(formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#albumForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o título do seu álbum!</p>')
        return false
    }
    if(formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#albumForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição do seu álbum!</p>')
        return false
    }

    return true
}

function validateDesportivo(formData) {

    if(formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer um título para a atividade desportiva! </p>')
        return false
    }
    if(formData.get('atividade') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o tipo de atividade relacionada com esta publicação! </p>')
        return false
    }
    if(formData.get('duracao') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma duração aproximada da atividade! </p>')
        return false
    }
    if(formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#desportivoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição para a atividade a praticar! </p>')
        return false
    }

    return true
}

function validateEvento(formData) {

    if(formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o título do evento! </p>')
        return false
    }
    if(formData.get('local') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o local do evento! </p>')
        return false
    }
    if(formData.get('dataEvento') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer a data em que o evento irá ocorrer! </p>')
        return false
    }
    if(formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#eventoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição do evento! </p>')
        return false
    }
    return true
}


function validateFormacao(formData) {

    if(formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o título da publicação! </p>')
        return false
    }
    if(formData.get('creditacao') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o nome da formação! </p>')
        return false
    }
    if(formData.get('instituicao') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer o nome da instituição que o formou! </p>')
        return false
    }
    if(formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#formacaoForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer uma descrição da formação! </p>')
        return false
    }
    return true

}

function validateIdeia(formData) {

    if(formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#ideiaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório dar um título à sua ideia! </p>')
        return false
    }
    if(formData.get('descricao') == '') {
        $('#appendedData').remove()
        $('#ideiaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório descrever a sua ideia! </p>')
        return false
    }

    return true
}

function validateReceita(formData) {

    if(formData.get('titulo') == '') {
        $('#appendedData').remove()
        $('#receitaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório nomear o seu cozinhado! </p> ')
        return false
    } 
    if(formData.get('ingredientes') == '') {
        $('#appendedData').remove()
        $('#receitaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer os ingredientes do seu cozinhado! </p> ')
        return false
    } 
    if(formData.get('instrucoes') == '') {
        $('#appendedData').remove()
        $('#receitaForm').prepend('<p id="appendedData" class="w3-center w3-text-red"> É obrigatório fornecer as instruções para o seu cozinhado! </p> ')
        return false
    } 
    return true
}

function ajaxPost(pub){
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/pubs/newPub",
        data: JSON.stringify(pub), 
        contentType: "application/json; charset=utf-8",
      //  dataType: "json",
        success:  msg => alert("Publicação bem sucessida!"),
        error: function(msg) {
            alert('error:'+JSON.stringify(msg));
        }

    });
}