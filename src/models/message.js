const mongoose = require("mongoose")

const MAX_MESSAGE_LENGTH = 1000

const messageSchema = new mongoose.Schema({
    // Same for both users of a chat (see getConversationId), so one index serves the whole history.
    conversationId: {
        type: String,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxLength: MAX_MESSAGE_LENGTH
    }
}, {
    timestamps: true
})

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema)
module.exports.MAX_MESSAGE_LENGTH = MAX_MESSAGE_LENGTH
