class UI{
    constructor(width, height, data, ctx){
        // -------------------- MAIN
        this.canvas_width = width;  // добавить resize
        this.canvas_height = height;
        this.ctx = ctx;
        
        // -------------------- PLAYERS SETTINGS
        this.this_player_number = window.socketData.player_number;
        this.current_turn = data.current_player;
        this.current_turn_timer = 0;
        const current_player_index = data.players.findIndex(player => player.player_number === this.this_player_number);
        this.players = data.players.slice(current_player_index + 1);
        this.players.push(...data.players.slice(0, current_player_index + 1));

        // -------------------- GAME SETTINGS
        this.rules = data.rules;

        // -------------------- KLIENT SETTINGS
        
        this.avatar_radius = this.canvas_width * 0.02;
        this.canvas_padding = 80//this.canvas_width * 0.01 + this.avatar_radius;
        this.card_width = 80;
        this.card_height = 120; // 1/3 от минимального размера ширины-высоты
        this.ellipse_radius_h = this.canvas_height - this.canvas_padding * 2;
        this.ellipse_radius_w = (this.canvas_width - this.canvas_padding) / 2;
        this.colors = {         // добавить данные от пользователя когда будет логика смены цвета 
            red: "#C9271D",
            blue: "#1D59AC",
            yellow: "#EDCD2C",
            green: "#3F911E"
        }
        // for (let i =0; i<this.players.length; i++){
        //     if (this.players[i].player_number == index){
        //         this.this_player_turn = i;
        //     }
        // }
    } 

    async preload_images() {
        this.cards_text = {};
        this.cards_cache = {};
        const cardsPromises = Array.from(document.querySelectorAll('#assets-cards img')).map((card) => {
            return fetch(card.src)
                .then(response => response.text())
                .then(svgText => {
                    this.cards_text[card.id] = svgText; 
    
                    const colorPromises = (
                        card.id !== 'back'  && 
                        card.id !== 'empty' && 
                        card.id !== '+4'    && 
                        card.id !== 'color_change'
                    ) 
                        ? ['green', 'yellow', 'blue', 'red'].map(color => this.get_colored_card(card.id, color))
                        : [this.get_colored_card(card.id)];
    
                    return Promise.all(colorPromises);
                })
                .catch((error) => {
                    console.error(`Ошибка загрузки ${card.id}:`, error);
                });
        });
    
        await Promise.all(cardsPromises);
        console.log('Все изображения загружены');
    }
    
    get_colored_card(value, color = 'all') {
        const key = `${value}_${color}`;
        if (this.cards_cache[key]) {
            return Promise.resolve(this.cards_cache[key]);
        }
    
        const originalSvg = this.cards_text[value];
        if (!originalSvg) {
            // console.warn(`Карта с id ${value} не найдена`);
            return Promise.resolve(this.cards_cache[`empty_all`]);
        }
    
        return new Promise((resolve) => {
            let coloredSvg = originalSvg;
            if (color !== 'all') {
                coloredSvg = originalSvg.replace(/fill="#C9271D"/g, `fill="${this.colors[color]}"`);
            }
    
            const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.src = url;
    
            img.onload = () => {
                this.cards_cache[key] = img;
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = () => {
                // console.error(`Ошибка загрузки изображения для ${key}`);
                resolve(this.cards_cache[`empty_all`]);
            };
        });
    }

    get_card(value, color = 'all') {
        const key = `${value}_${color}`;
        return this.cards_cache[key] || this.cards_cache[`empty_all`];
    }

    draw_with_ang = (x_center, y_center, angle, draw_element) => {
        this.ctx.save();
        this.ctx.translate(x_center, y_center);
        this.ctx.rotate(angle);
        draw_element();
        this.ctx.restore();
    }  

    draw_player_cards(player){
        if (player.player_number == this.this_player_number){
            let position = -this.canvas_width / 4;
            const step = (this.canvas_width / 2 - this.card_width) / player.cards.length;
            for (let i = 0; i < player.cards.length; i++){
                this.ctx.drawImage(this.get_card(player.cards[i].value, player.cards[i].color), position, -this.card_height, this.card_width * 2, this.card_height * 2);
                position += step;
            }
        } else {
            let position = -this.card_width * 2;
            const step = this.card_width * 3 / player.cards.length;
            for (let i = 0; i < player.cards.length; i++){
                this.ctx.drawImage(this.get_card('back'), position, 0, this.card_width, this.card_height);
                position += step;
            }
        }
    }

    draw_avatar(player, x, y, timer){

        this.ctx.beginPath();
        if (timer){
            // добавить таймер
        }
        this.ctx.closePath();


        this.ctx.beginPath();
        this.ctx.arc(x, y, this.avatar_radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'blue';    // ! изменить на аватар игрока, подгрузка изображения
        this.ctx.fill();
        this.ctx.closePath();
    }

    draw_nickname(player, x, y){
        this.ctx.beginPath();
        this.ctx.fillStyle = 'red';     // !
        this.ctx.font = '20px Arial';   // !
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.nickname, x, y);
        this.ctx.closePath();
    }

    draw_player_info(player, x, y){
        this.draw_avatar(player, x, y, false);  // ! изменить условие: если игрок ходит, таймер true
        this.draw_nickname(player, x, y + this.avatar_radius * 2);
    }
    
    draw_player(player, x, y, angle){
        this.draw_with_ang(x, y, angle, () => {
            this.draw_player_cards(player);
            if (player.player_number == this.this_player_number){
                this.draw_with_ang(-this.canvas_width / 4 - this.avatar_radius * 2, -this.card_height / 2, -angle, () => {
                    this.draw_player_info(player, 0, 0);
                });
            } else {
                this.draw_with_ang(-this.card_width * 3, this.card_height / 2, -angle, () => {
                    this.draw_player_info(player, 0, 0);
                });
            }
        });
    }

    draw_players(){
        const other_players_count = this.players.length - 1;

        for (let i = 0; i < other_players_count; i++) {
            const pi_i = Math.PI + (Math.PI * (2 * i + 1) / (2 * other_players_count));
            const x = (this.canvas_width / 2) + this.ellipse_radius_w * Math.cos(pi_i);
            const y = this.canvas_height - this.avatar_radius + this.ellipse_radius_h * Math.sin(pi_i);
            const alpha = Math.atan2( y - (this.canvas_height / 2), x - (this.canvas_width / 2)) - Math.PI / 2;

            this.draw_player(this.players[i], x, y, alpha ? alpha : Math.PI);
        }
        this.draw_player(this.players[other_players_count], this.canvas_width / 2, this.canvas_height - this.canvas_padding - this.avatar_radius, 0);
    }

    render(){
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
        this.ctx.beginPath();
        
        this.draw_players();
        // отрисовать сброс
        // отрисовать подбор
        // отрисовать кнопку UNO

        // отрисовать счет?

        this.ctx.closePath();
        this.ctx.restore();
    }
}
