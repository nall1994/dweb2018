var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var jwt_options = require('../../auth/jwt_options')
var groupsController = require('../../controllers/Groups')
var passport = require('passport')

router.get('/withUser', passport.authenticate('jwt',{session:false}),(req,res) => {
    var user = req.query.email
    groupsController.consultar(user)
        .then(dados => res.jsonp(dados))
        .catch(error => res.jsonp({message: 'ERRO: ' + error}))
})

router.get('/count',passport.authenticate('jwt',{session:false}),(req,res) => {
    //verificar se é admin
    var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
    var userRole = loggedToken.user.role
    if(userRole == 'admin') {
        groupsController.contar()
        .then(result => res.jsonp({resultado:result}))
        .catch(error => res.jsonp(error))
    } else {
        res.jsonp({error: 'Not authorized!'})
    }
    
})
module.exports = router