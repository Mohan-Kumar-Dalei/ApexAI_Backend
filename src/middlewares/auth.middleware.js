const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const authUser = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return (
            res.status(401).json({
                message: "token not found"
            })
        )
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findOne({
            id: decoded._id
        })
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized"
        })
    }
}



module.exports = {
    authUser
}