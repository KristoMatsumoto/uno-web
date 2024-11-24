play_socket = () => {
    const play_button = document.querySelector('button#start-game');
    const socket = window.websocket;
    const canvas = document.querySelector('canvas#play-desk');
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
            window.end_game(); 
        }
    });

    canvas.addEventListener('click', () => {
        const game = window.game;
        if (game == undefined) return;
        
        const color = game.is_clicking_on_color();
        const card = game.get_selected_card();
        if (game.is_clicking_on_desk()) {
            socket.emit('draw_card', {
                room_id: game.room_id,
                player_number: window.socketData.player_number
            });
        } else if (color) {
            socket.emit('color_selected', {
                room_id: game.room_id,
                player_number: window.socketData.player_number,
                color: color
            })
        } else if (card) {
            // console.log("put card: ", card);
            socket.emit('putting_card', { 
                room_id: game.room_id,
                card: card,
                player_number: window.socketData.player_number
            });
        }
    });

    socket.on('player_put_card', (data) => {
        // console.log(`Player put card id${data.card_id}`);
        window.game.put_card(data.player_number, data.card_id);
    });
    socket.on('player_draw_card', (data) => {
        // console.log(`Player draw card id${data.card.id}`);
        window.game.draw_card(data.player_number, data.card);
    });
    socket.on('players_draw_cards', (data) => {
        window.game.draw_cards(data);
    });

    socket.on('updated_cards_useability', (data) => {
        // console.log("Cards useability have been updated", data);
        window.game.update_cards_useability(data);
    });
    socket.on('update_current_turn', (data) => {
        window.game.update_current_turn(data.player_number);
        // console.log("Current turn have been updated");
    });

    socket.on('check_on_color_selection', (data) => {
        // console.log("Check on color selection from player " + data);
        window.game.check_color_selection(data);
    });
    socket.on('player_select_color', (data) => {
        // console.log("Selected color: ", data);
        window.game.update_selected_color(data);
    });
}

play_socket();
