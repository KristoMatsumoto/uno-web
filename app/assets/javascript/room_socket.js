document.addEventListener('turbo:load', () => {
    const room_block = document.querySelector('[data-room-id][data-user-name][data-user-num]');
    if (room_block){
        const players_list = document.querySelector('#players');

        const room_id = room_block.getAttribute('data-room-id');
        const nickname = room_block.getAttribute('data-user-name');
        const player_number = room_block.getAttribute('data-user-num');

        const socket = io('http://localhost:4000');
        // console.log(`${room_id} ${nickname}`)

        

        socket.emit('join_room', {
            room: room_id, 
            nickname: nickname,
            player_number: player_number
        });

        socket.on('join_room', (data) => {
            if (!players_list.querySelector(`[data-player-num="${data.player_number}"]`)){
                const player_block = document.createElement('div');
                player_block.className = 'player-info';
                player_block.setAttribute('data-player-num', data.player_number);
                player_block.innerHTML = data.nickname;
                
                players_list.appendChild(player_block);
            }            
            console.log('New player join the room: ', data.nickname);
        });
    }
});