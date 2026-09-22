
const socket = require("socket.io")
const dotenv = require("dotenv");

dotenv.config();

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    })
    io.on("connection", (socket) => {
        socket.on("joinChat", ({loggedUser, targetUser}) => {
            const roomId = [loggedUser, targetUser].sort().join("-")
            socket.join(roomId)
            console.log(`User ${loggedUser} joined room ${roomId}`)
        })
        socket.on("sendMessage", () => {
            console.log("Message sent")
        })
        socket.on("disconnect", () => {
            console.log("User disconnected")
        })
    })
}

module.exports = initializeSocket