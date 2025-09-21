const express = require('express')
const router = express.Router();
const { authUser } = require('../middlewares/auth.middleware')
const { createChat } = require('../controllers/chat.controller')

// POST /api/chat
router.post('/chat', authUser, createChat) // localhost:3000/api/chat



module.exports = router;