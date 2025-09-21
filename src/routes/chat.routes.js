const express = require('express')
const router = express.Router();
const { authUser } = require('../middlewares/auth.middleware')
const { createChat, getChats } = require('../controllers/chat.controller')
const { getMessages } = require('../controllers/chat.controller')

// POST /api/chat
router.post('/chat', authUser, createChat) // localhost:3000/api/chat
// GET /api/chat 
router.get('/chat', authUser, getChats) // localhost:3000/api/chat
// GET /api/chat/:chatId/messages
router.get('/chat/:chatId/messages', authUser, getMessages) // localhost:3000/api/chat/:chatId/messages



module.exports = router;