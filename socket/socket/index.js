const { Server } = require("socket.io");
// const roomChannel = require('./room_channel');

function setupWebSocket(server){
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            method: ["GET", "POST"]
        }
    })

    io.on('connection', (socket) => {
        // roomChannel(io, socket);
        socket.on('join_room', (data) => {
            socket.join(data.room_id);
            io.to(data.room_id).emit('join_room', data)
        })
    })
}

module.exports = setupWebSocket;
