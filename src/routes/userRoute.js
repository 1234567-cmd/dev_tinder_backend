const express = require('express');
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


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

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const user = req.user;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const skip = (page - 1) * limit;

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: user._id,  },
                { toUserId: user._id,  }
            ]
        }).select('fromUserId toUserId ');

        const hideUsersFromFeed= new Set();
        connections.forEach(connection => {
            if (connection.fromUserId.toString() === user._id.toString()) {
                hideUsersFromFeed.add(connection.toUserId.toString());
            } else {
                hideUsersFromFeed.add(connection.fromUserId.toString());
            }
        });

        const query = {
         $and: [
            { _id: { $ne: user._id } },
            { _id: { $nin: Array.from(hideUsersFromFeed) } }
         ]
        };

        const total = await User.countDocuments(query);
        const feedUsers = await User.find(query)
            .select('firstName lastName email')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            feed: feedUsers,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = userRouter;
