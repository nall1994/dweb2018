var express = require('express');
var router = express.Router();
var passport = require('passport')
var jwt = require('jsonwebtoken')
var jwt_options = require('../auth/jwt_options')
var axios = require('axios')
var fs = require('fs')
var formidable = require('formidable')

router.get('/homepage/:email',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
        
  var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)   
      req.query.access_token = req.session.token
      req.query.email = req.params.email
      axiosConfig = {
        params: req.query
      }
      if(loggedToken.user.email == req.params.email) {
        //present user_home
        var pubs = new Object()
        var groupsInfo = new Object()
        axios.get('http://localhost:3000/api/pubs/fromUser', axiosConfig)
          .then(dadospubs => {
            pubs = dadospubs.data
            console.log("pubs:");
            console.log(JSON.stringify(pubs));
            axios.get('http://localhost:3000/api/groups/withUser', axiosConfig)
              .then(dadosGroups => {
                groupsInfo = dadosGroups.data
                axios.get('http://localhost:3000/api/users/?email='+loggedToken.user.email,axiosConfig)
                    .then((dadosUser) => {
                      console.log("user:");
                      console.log(JSON.stringify(dadosUser.data));
                      res.render('user_home',{userData: dadosUser.data, userPubs: pubs})

                    }).catch((err) => {
                      
                      res.render('error',{error : err})
                });
            //    res.jsonp(pubs)
              })
              .catch(error => res.render('error',{e: error+"In Groups API"}))
            //  res.jsonp(pubs)
          })
          .catch(error => res.render('error',{e: error}))

      } else {
        //present guest_home
        var pubs = new Object()
        var groupsInfo = new Object()
        axios.get('http://localhost:3000/api/pubs/fromUser', axiosConfig)
          .then(dadospubs => {
            pubs = dadospubs.data
            console.log("pubs:");
            console.log(JSON.stringify(pubs));
            axios.get('http://localhost:3000/api/groups/withUser', axiosConfig)
              .then(dadosGroups => {
                groupsInfo = dadosGroups.data
                axios.get('http://localhost:3000/api/users',axiosConfig)
                    .then((dadosUser) => {
                      console.log("user:");
                      console.log(JSON.stringify(dadosUser.data));
                      dadosUser.data.origin_email = loggedToken.user.email
                      res.render('guest_home',{userData: dadosUser.data, userPubs: pubs})

                    }).catch((err) => {
                      
                      res.render('error',{error : err})
                });
            //    res.jsonp(pubs)
              })
              .catch(error => res.render('error',{e: error+"In Groups API"}))
            //  res.jsonp(pubs)
          })
          .catch(error => res.render('error',{e: error}))
      }
      //É preciso ir buscar os dados do utilizador, as suas publicações e os grupos aos quais pertence!
      //Se o email que email que vem no url é diferente do que está logado devemos apresentar a página guest_home
      //Caso contrário devemos apresentar a página user_home
      
      
      
        

      //Aqui já podemos fazer o render da homepage e passar-lhe os dois objetos e também o req.user
    })
  
  router.get('/profile/:email', passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var profileAsked = req.params.email
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    req.query.access_token = req.session.token
    req.query.email = loggedUser
    axiosConfig = {
      params: req.query
    }
    if(loggedUser != profileAsked) {
      res.redirect('/users/profile/' + loggedUser)
    } else {
      axios.get('http://localhost:3000/api/users', axiosConfig)
        .then(dadosUser => {
          res.render('profile',{userData: dadosUser.data})
        })
        .catch(error => res.render('error',{e: error}))
    }

  })

  router.post('/updateProfile/:email', passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}), (req,res) => {
    var profileToUpdate = req.params.email
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    req.query.access_token = req.session.token
    req.query.email = loggedUser
    axiosConfig = {
      params: req.query
    }
    if(profileToUpdate != loggedUser) {
      res.redirect('/users/profile/' + loggedUser)
    } else {
      var form = formidable.IncomingForm()
      form.parse(req,(erro,fields,files) => {
        if(files.foto.size > 0) {
          var fenviado = files.foto.path
          var fnovo = __dirname + "/../public/uploaded/" + fields.email + "/" + files.foto.name
          fs.renameSync(fenviado,fnovo)
          fields.foto = "http://localhost:3000/uploaded/" + fields.email + "/" + files.foto.name
        }
        axios.get('http://localhost:3000/api/users',axiosConfig)
          .then(userData => {
            var user = userData.data
              user.morada = fields.morada
              user.foto = fields.foto
              user.dataAniversario = fields.dataAniversario
              user.nome = fields.nome
              user.profissao = fields.profissao
              user.instituicao = fields.instituicao
              user.access_token = req.session.token
              axios.post('http://localhost:3000/api/users/updateProfile',user)
                .then(message => res.render('profile',{userData: user,info: message.data}))
                .catch(error => res.render('error',{e:error}))
          })
          .catch(error => res.render('error' ,{e: error}))
        })
      }
    })

  router.post('/updatePassword/:email',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var profileToUpdate = req.params.email
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    if(profileToUpdate != loggedUser) {
      res.redirect('profile/' + loggedUser)
    } else {
      req.body.email = loggedUser
      req.body.access_token = req.session.token
      axios.post('http://localhost:3000/api/users/updatePassword',req.body)
        .then(msg => res.jsonp({info: msg.data.info}))
        .catch(error => res.render('error',{e: error}))
    }
  })
  
  //Retornar formulário de registo
  router.get('/registo',  (req,res) => {
    res.render('registo')
  })
  
  
  //Retornar formulário de login
  router.get('/login', (req,res) => {
    res.render('login')
  })
  
  //Registar um utilizador
  router.post('/', (req,res) => {
    axios.post('http://localhost:3000/api/users', req.body)
      .then(() => {
        if(!fs.existsSync('public/uploaded/' + req.body.email))
          fs.mkdirSync('public/uploaded/' + req.body.email)
        res.render('login')
      })
      .catch(erro => res.render('error', {e: erro}))
  })
  
  //Fazer o login de um utilizador
  router.post('/login',(req,res) => {
    axios.post('http://localhost:3000/api/users/login', req.body)
      .then(data => {
        if(data.data.authError) res.render('login',{errorMessage: data.data.authError})
        else{
          var user = data.data
          req.login(user,{session:false}, async error => {
            if(error) res.render('error',{e: error})
            var loggedUser = {email:user.email, role:user.role, nome:user.nome}
            var token = jwt.sign({user: loggedUser}, 'myFacebook',jwt_options.signOptions)
            req.session.token = token
            res.redirect('/users/homepage/' + user.email)
          })
        }    
      })
      .catch(erro =>{
        res.render('error', {e: erro})
      } )
})

module.exports = router