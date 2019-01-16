var express = require('express');
var router = express.Router();
var axios = require('axios')
var formidable = require("formidable")

//Registar publicação
router.post('/newPub',(req,res)=>{
  
  axios.post('http://localhost:3000/api/pubs/newPub',req.body)
                .then(message => res.jsonp(message))
                .catch(erro => res.render('error', {e: erro}))

})


module.exports = router