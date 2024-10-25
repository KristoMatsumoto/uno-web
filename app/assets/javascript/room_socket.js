function room_socket() {
    const room_block = document.querySelector('[data-room-id][data-user-name][data-user-num]');
    if (room_block){
        const players_list = document.querySelector('#players');
    
        const room_id = room_block.getAttribute('data-room-id');
        const nickname = room_block.getAttribute('data-user-name');
        const player_number = room_block.getAttribute('data-user-num');
        const is_admin = document.querySelector('[data-room-id][data-user-name][data-user-num][data-admin]') ? true : false;

        const data = {
            room_id: room_id, 
            nickname: nickname,
            player_number: player_number,
            is_admin: is_admin,
            csrfToken: document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            cookie: document.cookie
        }

        const socket = io(`${window.location.protocol}//${window.location.hostname}:4000`);
        
        window.websocket = socket;
        window.socketData = data;

        socket.on('connect', () => {
            socket.emit('room_join', window.socketData);
            // console.log(`User ${socket.id} reconnecting...`);
            socket.emit('reconnect', window.socketData);
        // Обновить ник
        });
    
        socket.on('disconnect', () => {
            // console.log(`User ${nickname} disconnecting...`);
        });
    
        socket.on('room_join', (data) => {
            if (!players_list.querySelector(`[data-player-num="${data.player_number}"]`)){
                const player_block = document.createElement('div');
                player_block.className = 'player-info';
                player_block.setAttribute('data-player-num', data.player_number);
                player_block.innerHTML = 
                    `<div class='avatar'>
                        <img src='/assets/avatar_icon.svg' alt='avatar icon'>
                    </div>
                    <div class='nickname'>${data.nickname}</div>
                    <button class='little-button get-admin'></button>
                    <button class='little-button remove-from-room'></button>`;
                
                players_list.appendChild(player_block);
            }
            // console.log('New player join the room', data.room_id, ': ', data.nickname, "\n", data);
        });
            
        socket.on('room_leave', (data) => {
            // console.log(`User ${data.nickname} disconected`);
            const player_block = players_list.querySelector(`[data-player-num="${data.player_number}"]`);
            players_list.removeChild(player_block);
        });
}}

room_socket();
