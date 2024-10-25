var requestAnimFrame = (callback) => {
    return window.requestAnimationFrame(callback)     || 
        window.webkitRequestAnimationFrame(callback)  ||
        window.mozRequestAnimationFrame(callback)     ||
        window.oRequestAnimationFrame(callback)       ||
        window.msRequestAnimationFrame(callback)      ||
        function (callback){
            window.setTimeout(callback, 1000 / 20);
        };
}

var animate = (game) => {
    // console.log("animate");
    
    // обновление
    game.render();
    // requestAnimFrame(() => animate(game));
}
var start_game = (data) => {    
    // const socket = window.socket;
    const canvas = document.querySelector('canvas#play-desk');
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    // Если ширина холста меньше высоты, поменять местами (для смартфонов, планшетов);

    const cntx = canvas.getContext('2d');
    game = new UI(canvas.width, canvas.height, data, cntx);

    animate(game);
};

