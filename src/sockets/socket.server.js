const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const { createMemory, queryMemory } = require("../services/vector.service");
const messageModel = require("../models/message.model");
const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "https://apex-agent.netlify.app"],
            methods: ["GET", "POST"],
            credentials: true
        }
    })
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
        if (!cookies.token) {
            next(new Error("Authentication Error: No Token Found"))
        }
        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
            const user = await userModel.findOne({
                id: decoded._id
            })
            socket.user = user
            next()
        } catch (error) {
            next(new Error("Authentication Error: Invalid Token"))
        }

    }) //-> Middleware for Authentication socket io


    io.on("connection", (socket) => {
        socket.on('ai-message', async (messagePayload) => {
            /*
            const userMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: messagePayload.content,
                role: "user"
            })

            const vectors = await generateVector(messagePayload.content)
            */
            // Optimization
            const [userMessage, vectors] = await Promise.all([
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: messagePayload.content,
                    role: "user"
                }),
                generateVector(messagePayload.content),
            ])
            await createMemory({
                vectors,
                messageId: userMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })

            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {
                    user: socket.user._id
                }
            })

            await createMemory({
                vectors,
                messageId: userMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            })
            const formattedMemory = memory.map(item => { item.metadata.text }).join('\n')
            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat
            }).sort({ createdAt: 1 }).limit(20).lean()).reverse();

            const sortTermMemory = chatHistory.map((item) => {
                return ({
                    role: item.role,
                    parts: [{ text: item.content }]
                })
            })

            const longTermMemory = [
                {
                    role: "user",
                    parts: [{
                        text: `
                            these are some previous message from chat, use them to generate response
                            ${formattedMemory}
                        ` }]
                }
            ]

            const aiResponse = await generateResponse([...sortTermMemory, ...longTermMemory])

            socket.emit("ai-response", {
                content: aiResponse,
                chat: messagePayload.chat
            })
            /*
            const aiMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: aiResponse,
                role: "model"
            })

            const responseVectors = await generateVector(aiResponse)

            await createMemory({
                messageId: aiMessage._id,
                vectors: responseVectors,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: aiResponse
                }

            })
            */
            // Optimization
            const [aiMessage, responseVectors] = await Promise.all([
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: aiResponse,
                    role: "model"
                }),
                generateVector(aiResponse),
            ])

            await createMemory({
                messageId: aiMessage._id,
                vectors: responseVectors,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: aiResponse
                }

            })
        })
    })

}
module.exports = initSocketServer;