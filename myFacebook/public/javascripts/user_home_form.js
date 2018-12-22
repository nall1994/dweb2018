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
    })

    $('#adicionar').click(e => {
        e.preventDefault()
        if(counter == 0) {
            var form = document.getElementById('albumForm')
            album = new FormData($(form))
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
    })

    //Falta ver para pôr os classificadores em todos os tipos de publicação!
    //No PUG, each userData.classificadores criar uma checkbox
    //Deste lado recolher cada um dos classificadores selecionados!

    $('#publicarAlbum').click(e => {
        e.preventDefault()
        alert('album')
        var fotoAlbum = new FormData()
        fotoAlbum.set('data',parseDate(new Date()))
        fotoAlbum.set('tipo','album')
        fotoAlbum.set('origin_email',album.get('origin_email'))
        fotoAlbum.set('isPrivate',album.get('privacidade'))
        var fotos = new Array()
        var number_fotos_arr = album.get('foto')
        for(i=0; i< number_fotos_arr.length; i++){
            var obj = {dataFoto: album.get('dataFoto')[i], local: album.get('local')[i], foto: number_fotos_arr[i]}
            fotos.push(obj)
        }
        var data = {titulo: album.get('titulo'), descricao: album.get('descricao'),fotos: fotos}
        fotoAlbum.set('dados', data)
       
        ajaxPost(album)
    })

    $('#publicarEventoProfissional').click(e => {
        e.preventDefault()
        var form = document.getElementById('eventoProfissionalForm')
        var eventoProf = new FormData(form)
        alert('eventoProfissional')
        var evento = new FormData()
        evento.set('tipo','eventoProfissional')
        evento.set('origin_email',eventoForm.get('origin_email'))
        evento.set('data',parseDate(new Date()))
        evento.set('isPrivate',eventoProf.get('privacidade'))
        var oradores = eventoProf.get('oradores').split('\n')
        var data = {titulo: eventoProf.get('titulo'), local: eventoProf.get('local'), dataEvento: parseDate(eventoProf.get('dataEvento')), oradores: oradores, descricao: descricao, ficheiros: eventoForm.get('ficheiros') }
        evento.set('dados', data)
        
        ajaxPost(evento)
    })

    $('#publicarEvento').click(e => {
        e.preventDefault()
        var form = document.getElementById('eventoForm')
        var eventoForm = new FormData(form)
        alert('evento')
        var evento =  new FormData()
        evento.set('origin_email',eventoForm.get('origin_email'))
        evento.set('tipo','evento')
        evento.set('isPrivate',eventoForm.get('privacidade'))
        evento.set('data',parseDate(new Date()))
        var convidados = eventoForm.get('convidados').split('\n')
        var data = {titulo: eventoForm.get('titulo'),dataEvento: parseDate(eventoForm.get('dataEvento')),local: eventoForm.get('local'),descricao: eventoForm.get('descricao'), convidados: convidados}
        evento.set('dados',data)
        
        ajaxPost(evento)
    })

    $('#publicarReceita').click(e => {
        e.preventDefault()
        var form = document.getElementById('receitaForm')
        var receitaForm = new FormData(form)
        alert('receita')
        var receita = new FormData()
        var ingredientes = receitaForm.get('ingredientes')
        var instrucoes = receitaForm.get('instrucoes')
        var data = ingredientes + ";" + instrucoes
        var dados = {titulo: receitaForm.titulo, dados: data}
        var classificacoes = receitaForm.get('classificacoes').split(',')
        receita.set('dados',dados)
        receita.set('isPrivate',receitaForm.get('privacidade'))
        receita.set('data',parseDate(new Date()))
        receita.set('tipo', 'receita')
        receita.set('origin_email', receitaForm.get('origin_email'))
        receita.set('classificacoes',classificacoes)
        
        ajaxPost(receita)
    })

    $('#publicarIdeia').click(e =>  {
        e.preventDefault()
        var form = document.getElementById('ideiaForm')
        var ideiaForm = new FormData(form)
        alert('ideia')
        var ideia = new FormData()
        ideia.set('origin_email', ideiaForm.get('origin_email'))
        ideia.set('tipo','ideia')
        ideia.set('data',parseDate(new Date()))
        ideia.set('isPrivate',ideiaForm.get('privacidade'))
        var data = {titulo: ideiaForm.get('titulo'), classificadores: ideiaForm.get('classificadores').split(','), descricao: ideiaForm.get('descricao')}
        ideia.set('dados',data)
        
        ajaxPost(ideia)
    })

    $('#publicarDesportivo').click(e => {
        e.preventDefault()
        var form = document.getElementById('desportivoForm')
        var desportivoForm = new FormData(form)
        alert('desportivo')
        var desportivo = new FormData()
        desportivo.set('origin_email',desportivoForm.get('origin_email'))
        desportivo.set('tipo','desportivo')
        desportivo.set('data', parseDate(new Date()))
        desportivo.set('isPrivate',desportivoForm.get('privacidade'))
        var data = {titulo: desportivoForm.get('titulo'), atividade: desportivoForm.get('atividade'), duracao: desportivoForm.get('duracao'),descricao: desportivoForm.get('descricao'), fotos: desportivoForm.get('fotos'), ficheiro_gpx: desportivoForm.get('ficheiro_gpx')}
        desportivo.set('dados',data)
        
        ajaxPost(desportivo)
    })

    $('#publicarFormacao').click(e => {
        e.preventDefault()
        var form = document.getElementById('formacaoForm')
        var creditacaoForm = new FormData(form)
        alert('creditacao')
        var creditacao = new FormData()
        creditacao.set('origin_email', creditacaoForm.get('origin_email'))
        creditacao.set('tipo','creditacao')
        creditacao.set('data',parseDate(new Date()))
        creditacao.set('isPrivate', creditacaoForm.get('privacidade'))
        var data = {titulo: creditacaoForm.get('titulo'), creditacao: creditacaoForm.get('creditacao'), instituicao: creditacaoForm.get('instituicao'), descricao: creditacaoForm.get('descricao')}
        creditacao.set('dados',data)
        
        ajaxPost(creditacao)
    })
})

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