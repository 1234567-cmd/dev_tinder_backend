
const socket = require("socket.io")
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
const Message = require("../models/message");
const { MAX_MESSAGE_LENGTH } = require("../models/message");
const { getConversationId, areConnected, formatMessage } = require("./chat");

dotenv.config();

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    // Fills socket.request.cookies so the login cookie can be read below.
    io.engine.use(cookieParser());

    // Same check as the userAuth middleware: the user comes from the token, never from the client.
    io.use(async (socket, next) => {
        try {
            const { token } = socket.request.cookies || {};
            if (!token) {
                return next(new Error("Please login first"));
            }
            const { _id } = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(_id).select("firstName lastName");
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.user = user;
            return next();
        } catch (error) {
            return next(new Error("Invalid or expired token"));
        }
    })

    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();

        // Handlers answer through the socket.io acknowledgement callback: { error } or a result.
        socket.on("joinChat", async ({ targetUserId } = {}, ack) => {
            const reply = typeof ack === "function" ? ack : () => {};
            try {
                if (!(await areConnected(userId, targetUserId))) {
                    return reply({ error: "You can only chat with your connections" });
                }
                const roomId = getConversationId(userId, targetUserId);
                socket.join(roomId);
                console.log(`User ${userId} joined room ${roomId}`);
                reply({ ok: true });
            } catch (error) {
                console.error(error);
                reply({ error: "Could not join the chat" });
            }
        })

        socket.on("sendMessage", async ({ targetUserId, text } = {}, ack) => {
            const reply = typeof ack === "function" ? ack : () => {};
            try {
                const trimmed = typeof text === "string" ? text.trim() : "";
                if (!trimmed) {
                    return reply({ error: "Message cannot be empty" });
                }
                if (trimmed.length > MAX_MESSAGE_LENGTH) {
                    return reply({ error: `Messages can be at most ${MAX_MESSAGE_LENGTH} characters` });
                }
                // Checked on every message so an ended connection can't keep chatting.
                if (!(await areConnected(userId, targetUserId))) {
                    return reply({ error: "You can only chat with your connections" });
                }

                const roomId = getConversationId(userId, targetUserId);
                const message = formatMessage(await Message.create({
                    conversationId: roomId,
                    senderId: userId,
                    receiverId: targetUserId,
                    text: trimmed
                }));

                // The sender gets it back through the ack; everyone else in the room (the other
                // user, and the sender's other tabs) gets it as an event.
                socket.to(roomId).emit("messageReceived", message);
                reply({ message });
            } catch (error) {
                console.error(error);
                reply({ error: "Message could not be sent" });
            }
        })

        socket.on("disconnect", () => {
            console.log(`User ${userId} disconnected`)
        })
    })
}

module.exports = initializeSocket
