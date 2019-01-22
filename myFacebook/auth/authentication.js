var passport = require('passport')
var localStrategy = require('passport-local').Strategy
var userModel = require('../models/user')
var userController = require('../controllers/Users')
var facebookStrategy = require('passport-facebook').Strategy
var fbconfig = require('./extraSignInOptions')

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

//Autenticação via facebook
/*passport.use('facebook', new facebookStrategy({
    clientID : fbconfig.app_id,
    clientSecret: fbconfig.app_secret,
    callbackURL: fbconfig.callbackUrl,
    profileFields: ["name","emails","photos"]
},
    (access_token,refresh_token,profile,done) => {
        process.nextTick(() => {
            userModel.findOne({email: profile.emails[0].value}, (err,user) => {
                if(err) return done(err)
                if(user) return done(null,user)
                else {
                    var newUser = new userModel()
                    newUser.email = profile.emails[0].value
                    newUser.password = access_token
                    newUser.nome = profile.name.givenName + " " + profile.name.familyName
                    newUser.foto = profile.photos ? profile.photos[0].value : '/images/unknown_user.jpg'
                    newUser.role = 'user'
                    newUser = userController.iniciarDefault(newUser)
                    newUser.save(err => {
                        if(err) throw err
                        return done(null,newUser)
                    })
                }
            })
        })
    }
))*/

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