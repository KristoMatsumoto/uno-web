requestAnimFrame = (callback) => {
    return window.requestAnimationFrame(callback)     || 
        window.webkitRequestAnimationFrame(callback)  ||
        window.mozRequestAnimationFrame(callback)     ||
        window.oRequestAnimationFrame(callback)       ||
        window.msRequestAnimationFrame(callback)      ||
        function (callback){
            window.setTimeout(callback, 1000 / 20);
        };
};

animate = () => {
    window.game.render();
    requestAnimFrame(() => animate());
};

start_game = async (data) => {
    const canvas = document.querySelector('canvas#play-desk');
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    // Если ширина холста меньше высоты, поменять местами (для смартфонов, планшетов);

    const cntx = canvas.getContext('2d');
    
    game = new UI(canvas.width, canvas.height, data, cntx);
    await game.preload_images();

    animate(game);

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        if (game) game.update_mouse_position(event.clientX - rect.left, event.clientY - rect.top);
    });

    window.addEventListener('resize', () => {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        if (game) game.resize(canvas.width, canvas.height);
    });

    window.game = game;
};
end_game = () => { window.game = game = null; };
