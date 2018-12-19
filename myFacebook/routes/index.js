var express = require('express');
var router = express.Router();
var axios = require('axios')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homepage');
});

router.get('/users',(req,res) => {

}) 
  //Ir buscar o utilizador e os seus dados e fazer o render da sua página principal


//Retornar formulário de registo
router.get('/users/registo', (req,res) => {
  res.render('registo')
})

//Ver para que é preciso esta função no frontend
//Consulta de utilizador por nome ou email
//router.get('/users', (req,res) => {
//  axios.get('http://localhost:3000/api/users',{params: req.query})
//    .then(dados => res.jsonp(dados))
//    .catch(error => res.render('error',{e: 'Não foi possível consultar o utilizador'}))
//})

//Retornar formulário de login
router.get('/users/login', (req,res) => {
  res.render('login')
})

//Registar um utilizador
router.post('/users', (req,res) => {
  axios.post('http://localhost:3000/api/users', req.body)
    .then(dados => {
      res.jsonp(dados.data)
    })
    .catch(erro => res.render('error', {e: erro}))
})

//Fazer o login de um utilizador
router.post('/users/login',(req,res) => {
  axios.post('http://localhost:3000/api/users/login', req.body)
    .then(dados => res.jsonp(dados.data)) //aqui vai ter que renderizar a página do utilizador
    .catch(erro => res.render('error',{erro})) // Ver como fazer o tratamento de erros!
})
module.exports = router;
