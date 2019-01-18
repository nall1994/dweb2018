var express = require('express');
var router = express.Router();
var axios = require('axios')
var passport = require('passport')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homepage');
});

router.get('/contacts',(req,res) => {
  res.render('contacts')
})

router.get('/about',(req,res) => {
  res.render('about')
})

router.get('/example',(req,res)=> {
  res.render('user_home',{userData: {}})
})

router.get('/uploaded/*',(req,res)=>{
  fs.readFile( "."+req.url ,(erro2,dados)=>{
      if(!erro2){
          res.write(dados)
          res.end()
      }
      else{
          console.log(erro2)
          res.end()
      }
  })
})

module.exports = router;
