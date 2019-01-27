var express = require('express')
var router = express.Router()
var passport = require('passport')
var jwt_options = require('../../auth/jwt_options')
var jwt = require('jsonwebtoken')
var pubsController = require('../../controllers/Pubs')

router.get('/',passport.authenticate('jwt',{session:false}),(req,res) => {
    var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
        pubsController.consultaTodas()
            .then(dados => res.jsonp(dados))
            .catch(error => res.status(500).send('Erro na listagem de todas as publicações'))
    } else {
        res.redirect('/users/homepage/' + loggedToken.user.email)
    }
})

router.post('/admin/import',passport.authenticate('jwt',{session:false}),(req,res) => {
    var loggedToken = jwt.verify(req.body.access_token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
      pubsController.importar(req.body.data)
        .then(msg => res.jsonp('Importação de publicações bem sucedida!'))
        .catch(error => res.jsonp('erro na importação de utilizadores'))
    } else {
      res.status(401).send('Não está autorizado!')
    }
  })

router.get('/fromUser',passport.authenticate('jwt',{session:false}),(req,res) => {
    var fromUser = req.query.email
    var loggedUser = req.user.email
    var seletores = new Object()
    if(fromUser == loggedUser) {
        seletores.origin_email = fromUser
    } else {
        seletores.origin_email = fromUser
        seletores.isPrivate = false
    }
    seletores.groupId = {$exists: false}
    pubsController.consulta(seletores)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})


router.get('/:email/filter',passport.authenticate('jwt',{session:false}),(req,res) => {
    var email = req.params.email
    var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    var seletores = new Object()
    seletores.origin_email = email
    var filtros = req.query
    delete filtros.access_token

    if(loggedUser != email) {
        seletores.isPrivate = false
        //so pubs publicas
        if(filtros.hashtags) {
            if (filtros.hashtags.length) {
                var a = new Array()
                a.push(filtros.hashtags)
                filtros.hashtags = a
            }
            seletores.classificacoes = {$in: filtros.hashtags}
        }
        if(filtros.tipos) {
            if(filtros.tipos == 'receita' || filtros.tipos == 'ideia' || filtros.tipos =='evento' || filtros.tipos == 'eventoProfissional' || filtros.tipos == 'album' || filtros.tipos == 'formacao' || filtros.tipos == 'desportivo') {
                var a = new Array()
                a.push(filtros.tipos)
                filtros.tipos = a
            }
            seletores.$or = new Array()
            for(var i = 0; i< filtros.tipos.length;i++) {
                seletores.$or.push({tipo: filtros.tipos[i]})
            }
        }

        if(filtros.dataMinima) {
            seletores.data = {$gte : filtros.dataMinima}
        }

        pubsController.consulta(seletores)
            .then(pubs => res.jsonp(pubs))
            .catch(erro => res.status(500).send('Erro ao filtrar publicações'))
            
    } else {
        //pubs do user
        if(filtros.hashtags) {
            if (filtros.hashtags.length) {
                var a = new Array()
                a.push(filtros.hashtags)
                filtros.hashtags = a
            }
            seletores.classificacoes = {$in: filtros.hashtags}
        }

        if(filtros.tipos) {
            if(filtros.tipos == 'receita' || filtros.tipos == 'ideia' || filtros.tipos =='evento' || filtros.tipos == 'eventoProfissional' || filtros.tipos == 'album' || filtros.tipos == 'formacao' || filtros.tipos == 'desportivo') {
                var a = new Array()
                a.push(filtros.tipos)
                filtros.tipos = a
            }
            seletores.$or = new Array()
            for(var i = 0; i< filtros.tipos.length;i++) {
                seletores.$or.push({tipo: filtros.tipos[i]})
            }
        }

        if(filtros.dataMinima) {
            seletores.data = {$gte : filtros.dataMinima}
        }
        console.log(seletores)
        pubsController.consulta(seletores)
            .then(pubs => {
                console.log('found pubs')
                res.jsonp(pubs)
            })
            .catch(erro => res.status(500).send('Erro ao filtrar publicações'))
    }

})

router.post('/newComment',passport.authenticate('jwt',{session:false}),(req,res) => {
    var comment = new Object()
    comment.origin_email=  req.user.email
    comment.comentario = req.body.comentario
    
    pubsController.inserirComentario(comment,req.body.idpub)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})

router.get('/',passport.authenticate('jwt',{session:false}),(req,res) => {
    pubsController.consultaTodas()
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})

router.get('/count',passport.authenticate('jwt',{session:false}),(req,res) => {
    //verificar se o user é admin
    var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
    var userRole = loggedToken.user.role
    tipo = req.query.tipo
    console.log(tipo)
    console.log(userRole)
    if(userRole == 'admin') {
        if(tipo == 'receita') {
            pubsController.contarTipo('receita')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else if(tipo == 'evento') {
            pubsController.contarTipo('evento')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else if(tipo == 'eventoProfissional') {
            pubsController.contarTipo('eventoProfissional')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else if(tipo == 'ideia') {
            pubsController.contarTipo('ideia')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else if(tipo == 'formacao') {
            pubsController.contarTipo('formacao')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else if(tipo == 'album') {
            pubsController.contarTipo('album')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else if(tipo == 'desportivo') {
            pubsController.contarTipo('desportivo')
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        } else {
            pubsController.contar()
                .then(result => res.jsonp({resultado: result}))
                .catch(error => res.jsonp(error))
        }
    } else {
        res.jsonp({error: 'Not authorized'})
    }
    
})

router.get('/:id_pub',passport.authenticate('jwt',{session:false}),(req,res) => {
    var idpub = req.params.id_pub
    pubsController.consultaID(idpub)
        .then(pub => {
            res.jsonp(pub)
        })
        .catch(error => res.status(500).send('Erro na consulta de publicação'))
})

router.post('/:id_pub/edit',passport.authenticate('jwt',{session:false}),(req,res) => {
    var idpub = req.params.id_pub
    var access_token = req.body.access_token
    var pub = req.body.pub
    var loggedToken = jwt.verify(access_token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    if(loggedUser == pub.origin_email) {
        pubsController.atualizar(idpub,pub)
            .then(pub => {
                res.jsonp({m: "sucesso!"})
            })
            .catch(error => res.jsonp({m: 'Insucesso!'}))
        
    } else {
        res.jsonp({m: "insucesso!"})
    }

})

router.delete('/:pubid/delete',passport.authenticate('jwt',{session:false}),(req,res) => {
    var pubid = req.params.pubid
    pubsController.apagar(pubid)
        .then(m => res.jsonp(m))
        .catch(error => res.jsonp(JSON.stringify(error)))
})

router.post('/newPub',passport.authenticate('jwt',{session:false}), async (req,res) => {
    var pub = new Object()
    pub.origin_email = req.body.origin_email
    pub.tipo = req.body.tipo
    pub.data = req.body.data
    if (req.body.isPrivate=="false") pub.isPrivate = false
    else pub.isPrivate = true
    var dados = req.body.dados
    pub.dados =dados
    if (req.body.classificadores!="") pub.classificacoes= req.body.classificacoes.split(",").slice(0,-1)
    pubsController.inserir(pub)
    .then( msg => {
        res.jsonp(msg)
    } )
    .catch(error => res.status(500).send(JSON.stringify(error)))

})

module.exports = router