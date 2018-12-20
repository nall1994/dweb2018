var passport = require('passport')
var localStrategy = require('passport-local').Strategy
var userModel = require('../models/user')

//Se bem sucedida, a função que recebe o resultado deve criar o token jwt
passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email,password,done) => {
    try {
        //pedir ao userController a pesquisa por email
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

passport.use(new JWTStrategy({
    secretOrKey: 'myFacebook',  
    jwtFromRequest: ExtractJWT.fromExtractors([extractFromSession,extractFromUrl])
}, async (token,done) => {
    try{
        return done(null,token.user)
    }
    catch(error){
        return done(error)
    }
}))