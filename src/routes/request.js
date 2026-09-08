const express = require('express');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require("../middlewares/auth")
const User = require('../models/user');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const { toUserId, status } = req.params;
        const fromUserId = req.user._id;

        const allowedStatuses = ["ignored", "interested", "accepted", "rejected"];
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

module.exports = requestRouter;