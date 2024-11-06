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

animate = (game) => {
    // обновление
    game.render();
    requestAnimFrame(() => animate(game));
};

start_game = async (data) => {    
    // const socket = window.socket;
    const canvas = document.querySelector('canvas#play-desk');
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    // Если ширина холста меньше высоты, поменять местами (для смартфонов, планшетов);

    const cntx = canvas.getContext('2d');
    game = new UI(canvas.width, canvas.height, data, cntx);
    await game.preload_images();

    animate(game);
};
