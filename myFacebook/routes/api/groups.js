var express = require('express')
var router = express.Router()
var groupsController = require('../../controllers/Groups')
var passport = require('passport')
var jwt_options = require('../../auth/jwt_options')
var jwt = require('jsonwebtoken')

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    var loggedToken = jwt.verify(req.query.access_token, 'myFacebook', jwt_options.verifyOptions)
    if (loggedToken.user.role == 'admin') {
        groupsController.listarTodos()
            .then(dados => res.jsonp(dados))
            .catch(error => res.status(500).send('Erro na listagem de grupos!'))
    } else {
        res.redirect('/users/homepage/' + loggedToken.user.email)
    }
})

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    var loggedToken = jwt.verify(req.query.access_token, 'myFacebook', jwt_options.verifyOptions)
    groupsController.removeGrupo(req.query.group_id)
        .then(group => res.jsonp(group))
        .catch(error => res.jsonp(error))
})

router.put('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    var group = req.body
    var loggedToken = jwt.verify(group.access_token, 'myFacebook', jwt_options.verifyOptions)
    if (loggedToken.user.email == group.admin) {
        delete group.access_token
        groupsController.atualizar(group)
            .then(group => res.jsonp(group))
            .catch(error => res.jsonp(error))
    } else {
        res.jsonp('Não tem autorização para atualizar o grupo')
    }
})

router.post('/member', passport.authenticate('jwt', { session: false }), (req, res) => {
    var loggedToken = jwt.verify(req.body.access_token, 'myFacebook', jwt_options.verifyOptions)
    groupsController.addMembro(req.body.group_id, req.body.email)
        .then(group => res.jsonp(group))
        .catch(error => res.jsonp(error))
})

router.delete('/member', passport.authenticate('jwt', { session: false }), (req, res) => {
    var loggedToken = jwt.verify(req.query.access_token, 'myFacebook', jwt_options.verifyOptions)
    groupsController.removeMembro(req.query.group_id, req.query.email)
        .then(group => res.jsonp(group))
        .catch(error => res.jsonp(error))
})

router.post('/admin/import', passport.authenticate('jwt', { session: false }), (req, res) => {
    var loggedToken = jwt.verify(req.body.access_token, 'myFacebook', jwt_options.verifyOptions)
    if (loggedToken.user.role == 'admin') {
        groupsController.importar(req.body.data)
            .then(msg => res.jsonp('Importação de grupos bem sucedida!'))
            .catch(error => res.jsonp('erro na importação de utilizadores'))
    } else {
        res.status(401).send('Não está autorizado!')
    }
})

router.get('/withUser', passport.authenticate('jwt', { session: false }), (req, res) => {
    var user = req.query.email
    groupsController.listaGrupos(user)
        .then(dados => res.jsonp(dados))
        .catch(error => res.jsonp({ message: 'ERRO: ' + error }))
})

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    var group = new Object();
    group.nome = req.body.nome;
    group.descricao = req.body.desc;
    group.fotoGrupo = req.body.fotoGrupo;
    group.membros = req.body.membros;
    group.admin = req.body.admin;
    groupsController.inserir(group)
        .then(grupo => {
            console.log(JSON.stringify(grupo));
            res.jsonp(grupo);
        })
        .catch(err => {
            console.log("Erro no registo do grupo na base de dados.");
            res.jsonp("Erro no registo do grupo na base de dados.");
        });
})

router.get('/count', passport.authenticate('jwt', { session: false }), (req, res) => {
    //verificar se é admin
    var loggedToken = jwt.verify(req.query.access_token, 'myFacebook', jwt_options.verifyOptions)
    var userRole = loggedToken.user.role
    if (userRole == 'admin') {
        groupsController.contar()
            .then(result => res.jsonp({ resultado: result }))
            .catch(error => res.jsonp(error))
    } else {
        res.jsonp({ error: 'Not authorized!' })
    }
})

router.get('/:group_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    groupsController.obterGrupo(req.params.group_id)
        .then(grupo => {
            res.jsonp(grupo);
        })
        .catch(err => {
            res.jsonp([]);
        })
});

module.exports = router;