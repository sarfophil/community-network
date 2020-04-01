/**
 * User services
 */
const UserModel = require('../model/user').getModel
const Utils = require('../util/apputil')


module.exports = {
    signup: async function(userModel){
        let userExist = await UserModel.findOne({ $or: [{email: {$eq: userModel.email}},{username: {$eq: userModel.username}}] })
        if(userExist){
            return Promise.reject('user already exist')
        }
        userModel.save()
        return Promise.resolve('signup complete')
    },
    addFollowers: async function(userId,follower){
        let user = await UserModel.findOne({_id: userId})
        if(!user) return Promise.reject('User not found')
        


        if(userId === follower._id) return Promise.reject('Operation denied')
        //add follower
        user.followers.push(follower)

        //update
        user.save()
        return Promise.resolve('follower added')
    },
    loadFollowers: async function(followers) {
        let results = await []
        // console.log(`${followers}`)
        for(followerId of followers){
            let follower = await UserModel
                .aggregate([{$match: {_id: followerId,}}])
                .project(
                    {
                        username:  1,
                        email: 1,
                        picture: 1,
                        followers: 1,
                        profilePicture: 1
                    }
                )
            results.push(follower)
        }
        // Flattens multi dimension array into single array
        let flatResult = Utils.flapMap(results, (result) => { return result[0] })

        return Promise.resolve(flatResult)
    },
    unfollow: async function(userId,follower){
        let user = await UserModel.findOne({_id: userId})
        if(!user) return Promise.reject('User not found')
        if(userId === follower._id) return Promise.reject('Operation denied')


        let followersResult = Utils.remove(user.followers,(followerId) => {
            return followerId.toString() === follower._id.toString();
        })

        user.followers = followersResult;


        //update
        user.save()
        return Promise.resolve('follower removed')
    }
}
