var express = require('express');
var router = express.Router();
var groupsController = require('../controllers/Groups');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var jwt_options = require('../auth/jwt_options');
var axios = require('axios');
var formidable = require("formidable");
var fs = require("fs");

router.get('/user/:email', passport.authenticate('jwt', { session: false, failureRedirect: '/users/login' }), (req, res) => {

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
                        console.log(dadosUser.data);
                        console.log('Grupos do user:');
                        console.log(dadosGroups.data);
                        console.log('Num de grupos:');
                        console.log(dadosGroups.data.length);
                        res.render('groups', { userData: dadosUser.data, groupsData: dadosGroups.data, numGroups: dadosGroups.data.length });
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

router.get('/:group_id', passport.authenticate('jwt', { session: false, failureRedirect: '/users/login' }), (req, res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions);
    req.query.access_token = req.session.token;
    req.query.email = req.params.email;
    axiosConfig = {
        params: req.query
    };
    // Obtenção da informação do grupo.
    axios.get('http://localhost:3000/api/groups/' + req.params.group_id, axiosConfig)
        .then(group => {
            if (group.data.length > 0) {
                console.log(group.data);
                console.log(group.data[0]);
                // Preciso das publicações com o group_id.
                // Preciso de saber se o utilizador loggado é admin.
                // A página deve apresentar os membros e permitir publicações acessíveis a todos os membros.
                // O admin deve poder acrescentar membros ao grupo.
                res.render('group_home', { groupData: group.data[0], loggedEmail: loggedToken.user.email, groupPubs: });
            }
            else {
                console.log(group.data);
                res.render('error', { error: "O grupo especificado não existe." });
            }
        })
        .catch(err => {
            res.render('error', { error: err });
        })
});

router.post('/new', passport.authenticate('jwt', { session: false, failureRedirect: '/users/login' }), (req, res) => {
    var groupForm = formidable.IncomingForm();
    groupForm.parse(req, (err, fields, data) => {
        if (err) {
            res.jsonp("Erros na criação do grupo (server side).")
        }
        if (data["foto"]) {
            var fsent = data["foto"].path;
            var ftemp = __dirname + '/../public/uploaded/groups/covers_temp/' + data["foto"].name;
            fs.rename(fsent, ftemp, err => {
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
        var admin = fields.admin.trim();

        console.log("NOME:")
        console.log(fields.nome);
        console.log("DESC:")
        console.log(fields.desc);
        console.log("ADMIN:")
        console.log(admin);
        if (fields.membros) {
            members = fields.membros.split(',');
        }
        members = members.map(s => s.trim());
        // Se o admin não se especificou como membro do grupo...
        if (members.indexOf(admin) <= -1) {
            members.push(admin);
        }
        console.log("MEMBROS:")
        console.log(members);
        var group = {
                nome: fields.nome.trim(),
                desc: fields.desc.trim(),
                membros: members,
                admin: admin
            }
        if(data["foto"]) group.fotoGrupo = data["foto"].name
        group.access_token = req.session.token
        axios.post('http://localhost:3000/api/groups/new', group)
            .then(message => {
                group = message.data
                fs.mkdirSync(__dirname + '/../public/uploaded/groups/' + group._id)
                var fold = __dirname + '/../public/uploaded/groups/covers_temp/' + group.fotoGrupo
                var fnew = __dirname + '/../public/uploaded/groups/' + group._id + '/' + group.fotoGrupo
                fs.renameSync(fold,fnew)
                group.fotoGrupo = 'http://localhost:3000/uploaded/groups/' + group._id + '/' + group.fotoGrupo
                group.access_token = req.session.token
                axios.post('http://localhost:3000/api/groups/update',group)
                    .then(msg => {
                        console.log("Grupo criado com sucesso.");
                        res.jsonp("Grupo criado com sucesso.");
                    })
                    .catch(err => res.jsonp('Erro na criação do grupo!'))
                
            })
            .catch(err => {
                console.log("Erro na criação do grupo.");
                res.jsonp("Erro na criação do grupo.");
            })
    })
})

module.exports = router;