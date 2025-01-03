render_player_block = (players_list, data) => {
    const player_block = document.createElement('div');
    player_block.className = `player-info-border${data.player_number == window.socketData.player_number ? "youself" : ""}`;
    player_block.setAttribute('data-player-num', data.player_number);
    player_block.innerHTML = 
        `<div class='player-info'>
            <div class='avatar'>
                <img src='/assets/${data.avatar}' alt='avatar icon'>
            </div>
            <div class='nickname'>${data.nickname}</div>
            <button class='little-button get-admin${window.socketData.is_admin ? "" : " admin-hidden"}${data.player_number == window.socketData.player_number ? " hidden" : ""}' onclick='get_admin(${data.player_number})'></button>
            <button class='little-button remove-from-room${window.socketData.is_admin ? "" : " admin-hidden"}${data.player_number == window.socketData.player_number ? " hidden" : ""}' onclick='remove_player(${data.player_number})' ></button>
        </div>`;
    players_list.appendChild(player_block);
};

remove_player_block = (players_list, player_number) => {
    const player_block = players_list.querySelector(`[data-player-num="${player_number}"]`);
    players_list.removeChild(player_block);
}

room_socket = () => {
    const room_block = document.querySelector('[data-room-id][data-user-name][data-user-num][data-avatar]');
    if (room_block){
        const players_list = document.querySelector('#players');
    
        const room_id = room_block.getAttribute('data-room-id');
        const nickname = room_block.getAttribute('data-user-name');
        const player_number = room_block.getAttribute('data-user-num');
        const avatar = room_block.getAttribute('data-avatar');
        const is_admin = document.querySelector('[data-room-id][data-user-name][data-user-num][data-avatar][data-admin]') ? true : false;

        const data = {
            room_id: room_id, 
            game_start: false,
            nickname: nickname,
            avatar: avatar,
            player_number: player_number,
            is_admin: is_admin
        }

        const socket = io(`${window.location.protocol}//${window.location.hostname}:4000`);
        
        window.websocket = socket;
        window.socketData = data;
        if (!window.game) window.game = null;

        socket.on('connect', () => {
            socket.emit('room_join', window.socketData);
            // console.log(`User ${socket.id} connecting...`);
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

        socket.on('player_leave', (data) => {
            // console.log(`User ${data.nickname} disconected`);
            remove_player_block(players_list, data.player_number);
        });

        socket.on('player_removed', (data) => {
            // console.log('Player ', data.player_number, " removed");
            if (data.player_number == window.socketData.player_number)
                window.location.href = '/rooms/new';
            else 
                remove_player_block(players_list, data.player_number);
        });

        socket.on('player_got_admin', (data) => {
            console.log('Player ', data.player_number, " got admin access");
            if (data.player_number == window.socketData.player_number) {
                window.socketData.is_admin = true;
                document.querySelectorAll('.admin-hidden').forEach((elem) => {
                    elem.classList.remove('admin-hidden');
                });
            }
        });
}};

room_socket();
