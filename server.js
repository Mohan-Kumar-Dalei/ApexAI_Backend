require('dotenv').config();
const app = require('./src/app');
const connectToDB = require('./src/db/db');
const initSocketServer = require('./src/sockets/socket.server');
const httpServer = require('http').createServer(app);
connectToDB();
const PORT = 3000;
initSocketServer(httpServer);



httpServer.listen(PORT, () => {
    console.log('server is running on port', PORT);
})