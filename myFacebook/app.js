var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var passport = require('passport')
var mongoose = require('mongoose')
var uuid = require('uuid/v4')
var session = require('express-session')
var FileStore = require('session-file-store')(session)

require('./auth/authentication')

var indexRouter = require('./routes/index');
var apiUsersRouter = require('./routes/api/users');
var apiPubsRouter = require('./routes/api/pubs')
var apiGroupsRouter = require('./routes/api/groups')
var usersRouter = require('./routes/users')
var pubsRouter = require('./routes/pubs')
var groupsRouter = require('./routes/groups')

var axios = require('axios')
axios.defaults.withCredentials = true

var app = express();

//Conexão à base de dados
mongoose.connect('mongodb://127.0.0.1:27017/myFacebook',{useNewUrlParser:true})
  .then(() => console.log('Mongo Ready: ' + mongoose.connection.readyState))
  .catch(erro => console.log('erro de conexão: ' + erro))

//Configuração da sessão
app.use(session({
  genid: () => {
    return uuid()
  },
  store: new FileStore(),
  secret: 'myFacebook',
  resave: false,
  saveUninitialized: false
}))

//inicialização do passport
app.use(passport.initialize())
app.use(passport.session())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pubs',pubsRouter)
app.use('/groups',groupsRouter)
app.use('/api/users', apiUsersRouter);
app.use('/api/groups',apiGroupsRouter);
app.use('/api/pubs',apiPubsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
