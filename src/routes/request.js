const express = require('express');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require("../middlewares/auth")
const User = require('../models/user');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const { toUserId, status } = req.params;
        const fromUserId = req.user._id;

        const allowedStatuses = [ "accepted", "rejected", "interested", "ignored"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const toUser= await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "Recipient user not found" });
        }

        if(fromUserId.equals(toUserId)){
            return res.status(400).json({ message: "You cannot send a connection request to yourself" });
        }

        const existingRequest = await ConnectionRequest.findOne({ 
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
         });
        if (existingRequest) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

        const newRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await newRequest.save();
        res.status(201).json({ message: "Connection request sent successfully", data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while sending the connection request", error: error.message });
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const { status, requestId } = req.params;
        const allowedStatuses = [ "accepted", "rejected"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const connectionRequest = await ConnectionRequest.findById({ 
            _id: requestId,
            status: "interested",
            toUserId: req.user._id
         });
        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if (!connectionRequest.toUserId.equals(req.user._id)) {
            return res.status(403).json({ message: "You are not authorized to review this connection request" });
        }

        connectionRequest.status = status;
        const updatedRequest = await connectionRequest.save();
        res.status(200).json({ message: "Connection request reviewed successfully", data: updatedRequest });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while reviewing the connection request", error: error.message });
    }
});
module.exports = requestRouter;