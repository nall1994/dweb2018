var express = require('express');
var router = express.Router();
var axios = require('axios')
var formidable = require("formidable")
var fs = require("fs")
//Registar publicação sem ficheiros
router.post('/newPub',(req,res)=>{
  
  axios.post('http://localhost:3000/api/pubs/newPub',req.body)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))

})

//Registar publicação evento profissional
router.post('/newEventoProf',(req,res)=>{
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
      axios.post('http://localhost:3000/api/pubs/newPub',evento)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))
  })

})


//Registar publicação desportiva
router.post('/newDesp',(req,res)=>{
  console.log("\nPOSTDESP\n");

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
      axios.post('http://localhost:3000/api/pubs/newPub',desportivo)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))
  })

})


//Registar publicação album
router.post('/newAlbum',(req,res)=>{
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
      axios.post('http://localhost:3000/api/pubs/newPub',album)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))
  })

})

module.exports = router