var express = require('express');
var router = express.Router();
var userController = require('../../controllers/Users')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var passport = require('passport')

/* GET users listing. */
router.post('/', async (req,res) => {
  var user = req.body
  user.role = 'user'
  var hash = await bcrypt.hash(user.password,10)
  user.password = hash
  user = userController.iniciarDefault(user)
  userController.inserir(user)
    .then(message => res.jsonp(message))
    .catch(error => res.status(500).send(JSON.stringify(error)))
})

//Consulta de utilizador por nome/email
router.get('/', (req,res) => {
  if(req.query.nome) {
    userController.consultaNome(req.query.nome)
      .then(dados => res.jsonp(dados))
      .catch(error => res.status(500).send('Erro na consulta de utilizador por nome!'))
  } else if(req.query.email) {
    userController.consultaEmail(req.query.email)
      .then(dados => res.jsonp(dados))
      .catch(error => res.status(500).send('Erro na consulta de utilizador por email!'))
  } else {
    res.jsonp({message: 'Parâmetro de query não reconhecido!'})
  }
})

//login de utilizador
router.post('/login',async (req,res,next) => {
  passport.authenticate('login', async (err,user,info) => {
    try{
      if(err || !user) {
        if(err) return next(err)
        else return next(new Error('Utilizador inexistente!'))
      }
      req.login(user,{session:false},async error => {
        if(error) return next(error)
        var loggedUser = {email: user.email, role: user.role,nome: user.nome}
        var token = jwt.sign({user: loggedUser}, 'myFacebook')
        req.session.token = token
        res.jsonp(loggedUser)
      })
    }
    catch(error) {
      return next(error)
    }
  })(req,res,next)
})

module.exports = router;
