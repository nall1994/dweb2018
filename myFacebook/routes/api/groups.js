var express = require('express')
var router = express.Router()
var groupsController = require('../../controllers/Groups')
var passport = require('passport')

router.get('/withUser', passport.authenticate('jwt',{session:false}),(req,res) => {
    var user = req.query.email
    groupsController.consultar(user)
        .then(dados => res.jsonp(dados))
        .catch(error => res.jsonp({message: 'ERRO: ' + error}))
})

module.exports = router