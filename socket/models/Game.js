const Player = require('./Player');
const Card = require('./Card');

class Game {
    static STATUS = {
        SUCCESS: 'success',
        GIVED_CARDS: 'gived cards',
        CHECK_ON_COLOR_SELECTION: 'check color selection',
        PLAYERS_FINISHED: 'players finished game',
        GAME_OVER: 'game over',

        FAILED: 'failed'
    } 
    
    #turn = 1;
    desk = [];
    dropping = [];
    rules = {};

    constructor(room, rules, players) {
        // Проверка что игроков не меньше 2х
        this.room_id = room;

        this.desk = Game.initialize_deck();
        this.dropping.push(this.desk.pop());
        
        this.players = [];
        for (let i = 0; i < players.length; i += 1) {
            if (players[i]) {
                this.set_player(players[i]);
            }
        }
        this.set_rules(rules);
        this.initialize_player_arm();
        this.set_useability();
        this.current_player = 0;

        this.cards_to_draw = 0;
        this.check_on_color_selection = false;
        this.hit_or_skip = false;
        this.color_selection_player = null;
    }

    static push_statuses(statuses, add_info) {
        let info_object = { ...statuses.pop(), ...add_info.pop() };
        statuses.push(...add_info);
        statuses.push(info_object);
        return statuses;
    }
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    static to_bool(string_num) { return (string_num === '1'); }
    static initialize_deck() {
        const desk = [];
        let index = 0;
        
        Card.COLORS.forEach(color => {
            Card.GROUP_NUMS.forEach(value => {
                for (let i = 0; i < 2; i++)
                    desk.push(new Card(index++, value, color));
            });
            Card.GROUP_RARE.forEach(value => {
                for (let i = 0; i < 4; i++)
                    desk.push(new Card(index++, value, color));
            });
        });
        Card.GROUP_NONCOLORED.forEach(value => {
            for (let i = 0; i < 4; i++)
                desk.push(new Card(index++, value, Card.NONCOLORED));
        });

        Game.shuffle(desk);
        return desk;
    }
    refresh_desk() {
        this.desk = this.dropping.splice(0, this.dropping.length - this.players.length);
        Game.shuffle(this.desk);
    }
    set_rules(data) {
        this.rules = {
            players_count: this.players.length,
            start_arm_lenth: 6,
        }
        this.rules.skip_after_draw_cards = Game.to_bool(data.skip_after_draw_cards);
        this.rules.skip_after_draw_card_from_dropping = Game.to_bool(data.skip_after_draw_card_from_dropping);
        this.rules.can_hit_skip_turn = Game.to_bool(data.can_hit_skip_turn);
    }
    initialize_player_arm(){
        // изменить на start_arm_length
        for (let i = 0; i < 6; i++){
            this.players.forEach((player) => {
                player.draw_card(this.desk.pop());
            });
        }
    }

    set_player(player) { this.players.push(new Player(player)); }
    set_useability() {
        this.players.forEach(player => {
            player.cards.forEach(card => this.is_card_useable(card));
        });
    }

    change_turn_direction() { this.#turn = -this.#turn; }
    get_next_player() {
        let next_player_i = this.current_player + this.#turn;
        if (next_player_i > this.players.length - 1) next_player_i = 0; 
        else if (next_player_i < 0) next_player_i = this.players.length - 1; 
        return next_player_i;
    }
    is_next_turn() {
        const card_on_drop = this.dropping[this.dropping.length - 1];
        if ((card_on_drop.value === Card.CARD_COLOR_CHANGE || card_on_drop.value === Card.CARD_PLUS4) && card_on_drop.selected_color) return false;
        // добавить логику, в зависимости от правил давать ли возможность выложить больше одной карты за ход
        return true;
    }
    next_turn() {
        let player_i = this.current_player; 
        const statuses = [ Game.STATUS.SUCCESS, {} ];
        if (this.check_on_color_selection) return statuses

        do {
            player_i = this.get_next_player();
            this.current_player = player_i;
        } while (this.players[player_i].is_finished);

        if (this.cards_to_draw !== 0) {
            if (this.is_player_can_hit_card(player_i)) {
                // ...
        // проверить дать ли карты
            } else {
                Game.push_statuses(statuses, [ 
                    Game.STATUS.GIVED_CARDS, 
                    { give_cards: [ this.give_cards_for(this.players[this.current_player], this.cards_to_draw) ] }
                ]);
                this.cards_to_draw = 0; 
                if (this.rules.skip_after_draw_cards) { Game.push_statuses(statuses, this.next_turn()); }
            }
        }
        return statuses;
    }
    current_player_number() { return this.players[this.current_player].player_number; }

    is_player_can_hit_card_with(card) { // todo
        const card_on_drop = this.dropping[this.dropping.length - 1];
        if (this.rules.can_hit_skip_turn && card_on_drop.value === Card.CARD_SKIP && card.value === Card.CARD_SKIP) 
            card.set_useability(true);
        else 
            card.set_useability(false);
        // проверять может ли игрок отбить карту
        // false если отключено в правилах
    }
    is_player_can_hit_card(player_index) {
        this.set_useability()
        let can = false;
        this.players[player_index].cards.forEach((card) => {
            this.is_player_can_hit_card_with(card)
            if (card.useable) can = true;
        });
        return can;
    }
    is_card_useable(card) { //todo
        const card_on_drop = this.dropping[this.dropping.length - 1];
        if (card_on_drop.color === Card.NONCOLORED) {
            // можно ли класть черные карты поверх черных
            if (card_on_drop.selected_color === card.color) {
                card.set_useability(true);
                return true;
            }
            card.set_useability(false);
            return false;
        } else if (card.color === Card.NONCOLORED) {
            card.set_useability(true);
            return true;
        } else if (card.value === card_on_drop.value || card.color === card_on_drop.color) { 
            card.set_useability(true);
            return true;
        } else { 
            card.set_useability(false);
            return false;
        }
    }
    check_game_finishing() {
        const statuses = [];
        const info = { players_finished: [] };
        let counter = 0;
        this.players.forEach((player) => {
            if (player.is_finished) counter += 1;
            else if (player.cards.length === 0) {
                counter += 1;
                player.finish();
                statuses.push(Game.STATUS.PLAYERS_FINISHED);
                info.players_finished.push(player.player_number);
            }
        });

        if (this.players.length === counter + 1) statuses.push(Game.STATUS.GAME_OVER);
        statuses.push(info);
        return statuses;
    }
    put_card(player_number, card_id) {
        const player = this.players.find(player => player.player_number === player_number);
        let card = player.cards.find(card => card.id === card_id);
        if (!card || !this.is_card_useable(card)) return [ Game.STATUS.FAILED ];
        card = player.put_card(card_id);
        
        const statuses = [Game.STATUS.SUCCESS, {}];
        this.dropping.push(card);
        switch (card.value) {
            case Card.CARD_DIRECTION: 
                this.change_turn_direction(); break;
            case Card.CARD_SKIP: 
                this.next_turn(); break;
            case Card.CARD_PLUS2:
                this.cards_to_draw += 2;
                break;
            case Card.CARD_PLUS4:
                Game.push_statuses(statuses, [
                    Game.STATUS.CHECK_ON_COLOR_SELECTION,
                    { player_select: player_number }
                ])
                this.check_on_color_selection = true;
                this.color_selection_player = player_number;
                this.cards_to_draw += 4;
                break;
            case Card.CARD_COLOR_CHANGE:
                Game.push_statuses(statuses, [
                    Game.STATUS.CHECK_ON_COLOR_SELECTION,
                    { player_select: player_number }
                ])
                this.check_on_color_selection = true;
                this.color_selection_player = player_number;
                break;
        }
        Game.push_statuses(statuses, this.check_game_finishing());
        // this.set_useability();
        if (this.is_next_turn()) { Game.push_statuses(statuses, this.next_turn()); }
        return statuses;
    }
    give_cards_for(player, count) { //todo
        const given_cards = [];
        for (let i = 0; i < count; i++) {
            if (this.desk.length < 1) this.refresh_desk();
            if (this.desk.length < 1) return {};
            // добавить условие, если все карты среди игроков
            const card = this.desk.pop();
            this.is_card_useable(card);
            player.draw_card(card);
            given_cards.push(card.get_data());
        }

        return {
            player_number: player.player_number,
            cards: given_cards
        }
    }
    draw_card(player_number) {
        const player_i = this.players.findIndex((player) => player.player_number === player_number);
        if (this.current_player !== player_i) return null;
        const player = this.players[player_i];
        return this.give_cards_for(player, 1).cards[0];
    }
    select_color(player_number, color) {
        if (
            !(player_number == this.current_player_number()) || 
            !this.dropping[this.dropping.length - 1].set_selected_color(color)
        ) 
            return [ Game.STATUS.FAILED, {} ];
        this.check_on_color_selection = false;
        this.color_selection_player = null;
        // this.set_useability();
        return this.next_turn();
    }
    say_uno(player_number) { // todo
        return [ Game.STATUS.SUCCESS, {} ];
        // Если не его ход, проверить, кому дать карты
        //      Если нет игроков с 1 картой (т.е. текущий еще не положил в том числе), штраф тому, кто нажал
        //      Если у другого игрока уже 1 карта, датть ему штраф
        // Если его ход, сохранить статус и дождаться окончания хода 
        //      Если карт 0-1, споко, сохраняем пока не станет больше 1 карты
        // Надо сохранять статус, пока у игрока 1 карта и при этом он говорил уно...
    }
    // can put card?
    // can draw card?

    get_score() { // todo
        const scores = [];
        this.players.forEach((player) => { scores.push({ player_number: player.player_number, score: 0 }) });
        return scores;
    }
    get_cards_info() {
        this.set_useability();
        const players = [];
        this.players.forEach((player) => { players.push(player.get_data()); });
        return players;
    }
    get_data() {
        return {
            room_id: this.room_id,
            players: this.get_cards_info(),
            current_player: this.current_player_number(),
            rules: this.rules,
            last_card: this.dropping[this.dropping.length - 1].get_data(),
            check_on_color_selection: this.check_on_color_selection,
            color_selection_player: this.color_selection_player
        };
    }
}
  
module.exports = Game;
