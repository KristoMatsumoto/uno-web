player_socket = () => {
    const socket = window.websocket;
    const canvas = document.querySelector('canvas#play-desk');
    
    canvas.addEventListener('click', (event) => {
        const game = window.game;
        if (game.is_clicking_on_desk()) {
            socket.emit('draw_card', {
                room_id: game.room_id,
                player_number: window.socketData.player_number
            });
        } else {
            const card = game.get_selected_card();
            if (card) {
                // console.log("put card: ", card);
                socket.emit('putting_card', { 
                    room_id: game.room_id,
                    card: card,
                    player_number: window.socketData.player_number
                });
            }
        }
    });

    // Удаление игрока
    // Передача админки
}

player_socket();
