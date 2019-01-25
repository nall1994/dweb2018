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

router.post('/admin',async (req,res) => {
  loggedToken = jwt.verify(req.body.access_token,'myFacebook',jwt_options.verifyOptions)
  if(loggedToken.user.role == 'admin') {
    var user = new Object()
    user.role = 'admin'
    var hash = await bcrypt.hash(req.body.password,10)
    user.password = hash
    user.email = req.body.email
    user.nome = req.body.nome
    userController.inserir(user)
      .then(message => res.jsonp(message))
      .catch(error => res.status(500).send(JSON.stringify(error)))
  }
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

//Consulta dos favoritos de um user
router.get('/isFav',passport.authenticate('jwt',{session:false}), (req,res) => {
    var loggedemail = req.user.email
    var emailFav = req.query.emailFav
    userController.consultaFavoritos(loggedemail,emailFav)
      .then(favoritos => {
           res.jsonp(favoritos)
      })
      .catch(error => res.status(500).send('Erro na consulta dos favoritos de um utilizador!'))
  
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

router.get('/count',passport.authenticate('jwt',{session:false}),(req,res) => {
  //Verificar se o user é admin
  var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
  var userRole = loggedToken.user.role
  if(userRole == 'admin') {
    userController.contar()
    .then(result => res.jsonp({resultado: result}))
    .catch(error => res.jsonp(error))
  } else {
    res.jsonp({error: 'Not authorized'})
  }
  
})

router.post('/admin/login', async (req,res,next) => {
  passport.authenticate('login',async(err,user,info) => {
    try {
      if(err || !user) {
        if(err) return next(err)
        else res.jsonp({authError: info.message})
      }
      if(user.role == 'user') {
        res.jsonp({authError: 'O utilizador associado ao email que introduziu não tem permissões de administrador!'})
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

router.post('/remFromFavorites',passport.authenticate('jwt',{session:false}),(req,res) => {
  var data = {
    email: req.body.favoriteEmail,
    nome: req.body.favoriteNome
  }
  console.log(data)
  userController.removerFavorito(req.body.email,data)
  res.jsonp({info: "Favorito removido com sucesso!"})
})

router.post('/search',passport.authenticate('jwt',{session:false}),(req,res) => {
  var searchField = req.body.campo_procura
  userController.consultaNome(searchField)
    .then(dadosNome => {
      if(dadosNome.length == 0) {
        userController.consultaEmail(searchField)
          .then(dadosEmail => {
            var arrayToSend = new Array()
            if(dadosEmail != null)
              arrayToSend.push({nome: dadosEmail.nome, email:dadosEmail.email})
            res.jsonp(arrayToSend)
          })
          .catch(error => res.status(500).send('Erro na consulta por email!'))
      } else {
            var arrayToSend = new Array()
            for(var i = 0; i < dadosNome.length; i++) {
              newUser = {nome: dadosNome[i].nome, email: dadosNome[i].email}
              arrayToSend.push(newUser)
            }
            res.jsonp(arrayToSend)
      }
    })
    .catch(error => res.status(500).send('Erro na consulta por nome!'))
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
