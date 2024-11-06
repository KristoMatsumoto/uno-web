require('dotenv').config();
const { Server } = require("socket.io");
const Game = require("../models/Game");
const players = [];
const games = [];
// const roomChannel = require('./room_channel');

function setupWebSocket(server){
    const io = new Server(server, {
        cors: {
            origin: "*",
            method: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        // roomChannel(io, socket);
        socket.on('room_join', (data) => {
            socket.data = data;
            if (!players[data.room_id]) {
                players[data.room_id] = [];
            }
            if (players[data.room_id][data.player_number]) {
                if (players[data.room_id][data.player_number] && players[data.room_id][data.player_number].timer) {
                    clearTimeout(players[data.room_id][data.player_number].timer);
                }
                players[data.room_id][data.player_number].id = socket.id;
                players[data.room_id][data.player_number].nickname = data.nickname;
                // console.log(`User ${socket.data.nickname} (${socket.data.player_number}) reconnected to room ${socket.data.room_id}, timer cleared`);
                socket.join(data.room_id);
                io.to(data.room_id).emit('player_reconnect', data);

                if (games[data.room_id]){
                    io.to(data.room_id).emit('game_start', games[data.room_id].get_data());
                }
            } else {
                players[data.room_id][data.player_number] = { 
                    id: socket.id,
                    nickname: data.nickname,
                    player_number: data.player_number,
                    is_admin: data.is_admin,
                    csrfToken: data.csrfToken,
                    cookie: data.cookie,
                    timer: null 
                };
                socket.join(data.room_id);
                io.to(data.room_id).emit('player_join', data);
            }
        })
    
        socket.on('disconnect', () => {
            // console.log(`A user ${socket.data.nickname} disconnected`);
            if (!games[socket.data.room_id]){
                players[socket.data.room_id][socket.data.player_number].timer = setTimeout(() => {
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
                            // console.log('Success:', data);
                        } else {
                            const errorText = await response.text();
                            // console.error('Error:', errorText);
                        }
                    })
                    .then(data => {
                        // console.log('Player removed from database:', socket.data.nickname);
                        io.to(socket.data.room_id).emit('room_leave', socket.data);
                        delete players[socket.data.room_id][socket.data.player_number];
                    })
                    .catch(error => {
                        // console.error('Error removing player from database:', error);
                    });
            }, 10000);}
        });

        socket.on('play_start', (data) => {
            // отослать пинг всем игрокам?
            fetch(`${process.env.APP_PATH}/rooms/${socket.data.room_id}/start`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': socket.data.csrfToken,
                    'Cookie': socket.data.cookie
                }
            })
            .then(async response => {
                if (response.headers.get('content-type').includes('application/json')) {
                    const data = await response.json();
                    // console.log('Success:', data);
                } else {
                    const errorText = await response.text();
                    // console.error('Error:', errorText.slice(1, 300), "\n\n", errorText.slice(5000, 8000));
                }
            })
            .then(ansdata => {
                games[data.room_id] = new Game(data.room_id, data.settings, players[data.room_id]);
                io.to(data.room_id).emit('game_start', games[data.room_id].get_data());
            })
            .catch(error => {
                // console.error('Error game starting:', error);
                io.to(data.room_id).emit('game_start_error', error);
            });
        });
    });
}

module.exports = setupWebSocket;
