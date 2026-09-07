const express= require('express');
const requestRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest');
const {userAuth} = require("../middlewares/auth")

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const { toUserId, status } = req.params;
        const fromUserId = req.user._id;

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
        res.status(500).json({ message: "An error occurred while sending the connection request", error: error.message});
    }
});

module.exports = requestRouter;