var express = require('express');
var router = express.Router();
var axios = require('axios')
var formidable = require("formidable")

//Registar publicação
router.post('/newPub',(req,res)=>{
  var form = new formidable.IncomingForm()
  form.parse(req,(erro,fields,data)=>{
        if (erro) console.log(erro)
        else{
            console.log(fields)
            axios.post('http://localhost:3000/api/pubs/newPub',fields)
                .then(message => { res.jsonp(message)
                })
                .catch(erro => res.render('error', {e: erro}))
        }
  
  })
})


module.exports = router