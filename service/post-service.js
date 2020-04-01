/**
 * Post Implementations will handle all user posts and validation
 */
const blacklistservice = require('./blacklistedpost-service')
const userDomain = require('../model/user');
const userModel = userDomain.getModel;
const config = require('../config/properties')
const ws = require("../config/websocket")
const nodemailer = require('../util/nodemailer')
const adminService= require('../service/admin-service')
const PostModel = require('../model/post').getModel
const commentModel = require('../model/comment')
const Utils = require('../util/apputil')



const postServiceImpl = {
    uploadPost:  function(postModel,callback)  {
        blacklistservice.isHealthy(postModel,(result)=>{ 
            //console.debug(`${result}`)    
            if(result){
                postModel.save((err,doc)=>{
                    if(err){
                        callback(false,err)
                    }else{
                        callback(true,'Post Added')
                        // Notify Followers

                    }
                })    
            }else{
                // set isHealthy to false
                postModel.isHealthy = false;       
                // List post as blacklist to Admin
                blacklistservice.blacklistPost(postModel,()=>{
                    // Update user profile with voilations
                    this.updateUserProfileForVoilating(postModel)
                    .then(res=>{
                        callback(res.status,res.message)
                    }).catch(err=> console.log(err.stack))
                })

            }
        })    
    },
    updateUserProfileForVoilating: async function (postModel){
        let userId = postModel.user._id;

        let response = {}

        const user = await userModel.findOne({_id: userId})     
        
        let totalVoilation = user.totalVoilation;

        // Checks if user exceeded the configured limit
        if(totalVoilation == config.maxVoilationLimit){
            // Exceeded Limit 
            let emailMessageTemplate = `Dear ${user.username}, You have exceed voilation limit on the social media platform.
             We are sorry to inform you that your account has been disabled. You can send a request to the admin to review your account. Thank you `;
            
            
            console.log("Sending email ....") 
            nodemailer.to([user.email])
                      .subject("Account Blocked")
                      .text(emailMessageTemplate)
                      .sendEmail((result) => console.log(`Email sent at ${Date.now()}`))
            

            
            // Deactivate User Account
            user.isActive = false;

            // overwrite db
            await user.save()
            
            // send notification
            console.log('Sending notification with socket ...')
            ws().then(socket => socket.emit('userBlockedEvent', {user: user._id,time: Date.now(),notifyType: 'accountBlocked'}))
                .catch(err=> console.error(err))
            //
            response = {status:false,message:'Post Blacklisted to admin. Account Deactivated'}
                   
        }else{
            // Increase voilation and Add
            let voilation = user.totalVoilation + 1;
   
            // set total voilation
            user.totalVoilation = voilation;

            // overwrite data
            await user.save()
     

            response = {status:false,message:'Unable to post your content. It contains keywords which voilates the platform policies. Admin will review and make decision on your post'}

            // Send Notification to user
            ws().then(socket => {
                socket.emit('postBlacklisted', {user: user._id,time: Date.now,notifyType: 'postBlacklisted'})
            })
            .catch(err=> console.error)
        } 
 
        return Promise.resolve(response)    
    },
    loadPost: async function (userId,skip,limit,cord) {
        let recommended = await PostModel.find({
            $or: [
                {
                    user: userId
                },
                {
                    "audienceFollowers.user": userId
                }
            ],
            isHealthy: true
       
        }).sort({createdDate: -1}).skip(skip).limit(limit)

        let nearby = await PostModel.find({
            user: {$not: {$eq: userId}},
            "audienceFollowers.user": {$not: {$eq: userId}},   
            audienceLocation:{
                    $near: {
                        $geometry: {type: "Point",coordinates: cord},
                        $minDistance: config.geoDistance.minDistance,
                        $maxDistance: config.geoDistance.maxDistance
                    }
                },
            isHealthy: true
        }).sort({createdDate: -1}).skip(skip).limit(limit)

        let posts = {recommendedPost: recommended,nearbyPost: nearby}

        return Promise.resolve(posts)
    },
    likePost: async function(userId,postId){
        let post = await PostModel.findOne({_id: postId})
        if(!post) return Promise.reject('Post not found')

        let isExist = Utils.find(post.likes,(like) => like.toString() === userId.toString())
        if(!isExist)
            post.likes.push(userId)

        // save to db
        post.save()
        return Promise.resolve('post liked')
    },
    unlikePost: async function(userId,postId){
        let post = await PostModel.findOne({_id: postId})
        if(!post) return Promise.reject('Post not found')

        
        let likes = Utils.remove(post.likes,(like) => {
            return like.toString() === userId
        })
       
        // assign new likes to the object
        post.likes = likes

        post.save()
        return Promise.resolve('post unliked')
    },
    loadComment:  function(postId,limit,cb){
        commentModel.find({postId: postId},(err,doc)=>{
            cb(doc)
        }).limit(limit) 
    },
    commentPost: function(commentModel,callback){
        commentModel.save()
        callback()
    },
    deleteComment:  function(commentId){
        commentModel.deleteOne({_id: commentId},(err) => console.log(`${err}`))
    },
    likeComment: async function(commentId){
        let comment = await commentModel.findOne({_id: commentId})
        if(!comment) Promise.reject('comment removed')
        comment.likes += 1
        comment.save()
        Promise.resolve('comment liked')
    },
    unlikeComment: async function(commentId) {
        let comment = await commentModel.findOne({_id: commentId})
        if(!comment) Promise.reject('comment removed')
        comment.likes -= 1
        comment.save()
        Promise.resolve('comment unliked')
    },
    notifyFollowersOnPost: async function(followers) {
        
    }
}

module.exports = postServiceImpl