const Player = require('./Player');
const Card = require('./Card');

class Game {
    #turn = 1;
    desk = [];
    dropping = [];

    constructor(room, rules, players) {
        // this.ready = false;
        rules = {
            players_count: players.length,
            start_arm_lenth: 6,
        }
        // Проверка что игроков не меньше 2х
        this.room_id = room;
        this.rules = rules;

        this.desk = this.initialize_deck();
        this.dropping.push(this.desk.pop());

        this.players = [];
        for (let i = 0; i < players.length; i += 1){
            if (players[i]){
                this.set_player(players[i]);
            }
        }
        this.initialize_player_arm();
        this.set_useability();
        this.current_player = 0;

        // Раздать карты игрокам
        // при этом slice? (добавить проверку, хватит ли карт)
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    initialize_deck() {
        const desk = [];
        let index = 0;
        
        Card.COLORS.forEach(color => {
            Card.GROUP_NUMS.forEach(value => {
                for (let i = 0; i < 4; i++)
                    desk.push(new Card(index++, value, color));
            });
            Card.GROUP_RARE.forEach(value => {
                for (let i = 0; i < 2; i++)
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

    initialize_player_arm(){
        // изменить на start_arm_length
        for (let i = 0; i < 6; i++){
            this.players.forEach((player) => {
                player.draw_card(this.desk.pop());
            });
        }
    }

    set_player(player){
        this.players.push(new Player(player));
    }
    set_useability() {
        this.players.forEach(player => {
            player.cards.forEach(card => this.is_card_useable(card));
        });
    }

    change_turn_direction() { this.#turn = -this.#turn; }
    next_turn() {
        this.current_player += this.#turn;
        if (this.current_player == this.rules.players_count) this.current_player = 0;
        else if (this.current_player < 0) this.current_player = this.rules.players_count - 1;
    }
    current_player_number() {
        return this.players[this.current_player].player_number;
    }

    is_next_turn() {
        // добавить логику, в зависимости от правил давать ли возможность выложить больше одной карты за ход
        return true;
    }
    is_card_useable(card) {
        const card_on_drop = this.dropping[this.dropping.length - 1];
        if (card_on_drop.get_color() === Card.NONCOLORED) {
            // ожидать выбор цвета и false или если цвет выбран проверять по нему
            card.set_useability(true);
            return true;
        } else if (card.get_color() === Card.NONCOLORED) {
            card.set_useability(true);
            return true;
        } else if (card.get_value() === card_on_drop.get_value() || card.get_color() === card_on_drop.get_color()) { 
            card.set_useability(true);
            return true;
        } else { 
            card.set_useability(false); 
            return false;
        }
    }
    
    put_card(player_number, card_id) {
        const player = this.players.find(player => player.player_number === player_number);
        const card = player.put_card(card_id);
        this.dropping.push(card);
        switch (card.get_value()) {
            case Card.CARD_DIRECTION: 
                this.change_turn_direction(); break;
            case Card.CARD_SKIP: 
                this.next_turn(); break;
        }
        this.set_useability();
        if (this.is_next_turn()) this.next_turn();
    }
    draw_card(player_number) {
        if (this.desk.length < 1) this.refresh_desk();
        const player = this.players.find((player) => player.player_number === player_number);
        const card = this.desk.pop();
        this.is_card_useable(card);
        player.draw_card(card);
        return card;
    }
    // can put card?
    // can draw card?

    get_cards_info() {
        const players = [];
        this.players.forEach((player) => {
            players.push(player.get_data());
        })
        return players;
    }
    get_data() {
        return {
            room_id: this.room_id,
            players: this.get_cards_info(),
            current_player: this.current_player_number(),
            rules: this.rules,
            last_card: this.dropping[this.dropping.length - 1].get_data()
        };
    }
}
  
module.exports = Game;
