socket = () => {
    const room_block = document.querySelector('[data-room-id][data-user-name][data-user-num]');
    if (room_block){
        const players_list = document.querySelector('#players');
    
        const room_id = room_block.getAttribute('data-room-id');
        const nickname = room_block.getAttribute('data-user-name');
        const player_number = room_block.getAttribute('data-user-num');
    
        const socket = io('http://localhost:4000');
        
        socket.on('connect', () => {
            if (!socket.connectedOnce) {
                socket.emit('room_join', {
                    room_id: room_id, 
                    nickname: nickname,
                    player_number: player_number,
                    csrfToken: document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    cookie: document.cookie
                });
                socket.connectedOnce = true;
            }
        });
    
        socket.on('disconnect', () => {
            // console.log(`User ${nickname} disconnecting...`);
            socket.connectedOnce = false;
        });
    
        socket.on('room_join', (data) => {
            if (!players_list.querySelector(`[data-player-num="${data.player_number}"]`)){
                const player_block = document.createElement('div');
                player_block.className = 'player-info';
                player_block.setAttribute('data-player-num', data.player_number);
                player_block.innerHTML = data.nickname;
                
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

socket();
