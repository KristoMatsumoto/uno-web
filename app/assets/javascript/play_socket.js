get_formData = () => {
    const settings = {};
    document.querySelectorAll('#settings-form div input').forEach((input) => {
        if (input.type === 'checkbox') {
            if (input.checked) settings[input.name] = input.value;
        } else 
            settings[input.name] = input.value;
    });
    return settings;
}

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
                settings: get_formData(),
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

    socket.on('game_end', (data) => {
        if (window.socketData.game_start) {
            // console.log("Signal end game confirm: ", data);
            window.socketData.game_start = false;
            window.end_game(data); 
        }
    });

    canvas.addEventListener('click', () => {
        const game = window.game;
        if (game == undefined) return;
        
        if (game.clicking_on_desk(() => {
            socket.emit('draw_card', {
                room_id: game.room_id,
                player_number: window.socketData.player_number
            });
        })) return;

        if (game.clicking_on_color((color) => {
            socket.emit('color_selected', {
                room_id: game.room_id,
                player_number: window.socketData.player_number,
                color: color
            })
        })) return;
        
        if (game.clicking_on_card((card) => {
            socket.emit('putting_card', { 
                room_id: game.room_id,
                card: card,
                player_number: window.socketData.player_number
            });
        })) return;
    });

    socket.on('player_put_card', (data) => {
        // console.log(`Player put card id${data.card_id}`);
        window.game.put_card(data.player_number, data.card_id);
    });
    socket.on('players_draw_cards', (data) => {
        // console.log(data);
        window.game.draw_cards(data);
    });
    socket.on('players_finish_game', (data) => {
        // console.log(data);
        window.game.finish_game_for(data);
    });
    socket.on('player_select_color', (data) => {
        // console.log("Selected color: ", data);
        window.game.update_selected_color(data);
    });
    socket.on('player_say_uno', (data) => {
        // console.log("Selected color: ", data);
        window.game.player_say_uno(data);
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
}

play_socket();
