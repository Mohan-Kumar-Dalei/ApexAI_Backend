const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/auth.controller');
router.post('/register', registerUser); // POST http://localhost:3000/auth/register
router.post('/login', loginUser); // POST http://localhost:3000/auth/login

module.exports = router;