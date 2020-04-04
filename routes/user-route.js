var express = require('express');
var router = express.Router();
const UserModel = require('../model/user').getModel
const userService = require('../service/user-service')
const BlockedAccount = require('../model/blocked-account')
const ws = require("../config/websocket")

const bcrypt = require('../util/bcrypt')
const jwt = require('../util/jwt')


// File Storage
const fileStorageService = require('../service/filestorage-service')
const Utils = require('../util/apputil')



router.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  UserModel.findOne({$or : [{username: {$eq: username}},{email: {$eq: username}}]},function (err,user) {
    if(err) res.statusCode(403)
    let comparePassword = bcrypt.compareSync(password,user.password) 
    if(comparePassword){
      jwt.sign(user,(err,token) => {
         if(err) {
            res.status(500).send('Unable to sign token')
         }else{ 
           res.status(200).send({access_token: token})
         }
      })
    }else{
       res.sendStatus(403)
    }
  })
});

/** Create a user account*/
router.post('/account', function(req,res,next) {
  let requestBody = req.body
 
  // hash password
  requestBody.password = bcrypt.encodeSync(requestBody.password)

  let user = new UserModel(requestBody);
  


  user.validate().then((response)=>{
    userService.signup(user)
    .then(result => res.status(201).send(result))
    .catch(error => res.status(200).send(error))
  }).catch(err => {
    res.status(400).send('Invalid Inputs. Please check your inputs')
  })
})


// change profile pic
router.post('/account/profilepic/:userId', (req,res) => {
   let picture = req.files.picture;
   let userId = req.params.userId;

   uploadImage([picture],userId, (status,images) => {
      if(!status){
        UserModel.findOne({_id: userId}, (err,doc) => {
          doc.profilePicture = images[0]
          doc.save()
          res.status(202).send()
       })
      }else{
        res.status(500).send(status)
      }
   })
   
})

function uploadImage(images,post,callback){
  fileStorageService(images,post,'profile',(statuses,images)=>{    
        let checkUploadResponse = Utils.find(statuses, (status) => status.failed == true)
        if(checkUploadResponse){      
            callback(checkUploadResponse.reason,images)
        }else {
            callback(null,images)
        }

  })
}


//follow
router.post('/:userId/followers/:followerId',function (req,res) {
   let userId = req.params.userId;
   let followId = req.params.followerId;
   UserModel.findOne({_id: followId},(err,doc) => {
     if(err) res.status(404).send('Unable to follow')
     userService.addFollowers(userId,doc)
     .then(cb => res.status(200).send('followed!'))
     .catch(err => {
        res.status(500).send(err)
     })
   })
})

// followers
router.get('/:userId/followers', function(req,res) {
  let userId = req.params.userId;
  UserModel.findOne({_id: userId}, (err,doc) => {
      if(err) res.status(404).send('')
     userService.loadFollowers(doc.followers)
     .then(f => {   
        res.status(200).send(f);
     }).catch(err => {
       res.status(200).send(err)
     })
  })
})

// unfollow
router.delete('/:userId/followers/:followerId', function(req,res) {
  let userId = req.params.userId;
  let followId = req.params.followerId;
  UserModel.findOne({_id: followId},(err,doc) => {
      userService.unfollow(userId,doc)
      .then(success => res.status(200).send(success))
      .catch(reject => res.status(500).send('Unable to complete process'))
  })
})


// reporting blocked account for review
router.post('/report',function(req,res) {
   let email = req.body.email;
   BlockedAccount.findOne({"account.email": email}, (err,doc) => {
      if(err) res.sendStatus(404)
      doc.hasRequestedAReview = true
      doc.save()
      ws().then(socket => socket.emit('AccountReviewReport', {}))
                .catch(err=> console.error(err))
      res.sendStatus(201)
   })
})




module.exports = router;
