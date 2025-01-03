remove_player = (player_number) => {
    window.websocket.emit('remove_player', {
        room_id: window.socketData.room_id,
        is_admin: window.socketData.is_admin,
        player_number: player_number
    });
};

get_admin = (player_number) => {
    window.websocket.emit('get_admin', {
        room_id: window.socketData.room_id,
        is_admin: window.socketData.is_admin,
        player_number: player_number
    });
};

say_uno = () => {
    if (window.game == undefined) return;
    window.websocket.emit('say_uno', {
        room_id: window.socketData.room_id,
        player_number: window.socketData.player_number
    });
};
