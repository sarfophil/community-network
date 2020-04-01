/**
 * File Uploader
 */
const config = require('../config/properties')
const allowedMimeType = ['image/jpeg','image/png']
const uploadDirectory = require('../public/uploads/upload-path')

/**
 * 
 * @param {ObjectId} postId 
 * @param {ObjectId} userId 
 * @param {Number} count 
 */
const namingTemplate = (postId,userId,count) => postId.concat(userId).concat(count).concat('.')

/**
 * Profile Pic naming pattern
 * @param {string} userId 
 */
const profilepicNamingTemplate = (userId) => 'profile'.concat(userId).concat().concat('.')

/**
 * Ad Naming Template
 * @param {string} adId 
 * @param {string} adminId 
 * @param {number} count 
 */
const adNamingTemplate = (adId,adminId,count) => adId.concat(adminId).concat(count).concat('.')


/**
 * Checks image extension
 * @param {String} mimeType 
 */
const validateImageExtension = function (mimeType) {
    let test = allowedMimeType.find(type => type == mimeType)
    return test != undefined ? true : false;
}

/**
 * Checks Image Size
 * @param {Number} imageSize 
 */
const validateImageSize = function(imageSize) {
    return (imageSize <= 30000)
}


/**
 * 
 * @param {String} pictures 
 * @param {} post 
 * @param {*} namingType 
 */
const processPostImages =  function (pictures,post,namingType,callback){
    let count = 0;
    let picStatus = [];
    let imageNames = [];
    pictures.forEach(picture => {
         // Checks validity of the image extension
         if(validateImageExtension(picture.mimetype)){
                // Names the picture
                const getExtension = picture.name.split('.')
 
                if(namingType == 'post'){    
                    picture.name = namingTemplate(post._id.toString(),post.user,count++).concat(getExtension[1])
                }else if(namingType == 'profile'){
                    picture.name = profilepicNamingTemplate(post).concat(getExtension[1])
                }else{
                    picture.name = adNamingTemplate(post._id.toString(),post.owner,count++).concat(getExtension[1])
                }
                
                // move files to server directory
                picture.mv(uploadDirectory.getPath().concat(picture.name),(err) => {  
                    if(err){
                        picStatus.push({failed: true,response: err})
                    }
                })

                imageNames.push(picture.name)
                picStatus.push({failed: false,reason: 'uploaded'})

         }else{
            let response = {failed: true,reason: 'Image extension is invalid. Required Types: '+allowedMimeType}
            picStatus.push(response)
         }  
     })


     callback(picStatus,imageNames)
}

module.exports = processPostImages