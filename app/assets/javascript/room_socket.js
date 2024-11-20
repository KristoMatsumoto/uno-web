render_player_block = (players_list, data) => {
    const player_block = document.createElement('div');
    player_block.className = `player-info-border${data.player_number == window.socketData.player_number ? "youself" : ""}`;
    player_block.setAttribute('data-player-num', data.player_number);
    player_block.innerHTML = 
        `<div class='player-info'>
            <div class='avatar'>
                <img src='/assets/avatar_icon.svg' alt='avatar icon'>
            </div>
            <div class='nickname'>${data.nickname}</div>
            <button class='little-button get-admin${window.socketData.is_admin ? "" : " hidden"}'></button>
            <button class='little-button remove-from-room${window.socketData.is_admin ? "" : " hidden"}'></button>
        </div>`;
    players_list.appendChild(player_block);
};

room_socket = () => {
    const room_block = document.querySelector('[data-room-id][data-user-name][data-user-num]');
    if (room_block){
        const players_list = document.querySelector('#players');
    
        const room_id = room_block.getAttribute('data-room-id');
        const nickname = room_block.getAttribute('data-user-name');
        const player_number = room_block.getAttribute('data-user-num');
        const is_admin = document.querySelector('[data-room-id][data-user-name][data-user-num][data-admin]') ? true : false;

        const data = {
            room_id: room_id, 
            game_start: false,
            nickname: nickname,
            player_number: player_number,
            is_admin: is_admin,
            csrfToken: document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            cookie: document.cookie
        }

        const socket = io(`${window.location.protocol}//${window.location.hostname}:4000`);
        
        window.websocket = socket;
        window.socketData = data;
        if (!window.game) window.game = null;

        socket.on('connect', () => {
            socket.emit('room_join', window.socketData);
            // console.log(`User ${socket.id} reconnecting...`);
        });
    
        socket.on('disconnect', () => {
            // console.log(`User ${nickname} disconnecting...`);
        });        
            
        socket.on('player_join', (data) => {
            if (!players_list.querySelector(`[data-player-num="${data.player_number}"]`)){
                render_player_block(players_list, data);
            }
            // console.log('New player join the room', data.room_id, ': ', data.nickname, "\n", data);
        });
    
        socket.on('player_reconnect', (data) => {
            const player_block = players_list.querySelector(`[data-player-num="${data.player_number}"]`);
            if (player_block){
                player_block.querySelector('.nickname').innerHTML = data.nickname;
            } else {
                render_player_block(players_list, data);
            }
            // console.log('Player ', data.nickname, " reconnect");
        });

        socket.on('room_leave', (data) => {
            // console.log(`User ${data.nickname} disconected`);
            const player_block = players_list.querySelector(`[data-player-num="${data.player_number}"]`);
            players_list.removeChild(player_block);
        });
}};

room_socket();
