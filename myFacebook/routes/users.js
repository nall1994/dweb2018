var express = require('express');
var router = express.Router();
var passport = require('passport')
var axios = require('axios')

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
  
router.get('/homepage/:email',passport.authenticate('jwt',{session:false}),(req,res) => {
      req.query.access_token = req.session.token
      req.query.email = req.params.email
      axiosConfig = {
        params: req.query
      }
      //Ir buscar tudo o que é necessário para fazer o display da página do utilizador com pedidos à api
      //GET publicacoes/fromUser?email=req.params.email
      //GET groups/withUser?=email=req.params.email
      var pubs = new Object()
      var groupsInfo = new Object()
      axios.get('http://localhost:3000/api/pubs/fromUser', axiosConfig)
        .then(dados => pubs = dados.data)
        .catch(error => res.render('error',{e: error}))
      axios.get('http://localhost:3000/api/groups/withUser', axiosConfig)
        .then(dados => groupsInfo = dados.data)
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
        res.render('login')
      })
      .catch(erro => res.render('error', {e: erro}))
  })
  
  //Fazer o login de um utilizador
  router.post('/login',(req,res) => {
    axios.post('http://localhost:3000/api/users/login', req.body)
      .then(data => {
        req.session.token = data.data
        res.render('contacts', {t: req.session.token})}) //aqui vai ter que renderizar a página do utilizador
      .catch(erro => res.render('error',{erro})) // Ver como fazer o tratamento de erros!
  })

module.exports = router