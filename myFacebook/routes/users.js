var express = require('express');
var router = express.Router();
var passport = require('passport')
var jwt = require('jsonwebtoken')
var jwt_options = require('../auth/jwt_options')
var axios = require('axios')
var fs = require('fs')
var formidable = require('formidable')



router.get('/homepage/:email',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
        
  var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)   
      req.query.access_token = req.session.token
      req.query.email = req.params.email
      axiosConfig = {
        params: req.query
      }
      if(loggedToken.user.email == req.params.email) {
        //present user_home
        var pubs = new Object()
        var groupsInfo = new Object()
        axios.get('http://localhost:3000/api/pubs/fromUser', axiosConfig)
          .then(dadospubs => {
            pubs = dadospubs.data
            for(var i = 0; i< pubs.length; i++) {
              var pubClass = pubs[i].classificacoes
              var newClass = new Array()
              for(var j = 0; j < pubClass.length; j++) {
                var url = 'http://localhost:3000/pubs/' + req.params.email + '/filter?dataMinima=&filtroHashtag=' + pubClass[j]
                var obj = new Object()
                obj.nome = pubClass[j]
                obj.url = url
                newClass.push(obj)
              }
              pubs[i].classificacoes = newClass
            }
            axios.get('http://localhost:3000/api/groups/withUser', axiosConfig)
              .then(dadosGroups => {
                groupsInfo = dadosGroups.data
                axios.get('http://localhost:3000/api/users/?email='+loggedToken.user.email,axiosConfig)
                    .then((dadosUser) => {
                      res.render('user_home',{userData: dadosUser.data, userPubs: pubs, numPubs : pubs.length, groupData: groupsInfo, numGroups: groupsInfo.length});
                    }).catch((err) => {
                      res.render('error',{error : err})
                });
            //    res.jsonp(pubs)
              })
              .catch(error => res.render('error',{e: error+"In Groups API"}))
            //  res.jsonp(pubs)
          })
          .catch(error => res.render('error',{e: error}))

      } else {
        //present guest_home
          axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              
              var pubs = new Object()
              var groupsInfo = new Object()
              axios.get('http://localhost:3000/api/pubs/fromUser', axiosConfig)
                .then(dadospubs => {
                  pubs = dadospubs.data
                  for(var i = 0; i< pubs.length; i++) {
                    var pubClass = pubs[i].classificacoes
                    var newClass = new Array()
                    for(var j = 0; j < pubClass.length; j++) {
                      var url = 'http://localhost:3000/pubs/' + req.params.email + '/filter?dataMinima=&filtroHashtag=' + pubClass[j]
                      var obj = new Object()
                      obj.nome = pubClass[j]
                      obj.url = url
                      newClass.push(obj)
                    }
                    pubs[i].classificacoes = newClass
                  }
                  axios.get('http://localhost:3000/api/groups/withUser', axiosConfig)
                    .then(dadosGroups => {
                      groupsInfo = dadosGroups.data
                      axios.get('http://localhost:3000/api/users',axiosConfig)
                          .then((dadosUser) => {
                            console.log("user:");
                            console.log(JSON.stringify(dadosUser.data));
                            dadosUser.data.origin_email = loggedToken.user.email
                            res.render('guest_home',{userData: dadosUser.data, userPubs: pubs , numPubs : pubs.length , isFavorito : isFav})
      
                          }).catch((err) => {
                            
                            res.render('error',{error : err})
                      });
                  //    res.jsonp(pubs)
                    })
                    .catch(error => res.render('error',{e: error+"In Groups API"}))
                  //  res.jsonp(pubs)
                })
                .catch(error => res.render('error',{e: error}))
                
          })
          .catch(erro => {res.render('error',{e: erro}); return false  })
      }
      //É preciso ir buscar os dados do utilizador, as suas publicações e os grupos aos quais pertence!
      //Se o email que email que vem no url é diferente do que está logado devemos apresentar a página guest_home
      //Caso contrário devemos apresentar a página user_home
      
      
      
        

      //Aqui já podemos fazer o render da homepage e passar-lhe os dois objetos e também o req.user
    })
  
  router.get('/profile/:email', passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var profileAsked = req.params.email
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    req.query.access_token = req.session.token
    req.query.email = loggedUser
    axiosConfig = {
      params: req.query
    }
    if(loggedUser != profileAsked) {
      res.redirect('/users/profile/' + loggedUser)
    } else {
      axios.get('http://localhost:3000/api/users', axiosConfig)
        .then(dadosUser => {
          res.render('profile',{userData: dadosUser.data})
        })
        .catch(error => res.render('error',{e: error}))
    }

  })

  router.post('/addToFavorites',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    req.body.access_token = req.session.token
    req.body.email = loggedToken.user.email
    axios.post('http://localhost:3000/api/users/addToFavorites',req.body)
      .then(msg =>{
         res.jsonp({info: msg.data.info})
      })
      .catch(error => res.render('error',{e: error}))
  })
  
  router.post('/remFromFavorites',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    req.body.access_token = req.session.token
    req.body.email = loggedToken.user.email
    axios.post('http://localhost:3000/api/users/remFromFavorites',req.body)
      .then(msg =>{
         res.jsonp({info: msg.data.info})
      })
      .catch(error => res.render('error',{e: error}))
  })


  router.post('/updateProfile/:email', passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}), (req,res) => {
    var profileToUpdate = req.params.email
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    req.query.access_token = req.session.token
    req.query.email = loggedUser
    axiosConfig = {
      params: req.query
    }
    if(profileToUpdate != loggedUser) {
      res.redirect('/users/profile/' + loggedUser)
    } else {
      var form = formidable.IncomingForm()
      form.parse(req,(erro,fields,files) => {
        if(files.foto.size > 0) {
          var fenviado = files.foto.path
          var fnovo = __dirname + "/../public/uploaded/" + fields.email + "/" + files.foto.name
          fs.renameSync(fenviado,fnovo)
          fields.foto = "http://localhost:3000/uploaded/" + fields.email + "/" + files.foto.name
        }
        axios.get('http://localhost:3000/api/users',axiosConfig)
          .then(userData => {
            var user = userData.data
              user.morada = fields.morada
              user.foto = fields.foto
              user.dataAniversario = fields.dataAniversario
              user.nome = fields.nome
              user.profissao = fields.profissao
              user.instituicao = fields.instituicao
              user.access_token = req.session.token
              axios.post('http://localhost:3000/api/users/updateProfile',user)
                .then(message => res.render('profile',{userData: user,info: message.data}))
                .catch(error => res.render('error',{e:error}))
          })
          .catch(error => res.render('error' ,{e: error}))
        })
      }
    })

  router.post('/updatePassword/:email',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var profileToUpdate = req.params.email
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var loggedUser = loggedToken.user.email
    if(profileToUpdate != loggedUser) {
      res.redirect('profile/' + loggedUser)
    } else {
      req.body.email = loggedUser
      req.body.access_token = req.session.token
      axios.post('http://localhost:3000/api/users/updatePassword',req.body)
        .then(msg => res.jsonp({info: msg.data.info}))
        .catch(error => res.render('error',{e: error}))
    }
  })
  
  //Retornar formulário de registo
  router.get('/registo',  (req,res) => {
    res.render('registo')
  })
  
  
  //Retornar formulário de login
  router.get('/login', (req,res) => {
    res.render('login')
  })

  router.post('/search',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    req.body.access_token = req.session.token
    axios.post("http://localhost:3000/api/users/search",req.body)
      .then(dados => res.jsonp(dados.data))
      .catch(error => res.render('error',{e: error}))
  })
  
  //Registar um utilizador
  router.post('/', (req,res) => {
    axios.post('http://localhost:3000/api/users', req.body)
      .then(() => {
        if(!fs.existsSync('public/uploaded/' + req.body.email))
          fs.mkdirSync('public/uploaded/' + req.body.email)
        res.redirect('/users/login')
      })
      .catch(erro => res.render('error', {e: erro}))
  })

  router.get('/admin/login',(req,res) => {
    res.render('admin_login')
  })

  router.get('/admin/homepage',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    var user = loggedToken.user
    if(user.role == 'admin') {
      obj = {
        access_token : req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/count',axiosConfig)
        .then(userCount => {
          userCount = userCount.data.resultado
          axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
            .then(pubsTotal => {
              pubsTotal = pubsTotal.data.resultado
              obj.tipo = 'receita'
              axiosConfig.params = obj
              axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                .then(pubsReceita => {
                  pubsReceita = pubsReceita.data.resultado
                  obj.tipo = 'ideia'
                  axiosConfig.params = obj
                  axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                    .then(pubsIdeia => {
                      pubsIdeia = pubsIdeia.data.resultado
                      obj.tipo = 'formacao'
                      axiosConfig.params = obj
                      axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                        .then(pubsFormacao => {
                          pubsFormacao = pubsFormacao.data.resultado
                          obj.tipo = 'evento'
                          axiosConfig.params = obj
                          axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                            .then(pubsEvento => {
                              pubsEvento = pubsEvento.data.resultado
                              obj.tipo = 'eventoProfissional'
                              axiosConfig.params = obj
                              axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                                .then(pubsEventoProfissional => {
                                  pubsEventoProfissional = pubsEventoProfissional.data.resultado
                                  obj.tipo = 'desportivo'
                                  axiosConfig.params = obj
                                  axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                                    .then(pubsDesportivo => {
                                      pubsDesportivo = pubsDesportivo.data.resultado
                                      obj.tipo = 'album'
                                      axiosConfig.params = obj
                                      axios.get('http://localhost:3000/api/pubs/count',axiosConfig)
                                        .then(pubsAlbum => {
                                          pubsAlbum = pubsAlbum.data.resultado
                                          obj = {
                                            access_token: req.session.token
                                          }
                                          axiosConfig = {
                                            params: obj
                                          }
                                          axios.get('http://localhost:3000/api/groups/count',axiosConfig)
                                            .then(gruposCount => {
                                              gruposCount = gruposCount.data.resultado
                                              axios.get('http://localhost:3000/api/users/admin/listExports',axiosConfig)
                                                .then(filesArray => {
                                                  filesArray = filesArray.data
                                                  data = {
                                                    users: userCount,
                                                    groups: gruposCount,
                                                    pubs: pubsTotal,
                                                    pubsReceita: pubsReceita,
                                                    pubsIdeia: pubsIdeia,
                                                    pubsEvento: pubsEvento,
                                                    pubsEventoProfissional: pubsEventoProfissional,
                                                    pubsDesportivo: pubsDesportivo,
                                                    pubsFormacao: pubsFormacao,
                                                    pubsAlbum: pubsAlbum,
                                                    ficheiros: filesArray
                                                  }
                                                  res.render('admin_homepage', {dados: data})
                                                })
                                                .catch(error => res.render('error',{e: error}))
                                            }).catch(error => res.render('error',{e: error}))
                                        }).catch(error => res.render('error',{e: error}))
                                    }).catch(error => res.render('error',{e: error}))
                                }).catch(error => res.render('error',{e: error}))
                            }).catch(error => res.render('error',{e: error}))
                        }).catch(error => res.render('error',{e: error}))
                    }).catch(error => res.render('error',{e: error}))
                }).catch(error => res.render('error',{e: error}))
            }).catch(error => res.render('error',{e: error}))
        }).catch(error => res.render('error',{e: error}))
    } else {
      res.redirect('/users/homepage/' + user.email)
    }
    
  })

  router.post('/admin/import',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
      var form = formidable.IncomingForm()
      form.parse(req,(erro,fields,files) => {
        var data_type = fields.data_type
        var fenviado = files.import_file.path
        var data = new Date()
        var ano = data.getFullYear()
        var mes = data.getMonth() + 1
        var dia = data.getDay()
        var hora = data.getHours()
        var minutos = data.getMinutes()
        var segundos = data.getSeconds()
        data = dia + '_' + mes + '_' + ano + '__' + hora + 'h_' + minutos + 'm_' + segundos + 's_'
        var fnovo = __dirname + '/../public/uploaded/' + loggedToken.user.email + '/imports/' + data + files.import_file.name
        fs.renameSync(fenviado,fnovo)
        fs.readFile(fnovo,(erro,dados) => {
          if(erro) res.jsonp('erro ao ler o ficheiro submetido')
          else {
            var data = JSON.parse(dados)
            axiosConfig = {
              access_token: req.session.token
            }

            if(data_type == 'users') {
              if(!Array.isArray(data)) {
                res.jsonp('Formato de ficheiro de utilizadores não reconhecido!')
              } else {
                axiosConfig.data = data
                axios.post('http://localhost:3000/api/users/admin/import',axiosConfig)
                  .then(message => {
                     fs.unlinkSync(fnovo)
                     res.jsonp(message.data)
                  })
                  .catch(error => res.jsonp('Ocorreu um erro na importação! Tenha a certeza que o ficheiro que inseriu é válido!'))
              }
              
            } else if(data_type =='pubs') {
              if(!Array.isArray(data)) {
                res.jsonp('Formato de ficheiro de publicações não reconhecido!')
              } else {
                axiosConfig.data = data
                axios.post('http://localhost:3000/api/pubs/admin/import',axiosConfig)
                .then(message => {
                  fs.unlinkSync(fnovo)
                  res.jsonp(message.data)
                })
                .catch(error => res.jsonp('Ocorreu um erro na importação! Tenha a certeza que o ficheiro que inseriu é válido!'))
              }
            
            } else if(data_type == 'groups') {
              if(!Array.isArray(data)) {
                res.jsonp('Formato de ficheiro de grupos não reconhecido!')
              } else {
                axiosConfig.data = data
                axios.post('http://localhost:3000/api/groups/admin/import',axiosConfig)
                .then(message => {
                  fs.unlinkSync(fnovo)
                  res.jsonp(message.data)
                })
                .catch(error => res.jsonp('Ocorreu um erro na importação! Tenha a certeza que o ficheiro que inseriu é válido!'))
              }          

            } else if(data_type == 'all') {
                if(!(data.users && data.pubs && data.groups)) {
                  res.jsonp('Formato de ficheiro de todos os dados não reconhecido!')
                } else {
                  axiosConfig.data = data.users
                  axios.post('http://localhost:3000/api/users/admin/import',axiosConfig)
                    .then(msg => {
                      axiosConfig.data = data.pubs
                      axios.post('http://localhost:3000/api/pubs/admin/import',axiosConfig)
                        .then(msg => {
                          axiosConfig.data = data.groups
                          axios.post('http://localhost:3000/api/groups/admin/import',axiosConfig)
                            .then(msg =>{
                              fs.unlinkSync(fnovo)
                              res.jsonp('Importação de dados bem sucedida')
                            })
                            .catch(error => res.jsonp('Ocorreu um erro na importação! Tenha a certeza que os grupos no ficheiro são válidas!'))
                        })
                        .catch(error => res.jsonp('Ocorreu um erro na importação! Tenha a certeza que as publicações no ficheiro são válidas!'))
                    })
                    .catch(error => res.jsonp('Ocorreu um erro na importação! Tenha a certeza que os utilizadores no ficheiro são válidas!'))
                }
            }
          }
        })
      })
    } else {
      res.redirect('/users/homepage/' + loggedToken.user.email)
    }
  })

  router.post('/admin/export',passport.authenticate('jwt',{session:false, failureRedirect:'/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    obj = {
      access_token: req.session.token
    }
    axiosConfig = {
      params: obj
    }
    if(loggedToken.user.role == 'admin') {
      var data_type = req.body.data_type
      if(data_type == 'users') {
        axios.get('http://localhost:3000/api/users',axiosConfig)
          .then(users => {
            users = users.data
            var data = new Date()
            var ano = data.getFullYear()
            var mes = data.getMonth() + 1
            var dia = data.getDay()
            var hora = data.getHours()
            var minutos = data.getMinutes()
            var segundos = data.getSeconds()
            data = dia + '_' + mes + '_' + ano + '__' + hora + 'h_' + minutos + 'm_' + segundos + 's_'
            var path = __dirname + '/../public/uploaded/' + loggedToken.user.email + '/exports/' + data + 'users.json'
            fs.writeFile(path,JSON.stringify(users,null,4), err => {
              if(err) res.jsonp(JSON.stringify(err))
              else res.jsonp('Exportação de utilizadores bem sucedida!')
            })
          }).catch(error => res.jsonp('ocorreu um erro ao exportar'))
      } else if(data_type == 'groups') {
        axios.get('http://localhost:3000/api/groups',axiosConfig)
          .then(groups => {
            groups = groups.data
            var data = new Date()
            var ano = data.getFullYear()
            var mes = data.getMonth() + 1
            var dia = data.getDay()
            var hora = data.getHours()
            var minutos = data.getMinutes()
            var segundos = data.getSeconds()
            data = dia + '_' + mes + '_' + ano + '__' + hora + 'h_' + minutos + 'm_' + segundos + 's_'
            var path = __dirname + '/../public/uploaded/' + loggedToken.user.email + '/exports/' + data + 'groups.json'
            fs.writeFile(path,JSON.stringify(groups,null,4), err => {
              if(err) res.jsonp(JSON.stringify(err))
              else res.jsonp('Exportação de grupos bem sucedida!')
            })
          }).catch(error => res.jsonp('ocorreu um erro ao exportar'))

      } else if(data_type == 'pubs') {
        axios.get('http://localhost:3000/api/pubs',axiosConfig)
          .then(pubs => {
            pubs = pubs.data
            var data = new Date()
            var ano = data.getFullYear()
            var mes = data.getMonth() + 1
            var dia = data.getDay()
            var hora = data.getHours()
            var minutos = data.getMinutes()
            var segundos = data.getSeconds()
            data = dia + '_' + mes + '_' + ano + '__' + hora + 'h_' + minutos + 'm_' + segundos + 's_'
            var path = __dirname + '/../public/uploaded/' + loggedToken.user.email + '/exports/' + data + 'pubs.json'
            fs.writeFile(path,JSON.stringify(pubs,null,4), err => {
              if(err) res.jsonp(JSON.stringify(err))
              else res.jsonp('Exportação de publicações bem sucedida!')
            })
          }).catch(error => res.jsonp('ocorreu um erro ao exportar'))

      } else if(data_type == 'all') {
        axios.get('http://localhost:3000/api/users',axiosConfig)
          .then(users => {
            users = users.data
            axios.get('http://localhost:3000/api/pubs',axiosConfig)
              .then(pubs => {
                pubs = pubs.data
                axios.get('http://localhost:3000/api/groups',axiosConfig)
                  .then(groups => {
                    groups = groups.data
                    var data = new Date()
                    var ano = data.getFullYear()
                    var mes = data.getMonth() + 1
                    var dia = data.getDay()
                    var hora = data.getHours()
                    var minutos = data.getMinutes()
                    var segundos = data.getSeconds()
                    data = dia + '_' + mes + '_' + ano + '__' + hora + 'h_' + minutos + 'm_' + segundos + 's_'
                    var path = __dirname + '/../public/uploaded/' + loggedToken.user.email + '/exports/' + data + 'all.json'
                    var all = new Object()
                    all.users = users
                    all.pubs = pubs
                    all.groups = groups
                    fs.writeFile(path,JSON.stringify(all,null,4), err => {
                      if(err) res.jsonp(JSON.stringify(err))
                      else res.jsonp('Exportação de todos os dados bem sucedida!')
                    })
                  }).catch(error => res.jsonp('ocorreu um erro ao exportar'))
              }).catch(error => res.jsonp('ocorreu um erro ao exportar'))
          }).catch(error => res.jsonp('ocorreu um erro ao exportar'))

      }
    } else {
      res.redirect('/users/homepage/' + loggedToken.user.email)
    }
  })

  router.get('/admin/profile',passport.authenticate('jwt',{session:false, failureRedirect:'/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
      obj = {
        access_token: req.session.token,
        email: loggedToken.user.email
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users',axiosConfig)
        .then(userData => {
          userData = userData.data
          res.render('admin_profile',{userData: userData})
        }).catch(erro => res.render('error',{e: error}))
    } else {
      res.redirect('/users/homepage/' + loggedToken.user.email)
    }
  })

  router.post('/admin/profile/updatePassword',passport.authenticate('jwt',{session:false,failureRedirect:'/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
      req.body.email = loggedToken.user.email
      req.body.access_token = req.session.token
      if(req.body.newPassword != req.body.confirmNewPassword) {
        obj = {
          access_token : req.session.token,
          email: loggedToken.user.email
        }
        axiosConfig = {
          params: obj
        }
        axios.get('http://localhost:3000/api/users',axiosConfig)
          .then(userData => {
            userData = userData.data
            res.render('admin_profile',{error: 'Os campos de password nova não coincidem!',userData: userData})
          })
        
      } else {
        axios.post('http://localhost:3000/api/users/admin/profile/updatePassword',req.body)
        .then(msg => {
          if(msg.data.error) {
            console.log(msg.data.error)
            res.render('admin_profile',{error: msg.data.error, userData: msg.data.userData})
          } 
          else if(msg.data.info) {
            console.log(msg.data.info)
            res.render('admin_profile',{info: msg.data.info, userData: msg.data.userData})
          } 
        })
        .catch(error => res.render('error',{e: error}))
      }  
    } else {
      res.redirect('/users/homepage/' + loggedToken.user.email)
    }
  })

  router.get('/admin',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
      res.render('registo_admin')
    } else {
      res.redirect('/users/homepage/' + loggedToken.user.email)
    }
  })

  router.post('/admin',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
    var loggedToken = jwt.verify(req.session.token,'myFacebook',jwt_options.verifyOptions)
    if(loggedToken.user.role == 'admin') {
      req.body.access_token = req.session.token
      axios.post('http://localhost:3000/api/users/admin', req.body)
      .then(() => {
        if(!fs.existsSync('public/uploaded/' + req.body.email)) {
          fs.mkdirSync('public/uploaded/' + req.body.email)
          fs.mkdirSync('public/uploaded/' + req.body.email + '/imports')
          fs.mkdirSync('public/uploaded/' + req.body.email + '/exports')
        }
        res.redirect('/users/admin/login')
      })
      .catch(erro => res.render('error', {e: erro}))
    } else {
      res.redirect('/users/homepage/' + loggedToken.user.email)
    }
  })


  router.post('/admin/login',(req,res) => {
    axios.post('http://localhost:3000/api/users/admin/login',req.body)
      .then(data => {
        if(data.data.authError) res.render('admin_login',{errorMessage: data.data.authError})
        else {
          var user = data.data
          req.login(user,{session:false},async error => {
            if(error) res.render('error',{e: error})
            var loggedUser = {email:user.email,role: user.role,nome:user.nome}
            var token = jwt.sign({user:loggedUser},'myFacebook',jwt_options.signOptions)
            req.session.token = token
            res.redirect('/users/admin/homepage')
          })
        }
      })
  })

  router.get('/logout',(req,res) => {
      req.logout()
      req.session.destroy(() => {
        res.clearCookie("connect.sid")
        res.redirect('/')
      })
    
  })
  
  //Fazer o login de um utilizador
  router.post('/login',(req,res) => {
    axios.post('http://localhost:3000/api/users/login', req.body)
      .then(data => {
        if(data.data.authError) res.render('login',{errorMessage: data.data.authError})
        else{
          var user = data.data
          req.login(user,{session:false}, async error => {
            if(error) res.render('error',{e: error})
            var loggedUser = {email:user.email, role:user.role, nome:user.nome}
            var token = jwt.sign({user: loggedUser}, 'myFacebook',jwt_options.signOptions)
            req.session.token = token
            res.redirect('/users/homepage/' + user.email)
          })
        }    
      })
      .catch(erro =>{
        res.render('error', {e: erro})
      } )
})


module.exports = router