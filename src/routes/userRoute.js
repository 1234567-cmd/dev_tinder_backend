const express = require('express');
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequest } = require("../models/connectionRequest");


userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const userRequests = await ConnectionRequest.find({
            toUserId: user._id,
        });
        res.status(200).json({ requests: userRequests });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = userRouter;