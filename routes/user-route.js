var express = require('express');
var router = express.Router();
const UserModel = require('../model/user').getModel
const userService = require('../service/user-service')


//const postService = require('../service/post-service')

// File Storage
const fileStorageService = require('../service/filestorage-service')
const Utils = require('../util/apputil')



router.post('/login', (req, res) => {
  // Your implementation comes here ...
});

/** Create a user account*/
router.post('/account', function(req,res,next) {
  let requestBody = req.body
  let user = new UserModel(requestBody);

  user.validate().then((response)=>{
    userService.signup(user)
    .then(result => res.status(201).send(result))
    .catch(error => res.status(200).send(error))
  }).catch(err => {
    console.log(err.stack)
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




module.exports = router;
