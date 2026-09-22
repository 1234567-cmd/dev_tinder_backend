const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Message = require("../models/message");
const User = require("../models/user");
const { getConversationId, areConnected, formatMessage } = require("../utils/chat");

const HISTORY_LIMIT = 100;

// Returns the other user's basic profile and the latest messages, oldest first.
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        if (!(await areConnected(userId, targetUserId))) {
            return res.status(403).json({ message: "You can only chat with your connections" });
        }

        const targetUser = await User.findById(targetUserId).select("firstName lastName photoUrl");
        const latest = await Message.find({ conversationId: getConversationId(userId, targetUserId) })
            .sort({ createdAt: -1 })
            .limit(HISTORY_LIMIT)
            .lean();

        res.status(200).json({ targetUser, messages: latest.reverse().map(formatMessage) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Could not load the chat" });
    }
});

module.exports = chatRouter;
