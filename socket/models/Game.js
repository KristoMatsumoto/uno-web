class Game {
    constructor(rules, players) {
        this.rules = rules;
        this.desk = this.initialize_deck();
        this.players = [];
        for (let i = 0; i < players.length; i += 1){
            if (players[i]){
                this.set_player(players[i]);
            }
        }
        this.current_player = 0;
    }

    initialize_deck(){
        // Создание колоды
        // Перемешивание колоды
        // Возвращает колоду
    }


    set_player(player){
        this.players.push(player);
    }

    next_turn(){
        this.current_player += 1;
        if (this.current_player == this.rules.players_count){
            this.current_player = 0;
        }
    }

    // update() {

    // }

    // draw() {
        
    // }
}

module.exports = Game;
