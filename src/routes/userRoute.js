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
        }).populate('fromUserId', ['firstName', 'lastName'])
            .populate('toUserId', ['firstName', 'lastName']);

        const data = connections.map(connection => {
            if (connection.fromUserId._id.toString() === user._id.toString()) {
                return connection.toUserId;
            }
            return connection.fromUserId;
        });

        res.status(200).json({ connections: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = userRouter;