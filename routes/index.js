var express = require('express');
var router = express.Router();

const UserModel = require('../model/user')
const AdminModel = require('../model/admin')



router.post('/', function(req, res,next) {
  res.status(200).send('Social Network Webservice {}')
});

module.exports = router;
