/**
 * Web Socket
 */
const config = require('../config/properties')
const server = config.server
const io = require('socket.io')(server)


module.exports = async function () {
    let socket = await io.on("connection",(socket) => {
        return socket;
    })
    return Promise.resolve(socket)
}


