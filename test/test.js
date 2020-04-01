/**
 * Unit testing on objects
 */


const assert = require('assert');
const userDomain = require('../model/user');
const mongoClient = require('../config/mongo');
const adminDomain = require('../model/admin');
const advertService = require('../service/advertisement-service')
const advertDomain = require('../model/advertisement')
const AdvertModel = advertDomain.advertisementModel;
const Admin = adminDomain.adminSchema;
var wsServer = require('../config/websocket')

const Utils = require('../util/appUtil')



const User = userDomain.getModel;
const allowedMimeType = ['image/jpeg','image/png']

const validateImageExtension = function (mimeType) {
   let test = allowedMimeType.find(type => type == mimeType)
   return test != undefined ? true : false;
}

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });

  it.skip('should convert to string',function() {
     let d = JSON.parse('{"min": 20,"max": 40}');
     console.log(d)
     let x = JSON.parse('[]')
     console.log(x) 
  })

  it.skip('#should return true', function() {
      let flag = validateImageExtension('image/jpeg')
      assert.equal(flag,true)
  })

  it.skip('#remove value from Array',function() {
      let dataset = [1,2,3,4]
      let target = 3
      dataset.forEach((data,index) => {
         if(data === target){
            dataset.splice(index,1)
         }
      })
      console.log(dataset)
      assert.equal(dataset.length,3)
  })

  it.skip("#profile naming", function(){
      let image = 'name.jpg'.split('.') 
      const profilepicNamingTemplate = (userId) => 'profile'.concat(userId).concat(image[1])
      console.log(profilepicNamingTemplate('203oeoosjjdsdsd'))
  })

  it("#test util method", function (){
      let data = [1,2,3,4]
      let feedback = Utils.find(data, num => num == 2)
      assert.equal(feedback,2)
  })

  it('# loop test', () => {
      let x = [1,2,3,2,3,4,4]
      let flag = true;
      x.forEach(f => {
         if(f === 2){
            flag = false
         }
      })
      assert.equal(flag,false)
  })

  it("# functional remove method ", function () {
     let data = [1,2,3,4]
     let feedback = Utils.remove(data, (value) => value === 3);
     assert.equal(feedback,1)
  })
});

describe.skip('#Keyword Checker Algorithm', function(){
   let content = "Lorem Ipsum e blor kaks kjasjd. jashajjd human kdkajj asja";
   let keywords = ["kill","police","racist","sex"]
   it("# should return false",function() {
      let contentArr = content.split(" ");
      let flag = true;
      console.log(contentArr)
      contentArr.forEach(content => {
          keywords.forEach(keyword => {
             if(content === keyword){
                flag = false;
                return;
             }
          })
      })
      assert.ok(flag)
   })
})




/**
 * Database Connection
 */
describe.skip('Database Connection', function () {
    it('#should throw an error', function () {
       // mongoClient()
    })
});


/**
 * Testing Domain Model
 */
describe('Domain',function () {

    this.beforeEach('#db init', function(){
        mongoClient(()=> console.log('Connected'));
    })

    // User Object
    describe.skip('#createUser',function(){
      this.beforeEach('#index Creation',()=> {
         mongoClient(()=> console.log('Connected'));
      })

      it('should return a non null object',() =>{
            const user = new User({
                username:'Philip Owusu',
                email: 'op@gmail.com',
                password:'super',
                age: 40,
                role: {roleName: 'ADMIN'},
                isActive: true,
                location: {'latitude':909,'longitude':34},
            })            
           user.save()
            user.validate().catch(err=>{
              assert.ok(err)
              assert.equal(err.errors['email'].message,'Validation failed')
            })
            
        })
    })

    describe('#user Exists',function () {
          
        
    })

})


// Advertisement
describe.skip('#Advert Integration Testing',function () {
    this.beforeEach('#Db initialize',function () {
      mongoClient(()=> console.log('Connected'));
    })
    it.skip('#should add an admin', ()=>{
        const admin = new Admin({
           fullname:'John Doe',
           email: 'john@gmail.com',
           password: 'super'
        })
        
        admin.validate().then(()=>{
            admin.save()
        }).catch(err=>{
           assert.ok(err)
        })
    })

    it.skip('#post advert',function () {
       const advert = new AdvertModel({
          title: 'Lorem',
          content: 'Lorem Ipsum grams',
          link: 'http://localhost:8080/lorelas/las',
          bannerName:'banner.jpg',
          owner: '5e7e2edaca1d3330d43753dc',
          audienceCriteria: {
            age: {min:20,max:50}
          },
          "audienceLocation.coordinates": [2.35500, 48.87146]
       })

       advertService.postAd(advert,function (data) {
          console.log(data)
       })
    })

   

    it('#Load Adverts',function(){
      advertService.loadAllPost('5e7d37856227200cd89623d9',[2.35497,48.87146], 5 ,(result) => {
        console.log(result)
        assert.ok(result)
      },5)
    })
})

//Ws
describe.skip('#webscoket connection',function () {
  it("#test Connection",function(){
    wsServer.listen(3001,"ws://localhost:3001/chat",()=> console.log("Connected"))
  })

 
})

const postDomain = require('../model/post');
const postService = require('../service/post-service')
const blacklistModel = require('../model/blacklistedkeyword');
const PostModel = postDomain.getModel
// Post Service
describe.skip('#Post Service', function() {
  this.beforeEach('#index Creation',()=> {
      mongoClient(()=> console.log('Connected'));
      
      // new blacklistModel({word: 'kill'}).save()
      // new blacklistModel({word: 'love'}).save()
      // new blacklistModel({word: 'up'}).save()
  })
  
  it.skip('#postService',function(){
     User.findOne({_id: '5e7facd63bf37d060c0f9d6d'},(err,doc)=>{
        const post = new PostModel({
            user: doc._id,
            title: 'Lorem Ipsum',
            content: 'Lorem Ipsum valhaha kill',
            imageLink: 'foo.png',
            audienceCriteria: {
               age: {min:20,max: 50}
            },
            audienceLocation: {
               coordinates: [2.35500, 48.87146]
            }
        })
      
        postService.uploadPost(post,(response)=>{
            assert.ok(response.status)
        })
     })
   })

   it('#getPosts',function(){
      postService.loadPost('5e7facd63bf37d060c0f9d6d',0,5,[2.35500, 48.87146])
      .then(result => {
         console.log(result)
      })
      .catch(error => console.log(error))
   })
})


describe.skip('#Blacklist Post',function (){
   it("#should persist",()=>{
    // postService.markPostAsUnhealthy()
   })
})


const ws = require('../config/websocket')

describe.skip('#Socket',function (){
   it("#testSocket", function(){
      ws().then(socket=>{
          socket.send('TestEvent',{})

          console.log(socket)
      })
      .catch(err=>console.error)
     
   })
})


const blacklistPostService = require('../service/blacklistedpost-service')

describe.skip('#BlacklistPost',()=>{
   beforeEach(()=>{
      mongoClient(()=>console.log('Connected'))
   })
   it("#removePost from blacklist",function () {
      blacklistPostService.removePostFromBlackListToPost('5e7e2edaca1d3330d43753dc')
      .then(result => {
         console.log(result)
         assert.ok(result)
      }).catch(err => console.log(err))
   })
})

const nodemailer = require('../util/nodemailer')

describe.skip('#Test Email',()=>{
    it('#send an email',()=>{
        nodemailer.from('philsarfogh@gmail.com')
                  .to('example@gmail.com')
                  .to('example2@org.com')
                  .subject('Lorem  Ipsum')
                  .text('Lorem Ipsm Valhala waiting')
                  .sendEmail((result) => console.log(result))
               
   });
})



