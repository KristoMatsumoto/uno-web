player_socket = () => {
    const socket = window.websocket;
    const canvas = document.querySelector('canvas#play-desk');
    
    canvas.addEventListener('click', (event) => {
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

    // Удаление игрока
    // Передача админки
}

player_socket();
