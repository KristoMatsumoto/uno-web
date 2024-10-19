require('dotenv').config();
const { Server } = require("socket.io");
// const roomChannel = require('./room_channel');

function setupWebSocket(server){
    const io = new Server(server, {
        cors: {
            origin: process.env.APP_PATH,
            method: ["GET", "POST"]
        }
    })

    io.on('connection', (socket) => {
        // roomChannel(io, socket);
        socket.on('room_join', (data) => {
            socket.data = data;
            socket.join(data.room_id);
            io.to(data.room_id).emit('room_join', data);
        })
    
        socket.on('disconnect', () => {
            console.log('A user disconnected');
            setTimeout(() => {
                if (!socket.connectedOnce) {
                    socket.leave(socket.data.room_id);
                    // console.log(`Player ${socket.data.nickname} left room ${socket.data.room_id}`);

                    fetch(`${process.env.APP_PATH}/rooms/${socket.data.room_id}/leave/${socket.data.player_number}`, {
                        method: 'DELETE',
                        headers: { 
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': socket.data.csrfToken,
                            'Cookie': socket.data.cookie
                        }
                    })
                    .then(async response => {
                        if (response.headers.get('content-type').includes('application/json')) {
                            const data = await response.json();
                            console.log('Success:', data);
                        } else {
                            const errorText = await response.text();
                            console.error('Error:', errorText);  // Это может быть HTML-контент ошибки
                        }
                    })
                    .then(data => {
                        // console.log('Player removed from database:', socket.data.nickname);
                        io.to(socket.data.room_id).emit('room_leave', socket.data);
                    })
                    .catch(error => {
                        // console.error('Error removing player from database:', error);
                    });
                }
            }, 10000);
        });

    })
}

module.exports = setupWebSocket;
