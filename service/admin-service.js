/**
 * Admin Service
 */


const AdminModel = require('../model/admin')

const adminServiceImpl = {
    getEmails: async function(){
        let admins = await AdminModel.find()
        let emails = []
        admins.forEach(admin => {
            emails.push(admin.email)
        });
        return Promise.resolve(emails)
    }
}

module.exports = adminServiceImpl