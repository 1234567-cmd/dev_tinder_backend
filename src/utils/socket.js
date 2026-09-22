
const socket = require("socket.io")

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    })
    io.on("connection", (socket) => {
        socket.on("joinChat", () => {
            console.log("User joined the chat")
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