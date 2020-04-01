/**
 * Search Engine
 */
const PostModel = require('../model/post').getModel

module.exports = {
    search: (keyword,limit,onComplete) => {
        PostModel.find({$text: {$search: keyword}},(err,doc) => {
          //  console.log(`${err}`)
            if(err){
                onComplete(err,null)
            }else{
                onComplete(null,doc)
            }
        }).limit(limit)
    }
}