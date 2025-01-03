require('dotenv').config();
const { Server } = require("socket.io");
const Game = require("../models/Game");
const Card = require("../models/Card");
const players = [];
const games = [];
const game_rules = [];
// const roomChannel = require('./room_channel');

function setupWebSocket(server) {
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
            socket.join(data.room_id);
            if (!players[data.room_id]) {
                players[data.room_id] = [];
            }
            if (players[data.room_id][data.player_number]) {
                if (players[data.room_id][data.player_number] && players[data.room_id][data.player_number].timer) {
                    clearTimeout(players[data.room_id][data.player_number].timer);
                }
                players[data.room_id][data.player_number].id = socket.id;
                players[data.room_id][data.player_number].nickname = data.nickname;
                players[data.room_id][data.player_number].avatar = data.avatar;
                // console.log(`User ${socket.data.nickname} (${socket.data.player_number}) reconnected to room ${socket.data.room_id}, timer cleared`);
                
                io.to(data.room_id).emit('player_reconnect', data);
                if (games[data.room_id])
                    io.to(data.room_id).emit('game_start', games[data.room_id].get_data());
            } else {
                players[data.room_id][data.player_number] = data;
                io.to(data.room_id).emit('player_join', data);
            }
        })
    
        socket.on('disconnect', () => {
            socket.leave(socket.data.room_id);

            // console.log(`A user ${socket.data.nickname} disconnected`);
            if (!games[socket.data.room_id] && players[socket.data.room_id] && players[socket.data.room_id][socket.data.player_number]){
                players[socket.data.room_id][socket.data.player_number].timer = setTimeout(() => {
                    // console.log(`Player ${socket.data.nickname} left room ${socket.data.room_id}`);

                    fetch(`${process.env.APP_PATH}/rooms/${socket.data.room_id}/leave/${socket.data.player_number}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(async response => {
                        if (response.ok) {
                            // console.log('Player removed from database:', socket.data.nickname);
                            io.to(socket.data.room_id).emit('player_leave', socket.data);
                            players[socket.data.room_id].splice(socket.data.player_number, 1);
                            // delete players[socket.data.room_id][socket.data.player_number];
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
                headers: { 'Content-Type': 'application/json' }
            })
            .then(async response => {
                if (response.ok) {
                    // console.log('Player', data.player_number, 'removed from database');
                    io.to(data.room_id).emit('player_removed', { player_number: data.player_number } );
                    players[socket.data.room_id].splice(socket.data.player_number, 1);
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
                headers: { 'Content-Type': 'application/json' }
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
            if (players[data.room_id].length < 2) {
                io.to(data.room_id).emit('game_start_error', 'No enought players to start play');
                return;
            }
                
            // отослать пинг всем игрокам?
            fetch(`${process.env.APP_PATH}/rooms/${socket.data.room_id}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
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

        finish_game = (room_id) => {
            fetch(`${process.env.APP_PATH}/rooms/${room_id}/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify(data)
            })
            .then(async response => {
                if (response.ok) {
                    io.to(room_id).emit('game_end', games[room_id].get_score());
                    delete games[room_id];
                    // console.log('Success:', data);
                } else {
                    const errorText = await response.text();
                    // console.error('Error:', errorText.slice(1, 300), "\n\n", errorText.slice(5000, 8000));
                }
            })
            .catch(error => {
                // console.error('Error while game finishing:', error);
            });
        }
        check_statuses = (room_id, statuses) => {
            const info_object = statuses.pop();
            if (statuses.find(status => status === Game.STATUS.GAME_OVER)) {
                finish_game(room_id);
            }
            if (statuses.find(status => status === Game.STATUS.PLAYERS_FINISHED))
                io.to(room_id).emit('players_finish_game', info_object.players_finished);
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
        });
        socket.on('draw_card', (data) => {
            const card = games[data.room_id].draw_card(data.player_number);
            // console.log(card, "\n");
            // переделать с выдачей статусов на случай включения правила не больше одной карты за ход и пас
            io.to(data.room_id).emit('players_draw_cards', [{ player_number: data.player_number, cards: [ card ] }]);
        });
        socket.on('say_uno', (data) => {
            const statuses = games[data.room_id].say_uno(data.player_number);
            if (statuses.find(status => status === Game.STATUS.FAILED)) return;
            io.to(data.room_id).emit('player_say_uno', data.player_number);
            check_statuses(data.room_id, statuses);
        });
        socket.on('end_turn', (data) => {
            // Только в свой ход 
            //      Если игрок уже клал карту, можно закончить
            //      Иначе не реагировать            
        });
        // добавить таймер на ход
        // добавить отображение аватаров
        // добавить кнопки закончить ход и уно
        // подсчитывать очки
        // чистка комнат
        // генерация ссылок-приглашений
        // игровые правила
        //      подключить изменения правил к сокету
        //      оформление, иконки, кастомные чек-батоны
        // добавить админ-иконку
        // добавить анимацию загрузки
        // Dissolve the room - кнопка распускания комнаты непосредственно админом
        //      как отослать сигнал остальным, перенаправить на другую страницу?
        //      использовать один сигнал и на беке, и на фронте, не отправляя ответ с бека?
    });
}

module.exports = setupWebSocket;
