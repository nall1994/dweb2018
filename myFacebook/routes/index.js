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


module.exports = router;
