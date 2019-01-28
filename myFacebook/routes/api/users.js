var express = require('express');
var router = express.Router();
var userController = require('../../controllers/Users')
var jwt = require('jsonwebtoken')
var jwt_options = require('../../auth/jwt_options')
var bcrypt = require('bcrypt')
var passport = require('passport')
var fs = require('fs')

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

router.post('/admin', passport.authenticate('jwt',{session:false}),async (req,res) => {
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

router.put('/admin',passport.authenticate('jwt',{session:false}),(req,res) => {
  var loggedToken = jwt.verify(req.body.access_token,'myFacebook',jwt_options.verifyOptions)
  if(loggedToken.user.role == 'admin') {
    userController.consultaEmail(req.body.email)
      .then(userData => {
        bcrypt.compare(req.body.oldPassword,userData.password,async (error,result) => {
          if(error) res.jsonp({error: error})
          else if(result) {
            var hash_newpass = await bcrypt.hash(req.body.newPassword,10)
            userController.atualizarPassword(req.body.email,hash_newpass)
            res.jsonp({info: 'Alteração efetuada com sucesso!',userData: userData})
          } else {
            res.jsonp({error: 'A password antiga que inseriu não coincide com os nossos registos!', userData: userData})
          }
        })

      })
  } else {
    res.redirect('/users/homepage/' + loggedToken.user.email)
  }
})

//Consulta de utilizador por nome/email
router.get('/',passport.authenticate('jwt',{session:false}), (req,res) => {
  var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
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
    if(loggedToken.user.role == 'admin') {
      userController.consultaTodos()
        .then(dados => res.jsonp(dados))
        .catch(error => res.status(500).send('Erro na consulta de utilizadores'))
    } else {
      res.jsonp({message: 'Não tem permissão para consultar todos os utilizadores'})
    }
  } 
})

router.get('/admin/listExports',passport.authenticate('jwt',{session:false}),(req,res) => {
  var loggedToken = jwt.verify(req.query.access_token,'myFacebook',jwt_options.verifyOptions)
  if(loggedToken.user.role == 'admin') {
    console.log(__dirname + '/../../public/uploaded/' + loggedToken.user.email + '/exports/')
    var files = fs.readdirSync(__dirname + '/../../public/uploaded/' + loggedToken.user.email + '/exports/')
    var farray = new Array()
    for(var i = 0; i < files.length; i++) {
      var obj = new Object()
      var path = 'http://localhost:3000/uploaded/' + loggedToken.user.email + '/exports/'
      path = path + files[i]
      obj.nome = files[i]
      obj.link = path
      farray.push(obj)
    }
    res.jsonp(farray)
  } else {
    res.redirect('/users/homepage/' + loggedToken.user.email)
  }
})

router.post('/admin/import',passport.authenticate('jwt',{session:false}),(req,res) => {
  var loggedToken = jwt.verify(req.body.access_token,'myFacebook',jwt_options.verifyOptions)
  if(loggedToken.user.role == 'admin') {
    userController.importar(req.body.data)
      .then(msg => res.jsonp('Importação de utilizadores bem sucedida!'))
      .catch(error => res.jsonp('erro na importação de utilizadores'))
  } else {
    res.status(401).send('Não está autorizado!')
  }
})

//Consulta dos favoritos de um user
router.get('/favorites',passport.authenticate('jwt',{session:false}), (req,res) => {
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

router.post('/favorites',passport.authenticate('jwt',{session:false}),(req,res) => {
  var data = {
    email: req.body.favoriteEmail,
    nome: req.body.favoriteNome
  }
  console.log(data)
  userController.adicionarFavorito(req.body.email,data)
  res.jsonp({info: "Favorito adicionado com sucesso!"})
})

router.delete('/favorites',passport.authenticate('jwt',{session:false}),(req,res) => {
  var data = {
    email: req.query.favoriteEmail,
    nome: req.query.favoriteNome
  }
  userController.removerFavorito(req.query.email,data)
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

router.put('/',passport.authenticate('jwt',{session:false}),(req,res) => {
  var data = req.body
  var loggedToken = jwt.verify(data.access_token,'myFacebook',jwt_options.verifyOptions)
  if(loggedToken.user.email == data.email) {
    if(data.oldPass) {
      //update password
      userController.consultaEmail(data.email)
      .then(userData => {
        bcrypt.compare(data.oldPass,userData.password,async (error,result) => {
          if(error) res.jsonp({info: error})
          else if(result) {
            var hash_newpass = await bcrypt.hash(data.newPass,10)
            userController.atualizarPassword(data.email,hash_newpass)
            res.jsonp({info: 'Alteração efetuada com sucesso!'})
          } else {
            res.jsonp({info: 'A password antiga que inseriu não coincide com os nossos registos!'})
          }
        }) 
          
          
      })
    } else {
      //update profile data
      var user = data
      delete user.access_token
      userController.atualizarDados(user.email,user)
        .then(() => res.jsonp({info: 'Atualização bem sucedida!'}))
        .catch(error => res.status(500).send(JSON.stringify(error)) )
    }
  }
    
})

module.exports = router;
