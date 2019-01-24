var express = require('express')
var router = express.Router()
var passport = require('passport')
var jwt_options = require('../../auth/jwt_options')
var jwt = require('jsonwebtoken')
var pubsController = require('../../controllers/Pubs')

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
    console.log("seletores:");
    
    console.log(seletores);
    
    pubsController.consulta(seletores)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})


router.get('/:email/filter',passport.authenticate('jwt',{session:false}),(req,res) => {
    var email = req.params.email
    var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    //verificar token e verificar se o logged é igual ao que temos ou nao
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
            if(filtros.tipos.length) {
                var a = new Array()
                a.push(filtros.tipos)
                filtros.tipos = a
            }
            seletores.tipo = {$in : filtros.tipos}
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
            if(filtros.tipos.length) {
                var a = new Array()
                a.push(filtros.tipos)
                filtros.tipos = a
            }
            seletores.tipo = {$in : filtros.tipos}
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

router.post('/:pubid/delete',passport.authenticate('jwt',{session:false}),(req,res) => {
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
    console.log("API:")
    console.log(pub)
    pubsController.inserir(pub)
    .then( msg => res.jsonp(msg))
    .catch(error => res.status(500).send(JSON.stringify(error)))

})

module.exports = router