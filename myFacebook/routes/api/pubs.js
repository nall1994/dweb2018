var express = require('express')
var router = express.Router()
var passport = require('passport')
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
    pubsController.consulta(seletores)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.jsonp({message: 'Erro: ' + erro}))

})

module.exports = router