class UI {
    draw_color_selection = false;

    constructor(width, height, data, ctx){
        // -------------------- MAIN
        this.room_id = data.room_id;
        this.canvas_width = width; 
        this.canvas_height = height;
        this.ctx = ctx;
        
        // -------------------- PLAYERS SETTINGS
        this.this_player_number = window.socketData.player_number;
        this.current_turn = data.current_player;
        this.set_timer(120);
        const current_player_index = data.players.findIndex(player => this.is_this_player(player));
        this.players = data.players.slice(current_player_index + 1);
        this.players.push(...data.players.slice(0, current_player_index + 1));

        // -------------------- GAME SETTINGS
        this.rules = data.rules;
        this.dropping_cache = [data.last_card];
        this.dropping_cache_max_length = this.players.length + 1;

        // -------------------- KLIENT SETTINGS
        this.client_mouse_x = null;
        this.client_mouse_y = null;
        this.avatar_radius = 0;
        this.canvas_padding = 80//this.canvas_width * 0.01 + this.avatar_radius;
        this.card_width = 80;
        this.card_height = 120; // 1/6 от минимального размера ширины-высоты
        this.client_card_width = () => { return this.card_width * 1.5; };
        this.client_card_height = () => { return this.card_height * 1.5; };
        this.selected_card_width = () => { return this.card_width * 2; };
        this.selected_card_height = () => { return this.card_height * 2; };
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
        if (data.check_on_color_selection && data.color_selection_player === this.this_player_number)
            this.draw_color_selection = data.check_on_color_selection;
        this.color_selection_position = [];

        this.update_sizes();        
    } 

    set_color_selection_positions() {
        const x_center = this.canvas_width / 2;
        const y_center = this.canvas_height / 2;
        this.color_selection_position = [
            {
                color_name: 'green',
                color: this.colors.green,
                pos_x: x_center - this.card_width - 10,
                pos_y: y_center - this.card_width - 10
            }, 
            {
                color_name: 'yellow',
                color: this.colors.yellow,
                pos_x: x_center + 10,
                pos_y: y_center - this.card_width - 10
            }, 
            {
                color_name: 'blue',
                color: this.colors.blue,
                pos_x: x_center - this.card_width - 10,
                pos_y: y_center + 10
            }, 
            {
                color_name: 'red',
                color: this.colors.red,
                pos_x: x_center + 10,
                pos_y: y_center + 10
            }, 
        ];
    }
    set_players_block_angle() {
        const other_players_count = this.players.length - 1;

        for (let i = 0; i < other_players_count; i++) {
            const pi_i = Math.PI + (Math.PI * (2 * i + 1) / (2 * other_players_count));
            const x = (this.canvas_width / 2) + this.ellipse_radius_w * Math.cos(pi_i);
            const y = this.canvas_height - this.avatar_radius + this.ellipse_radius_h * Math.sin(pi_i);
            const alpha = Math.atan2(y - (this.canvas_height / 2), x - (this.canvas_width / 2)) - Math.PI / 2;

            this.players[i].block_x = x;
            this.players[i].block_y = y;
            this.players[i].angle = alpha ? alpha : Math.PI;
        }
        this.players[other_players_count].block_x = this.canvas_width / 2;
        this.players[other_players_count].block_y = this.canvas_height - this.client_card_height();
        this.players[other_players_count].angle = 0;
    }
    set_this_player_cards_position() {
        const player = this.players[this.players.length - 1];
        const player_cards = player.cards;
        const width = this.canvas_width / 2;
        const start_position = -this.canvas_width / 4;
        let step = (width - this.client_card_width()) / (player_cards.length - 1);
        if (player_cards.length === 1) step = 0;
        for (let i = 0; i < player_cards.length; i++) {
            player_cards[i].pos_x = start_position + step * i;
            if (player_cards[i].selected) { 
                player_cards[i].pos_y = 2 * (this.client_card_height() - this.selected_card_height()); 
            } else if (player_cards[i].useable && player.player_number === this.current_turn) { 
                player_cards[i].pos_y = this.client_card_height() - this.selected_card_height(); 
            } else { player_cards[i].pos_y = 0; }
        }
    }
    set_timer(time) {
        clearInterval(this.current_turn_timer);
        this.current_turn_time = time;
        this.current_turn_timer = setInterval(() => {
            if (this.current_turn_time > 0) this.current_turn_time--;
        }, 1000);
    }
    get_this_player_card_size(card) {
        if (
            (card.selected) || 
            (card.useable && this.players[this.players.length - 1].player_number === this.current_turn)
        ) return [this.selected_card_width(), this.selected_card_height()];
        else return [this.client_card_width(), this.client_card_height()];
    }
    is_this_player(player) { return player.player_number === this.this_player_number }
    is_current_player(player) { return player.player_number === this.current_turn }

    async #preload_cards() {
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
        console.log('Все карты загружены');
    }
    async #preload_avatars() {
        const avatarsPromises = this.players.map((player, i) => {
            return new Promise((resolve, reject) => {
                const url = `../assets/${player.avatar}`
                const image = new Image();
                image.src = url;
    
                image.onload = () => {
                    this.players[i].avatar_cache = image;
                    resolve();
                };
    
                image.onerror = (error) => {
                    console.error(`Ошибка загрузки аватара для игрока ${i}:`, error);
                    this.players[i].avatar_cache = null;
                    resolve();
                };
            });
        });
    
        await Promise.all(avatarsPromises);
        console.log('Все аватары загружены');
    }
    async preload_images() {
        await Promise.all([this.#preload_cards(), this.#preload_avatars()]);
        console.log('Все ресурсы загружены');
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

    get_card(card) {
        return this.cards_cache[`${card.value}_${card.color}`] || this.cards_cache[`empty_all`];
    }

    // FOR DRAW
    draw_with_ang(x_center, y_center, angle, draw_element) {
        this.ctx.save();
        this.ctx.translate(x_center, y_center);
        this.ctx.rotate(angle);
        draw_element();
        this.ctx.restore();
    }

    draw_dropping() { // todo?
        for (let i = 0; i < this.dropping_cache.length; i++){
            this.ctx.drawImage(
                this.get_card(this.dropping_cache[i]), 
                (this.canvas_width - this.card_width) / 2, (this.canvas_height - this.card_height) / 2, 
                this.card_width, this.card_height
            );
        }
    }
    draw_desk() { // todo shadow?
        this.ctx.drawImage(
            this.get_card({ value: 'back', color: 'all' }), 
            (this.canvas_width - this.card_width) / 2 - this.card_width * 2, (this.canvas_height - this.card_height) / 2, 
            this.card_width, this.card_height
        );
    }
    draw_player_cards(player) {
        for (let i = 0; i < player.cards.length; i++) {
            if (this.is_this_player(player)) {
                this.ctx.drawImage(this.get_card(player.cards[i]), player.cards[i].pos_x, player.cards[i].pos_y, 
                    ...this.get_this_player_card_size(player.cards[i])
                );
            } else {
                const position = -this.card_width * 2;
                let step = (this.card_width * 3 - this.card_width) / (player.cards.length - 1);
                if (player.cards.length === 1) step = 0;
                this.ctx.drawImage(this.get_card({value: 'back', color: 'all'}), position + step * i, 0, this.card_width, this.card_height);
            }
        }
    }
    draw_timer(player, x, y) { // todo color?
        this.ctx.beginPath();
        const startAngle = -0.5 * Math.PI;
        const endAngle = startAngle - (this.current_turn_time * 2 * Math.PI / 120);
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, this.avatar_radius + 10, endAngle, startAngle, false);
        this.ctx.fillStyle = 'orange';
        this.ctx.fill();
        this.ctx.closePath();
    }
    draw_avatar(player, x, y) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.avatar_radius, 0, 2 * Math.PI, false);
        this.ctx.clip();
    
        if (player.avatar_cache) {
            const size = this.avatar_radius * 2;
            const xOffset = x - this.avatar_radius;
            const yOffset = y - this.avatar_radius;
            this.ctx.drawImage(player.avatar_cache, xOffset, yOffset, size, size);
        } else {
            this.ctx.fillStyle = 'black';
            this.ctx.fill();
        }
    
        this.ctx.restore();
    }
    draw_nickname(player, x, y) { // todo
        this.ctx.beginPath();
        this.ctx.fillStyle = 'red';     // !
        this.ctx.font = '20px Arial';   // !
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.nickname, x, y);
        this.ctx.closePath();
    }
    draw_uno(x, y) { // todo
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(x, y, this.avatar_radius * 2, 30);
        this.ctx.beginPath();
        this.ctx.fillStyle = 'red';
        this.ctx.font = '20px Arial';  
        this.ctx.textAlign = 'center';
        this.ctx.fillText("UNO", x + this.avatar_radius, y + 25);
        this.ctx.closePath();
    }
    draw_player_info(player, x, y) {
        if (this.is_current_player(player)) this.draw_timer(player, x, y);
        this.draw_avatar(player, x, y);
        this.draw_nickname(player, x, y + this.avatar_radius * 2);
        if (player.say_uno) this.draw_uno(x - this.avatar_radius, y + this.avatar_radius * 2 + 20);
    }
    draw_player(player) {
        this.draw_with_ang(player.block_x, player.block_y, player.angle, () => {
            if (this.is_this_player(player)){
                this.draw_with_ang(-this.canvas_width / 4 - this.avatar_radius * 2, this.avatar_radius, -player.angle, () => {
                    this.draw_player_info(player, 0, 0);
                });
            } else {
                this.draw_with_ang(-this.card_width * 3, this.card_height / 2, -player.angle, () => {
                    this.draw_player_info(player, 0, 0);
                });
            }
            this.draw_player_cards(player)
        });
    }
    draw_players() {
        for (let i = 0; i < this.players.length; i++) 
            this.draw_player(this.players[i]);
    }
    draw_color_selection_miniblock(pos_x, pos_y, size, color) { // todo?
        if (
            this.client_mouse_x >= pos_x &&
            this.client_mouse_x <= pos_x + size &&
            this.client_mouse_y >= pos_y && 
            this.client_mouse_y <= pos_y + size
        ) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(pos_x - 5, pos_y - 5, size + 10, size + 10);
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pos_x, pos_y, size, size);
    }
    draw_color_selection_block() { // todo?
        const x_center = this.canvas_width / 2;
        const y_center = this.canvas_height / 2;
        const size = this.card_width * 2 + 60;
        
        this.ctx.fillStyle = 'gray';
        this.ctx.fillRect(x_center - this.card_width - 30, y_center - this.card_width - 30, size, size);
        this.color_selection_position.forEach((color_prop) => {
            this.draw_color_selection_miniblock(color_prop.pos_x, color_prop.pos_y, this.card_width, color_prop.color);
        });
    }

    render() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
        
        if (this.players) this.draw_players();
        this.draw_dropping();
        this.draw_desk();

        if (this.draw_color_selection) 
            this.draw_color_selection_block();

        this.ctx.restore();
    }

    get_selected_card() {
        let selected_card = null;
        this.players[this.players.length - 1].cards.forEach((card) => {
            if (card.selected && this.players[this.players.length - 1].player_number === this.current_turn) 
                selected_card = card; 
        });
        return selected_card;
    }

    update_dropping(last_card) {
        if (this.dropping_cache.length == this.dropping_cache_max_length) 
            this.dropping_cache.shift();
        this.dropping_cache.push(last_card);
    }
    update_cards_selection() {
        let index = -1;
        const x = this.client_mouse_x - this.canvas_width / 2;
        const y = this.client_mouse_y - (this.canvas_height - this.client_card_height());
        const player_cards = this.players[this.players.length - 1].cards;
        for (let i = player_cards.length - 1; i >= 0; i--) {
            const sizes = this.get_this_player_card_size(player_cards[i]);
            if (
                player_cards[i].pos_x <= x &&
                player_cards[i].pos_x + sizes[0] >= x &&
                player_cards[i].pos_y <= y &&
                player_cards[i].pos_y + sizes[1] >= y
            ) { 
                index = i; 
                break;
            }
        }

        player_cards.forEach((card) => card.selected = false );
        if (index + 1 > 0) player_cards[index].selected = true;
        this.set_this_player_cards_position();
    }
    update_cards_useability(players) {
        const player_up = players.find((player) => player.player_number == this.this_player_number);
        this.players[this.players.length - 1].cards.forEach((card) => {
            card.useable = player_up.cards.find((card_up) => card.id === card_up.id).useable;
        });
    }
    update_current_turn(player_number) {
        this.current_turn = player_number;
        this.set_this_player_cards_position();
        this.set_timer(120);
    }
    update_selected_color(color) {
        this.draw_color_selection = false;
    }
    update_mouse_position(x, y) {
        this.client_mouse_x = x;
        this.client_mouse_y = y;
        this.update_cards_selection();
    }
    update_sizes() {
        // card_width, card_heigth
        this.set_players_block_angle();
        this.set_this_player_cards_position();
        this.set_color_selection_positions();
        this.avatar_radius = this.canvas_width * 0.03;
    }
    resize(width, height) {
        this.canvas_width = width;
        this.canvas_height = height;
        this.update_sizes();
    }

    // USER MOVES
    put_card(player_number, card_id) {
        const player = this.players[this.players.findIndex(player => player.player_number === player_number)];
        const card_i = player.cards.findIndex((card) => card.id === card_id);
        const card = player.cards.splice(card_i, 1)[0];
        this.update_dropping(card);
    }
    player_draw_cards(player_number, cards) {
        const player = this.players[this.players.findIndex(player => player.player_number === player_number)];
        cards.forEach((card) => {
            player.cards.push(card);
        });        
    }
    draw_cards(players) {
        players.forEach((player) => {
            this.player_draw_cards(player.player_number, player.cards);
            if (this.is_this_player(player)) this.set_this_player_cards_position();
        });
    }
    check_color_selection(player_number) {
        if (this.this_player_number === player_number) 
            this.draw_color_selection = true;
    }
    finish_game_for(player_numbers) {
        player_numbers.forEach((player_number) => {
            this.players.forEach((player) => {
                if (player.player_number === player_number) player.is_finished = true;
            });
        });
    }
    player_say_uno(player_number) {
        const player = this.players.find(player => player.player_number === player_number);
        player.say_uno = true;
        setTimeout(() => { player.say_uno = false; }, 5000);
    }

    // CLICKING CHECK
    checking_is_finished() {
        return !(this.players[this.players.length - 1].is_finished);
    }
    checking_is_current_turn() {
        if (!this.checking_is_finished()) return false;
        return !(this.players[this.players.length - 1].player_number !== this.current_turn);
    }

    clicking_on_card(func) { 
        if (!this.checking_is_current_turn()) return false;
        if (this.draw_color_selection) return false;
        const card = this.get_selected_card();
        if (card) {
            func(card);
            return true; 
        } else return false;
    }
    clicking_on_desk(func) {
        if (!this.checking_is_current_turn()) return false;
        const pos_x = (this.canvas_width - this.card_width) / 2 - this.card_width * 2;
        const pos_y = (this.canvas_height - this.card_height) / 2;
        if (this.client_mouse_x && this.client_mouse_y && 
            this.client_mouse_x >= pos_x && this.client_mouse_x <= pos_x + this.card_width && 
            this.client_mouse_y >= pos_y && this.client_mouse_y <= pos_y + this.card_height) func();
        else return false;
    }
    clicking_on_color(func) {
        if (!this.checking_is_current_turn()) return false;
        if (this.draw_color_selection) {
            let color; 
            this.color_selection_position.forEach((color_prop) => {
                if (
                    this.client_mouse_x >= color_prop.pos_x &&
                    this.client_mouse_x <= color_prop.pos_x + this.card_width &&
                    this.client_mouse_y >= color_prop.pos_y && 
                    this.client_mouse_y <= color_prop.pos_y + this.card_width
                ) { color = color_prop.color_name; }
            });
            func(color);
            return true;
        }
        else return false;
    }
}
