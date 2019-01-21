var passport = require('passport')
var localStrategy = require('passport-local').Strategy
var userModel = require('../models/user')

//Se bem sucedida, a função que recebe o resultado deve criar o token jwt
passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email,password,done) => {
    try {
        var user = await userModel.findOne({email})
        if(!user) return done(null,false, {message: 'Utilizador inserido não existe!'})
        var valid = await user.isValidPassword(password)
        if(!valid) return done(null,false, {message: 'A password inserida não coincide!'})

        return done(null,user,{message: 'login feito com sucesso!'})
    }
    catch (error) {
        return done(error)
    }
}))

//Serialização do utilizador
passport.serializeUser((user,done) => {
    done(null,user.email)
  })
  
  //Desserialização do utilizador
  passport.deserializeUser((email,done) => {
      var axiosConfig = {
          access_token: req.session.token,
          email: email
      }
    axios.get('http://localhost:3000/api/users', axiosConfig)
      .then(dados => done(null,dados.data))
      .catch(erro => done(erro,false))
  })



// Autenticação com JWT
var JWTStrategy = require('passport-jwt').Strategy
var ExtractJWT = require('passport-jwt').ExtractJwt

var extractFromSession = function(req) {
    var token = null
    if(req && req.session) token = req.session.token
    return token
}

var extractFromUrl = req => {
    var token = null
    if(req) token = req.query.access_token
    return token
}

var extractFromBody = req => {
    var token = null
    if(req) token = req.body.access_token
    return token
}

passport.use(new JWTStrategy({
    secretOrKey: 'myFacebook',  
    jwtFromRequest: ExtractJWT.fromExtractors([extractFromSession,extractFromUrl,extractFromBody])
}, async (token,done) => {
    try{
        return done(null,token.user)
    }
    catch(error){
        return done(error)
    }
}))