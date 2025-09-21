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
        httpOnly: true,
        secure: true,
        sameSite: 'none',
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
        httpOnly: true,
        secure: true,
        sameSite: 'none',
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

const getUser = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.token) {
        return res.status(401).json({ message: "No token found" });
    }
    const token = cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User fetched successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUser
}