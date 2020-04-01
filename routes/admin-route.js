var express = require('express');
var router = express.Router();

const blacklistModel = require('../model/blacklistedkeyword');
const postModel = require('../model/post').getModel
const AdvertModel = require('../model/advertisement').advertisementModel
const BlacklistedPostModel = require('../model/blacklistedPost');


const advertService = require('../service/advertisement-service');
const fileStorageService = require('../service/filestorage-service');
const blacklistedPostService = require('../service/blacklistedpost-service');




// util
const Utils = require('../util/appUtil') 


router.get('/ads',function(req,res) {
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    AdvertModel.find((err,doc) => res.status(200).send(doc)).limit(limit).skip(skip)
})

router.post('/ads',function(req,res) {
    let ad = {
        title: req.body.title,
        content: req.body.content,
        link: req.body.link,
        banner: null, // link
        owner: req.body.owner,
        audienceCriteria:{
            age: JSON.parse(req.body.age_target)
        },
        audienceLocation: {
            coordinates: JSON.parse(req.body.target_location)
        }
    }

    let banners = req.files.banner;

    let adModel = new AdvertModel(ad)

    adModel.validate()
        .then(value => {
            uploadImage(banners,adModel,(err,images) => {
                if(err){
                    res.status(500).send(err)
                }else{
                    adModel.banner = images
                    adModel.save()
                    res.status(201).send('Posted')
                }
            })
        })
        .catch(err => {
            console.log(err.stack)
            res.status(500).send('Input Validation Error')
        })
   
})


function uploadImage(images,ad,callback){
    fileStorageService(images,ad,'ad',(statuses,images)=>{
        Utils.perform(statuses,(status) => status.failed == true)
            .then(res => {
                callback(res.reason,images)
            })
            .catch(err => {
                callback(null,images)
            })
   })
}


/** 
 * @Post
 * Post 
 * 
 * 
*/
router.get('/posts', function (req,res) {
    let requestBody = req.body
    postModel.find((err,doc) => res.status(200).send(doc))
    .limit(parseInt(requestBody.limit)).skip(parseInt(requestBody.skip))
})

router.get('/posts/:postId',function (req,res) {
    postModel.findById({_id: postId},(err,doc) => res.status(200).send(doc))
})




/**
 * @blacklistPost
 *  Review blacklist posts
 * 
 *  */
router.get('/blacklist/posts/reviews',function (req,res) {
    BlacklistedPostModel.find((err,doc) => res.status(200).send(doc))
    .limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip))
})
// accept
router.put('/blacklist/posts/reviews/:reviewId',function(req,res){
    blacklistedPostService.removePostFromBlackListToPost(req.params.reviewId)
    .then(result => {
        res.status(200).send('Post Added')
    })
    .catch(err => {
        res.status(500).send('An Error Occured')
    })
})
// reject
router.delete('/blacklist/posts/reviews/:reviewId', function(req,res){
    blacklistedPostService.deleteUserPost(req.params.reviewId)
    .then(result => {
        res.status(200).send('')
    })
    .catch(err => {
        res.status(500).send('An Error Occured')
    })
})


/**
 * @blacklist
 * Blacklist
 */
router.post('/blacklistwords',function(req,res) {
    let keywords = req.body;
    
    for(word of keywords){
        let createdWord = new blacklistModel({word: word})
        
        let isExist = createdWord.validateSync()
        if(!isExist) {
            blacklistModel.exists({word: createdWord.word})
            .then(fullfilled => {
                if(!fullfilled){    
                    createdWord.save()
                }
            })
            .catch(reject => {

            })      
        }
    }
    res.status(201).send('blacklist created')
})

router.get('/blacklistwords',function(req,res) {
    blacklistModel.find((err,doc) => res.status(200).send(doc))
})

router.delete('/blacklistwords/:blacklistId',function (req,res) {
    blacklistModel.deleteOne({_id: req.params.blacklistId.toString()},(err) => console.log(err))
    res.status(200).send('keyword removed')
})


module.exports = router;