const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
/* Router*/
const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')


// Middleware
app.use(express.json())
app.use(cookieParser())

// use routes
app.use('/auth', authRoutes) 
app.use('/api', chatRoutes)









module.exports = app;