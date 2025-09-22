const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express();
/* Router*/
const authRoutes = require('./routes/auth.routes')
const chatRoutes = require('./routes/chat.routes')



// Middleware
app.use(express.json())
app.use(cookieParser())

// CORS configuration - allow frontend origins and credentials (cookies)
const allowedOrigins = [
    'http://localhost:5173',
    'https://apex-agent.netlify.app',
]

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin like mobile apps or curl
        if (!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
            return callback(new Error(msg), false)
        }
        return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}))

// Ensure preflight (OPTIONS) requests get a quick response
// note: global CORS middleware above handles preflight for defined origins

// use routes
app.use('/auth', authRoutes)
app.use('/api', chatRoutes)









module.exports = app;