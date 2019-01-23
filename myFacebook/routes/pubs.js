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

    
      var data = {
                    titulo : fields.titulo,
                    descricao:fields.descricao,
                    dataEvento : fields.dataEvento,
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
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))
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
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
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
              userData.origin_email = loggedUser
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
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
              userData.origin_email = loggedUser
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
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
              userData.origin_email = loggedUser
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
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
              userData.origin_email = loggedUser
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
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
              userData.origin_email = loggedUser
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
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
              userData.origin_email = loggedUser
              axios.get('http://localhost:3000/api/groups/withUser',axiosConfig2)
                .then(userGroups => {
                  userGroups = userGroups.data
                  res.render('guest_home',{userData: userData,userPubs: pubs,numPubs: pubs.length})
                })
            })
          //ir buscar o userData e os groups que é preciso
        })
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