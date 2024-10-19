const express = require("express");
const app = express();
const server = require("http").createServer(app);

// Socket connect
const socket = require('./socket')(server);

// Server starting
server.listen(4000, () => {
    console.log('WebSocket server listening on *:4000');
});
