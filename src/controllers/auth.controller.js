const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const registerUser = async (req, res) => {
    const { email, fullName: { firstName, lastName }, password } = req.body;
    const userExists = await userModel.findOne({
        email
    })

    if (userExists) {
        return (
            res.status(400).json({
                message: "User already exists"
            })
        )
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        email,
        fullName: {
            firstName,
            lastName
        },
        password: hashPassword
    })
    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET, { expiresIn: '2 years' })
    res.cookie('token', token)
    res.status(200).json({
        message: "User registered successfully",
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
        }
    })
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email
    })
    if (!user) {
        return (
            res.status(400).json({
                message: "Invalid email"
            })
        )
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return (
            res.status(400).json({
                message: "Invalid password"
            })
        )
    }
    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET, { expiresIn: '2 years' })
    res.cookie('token', token)
    res.status(200).json({
        message: "User logged in successfully",
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
        }
    })
}









module.exports = {
    registerUser,
    loginUser
}