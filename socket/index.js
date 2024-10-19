require('dotenv').config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);

// Socket connect
const socket = require('./socket')(server);

// Server starting
server.listen(process.env.SOCKET_PORT, () => {
    console.log(`WebSocket server listening on *:${process.env.SOCKET_PORT}`);
});
