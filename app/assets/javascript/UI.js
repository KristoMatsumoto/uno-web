class UI{
    constructor(width, height, data, ctx){
        this.canvas_width = width;
        this.canvas_height = height;
        this.ctx = ctx;
        
        this.this_player_number = window.socketData.player_number;
        this.current_turn = data.current_player;
        this.current_turn_timer = 0;
        const current_player_index = data.players.findIndex(player => player.player_number === this.this_player_number);
        this.players = data.players.slice(current_player_index + 1);
        this.players.push(...data.players.slice(0, current_player_index + 1));

        this.rules = data.rules;

        this.avatar_radius = this.canvas_width * 0.025;
        this.canvas_padding = this.canvas_width * 0.01;
        // for (let i =0; i<this.players.length; i++){
        //     if (this.players[i].player_number == index){
        //         this.this_player_turn = i;
        //     }
        // }
    }
    // game logic
    // Создать класс игрока и карт (информация об игроке, цвета для карт, состояние руки)
    // Создать колоду?

    drawPlayer(player, x, y){
        // Разбить блок на элементы (аватар + таймер, ник, колода)
        // Центр блока - аргументы x, y

        // Рисуем аватар игрока
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.avatar_radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'blue';
        this.ctx.fill();
        this.ctx.closePath();

        // Рисуем ник игрока горизонтально
        this.ctx.fillStyle = 'red';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.nickname, x, y + this.avatar_radius * 2); // Ник под аватаром    
    }

    drawPlayers(){
        const other_players_count = this.players.length - 1;

        this.ctx.beginPath();
        for (let i = 0; i < other_players_count; i++) {
            const pi_i = Math.PI + (Math.PI * (2 * i + 1) / (2 * other_players_count));
            const x = (this.canvas_width / 2) + ((this.canvas_width - this.avatar_radius) / 2) * Math.cos(pi_i);
            const y = this.canvas_height - this.avatar_radius + (this.canvas_height - 2 * this.avatar_radius) * Math.sin(pi_i);

            this.drawPlayer(this.players[i], x, y);
        }
        this.drawPlayer(this.players[other_players_count], this.canvas_width / 2, this.canvas_height - 100);
        this.ctx.closePath();
    }

    render(){
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
        this.ctx.beginPath();
        
        this.drawPlayers();

        this.ctx.closePath();
        this.ctx.restore();
    }
}