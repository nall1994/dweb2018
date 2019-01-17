var express = require('express');
var router = express.Router();
var passport = require('passport')
var jwt = require('jsonwebtoken')
var jwt_options = require('../auth/jwt_options')
var axios = require('axios')
var fs = require('fs')

//Esta não deve ser necessária aqui, só na API
//Vamos ter de ter uma variante quando for para a pesquisa de utilizadores
//router.get('/',passport.authenticate('jwt',{session:false}),(req,res) => {
//    req.query.access_token = req.session.token
//    axiosConfig = {
//      params: req.query
//    }
//    console.log(req.user)
//    axios.get('http://localhost:3000/api/users',axiosConfig)
//      .then(dados => res.jsonp(dados.data))
//      .catch(erro => res.render('error',{e: erro}))
//})
    //Ir buscar o utilizador e os seus dados e fazer o render da sua página principal
  
router.get('/homepage/:email',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
        
  var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)   
      req.query.access_token = req.session.token
      req.query.email = req.params.email
      axiosConfig = {
        params: req.query
      }
      if(loggedToken.user.email == req.params.email) {
        //present user_home

      } else {
        //present guest_home
      }
      //É preciso ir buscar os dados do utilizador, as suas publicações e os grupos aos quais pertence!
      //Se o email que email que vem no url é diferente do que está logado devemos apresentar a página guest_home
      //Caso contrário devemos apresentar a página user_home
      
      
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
        

      //Aqui já podemos fazer o render da homepage e passar-lhe os dois objetos e também o req.user
    })
  
  //Retornar formulário de registo
  router.get('/registo', (req,res) => {
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