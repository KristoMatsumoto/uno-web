const Player = require('./Player');
const Card = require('./Card');

class Game {
    constructor(room, rules, players) {
        // this.ready = false;
        rules = {
            start_arm_lenth: 6
        }
        // Проверка что игроков не меньше 2х
        this.room_id = room;
        this.rules = rules;

        this.desk = this.initialize_deck();
        this.dropping = [];
        this.dropping.push(this.desk.pop());
        this.dropping_length = 1;

        this.players = [];
        for (let i = 0; i < players.length; i += 1){
            if (players[i]){
                this.set_player(players[i]);
            }
        }
        this.initialize_player_arm();
        this.turn = 1;
        this.current_player = 0;
        this.ready = true;

        // Раздать карты игрокам
        // при этом slice? (добавить проверку, хватит ли карт)
    }

    initialize_deck() {
        const desk = [];
        
        for (let color = 0; color < 4; color++){
            for (let value = 1; value < 10; value++){
                for (let i = 0; i < 4; i++){
                    desk.push(new Card(`${value}`, color));
                }
            }
            for (let i = 0; i < 2; i++){
                desk.push(new Card('0', color));
                desk.push(new Card('+2', color));
                desk.push(new Card('direction', color));
                desk.push(new Card('skip', color));
            }
        }
        for (let i = 0; i < 4; i++){
            desk.push(new Card('+4'));
            desk.push(new Card('color_change'));
        }

        shuffle(desk);
        return desk;
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

    change_turn_direction(){
        this.turn = -this.turn;
    }
    next_turn(){
        this.current_player += this.turn;
        if (this.current_player == this.rules.players_count){
            this.current_player = 0;
        }
    }
    current_player_number() {
        return this.players[this.current_player].player_number;
    }

    get_data(){
        const players = [];
        this.players.forEach((player) => {
            players.push(player.get_data());
        })
        return {
            // room_id: this.room_id,
            players: players,
            current_player: this.current_player_number(),
            rules: this.rules,
            last_card: this.dropping[this.dropping_length - 1]
        };
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
  
module.exports = Game;
