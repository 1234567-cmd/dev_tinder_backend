const express = require('express');
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");


userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const userRequests = await ConnectionRequest.find({
            toUserId: user._id,
            status: "interested"
        }).populate('fromUserId', ['firstName', 'lastName']); // Populate the fromUserId field with user details
        res.status(200).json({ requests: userRequests });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: user._id, status: "accepted" },
                { toUserId: user._id, status: "accepted" }
            ]
        }).populate('fromUserId toUserId', ['firstName', 'lastName']);
        res.status(200).json({ connections });
        const data = connections.map(connection => {
            connection.fromUserId
        }
        )
        res.status(200).json({ connections: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = userRouter;