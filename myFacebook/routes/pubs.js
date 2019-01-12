var express = require('express');
var router = express.Router();
var axios = require('axios')
var formidable = require("formidable")

//Registar publicação
router.post('/',(req,res)=>{
  var form = new formidable.IncomingForm()
  form.parse(req,(erro,fields,data)=>{
    console.log("fields"+fields)
    axios.post('http://localhost:3000/api/pubs/novaPub',fields)
        .then(() => {
        })
        .catch(erro => res.render('error', {e: erro}))

  })
})


module.exports = router