var express = require('express');
var router = express.Router();


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
