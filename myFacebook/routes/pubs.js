var express = require('express');
var router = express.Router();
var axios = require('axios')
var formidable = require("formidable")
var fs = require("fs")
var passport = require('passport')


//Registo de comentários
router.post('/newComment',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res)=>{

  req.body.access_token = req.session.token
  axios.post('http://localhost:3000/api/pubs/newComment',req.body)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))

})

//Registar publicação sem ficheiros
router.post('/newPub',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res)=>{

  req.body.access_token = req.session.token
  console.log('got here!')
  if(req.body.tipo == 'evento') {
    var newDate = ""
    console.log(req.body.dados.evento.dataEvento)
    var d = req.body.dados.evento.dataEvento.split("-")
    for(var i = 2; i>=0; i--) {
      if(i == 0) newDate += d[i]
      else newDate += d[i] + "-"
    }
    req.body.dados.evento.dataEvento = newDate
  }
  
  
  axios.post('http://localhost:3000/api/pubs/newPub',req.body)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))

})

//Registar publicação evento profissional
router.post('/newEventoProf',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res)=>{
  console.log("\nPOST\n");

  var form = new formidable.IncomingForm()
  form.parse(req,(erro,fields,data)=>{
    if (erro) {
      console.log(erro);
      res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'+erro}))
    }
    var path = []
    for(var i=0; i<fields.nfiles;i++) {
        console.log(data["ficheiro"+i].name);
        var fenviado =  data["ficheiro"+i].path
        var fnovo = __dirname + "/../public/uploaded/" + fields.origin_email  + '/'  + data["ficheiro"+i].name
        console.log("\nFNOVO"+fnovo)
        fs.rename(fenviado,fnovo,erro => {
          if(erro){ 
              res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'}))
          }
          else console.log("Ficheiro armazenado com sucesso");
          
        })
        path.push("http://localhost:3000/uploaded/"+ fields.origin_email  + '/'  + data["ficheiro"+i].name)
      }

      var newDate = ""
      var d = fields.dataEvento.split("-")
      for(var i = 2; i>=0; i--) {
        if(i == 0) newDate += d[i]
        else newDate += d[i] + "-"
      }
      var data = {
                    titulo : fields.titulo,
                    descricao:fields.descricao,
                    dataEvento : newDate,
                    local:fields.local,
                    oradores : fields.oradores,
                    ficheiros : path
            }            
      data_eventoProf ={eventoProfissional: data}
      var evento = {
                dados:data_eventoProf,
                isPrivate:fields.isPrivate,
                data:fields.data,
                tipo:fields.tipo,
                origin_email: fields.origin_email,
                classificacoes : fields.classificacoes
      }
      evento.access_token = req.session.token
      axios.post('http://localhost:3000/api/pubs/newPub',evento)
                .then(message => {
                  console.log(JSON.stringify(message))
                  res.jsonp(message)
                })
                .catch(erro => res.render('error', {e: erro}))
  })

})

router.post('/:pubid/delete',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
  var pubid = req.params.pubid
  obj = {
    access_token: req.session.token
  }

  axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
    .then(pub => {
      pub = pub.data
      if(pub.tipo == 'album') {
        var fotos = pub.dados.album.fotos
        for(var i = 0; i< fotos.length;i++) {
          var element = fotos[i].foto.split('/')
          var file_name = element[element.length - 1]
          var path = __dirname + '/../public/uploaded/' + req.user.email + '/' + file_name
          fs.unlink(path,err => {
            if(err) throw err
          })
        }

      } else if(pub.tipo == 'eventoProfissional') {
        var files_array = pub.dados.eventoProfissional.ficheiros
        for(var i = 0; i< files_array.length; i++) {
          var element = files_array[i].split('/')
          var file_name = element[element.length-1]
          var path = __dirname + '/../public/uploaded/' + req.user.email + '/' + file_name
          fs.unlink(path,err => {
            if(err) throw err
          })
        }

      } else if(pub.tipo == 'desportivo') {
        var fotos_array = pub.dados.desportivo.fotos
        var gpx_file = pub.dados.desportivo.ficheiro_gpx
        for(var i = 0; i< fotos_array.length; i++) {
          var element = fotos_array[i].split('/')
          var file_name = element[element.length-1]
          var path = __dirname + '/../public/uploaded/' + req.user.email + '/' + file_name
          console.log(path)
          fs.unlink(path,err => {
            if(err) throw err
          })
        }
        var element = gpx_file.split('/')
        var file_name = element[element.length -1]
        var path = __dirname + '/../public/uploaded/' + req.user.email + '/' + file_name
        console.log(path)
        fs.unlink(path,err => {
          if(err) throw err
        })
      }

      axios.post('http://localhost:3000/api/pubs/' + pubid + '/delete',obj)
        .then(m => res.redirect('/users/homepage/' + req.user.email))
        .catch(error => res.render('error',{e: error}))
    }).catch(error => res.render('error',{e: error}))

  
})

router.get('/edit/:pubid',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}), (req,res) => {
  var id_pub = req.params.pubid
  obj = {
    access_token: req.session.token
  }
  axiosConfig = {
    params: obj
  }
  var loggedUser = req.user.email
  axios.get('http://localhost:3000/api/pubs/' + id_pub, axiosConfig)
    .then(pub => {
      pub = pub.data
      if(pub.origin_email == loggedUser) {
        obj.email = loggedUser
        axiosConfig = {params: obj}
        axios.get('http://localhost:3000/api/users', axiosConfig)
          .then(userdata => {
            if(pub.tipo == 'receita') {
              pub.dados.receita.ingredientes = pub.dados.receita.textoEstruturado.split(';')[0]
              pub.dados.receita.instrucoes = pub.dados.receita.textoEstruturado.split(';')[1]
            } else if(pub.tipo == 'evento') {
              pub.dados.evento.dataEvento = pub.dados.evento.dataEvento.split(" ")[0].split("-")
              console.log(pub.dados.evento.dataEvento)
              var newDate = ""
              for(var i = 2; i >= 0; i--) {
                if(i == 0) newDate += pub.dados.evento.dataEvento[i]
                else newDate += pub.dados.evento.dataEvento[i] + "-"
                console.log(newDate)
              }
              pub.dados.evento.dataEvento = newDate
            } else if(pub.tipo == 'eventoProfissional') {
              pub.dados.eventoProfissional.dataEvento = pub.dados.eventoProfissional.dataEvento.split(" ")[0].split("-")
              var newDate = ""
              for(var i = 2; i >= 0; i--) {
                if(i == 0) newDate += pub.dados.eventoProfissional.dataEvento[i]
                else newDate += pub.dados.eventoProfissional.dataEvento[i] + "-"
              }
              pub.dados.eventoProfissional.dataEvento = newDate
            } else if(pub.tipo=='album') {
              var dataHoje = new Date().toISOString().split('T')[0]
              pub.dados.album.dataHoje = dataHoje
            }
            console.log(pub)          
            res.render('editpub',{publicacao: pub, classificadores: userdata.data.classificadores})
          } )
          .catch(error => res.render('error',{e: error}))    
      }    
      else res.redirect('/users/homepage/' + loggedUser)
    })
    .catch(error => res.render('error',{e: error}))
})

router.post('/edit/:pubid',passport.authenticate('jwt',{session:false, failureRedirect:'/users/login'}),(req,res) => {
  var pubid = req.params.pubid
  var form = formidable.IncomingForm()
  obj = {
    access_token: req.session.token
  }
  axiosConfig = {
    params: obj
  }

  form.parse(req,(erro,fields,files) => {
    var tipo = fields.tipo
    var email = fields.origin_email
    var loggedUser = req.user.email
    if(loggedUser != email) {
      res.redirect('/users/homepage/' + loggedUser)
    } else {
      if(tipo == 'receita') {
        axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
          .then(pub => {
            pub = pub.data
            var te = fields.ingredientes + ";" + fields.instrucoes
            pub.dados.receita.textoEstruturado = te
            if(fields.titulo != pub.dados.receita.titulo && fields.titulo != '') pub.dados.receita.titulo = fields.titulo
            if(fields.isPrivate == 'true') pub.isPrivate = true
            else pub.isPrivate = false
            var config = {
              access_token: req.session.token,
              pub: pub
            }
            axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
              .then(m => res.redirect('/users/homepage/' + loggedUser))
              .catch(error => res.render('error',{e:error}))
          }).catch(error => res.render('error',{e: error}))

      } else if(tipo == 'ideia') {
        axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
          .then(pub => {
            pub = pub.data
            if(fields.titulo != '') pub.dados.ideia.titulo = fields.titulo
            if(fields.descricao != '') pub.dados.ideia.descricao = fields.descricao
            if(fields.classificadores != '') pub.dados.ideia.classificadores = fields.classificadores.split(',')
            if(fields.isPrivate == 'true') pub.isPrivate = true
            else pub.isPrivate = false
            var config = {
              access_token: req.session.token,
              pub: pub
            }
            axios.post('http://localhost:3000/api/pubs/' + pubid + "/edit",config)
              .then(m => res.redirect('/users/homepage/' + loggedUser))
              .catch(error => res.render('error',{e: error}))
          }).catch(error => res.render('error', {e: error}))

      } else if(tipo == 'evento') {
        axios.get('http://localhost:3000/api/pubs/' + pubid, axiosConfig)
          .then(pub => {
            pub = pub.data
            if(fields.titulo != '') pub.dados.evento.titulo = fields.titulo
            if(fields.local != '') pub.dados.evento.local = fields.local
            if(fields.convidados != '') pub.dados.evento.convidados = fields.convidados.split('\n')
            if(fields.descricao != '') pub.dados.evento.descricao = fields.descricao
            var dataParams = fields.dataEvento.split('-')
            var data = ""
            for(var i = 2; i>= 0; i--) {
              if(i == 0) data += dataParams[i]
              else data += dataParams[i] + "-"
            }
            pub.dados.evento.dataEvento = data
            if(fields.isPrivate == 'true') pub.isPrivate = true
            else pub.isPrivate = false
            var config = {
              access_token: req.session.token,
              pub: pub
            }
            axios.post('http://localhost:3000/api/pubs/' + pubid + "/edit",config)
              .then(m => res.redirect('/users/homepage/' + loggedUser))
              .catch(error => res.render('error',{e: error}))
          }).catch(error => res.render('error', {e: error}))

      } else if(tipo == 'eventoProfissional') {
          axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
            .then(pub => {
              pub = pub.data
              if(fields.titulo != '') pub.dados.eventoProfissional.titulo = fields.titulo
              if(fields.local != '') pub.dados.eventoProfissional.local = fields.local
              if(fields.oradores != '') pub.dados.eventoProfissional.oradores = fields.oradores.split('\n')
              if(fields.descricao != '') pub.dados.eventoProfissional.descricao = fields.descricao
              var dataParams = fields.dataEvento.split('-')
              var data = ""
              for(var i = 2; i>= 0; i--) {
                if(i == 0) data += dataParams[i]
                else data += dataParams[i] + "-"
              }
              pub.dados.eventoProfissional.dataEvento = data
              if(fields.isPrivate == 'true') pub.isPrivate = true
              else pub.isPrivate = false
              if(files.ficheiros.size > 0) {
                var fs_enviado = files.ficheiros.path
                var fs_novo = __dirname + '/../public/uploaded/' + pub.origin_email + '/' + files.ficheiros.name
                fs.rename(fs_enviado,fs_novo, (err) => {
                    pub.dados.eventoProfissional.ficheiros.push('http://localhost:3000/uploaded/' + pub.origin_email + '/' + files.ficheiros.name)
                    var config = {
                      access_token: req.session.token,
                      pub: pub
                    }
                    axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                      .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                      .catch(error => res.render('error',{e: error}))
                })
              } else {
                var config = {
                  access_token: req.session.token,
                  pub: pub
                }
                axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                  .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                  .catch(error => res.render('error',{e: error}))

              }
            }).catch(error => res.render('error',{e: error}))

      } else if(tipo == 'creditacao') {
          axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
            .then(pub => {
              pub = pub.data
              if(fields.titulo != '') pub.dados.formacao.titulo = fields.titulo
              if(fields.creditacao != '') pub.dados.formacao.creditacao = fields.creditacao
              if(fields.instituicao != '') pub.dados.formacao.instituicao = fields.instituicao
              if(fields.descricao != '') pub.dados.formacao.descricao = fields.descricao
              if(fields.isPrivate == 'true') pub.isPrivate = true
              else pub.isPrivate = false

              var config = {
                access_token: req.session.token,
                pub: pub
              }

              axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                .catch(error => res.render('error',{e: error}))
              
            }).catch(error => res.render('error',{e: error}))

      } else if(tipo == 'desportivo') {
        axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
          .then(pub => {
            pub = pub.data
              if(fields.titulo != '') pub.dados.desportivo.titulo = fields.titulo
              if(fields.atividade != '') pub.dados.desportivo.atividade = fields.atividade
              if(fields.duracao != '') pub.dados.desportivo.duracao = fields.duracao
              if(fields.descricao != '') pub.dados.desportivo.descricao = fields.descricao
              if(fields.isPrivate == 'true') pub.isPrivate = true
              else pub.isPrivate = false
              if(files.fotos.size > 0) {
                var fs_enviado = files.fotos.path
                var fs_novo = __dirname + '/../public/uploaded/' + loggedUser + '/' + files.fotos.name
                fs.renameSync(fs_enviado,fs_novo)
                pub.dados.desportivo.fotos.push('http://localhost:3000/uploaded/' + pub.origin_email + "/" + files.fotos.name)
              } else {
                var config = {
                  access_token: req.session.token,
                  pub: pub
                }
                axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                  .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                  .catch(error => res.render('error',{e: error}))
              }
              if(files.ficheiro_gpx.size > 0) {
                fs_enviado = files.ficheiro_gpx.path
                fs_novo = __dirname + '/../public/uploaded/' + loggedUser + '/' + files.ficheiro_gpx.name
                fs.renameSync(fs_enviado,fs_novo)
                pub.dados.desportivo.fotos.push('http://localhost:3000/uploaded/' + pub.origin_email + '/' + files.fotos.name)
                pub.dados.desportivo.ficheiro_gpx = 'http://localhost:3000/uploaded/' + pub.origin_email + '/' + files.ficheiro_gpx.name
                var config = {
                  access_token: req.session.token,
                  pub: pub
                }
                axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                  .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                  .catch(error => res.render('error',{e: error}))
              } else {
                var config = {
                  access_token: req.session.token,
                  pub: pub
                }
                axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                  .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                  .catch(error => res.render('error',{e: error}))
                }
          }).catch(error => res.render('error',{e: error}))

      } else if(tipo == 'album') {
          axios.get('http://localhost:3000/api/pubs/' + pubid,axiosConfig)
            .then(pub => {
              pub = pub.data
              if(fields.titulo != '') pub.dados.album.titulo = fields.titulo
              if(fields.descricao != '') pub.dados.album.descricao = fields.descricao
              var fotoInfoObj = {
                dataFoto: "",
                foto: "",
                local: ""
              }
              fotoInfoObj.local = fields.local
              var dataParams = fields.dataFoto.split('-')
              var data = ""
              for(var i = 2; i>= 0; i--) {
                if(i == 0) data += dataParams[i]
                else data += dataParams[i] + "-"
              }
              fotoInfoObj.dataFoto = data
              if(fields.isPrivate == 'true') pub.isPrivate = true
              else pub.isPrivate = false
              if(files.foto.size > 0) {
                var fs_enviado = files.foto.path
                var fs_novo = __dirname + '/../public/uploaded/' + pub.origin_email + '/' + files.foto.name
                fs.rename(fs_enviado,fs_novo,err => {
                    console.log('first rename')
                    fotoInfoObj.foto = 'http://localhost:3000/uploaded/' + pub.origin_email + '/' + files.foto.name
                    pub.dados.album.fotos.push(fotoInfoObj)
                    var config = {
                      access_token: req.session.token,
                      pub: pub
                    }
                    axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                      .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                      .catch(error => res.render('error',{e: error}))
                })
              } else {
                var config = {
                  access_token: req.session.token,
                  pub: pub
                }
                axios.post('http://localhost:3000/api/pubs/' + pubid + '/edit',config)
                  .then(m => res.redirect('/users/homepage/' + pub.origin_email))
                  .catch(error => res.render('error',{e: error}))
              }
            }).catch(error => res.render('error',{e:error}))
      }
    }
  })
})

router.get('/:email/filter',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res) => {
  var dataMinima = req.query.dataMinima
  var hashtags = req.query.filtroHashtag
  var tipos = req.query.filtroTipos
  var loggedUser = req.user.email
  var email = req.params.email

  obj2 = {
    email: email,
    access_token: req.session.token
  }
  axiosConfig2 = {
    params: obj2
  }

  if(dataMinima) {
    var date = new Date(dataMinima)
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    dataMinima = mm + '/' + dd + '/' + yyyy + ' 00h:00m';
  }

  if(loggedUser == email) {
    if(dataMinima != '' && hashtags && tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        dataMinima: dataMinima,
        hashtags: hashtags,
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
      //pedir a api pubs com os três critérios
    } else if(dataMinima != '' && hashtags) {
      dataMinima += ' 00h:00m'
      //pedir a api pubs com estes dois critérios
      obj = {
        dataMinima: dataMinima,
        hashtags: hashtags,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
  
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
    } else if(dataMinima != '' && tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        dataMinima: dataMinima,
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
  
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
  
    } else if(hashtags && tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        hashtags: hashtags,
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
  
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
  
    } else if(dataMinima !='') {
      dataMinima += ' 00h:00m'
      obj = {
        dataMinima: dataMinima,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
  
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
  
    } else if(hashtags) {
      dataMinima += ' 00h:00m'
      obj = {
        hashtags: hashtags,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
  
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
  
    } else if(tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
  
      axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
        .then(pubs => {
          pubs = pubs.data
          axios.get('http://localhost:3000/api/users',axiosConfig2)
            .then(userData => {
              userData = userData.data
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('user_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
        .catch(erro => res.render('error',{e: error}))
  
    } else {
      res.redirect('/users/homepage/' + email)
    }

  } else {
    if(dataMinima != '' && hashtags && tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        dataMinima: dataMinima,
        hashtags: hashtags,
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
     .catch(erro => res.render('error',{e: error}))
      //pedir a api pubs com os três critérios
    } else if(dataMinima != '' && hashtags) {
      dataMinima += ' 00h:00m'
      //pedir a api pubs com estes dois critérios
      obj = {
        dataMinima: dataMinima,
        hashtags: hashtags,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
        .catch(erro => res.render('error',{e: error}))
    } else if(dataMinima != '' && tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        dataMinima: dataMinima,
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
        .catch(erro => res.render('error',{e: error}))
  
    } else if(hashtags && tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        hashtags: hashtags,
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
        .catch(erro => res.render('error',{e: error}))
  
    } else if(dataMinima !='') {
      dataMinima += ' 00h:00m'
      obj = {
        dataMinima: dataMinima,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
        .catch(erro => res.render('error',{e: error}))
  
    } else if(hashtags) {
      dataMinima += ' 00h:00m'
      obj = {
        hashtags: hashtags,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
        .catch(erro => res.render('error',{e: error}))
  
    } else if(tipos) {
      dataMinima += ' 00h:00m'
      obj = {
        tipos: tipos,
        access_token: req.session.token
      }
      axiosConfig = {
        params: obj
      }
      axios.get('http://localhost:3000/api/users/isFav/?emailFav='+req.params.email,axiosConfig)
          .then(dados=>{
              var isFav = false
              console.log("teste");
              if (dados.data) isFav = true
              else isFav = false
              console.log("isfav:"+isFav);
              axios.get('http://localhost:3000/api/pubs/' + email + '/filter',axiosConfig)
                .then(pubs => {
                  pubs = pubs.data
                  axios.get('http://localhost:3000/api/users',axiosConfig2)
                    .then(userData => {
                      userData = userData.data
                      userData.origin_email = loggedUser
                      axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                        .then(userGroups => {
                          userGroups = userGroups.data
                          res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length, isFavorito : isFav})
                        })
                    })
                  //ir buscar o userData e os groups que é preciso
                })
                .catch(erro => res.render('error',{e: error}))})
        .catch(erro => res.render('error',{e: error}))
  
    } else {
      res.redirect('/users/homepage/' + email)
    }

  }
  
})


//Registar publicação desportiva
router.post('/newDesp',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res)=>{

  var form = new formidable.IncomingForm()
  form.parse(req,(erro,fields,data)=>{
    if (erro) {
      console.log(erro);
      res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'+erro}))
    }

    var fenviadogpx =  data.ficheiro_gpx.path
    var fnovogpx = __dirname + "/../public/uploaded/" + fields.origin_email  + '/'  + data.ficheiro_gpx.name
    console.log("\nFNOVO"+fnovogpx)
    fs.rename(fenviadogpx,fnovogpx,erro => {
          if(erro){ 
              res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'}))
          }
          else console.log("Ficheiro gpx armazenado com sucesso");
        })
    var path_ficheiro_gpx = ("http://localhost:3000/uploaded/"+ fields.origin_email  + '/'  + data.ficheiro_gpx.name)


    var path_fotos = []
    for(var i=0; i<fields.nFotos;i++) {
        console.log(data["foto"+i].name);
        var fenviado =  data["foto"+i].path
        var fnovo = __dirname + "/../public/uploaded/" + fields.origin_email  + '/'  + data["foto"+i].name
        console.log("\nFNOVO"+fnovo)
        fs.rename(fenviado,fnovo,erro => {
          if(erro){ 
              res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'}))
          }
          else console.log("Ficheiro armazenado com sucesso");
          
        })
        path_fotos.push("http://localhost:3000/uploaded/"+ fields.origin_email  + '/'  + data["foto"+i].name)
      }

    
      var data = {
                    titulo : fields.titulo,
                    descricao:fields.descricao,
                    duracao : fields.duracao,
                    atividade:fields.atividade,
                    ficheiro_gpx : path_ficheiro_gpx,
                    fotos : path_fotos
            }            
      data_Desp ={desportivo: data}
      var desportivo = {
                dados:data_Desp,
                isPrivate:fields.isPrivate,
                data:fields.data,
                tipo:fields.tipo,
                origin_email: fields.origin_email,
                classificacoes : fields.classificacoes
      }
      desportivo.access_token = req.session.token
      axios.post('http://localhost:3000/api/pubs/newPub',desportivo)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))
  })

})


//Registar publicação album
router.post('/newAlbum',passport.authenticate('jwt',{session:false, failureRedirect: '/users/login'}),(req,res)=>{
  console.log("\nPOSTALBUM\n");

  var form = new formidable.IncomingForm()
  form.parse(req,(erro,fields,data)=>{
    if (erro) {
      console.log(erro);
      res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'+erro}))
    }
    var fotos_info = []
    for(var i=0; i<fields.nFotos;i++) {
        console.log(data["foto"+i].name);
        var fenviado =  data["foto"+i].path
        var fnovo = __dirname + "/../public/uploaded/" + fields.origin_email  + '/'  + data["foto"+i].name
        console.log("\nFNOVO"+fnovo)
        fs.rename(fenviado,fnovo,erro => {
          if(erro){ 
              res.write(res.render('error',{e:'Ocorreram erros no armazenamento do ficheiro'}))
          }
          else console.log("Ficheiro armazenado com sucesso");
          
        })
        var fotoinfo = {
              dataFoto: fields["data"+i],
              foto: "http://localhost:3000/uploaded/" + fields.origin_email + '/' + data["foto"+i].name,
              local: fields["local"+i]
        }
        fotos_info.push(fotoinfo)
        
      }

    
      var data = {
                    titulo : fields.titulo,
                    descricao:fields.descricao,
                    fotos : fotos_info
            }            
      data_Album ={album: data}
      var album = {
                dados:data_Album,
                isPrivate:fields.isPrivate,
                data:fields.data,
                tipo:fields.tipo,
                origin_email: fields.origin_email,
                classificacoes : fields.classificacoes
      }
      album.access_token = req.session.token
      axios.post('http://localhost:3000/api/pubs/newPub',album)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))
  })

})

module.exports = router