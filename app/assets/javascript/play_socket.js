play_socket = () => {
    const play_button = document.querySelector('button#start-game');
    const socket = window.websocket;
    // const data = window.socketData;
    
    play_button.addEventListener('click', () => {
        // console.log(new FormData(document.querySelector('.settings-block form')));
        if (window.socketData.is_admin){
            socket.emit('play_start', {
                room_id: window.socketData.room_id,
                settings: new FormData(document.querySelector('.settings-block form')),
                player: window.socketData
            });
            this.disabled = true;
        }
    });

    socket.on('game_start', (data) => {
        if (!window.socketData.game_start){
            window.socketData.game_start = true;
            // console.log("Signal start game confirm: ", data);
            const room_block = document.getElementById('room-form');
            const canvas_block = document.getElementById('play-desk-block');
    
            room_block.classList.add('hidden');
            canvas_block.classList.remove('hidden');
            window.start_game(data); 
        }
    });

    socket.on('game_start_error', (error) => {
        // console.log('Error game starting', error);
        window.socketData.game_start = false;
        play_button.disabled = false;
    });

    socket.on('game_end', () => {
        if (window.socketData.game_start){
            window.socketData.game_start = false;
            // console.log("Signal end game confirm: ", data);
            const room_block = document.getElementById('room-form');
            const canvas_block = document.getElementById('play-desk-block');
    
            room_block.classList.remove('hidden');
            canvas_block.classList.add('hidden'); 
        }
    });
}

play_socket();
