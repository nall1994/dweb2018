var express = require('express')
var router = express.Router()
var groupsController = require('../../controllers/Groups')
var passport = require('passport')
var jwt_options = require('../../auth/jwt_options')
var jwt = require('jsonwebtoken')

router.get('/withUser', passport.authenticate('jwt', { session: false }), (req, res) => {
    var user = req.query.email
    groupsController.listaGrupos(user)
        .then(dados => res.jsonp(dados))
        .catch(error => res.jsonp({ message: 'ERRO: ' + error }))
})

router.post('/new', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var group = new Object();
    group.nome = req.body.nome;
    group.descricao = req.body.desc;
    group.fotoGrupo = req.body.fotoGrupo;
    console.log(req.body.membros);
    group.membros = req.body.membros;
    group.admin = req.body.admin;
    console.log("GRUPO CONSTRUÍDO.");
    console.log(group);
    groupsController.inserir(group)
        .then(grupo => {
            console.log(JSON.stringify(grupo))
        })
        .catch(err => console.log("Erro no registo do grupo na base de dados."));
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

module.exports = router;