var express = require('express');
var router = express.Router();
const PostModel = require('../model/post').getModel
const CommentModel = require('../model/comment')
const UserModel = require('../model/user').getModel

// service
const fileStorageService = require('../service/filestorage-service')
const postService = require('../service/post-service')
const searchService = require('../service/search-service')

// util
const Utils = require('../util/appUtil') 


router.get('/',(req,res) => {
    let dto = req.body;
    postService.loadPost(dto.user,dto.skip,dto.limit,dto.cord)
    .then(doc => {
        res.status(200).send(doc)
    })
    .catch(err => {    
        res.status(200).send([])
    })
})

// user creating a post
router.post('/', function(req,res){
    let requestData = postDto(req.body)
    
    UserModel.findOne({_id: requestData.user}, (err,doc) => {
        if(err) res.sendStatus(404)
        requestData.postuname = doc.username

        
        let postImages = req.files.imageLink instanceof Array ? req.files.imageLink : [req.files.imageLink]

        let post = new PostModel(requestData)


        //validate
        post.validate()
            .then(value => {
                //save post
                postService.uploadPost(post, (result,resultMessage) => {
                
                    if(result){
                        uploadImage(postImages,post,(err,images) => {
                            
                            if(err){
                                //rollback
                                post.delete()
                                res.status(500).send(err)
                            }else{    
                                post.imageLink = images
                                post.save()   
                                res.status(202).send('Posted')
                            }
                        })
                    }else{
                        res.status(500).send(resultMessage)
                    }
                })
            })
            .catch(error => {
                res.status(500).send('Input Validation Error')
            })


    })

  
    
 })
 
 
 function uploadImage(images,post,callback){
   fileStorageService(images,post,'post',(statuses,images)=>{
        let response = Utils.find(statuses,(status) => status.failed == true)
            if(response){
                callback(res.reason,images)
            }else{
                callback(null,images)
            }
   })
 }

 const postDto = function (requestBody) {
     return {
         user: requestBody.user,
         title: requestBody.title,
         content: requestBody.content,
         audienceLocation: {
             coordinates: JSON.parse(requestBody.coordinates)
         },
         audienceCriteria: {
             age: JSON.parse(requestBody.ageGroupTarget)
         },
         audienceFollowers: JSON.parse(requestBody.targetFollowers),
         postuname: null
     }
 }
 

 
 

  
// like
router.put('/:postId/user/:userId/likes', function(req,res){
    let postId = req.params.postId;
    let userId = req.params.userId;
    postService.likePost(userId,postId)
    .then(resp => res.status(200).send('liked post'))
        .catch(err => res.send(500).send('unable to like post'))
})

// unlike
router.delete('/:postId/user/:userId/likes', function(req,res) {
    let postId = req.params.postId;
    let userId = req.params.userId;
    postService.unlikePost(userId,postId)
    .then(resp => {
        res.status(200).send('unliked post')
    })
    .catch(err => console.log(`${err}`))
})

// comments
router.get('/:postId/comments/', function(req,res) {
    let postId = req.params.postId;
    let limit = parseInt(req.query.limit)
    postService.loadComment(postId,limit,(document) => {
        res.status(200).send(document)
    })
})
// post a comment
router.post('/:postId/user/:userId/comments/', function(req,res) {
    let requestBody = req.body
    let postId = req.params.postId;
    let userId = req.params.userId
    let comment = new CommentModel({content: requestBody.content,postId: postId,user: userId})
    let valid = comment.validateSync()
    if(valid) res.status(400).send('Input validation error')
    comment.save()
    res.status(202).send()
})

// remove
router.delete('/:postId/comments/:commentId',function(req,res) {
    let commentId = req.params.commentId;
    postService.deleteComment(commentId)
    res.status(200).send('removed')
})

// search post
router.get('/search',function(req,res) {
    let username = req.query.query;
    let limit = parseInt(req.query.limit)
    console.log(`${username} - ${limit}`)
    searchService.search(username,limit,(err,doc) => {
       // console.log(doc)
        res.status(200).send(doc)
    })
})
  
  

module.exports = router