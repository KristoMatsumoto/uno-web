require('dotenv').config();
const { Server } = require("socket.io");
const Game = require("../models/Game");
const Card = require("../models/Card");
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

                if (games[data.room_id])
                    io.to(data.room_id).emit('game_start', games[data.room_id].get_data());
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
            if (!(socket.data && socket.data.room_id && socket.data.player_number)) return;
            // console.log(`A user ${socket.data.nickname} disconnected`);
            if (!games[socket.data.room_id] && players[socket.data.room_id] && players[socket.data.room_id][socket.data.player_number]){
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
                        if (response.ok) {
                            // console.log('Player removed from database:', socket.data.nickname);
                            io.to(socket.data.room_id).emit('player_leave', socket.data);
                            delete players[socket.data.room_id][socket.data.player_number];
                        } else {
                            const errorText = await response.text();
                            // console.error('Error:', errorText);
                        }
                    })
                    .catch(error => {
                        // console.error('Error while removing player from database:', error);
                    });

                    // добавить проверку удаления комнаты
            }, 10000); }
        });

        socket.on('remove_player', (data) => {
            if (!data.is_admin) return;
            fetch(`${process.env.APP_PATH}/rooms/${data.room_id}/leave/${data.player_number}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': socket.data.csrfToken,
                    'Cookie': socket.data.cookie
                }
            })
            .then(async response => {
                if (response.ok) {
                    // console.log('Player', data.player_number, 'removed from database');
                    io.to(data.room_id).emit('player_removed', { player_number: data.player_number } );
                    delete players[data.room_id][data.player_number];
                } else {
                    const errorText = await response.text();
                    // console.error('Error:', errorText);
                }
            })
            .catch(error => { // console.error('Error while removing player from database:', error);
            });            
        });
        socket.on('get_admin', (data) => {
            if (!data.is_admin) return;
            fetch(`${process.env.APP_PATH}/rooms/${data.room_id}/get_admin/${data.player_number}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': socket.data.csrfToken,
                    'Cookie': socket.data.cookie
                }
            })
            .then(async response => {
                if (response.ok) {
                    // console.log('Player', data.player_number, 'got admin access');
                    players[data.room_id][data.player_number].is_admin = true;
                    io.to(data.room_id).emit('player_got_admin', { player_number: data.player_number });
                } else {
                    const errorText = await response.text();
                    // console.error('Error:', errorText);
                }
            })
            .catch(error => { // console.error('Error while getting admin access:', error);
            });
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
                if (response.ok) {
                    games[data.room_id] = new Game(data.room_id, data.settings, players[data.room_id]);
                    io.to(data.room_id).emit('game_start', games[data.room_id].get_data());
                    // console.log('Success:', data);
                } else {
                    const errorText = await response.text();
                    // console.error('Error:', errorText.slice(1, 300), "\n\n", errorText.slice(5000, 8000));
                }
            })
            .catch(error => {
                // console.error('Error while game starting:', error);
                io.to(data.room_id).emit('game_start_error', error);
            });
        });

        check_statuses = (room_id, statuses) => {
            const info_object = statuses.pop();
            // console.log("Statuses:", statuses, "\nInfo: ", info_object, "\n");

            if (statuses.find(status => status === Game.STATUS.GIVED_CARDS))
                io.to(room_id).emit('players_draw_cards', info_object.give_cards);
            if (statuses.find(status => status === Game.STATUS.CHECK_ON_COLOR_SELECTION))
                io.to(room_id).emit('check_on_color_selection', info_object.player_select);

            io.to(room_id).emit('updated_cards_useability', games[room_id].get_cards_info());
            io.to(room_id).emit('update_current_turn', { player_number: games[room_id].current_player_number() });
        }
        socket.on('putting_card', (data) => {
            // console.log(`Player number ${data.player_number} put card `, data.card);
            const game = games[data.room_id];
            const statuses = game.put_card(data.player_number, data.card.id);
            if (statuses.find(status => status === Game.STATUS.FAILED)) return;
            io.to(data.room_id).emit('player_put_card', {
                player_number: data.player_number, 
                card_id: data.card.id
            });
            check_statuses(data.room_id, statuses);
        });

        socket.on('color_selected', (data) => {
            // console.log(`Player number ${data.player_number} select color`, data.color);
            const statuses = games[data.room_id].select_color(data.player_number, data.color);
            if (statuses.find(status => status === Game.STATUS.FAILED)) return;
            io.to(data.room_id).emit('player_select_color', data.color);
            check_statuses(data.room_id, statuses);
        })

        socket.on('draw_card', (data) => {
            const card = games[data.room_id].draw_card(data.player_number);
            // console.log(card, "\n");
            io.to(data.room_id).emit('players_draw_cards', [{ player_number: data.player_number, cards: [ card ] }]);
        });
    });
}

module.exports = setupWebSocket;
