var express = require('express');
var router = express.Router();
var groupsController = require('../controllers/Groups');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var jwt_options = require('../auth/jwt_options');
var axios = require('axios');
var formidable = require("formidable");
var fs = require("fs");

router.get('/:email', passport.authenticate('jwt', { session: false, failureRedirect: '/users/login' }), (req, res) => {

    var profileAsked = req.params.email;
    var loggedToken = jwt.verify(req.session.token, 'myFacebook', jwt_options.verifyOptions);
    var loggedUser = loggedToken.user.email;
    req.query.access_token = req.session.token;
    req.query.email = loggedUser;
    axiosConfig = {
        params: req.query
    };
    if (loggedUser != profileAsked) {
        res.redirect('/users/profile/' + loggedUser)
    } else {
        axios.get('http://localhost:3000/api/groups/withUser', axiosConfig)
            .then(dadosGroups => {
                axios.get('http://localhost:3000/api/users/?email=' + loggedToken.user.email, axiosConfig)
                    .then(dadosUser => {
                        console.log('Dados do user:');
                        console.log(JSON.stringify(dadosUser.data));
                        console.log('Grupos do user:');
                        console.log(JSON.stringify(dadosGroups.data));
                        console.log('Num de grupos:');
                        console.log(dadosGroups.length);
                        res.render('groups', { userData: dadosUser.data, groupsData: dadosGroups.data, numGroups: dadosGroups.length });
                    })
                    .catch(err => {
                        res.render('error', { error: err });
                    })
            })
            .catch(err => {
                res.render('error', { error: err });
            })
    }
});

router.post('/new', passport.authenticate('jwt', { session: false, failureRedirect: '/users/login' }), (req, res) => {
    var groupForm = formidable.IncomingForm();
    groupForm.parse(req, (err, fields, data) => {
        if (err) {
            res.jsonp("Erros na criação do grupo (server side).")
        }
        if (data["foto"]) {
            var fsent = data["foto"].path;
            var fnew = __dirname + '/../public/uploaded/groups/covers/temp';
            console.log(fsent);
            console.log(fnew);
            fs.rename(fsent, fnew, err => {
                if (err) {
                    console.log("Erro no armazenamento da imagem de capa.");
                    res.jsonp("Erro no armazenamento da imagem de capa.");
                }
                else {
                    console.log("Imagem de capa armazenada com sucesso.");
                }
            })
        }
        var members = [];

        console.log("NOME:")
        console.log(fields.nome);
        console.log("DESC:")
        console.log(fields.desc);
        console.log("ADMIN:")
        console.log(fields.admin);
        if (fields.membros) {
            members = fields.membros.split(',');
        }
        console.log("MEMBROS:")
        console.log(members);
        var group = {
                nome: fields.nome,
                desc: fields.desc,
                fotoGrupo: 'n/a',
                membros: members,
                admin: fields.admin
            }
        console.log(group);
        group.access_token = req.session.token
        axios.post('http://localhost:3000/api/groups/new', group)
            .then(message => {
                console.log("Grupo criado com sucesso.");
                res.jsonp("Grupo criado com sucesso.");
            })
            .catch(err => {
                console.log("Erro na criação do grupo.");
                res.jsonp("Erro na criação do grupo.");
            })
    })
})

module.exports = router;