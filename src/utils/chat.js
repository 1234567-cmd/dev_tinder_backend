const mongoose = require("mongoose");
const ConnectionRequest = require("../models/connectionRequest");

// Sorted so both users get the same id; used as the socket room and the stored conversationId.
const getConversationId = (userId, targetUserId) =>
  [userId.toString(), targetUserId.toString()].sort().join("-");

// Chat is only allowed between users whose connection request was accepted (in either direction).
const areConnected = async (userId, targetUserId) => {
  if (!mongoose.isValidObjectId(targetUserId)) {
    return false;
  }
  const connection = await ConnectionRequest.exists({
    $or: [
      { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
      { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
    ],
  });
  return Boolean(connection);
};

// Plain shape sent to the client, both over the socket and from GET /chat/:targetUserId.
const formatMessage = (message) => ({
  _id: message._id.toString(),
  senderId: message.senderId.toString(),
  text: message.text,
  createdAt: message.createdAt,
});

module.exports = { getConversationId, areConnected, formatMessage };
