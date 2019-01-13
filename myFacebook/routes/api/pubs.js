var express = require('express')
var router = express.Router()
var passport = require('passport')
var pubsController = require('../../controllers/Pubs')
var formidable = require("formidable")

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
    console.dir(seletores);
    
    pubsController.consulta(seletores)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})

router.get('/',passport.authenticate('jwt',{session:false}),(req,res) => {
    pubsController.consultaTodas()
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})

router.post('/newPub', async (req,res) => {
    var pub = new Object()
    pub.origin_email = req.body.origin_email
    pub.tipo = req.body.tipo
    pub.data = req.body.data
    if (req.body.isPrivate=="false") pub.isPrivate = false
    else pub.isPrivate = true
    var dados = new Object()
    var ideia = new Object()
    ideia.titulo = req.body.titulo
    if (req.body.classificadores!="") ideia.classificadores = req.body.classificadores.split(",")
    ideia.descricao = req.body.descricao
    dados.ideia = ideia
    pub.dados = dados
    console.log("API:")
    console.log(pub)
    pubsController.inserir(pub)
    .then(message => res.jsonp(message))
    .catch(error => res.status(500).send(JSON.stringify(error)))

})
  

module.exports = router