var express = require('express');
var router = express.Router();
var userController = require('../../controllers/Users')
var jwt = require('jsonwebtoken')
var jwt_options = require('../../auth/jwt_options')
var bcrypt = require('bcrypt')
var passport = require('passport')

//Registar utilizador
router.post('/', async (req,res) => {
  var user = new Object()
  user.role = 'user'
  var hash = await bcrypt.hash(req.body.password,10)
  user.password = hash
  user.email = req.body.email
  user.nome = req.body.nome
  user = userController.iniciarDefault(user)
  userController.inserir(user)
    .then(message => res.jsonp(message))
    .catch(error => res.status(500).send(JSON.stringify(error)))
})

//Consulta de utilizador por nome/email
router.get('/',passport.authenticate('jwt',{session:false}), (req,res) => {
  if(req.query.nome) {
    console.log('got here!')
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
        else res.jsonp({authError: info.message})
      }
      res.jsonp(user)
    }
    catch(error) {
      return next(error)
    }
  })(req,res,next)
})

router.post('/addToFavorites',passport.authenticate('jwt',{session:false}),(req,res) => {
  var data = {
    email: req.body.favoriteEmail,
    nome: req.body.favoriteNome
  }
  console.log(data)
  userController.adicionarFavorito(req.body.email,data)
  res.jsonp({info: "Favorito adicionado com sucesso!"})
})

router.post('/updateProfile',passport.authenticate('jwt',{session:false}), (req,res) => {
  var user = req.body
  var loggedToken = jwt.verify(user.access_token,'myFacebook',jwt_options.verifyOptions)
  var loggedUser = loggedToken.user.email 
  if(loggedUser != user.email) {
    res.jsonp({info: "Não é possível atualizar algo que não seja do seu perfil!"})
  }  else {
      delete user.access_token
      userController.atualizarDados(user.email,user)
      .then(() => res.jsonp({info: 'Atualização bem sucedida!'}))
      .catch(error => res.status(500).send(JSON.stringify(error)) )
  }
  
})

router.post('/updatePassword', passport.authenticate('jwt',{session:false}),(req,res) => {
  var data = req.body
  var loggedToken = jwt.verify(data.access_token,'myFacebook',jwt_options.verifyOptions)
  var loggedUser = loggedToken.user.email 
  if(loggedUser != data.email) {
    res.jsonp({info: "Não é possível alterar a password para este utilizador!"})
  } else {
    userController.consultaEmail(data.email)
      .then(userData => {
        bcrypt.compare(data.oldPass,userData.password,async (error,result) => {
          if(error) res.jsonp({info: error})
          else if(result) {
            var hash_newpass = await bcrypt.hash(data.newPass,10)
            console.log("email -> " + data.email)
            console.log("pass -> "  + data.newPass)
            userController.atualizarPassword(data.email,hash_newpass)
            res.jsonp({info: 'Alteração efetuada com sucesso!'})
          } else {
            res.jsonp({info: 'A password antiga que inseriu não coincide com os nossos registos!'})
          }
        }) 
          
          
      })
  }

})

module.exports = router;
