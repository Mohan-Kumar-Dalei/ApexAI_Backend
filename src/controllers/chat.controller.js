const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model')


const createChat = async (req, res) => {
    const { title } = req.body;
    const user = req.user

    const chat = await chatModel.create({
        user: user._id,
        title
    });
    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat._id,
            user: chat.user,
            title: chat.title,
            lastActivity: chat.lastActivity,
        }
    })
}

const getChats = async (req, res) => {
    try {
        const user = req.user
        const chats = await chatModel.find({
            user: user._id
        }).sort({ lastActivity: -1 }).lean()
        return res.status(200).json({
            chats
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch chats'
        })
    }
}

const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params
        const messages = await messageModel.find({
            chat: chatId
        }).sort({ createdAt: 1 }).lean()
        return res.status(200).json({ messages })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch messages' })
    }
}

module.exports = {
    createChat,
    getChats,
    getMessages
}
