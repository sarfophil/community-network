/**
 * Role Object is used to determine user level and authorizations
 */
const mongoose = require('mongoose')

const role = {
    roleName: {
        type: String,
        default: true
    }
}
const roleSchema = new mongoose.Schema(role)
module.exports = roleSchema